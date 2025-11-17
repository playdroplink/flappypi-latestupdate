import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ididprksbmbhigcxcxvt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // Create game_data table
    const { error: gameDataError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS game_data (
          id BIGSERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_anonymous BOOLEAN DEFAULT true,
          pi_username TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_game_data_user_id ON game_data(user_id);
        CREATE INDEX IF NOT EXISTS idx_game_data_anonymous ON game_data(is_anonymous);
        CREATE INDEX IF NOT EXISTS idx_game_data_updated_at ON game_data(updated_at);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_game_data_unique_user ON game_data(user_id);

        ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow anonymous users to manage their own data" ON game_data
          FOR ALL USING (is_anonymous = true);

        CREATE POLICY "Allow authenticated users to manage their own data" ON game_data
          FOR ALL USING (is_anonymous = false);
      `
    });

    if (gameDataError) {
      console.error('Error creating game_data table:', gameDataError);
    } else {
      console.log('✅ game_data table created successfully');
    }

    // Create public_scores table
    const { error: scoresError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public_scores (
          id BIGSERIAL PRIMARY KEY,
          username TEXT NOT NULL,
          score INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_public_scores_score ON public_scores(score DESC);
      `
    });

    if (scoresError) {
      console.error('Error creating public_scores table:', scoresError);
    } else {
      console.log('✅ public_scores table created successfully');
    }

    // Create analytics view
    const { error: analyticsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW game_analytics AS
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_anonymous = false THEN 1 END) as pi_users,
          COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymous_users,
          AVG((data->>'coins')::numeric) as avg_coins,
          MAX((data->>'highScore')::integer) as max_high_score,
          MAX(updated_at) as last_activity
        FROM game_data;
      `
    });

    if (analyticsError) {
      console.error('Error creating analytics view:', analyticsError);
    } else {
      console.log('✅ game_analytics view created successfully');
    }

    // Grant permissions
    const { error: permissionsError } = await supabase.rpc('exec_sql', {
      sql: `
        GRANT ALL ON game_data TO authenticated;
        GRANT ALL ON game_data TO anon;
        GRANT USAGE ON SEQUENCE game_data_id_seq TO authenticated;
        GRANT USAGE ON SEQUENCE game_data_id_seq TO anon;
        GRANT ALL ON public_scores TO authenticated;
        GRANT ALL ON public_scores TO anon;
        GRANT USAGE ON SEQUENCE public_scores_id_seq TO authenticated;
        GRANT USAGE ON SEQUENCE public_scores_id_seq TO anon;
      `
    });

    if (permissionsError) {
      console.error('Error granting permissions:', permissionsError);
    } else {
      console.log('✅ Permissions granted successfully');
    }

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup
setupDatabase(); 