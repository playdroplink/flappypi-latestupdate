# Supabase Setup Guide for Flappy Pi Cloud Storage

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Set Environment Variables
Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Schema
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script

### 4. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

## 📊 Database Schema

The system creates a `game_data` table with:

- **user_id**: Unique identifier (anonymous or Pi user ID)
- **data**: JSONB field containing game data
- **is_anonymous**: Boolean flag for anonymous vs Pi users
- **pi_username**: Pi username (for Pi users only)
- **updated_at**: Timestamp of last update

## 🔧 Features

### ✅ **Works Without Pi Login**
- Anonymous users get cloud storage
- Local storage always works
- No authentication required

### ✅ **Pi Integration**
- When Pi user logs in, data migrates automatically
- Pi users get dedicated cloud storage
- Seamless transition from anonymous to Pi user

### ✅ **Data Merging**
- Smart merging of local + cloud + Pi cloud data
- Takes highest scores and coins
- Combines unlocked items
- Preserves settings

## 🎯 Usage Examples

```javascript
// In your game components
import { useGameDataHelpers } from '../hooks/useCloudGameData';

const { addCoins, updateHighScore, coins } = useGameDataHelpers();

// Add coins (auto-saves to cloud)
await addCoins(10);

// Update high score
await updateHighScore(150);
```

## 🔍 Monitoring

Check your Supabase dashboard to see:
- Total users (anonymous + Pi)
- Average coins per user
- Highest scores
- Last activity

## 🛠️ Troubleshooting

### If cloud storage isn't working:
1. Check environment variables are set
2. Verify Supabase project is active
3. Check browser console for errors
4. Ensure database schema is created

### If data isn't syncing:
1. Check network connection
2. Verify Supabase policies are set correctly
3. Check browser console for Supabase errors

## 📈 Analytics

The system includes a `game_analytics` view that shows:
- Total users
- Pi vs anonymous users
- Average coins
- Highest scores
- Last activity

## 🔐 Security

- Row Level Security (RLS) enabled
- Anonymous users can only access their own data
- Pi users can only access their own data
- No cross-user data access

## 🚀 Next Steps

1. **Test the system** - Try saving/loading game data
2. **Monitor usage** - Check Supabase dashboard
3. **Add analytics** - Use the game_analytics view
4. **Scale as needed** - Supabase handles scaling automatically

Your cloud storage system is now ready! 🎉 