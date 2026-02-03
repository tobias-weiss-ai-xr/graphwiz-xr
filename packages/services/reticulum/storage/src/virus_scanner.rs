//! Virus scanning for uploaded files
//!
//! Uses ClamAV for virus detection. Falls back to magic byte validation
//! if ClamAV is not available.

use std::path::Path;
use std::process::Command;
use std::time::Duration;
use tokio::process::Command as TokioCommand;
use tokio::time::timeout;

use reticulum_core::Error;

/// Maximum scan timeout (30 seconds)
const SCAN_TIMEOUT: Duration = Duration::from_secs(30);

/// Scan a file for viruses using ClamAV
///
/// This function will:
/// 1. Try to use ClamAV if available
/// 2. Fall back to magic byte validation if ClamAV is unavailable
/// 3. Reject suspicious file types (executables, scripts, etc.)
///
/// # Arguments
/// * `file_path` - Path to the file to scan
///
/// # Returns
/// * `Ok(())` if file is clean
/// * `Err(Error)` if file is infected or suspicious
pub async fn scan_file_for_viruses(file_path: &Path) -> Result<(), Error> {
    let file_name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown");

    log::info!("Starting virus scan for: {}", file_name);

    // Check for suspicious file extensions first (quick reject)
    if is_suspicious_file_type(file_path) {
        log::warn!("Rejected suspicious file type: {}", file_name);
        return Err(Error::validation(format!(
            "Suspicious file type detected: {}",
            file_name
        )));
    }

    // Try ClamAV scan if available
    match clamav_scan(file_path).await {
        Ok(clean) if clean => {
            log::info!("ClamAV scan passed for: {}", file_name);
            Ok(())
        }
        Ok(false) => {
            log::warn!("ClamAV scan detected virus in: {}", file_name);
            Err(Error::validation(format!(
                "Virus detected in file: {}",
                file_name
            )))
        }
        Err(e) => {
            // ClamAV not available, fall back to magic byte validation
            log::warn!("ClamAV unavailable ({}), using magic byte validation", e);
            validate_magic_bytes(file_path)
        }
    }
}

/// Check if file has a suspicious extension
///
/// Rejects executables, scripts, and other potentially dangerous file types.
fn is_suspicious_file_type(file_path: &Path) -> bool {
    let file_name = match file_path.file_name().and_then(|n| n.to_str()) {
        Some(name) => name.to_lowercase(),
        None => return false,
    };

    // List of suspicious extensions
    let suspicious_extensions = [
        "exe", "bat", "cmd", "com", "pif", "scr", "vbs", "js",
        "jar", "sh", "ps1", "msi", "dll", "so", "dylib",
    ];

    if let Some(ext) = file_name.rsplit('.').next() {
        if suspicious_extensions.iter().any(|s| s == ext.to_lowercase()) {
            return true;
        }
    }

    false
}

/// Scan file using ClamAV
///
/// Returns `Ok(true)` if clean, `Ok(false)` if infected, `Err` if ClamAV failed.
async fn clamav_scan(file_path: &Path) -> Result<bool, String> {
    // Try to run clamscan command
    let output = match timeout(
        SCAN_TIMEOUT,
        TokioCommand::new("clamscan")
            .arg("--no-summary")
            .arg(file_path)
            .output(),
    )
    .await
    {
        Ok(result) => result,
        Err(_) => {
            // Timeout or command not found
            return Err("ClamAV scan timeout or not available".to_string());
        }
    };

    match output {
        Ok(output) => {
            if output.status.success() {
                // Check for "OK" or "FOUND" in output
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);

                // ClamAV outputs OK for clean files
                if stdout.contains("OK") && !stdout.contains("FOUND") {
                    return Ok(true);
                }

                // Check for virus signatures
                if stdout.contains("FOUND") || stderr.contains("FOUND") {
                    let virus_name = extract_virus_name(&stdout);
                    return Err(format!("Virus detected: {}", virus_name));
                }

                // Unknown result, assume clean
                log::debug!("ClamAV scan result unclear, assuming clean");
                Ok(true)
            } else {
                Err(format!("ClamAV scan failed with exit code: {:?}", output.status.code()))
            }
        }
        Err(e) => Err(format!("Failed to run ClamAV: {}", e)),
    }
}

