//! Test authentication middleware for development
//!
//! This middleware injects a test user ID for development/testing purposes.
//! In production, this should be replaced with proper JWT authentication middleware.

use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures_util::future::{ok, Ready};
use std::future::ready;
use std::task::{Context, Poll};

/// Test authentication middleware
///
/// WARNING: This is for development only! It injects a fake user ID.
/// In production, replace this with proper JWT authentication.
pub struct TestAuth;

impl<S, B> Transform<S, ServiceRequest> for TestAuth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = TestAuthMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(TestAuthMiddleware { service })
    }
}

pub struct TestAuthMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for TestAuthMiddleware<S>
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

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Inject a test user ID for development
        // In production, this should come from a validated JWT token
        let test_user_id = "test_user_123".to_string();

        log::debug!(
            "TestAuth: Injecting user_id = {:?} for {}",
            test_user_id,
            req.path()
        );

        req.extensions_mut().insert(test_user_id);

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res)
        })
    }
}
