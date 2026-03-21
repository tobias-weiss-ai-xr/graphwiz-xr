use std::fs;
use std::path::PathBuf;

pub const APP_DIR: &str = ".graphwiz-spoke";
pub const SCENES_DIR: &str = "scenes";
pub const EXPORTS_DIR: str = "exports";

pub fn get_app_dir() -> Result<PathBuf, String> {
    let mut path = dirs::home_dir().ok_or_else(|_| PathBuf::from("."))?;

    path.push(APP_DIR);

    // Create if doesn't exist
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    Ok(path)
}

pub fn ensure_directory_exists(path: PathBuf) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn ensure_scenes_directory_exists() -> Result<PathBuf, String> {
    let mut scenes = get_app_dir()?;
    scenes.push(SCENES_DIR);
    ensure_directory_exists(scenes)
}

pub fn ensure_exports_directory_exists() -> Result<PathBuf, String> {
    let mut exports = get_app_dir()?;
    exports.push(EXPORTS_DIR);
    ensure_directory_exists(exports)
}

pub fn get_default_scene_path() -> Result<PathBuf, String> {
    let mut scenes = ensure_scenes_directory_exists()?;
    scenes.push("untitled.json");
    Ok(scenes)
}
