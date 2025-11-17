#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this script to set all required environment variables

echo "🚀 Setting up Vercel Environment Variables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Set critical environment variables for production
echo "📝 Setting environment variables..."

vercel env add VITE_SUPABASE_URL production
echo "https://feiifpwfbfjrjpcvjdfz.supabase.co"

vercel env add VITE_SUPABASE_ANON_KEY production  
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ"

vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MDUwMSwiZXhwIjoyMDc4NzU2NTAxfQ.8UjMqbh3DTR_Dp63FhgtStUunfDojqxsx8ImCKiUtiw"

vercel env add VITE_PI_APP_ID production
echo "flappypi2807"

vercel env add VITE_PI_SERVER_API_KEY production
echo "zrt9rwcjrdaejytlu72ha0yi2czvljx6geuwphzueaeybqsyboixukixy0cmogmo"

vercel env add VITE_PI_NETWORK production
echo "mainnet"

vercel env add VITE_BACKEND_URL production
echo "https://flappypi.fun/api"

vercel env add NODE_ENV production
echo "production"

echo "✅ Environment variables set successfully!"
echo "🚀 Now deploying to production..."

vercel --prod

echo "🎉 Deployment complete!"