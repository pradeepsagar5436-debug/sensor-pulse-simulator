@echo off
title Sensor Simulator - Spring Boot Backend (Port 8080)
echo ========================================================
echo Starting Sensor Simulator Spring Boot Backend...
echo Java: C:\Program Files\Java\jdk-24
echo Maven: C:\Users\shanm\Downloads\apache-maven-3.9.11-bin\apache-maven-3.9.11
echo ========================================================
set "JAVA_HOME=C:\Program Files\Java\jdk-24"
set "PATH=C:\Program Files\Java\jdk-24\bin;C:\Users\shanm\Downloads\apache-maven-3.9.11-bin\apache-maven-3.9.11\bin;%PATH%"
cd /d "%~dp0backend"
mvn spring-boot:run
pause
