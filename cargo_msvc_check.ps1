# Set up MSVC environment and build
& "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >$null 2>&1

# Add VC tools to PATH
$vcBinPath = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.33.31629\bin\HostX64\x64"
$env:Path = "$vcBinPath;$env:Path"

Write-Host "Building reticulum-core with MSVC..." -ForegroundColor Cyan
cargo check -p reticulum-core --message-format=short 2>&1 | Out-File -FilePath 'cargo_msvc_build.log'

$output = Get-Content 'cargo_msvc_build.log'
$output | Select-String 'Compiling|Checking|Finished|error|warning' | Select-Object -Last 100

$hasError = $output -match 'error:'
if (-not $hasError) {
    Write-Host "`nBUILD SUCCESS!" -ForegroundColor Green
} else {
    Write-Host "`nBUILD FAILED - See cargo_msvc_build.log" -ForegroundColor Red
    exit 1
}
