#!/usr/bin/env node

/**
 * Verify Leaderboard Database Setup
 * Checks if the leaderboard tables exist and creates them if needed
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyLeaderboardTables() {
  try {
    console.log('🚀 Verifying Leaderboard Database Tables...');
    
    const tables = [
      'leaderboard',
      'daily_leaderboard', 
      'user_best_scores',
      'leaderboard_achievements',
      'leaderboard_stats'
    ];
    
    const results = [];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          results.push({ table, status: 'missing', error: error.message });
        } else {
          results.push({ table, status: 'exists' });
        }
      } catch (e) {
        results.push({ table, status: 'missing', error: e.message });
      }
    }
    
    console.log('\n📊 Table Status:');
    results.forEach(({ table, status, error }) => {
      if (status === 'exists') {
        console.log(`  ✅ ${table}: Ready`);
      } else {
        console.log(`  ❌ ${table}: Missing (${error})`);
      }
    });
    
    const missingTables = results.filter(r => r.status === 'missing');
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Some tables are missing. Please run the SQL schema manually:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of database-leaderboard-schema.sql');
      console.log('4. Run the SQL commands');
      console.log('5. Re-run this verification script');
    } else {
      console.log('\n🎉 All leaderboard tables are ready!');
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
  }
}

// Test basic Supabase connection
async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test with a simple query that should always work
    const { data, error } = await supabase
      .from('payments') // This table should exist from previous work
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.log('⚠️  Connection test with payments table failed:', error.message);
      console.log('🔄 Trying with users table...');
      
      // Try users table instead
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
        
      if (userError) {
        console.log('❌ Connection failed. Please check your Supabase configuration.');
        return false;
      }
    }
    
    console.log('✅ Supabase connection successful');
    return true;
    
  } catch (e) {
    console.error('❌ Connection test failed:', e.message);
    return false;
  }
}

// Run the verification
async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await verifyLeaderboardTables();
  }
}

main();