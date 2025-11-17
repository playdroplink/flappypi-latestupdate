# 🔧 Supabase Configuration Fix Guide

## 🚨 **Current Issue**
Your app is using an invalid Supabase project reference: `ididprksbmbhigcxcxvt`

**Error:** `WebSocket connection to 'wss://ididprksbmbhigcxcxvt.supabase.co/realtime/v1/websocket?...' failed: Error in connection establishment: net::ERR_NAME_NOT_RESOLVED`

## ✅ **Solution Steps**

### 1. **Create a New Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name:** `flappy-pi-game` (or your preferred name)
   - **Database Password:** Create a strong password
   - **Region:** Choose closest to your users
6. Click "Create new project"

### 2. **Get Your Project Details**

Once your project is created:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijkl.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. **Update Environment Variables**

Create a `.env` file in your project root (if it doesn't exist):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Example (replace with your actual values):
# VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. **Create Database Schema**

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run this SQL script:

```sql
-- Create game_data table
CREATE TABLE IF NOT EXISTS game_data (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  data JSONB DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT true,
  pi_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_scores table for leaderboard
CREATE TABLE IF NOT EXISTS user_scores (
  id SERIAL PRIMARY KEY,
  pi_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  highest_score INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public_scores table for public leaderboard
CREATE TABLE IF NOT EXISTS public_scores (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Allow anonymous read/write on game_data" ON game_data
  FOR ALL USING (true);

CREATE POLICY "Allow anonymous read on user_scores" ON user_scores
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on user_scores" ON user_scores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read on public_scores" ON public_scores
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on public_scores" ON public_scores
  FOR INSERT WITH CHECK (true);

-- Create function to update user scores
CREATE OR REPLACE FUNCTION update_user_score(
  p_pi_user_id TEXT,
  p_username TEXT,
  p_score INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_scores (pi_user_id, username, highest_score, total_games)
  VALUES (p_pi_user_id, p_username, p_score, 1)
  ON CONFLICT (pi_user_id) DO UPDATE SET
    highest_score = GREATEST(user_scores.highest_score, p_score),
    total_games = user_scores.total_games + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### 5. **Test the Configuration**

1. Restart your development server
2. Check the browser console - you should see:
   ```
   ✅ Supabase configuration validated
   ✅ Realtime subscription enabled
   ```

3. If you still see errors, check:
   - Environment variables are loaded correctly
   - Supabase project is active
   - Database schema is created

## 🔍 **Troubleshooting**

### **If you still see WebSocket errors:**
1. Verify your project URL is correct (12-character project ref)
2. Check that your anon key is valid
3. Ensure your Supabase project is not paused
4. Check network connectivity

### **If leaderboard doesn't work:**
1. Verify the database schema is created
2. Check RLS policies are set correctly
3. Test with a simple score submission

### **If environment variables aren't loading:**
1. Make sure `.env` file is in the project root
2. Restart your development server
3. Check that variables start with `VITE_`

## 📝 **Example Valid Configuration**

```env
# ✅ Valid Supabase configuration
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM0NTY3ODkwLCJleHAiOjE5NTAxNDM4OTB9.example

# ❌ Invalid configuration (what you currently have)
VITE_SUPABASE_URL=https://ididprksbmbhigcxcxvt.supabase.co
```

## 🎯 **What This Fixes**

- ✅ WebSocket connection errors
- ✅ Background music in game over modals
- ✅ Leaderboard functionality
- ✅ Cloud data storage
- ✅ Real-time updates

## 🚀 **Next Steps**

1. Follow the steps above to create a new Supabase project
2. Update your environment variables
3. Create the database schema
4. Test the application
5. The WebSocket errors should be resolved!

---

**Need help?** Check the Supabase documentation or create an issue in your project repository.
