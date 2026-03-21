Set-Item Env:\PATH -Value ('C:\tools\ghc-9.8.2\mingw\bin;' + (Get-Item Env:\PATH).Value)
$output = cargo check --workspace 2>&1
$output | Select-String "error\|Checking\|Compiling\|Finished" | Select-Object -Last 150
if ($LASTEXITCODE -eq 0) {
    Write-Host "BUILD SUCCESS" -ForegroundColor Green
} else {
    Write-Host "BUILD FAILED" -ForegroundColor Red
    exit 1
}
