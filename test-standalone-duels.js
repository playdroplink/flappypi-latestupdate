#!/usr/bin/env node

/**
 * Test Script for Standalone Duels Page
 * Tests the standalone duels page functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Standalone Duels Page...\n');

// Test 1: Check if StandaloneDuelsPage.tsx exists
console.log('1. Checking StandaloneDuelsPage.tsx...');
const standaloneDuelsPath = path.join(__dirname, 'src', 'pages', 'StandaloneDuelsPage.tsx');
if (fs.existsSync(standaloneDuelsPath)) {
  console.log('   ✅ StandaloneDuelsPage.tsx exists');
} else {
  console.log('   ❌ StandaloneDuelsPage.tsx not found');
  process.exit(1);
}

// Test 2: Check if HomePage.tsx has been updated
console.log('\n2. Checking HomePage.tsx updates...');
const homePagePath = path.join(__dirname, 'src', 'pages', 'HomePage.tsx');
if (fs.existsSync(homePagePath)) {
  const homePageContent = fs.readFileSync(homePagePath, 'utf8');
  
  if (homePageContent.includes('StandaloneDuelsPage')) {
    console.log('   ✅ StandaloneDuelsPage import found');
  } else {
    console.log('   ❌ StandaloneDuelsPage import not found');
  }
  
  if (homePageContent.includes('showStandaloneDuelsPage')) {
    console.log('   ✅ showStandaloneDuelsPage state found');
  } else {
    console.log('   ❌ showStandaloneDuelsPage state not found');
  }
  
  if (homePageContent.includes('handleStandaloneDuelsClick')) {
    console.log('   ✅ handleStandaloneDuelsClick handler found');
  } else {
    console.log('   ❌ handleStandaloneDuelsClick handler not found');
  }
  
  if (homePageContent.includes('Classic Shadow Duels')) {
    console.log('   ✅ Classic Shadow Duels button found');
  } else {
    console.log('   ❌ Classic Shadow Duels button not found');
  }
} else {
  console.log('   ❌ HomePage.tsx not found');
}

// Test 3: Check if RealTimeDuelsGame.tsx has classic game mechanics
console.log('\n3. Checking RealTimeDuelsGame.tsx classic mechanics...');
const realTimeDuelsPath = path.join(__dirname, 'src', 'components', 'duels', 'RealTimeDuelsGame.tsx');
if (fs.existsSync(realTimeDuelsPath)) {
  const realTimeDuelsContent = fs.readFileSync(realTimeDuelsPath, 'utf8');
  
  if (realTimeDuelsContent.includes('BIRD_WIDTH = 64')) {
    console.log('   ✅ Classic bird width constant found');
  } else {
    console.log('   ❌ Classic bird width constant not found');
  }
  
  if (realTimeDuelsContent.includes('GRAVITY = 0.5')) {
    console.log('   ✅ Classic gravity constant found');
  } else {
    console.log('   ❌ Classic gravity constant not found');
  }
  
  if (realTimeDuelsContent.includes('FLAP_STRENGTH = -8')) {
    console.log('   ✅ Classic flap strength constant found');
  } else {
    console.log('   ❌ Classic flap strength constant not found');
  }
  
  if (realTimeDuelsContent.includes('requestAnimationFrame')) {
    console.log('   ✅ Classic game loop with requestAnimationFrame found');
  } else {
    console.log('   ❌ Classic game loop not found');
  }
  
  if (realTimeDuelsContent.includes('useSoundEffects')) {
    console.log('   ✅ Sound effects integration found');
  } else {
    console.log('   ❌ Sound effects integration not found');
  }
  
  if (realTimeDuelsContent.includes('Shadow/Ghost')) {
    console.log('   ✅ Shadow player rendering found');
  } else {
    console.log('   ❌ Shadow player rendering not found');
  }
} else {
  console.log('   ❌ RealTimeDuelsGame.tsx not found');
}

// Test 4: Check if duels server exists
console.log('\n4. Checking duels server...');
const serverPath = path.join(__dirname, 'duels-server', 'server-combined.js');
if (fs.existsSync(serverPath)) {
  console.log('   ✅ Combined duels server exists');
} else {
  console.log('   ❌ Combined duels server not found');
}

// Test 5: Check if start scripts exist
console.log('\n5. Checking start scripts...');
const startBatPath = path.join(__dirname, 'duels-server', 'start-combined.bat');
const startShPath = path.join(__dirname, 'duels-server', 'start-combined.sh');

if (fs.existsSync(startBatPath)) {
  console.log('   ✅ Windows start script exists');
} else {
  console.log('   ❌ Windows start script not found');
}

if (fs.existsSync(startShPath)) {
  console.log('   ✅ Linux/Mac start script exists');
} else {
  console.log('   ❌ Linux/Mac start script not found');
}

// Test 6: Check if TestDuelsPage.tsx has shadow effects
console.log('\n6. Checking TestDuelsPage.tsx shadow effects...');
const testDuelsPath = path.join(__dirname, 'src', 'pages', 'TestDuelsPage.tsx');
if (fs.existsSync(testDuelsPath)) {
  const testDuelsContent = fs.readFileSync(testDuelsPath, 'utf8');
  
  if (testDuelsContent.includes('ShadowPlayer')) {
    console.log('   ✅ Shadow player in test demo found');
  } else {
    console.log('   ❌ Shadow player in test demo not found');
  }
  
  if (testDuelsContent.includes('blur(1px)')) {
    console.log('   ✅ Shadow blur effect found');
  } else {
    console.log('   ❌ Shadow blur effect not found');
  }
  
  if (testDuelsContent.includes('opacity: 0.8')) {
    console.log('   ✅ Shadow opacity effect found');
  } else {
    console.log('   ❌ Shadow opacity effect not found');
  }
} else {
  console.log('   ❌ TestDuelsPage.tsx not found');
}

console.log('\n🎯 Testing Complete!');
console.log('\n📋 How to Test:');
console.log('1. Start the server: cd duels-server && node server-combined.js');
console.log('2. Open the app in browser');
console.log('3. Click "🎮 Classic Shadow Duels" button');
console.log('4. Enter your name and start playing');
console.log('5. Test the classic game mechanics with shadow player visibility');
console.log('\n✨ Features to Test:');
console.log('- Classic bird physics (gravity, flap strength)');
console.log('- Pipe collision detection');
console.log('- Shadow player rendering');
console.log('- Username display above birds');
console.log('- Sound effects integration');
console.log('- Real-time multiplayer synchronization');
