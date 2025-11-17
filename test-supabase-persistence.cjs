// ========================================
// SUPABASE DATA PERSISTENCE TEST SCRIPT
// ========================================
// This script tests the complete data persistence flow after fixes

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://feiifpwfbfjrjpcvjdfz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testUserId = 'test-user-' + Date.now();
const testUsername = 'TestUser' + Date.now();

const testInventoryData = [
  {
    id: 'item-1',
    name: 'Speed Boost',
    type: 'powerup',
    quantity: 3,
    purchasedAt: new Date().toISOString(),
    description: 'Increases bird speed'
  },
  {
    id: 'item-2', 
    name: 'Coin Magnet',
    type: 'powerup',
    quantity: 2,
    purchasedAt: new Date().toISOString(),
    description: 'Attracts coins automatically'
  },
  {
    id: 'premium-skin-1',
    name: 'Golden Bird',
    type: 'skin',
    quantity: 1,
    purchasedAt: new Date().toISOString(),
    description: 'Premium golden bird skin',
    rarity: 'Legendary',
    equipped: true
  }
];

const testWalletBalance = 1250;

// ========================================
// TEST FUNCTIONS
// ========================================

async function testDatabaseTables() {
  console.log('\n🔍 Testing database tables...');
  
  try {
    // Test user_inventory_sync table
    const { data: syncData, error: syncError } = await supabase
      .from('user_inventory_sync')
      .select('*')
      .limit(1);
      
    if (syncError) {
      console.error('❌ user_inventory_sync table error:', syncError);
      return false;
    }
    
    console.log('✅ user_inventory_sync table exists');
    
    // Test user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
      
    if (profileError) {
      console.error('❌ user_profiles table error:', profileError);
      return false;
    }
    
    console.log('✅ user_profiles table exists');
    
    return true;
  } catch (error) {
    console.error('❌ Database table test failed:', error);
    return false;
  }
}

async function testInventorySync() {
  console.log('\n💾 Testing inventory sync...');
  
  try {
    // Test sync function
    const { data, error } = await supabase
      .rpc('sync_user_inventory', {
        user_id: testUserId,
        inventory_json: testInventoryData,
        wallet_balance: testWalletBalance
      });
    
    if (error) {
      console.error('❌ Inventory sync failed:', error);
      return false;
    }
    
    console.log('✅ Inventory sync successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Inventory sync test failed:', error);
    return false;
  }
}

async function testInventoryLoad() {
  console.log('\n📥 Testing inventory load...');
  
  try {
    // Test load function
    const { data, error } = await supabase
      .rpc('load_user_inventory', {
        user_id: testUserId
      });
    
    if (error) {
      console.error('❌ Inventory load failed:', error);
      return false;
    }
    
    console.log('✅ Inventory load successful:', data);
    
    // Verify data integrity
    if (data.success && data.items && data.items.length === testInventoryData.length) {
      console.log('✅ Inventory data integrity verified');
      console.log('✅ Wallet balance matches:', data.wallet_balance === testWalletBalance);
      return true;
    } else {
      console.error('❌ Inventory data mismatch');
      return false;
    }
  } catch (error) {
    console.error('❌ Inventory load test failed:', error);
    return false;
  }
}

async function testDirectTableAccess() {
  console.log('\n🔧 Testing direct table access...');
  
  try {
    // Test direct read from user_inventory_sync
    const { data, error } = await supabase
      .from('user_inventory_sync')
      .select('*')
      .eq('pi_user_id', testUserId)
      .single();
    
    if (error) {
      console.error('❌ Direct table access failed:', error);
      return false;
    }
    
    console.log('✅ Direct table access successful');
    console.log('📊 Stored data:', {
      itemCount: data.items?.length || 0,
      walletBalance: data.wallet_balance,
      lastSync: data.last_sync_time,
      syncStatus: data.sync_status
    });
    
    return true;
  } catch (error) {
    console.error('❌ Direct table access test failed:', error);
    return false;
  }
}

async function testUserProfileIntegration() {
  console.log('\n👤 Testing user profile integration...');
  
  try {
    // Test upsert user profile function
    const { data, error } = await supabase
      .rpc('upsert_user_profile', {
        user_uid: testUserId,
        user_pi_user_id: testUserId,
        user_username: testUsername,
        user_total_coins: testWalletBalance
      });
    
    if (error) {
      console.error('❌ User profile upsert failed:', error);
      return false;
    }
    
    console.log('✅ User profile upsert successful:', data);
    
    // Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .rpc('find_user_profile', {
        user_identifier: testUserId
      });
    
    if (profileError || !profile || profile.length === 0) {
      console.error('❌ User profile not found after upsert:', profileError);
      return false;
    }
    
    console.log('✅ User profile found and verified');
    return true;
  } catch (error) {
    console.error('❌ User profile integration test failed:', error);
    return false;
  }
}

