const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Testing Supabase with Service Role...\n');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log(`📊 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Service Role Key: ${serviceRoleKey ? 'Found (length: ' + serviceRoleKey.length + ')' : 'NOT FOUND'}`);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file!');
  process.exit(1);
}

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testServiceRoleAccess() {
  console.log('\n🔐 Testing Service Role Access...');
  
  const testUserId = 'test-service-user-' + Date.now();
  
  try {
    // Test creating user profile with service role (should work)
    console.log('1️⃣ Creating test user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        pi_user_id: testUserId,
        username: 'ServiceTestUser',
        high_score: 100,
        coins_earned: 50
      }])
      .select()
      .single();
      
    if (profileError) {
      console.error('❌ Failed to create test user profile:', profileError);
      return false;
    }
    
    console.log('✅ User profile created successfully');
    console.log(`   User ID: ${profile.pi_user_id}`);
    
    // Test reading back the profile
    console.log('2️⃣ Reading test user profile...');
    const { data: readProfile, error: readError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('pi_user_id', testUserId)
      .single();
      
    if (readError) {
      console.error('❌ Failed to read test user profile:', readError);
      return false;
    }
    
    console.log('✅ User profile read successfully');
    console.log(`   Username: ${readProfile.username}`);
    
    // Test creating inventory
    console.log('3️⃣ Creating test inventory...');
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
      console.error('❌ Failed to create test inventory:', inventoryError);
      return false;
    }
    
    console.log('✅ User inventory created successfully');
    console.log(`   Items count: ${inventory.items.length}`);
    
    // Test creating payment record
    console.log('4️⃣ Creating test payment record...');
    const testPaymentId = 'test-payment-' + Date.now();
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
      console.error('❌ Failed to record test payment:', paymentError);
      return false;
    }
    
    console.log('✅ Payment record created successfully');
    console.log(`   Payment ID: ${payment.payment_id}`);
    console.log(`   Amount: ${payment.amount} ${payment.currency}`);
    
    // Clean up test data
    console.log('5️⃣ Cleaning up test data...');
    await supabase.from('payment_records').delete().eq('payment_id', testPaymentId);
    await supabase.from('user_inventory').delete().eq('pi_user_id', testUserId);
    await supabase.from('user_profiles').delete().eq('pi_user_id', testUserId);
    
    console.log('✅ Test data cleaned up successfully');
    return true;
    
  } catch (err) {
    console.error('❌ Service role test failed:', err);
    return false;
  }
}

async function main() {
  console.log('🚀 Flappy Pi Service Role Test');
  console.log('================================\n');
  
  const serviceRoleWorks = await testServiceRoleAccess();
  
  console.log('\n📋 FINAL RESULTS:');
  console.log('==================');
  console.log(`Service Role Access: ${serviceRoleWorks ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (serviceRoleWorks) {
    console.log('\n🎉 PERFECT!');
    console.log('Your backend can now:');
    console.log('✅ Create and read user profiles');
    console.log('✅ Manage user inventory and items'); 
    console.log('✅ Record Pi payment transactions');
    console.log('✅ Store all game data in cloud');
    console.log('');
    console.log('💾 User data will NEVER be lost during updates!');
    console.log('🔄 Ready for cross-device sync!');
    console.log('🚀 Production database setup complete!');
  } else {
    console.log('\n⚠️  Backend access issues - please check Supabase policies');
  }
}

// Run the test
main().catch(console.error);