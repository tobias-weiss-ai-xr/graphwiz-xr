//! Reticulum Presence Service
//!
//! Handles WebTransport/WebRTC signaling, presence tracking, and real-time messaging

pub mod session;
pub mod signaling;
pub mod websocket;
pub mod handlers;
pub mod moderation_handlers;
pub mod routes;
pub mod redis;
pub mod webtransport;

use actix_web::{web, App, HttpServer};
use reticulum_core::Config;

use routes::configure_routes;
use session::SessionManager;

pub struct PresenceService {
    config: Config,
    ws_manager: WebSocketManager,
    pubsub: redis::RedisPubSub,
    webtransport_manager: webtransport::WebTransportManager,
}

impl PresenceService {
    pub fn new(config: Config) -> Self {
        let ws_manager = WebSocketManager::new();

        let redis_config = redis::RedisConfig {
            url: std::env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string()),
            channel_prefix: "graphwiz".to_string(),
        };

        let (message_tx, _) = tokio::sync::mpsc::channel::<redis::PubSubMessage>(1000);

        let pubsub = match redis::RedisPubSub::new(redis_config, message_tx).await {
            Ok(pubsub) => pubsub,
            Err(e) => {
                log::warn!("Failed to initialize Redis pub/sub: {}. Using fallback mode.", e);
                // Create a disabled pub/sub instance
                redis::RedisPubSub {
                    config: redis_config,
                    client: Arc::new(redis::Client::open(&redis_config.url).unwrap_or_else(|_| {
                        redis::Client::open("redis://127.0.0.1:6379").unwrap()
                    })),
                    _subscriber_task: None,
                }
            }
        };

        // Create WebTransport manager
        let webtransport_config = webtransport::ServerConfig::default();
        let webtransport_manager = webtransport::WebTransportManager::new(webtransport_config);

        Self {
            config,
            ws_manager,
            pubsub,
            webtransport_manager,
        }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);

        log::info!("Starting presence service on {}:{}", host, port);

        // Create and start session manager
        let session_manager = SessionManager::new();
        tokio::spawn(async move {
            session_manager.start_background_flush_task().await;
        });

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
                .app_data(web::Data::new(session_manager.clone()))
                .app_data(web::Data::new(self.pubsub.clone()))
                .app_data(web::Data::new(self.webtransport_manager.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }
}

impl PresenceService {
    pub fn new(config: Config) -> Self {
        let ws_manager = WebSocketManager::new();

        let redis_config = redis::RedisConfig {
            url: std::env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string()),
            channel_prefix: "graphwiz".to_string(),
        };

        let (message_tx, _) = tokio::sync::mpsc::channel::<redis::PubSubMessage>(1000);

        let pubsub = match redis::RedisPubSub::new(redis_config, message_tx).await {
            Ok(pubsub) => pubsub,
            Err(e) => {
                log::warn!("Failed to initialize Redis pub/sub: {}. Using fallback mode.", e);
                // Create a disabled pub/sub instance
                redis::RedisPubSub {
                    config: redis_config,
                    client: Arc::new(redis::Client::open(&redis_config.url).unwrap_or_else(|_| {
                        redis::Client::open("redis://127.0.0.1:6379").unwrap()
                    })),
                    _subscriber_task: None,
                }
            }
        };

        // Create WebTransport manager
        let webtransport_config = webtransport::ServerConfig::default();
        let webtransport_manager = webtransport::WebTransportManager::new(webtransport_config);

        Self {
            config,
            ws_manager,
            pubsub,
            webtransport_manager,
        }
    }

    pub async fn run(self) -> std::io::Result<()> {
        let host = self.config.server.host.clone();
        let port = self.config.server.port;
        let workers = self.config.server.workers.unwrap_or(1);

        log::info!("Starting presence service on {}:{}", host, port);

        // Create and start session manager
        let session_manager = SessionManager::new();
        tokio::spawn(async move {
            session_manager.start_background_flush_task().await;
        });

        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.config.clone()))
                .app_data(web::Data::new(session_manager.clone()))
                .app_data(web::Data::new(self.pubsub.clone()))
                .app_data(web::Data::new(self.webtransport_manager.clone()))
                .wrap(actix_cors::Cors::permissive())
                .wrap(reticulum_core::middleware::LoggingMiddleware)
                .configure(configure_routes)
        })
        .bind((host.as_str(), port))?
        .workers(workers)
        .run()
        .await
    }
}
