@echo off
echo 🚀 Simple Flappy Pi Deployment...

echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies.
    pause
    exit /b 1
)

echo 🔨 Building the application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

echo 🚀 Deploying to Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo ✅ Deployment completed successfully!
    echo.
    echo 🔍 Test URLs:
    echo - https://flappypi.fun/validation-key.txt
    echo - https://flappypi.fun/flappypi.fun-validation-key.txt
    echo - https://flappypi.fun/.well-known/flappypi.fun-validation-key.txt
    echo - https://flappypi.fun/test-validation-key.html
) else (
    echo ❌ Deployment failed.
)

pause 