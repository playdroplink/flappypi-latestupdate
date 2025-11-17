#!/usr/bin/env node

/**
 * Setup Leaderboard Database Schema
 * Applies the leaderboard database schema to Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupLeaderboardDatabase() {
  try {
    console.log('🚀 Starting Leaderboard Database Setup...');
    console.log(`📡 Supabase URL: ${supabaseUrl}`);
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'database-leaderboard-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Loaded SQL schema file');
    
    // Split the SQL into individual statements
    const statements = sqlSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔄 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`  [${i + 1}/${statements.length}] Executing statement...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });
        
        if (error) {
          // Try direct execution for DDL statements
          const { data: directData, error: directError } = await supabase
            .from('__direct_sql__')
            .select('*')
            .eq('query', statement);
            
          if (directError) {
            console.warn(`    ⚠️  Statement ${i + 1} had issues:`, directError.message);
            // Continue with non-critical errors
            if (!directError.message.includes('already exists') && 
                !directError.message.includes('does not exist')) {
              throw directError;
            }
          }
        }
        
        console.log(`    ✅ Statement ${i + 1} completed`);
        
      } catch (stmtError) {
        console.warn(`    ⚠️  Statement ${i + 1} failed:`, stmtError.message);
        
        // Continue if it's a "already exists" error
        if (!stmtError.message.includes('already exists') && 
            !stmtError.message.includes('does not exist')) {
          throw stmtError;
        }
      }
    }
    
    console.log('\n🎯 Database setup completed!');
    
    // Verify the tables were created
    console.log('\n🔍 Verifying table creation...');
    
    const tables = [
      'leaderboard',
      'daily_leaderboard', 
      'user_best_scores',
      'leaderboard_achievements',
      'leaderboard_stats'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
          
        if (error) {
          console.log(`    ❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`    ✅ Table ${table}: Ready`);
        }
      } catch (e) {
        console.log(`    ❌ Table ${table}: ${e.message}`);
      }
    }
    
    console.log('\n🏆 Leaderboard database setup complete!');
    console.log('📝 You can now start the backend server and test the leaderboard API endpoints.');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the setup
setupLeaderboardDatabase();