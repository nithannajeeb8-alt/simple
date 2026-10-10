@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  echo Starting PageBloom at http://localhost:8080
  echo Keep this window open while using the app.
  py -m http.server 8080
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting PageBloom at http://localhost:8080
  echo Keep this window open while using the app.
  python -m http.server 8080
  goto :end
)
echo Python was not found. Install Python 3 from https://www.python.org/downloads/windows/
echo Or double-click index.html to use the core image-to-PDF features without PWA installation.
pause
:end
endlocal
