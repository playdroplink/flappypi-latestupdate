@echo off
echo 🎮 Starting Combined Duels + Leaderboard Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if config file exists
if not exist "config.js" (
    echo ❌ config.js not found
    echo Please run setup-duels-server.sh first
    pause
    exit /b 1
)

REM Start the combined server
echo 🚀 Starting server...
echo.
echo 📡 Combined Duels + Leaderboard Server
echo 🎮 Real-time multiplayer duels
echo 🏆 Real-time leaderboard updates
echo.
echo Press Ctrl+C to stop the server
echo.

node server-combined.js

pause
