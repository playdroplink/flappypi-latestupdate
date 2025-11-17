#!/usr/bin/env node

/**
 * Start App Simple - No npm required
 * This will start the app using the package.json scripts
 */

const { exec } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Flappy Pi App (Simple Method)');
console.log('==========================================');
console.log('');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.log('❌ package.json not found');
  console.log('💡 Make sure you are in the correct directory');
  process.exit(1);
}

console.log('✅ package.json found');
console.log('');

// Try different ways to start the app
const startMethods = [
  'npm start',
  'yarn start', 
  'npx react-scripts start',
  'node node_modules/.bin/react-scripts start'
];

let methodIndex = 0;

const tryStartMethod = () => {
  if (methodIndex >= startMethods.length) {
    console.log('❌ All start methods failed');
    console.log('');
    console.log('💡 Manual start instructions:');
    console.log('   1. Open terminal in this directory');
    console.log('   2. Run: npm install (if not done)');
    console.log('   3. Run: npm start');
    console.log('   4. Open: https://flappypi6856.pinet.com/test in Pi Browser');
    return;
  }
  
  const method = startMethods[methodIndex];
  console.log(`🔄 Trying: ${method}`);
  
  exec(method, (error, stdout, stderr) => {
    if (error) {
      console.log(`❌ ${method} failed: ${error.message}`);
      methodIndex++;
      setTimeout(tryStartMethod, 1000);
    } else {
      console.log(`✅ ${method} started successfully`);
      console.log('');
      console.log('📱 Open this URL in Pi Browser mobile:');
      console.log('   https://flappypi6856.pinet.com/test');
      console.log('');
      console.log('🧪 Then use the console log copy button to debug payments!');
    }
  });
};

// Start trying methods
tryStartMethod();
