// Test script for Enhanced PvP Duels
// This script tests the server endpoints and basic functionality

const http = require('http');

const testServer = async () => {
  console.log('🧪 Testing Enhanced PvP Duels Server...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResponse = await fetch('http://localhost:3009/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('   Active Rooms:', healthData.activeRooms);
    console.log('   Connected Players:', healthData.connectedPlayers);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    console.log('   Make sure the server is running: cd duels-server && node server-enhanced.js');
    return;
  }

  // Test 2: Available Rooms
  console.log('\n2. Testing Available Rooms...');
  try {
    const roomsResponse = await fetch('http://localhost:3009/api/rooms');
    const roomsData = await roomsResponse.json();
    console.log('✅ Rooms API:', roomsData.total, 'rooms available');
    console.log('   Active:', roomsData.active);
    console.log('   Waiting:', roomsData.waiting);
  } catch (error) {
    console.log('❌ Rooms API Failed:', error.message);
  }

  // Test 3: Server Statistics
  console.log('\n3. Testing Server Statistics...');
  try {
    const statsResponse = await fetch('http://localhost:3009/api/stats');
    const statsData = await statsResponse.json();
    console.log('✅ Server Stats:');
    console.log('   Uptime:', Math.floor(statsData.server.uptime), 'seconds');
    console.log('   Memory Usage:', statsData.server.memory.heapUsed, 'MB');
    console.log('   Total Rooms:', statsData.game.totalRooms);
    console.log('   Active Players:', statsData.game.activePlayers);
  } catch (error) {
    console.log('❌ Stats API Failed:', error.message);
  }

  console.log('\n🎮 Enhanced PvP Duels Server is ready!');
  console.log('   Open your Flappy Pi game and click "⚔️ Enhanced PvP Duels"');
  console.log('   Create a room and invite friends to play!');
};

// Run the test
testServer().catch(console.error);
