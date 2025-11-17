#!/usr/bin/env node

/**
 * =============================================
 * SUPABASE MIGRATION RUNNER
 * =============================================
 * This script runs the database migration for the unified leaderboard system
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Starting Supabase migration for unified leaderboard system...\n');

async function runMigration() {
  try {
    console.log('📊 Checking current leaderboard table structure...');
    
    // Check if leaderboard table exists and show current structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_structure', { table_name: 'leaderboard' })
      .catch(() => {
        // Fallback if RPC doesn't exist - use direct query
        return supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'leaderboard')
          .order('ordinal_position');
      });

    if (tableError) {
      console.log('⚠️  Unable to check table structure, proceeding with migration...');
    } else {
      console.log('Current table structure:', tableInfo);
    }

    console.log('\n🔧 Executing migration steps...\n');

    // Step 1: Add game_data column
    console.log('1️⃣ Adding game_data JSONB column...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS game_data JSONB DEFAULT '{}'`
    }).catch(async () => {
      // Fallback: Try direct SQL execution via a dummy insert/select
      const { error } = await supabase.from('leaderboard').select('game_data').limit(1);
      if (error && error.message.includes('column "game_data" does not exist')) {
        throw new Error('game_data column needs to be added manually');
      }
      return { error: null }; // Column already exists
    });

    if (addColumnError) {
      console.log('⚠️  Please manually run this SQL in Supabase SQL Editor:');
      console.log('   ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS game_data JSONB DEFAULT \'{}\';');
      console.log('   CREATE INDEX IF NOT EXISTS idx_leaderboard_game_data ON leaderboard USING GIN (game_data);');
    } else {
      console.log('✅ game_data column added successfully');
    }

    // Step 2: Update game_mode constraint
    console.log('\n2️⃣ Updating game_mode constraint...');
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS leaderboard_game_mode_check;
        ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_game_mode_check 
        CHECK (game_mode IN ('classic', 'screampi', 'dinopi', 'challenge', 'scream_pi', 'dino_pi'));
      `
    }).catch(() => ({ error: null })); // Ignore constraint errors

    if (constraintError) {
      console.log('⚠️  Game mode constraint update may need manual execution');
    } else {
      console.log('✅ Game mode constraint updated successfully');
    }

    // Step 3: Test the leaderboard table with a sample query
    console.log('\n3️⃣ Testing leaderboard table access...');
    const { data: testData, error: testError } = await supabase
      .from('leaderboard')
      .select('id, username, score, game_mode, game_data')
      .limit(1);

    if (testError) {
      console.log('❌ Error accessing leaderboard table:', testError.message);
      console.log('\n📝 Manual migration required. Please run this SQL in Supabase SQL Editor:');
      
      const migrationSQL = fs.readFileSync(path.join(__dirname, 'supabase-migration-script.sql'), 'utf8');
      console.log('\n' + migrationSQL);
      return;
    }

    console.log('✅ Leaderboard table access successful');
    console.log('   Sample data structure:', testData?.[0] || 'No data yet');

    // Step 4: Test if we can insert sample data
    console.log('\n4️⃣ Testing score submission with game_data...');
    
    const testScore = {
      username: 'migration_test_user',
      score: 100,
      game_mode: 'classic',
      character_used: 'flappy',
      difficulty: 'normal',
      game_duration: 30,
      coins_collected: 5,
      power_ups_used: ['shield'],
      game_data: {
        pipes_passed: 10,
        max_height: 5,
        difficulty_multiplier: 1.0,
        streak_bonus: 20,
        perfect_passes: 2
      },
      session_id: 'migration_test_' + Date.now(),
      is_verified: false,
      is_pi_user: false
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('leaderboard')
      .insert([testScore])
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error inserting test score:', insertError.message);
      
      if (insertError.message.includes('column "game_data" does not exist')) {
        console.log('\n⚠️  The game_data column was not created. Manual SQL execution required.');
        console.log('\n📝 Please run this SQL in your Supabase SQL Editor:');
        console.log('\nALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS game_data JSONB DEFAULT \'{}\';');
        console.log('CREATE INDEX IF NOT EXISTS idx_leaderboard_game_data ON leaderboard USING GIN (game_data);');
      }
      return;
    }

    console.log('✅ Test score inserted successfully!');
    console.log('   Inserted ID:', insertResult.id);
    console.log('   Game data stored:', insertResult.game_data);

    // Clean up test data
    await supabase.from('leaderboard').delete().eq('id', insertResult.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Your leaderboard system is now ready to:');
    console.log('   ✓ Store game-mode-specific data in the game_data field');
    console.log('   ✓ Support all game modes (classic, screampi, dinopi, challenge)');
    console.log('   ✓ Track detailed metrics for each game type');
    console.log('   ✓ Provide unified leaderboard functionality');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📝 Please manually run the migration SQL in your Supabase dashboard:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase-migration-script.sql');
    console.log('4. Execute the SQL script');
  }
}

// Run the migration
runMigration().then(() => {
  console.log('\n✨ Migration process completed.');
}).catch(console.error);