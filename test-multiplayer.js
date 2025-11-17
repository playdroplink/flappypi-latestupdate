#!/usr/bin/env node

/**
 * Flappy Pi Multiplayer Test Suite
 * Tests the duels server and multiplayer functionality
 */

import http from 'http';
import { io } from 'socket.io-client';

console.log('🦅 Flappy Pi Multiplayer Test Suite');
console.log('===================================');
console.log('');

// Test configuration
const SERVER_URL = 'http://localhost:3009';
const HEALTH_ENDPOINT = `${SERVER_URL}/health`;

// Test functions
async function testServerHealth() {
  console.log('🔍 Testing Server Health...');
  
  return new Promise((resolve) => {
    const req = http.get(HEALTH_ENDPOINT, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Server is healthy');
          console.log(`   📊 Response: ${data}`);
          resolve(true);
        } else {
          console.log(`   ❌ Server returned status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Server connection failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('   ❌ Server health check timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function testSocketConnection() {
  console.log('🔌 Testing Socket.IO Connection...');
  
  return new Promise((resolve) => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });
    
    let connected = false;
    
    socket.on('connect', () => {
      if (!connected) {
        connected = true;
        console.log('   ✅ Socket.IO connection successful');
        console.log(`   🆔 Socket ID: ${socket.id}`);
        socket.disconnect();
        resolve(true);
      }
    });
    
    socket.on('connect_error', (err) => {
      if (!connected) {
        console.log(`   ❌ Socket.IO connection failed: ${err.message}`);
        resolve(false);
      }
    });
    
    socket.on('disconnect', () => {
      if (connected) {
        console.log('   ✅ Socket.IO disconnection successful');
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!connected) {
        console.log('   ❌ Socket.IO connection timeout');
        socket.disconnect();
        resolve(false);
      }
    }, 10000);
  });
}

async function testGameRoomCreation() {
  console.log('🎮 Testing Game Room Creation...');
  
  return new Promise((resolve) => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });
    
    let testPassed = false;
    
    socket.on('connect', () => {
      console.log('   ✅ Connected to server for room test');
      
      // Test room creation
      socket.emit('createRoom', {
        roomName: 'Test Room',
        gameMode: 'classic',
        difficulty: 'normal',
        hostName: 'TestPlayer'
      });
    });
    
    socket.on('roomCreated', (data) => {
      if (!testPassed) {
        testPassed = true;
        console.log('   ✅ Room creation successful');
        console.log(`   🏠 Room ID: ${data.roomId}`);
        console.log(`   👤 Host: ${data.hostName}`);
        socket.disconnect();
        resolve(true);
      }
    });
    
    socket.on('error', (err) => {
      if (!testPassed) {
        console.log(`   ❌ Room creation failed: ${err.message}`);
        socket.disconnect();
        resolve(false);
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!testPassed) {
        console.log('   ❌ Room creation timeout');
        socket.disconnect();
        resolve(false);
      }
    }, 10000);
  });
}

async function testMultiplayerFlow() {
  console.log('👥 Testing Multiplayer Flow...');
  
  return new Promise((resolve) => {
    const player1 = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    const player2 = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    
    let playersConnected = 0;
    let roomCreated = false;
    let roomJoined = false;
    
    player1.on('connect', () => {
      playersConnected++;
      console.log('   ✅ Player 1 connected');
      
      if (playersConnected === 2) {
        // Create room with player 1
        player1.emit('createRoom', {
          roomName: 'Multiplayer Test Room',
          gameMode: 'classic',
          difficulty: 'normal',
          hostName: 'Player1'
        });
      }
    });
    
    player2.on('connect', () => {
      playersConnected++;
      console.log('   ✅ Player 2 connected');
    });
    
    player1.on('roomCreated', (data) => {
      if (!roomCreated) {
        roomCreated = true;
        console.log('   ✅ Room created by Player 1');
        console.log(`   🏠 Room ID: ${data.roomId}`);
        
        // Player 2 joins the room
        player2.emit('joinRoom', { roomId: data.roomId, playerName: 'Player2' });
      }
    });
    
    player2.on('roomJoined', (data) => {
      if (!roomJoined) {
        roomJoined = true;
        console.log('   ✅ Player 2 joined room');
        console.log(`   👥 Players in room: ${data.players.length}`);
        
        // Clean up
        player1.disconnect();
        player2.disconnect();
        resolve(true);
      }
    });
    
    // Timeout after 15 seconds
    setTimeout(() => {
      if (!roomJoined) {
        console.log('   ❌ Multiplayer flow timeout');
        player1.disconnect();
        player2.disconnect();
        resolve(false);
      }
    }, 15000);
  });
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Multiplayer Tests...');
  console.log('');
  
  const tests = [
    { name: 'Server Health', fn: testServerHealth },
    { name: 'Socket Connection', fn: testSocketConnection },
    { name: 'Game Room Creation', fn: testGameRoomCreation },
    { name: 'Multiplayer Flow', fn: testMultiplayerFlow }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Multiplayer is working correctly.');
    console.log('🦅 Flappy Pi Duels Server is ready for multiplayer gaming!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server configuration.');
    console.log('💡 Make sure the duels server is running on port 3001');
  }
  
  console.log('\n💤 Test completed!');
}

// Run the tests
runTests().catch(console.error);
