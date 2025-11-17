@echo off
echo Switching to Pi Network MAINNET mode...
echo VITE_PI_SANDBOX=false > .env
echo VITE_PI_SDK_SANDBOX=false >> .env
echo.
echo Configuration updated for MAINNET
echo Restart your development server with: npm run dev
pause 