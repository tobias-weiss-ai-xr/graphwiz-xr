// Generated file from protocol buffer compiler. DO NOT EDIT!
// @generated
// https://github.com/rust-lang/rust-clippy

// Generated from agent.proto

#![allow(clippy::all)]
#![allow(unused)]
#![allow(missing_docs)]
#![allow(unknown_lints)]
#![allow(clippy::missing_docs_in_private_items)]

pub const FILE_DESCRIPTOR_SET: &[u8] = &[0x00];

/// Includes for generated files
pub mod agent {
    include!("agent.agent.rs");
}

// Re-export all types
pub use agent::*;

// Enum definitions
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
#[repr(i32)]
pub enum LogLevel {
    Debug = 0,
    Info = 1,
    Warning = 2,
    Error = 3,
    Critical = 4,
}

impl LogLevel {
    /// String value of the enum field names used in the ProtoBuf definition.
    pub const fn as_str_name(&self) -> &'static str {
        match self {
            LogLevel::Debug => "DEBUG",
            LogLevel::Info => "INFO",
            LogLevel::Warning => "WARNING",
            LogLevel::Error => "ERROR",
            LogLevel::Critical => "CRITICAL",
        }
    }

    /// Creates an enum from the `str` value of its `Protobuf` name.
    pub fn from_str_name(value: &str) -> ::core::option::Option<Self> {
        match value {
            "DEBUG" => Some(Self::Debug),
            "INFO" => Some(Self::Info),
            "WARNING" => Some(Self::Warning),
            "ERROR" => Some(Self::Error),
            "CRITICAL" => Some(Self::Critical),
            _ => None,
        }
    }
}

