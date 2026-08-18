@echo off
chcp 65001 > nul
title HE THONG MEMORYVERSE - ONE CLICK LAUNCHER

echo ========================================================
echo   🚀 KHỞI ĐỘNG HỆ THỐNG BẢO TÀNG KỶ NIỆM MEMORYVERSE
echo ========================================================
echo.

echo 1. Đang nạp & khởi tạo dữ liệu CSDL MongoDB (10 kỷ niệm + Tài khoản)...
cd /d "%~dp0server"
call node seed_10_memories.js
echo.

echo 2. Đang kích hoạt máy chủ Backend API & CSDL MongoDB (Port 5001)...
start "MEMORYVERSE - BACKEND SERVER (Port 5001)" cmd /k "cd /d "%~dp0server" && npm start"

echo 3. Đang kích hoạt Giao diện Frontend React (Port 5000)...
start "MEMORYVERSE - FRONTEND REACT (Port 5000)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo 4. Đang tự động mở Trình duyệt đến http://localhost:5000 ...
timeout /t 3 /nobreak > nul
start http://localhost:5000

echo.
echo ========================================================
echo   ✅ HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG!
echo   📌 Tài khoản User: demo_user@memoryverse.com / User@123
echo   📌 Tài khoản Admin: admin@memoryverse.com / Admin@123
echo ========================================================
echo.