async function testCompleteFlow() {
  console.log('\n🔄 Testing complete data persistence flow...');
  
  try {
    // Step 1: Create user profile
    await supabase.rpc('upsert_user_profile', {
      user_uid: testUserId,
      user_pi_user_id: testUserId,
      user_username: testUsername,
      user_total_coins: 0
    });
    
    // Step 2: Sync initial inventory
    await supabase.rpc('sync_user_inventory', {
      user_id: testUserId,
      inventory_json: testInventoryData,
      wallet_balance: testWalletBalance
    });
    
    // Step 3: Simulate user logout (clear localStorage)
    console.log('📤 Simulating user logout...');
    
    // Step 4: Simulate user login (load from cloud)
    const { data: loadedData, error: loadError } = await supabase
      .rpc('load_user_inventory', {
        user_id: testUserId
      });
    
    if (loadError || !loadedData.success) {
      console.error('❌ Failed to load data after simulated login:', loadError);
      return false;
    }
    
    // Step 5: Verify data persistence
    const isDataIntact = 
      loadedData.items.length === testInventoryData.length &&
      loadedData.wallet_balance === testWalletBalance &&
      loadedData.items.some(item => item.name === 'Speed Boost') &&
      loadedData.items.some(item => item.name === 'Golden Bird');
    
    if (isDataIntact) {
      console.log('✅ Complete flow successful - data persisted correctly!');
      console.log('📊 Restored data summary:', {
        itemCount: loadedData.items.length,
        walletBalance: loadedData.wallet_balance,
        hasSpeedBoost: loadedData.items.some(item => item.name === 'Speed Boost'),
        hasGoldenSkin: loadedData.items.some(item => item.name === 'Golden Bird')
      });
      return true;
    } else {
      console.error('❌ Data integrity check failed after complete flow');
      return false;
    }
  } catch (error) {
    console.error('❌ Complete flow test failed:', error);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Remove test inventory data
    await supabase
      .from('user_inventory_sync')
      .delete()
      .eq('pi_user_id', testUserId);
    
    // Remove test user profile
    await supabase
      .from('user_profiles')
      .delete()
      .eq('uid', testUserId);
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.warn('⚠️ Failed to clean up test data:', error);
  }
}

// ========================================
// RUN ALL TESTS
// ========================================

async function runAllTests() {
  console.log('🧪 SUPABASE DATA PERSISTENCE TEST SUITE');
  console.log('=====================================');
  console.log('Test User ID:', testUserId);
  console.log('Test Username:', testUsername);
  
  const results = {
    databaseTables: false,
    inventorySync: false,
    inventoryLoad: false,
    directTableAccess: false,
    userProfileIntegration: false,
    completeFlow: false
  };
  
  try {
    results.databaseTables = await testDatabaseTables();
    
    if (results.databaseTables) {
      results.inventorySync = await testInventorySync();
      results.inventoryLoad = await testInventoryLoad();
      results.directTableAccess = await testDirectTableAccess();
      results.userProfileIntegration = await testUserProfileIntegration();
      results.completeFlow = await testCompleteFlow();
    }
  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await cleanupTestData();
  }
  
  // Test Results Summary
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log('Database Tables:', results.databaseTables ? '✅ PASS' : '❌ FAIL');
  console.log('Inventory Sync:', results.inventorySync ? '✅ PASS' : '❌ FAIL');
  console.log('Inventory Load:', results.inventoryLoad ? '✅ PASS' : '❌ FAIL');
  console.log('Direct Table Access:', results.directTableAccess ? '✅ PASS' : '❌ FAIL');
  console.log('User Profile Integration:', results.userProfileIntegration ? '✅ PASS' : '❌ FAIL');
  console.log('Complete Flow:', results.completeFlow ? '✅ PASS' : '❌ FAIL');
  
  const allTestsPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 OVERALL RESULT:', allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  if (allTestsPassed) {
    console.log('\n🎉 SUPABASE DATA PERSISTENCE IS WORKING CORRECTLY!');
    console.log('Your users\' data will now be properly saved and restored after logout/login.');
  } else {
    console.log('\n⚠️ SOME ISSUES WERE FOUND. CHECK THE DATABASE MIGRATION AND ENSURE:');
    console.log('1. You have run the COMPLETE_DATABASE_MIGRATION.sql script');
    console.log('2. All tables exist with proper permissions');
    console.log('3. RLS policies allow data access');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run the test suite
runAllTests().catch(error => {
  console.error('💥 Fatal error running tests:', error);
  process.exit(1);
});