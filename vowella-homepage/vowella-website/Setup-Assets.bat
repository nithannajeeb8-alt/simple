@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Download-Assets.ps1"
if errorlevel 1 (
  echo.
  echo Asset setup failed. Check your internet connection and try again.
  pause
  exit /b 1
)
echo.
echo Vowella is ready. Double-click index.html to preview.
pause
