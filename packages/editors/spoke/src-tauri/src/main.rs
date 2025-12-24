// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
struct Entity {
    id: String,
    name: String,
    position: [f32; 3],
    rotation: [f32; 3],
    scale: [f32; 3],
}

#[derive(Debug, Serialize, Deserialize)]
struct SceneData {
    version: String,
    entities: Vec<Entity>,
}

#[tauri::command]
fn save_scene(scene_data: Vec<Entity>) -> Result<(), String> {
    let data = SceneData {
        version: "0.1.0".to_string(),
        entities: scene_data,
    };

    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;

    let mut path = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push(".graphwiz-spoke");
    path.push("scenes");
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;

    path.push("untitled.json");
    fs::write(&path, json).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn export_scene(scene_data: Vec<Entity>) -> Result<(), String> {
    let data = SceneData {
        version: "0.1.0".to_string(),
        entities: scene_data,
    };

    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;

    let mut path = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push(".graphwiz-spoke");
    path.push("exports");
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;

    path.push("scene.json");
    fs::write(&path, json).map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_scene, export_scene])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
