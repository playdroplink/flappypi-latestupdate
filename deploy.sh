#!/bin/bash

# Flappy Pi Deployment Script
# This script helps deploy the app to Vercel with proper validation key setup

echo "🚀 Starting Flappy Pi Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "🔍 Running build tests..."
node test-build.js

if [ $? -ne 0 ]; then
    echo "❌ Build tests failed. Please check the errors above."
    exit 1
fi

echo "✅ Build tests passed!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🔍 Next steps:"
    echo "1. Test validation key URLs:"
    echo "   - https://flappypi.fun/validation-key.txt"
    echo "   - https://flappypi.fun/flappypi.fun-validation-key.txt"
    echo "   - https://flappypi.fun/.well-known/flappypi.fun-validation-key.txt"
    echo ""
    echo "2. Test the app in Pi Browser:"
    echo "   - https://flappypi.fun"
    echo ""
    echo "3. Test validation key page:"
    echo "   - https://flappypi.fun/test-validation-key.html"
    echo ""
    echo "4. Update Pi Network app settings with domain: flappypi.fun"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi 