#!/usr/bin/env node

/**
 * =============================================
 * UNIFIED LEADERBOARD SYSTEM API TEST
 * =============================================
 * Test script for verifying the updated backend API 
 * supports the new unified leaderboard data structure
 */

const axios = require('axios');

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

console.log('🎯 Starting Unified Leaderboard System API Tests...\n');

// Test data for different game modes
const testScores = [
  {
    name: 'Classic Mode Test',
    data: {
      username: 'test_player_classic',
      score: 150,
      gameMode: 'classic',
      characterUsed: 'flappy',
      difficulty: 'normal',
      gameDuration: 45,
      coinsCollected: 12,
      powerUpsUsed: ['double-coins', 'shield'],
      // Classic mode specific data
      pipes_passed: 15,
      max_height: 8,
      difficulty_multiplier: 1.2,
      streak_bonus: 50,
      perfect_passes: 3,
      game_data: {
        pipes_passed: 15,
        max_height: 8,
        difficulty_multiplier: 1.2,
        streak_bonus: 50,
        perfect_passes: 3
      }
    }
  },
  {
    name: 'ScreamPi Mode Test',
    data: {
      username: 'test_player_screampi',
      score: 89,
      gameMode: 'screampi',
      characterUsed: 'screampi',
      difficulty: 'hard',
      gameDuration: 32,
      coinsCollected: 8,
      powerUpsUsed: ['voice-boost'],
      // ScreamPi mode specific data
      scream_inputs: 45,
      tap_inputs: 12,
      voice_sensitivity: 0.8,
      audio_quality: 'high',
      input_method: 'voice',
      game_data: {
        scream_inputs: 45,
        tap_inputs: 12,
        voice_sensitivity: 0.8,
        audio_quality: 'high',
        input_method: 'voice'
      }
    }
  },
  {
    name: 'DinoPi Mode Test',
    data: {
      username: 'test_player_dinopi',
      score: 230,
      gameMode: 'dinopi',
      characterUsed: 'dinopi',
      difficulty: 'expert',
      gameDuration: 78,
      coinsCollected: 25,
      powerUpsUsed: ['jump-boost', 'speed-up'],
      // DinoPi mode specific data
      obstacles_jumped: 23,
      distance_traveled: 1250,
      power_ups_collected: 5,
      jump_accuracy: 0.92,
      speed_bonus: 150,
      game_data: {
        obstacles_jumped: 23,
        distance_traveled: 1250,
        power_ups_collected: 5,
        jump_accuracy: 0.92,
        speed_bonus: 150
      }
    }
  },
  {
    name: 'Challenge Mode Test',
    data: {
      username: 'test_player_challenge',
      score: 345,
      gameMode: 'challenge',
      characterUsed: 'flappy',
      difficulty: 'expert',
      gameDuration: 120,
      coinsCollected: 35,
      powerUpsUsed: ['multi-jump', 'time-slow'],
      // Challenge mode specific data
      challenge_type: 'time_trial',
      obstacles_avoided: 34,
      time_limit: 120,
      special_conditions: ['no_power_ups', 'double_speed'],
      completion_bonus: 200,
      game_data: {
        challenge_type: 'time_trial',
        obstacles_avoided: 34,
        time_limit: 120,
        special_conditions: ['no_power_ups', 'double_speed'],
        completion_bonus: 200
      }
    }
  }
];

async function testSubmitScore(testData) {
  try {
    console.log(`📝 Testing ${testData.name}...`);
    
    const response = await axios.post(`${BASE_URL}/api/leaderboard/submit`, testData.data);
    
    if (response.status === 200) {
      console.log(`✅ ${testData.name} submitted successfully`);
      console.log(`   Score ID: ${response.data.scoreId}`);
      console.log(`   Rank: ${response.data.rank || 'N/A'}`);
      console.log(`   Is Pi User: ${response.data.isPiUser}\n`);
      return response.data;
    } else {
      console.log(`❌ ${testData.name} failed with status: ${response.status}\n`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${testData.name} failed:`, error.response?.data?.error || error.message);
    console.log(`   Status: ${error.response?.status || 'Network Error'}\n`);
    return null;
  }
}

async function testGetLeaderboard(gameMode) {
  try {
    console.log(`📊 Testing leaderboard retrieval for ${gameMode} mode...`);
    
    const response = await axios.get(`${BASE_URL}/api/leaderboard?gameMode=${gameMode}&limit=10`);
    
    if (response.status === 200) {
      const leaderboard = response.data.leaderboard || [];
      console.log(`✅ ${gameMode} leaderboard retrieved successfully`);
      console.log(`   Total entries: ${leaderboard.length}`);
      
      if (leaderboard.length > 0) {
        const topEntry = leaderboard[0];
        console.log(`   Top entry: ${topEntry.username} with score ${topEntry.score}`);
        console.log(`   Has game_data: ${topEntry.game_data ? 'Yes' : 'No'}`);
        if (topEntry.game_data) {
          console.log(`   Game data keys: ${Object.keys(topEntry.game_data).join(', ')}`);
        }
      }
      console.log();
      return response.data;
    } else {
      console.log(`❌ ${gameMode} leaderboard retrieval failed with status: ${response.status}\n`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${gameMode} leaderboard retrieval failed:`, error.response?.data?.error || error.message);
    console.log(`   Status: ${error.response?.status || 'Network Error'}\n`);
    return null;
  }
}

async function testUserStats(piUserId) {
  try {
    console.log(`📈 Testing user stats retrieval for ${piUserId}...`);
    
    const response = await axios.get(`${BASE_URL}/api/leaderboard/user-stats/${piUserId}`);
    
    if (response.status === 200) {
      console.log(`✅ User stats retrieved successfully`);
      console.log(`   Recent games: ${response.data.recentGames?.length || 0}`);
      console.log(`   Best scores: ${response.data.bestScores?.length || 0}`);
      console.log(`   Achievements: ${response.data.achievements?.length || 0}\n`);
      return response.data;
    } else {
      console.log(`❌ User stats retrieval failed with status: ${response.status}\n`);
      return null;
    }
  } catch (error) {
    console.log(`❌ User stats retrieval failed:`, error.response?.data?.error || error.message);
    console.log(`   Status: ${error.response?.status || 'Network Error'}\n`);
    return null;
  }
}

async function runAllTests() {
  let successCount = 0;
  let totalTests = 0;

  console.log('🚀 Starting API tests...\n');

  // Test score submissions for all game modes
  console.log('=== SCORE SUBMISSION TESTS ===\n');
  for (const testData of testScores) {
    totalTests++;
    const result = await testSubmitScore(testData);
    if (result) successCount++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test leaderboard retrieval for all game modes
  console.log('\n=== LEADERBOARD RETRIEVAL TESTS ===\n');
  const gameModes = ['classic', 'screampi', 'dinopi', 'challenge'];
  for (const gameMode of gameModes) {
    totalTests++;
    const result = await testGetLeaderboard(gameMode);
    if (result) successCount++;
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test user stats retrieval
  console.log('=== USER STATS TESTS ===\n');
  totalTests++;
  const userStatsResult = await testUserStats('test_user_123');
  if (userStatsResult) successCount++;

  // Summary
  console.log('=== TEST SUMMARY ===');
  console.log(`✅ Successful tests: ${successCount}/${totalTests}`);
  console.log(`❌ Failed tests: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 All tests passed! Unified leaderboard system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);