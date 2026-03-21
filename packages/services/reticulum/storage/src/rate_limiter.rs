//! Rate limiting middleware for storage service
//!
//! Enforces upload limits per user to prevent abuse

use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures_util::future::{ok, Ready};
use std::collections::HashMap;
use std::sync::Arc;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

/// Rate limiting state
#[derive(Clone, Default)]
pub struct RateLimitState {
    user_requests: HashMap<String, Vec<Instant>>,
}

impl RateLimitState {
    pub fn new() -> Self {
        Self::default()
    }

    /// Check if user has exceeded rate limit
    pub fn check_rate_limit(
        &mut self,
        user_id: &str,
        max_requests: usize,
        window: Duration,
    ) -> Result<(), String> {
        let now = Instant::now();
        let user_id_str = user_id.to_string();

        // Get or create request timestamps for this user
        let timestamps = self
            .user_requests
            .entry(user_id_str)
            .or_insert_with(Vec::new);

        // Remove timestamps older than window
        timestamps.retain(|&ts| now.duration_since(ts) < window);

        // Check if user has exceeded limit
        if timestamps.len() >= max_requests {
            return Err(format!(
                "Rate limit exceeded. Maximum {} uploads per {:?}",
                max_requests, window
            ));
        }

        // Add current request timestamp
        timestamps.push(now);

        Ok(())
    }

    /// Cleanup old timestamps periodically (to prevent memory leaks)
    pub fn cleanup_old_timestamps(&mut self, window: Duration) {
        let now = Instant::now();
        for timestamps in self.user_requests.values_mut() {
            timestamps.retain(|&ts| now.duration_since(ts) < window);
        }
    }
}

/// Rate limiting middleware
///
/// Enforces a maximum number of uploads per user per time window.
#[derive(Clone)]
pub struct RateLimiter {
    pub max_requests: usize,
    pub window: Duration,
    pub state: Arc<tokio::sync::Mutex<RateLimitState>>,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window_seconds: u64) -> Self {
        Self {
            max_requests,
            window: Duration::from_secs(window_seconds),
            state: Arc::new(tokio::sync::Mutex::new(RateLimitState::new())),
        }
    }

    /// Create rate limiter with default 100 uploads per hour
    pub fn default() -> Self {
        Self::new(100, 3600) // 100 uploads per hour
    }
}

impl<S, B> Transform<S, ServiceRequest> for RateLimiter
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = RateLimiterMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RateLimiterMiddleware {
            service,
            limiter: self.clone(),
        })
    }
}

pub struct RateLimiterMiddleware<S> {
    service: S,
    limiter: RateLimiter,
}

impl<S, B> Service<ServiceRequest> for RateLimiterMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>> + 'static>,
    >;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Extract user_id from request extensions (set by JWT auth middleware)
        let user_id_opt: Option<String> = req
            .extensions()
            .get::<uuid::Uuid>()
            .map(|uuid| uuid.to_string());

        match user_id_opt {
            Some(user_id) => {
                // Clone for async move
                let state = self.limiter.state.clone();
                let max_requests = self.limiter.max_requests;
                let window = self.limiter.window;
                let fut = self.service.call(req);

                Box::pin(async move {
                    // Check rate limit
                    let mut guard = state.lock().await;

                    match guard.check_rate_limit(&user_id, max_requests, window) {
                        Ok(()) => {
                            // Periodically cleanup old timestamps (every 100 requests)
                            if guard.user_requests.len() > max_requests * 2 {
                                guard.cleanup_old_timestamps(window);
                            }

                            // Release lock before calling service
                            drop(guard);

                            // Call the inner service
                            let res = fut.await?;
                            Ok(res)
                        }
                        Err(msg) => {
                            // Rate limit exceeded, return 429 Too Many Requests
                            log::warn!("Rate limit exceeded for user {}: {}", user_id, msg);

                            drop(guard);

                            Err(actix_web::error::ErrorTooManyRequests(msg))
                        }
                    }
                })
            }
            None => {
                log::warn!("RateLimiter: no user_id in request, skipping rate limit check");
                // No user_id means no JWT auth, let request through
                // In production, this should be caught by JWT middleware first
                let fut = self.service.call(req);
                Box::pin(async move {
                    let res = fut.await?;
                    Ok(res)
                })
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limit_state() {
        let mut state = RateLimitState::new();
        let window = Duration::from_secs(60);
        let user_id = "test_user";

        // First 5 requests should succeed
        for _ in 0..5 {
            assert!(state.check_rate_limit(user_id, 5, window).is_ok());
        }

        // 6th request should fail
        assert!(state.check_rate_limit(user_id, 5, window).is_err());
    }

    #[test]
    fn test_default_rate_limiter() {
        let limiter = RateLimiter::default();
        assert_eq!(limiter.max_requests, 100);
        assert_eq!(limiter.window, Duration::from_secs(3600));
    }
}
