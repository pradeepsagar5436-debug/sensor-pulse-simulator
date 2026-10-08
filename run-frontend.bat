@echo off
title Sensor Simulator - React Frontend (Port 5173)
echo ========================================================
echo Starting Sensor Simulator React Frontend...
echo Node: C:\Users\shanm\AppData\Local\Programs\nodejs
echo ========================================================
set "PATH=C:\Users\shanm\AppData\Local\Programs\nodejs;%PATH%"
cd /d "%~dp0frontend"
npm run dev
pause
