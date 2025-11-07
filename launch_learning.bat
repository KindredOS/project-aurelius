@echo off
title Launching LearningOS

echo =====================================================
echo   LEARNING OS LAUNCHER — Powered by Kindred Edge AI
echo =====================================================

:: --- FRONTEND ---
cd "C:\Users\sheph\Desktop\Kindred OS\Kindi Dev\Edu_AiA"
start "" /min cmd /c "set PORT=3001 && npm start"

:: --- WAIT ---
timeout /t 5 /nobreak >nul

:: --- BACKEND CHECK ---
netstat -ano | find ":8000" >nul
if %ERRORLEVEL%==0 (
    echo [INFO] H1 backend already running on port 8000 — skipping launch.
) else (
    echo [INFO] No active backend detected. Launching H1 now...
    cd "C:\Users\sheph\Desktop\Kindred OS\Kindi Dev\H1"
    call venv\Scripts\activate
    start "" /min cmd /c "uvicorn main:app --reload"
)

exit
