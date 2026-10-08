@echo off
echo ========================================================
echo Building SensorPulse Project for Production Deployment
echo ========================================================

set "PATH=C:\Users\shanm\AppData\Local\Programs\nodejs;C:\Program Files\nodejs;%PATH%"

echo 1. Building React Frontend (production bundle)...
cd /d "%~dp0frontend"
call npm install
call npm run build

if not exist "%~dp0frontend\dist" (
    echo [ERROR] Frontend build failed! dist directory not found.
    exit /b 1
)

echo.
echo 2. Syncing frontend assets to backend static folder...
if not exist "%~dp0backend\src\main\resources\static" (
    mkdir "%~dp0backend\src\main\resources\static"
)
xcopy /E /Y /I "%~dp0frontend\dist\*" "%~dp0backend\src\main\resources\static\"

echo.
echo 3. Standalone Full-Stack Asset Sync Complete!
echo You can now run or deploy the backend JAR to serve both Frontend & API live.
echo ========================================================
pause
