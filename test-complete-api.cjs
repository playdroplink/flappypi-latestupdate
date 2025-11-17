#!/usr/bin/env node

/**
 * =============================================
 * FLAPPY PI API TESTING SUITE
 * =============================================
 * Comprehensive test suite for all API endpoints
 * Tests the complete backend functionality
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_USER_ID = `test_user_${Date.now()}`;
const TEST_USERNAME = 'api_test_user';

console.log('🧪 FLAPPY PI - COMPREHENSIVE API TESTING');
console.log('========================================\n');
console.log(`🌐 Testing API at: ${API_BASE_URL}`);
console.log(`👤 Test User ID: ${TEST_USER_ID}`);
console.log(`📝 Test Username: ${TEST_USERNAME}\n`);

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

async function testAPI(description, testFunction) {
  testResults.total++;
  try {
    console.log(`🔧 Testing: ${description}...`);
    const result = await testFunction();
    if (result === true) {
      console.log(`   ✅ PASSED`);
      testResults.passed++;
    } else {
      console.log(`   ❌ FAILED: ${result || 'Unknown error'}`);
      testResults.failed++;
      testResults.errors.push({ test: description, error: result });
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: description, error: error.message });
  }
  console.log('');
}

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Pi-User-ID': TEST_USER_ID,
        'X-Pi-Username': TEST_USERNAME
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new Error(`API Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
  }
}

// Test Cases

async function testHealthEndpoint() {
  try {
    const response = await apiRequest('GET', '/health');
    return response.status === 'ok';
  } catch (error) {
    return error.message;
  }
}

async function testUserProfileCreate() {
  try {
    const profileData = {
      username: TEST_USERNAME,
      wallet_address: '0x1234567890123456789012345678901234567890',
      total_coins: 100,
      high_score: 500
    };
    
    const response = await apiRequest('POST', '/api/user/profile', profileData);
    return response.success === true && response.data.pi_user_id === TEST_USER_ID;
  } catch (error) {
    return error.message;
  }
}

async function testUserProfileGet() {
  try {
    const response = await apiRequest('GET', '/api/user/profile');
    return response.success === true && response.data.username === TEST_USERNAME;
  } catch (error) {
    return error.message;
  }
}

async function testUserProfileUpdate() {
  try {
    const updateData = {
      total_coins: 200,
      high_score: 750
    };
    
    const response = await apiRequest('PUT', '/api/user/profile', updateData);
    return response.success === true && response.data.total_coins === 200;
  } catch (error) {
    return error.message;
  }
}

async function testInventoryAdd() {
  try {
    const itemData = {
      item_type: 'powerup',
      item_id: 'test_powerup_001',
      item_name: 'Test Super Speed',
      quantity: 3,
      metadata: { duration: 30, effect: 'speed_boost' }
    };
    
    const response = await apiRequest('POST', '/api/inventory/add', itemData);
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testInventoryGet() {
  try {
    const response = await apiRequest('GET', '/api/inventory');
    return response.success === true && Array.isArray(response.data);
  } catch (error) {
    return error.message;
  }
}

async function testPaymentCreate() {
  try {
    const paymentData = {
      payment_id: `test_payment_${Date.now()}`,
      amount: 2.5,
      currency: 'PI',
      item_name: 'Test Premium Skin',
      item_type: 'cosmetic'
    };
    
    const response = await apiRequest('POST', '/api/payments/create', paymentData);
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testPaymentHistory() {
  try {
    const response = await apiRequest('GET', '/api/payments/history');
    return response.success === true && Array.isArray(response.data);
  } catch (error) {
    return error.message;
  }
}

async function testGameSessionCreate() {
  try {
    const sessionData = {
      game_mode: 'classic',
      final_score: 1250,
      level_reached: 15,
      coins_earned: 85,
      power_ups_used: ['speed_boost', 'coin_magnet'],
      obstacles_hit: 3,
      perfect_landings: 12
    };
    
    const response = await apiRequest('POST', '/api/game/session', sessionData);
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testLeaderboardGet() {
  try {
    const response = await apiRequest('GET', '/api/leaderboard?game_mode=classic&limit=10');
    return response.success === true && Array.isArray(response.data);
  } catch (error) {
    return error.message;
  }
}

async function testLeaderboardSubmit() {
  try {
    const scoreData = {
      score: 1250,
      game_mode: 'classic'
    };
    
    const response = await apiRequest('POST', '/api/leaderboard/submit', scoreData);
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testShopItemsGet() {
  try {
    const response = await apiRequest('GET', '/api/shop/items');
    return response.success === true && Array.isArray(response.data);
  } catch (error) {
    return error.message;
  }
}

async function testShopPurchase() {
  try {
    const purchaseData = {
      item_id: 'premium_skin_001',
      payment_method: 'coins'
    };
    
    const response = await apiRequest('POST', '/api/shop/purchase', purchaseData);
    return response.success === true || response.error === 'Item not found'; // Expected if no shop items exist
  } catch (error) {
    return error.message;
  }
}

async function testDailyRewardsClaim() {
  try {
    const response = await apiRequest('POST', '/api/rewards/daily-claim');
    return response.success === true || response.error === 'Already claimed today';
  } catch (error) {
    return error.message;
  }
}

async function testDailyRewardsStatus() {
  try {
    const response = await apiRequest('GET', '/api/rewards/daily-status');
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testAnalyticsEvent() {
  try {
    const eventData = {
      event_type: 'game_start',
      event_data: {
        game_mode: 'classic',
        device_type: 'desktop',
        browser: 'chrome'
      }
    };
    
    const response = await apiRequest('POST', '/api/analytics/event', eventData);
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testAdWatchRecord() {
  try {
    const adData = {
      ad_type: 'rewarded',
      reward_coins: 50,
      ad_network: 'pi_ad_network'
    };
    
    const response = await apiRequest('POST', '/api/ads/watch', adData);
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testUserStats() {
  try {
    const response = await apiRequest('GET', '/api/user/stats');
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function testLeaderboardUnified() {
  try {
    const response = await apiRequest('GET', '/api/leaderboard/unified?limit=20');
    return response.success === true && Array.isArray(response.data);
  } catch (error) {
    return error.message;
  }
}

async function testAchievementsGet() {
  try {
    const response = await apiRequest('GET', '/api/achievements');
    return response.success === true && Array.isArray(response.data);
  } catch (error) {
    return error.message;
  }
}

async function testAchievementUnlock() {
  try {
    const achievementData = {
      achievement_id: 'first_flight',
      achievement_name: 'First Flight',
      points_awarded: 100
    };
    
    const response = await apiRequest('POST', '/api/achievements/unlock', achievementData);
    return response.success === true;
  } catch (error) {
    return error.message;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive API testing...\n');
  
  // Basic Health Check
  await testAPI('Health Endpoint', testHealthEndpoint);
  
  // User Management Tests
  console.log('👤 User Management Tests');
  console.log('========================');
  await testAPI('Create User Profile', testUserProfileCreate);
  await testAPI('Get User Profile', testUserProfileGet);
  await testAPI('Update User Profile', testUserProfileUpdate);
  await testAPI('Get User Stats', testUserStats);
  
  // Inventory Tests
  console.log('📦 Inventory Tests');
  console.log('==================');
  await testAPI('Add Inventory Item', testInventoryAdd);
  await testAPI('Get User Inventory', testInventoryGet);
  
  // Payment Tests
  console.log('💳 Payment Tests');
  console.log('=================');
  await testAPI('Create Payment Record', testPaymentCreate);
  await testAPI('Get Payment History', testPaymentHistory);
  
  // Game Session Tests
  console.log('🎮 Game Session Tests');
  console.log('======================');
  await testAPI('Create Game Session', testGameSessionCreate);
  
  // Leaderboard Tests
  console.log('🏆 Leaderboard Tests');
  console.log('====================');
  await testAPI('Submit Leaderboard Score', testLeaderboardSubmit);
  await testAPI('Get Leaderboard', testLeaderboardGet);
  await testAPI('Get Unified Leaderboard', testLeaderboardUnified);
  
  // Shop Tests
  console.log('🛍️  Shop Tests');
  console.log('===============');
  await testAPI('Get Shop Items', testShopItemsGet);
  await testAPI('Shop Purchase', testShopPurchase);
  
  // Rewards Tests
  console.log('🎁 Rewards Tests');
  console.log('================');
  await testAPI('Daily Rewards Status', testDailyRewardsStatus);
  await testAPI('Claim Daily Reward', testDailyRewardsClaim);
  
  // Achievement Tests
  console.log('🏅 Achievement Tests');
  console.log('====================');
  await testAPI('Get Achievements', testAchievementsGet);
  await testAPI('Unlock Achievement', testAchievementUnlock);
  
  // Analytics Tests
  console.log('📊 Analytics Tests');
  console.log('==================');
  await testAPI('Record Analytics Event', testAnalyticsEvent);
  await testAPI('Record Ad Watch', testAdWatchRecord);
  
  // Final Results
  console.log('📋 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    console.log('================');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}`);
      console.log(`   Error: ${error.error}`);
    });
  }
  
  console.log('\n🎯 API Testing Complete!');
  
  if (testResults.passed >= testResults.total * 0.8) {
    console.log('✅ Your API is ready for production! 🚀');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
  
  return testResults.passed >= testResults.total * 0.8;
}

// Run the tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error during testing:', error);
    process.exit(1);
  });