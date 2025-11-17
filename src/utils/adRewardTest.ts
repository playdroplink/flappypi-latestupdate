// Test utility for ad reward system
import { adService } from '@/services/adService';
import { rewardsService } from '@/services/rewardsService';
import { getUserRewardCounts } from '@/utils/rewardUtils';
import { loadWalletBalance } from '@/utils/walletUtils';

export const testAdRewardSystem = async () => {
  console.log('🧪 Testing Ad Reward System...');
  
  const results = {
    adService: false,
    rewardsService: false,
    localStorage: false,
    userData: false,
    overall: false
  };

  try {
    // Test 1: Check if ad service is available
    if (adService && typeof adService.showRewardedAdForReward === 'function') {
      console.log('✅ Ad service is available');
      results.adService = true;
    } else {
      console.log('❌ Ad service is not available');
    }

    // Test 2: Check if rewards service is available
    if (rewardsService && typeof rewardsService.watchAdReward === 'function') {
      console.log('✅ Rewards service is available');
      results.rewardsService = true;
    } else {
      console.log('❌ Rewards service is not available');
    }

    // Test 3: Check localStorage access
    try {
      const testKey = 'flappypi-test';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (testValue === 'test') {
        console.log('✅ localStorage is working');
        results.localStorage = true;
      } else {
        console.log('❌ localStorage is not working');
      }
    } catch (error) {
      console.log('❌ localStorage error:', error);
    }

    // Test 4: Check user data
    const savedPiUser = localStorage.getItem('flappypi-pi-user');
    const savedUsername = localStorage.getItem('flappypi-username');
    
    if (savedPiUser && savedUsername) {
      console.log('✅ User data found in localStorage');
      results.userData = true;
      
      // Test reward utilities
      const username = savedUsername;
      const rewardCounts = getUserRewardCounts(username);
      const walletBalance = loadWalletBalance(username);
      
      console.log('📊 Current reward counts:', rewardCounts);
      console.log('💰 Current wallet balance:', walletBalance);
    } else {
      console.log('❌ User data not found in localStorage');
    }

    // Test 5: Test reward granting (without showing ad)
    if (results.userData) {
      try {
        const username = savedUsername;
        const initialBalance = loadWalletBalance(username);
        
        // Test coin reward
        const coinResult = await rewardsService.watchAdReward('test-user-id', 'coins', 10);
        if (coinResult && coinResult.success) {
          console.log('✅ Coin reward test passed');
        } else {
          console.log('❌ Coin reward test failed');
        }
        
        // Test revive reward
        const reviveResult = await rewardsService.watchAdReward('test-user-id', 'revive', 1);
        if (reviveResult && reviveResult.success) {
          console.log('✅ Revive reward test passed');
        } else {
          console.log('❌ Revive reward test failed');
        }
        
        // Test extra life reward
        const lifeResult = await rewardsService.watchAdReward('test-user-id', 'life', 1);
        if (lifeResult && lifeResult.success) {
          console.log('✅ Extra life reward test passed');
        } else {
          console.log('❌ Extra life reward test failed');
        }
        
        // Test roulette spin reward
        const spinResult = await rewardsService.watchAdReward('test-user-id', 'roulette_spin', 1);
        if (spinResult && spinResult.success) {
          console.log('✅ Roulette spin reward test passed');
        } else {
          console.log('❌ Roulette spin reward test failed');
        }
        
      } catch (error) {
        console.log('❌ Reward test error:', error);
      }
    }

    // Overall result
    results.overall = results.adService && results.rewardsService && results.localStorage;
    
    console.log('📋 Test Results:', results);
    
    if (results.overall) {
      console.log('🎉 Ad reward system is working correctly!');
    } else {
      console.log('⚠️ Ad reward system has issues');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return results;
  }
};

export const simulateAdReward = async (rewardType: 'revive' | 'coins' | 'extra_life' | 'roulette_spin', gameMode: string = 'classic') => {
  console.log(`🎮 Simulating ad reward: ${rewardType} in ${gameMode} mode`);
  
  try {
    const result = await adService.showRewardedAdForReward(rewardType, gameMode);
    
    if (result.success) {
      console.log(`✅ Simulated reward granted: ${result.reward_amount} ${result.reward_type}`);
      
      // Show current reward counts
      const savedUsername = localStorage.getItem('flappypi-username');
      if (savedUsername) {
        const rewardCounts = getUserRewardCounts(savedUsername);
        console.log('📊 Updated reward counts:', rewardCounts);
      }
      
      return result;
    } else {
      console.log(`❌ Simulated reward failed: ${result.description}`);
      return result;
    }
  } catch (error) {
    console.error('❌ Simulation error:', error);
    return { success: false, reward_amount: 0, description: 'Simulation failed' };
  }
};

export const checkRewardStatus = () => {
  const savedUsername = localStorage.getItem('flappypi-username');
  if (!savedUsername) {
    console.log('❌ No username found');
    return null;
  }
  
  const rewardCounts = getUserRewardCounts(savedUsername);
  const walletBalance = loadWalletBalance(savedUsername);
  
  console.log('📊 Current Reward Status:');
  console.log(`💰 Wallet Balance: ${walletBalance} coins`);
  console.log(`🔄 Revives: ${rewardCounts.revives}`);
  console.log(`❤️ Extra Lives: ${rewardCounts.extraLives}`);
  console.log(`🎰 Roulette Spins: ${rewardCounts.rouletteSpins}`);
  
  return {
    walletBalance,
    ...rewardCounts
  };
};
