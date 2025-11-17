const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Testing Supabase Cloud Storage Setup...\n');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file!');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSetup() {
  console.log('📊 Testing database tables...');
  
  const tables = [
    'user_profiles',
    'user_inventory', 
    'payment_records',
    'game_sessions',
    'leaderboard',
    'claimed_rewards',
    'renewal_reminders'
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.error(`❌ Table '${table}' not found or not accessible`);
        console.error(`   Error: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    } catch (err) {
      console.error(`❌ Error testing table '${table}': ${err.message}`);
      allTablesExist = false;
    }
  }
  
  return allTablesExist;
}

async function testUserDataFlow() {
  console.log('\n👤 Testing user data flow...');
  
  const testUserId = 'test-user-' + Date.now();
  
  try {
    // Test creating user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        pi_user_id: testUserId,
        username: 'TestUser',
        high_score: 100,
        coins_earned: 50
      }])
      .select()
      .single();
      
    if (profileError) {
      console.error('❌ Failed to create test user profile:', profileError.message);
      return false;
    }
    
    console.log('✅ User profile created successfully');
    
    // Test creating inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('user_inventory')
      .insert([{
        pi_user_id: testUserId,
        items: [
          { id: 'test-item', type: 'power_up', quantity: 5 },
          { id: 'test-coin', type: 'currency', quantity: 100 }
        ]
      }])
      .select()
      .single();
      
    if (inventoryError) {
      console.error('❌ Failed to create test inventory:', inventoryError.message);
      return false;
    }
    
    console.log('✅ User inventory created successfully');
    
    // Test creating game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert([{
        pi_user_id: testUserId,
        score: 150,
        coins_earned: 25,
        pipes_passed: 15,
        duration_seconds: 60
      }])
      .select()
      .single();
      
    if (sessionError) {
      console.error('❌ Failed to create test game session:', sessionError.message);
      return false;
    }
    
    console.log('✅ Game session recorded successfully');
    
    // Clean up test data
    await supabase.from('game_sessions').delete().eq('pi_user_id', testUserId);
    await supabase.from('user_inventory').delete().eq('pi_user_id', testUserId);
    await supabase.from('user_profiles').delete().eq('pi_user_id', testUserId);
    
    console.log('✅ Test data cleaned up');
    return true;
    
  } catch (err) {
    console.error('❌ Error in user data flow test:', err.message);
    return false;
  }
}

async function testPaymentFlow() {
  console.log('\n💳 Testing payment recording...');
  
  const testPaymentId = 'test-payment-' + Date.now();
  const testUserId = 'test-user-' + Date.now();
  
  try {
    // First create a user profile (required for foreign key)
    await supabase
      .from('user_profiles')
      .insert([{
        pi_user_id: testUserId,
        username: 'PaymentTestUser'
      }]);
    
    // Test payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payment_records')
      .insert([{
        payment_id: testPaymentId,
        pi_user_id: testUserId,
        amount: 1.5,
        currency: 'PI',
        memo: 'Test subscription purchase',
        status: 'completed',
        payment_type: 'subscription',
        item_type: 'premium',
        item_id: 'premium-monthly'
      }])
      .select()
      .single();
      
    if (paymentError) {
      console.error('❌ Failed to record test payment:', paymentError.message);
      return false;
    }
    
    console.log('✅ Payment recorded successfully');
    
    // Clean up
    await supabase.from('payment_records').delete().eq('payment_id', testPaymentId);
    await supabase.from('user_profiles').delete().eq('pi_user_id', testUserId);
    
    return true;
    
  } catch (err) {
    console.error('❌ Error in payment flow test:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Flappy Pi Cloud Storage Setup Test');
  console.log('=====================================\n');
  
  const tablesOk = await testDatabaseSetup();
  if (!tablesOk) {
    console.log('\n❌ Database setup incomplete!');
    console.log('📋 Please run the SQL script from SUPABASE_SETUP_GUIDE.md first');
    process.exit(1);
  }
  
  const userFlowOk = await testUserDataFlow();
  const paymentFlowOk = await testPaymentFlow();
  
  console.log('\n📋 SETUP RESULTS:');
  console.log('==================');
  console.log(`Database Tables: ${tablesOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Data Flow: ${userFlowOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Payment Flow: ${paymentFlowOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (tablesOk && userFlowOk && paymentFlowOk) {
    console.log('\n🎉 CONGRATULATIONS!');
    console.log('Your Flappy Pi cloud storage is fully set up and working!');
    console.log('');
    console.log('✅ User data will persist across updates');
    console.log('✅ Purchases and coins will be saved');
    console.log('✅ Cross-device sync is enabled');
    console.log('✅ Payment tracking is active');
    console.log('✅ Ready for production deployment!');
  } else {
    console.log('\n⚠️  Setup incomplete - please check the errors above');
  }
}

// Run the test
main().catch(console.error);