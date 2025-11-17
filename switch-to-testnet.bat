@echo off
echo Switching to Pi Network TESTNET mode...
echo VITE_PI_SANDBOX=true > .env
echo VITE_PI_SDK_SANDBOX=true >> .env
echo.
echo Configuration updated for TESTNET
echo Restart your development server with: npm run dev
pause 