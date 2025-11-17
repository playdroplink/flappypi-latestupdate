/**
 * =============================================
 * SIMPLE SUPABASE DATABASE TEST
 * =============================================
 * Test if we can connect to Supabase and check the leaderboard table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n📊 Testing leaderboard table...');
    
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Error:', error.message);
      
      if (error.message.includes('relation "leaderboard" does not exist')) {
        console.log('\n⚠️  Leaderboard table does not exist!');
        console.log('\n📝 Please create the leaderboard table in Supabase:');
        console.log('\n1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the SQL script from supabase-migration-script.sql');
        return;
      }
    } else {
      console.log('✅ Leaderboard table exists and is accessible');
      console.log('Current entries:', data.length);
      if (data.length > 0) {
        console.log('Sample entry:', data[0]);
      }
    }

    // Test if game_data column exists
    console.log('\n🔍 Checking for game_data column...');
    const { data: testData, error: testError } = await supabase
      .from('leaderboard')
      .select('id, game_data')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('column "game_data" does not exist')) {
        console.log('❌ game_data column is missing!');
        console.log('\n📝 Required SQL to fix this:');
        console.log('ALTER TABLE leaderboard ADD COLUMN game_data JSONB DEFAULT \'{}\';');
        console.log('CREATE INDEX idx_leaderboard_game_data ON leaderboard USING GIN (game_data);');
      } else {
        console.log('❌ Error checking game_data:', testError.message);
      }
    } else {
      console.log('✅ game_data column exists and is accessible');
    }

    // Test inserting a simple score
    console.log('\n🧪 Testing score insertion...');
    
    const testScore = {
      username: 'test_user_' + Date.now(),
      score: 50,
      game_mode: 'classic',
      character_used: 'flappy',
      difficulty: 'normal',
      game_duration: 25,
      coins_collected: 3,
      is_verified: false,
      is_pi_user: false,
      session_id: 'test_session_' + Date.now()
    };

    // Add game_data if column exists
    if (!testError || !testError.message.includes('column "game_data" does not exist')) {
      testScore.game_data = {
        pipes_passed: 5,
        max_height: 3,
        difficulty_multiplier: 1.0
      };
    }

    const { data: insertData, error: insertError } = await supabase
      .from('leaderboard')
      .insert([testScore])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error inserting test score:', insertError.message);
      
      if (insertError.message.includes('violates check constraint')) {
        console.log('⚠️  Game mode constraint needs updating');
        console.log('Required SQL:');
        console.log('ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_game_mode_check;');
        console.log('ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_game_mode_check CHECK (game_mode IN (\'classic\', \'screampi\', \'dinopi\', \'challenge\'));');
      }
    } else {
      console.log('✅ Test score inserted successfully!');
      console.log('Inserted ID:', insertData.id);
      
      // Clean up
      await supabase.from('leaderboard').delete().eq('id', insertData.id);
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testConnection();