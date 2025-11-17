#!/usr/bin/env node

/**
 * Flappy Pi - Official Pi Demo Environment Setup
 * Following the exact structure from the official Pi demo repository
 */

const fs = require('fs');
const path = require('path');

const envContent = `# WARNING: Commenting after a variable's value DOES NOT WORK in .env files.
# In other words, don't to this: \`FOO=value # this is a comment\`.
# This would give the value "value # this is a comment" to the FOO variable.
# You need to use single-line comments instead, e.g:
# \`\`\`
#   # this is a comment:
#   FOO=value
# \`\`\`

#
#
#

# Frontend app URL and bare domain name:
FRONTEND_URL=http://localhost:3000
FRONTEND_DOMAIN_NAME=localhost:3000

# Backend app URL and bare domain name:
BACKEND_URL=http://localhost:3000
BACKEND_DOMAIN_NAME=localhost:3000

# Obtain the following 2 values on the Pi Developer Portal (open develop.pi in the Pi Browser).

# Domain validation key:
DOMAIN_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156
# Pi Platform API Key:
PI_API_KEY=yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu

# Generate a random string, or roll your face on the keyboard to fill this value:
SESSION_SECRET=flappypi_demo_secret_2025

# MongoDB database connection details (using Supabase instead):
MONGODB_DATABASE_NAME=flappypi
MONGODB_USERNAME=postgres
MONGODB_PASSWORD=jtrriobt4G7Sr5VG

# This will be prepended to all container names.
# Changing this will make docker-compose lose track of all your containers.
# Run \`docker-compose down\` before changing it.
COMPOSE_PROJECT_NAME=flappy-pi-demo

# Set this to either "development" or "production" (XXX "staging"?):
ENVIRONMENT=development

# This directory will be used to store all persistent data needed by Docker (using volumes):
DATA_DIRECTORY=./docker-data

# URL of the Pi Platform API - you should not need to change this.
PLATFORM_API_URL=https://api.sandbox.minepi.com

# Additional Pi Network Configuration for Flappy Pi
PI_APP_ID=flappypi2807
PI_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156

# Supabase Configuration
SUPABASE_URL=https://ididprksbmbhigcxcxvt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ

# React App Environment Variables
REACT_APP_PI_NETWORK_MODE=testnet
REACT_APP_PI_NETWORK_SANDBOX=false
REACT_APP_PI_NETWORK_PRODUCTION=false
REACT_APP_PI_API_URL=https://api.sandbox.minepi.com/v2
REACT_APP_PI_APP_ID=flappypi2807
REACT_APP_PI_API_KEY=yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu
REACT_APP_PI_VALIDATION_KEY=312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156
REACT_APP_PI_SDK_SANDBOX=false
REACT_APP_PI_SDK_VERSION=2.0`;

function setupPiDemoEnvironment() {
  console.log('🚀 Setting up Flappy Pi - Official Pi Demo Environment...');
  console.log('================================================');

  const envPath = path.join(process.cwd(), '.env');
  
  // Check if .env file exists
  if (fs.existsSync(envPath)) {
    console.log('📁 Found existing .env file');
    
    // Create backup
    const backupPath = path.join(process.cwd(), '.env.pi-demo.backup');
    fs.copyFileSync(envPath, backupPath);
    console.log('💾 Created backup: .env.pi-demo.backup');
  }

  // Write new .env file following official Pi demo structure
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file following official Pi demo structure');

  console.log('================================================');
  console.log('🎉 PI DEMO ENVIRONMENT SETUP COMPLETE!');
  console.log('================================================');
  console.log('✅ Frontend URL: http://localhost:3000');
  console.log('✅ Backend URL: http://localhost:3000');
  console.log('✅ Pi API Key: yajl7wvy9a5xnxss1iaououlvsk2rwcc9tsgxoiakgzetrbwaiktnqzzqtuoyqyu');
  console.log('✅ Domain Validation Key: 312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156');
  console.log('✅ Platform API URL: https://api.sandbox.minepi.com');
  console.log('✅ Environment: development');
  console.log('✅ Project Name: flappy-pi-demo');
  console.log('================================================');

  console.log('📋 Next Steps:');
  console.log('1. Start your development server: npm start');
  console.log('2. Navigate to http://localhost:3000/pi-demo');
  console.log('3. Test Pi Auth and Pi Payment following official demo patterns');
  console.log('4. Use Pi Browser for full functionality');

  console.log('🔧 To test the demo, run:');
  console.log('npm start');
  console.log('Then visit: http://localhost:3000/pi-demo');

  console.log('🚀 Flappy Pi is now configured following official Pi demo structure!');
}

setupPiDemoEnvironment();
