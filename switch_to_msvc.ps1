# Switch to MSVC Rust toolchain and verify build
# Run this AFTER installing Visual Studio Build Tools

Write-Host "Switching Rust to MSVC toolchain..." -ForegroundColor Cyan

# Reset Rust to use MSVC
rustup default stable-x86_64-pc-windows-msvc
rustup update stable-x86_64-pc-windows-msvc

# Clear cargo cache
Write-Host "Clearing cargo build cache..." -ForegroundColor Yellow
cargo clean

# Verify cl.exe is available
Write-Host "`nVerifying MSVC compiler..." -ForegroundColor Cyan
& "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" && where cl.exe

# Try building core service
Write-Host "`nBuilding reticulum-core..." -ForegroundColor Cyan
& "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" cargo check -p reticulum-core --message-format=short 2>&1 | Out-File -FilePath 'cargo_msvc_build.log'
Get-Content 'cargo_msvc_build.log' | Select-String 'Finished|error|warning' | Select-Object -Last 50

Write-Host "`nBuild complete!" -ForegroundColor Green
