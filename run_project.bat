@echo off
title HE THONG MEMORYVERSE - ONE CLICK LAUNCHER

echo ========================================================
echo   KHOI DONG HE THONG BAO TANG KY NIEM MEMORYVERSE
echo ========================================================
echo.

echo [0/3] Dang don dẹp cong 5000 va 5001 bi kiet truoc do...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %%a 2>nul
ping -n 2 127.0.0.1 > nul

echo.
echo [1/3] Dang kich hoat Backend API Server va CSDL MongoDB (Port 5001)...
start "MEMORYVERSE_BACKEND" /d "%~dp0server" cmd /k "npm start"

echo.
echo [2/3] Dang kich hoat Frontend React App va Tu dong mo Trinh duyet Web (Port 5000)...
start "MEMORYVERSE_FRONTEND" /d "%~dp0client" cmd /k "npm run dev"

echo.
echo ========================================================
echo   HE THONG DA KHOI DONG THANH CONG!
echo   User: demo_user@memoryverse.com / Pass: User@123
echo   Admin: admin@memoryverse.com / Pass: Admin@123
echo ========================================================
echo.
pause
