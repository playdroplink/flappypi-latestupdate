# Backend Setup Guide

This guide will help you set up the complete backend infrastructure for the Flappy Pi game using Supabase.

## 🗄️ Database Setup

### 1. Environment Configuration

Copy the environment variables to your `.env.local` file:

```bash
# Supabase Configuration
POSTGRES_URL="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_USER="postgres"
POSTGRES_HOST="db.ididprksbmbhigcxcxvt.supabase.co"
SUPABASE_JWT_SECRET="IlEbfOj6cuDqID3G/4ClWFgC32LmK7IMdORUtHXyUdlW6mJ3Tu3B4pojw5YA4uq1O/mF8rYolo7ZOf7CoJ93Xg=="
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q"
POSTGRES_PRISMA_URL="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_PASSWORD="jtrriobt4G7Sr5VG"
POSTGRES_DATABASE="postgres"
SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ"
POSTGRES_URL_NON_POOLING="postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Pi Network Configuration
PI_NETWORK_API_KEY="your_pi_network_api_key_here"
PI_NETWORK_APP_ID="your_pi_network_app_id_here"

# Game Configuration
GAME_ENVIRONMENT="production"
ENABLE_ANALYTICS=true
ENABLE_LEADERBOARD=true
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js tsx
```

### 3. Run Database Setup

```bash
npm run setup-db
```

This will create the necessary tables and set up the database schema.

## 📊 Database Schema

### Tables Created

1. **game_data** - Stores user game progress
   - `id` - Primary key
   - `user_id` - Unique user identifier
   - `data` - JSONB containing game state
   - `is_anonymous` - Whether user is anonymous
   - `pi_username` - Pi Network username (if authenticated)
   - `created_at` / `updated_at` - Timestamps

2. **public_scores** - Leaderboard scores
   - `id` - Primary key
   - `username` - Player username
   - `score` - Game score
   - `created_at` - Submission timestamp

3. **game_analytics** - Analytics view
   - Aggregated statistics for game analytics

## 🔧 API Integration

### Using the Game Data Hook

```typescript
import { useGameData } from '../hooks/useGameData';

function GameComponent() {
  const userId = 'user-123'; // Get from authentication
  const { 
    gameProgress, 
    loading, 
    updateCoins, 
    updateHighScore,
    submitScore 
  } = useGameData(userId);

  // Update coins
  const handleCoinCollect = async () => {
    await updateCoins(gameProgress.coins + 1);
  };

  // Submit score to leaderboard
  const handleGameOver = async (score: number) => {
    await submitScore('PlayerName', score);
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Coins: {gameProgress.coins}</p>
      <p>High Score: {gameProgress.highScore}</p>
    </div>
  );
}
```

### Direct API Usage

```typescript
import { gameAPI } from '../api/game';

// Save game progress
await gameAPI.saveProgress(userId, {
  coins: 100,
  highScore: 500,
  level: 5,
  achievements: ['first_win'],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    sensitivity: 50
  },
  statistics: {
    gamesPlayed: 10,
    totalDistance: 1000,
    totalCoins: 500,
    bestScore: 500
  }
});

// Get leaderboard
const leaderboard = await gameAPI.getLeaderboard(10);

// Track analytics
await gameAPI.trackEvent('game_started', {
  level: 1,
  difficulty: 'easy'
});
```

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Anonymous user support** for guest players
- **Authenticated user policies** for Pi Network users
- **Data validation** and error handling
- **Rate limiting** through Supabase

## 📈 Analytics

The backend includes built-in analytics tracking:

- Game events (start, end, achievements)
- User statistics (games played, scores, coins)
- Leaderboard data
- Performance metrics

## 🚀 Deployment

### Vercel Deployment

1. Add environment variables to Vercel dashboard
2. Deploy with `npm run build`
3. Database will be automatically set up

### Local Development

1. Copy `.env.example` to `.env.local`
2. Run `npm run setup-db` to initialize database
3. Start development server with `npm run dev`

## 🔍 Monitoring

### Database Monitoring

- Use Supabase dashboard to monitor queries
- Check Row Level Security policies
- Monitor API usage and performance

### Error Handling

All API calls include comprehensive error handling:

```typescript
try {
  const result = await gameAPI.saveProgress(userId, data);
  if (!result) {
    console.error('Failed to save progress');
  }
} catch (error) {
  console.error('API error:', error);
}
```

## 📝 API Reference

### Game Data Service

- `saveGameData(userId, data, isAnonymous, piUsername)` - Save game progress
- `loadGameData(userId)` - Load user's game data
- `submitScore(username, score)` - Submit to leaderboard
- `getLeaderboard(limit)` - Get top scores
- `getUserBestScore(userId)` - Get user's best score

### Analytics Service

- `trackEvent(eventName, eventData)` - Track game events
- `getGameAnalytics()` - Get aggregated analytics

### Hook Methods

- `updateCoins(newCoins)` - Update user's coins
- `updateHighScore(newScore)` - Update high score
- `updateLevel(newLevel)` - Update game level
- `addAchievement(achievement)` - Add achievement
- `updateSettings(settings)` - Update game settings
- `submitScore(username, score)` - Submit to leaderboard
- `trackEvent(eventName, eventData)` - Track analytics

## 🎯 Next Steps

1. **Test the setup** by running the database initialization
2. **Integrate with your game components** using the `useGameData` hook
3. **Add authentication** for Pi Network users
4. **Implement real-time features** using Supabase subscriptions
5. **Set up monitoring** and error tracking

The backend is now ready to handle all game data, leaderboards, and analytics for your Flappy Pi game! 