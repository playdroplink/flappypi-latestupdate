@echo off
echo 🚀 Starting Flappy Pi Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

echo 🔍 Running build tests...
node test-build.js

if %errorlevel% neq 0 (
    echo ❌ Build tests failed. Please check the errors above.
    pause
    exit /b 1
)

echo ✅ Build tests passed!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo ✅ Deployment completed successfully!
    echo.
    echo 🔍 Next steps:
    echo 1. Test validation key URLs:
    echo    - https://flappypi.fun/validation-key.txt
    echo    - https://flappypi.fun/flappypi.fun-validation-key.txt
    echo    - https://flappypi.fun/.well-known/flappypi.fun-validation-key.txt
    echo.
    echo 2. Test the app in Pi Browser:
    echo    - https://flappypi.fun
    echo.
    echo 3. Test validation key page:
    echo    - https://flappypi.fun/test-validation-key.html
    echo.
    echo 4. Update Pi Network app settings with domain: flappypi.fun
) else (
    echo ❌ Deployment failed. Please check the errors above.
)

pause 