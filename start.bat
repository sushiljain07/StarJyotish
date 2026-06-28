@echo off
echo Starting Star Jyotish...

start "Backend" cmd /k "cd /d C:\Users\Delll\StarJyotish\backend && uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d C:\Users\Delll\StarJyotish\frontend && npm run dev"

timeout /t 4 /nobreak >nul

start http://localhost:3000
