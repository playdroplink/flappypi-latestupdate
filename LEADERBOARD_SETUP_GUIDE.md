# Leaderboard Database Setup Guide

## Step 1: Create Database Tables

The leaderboard tables need to be created in your Supabase database. Follow these steps:

### Manual Setup (Recommended)

1. **Go to Supabase Dashboard**
   - Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Navigate to your FlappyPi project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" 

3. **Run the Schema**
   - Copy the entire contents of `database-leaderboard-schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

4. **Verify Creation**
   - Run: `node verify-leaderboard-database.cjs`
   - All tables should show as "Ready"

### What Gets Created

The schema creates these tables:

- **`leaderboard`** - Main leaderboard entries with scores
- **`daily_leaderboard`** - Daily competition scores  
- **`user_best_scores`** - User's best scores per game mode
- **`leaderboard_achievements`** - Achievement system
- **`leaderboard_stats`** - Overall leaderboard statistics

Plus triggers, RLS policies, and useful views.

## Step 2: Start Backend Server

```bash
cd backend
node server.cjs
```

The server will show:
```
🏆 Leaderboard endpoints: http://localhost:3001/api/leaderboard
```

## Step 3: Test API Endpoints

Available endpoints:
- `POST /api/leaderboard/submit` - Submit a new score
- `GET /api/leaderboard/top` - Get top scores
- `GET /api/leaderboard/user/:piUserId/stats` - Get user stats
- `GET /api/leaderboard/daily` - Get daily leaderboard
- `GET /api/leaderboard/achievements/:piUserId` - Get user achievements

## Verification

Run the verification script anytime:
```bash
node verify-leaderboard-database.cjs
```

## Next Steps

After database setup:
1. Frontend leaderboard components
2. Game integration for score submission
3. Real-time updates and Pi authentication