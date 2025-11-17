@echo off
REM Enhanced Flappy Pi Duels Server Startup Script for Windows
REM This script starts the Socket.IO duels server with proper configuration and monitoring

setlocal enabledelayedexpansion

echo.
echo 🎮 Flappy Pi Duels Server Startup
echo ==================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set NODE_MAJOR=%%i
if %NODE_MAJOR% LSS 16 (
    echo ❌ Node.js version 16+ is required. Current version: %NODE_VERSION%
    echo    Please upgrade Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version check passed

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the duels-server directory.
    pause
    exit /b 1
)

REM Create logs directory
if not exist "logs" (
    mkdir logs
    echo 📁 Created logs directory
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    (
        echo # Flappy Pi Duels Server Configuration
        echo PORT=3009
        echo NODE_ENV=development
        echo HOST=localhost
        echo.
        echo # CORS Configuration
        echo CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://flappypi.pinet.com
        echo.
        echo # Game Configuration
        echo MAX_ROOMS=100
        echo MAX_PLAYERS_PER_ROOM=2
        echo GAME_TIMEOUT=300000
        echo GAME_TICK_RATE=60
        echo.
        echo # Security Configuration
        echo RATE_LIMIT_WINDOW=60000
        echo RATE_LIMIT_MAX_REQUESTS=100
        echo ENABLE_RATE_LIMITING=true
        echo.
        echo # Logging Configuration
        echo LOG_LEVEL=info
        echo ENABLE_DEBUG_LOGS=false
    ) > .env
    echo ✅ Created .env file
)

REM Check if port 3009 is available
netstat -an | findstr ":3009" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Port 3009 is already in use
    echo Do you want to kill the existing process? (y/n)
    set /p response=
    if /i "%response%"=="y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3009"') do taskkill /PID %%a /F >nul 2>&1
        timeout /t 2 /nobreak >nul
    ) else (
        echo ❌ Cannot start server on port 3009
        pause
        exit /b 1
    )
)

echo.
echo 🚀 Starting Flappy Pi Duels Server...
echo.
echo Server will be available at:
echo   🏥 Health check: http://localhost:3009/health
echo   📋 Available rooms: http://localhost:3009/api/rooms
echo   📊 Server stats: http://localhost:3009/api/stats
echo.
echo 💡 To stop the server, press Ctrl+C
echo.

REM Start the server
node server-duels.js

REM Handle script interruption
:cleanup
echo.
echo 🔄 Shutting down server...
exit /b 0