// Message definitions
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct StartRequest {
    #[prost(string, tag = "1")]
    pub project_path: String,
    #[prost(string, repeated, tag = "2")]
    pub goals: Vec<String>,
    #[prost(bool, tag = "3")]
    pub auto_apply: bool,
    #[prost(message, optional, tag = "4")]
    pub config: ::core::option::Option<LooperConfig>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct StopRequest {
    #[prost(string, tag = "1")]
    pub loop_id: String,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LoopResponse {
    #[prost(bool, tag = "1")]
    pub success: bool,
    #[prost(string, tag = "2")]
    pub loop_id: String,
    #[prost(string, tag = "3")]
    pub message: String,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct StatusRequest {
    #[prost(string, tag = "1")]
    pub loop_id: String,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct StatusResponse {
    #[prost(string, tag = "1")]
    pub loop_id: String,
    #[prost(bool, tag = "2")]
    pub running: bool,
    #[prost(int32, tag = "3")]
    pub iteration: i32,
    #[prost(string, tag = "4")]
    pub current_phase: String,
    #[prost(message, repeated, tag = "5")]
    pub goals: Vec<GoalStatus>,
    #[prost(int64, tag = "6")]
    pub started_at: i64,
    #[prost(int64, tag = "7")]
    pub last_activity: i64,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct GoalStatus {
    #[prost(string, tag = "1")]
    pub name: String,
    #[prost(double, tag = "2")]
    pub progress: f64,
    #[prost(bool, tag = "3")]
    pub completed: bool,
    #[prost(string, tag = "4")]
    pub category: String,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct GoalRequest {
    #[prost(string, tag = "1")]
    pub loop_id: String,
    #[prost(message, optional, tag = "2")]
    pub goal: ::core::option::Option<Goal>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Goal {
    #[prost(string, tag = "1")]
    pub name: String,
    #[prost(string, tag = "2")]
    pub description: String,
    #[prost(string, tag = "3")]
    pub category: String,
    #[prost(double, tag = "4")]
    pub target_value: f64,
    #[prost(double, tag = "5")]
    pub current_value: f64,
    #[prost(string, tag = "6")]
    pub unit: String,
    #[prost(map = "string, string", tag = "7")]
    pub metadata: ::std::collections::HashMap<String, String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct GoalResponse {
    #[prost(bool, tag = "1")]
    pub success: bool,
    #[prost(string, tag = "2")]
    pub message: String,
    #[prost(message, optional, tag = "3")]
    pub goal: ::core::option::Option<Goal>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct AnalyzeRequest {
    #[prost(string, tag = "1")]
    pub loop_id: String,
    #[prost(string, tag = "2")]
    pub focus_area: String,
    #[prost(map = "string, string", tag = "3")]
    pub context: ::std::collections::HashMap<String, String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Issue {
    #[prost(string, tag = "1")]
    pub title: String,
    #[prost(string, tag = "2")]
    pub description: String,
    #[prost(string, tag = "3")]
    pub severity: String,
    #[prost(string, tag = "4")]
    pub category: String,
    #[prost(map = "string, string", tag = "5")]
    pub metadata: ::std::collections::HashMap<String, String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct AnalyzeResponse {
    #[prost(bool, tag = "1")]
    pub success: bool,
    #[prost(string, tag = "2")]
    pub analysis: String,
    #[prost(string, repeated, tag = "3")]
    pub recommendations: Vec<String>,
    #[prost(message, repeated, tag = "4")]
    pub issues: Vec<Issue>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct ReviewRequest {
    #[prost(string, tag = "1")]
    pub loop_id: String,
    #[prost(string, tag = "2")]
    pub iteration_id: String,
    #[prost(string, tag = "3")]
    pub decision: String,
    #[prost(string, tag = "4")]
    pub feedback: String,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct ReviewResponse {
    #[prost(bool, tag = "1")]
    pub success: bool,
    #[prost(string, tag = "2")]
    pub message: String,
    #[prost(bool, tag = "3")]
    pub applied: bool,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct MetricsRequest {
    #[prost(string, tag = "1")]
    pub loop_id: String,
    #[prost(string, repeated, tag = "2")]
    pub metric_names: Vec<String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Metric {
    #[prost(string, tag = "1")]
    pub name: String,
    #[prost(double, tag = "2")]
    pub value: f64,
    #[prost(string, tag = "3")]
    pub unit: String,
    #[prost(int64, tag = "4")]
    pub timestamp: i64,
    #[prost(map = "string, string", tag = "5")]
    pub labels: ::std::collections::HashMap<String, String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct MetricsResponse {
    #[prost(message, repeated, tag = "1")]
    pub metrics: Vec<Metric>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LogRequest {
    #[prost(string, tag = "1")]
    pub loop_id: String,
    #[prost(int64, tag = "2")]
    pub since: i64,
    #[prost(enumeration = "LogLevel", tag = "3")]
    pub level: i32,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LogEvent {
    #[prost(int64, tag = "1")]
    pub timestamp: i64,
    #[prost(enumeration = "LogLevel", tag = "2")]
    pub level: i32,
    #[prost(string, tag = "3")]
    pub message: String,
    #[prost(map = "string, string", tag = "4")]
    pub metadata: ::std::collections::HashMap<String, String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LooperConfig {
    #[prost(int32, tag = "1")]
    pub max_iterations: i32,
    #[prost(int32, tag = "2")]
    pub iteration_interval: i32,
    #[prost(bool, tag = "3")]
    pub auto_apply: bool,
    #[prost(string, tag = "4")]
    pub model: String,
    #[prost(double, tag = "5")]
    pub temperature: f64,
    #[prost(int32, tag = "6")]
    pub max_tokens: i32,
}

/// Client stub (for calling the service)
#[derive(Clone, Debug)]
pub struct agent_looper_client<T>(T);

impl<T> agent_looper_client<T>
where
    T: tonic::client::GrpcService<tonic::body::BoxBody>,
    T::Error: Into<tonic::Status>,
    T::ResponseBody: tonic::codegen::Body<Data = bytes::Bytes>,
    <T::ResponseBody as tonic::codegen::Body>::Error: Into<tonic::Status> + Send,
{
    pub fn new(inner: T) -> Self {
        Self(inner)
    }

    pub fn with_interceptor<F>(inner: T, interceptor: F) -> agent_looper_client<tonic::interceptor::InterceptedService<T, F>>
    where
        F: tonic::service::Interceptor,
        T: tonic::codegen::Service<
            tonic::body::BoxBody,
            Response = tonic::interceptor::InterceptedResponse<
                tonic::codegen::Response<tonic::body::BoxBody>,
            >,
        >,
        T::Future: tonic::codegen::Future<
            Output = Result<
                tonic::interceptor::InterceptedResponse<
                    tonic::codegen::Response<tonic::body::BoxBody>,
                >,
                tonic::Status,
            >,
        >,
    {
        agent_looper_client::new(tonic::interceptor::InterceptedService::new(inner, interceptor))
    }

    /// Start optimization loop
    pub async fn start_loop(
        &mut self,
        request: impl tonic::IntoRequest<StartRequest>,
    ) -> Result<tonic::Response<LoopResponse>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/StartLoop");
        self.0.unary(request.into_request(), path, codec).await
    }

    /// Stop optimization loop
    pub async fn stop_loop(
        &mut self,
        request: impl tonic::IntoRequest<StopRequest>,
    ) -> Result<tonic::Response<LoopResponse>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/StopLoop");
        self.0.unary(request.into_request(), path, codec).await
    }

    /// Get current status
    pub async fn get_status(
        &mut self,
        request: impl tonic::IntoRequest<StatusRequest>,
    ) -> Result<tonic::Response<StatusResponse>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/GetStatus");
        self.0.unary(request.into_request(), path, codec).await
    }

    /// Submit optimization goal
    pub async fn submit_goal(
        &mut self,
        request: impl tonic::IntoRequest<GoalRequest>,
    ) -> Result<tonic::Response<GoalResponse>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/SubmitGoal");
        self.0.unary(request.into_request(), path, codec).await
    }

    /// Request immediate analysis
    pub async fn analyze(
        &mut self,
        request: impl tonic::IntoRequest<AnalyzeRequest>,
    ) -> Result<tonic::Response<AnalyzeResponse>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/Analyze");
        self.0.unary(request.into_request(), path, codec).await
    }

    /// Approve/reject changes
    pub async fn review_changes(
        &mut self,
        request: impl tonic::IntoRequest<ReviewRequest>,
    ) -> Result<tonic::Response<ReviewResponse>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/ReviewChanges");
        self.0.unary(request.into_request(), path, codec).await
    }

    /// Get metrics
    pub async fn get_metrics(
        &mut self,
        request: impl tonic::IntoRequest<MetricsRequest>,
    ) -> Result<tonic::Response<MetricsResponse>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/GetMetrics");
        self.0.unary(request.into_request(), path, codec).await
    }

    /// Stream log events
    pub async fn stream_logs(
        &mut self,
        request: impl tonic::IntoRequest<LogRequest>,
    ) -> Result<tonic::Response<tonic::codec::Streaming<LogEvent>>, tonic::Status> {
        self.0.ready().await.map_err(|e| {
            tonic::Status::new(
                tonic::Code::Unknown,
                format!("Service was not ready: {}", e.into()),
            )
        })?;
        let codec = tonic::codec::ProstCodec::default();
        let path = http::uri::PathAndQuery::from_static("/agent.AgentLooper/StreamLogs");
        self.0.server_streaming(request.into_request(), path, codec).await
    }
}

/// Server trait (for implementing the service)
#[async_trait::async_trait]
pub trait AgentLooper: Send + Sync + 'static {
    async fn start_loop(
        &self,
        request: tonic::Request<StartRequest>,
    ) -> Result<tonic::Response<LoopResponse>, tonic::Status>;

    async fn stop_loop(
        &self,
        request: tonic::Request<StopRequest>,
    ) -> Result<tonic::Response<LoopResponse>, tonic::Status>;

    async fn get_status(
        &self,
        request: tonic::Request<StatusRequest>,
    ) -> Result<tonic::Response<StatusResponse>, tonic::Status>;

    async fn submit_goal(
        &self,
        request: tonic::Request<GoalRequest>,
    ) -> Result<tonic::Response<GoalResponse>, tonic::Status>;

    async fn analyze(
        &self,
        request: tonic::Request<AnalyzeRequest>,
    ) -> Result<tonic::Response<AnalyzeResponse>, tonic::Status>;

    async fn review_changes(
        &self,
        request: tonic::Request<ReviewRequest>,
    ) -> Result<tonic::Response<ReviewResponse>, tonic::Status>;

    async fn get_metrics(
        &self,
        request: tonic::Request<MetricsRequest>,
    ) -> Result<tonic::Response<MetricsResponse>, tonic::Status>;

    /// Server streaming handler
    type StreamLogsStream: futures_core::Stream<Item = Result<LogEvent, tonic::Status>> + Send + 'static;

    async fn stream_logs(
        &self,
        request: tonic::Request<LogRequest>,
    ) -> Result<tonic::Response<Self::StreamLogsStream>, tonic::Status>;
}

/// Helper function to create a server
pub fn create_agent_looper<T>(service: T) -> tonic::transport::Server<T> {
    tonic::transport::Server::new().add_service(tonic::codegen::server::SomeServerService::new(service))
}

/// Create a client from channel
pub fn create_client<T>(channel: T) -> agent_looper_client<T> {
    agent_looper_client::new(channel)
}
