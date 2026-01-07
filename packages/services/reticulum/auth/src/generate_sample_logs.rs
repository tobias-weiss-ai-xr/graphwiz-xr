//! Utility to generate sample logs for testing

use reticulum_core::{add_log, LogLevel};

#[tokio::main]
async fn main() {
    println!("Generating sample logs...");

    let services = ["auth", "hub", "presence", "sfu", "storage"];
    let levels = [LogLevel::Debug, LogLevel::Info, LogLevel::Warn, LogLevel::Error];

    for service in services {
        for _ in 0..20 {
            let level = levels[rand::random::<usize>() % 4];
            let message = match level {
                LogLevel::Debug => format!("Debug message from {} - processing request", service),
                LogLevel::Info => format!("Info message from {} - operation completed successfully", service),
                LogLevel::Warn => format!("Warning message from {} - high latency detected", service),
                LogLevel::Error => format!("Error message from {} - connection failed", service),
            };

            add_log(service, level, &message, None).await;
            tokio::time::sleep(tokio::time::Duration::from_millis(10)).await;
        }
    }

    println!("Sample logs generated!");
}