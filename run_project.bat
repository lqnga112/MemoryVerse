@echo off
title HE THONG MEMORYVERSE - ONE CLICK LAUNCHER

echo ========================================================
echo   KHOI DONG HE THONG BAO TANG KY NIEM MEMORYVERSE
echo ========================================================
echo.

echo [1/3] Dang kich hoat Backend API Server va CSDL MongoDB (Port 5001)...
start "MEMORYVERSE_BACKEND" /d "%~dp0server" cmd /k "npm start"

echo.
echo [2/3] Dang kich hoat Frontend React App (Port 5000)...
start "MEMORYVERSE_FRONTEND" /d "%~dp0client" cmd /k "npm run dev"

echo.
echo [3/3] Dang tu dong mo trinh duyet den http://localhost:5000 ...
ping -n 4 127.0.0.1 > nul
explorer "http://localhost:5000"
start "" "http://localhost:5000"

echo.
echo ========================================================
echo   HE THONG DA KHOI DONG THANH CONG!
echo   User: demo_user@memoryverse.com / Pass: User@123
echo   Admin: admin@memoryverse.com / Pass: Admin@123
echo ========================================================
echo.
pause
