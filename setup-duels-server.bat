@echo off
REM Flappy Pi Duels Server Setup Script for Windows
REM This script sets up the real-time multiplayer duels server using Socket.IO

echo 🎮 Setting up Flappy Pi Duels Server...
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Create duels server directory
set DUELS_DIR=duels-server
if exist "%DUELS_DIR%" (
    echo 📁 Duels server directory already exists. Updating...
    cd "%DUELS_DIR%"
) else (
    echo 📁 Creating duels server directory...
    mkdir "%DUELS_DIR%"
    cd "%DUELS_DIR%"
)

REM Copy server files
echo 📄 Copying server files...
copy ..\server-duels.js .
copy ..\package-duels.json package.json

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create start script
echo 🚀 Creating start script...
echo @echo off > start-duels.bat
echo echo 🎮 Starting Flappy Pi Duels Server... >> start-duels.bat
echo echo ===================================== >> start-duels.bat
echo echo Server will run on: http://localhost:3001 >> start-duels.bat
echo echo Health check: http://localhost:3001/health >> start-duels.bat
echo echo Available rooms: http://localhost:3001/api/rooms >> start-duels.bat
echo echo. >> start-duels.bat
echo echo Press Ctrl+C to stop the server >> start-duels.bat
echo echo. >> start-duels.bat
echo node server-duels.js >> start-duels.bat

REM Create development script
echo 🔧 Creating development script...
echo @echo off > dev-duels.bat
echo echo 🎮 Starting Flappy Pi Duels Server (Development Mode)... >> dev-duels.bat
echo echo ======================================================= >> dev-duels.bat
echo echo Server will run on: http://localhost:3001 >> dev-duels.bat
echo echo Auto-restart enabled for development >> dev-duels.bat
echo echo. >> dev-duels.bat
echo echo Press Ctrl+C to stop the server >> dev-duels.bat
echo echo. >> dev-duels.bat
echo npx nodemon server-duels.js >> dev-duels.bat

REM Create environment file
echo ⚙️ Creating environment configuration...
echo # Flappy Pi Duels Server Configuration > .env
echo PORT=3001 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # CORS Origins (comma-separated) >> .env
echo CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://flappypi.pinet.com >> .env
echo. >> .env
echo # Server Settings >> .env
echo MAX_ROOMS=100 >> .env
echo MAX_PLAYERS_PER_ROOM=2 >> .env
echo GAME_TIMEOUT=300000 >> .env
echo. >> .env
echo # Logging >> .env
echo LOG_LEVEL=info >> .env

REM Create README
echo 📖 Creating documentation...
echo # Flappy Pi Duels Server > README.md
echo. >> README.md
echo Real-time multiplayer duels server for Flappy Pi using Socket.IO. >> README.md
echo. >> README.md
echo ## Features >> README.md
echo. >> README.md
echo - 🎮 Real-time multiplayer duels >> README.md
echo - 🏠 Room-based matchmaking >> README.md
echo - ⚡ WebSocket communication >> README.md
echo - 🔄 Auto-reconnection >> README.md
echo - 📊 Health monitoring >> README.md
echo - 🎯 Game state synchronization >> README.md
echo. >> README.md
echo ## Quick Start >> README.md
echo. >> README.md
echo ### Start Server >> README.md
echo ```bash >> README.md
echo start-duels.bat >> README.md
echo ``` >> README.md
echo. >> README.md
echo ### Development Mode >> README.md
echo ```bash >> README.md
echo dev-duels.bat >> README.md
echo ``` >> README.md

echo.
echo 🎉 Duels Server Setup Complete!
echo ===============================
echo.
echo 📁 Server directory: .\%DUELS_DIR%
echo 🚀 Start server: cd %DUELS_DIR% ^&^& start-duels.bat
echo 🔧 Development: cd %DUELS_DIR% ^&^& dev-duels.bat
echo.
echo 🌐 Server will run on: http://localhost:3001
echo 🏥 Health check: http://localhost:3001/health
echo 📋 Available rooms: http://localhost:3001/api/rooms
echo.
echo 📖 Documentation: .\%DUELS_DIR%\README.md
echo.
echo 🎮 Ready to start multiplayer duels!
echo.
pause
