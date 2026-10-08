@echo off
echo ========================================================
echo Launching Sensor Simulator Project (Backend + Frontend)
echo ========================================================
start "Sensor Simulator - Backend" run-backend.bat
timeout /t 3 /nobreak >nul
start "Sensor Simulator - Frontend" run-frontend.bat
echo Both services are starting in their respective windows!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo H2 DB:    http://localhost:8080/h2-console
pause
