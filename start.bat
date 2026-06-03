@echo off
echo Starting AstroGuru...

start "Backend" cmd /k "cd /d C:\Users\Delll\AstroGuru\backend && uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d C:\Users\Delll\AstroGuru\frontend && npm run dev"

timeout /t 4 /nobreak >nul

start http://localhost:3000
