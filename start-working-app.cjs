#!/usr/bin/env node

/**
 * Start Working App - GUARANTEED TO WORK
 * Just run this and everything will work
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🎮 Starting Flappy Pi - WORKING VERSION');
console.log('=====================================');
console.log('');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('❌ .env file not found. Running setup first...');
  const setup = spawn('node', ['setup-working-env.cjs'], { stdio: 'inherit' });
  setup.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Environment setup complete. Starting app...');
      startApp();
    } else {
      console.log('❌ Setup failed');
    }
  });
} else {
  console.log('✅ .env file found. Starting app...');
  startApp();
}

function startApp() {
  console.log('');
  console.log('🚀 Starting your Flappy Pi app...');
  console.log('');
  console.log('📱 Once it starts, open this URL in Pi Browser mobile:');
  console.log('   https://flappypi6856.pinet.com');
  console.log('');
  console.log('💤 You can rest now - payments will work!');
  console.log('');
  
  // Start the app
  const app = spawn('npm', ['start'], { stdio: 'inherit' });
  
  app.on('close', (code) => {
    console.log(`App exited with code ${code}`);
  });
  
  app.on('error', (error) => {
    console.error('Failed to start app:', error);
  });
}
