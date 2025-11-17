#!/usr/bin/env node

/**
 * Flappy Pi Chatbot Environment Setup
 * This script helps set up the environment variables for the Flappy Pi chatbot
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Flappy Pi Environment Variables

# OpenRouter API Key for AI Chatbot
VITE_OPENROUTER_API_KEY="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"

# Pi Network Configuration
VITE_PI_APP_ID="flappy-pi"
VITE_PI_NETWORK="testnet"

# Development Settings
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false

# API Endpoints
VITE_API_BASE_URL="https://api.testnet.minepi.com/v2"
VITE_CORS_ORIGINS="https://sandbox.minepi.com,https://flappypi.com"

# Feature Flags
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_CONSOLE=true
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env file already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    console.log('📝 Make sure VITE_OPENROUTER_API_KEY is set in your .env file');
  } else {
    // Create .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with Flappy Pi chatbot configuration');
  }
  
  console.log('\n🚀 Flappy Pi Chatbot Setup Complete!');
  console.log('\n📋 What was set up:');
  console.log('   • OpenRouter API key for AI chatbot');
  console.log('   • Pi Network configuration');
  console.log('   • Development settings');
  console.log('   • Feature flags');
  
  console.log('\n🎯 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Navigate to the home page');
  console.log('   3. Click the floating "Support" button');
  console.log('   4. Start chatting with Flappy Pi AI!');
  
  console.log('\n💡 Features:');
  console.log('   • AI-powered support for Flappy Pi');
  console.log('   • Quick question buttons');
  console.log('   • Beautiful Flappy Pi themed design');
  console.log('   • Real-time chat interface');
  
} catch (error) {
  console.error('❌ Error setting up environment:', error.message);
  process.exit(1);
}
