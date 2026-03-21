@echo off
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
cargo check --workspace --message-format=short 2>&1 | findstr /C:"Compiling" /C:"Checking" /C:"Finished" /C:"error" /C:"warning"

if %ERRORLEVEL% equ 0 (
    echo.
    echo BUILD SUCCESS!
) else (
    echo.
    echo BUILD FAILED - See cargo_build.log
)
