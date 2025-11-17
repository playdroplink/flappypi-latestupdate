/**
 * Supabase Client for Backend Cloud Storage
 * Handles all database operations for Flappy Pi
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration in environment variables');
}

// Create Supabase client with service role key
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
}

/**
 * Initialize database schema if needed
 */
export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database schema...');
    
    // Check if tables exist by querying them
    const tables = [
      'user_profiles',
      'user_inventory', 
      'payment_records',
      'game_sessions',
      'leaderboard',
      'claimed_rewards',
      'renewal_reminders'
    ];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST116') {
        console.warn(`⚠️  Table ${table} does not exist. Please run database migrations.`);
      } else if (!error) {
        console.log(`✅ Table ${table} exists and is accessible`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    return false;
  }
}

export default supabase;