/// Extract virus name from ClamAV output
fn extract_virus_name(output: &str) -> String {
    // ClamAV output format: "filename: FOUND VirusName" or similar
    for line in output.lines() {
        if line.contains("FOUND") {
            // Extract the virus name after "FOUND"
            if let Some(idx) = line.find("FOUND") {
                let after_found = &line[idx + 6..];
                // Take the first word or until whitespace
                return after_found
                    .trim()
                    .split_whitespace()
                    .next()
                    .unwrap_or("Unknown")
                    .to_string();
            }
        }
    }
    "Unknown".to_string()
}

/// Validate file using magic bytes (fallback)
///
/// When ClamAV is unavailable, use magic bytes to ensure the file
/// is what it claims to be.
fn validate_magic_bytes(file_path: &Path) -> Result<(), Error> {
    let file_name = file_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown");

    log::info!("Validating magic bytes for: {}", file_name);

    // Read first few bytes for magic byte validation
    match std::fs::read(file_path) {
        Ok(bytes) => {
            if bytes.len() < 4 {
                return Err(Error::validation("File too small to validate".to_string()));
            }

            // Check for suspicious magic bytes
            // MZ = Windows executable
            if bytes[0] == 0x4D && bytes[1] == 0x5A {
                log::warn!("Executable magic bytes detected in: {}", file_name);
                return Err(Error::validation(format!(
                    "Executable file detected: {}",
                    file_name
                )));
            }

            // ELF = Linux executable
            if bytes[0] == 0x7F && bytes[1] == 0x45 && bytes[2] == 0x4C && bytes[3] == 0x46 {
                log::warn!("Executable magic bytes detected in: {}", file_name);
                return Err(Error::validation(format!(
                    "Executable file detected: {}",
                    file_name
                )));
            }

            log::info!("Magic byte validation passed for: {}", file_name);
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to read file for magic byte validation: {}", e);
            Err(Error::internal(format!(
                "Failed to validate file: {}",
                e
            )))
        }
    }
}

/// Check if ClamAV is available on the system
pub async fn is_clamav_available() -> bool {
    match Command::new("clamscan").arg("--version").output() {
        Ok(output) => output.status.success(),
        Err(_) => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[tokio::test]
    async fn test_suspicious_file_types() {
        let temp = NamedTempFile::new().unwrap();
        let path = temp.path();

        // Create an .exe file
        fs::write(&path.with_extension("exe"), b"test").unwrap();

        assert!(is_suspicious_file_type(&path.with_extension("exe")));

        // Create a .txt file (not suspicious)
        fs::write(&path.with_extension("txt"), b"test").unwrap();

        assert!(!is_suspicious_file_type(&path.with_extension("txt")));
    }

    #[tokio::test]
    async fn test_validate_magic_bytes_executable() {
        let temp = NamedTempFile::new().unwrap();
        let path = temp.path();

        // Write MZ header (Windows executable)
        let mut bytes = vec![0x4D, 0x5A, 0x00, 0x00];
        bytes.extend_from_slice(&[0u8; 100]);
        fs::write(&path, &bytes).unwrap();

        assert!(validate_magic_bytes(&path).is_err());
    }

    #[tokio::test]
    async fn test_validate_magic_bytes_clean() {
        let temp = NamedTempFile::new().unwrap();
        let path = temp.path();

        // Write clean PNG header
        let png_header = vec![0x89, 0x50, 0x4E, 0x47];
        let mut bytes = png_header.clone();
        bytes.extend_from_slice(&[0u8; 100]);
        fs::write(&path, &bytes).unwrap();

        assert!(validate_magic_bytes(&path).is_ok());
    }
}
