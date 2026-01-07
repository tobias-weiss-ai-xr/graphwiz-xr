use actix_web::{
    test,
    web::{self, Bytes},
    App,
};
use actix_multipart::Multipart;
use reticulum_storage::{configure_routes, StorageService};
use reticulum_core::Config;
use std::sync::Arc;

#[actix_web::test]
async fn test_initiate_chunked_upload() {
    let config = Config::load_or_default().expect("Failed to load config");
    let storage_path = std::env::temp_dir().join("test_storage");
    std::fs::create_dir_all(&storage_path).ok();

    let storage_service = StorageService::new(config.clone(), storage_path.to_string_lossy().to_string());

    let app = test::init_service(
        App::new()
            .configure(configure_routes)
            .app_data(web::Data::new(config.clone()))
    )
    .await;

    let request = test::TestRequest::post()
        .uri("/storage/chunked-upload")
        .set_json(&serde_json::json!({
            "file_name": "test.glb",
            "file_size": 20 * 1024 * 1024,
            "asset_type": "model",
            "mime_type": "model/gltf-binary",
            "chunk_size": 10 * 1024 * 1024,
            "is_public": false
        }))
        .to_request();

    let resp = test::call_service(&app, request).await;
    assert!(resp.status().is_success());

    let body: serde_json::Value = test::read_body_json(resp).await;
    assert!(body.get("session_id").is_some());
    assert_eq!(body["file_name"], "test.glb");
    assert_eq!(body["file_size"], 20 * 1024 * 1024);
    assert_eq!(body["chunk_size"], 10 * 1024 * 1024);
    assert_eq!(body["total_chunks"], 2);

    std::fs::remove_dir_all(&storage_path).ok();
}

#[actix_web::test]
async fn test_upload_chunk() {
    let config = Config::load_or_default().expect("Failed to load config");
    let storage_path = std::env::temp_dir().join("test_storage_chunks");
    std::fs::create_dir_all(&storage_path).ok();

    let app = test::init_service(
        App::new()
            .configure(configure_routes)
            .app_data(web::Data::new(config.clone()))
    )
    .await;

    let request = test::TestRequest::post()
        .uri("/storage/chunked-upload")
        .set_json(&serde_json::json!({
            "file_name": "test.glb",
            "file_size": 20 * 1024 * 1024,
            "asset_type": "model",
            "mime_type": "model/gltf-binary",
            "chunk_size": 10 * 1024 * 1024,
            "is_public": false
        }))
        .to_request();

    let init_resp = test::call_service(&app, request).await;
    let init_body: serde_json::Value = test::read_body_json(init_resp).await;
    let session_id = init_body["session_id"].as_str().unwrap();

    let chunk_data = vec![0u8; 10 * 1024 * 1024];

    let mut form = multipart::Form::new();
    form.add_reader_file("chunk", "chunk1.bin", chunk_data.as_slice(), "application/octet-stream");

    let chunk_request = test::TestRequest::post()
        .uri(&format!("/storage/chunked-upload/{}/chunk?chunk_number=1", session_id))
        .set_payload(form.to_body())
        .content_type(form.content_type())
        .to_request();

    let chunk_resp = test::call_service(&app, chunk_request).await;
    assert!(chunk_resp.status().is_success());

    let chunk_body: serde_json::Value = test::read_body_json(chunk_resp).await;
    assert_eq!(chunk_body["session_id"], session_id);
    assert_eq!(chunk_body["chunk_number"], 1);
    assert_eq!(chunk_body["uploaded_chunks"].as_array().unwrap().len(), 1);
    assert_eq!(chunk_body["progress"], 50.0);

    std::fs::remove_dir_all(&storage_path).ok();
}

#[actix_web::test]
async fn test_get_upload_session() {
    let config = Config::load_or_default().expect("Failed to load config");
    let storage_path = std::env::temp_dir().join("test_storage_session");
    std::fs::create_dir_all(&storage_path).ok();

    let app = test::init_service(
        App::new()
            .configure(configure_routes)
            .app_data(web::Data::new(config.clone()))
    )
    .await;

    let request = test::TestRequest::post()
        .uri("/storage/chunked-upload")
        .set_json(&serde_json::json!({
            "file_name": "test.glb",
            "file_size": 20 * 1024 * 1024,
            "asset_type": "model",
            "mime_type": "model/gltf-binary",
            "chunk_size": 10 * 1024 * 1024,
            "is_public": false
        }))
        .to_request();

    let init_resp = test::call_service(&app, request).await;
    let init_body: serde_json::Value = test::read_body_json(init_resp).await;
    let session_id = init_body["session_id"].as_str().unwrap();

    let get_request = test::TestRequest::get()
        .uri(&format!("/storage/chunked-upload/{}", session_id))
        .to_request();

    let get_resp = test::call_service(&app, get_request).await;
    assert!(get_resp.status().is_success());

    let get_body: serde_json::Value = test::read_body_json(get_resp).await;
    assert_eq!(get_body["session_id"], session_id);
    assert_eq!(get_body["uploaded_chunks"].as_array().unwrap().len(), 0);
    assert_eq!(get_body["progress"], 0.0);
    assert_eq!(get_body["status"], "initiated");

    std::fs::remove_dir_all(&storage_path).ok();
}

#[actix_web::test]
async fn test_cancel_upload() {
    let config = Config::load_or_default().expect("Failed to load config");
    let storage_path = std::env::temp_dir().join("test_storage_cancel");
    std::fs::create_dir_all(&storage_path).ok();

    let app = test::init_service(
        App::new()
            .configure(configure_routes)
            .app_data(web::Data::new(config.clone()))
    )
    .await;

    let request = test::TestRequest::post()
        .uri("/storage/chunked-upload")
        .set_json(&serde_json::json!({
            "file_name": "test.glb",
            "file_size": 20 * 1024 * 1024,
            "asset_type": "model",
            "mime_type": "model/gltf-binary",
            "chunk_size": 10 * 1024 * 1024,
            "is_public": false
        }))
        .to_request();

    let init_resp = test::call_service(&app, request).await;
    let init_body: serde_json::Value = test::read_body_json(init_resp).await;
    let session_id = init_body["session_id"].as_str().unwrap();

    let cancel_request = test::TestRequest::post()
        .uri(&format!("/storage/chunked-upload/{}/cancel", session_id))
        .to_request();

    let cancel_resp = test::call_service(&app, cancel_request).await;
    assert!(cancel_resp.status().is_success());

    let cancel_body: serde_json::Value = test::read_body_json(cancel_resp).await;
    assert_eq!(cancel_body["message"], "Upload cancelled successfully");

    std::fs::remove_dir_all(&storage_path).ok();
}
