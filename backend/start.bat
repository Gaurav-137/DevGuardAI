@echo off
echo Starting DevGuard AI Backend...
echo.
cd /d "%~dp0"
call npm install
echo.
echo Starting backend server on http://localhost:3002...
npm start