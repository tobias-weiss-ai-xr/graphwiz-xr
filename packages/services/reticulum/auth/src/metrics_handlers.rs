//! Historical metrics API endpoints

use actix_web::{web, HttpResponse, HttpRequest};
use serde_json::json;

use reticulum_core::{Config, db, metrics::{get_metrics, add_metrics_point, MetricsSummary}};

/// Get historical metrics summary
pub async fn get_historical_metrics(
    config: web::Data<Config>,
    query: web::Query<MetricsQuery>,
) -> HttpResponse {
    let summary = get_metrics();

    // Handle time range query
    let response = if let (Some(hours)) = query.hours {
        let now = chrono::Utc::now();
        let start_time = now - chrono::Duration::hours(hours);

        json!({
            "summary": summary,
            "time_range": {
                "start": start_time.to_rfc3339(),
                "end": now.to_rfc3339(),
                "hours": hours
            }
        })
    } else {
        json!({
            "summary": summary
        })
    };

    HttpResponse::Ok().json(response)
}

/// Add a metrics data point (internal use)
pub async fn add_metrics(
    config: web::Data<Config>,
    body: web::Json<MetricDataPoint>,
) -> HttpResponse {
    // Add to global metrics storage
    add_metrics_point(body.into_inner());

    HttpResponse::Ok().json(json!({
        "message": "Metrics data point added"
    }))
}

/// Clear all historical metrics
pub async fn clear_metrics() -> HttpResponse {
    reticulum_core::clear_metrics();

    HttpResponse::Ok().json(json!({
        "message": "Metrics cleared"
    }))
}

// Query parameters
#[derive(Debug, Deserialize)]
pub struct MetricsQuery {
    pub hours: Option<i64>,
}

// Re-export MetricDataPoint for API
pub use reticulum_core::metrics::MetricDataPoint;
