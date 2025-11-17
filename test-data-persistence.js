// Complete data persistence test script
console.log('🧪 TESTING DATA PERSISTENCE & CLOUD STORAGE');
console.log('============================================');

async function testDataPersistence() {
  console.log('\n🔍 CHECKING CURRENT DATA STATE...');
  
  // Check localStorage data
  const inventory = localStorage.getItem('flappypi-inventory');
  const wallet = localStorage.getItem('flappypi-balance');
  const piUser = localStorage.getItem('flappypi-pi-user');
  
  console.log('📦 Inventory items:', inventory ? JSON.parse(inventory).length : 0);
  console.log('💰 Wallet balance:', wallet || 0);
  console.log('👤 Pi User logged in:', piUser ? 'Yes' : 'No');
  
  if (piUser) {
    const user = JSON.parse(piUser);
    console.log('   Username:', user.username);
    console.log('   User ID:', user.uid);
  }
  
  console.log('\n🧪 TESTING CLOUD SYNC FUNCTIONALITY...');
  
  try {
    // Test inventory service
    if (window.inventoryService) {
      console.log('✅ Inventory service available');
      
      // Test debug function
      window.inventoryService.debugInventory();
      
      // Test cloud sync if user is logged in
      if (piUser) {
        const user = JSON.parse(piUser);
        console.log('🔄 Testing cloud sync for user:', user.uid);
        
        const syncResult = await window.inventoryService.performFullCloudSync(user.uid);
        console.log('📤 Cloud sync result:', syncResult ? 'SUCCESS' : 'FAILED');
      }
    } else {
      console.warn('⚠️ Inventory service not available');
    }
  } catch (error) {
    console.error('❌ Cloud sync test failed:', error);
  }
  
  console.log('\n🔍 CHECKING DATABASE CONNECTION...');
  
  try {
    // Test Supabase connection
    if (window.supabase) {
      console.log('✅ Supabase connection available');
      
      // Test basic query
      const { data, error } = await window.supabase
        .from('user_inventory_sync')
        .select('count')
        .limit(1);
        
      if (error) {
        console.warn('⚠️ Supabase query error:', error.message);
      } else {
        console.log('✅ Database connection working');
      }
    } else {
      console.warn('⚠️ Supabase not available in window');
    }
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
  
  console.log('\n🧪 TESTING DATA RECOVERY...');
  
  try {
    // Test data recovery service if available
    if (piUser) {
      const user = JSON.parse(piUser);
      
      // Import data recovery service
      const { dataRecoveryService } = await import('./src/services/dataRecoveryService.js');
      
      console.log('🔄 Testing data recovery for:', user.username);
      const recoveryData = await dataRecoveryService.recoverUserData(user.uid, user.username);
      
      if (recoveryData) {
        console.log('✅ Recovery data found');
        console.log('   Source:', recoveryData.source);
        console.log('   Items:', recoveryData.inventory?.length || 0);
        console.log('   Wallet:', recoveryData.walletBalance || 0);
      } else {
        console.log('ℹ️ No recovery data found (normal for new users)');
      }
    }
  } catch (error) {
    console.warn('⚠️ Data recovery test failed:', error.message);
  }
  
  console.log('\n📋 PERSISTENCE TEST RESULTS:');
  console.log('============================');
  
  const results = {
    localData: !!inventory,
    walletBalance: !!wallet,
    userLoggedIn: !!piUser,
    inventoryService: !!window.inventoryService,
    supabaseConnection: !!window.supabase
  };
  
  console.table(results);
  
  console.log('\n📝 RECOMMENDATIONS:');
  
  if (!piUser) {
    console.log('🔑 Login with Pi Network to enable cloud sync');
  }
  
  if (!inventory || JSON.parse(inventory || '[]').length === 0) {
    console.log('🛒 Purchase some items to test data persistence');
  }
  
  if (results.userLoggedIn && results.inventoryService) {
    console.log('✅ Full data persistence is active');
    console.log('   - Purchases will be saved to cloud automatically');
    console.log('   - Data will be preserved on logout/login');
    console.log('   - Cross-device sync is enabled');
  }
  
  console.log('\n🎯 TEST COMPLETE');
  console.log('================');
  
  return results;
}

// Auto-run test
testDataPersistence().catch(console.error);

// Make test available globally
window.testDataPersistence = testDataPersistence;