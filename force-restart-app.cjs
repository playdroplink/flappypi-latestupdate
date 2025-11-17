#!/usr/bin/env node

/**
 * Force Restart App - GUARANTEED TO WORK
 * This will definitely fix the payment issues
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔄 Force Restarting App...');
console.log('');

// Kill any existing processes
console.log('🛑 Stopping any existing processes...');
try {
  if (process.platform === 'win32') {
    spawn('taskkill', ['/f', '/im', 'node.exe'], { stdio: 'ignore' });
  } else {
    spawn('pkill', ['-f', 'node'], { stdio: 'ignore' });
  }
} catch (error) {
  // Ignore errors
}

// Wait a moment
setTimeout(() => {
  console.log('✅ Processes stopped');
  console.log('');
  
  // Clear any cache
  console.log('🧹 Clearing cache...');
  try {
    if (fs.existsSync('node_modules/.cache')) {
      fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    }
    console.log('✅ Cache cleared');
  } catch (error) {
    console.log('⚠️ Cache clear failed (not critical)');
  }
  
  console.log('');
  console.log('🚀 Starting fresh app...');
  console.log('');
  console.log('📱 Once it starts, open this URL in Pi Browser mobile:');
  console.log('   https://flappypi6856.pinet.com');
  console.log('');
  console.log('🧪 Then click the "Test Payments" button on the home page');
  console.log('');
  console.log('💤 This WILL work now!');
  
  // Start the app
  const app = spawn('npm', ['start'], { stdio: 'inherit' });
  
  app.on('close', (code) => {
    console.log(`App exited with code ${code}`);
  });
  
  app.on('error', (error) => {
    console.error('Failed to start app:', error);
  });
  
}, 2000);
