#!/usr/bin/env node

/**
 * Environment Setup Script for Flappy Pi
 * This script helps you create and configure your .env file
 */

const fs = require('fs');
const path = require('path');

// Environment variables template
const envTemplate = `# ========================================
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
PI_API_KEY="3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc"
PI_NETWORK_API_KEY="3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc"
PI_NETWORK_APP_ID="flappypi2807"

# Pi Network Environment Settings
PI_SANDBOX_MODE="false"
PI_NETWORK="mainnet"
VITE_PI_NETWORK="mainnet"

# Pi Network Server Configuration
VITE_PI_SERVER_API_KEY="3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc"
VITE_PI_APP_ID="flappypi2807"

# Pi Network API URLs
PI_API_URL="https://api.minepi.com/v2"
PI_NETWORK_API_URL="https://api.minepi.com/v2"

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
GAME_MODE="production"
TESTNET_MODE="false"
MAINNET_MODE="true"

# ========================================
# MONITORING AND ANALYTICS
# ========================================

# Analytics Configuration
ANALYTICS_ENABLED="true"
ERROR_TRACKING_ENABLED="true"
PERFORMANCE_MONITORING_ENABLED="true"
`;

// Production environment template
const productionEnvTemplate = `# ========================================
# FLAPPY PI - PRODUCTION ENVIRONMENT
# ========================================

# ========================================
# SUPABASE CONFIGURATION
# ========================================

# Supabase URL and Keys (Client-side - Vite)
VITE_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q"
VITE_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ"

# ========================================
# PI NETWORK CONFIGURATION
# ========================================

# Pi Network API Configuration
PI_API_KEY="your_production_pi_api_key_here"
PI_NETWORK_API_KEY="your_production_pi_api_key_here"
PI_NETWORK_APP_ID="flappypi6856"

# Pi Network Environment Settings
PI_SANDBOX_MODE="false"
PI_NETWORK="mainnet"
VITE_PI_NETWORK="mainnet"

# Pi Network Server Configuration
VITE_PI_SERVER_API_KEY="your_production_pi_api_key_here"
VITE_PI_APP_ID="flappypi6856"

# Pi Network API URLs
PI_API_URL="https://api.minepi.com/v2"
PI_NETWORK_API_URL="https://api.minepi.com/v2"

# ========================================
# APPLICATION CONFIGURATION
# ========================================

# Environment Settings
NODE_ENV="production"
FLAPPY_PI_ENV="production"
GAME_ENVIRONMENT="production"

# Feature Flags
ENABLE_ANALYTICS="true"
ENABLE_LEADERBOARD="true"
ENABLE_DEBUG="false"

# Server Configuration
PORT="8080"
APIKEY="your_production_api_key_here"

# ========================================
# SECURITY CONFIGURATION
# ========================================

# CORS Origins (comma-separated)
ALLOWED_ORIGINS="https://flappypi.fun,https://flappypi6856.pinet.com,https://*.pinet.com,https://*.minepi.com"

# ========================================
# PRODUCTION CONFIGURATION
# ========================================

# Debug Settings
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
# GAME CONFIGURATION
# ========================================

# Game Settings
GAME_MODE="production"
TESTNET_MODE="false"
MAINNET_MODE="true"

# ========================================
# MONITORING AND ANALYTICS
# ========================================

# Analytics Configuration
ANALYTICS_ENABLED="true"
ERROR_TRACKING_ENABLED="true"
PERFORMANCE_MONITORING_ENABLED="true"
`;

function createEnvFile(envPath, template, environment) {
  try {
    // Check if .env file already exists
    if (fs.existsSync(envPath)) {
      console.log(`⚠️  .env file already exists at ${envPath}`);
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          writeEnvFile(envPath, template, environment);
        } else {
          console.log('❌ .env file creation cancelled');
        }
        rl.close();
      });
    } else {
      writeEnvFile(envPath, template, environment);
    }
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}

function writeEnvFile(envPath, template, environment) {
  try {
    fs.writeFileSync(envPath, template);
    console.log(`✅ .env file created successfully for ${environment} environment!`);
    console.log(`📁 Location: ${envPath}`);
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Review the .env file and update any values if needed');
    console.log('2. For production, update the Pi Network API keys');
    console.log('3. Start your development server: npm run dev');
    console.log('');
    console.log('📖 For more information, see: ENVIRONMENT_SETUP.md');
  } catch (error) {
    console.error('❌ Error writing .env file:', error.message);
  }
}

function validateEnvFile(envPath) {
  try {
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found');
      return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'PI_API_KEY',
      'PI_NETWORK_APP_ID'
    ];

    const missingVars = [];
    requiredVars.forEach(varName => {
      if (!envContent.includes(varName + '=')) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      console.log('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      return false;
    }

    console.log('✅ .env file validation passed!');
    return true;
  } catch (error) {
    console.error('❌ Error validating .env file:', error.message);
    return false;
  }
}

// Main script logic
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const envPath = path.join(process.cwd(), '.env');

  console.log('🌍 Flappy Pi Environment Setup');
  console.log('================================');

  switch (command) {
    case 'create':
    case 'dev':
      console.log('📝 Creating development .env file...');
      createEnvFile(envPath, envTemplate, 'development');
      break;

    case 'prod':
    case 'production':
      console.log('📝 Creating production .env file...');
      createEnvFile(envPath, productionEnvTemplate, 'production');
      break;

    case 'validate':
    case 'check':
      console.log('🔍 Validating .env file...');
      validateEnvFile(envPath);
      break;

    case 'help':
    default:
      console.log('Usage: node setup-env.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  create, dev    Create development .env file');
      console.log('  prod, production Create production .env file');
      console.log('  validate, check Validate existing .env file');
      console.log('  help           Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  node setup-env.js dev');
      console.log('  node setup-env.js production');
      console.log('  node setup-env.js validate');
      break;
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createEnvFile,
  validateEnvFile,
  envTemplate,
  productionEnvTemplate
};
