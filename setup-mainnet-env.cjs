#!/usr/bin/env node

/**
 * Mainnet Environment Setup Script for Flappy Pi
 * This script creates the proper .env file for mainnet production
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Flappy Pi Mainnet Environment...');

// Mainnet environment configuration
const mainnetEnvContent = `# ========================================
# FLAPPY PI - MAINNET ENVIRONMENT CONFIGURATION
# ========================================

# ========================================
# SUPABASE CONFIGURATION
# ========================================

# Supabase URL and Keys (Client-side - Vite)
VITE_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q"
VITE_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ"

# Supabase Database Configuration (Server-side)
POSTGRES_URL="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_USER="postgres"
POSTGRES_HOST="db.ididprksbmbhigcxcxvt.supabase.co"
POSTGRES_PASSWORD="jtrriobt4G7Sr5VG"
POSTGRES_DATABASE="postgres"
POSTGRES_PRISMA_URL="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase JWT Secret
SUPABASE_JWT_SECRET="IlEbfOj6cuDqID3G/4ClWFgC32LmK7IMdORUtHXyUdlW6mJ3Tu3B4pojw5YA4uq1O/mF8rYolo7ZOf7CoJ93Xg=="

# ========================================
# PI NETWORK CONFIGURATION - MAINNET
# ========================================

# Pi Network API Configuration - MAINNET
PI_API_KEY="rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3"
PI_NETWORK_API_KEY="rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3"
PI_NETWORK_APP_ID="flappypi2807"

# Pi Network Environment Settings - SANDBOX
PI_SANDBOX_MODE="true"
PI_NETWORK="sandbox"
VITE_PI_NETWORK="sandbox"
SANDBOX_MODE="true"

# Pi Network Server Configuration - MAINNET
VITE_PI_SERVER_API_KEY="rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3"
VITE_PI_APP_ID="flappypi2807"
VITE_PI_VALIDATION_KEY="94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce"

# Pi Network API URLs - MAINNET
PI_API_URL="https://api.minepi.com"
PI_NETWORK_API_URL="https://api.minepi.com"

# Pi Network Wallet Configuration - MAINNET
PI_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"
TRUTHWEB_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"
MERCHANT_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"

# ========================================
# APPLICATION CONFIGURATION - MAINNET
# ========================================

# Environment Settings - MAINNET
NODE_ENV="production"
FLAPPY_PI_ENV="production"
GAME_ENVIRONMENT="production"

# Feature Flags - MAINNET
ENABLE_ANALYTICS="true"
ENABLE_LEADERBOARD="true"
ENABLE_DEBUG="false"

# Server Configuration
PORT="8080"
APIKEY="rppe8zs82vn2kmksqmkopg1yiqzqxs0vgcmzbo5e6hqc3zfn5qeexzygbjqn3yd3"

# ========================================
# SECURITY CONFIGURATION - MAINNET
# ========================================

# CORS Origins (comma-separated) - MAINNET
ALLOWED_ORIGINS="https://flappypi.fun,https://flappypi2807.pinet.com,https://*.pinet.com,https://*.minepi.com"

# Pi Network Security - MAINNET
PI_REQUIRE_BROWSER="true"
PI_REQUIRE_AUTH="true"
PI_VALIDATE_PAYMENTS="true"

# ========================================
# PRODUCTION CONFIGURATION - MAINNET
# ========================================

# Debug Settings - MAINNET (Disabled for production)
DEBUG_MODE="false"
FLAPPY_DEBUG="false"
FLAPPY_PI_DEBUG="false"
MUSIC_DEBUG="false"

# ========================================
# AUDIO CONFIGURATION
# ========================================

# Audio Settings
AUDIO_ENABLED="true"
MUSIC_ENABLED="true"
SFX_ENABLED="true"

# ========================================
# GAME CONFIGURATION - MAINNET
# ========================================

# Game Settings - SANDBOX
GAME_MODE="sandbox"
TESTNET_MODE="false"
MAINNET_MODE="false"
SANDBOX_MODE="true"

# ========================================
# MONITORING AND ANALYTICS
# ========================================

# Analytics Configuration
ANALYTICS_ENABLED="true"
ERROR_TRACKING_ENABLED="true"
PERFORMANCE_MONITORING_ENABLED="true"

# ========================================
# PINET CONFIGURATION - MAINNET
# ========================================

# PiNet Settings - MAINNET
PINET_MODE="true"
PINET_ENABLED="true"
PINET_ECOSYSTEM="true"
PINET_SUBDOMAIN="flappypi2807.pinet.com"
PINET_BASE_URL="https://flappypi.fun"

# ========================================
# END OF MAINNET CONFIGURATION
# ========================================
`;

// Create .env file
try {
  fs.writeFileSync('.env', mainnetEnvContent);
  console.log('✅ Created .env file with mainnet configuration');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}

// Create .env.production file
try {
  fs.writeFileSync('.env.production', mainnetEnvContent);
  console.log('✅ Created .env.production file with mainnet configuration');
} catch (error) {
  console.error('❌ Error creating .env.production file:', error.message);
}

// Create .env.local file for development
const developmentEnvContent = mainnetEnvContent.replace('NODE_ENV="production"', 'NODE_ENV="development"')
  .replace('FLAPPY_PI_ENV="production"', 'FLAPPY_PI_ENV="development"')
  .replace('GAME_ENVIRONMENT="production"', 'GAME_ENVIRONMENT="development"')
  .replace('ENABLE_DEBUG="false"', 'ENABLE_DEBUG="true"')
  .replace('DEBUG_MODE="false"', 'DEBUG_MODE="true"')
  .replace('FLAPPY_DEBUG="false"', 'FLAPPY_DEBUG="true"')
  .replace('FLAPPY_PI_DEBUG="false"', 'FLAPPY_PI_DEBUG="true"')
  .replace('MUSIC_DEBUG="false"', 'MUSIC_DEBUG="true"')
  .replace('PORT="8080"', 'PORT="1113"')
  .replace('ALLOWED_ORIGINS="https://flappypi.fun,https://flappypi2807.pinet.com,https://*.pinet.com,https://*.minepi.com"', 'ALLOWED_ORIGINS="https://flappypi.fun,https://flappypi2807.pinet.com,https://*.pinet.com,https://*.minepi.com,http://localhost:1113,https://localhost:1113"');

try {
  fs.writeFileSync('.env.local', developmentEnvContent);
  console.log('✅ Created .env.local file with development configuration');
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
}

console.log('\n🎉 Environment setup complete!');
console.log('\n📁 Files created:');
console.log('   - .env (mainnet production)');
console.log('   - .env.production (mainnet production)');
console.log('   - .env.local (development with mainnet)');
console.log('\n🔧 Key Configuration:');
console.log('   - Pi Network: MAINNET');
console.log('   - Sandbox Mode: DISABLED');
console.log('   - Wallet Address: GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ');
console.log('   - App ID: flappypi2807');
console.log('\n🚀 Ready for mainnet deployment!');