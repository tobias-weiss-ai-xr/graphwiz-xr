//! Rate limiting middleware for storage service
//!
//! Enforces upload limits per user to prevent abuse

use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures_util::future::{ok, Ready};
use std::collections::HashMap;
use std::future::ready;
use std::sync::Arc;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

/// Rate limiting state
#[derive(Clone)]
pub struct RateLimitState {
    user_requests: HashMap<String, Vec<Instant>>,
}

impl RateLimitState {
    pub fn new() -> Self {
        Self {
            user_requests: HashMap::new(),
        }
    }

    /// Check if user has exceeded rate limit
    pub fn check_rate_limit(&mut self, user_id: &str, max_requests: usize, window: Duration) -> Result<(), String> {
        let now = Instant::now();
        let user_id_str = user_id.to_string();

        // Get or create request timestamps for this user
        let timestamps = self.user_requests.entry(user_id_str).or_insert_with(Vec::new);

        // Remove timestamps older than window
        timestamps.retain(|&ts| now.duration_since(ts) < window);

        // Check if user has exceeded limit
        if timestamps.len() >= max_requests {
            return Err(format!(
                "Rate limit exceeded. Maximum {} uploads per {:?}",
                max_requests,
                window
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
pub struct RateLimiter {
    max_requests: usize,
    window: Duration,
    state: Arc<tokio::sync::Mutex<RateLimitState>>,
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
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
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
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = std::pin::Pin<
        Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>> + 'static>,
    >;

    fn poll_ready(
        &self,
        cx: &mut Context<'_>,
    ) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Extract user_id from request extensions (set by JWT auth middleware)
        let user_id = match req.extensions().get::<uuid::Uuid>() {
            Some(uuid) => uuid.to_string(),
            None => {
                log::warn!("RateLimiter: No user_id in request, skipping rate limit check");
                // No user_id means no JWT auth, let request through
                // In production, this should be caught by JWT middleware first
                let fut = self.service.call(req);
                return Box::pin(async move {
                    let res = fut.await?;
                    Ok(res)
                });
            }
        };

        // Clone for async move
        let rate_limiter = RateLimiter {
            max_requests: self.max_requests,
            window: self.window,
            state: self.state.clone(),
        };

        Box::pin(async move {
            // Check rate limit
            let mut state: tokio::sync::MutexGuard<RateLimitState> = rate_limiter.state.lock().await;

            match state.check_rate_limit(&user_id, rate_limiter.max_requests, rate_limiter.window) {
                Ok(()) => {
                    // Within rate limit, proceed with request
                    drop(state); // Release lock before calling service

                    // Periodically cleanup old timestamps (every 100 requests)
                    if state.user_requests.len() > rate_limiter.max_requests * 2 {
                        state.cleanup_old_timestamps(rate_limiter.window);
                    }

                    let fut = self.service.call(req);
                    let res = fut.await?;
                    Ok(res)
                }
                Err(msg) => {
                    // Rate limit exceeded, return 429 Too Many Requests
                    log::warn!("Rate limit exceeded for user {}: {}", user_id, msg);

                    let rate_limited_response = actix_web::HttpResponse::TooManyRequests().json(serde_json::json!({
                        "error": "rate_limit_exceeded",
                        "message": msg,
                        "retry_after": rate_limiter.window.as_secs(),
                    }));
                    Ok(rate_limited_response)
                }
            }
        })
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
        for i in 0..5 {
            assert!(state.check_rate_limit(user_id, 5, window).is_ok());
        }

        // 6th request should fail
        assert!(state.check_rate_limit(user_id, 5, window).is_err());

        // Old requests should be removed
        std::thread::sleep(window);
        assert!(state.check_rate_limit(user_id, 5, window).is_ok());
    }

    #[test]
    fn test_default_rate_limiter() {
        let limiter = RateLimiter::default();
        assert_eq!(limiter.max_requests, 100);
        assert_eq!(limiter.window, Duration::from_secs(3600));
    }
}
