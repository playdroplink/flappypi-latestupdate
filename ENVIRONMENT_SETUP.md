# 🌍 Environment Configuration Guide - Flappy Pi

## 📋 Complete Environment Variables Setup

This guide provides all the necessary environment variables for the Flappy Pi application. Copy these variables to your `.env` file.

## 🔧 How to Set Up

1. **Create a `.env` file** in the root directory of your project
2. **Copy the variables below** into your `.env` file
3. **Update the values** with your actual credentials
4. **Never commit the `.env` file** to version control

## 📝 Complete Environment Variables

```bash
# ========================================
# FLAPPY PI - ENVIRONMENT CONFIGURATION
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
# PI NETWORK CONFIGURATION
# ========================================

# Pi Network API Configuration
PI_API_KEY="sxjxt4mkkargbinknb1ymrv9fs73ukp02av9zkz2vki9yrz22ghpsmjxgmhvdjtf"
PI_NETWORK_API_KEY="sxjxt4mkkargbinknb1ymrv9fs73ukp02av9zkz2vki9yrz22ghpsmjxgmhvdjtf"
PI_NETWORK_APP_ID="flappypi6856"

# Pi Network Environment Settings
PI_SANDBOX_MODE="true"
PI_NETWORK="testnet"
VITE_PI_NETWORK="testnet"

# Pi Network Server Configuration
VITE_PI_SERVER_API_KEY="sxjxt4mkkargbinknb1ymrv9fs73ukp02av9zkz2vki9yrz22ghpsmjxgmhvdjtf"
VITE_PI_APP_ID="flappypi6856"

# Pi Network API URLs
PI_API_URL="https://api.testnet.minepi.com/v2"
PI_NETWORK_API_URL="https://api.testnet.minepi.com/v2"

# ========================================
# APPLICATION CONFIGURATION
# ========================================

# Environment Settings
NODE_ENV="development"
FLAPPY_PI_ENV="development"
GAME_ENVIRONMENT="development"

# Feature Flags
ENABLE_ANALYTICS="true"
ENABLE_LEADERBOARD="true"
ENABLE_DEBUG="true"

# Server Configuration
PORT="8080"
APIKEY="your_api_key_here"

# ========================================
# DEPLOYMENT CONFIGURATION
# ========================================

# Vercel Configuration (if using Vercel)
VERCEL_GIT_COMMIT_TIMESTAMP=""
VERCEL_GIT_COMMIT_REF=""
VERCEL_GIT_COMMIT_SHA=""

# ========================================
# SECURITY CONFIGURATION
# ========================================

# CORS Origins (comma-separated)
ALLOWED_ORIGINS="https://flappypi.fun,https://flappypi6856.pinet.com,https://*.pinet.com,https://*.minepi.com,http://localhost:1113,https://localhost:1113"

# ========================================
# DEVELOPMENT CONFIGURATION
# ========================================

# Debug Settings
DEBUG_MODE="true"
FLAPPY_DEBUG="true"
FLAPPY_PI_DEBUG="true"
MUSIC_DEBUG="true"

# Development Server
DEV_SERVER_PORT="1113"
DEV_SERVER_HOST="true"

# ========================================
# AUDIO CONFIGURATION
# ========================================

# Audio Settings
AUDIO_ENABLED="true"
MUSIC_ENABLED="true"
SFX_ENABLED="true"

# ========================================
# GAME CONFIGURATION
# ========================================

# Game Settings
GAME_MODE="development"
TESTNET_MODE="true"
MAINNET_MODE="false"

# ========================================
# MONITORING AND ANALYTICS
# ========================================

# Analytics Configuration
ANALYTICS_ENABLED="true"
ERROR_TRACKING_ENABLED="true"
PERFORMANCE_MONITORING_ENABLED="true"
```

## 🔑 Environment Variables Explained

### **Supabase Configuration**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anonymous key for client-side access
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations
- `POSTGRES_*`: Database connection strings and credentials

### **Pi Network Configuration**
- `PI_API_KEY`: Your Pi Network API key
- `PI_NETWORK_APP_ID`: Your Pi Network application ID
- `PI_SANDBOX_MODE`: Set to "true" for testnet, "false" for mainnet
- `VITE_PI_NETWORK`: Network mode for client-side ("testnet" or "mainnet")

### **Application Configuration**
- `NODE_ENV`: Environment mode ("development", "production", "test")
- `GAME_ENVIRONMENT`: Game environment setting
- `ENABLE_*`: Feature flags for various functionalities

### **Server Configuration**
- `PORT`: Server port number
- `APIKEY`: General API key for external services

### **Development Configuration**
- `DEBUG_MODE`: Enable debug logging
- `FLAPPY_DEBUG`: Enable Flappy Pi specific debugging
- `MUSIC_DEBUG`: Enable audio debugging

## 🚀 Production Deployment

For production deployment, update these variables:

```bash
# Production Settings
NODE_ENV="production"
GAME_ENVIRONMENT="production"
PI_SANDBOX_MODE="false"
VITE_PI_NETWORK="mainnet"
PI_API_URL="https://api.minepi.com/v2"
PI_NETWORK_API_URL="https://api.minepi.com/v2"

# Disable Debug Features
DEBUG_MODE="false"
FLAPPY_DEBUG="false"
MUSIC_DEBUG="false"
ENABLE_DEBUG="false"
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate API keys** regularly
4. **Limit access** to sensitive environment variables
5. **Use environment-specific** configurations

## 🛠️ Quick Setup Commands

```bash
# Create .env file
cp env.example .env

# Or create manually
touch .env

# Edit .env file
nano .env
# or
code .env
```

## 📊 Environment Validation

After setting up your `.env` file, you can validate the configuration:

```bash
# Check if all required variables are set
npm run validate-env

# Test Supabase connection
npm run test-supabase

# Test Pi Network connection
npm run test-pi-network
```

## 🎯 Troubleshooting

### **Common Issues:**

1. **Vite variables not loading**: Ensure variables start with `VITE_`
2. **Supabase connection failed**: Check URL and API keys
3. **Pi Network errors**: Verify API key and app ID
4. **Environment not detected**: Restart development server after changes

### **Debug Commands:**

```javascript
// In browser console
console.log('Environment:', import.meta.env.MODE);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Pi Network:', import.meta.env.VITE_PI_NETWORK);
```

## 📝 Notes

- **Development Mode**: Uses testnet and debug features enabled
- **Production Mode**: Uses mainnet and debug features disabled
- **Local Development**: Server runs on port 1113
- **Pi Browser**: Configured for Pi Browser compatibility
- **Audio System**: Centralized audio management with cleanup

## ✅ Verification Checklist

- [ ] `.env` file created in project root
- [ ] All Supabase variables configured
- [ ] Pi Network variables set correctly
- [ ] Environment mode set appropriately
- [ ] Debug settings configured
- [ ] Server port configured
- [ ] CORS origins updated
- [ ] Security variables set
- [ ] Development server starts successfully
- [ ] No console errors related to missing environment variables

Your Flappy Pi application is now properly configured with all necessary environment variables! 🎮
