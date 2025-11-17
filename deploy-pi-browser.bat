@echo off
echo ========================================
echo Flappy Pi - Pi Browser Deployment
echo ========================================
echo.

echo 🚀 Building for production...
npm run build

echo.
echo 📦 Build completed!
echo.

echo 🌐 Deploying to Vercel...
echo.
echo Please run the following command to deploy:
echo vercel --prod
echo.

echo 📋 Deployment Checklist:
echo ✅ Build completed
echo ✅ Validation key updated
echo ✅ Iframe headers configured
echo ✅ CORS headers set
echo ✅ Pi Browser compatibility enabled
echo.

echo 🔗 After deployment, your app will be available at:
echo    - https://your-app-name.vercel.app
echo    - https://flappypi.fun (if configured)
echo.

echo 🧪 Test URLs for Pi Browser:
echo    - https://your-app-name.vercel.app/validation-key.txt
echo    - https://your-app-name.vercel.app/flappypi.fun-validation-key.txt
echo    - https://your-app-name.vercel.app/.well-known/flappypi.fun-validation-key.txt
echo.

echo 📱 Pi Browser Sandbox URL:
echo    - https://sandbox.minepi.com/app/your-app-id
echo.

echo ⚠️  Important Notes:
echo    - Make sure your app is deployed to a public HTTPS URL
echo    - The Pi Browser sandbox cannot access localhost
echo    - Update your Pi app configuration with the new public URL
echo.

pause 