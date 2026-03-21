# Visual Studio Build Tools Installation Script for GraphWiz-XR
# This installs the C++ workload required for Rust MSVC builds

Write-Host "Installing Visual Studio Build Tools..." -ForegroundColor Cyan

# Check if installer exists
$installerPath = "$env:TEMP\vs_buildTools.exe"
if (-not (Test-Path $installerPath)) {
    Write-Host "Downloading Visual Studio Build Tools installer..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vs_buildtools.exe" -OutFile $installerPath
}

# Install with C++ workload (quietly, no UI)
Write-Host "Installing C++ Desktop Development workload..." -ForegroundColor Yellow
# Install with C++ workload (silently, with wait)
Write-Host "Starting installation. This may take 5-15 minutes..." -ForegroundColor Yellow
Start-Process -FilePath $installerPath -ArgumentList "--quiet", "--wait", "--add", "Microsoft.VisualStudio.Workload.NativeDesktop" -Wait -NoNewWindow

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "Restarting terminal/window may be required." -ForegroundColor Yellow
