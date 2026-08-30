@echo off
title ShopTok Singapore - Start Project
cd /d "C:\Users\Laptop Mart\Downloads\shoptok-singapore-style\shoptok-fullstack"

echo ==========================================
echo        ShopTok Singapore - Starting
echo ==========================================
echo.

echo Starting Backend...
start "ShopTok Backend" cmd /k "cd /d ""%CD%\backend"" && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend...
start "ShopTok Frontend" cmd /k "cd /d ""%CD%\frontend"" && npm run dev"

echo.
echo ==========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo ==========================================
echo.
echo Two CMD windows have been opened.
pause
