@echo off
rem Starts backend (uvicorn) and frontend (Vite) in two windows. Works from
rem wherever the repo is cloned: %~dp0 is this script's own folder.
echo Starting Star Jyotish...

set "ROOT=%~dp0"
set "PY=python"
if exist "%ROOT%backend\.venv\Scripts\python.exe" set "PY=%ROOT%backend\.venv\Scripts\python.exe"

start "Backend" cmd /k "cd /d "%ROOT%backend" && "%PY%" -m uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d "%ROOT%frontend" && npm run dev"

timeout /t 4 /nobreak >nul

start http://localhost:3000
