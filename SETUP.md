# Flappy Pi - Setup Guide

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase Database**
   - Run the SQL commands in `supabase-setup.sql` in your Supabase dashboard
   - This creates the missing `user_scores` table and other required tables

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Database Setup

### Required Tables
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create user_scores table for leaderboard functionality
CREATE TABLE IF NOT EXISTS public.user_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT,
    highest_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_scores_highest_score ON public.user_scores(highest_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON public.user_scores(user_id);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    avatar_url TEXT,
    total_coins INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT,
    subscription_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_type ON public.inventory(item_type);
```

## 🎮 Game Features

### Difficulty Levels
- **Easy**: Slower pipes, larger gaps, gentler gravity
- **Normal**: Balanced gameplay
- **Hard**: Faster pipes, smaller gaps, stronger gravity

### Game Modes
- **Classic**: Progressive difficulty with levels
- **Endless**: Continuous scaling challenge
- **Challenge**: Maximum difficulty from start

### Sandbox Mode
- Enabled for development and testing
- Pi SDK configured for testnet
- No real transactions in development

## 🛠️ Optimizations Applied

### Performance Improvements
- ✅ Memory leak prevention in game loops
- ✅ Proper cleanup of animation frames
- ✅ Debounced and throttled functions
- ✅ Error boundaries for React components
- ✅ Console noise reduction in production

### Bug Fixes
- ✅ Fixed React Fast Refresh issues
- ✅ Resolved mixed content warnings
- ✅ Fixed authentication redirect issues
- ✅ Added proper error handling for Pi SDK
- ✅ Optimized game loop performance

### Console Management
- ✅ Development: Prefixed logs for better organization
- ✅ Production: Only errors and warnings shown
- ✅ Performance monitoring and memory usage tracking
- ✅ Debounced logging to reduce noise

## 🔍 Troubleshooting

### Common Issues

1. **Supabase 404 Errors**
   - Ensure all tables are created using the SQL above
   - Check your Supabase connection settings

2. **Pi SDK Timeouts**
   - Network connectivity issues
   - Sandbox mode is enabled for development
   - Check Pi Network configuration

3. **Mixed Content Warnings**
   - All resource URLs now use relative paths
   - Fixed in: ClassicMode, SplashScreen, WelcomePage, etc.

4. **Performance Issues**
   - Game loop optimized with proper cleanup
   - Memory usage monitoring added
   - FPS monitoring available

### Development Tips

1. **Enable Debug Mode**
   ```javascript
   // In browser console
   consoleManager.enableAllLogs();
   ```

2. **Monitor Performance**
   ```javascript
   // Check memory usage
   consoleManager.logMemoryUsage();
   ```

3. **View Performance Metrics**
   ```javascript
   // In browser console
   PerformanceMonitor.getInstance().logMetrics();
   ```

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch controls optimized
- Pi Browser detection and prompts
- Mobile-specific UI adjustments

## 🔐 Security

- Sandbox mode enabled for development
- No real Pi transactions in test environment
- Proper error handling for authentication
- Secure token management

## 🚀 Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Ensure all Pi Network credentials are set
   - Configure Supabase connection
   - Set production URLs

3. **Performance Monitoring**
   - Console manager reduces noise in production
   - Error boundaries catch and handle errors gracefully
   - Performance metrics available for monitoring

## 📊 Monitoring

The app includes comprehensive monitoring:
- Performance metrics tracking
- Memory usage monitoring
- Error boundary for React errors
- Console management for better debugging
- FPS monitoring for game performance

## 🎯 Game Balance

Difficulty has been adjusted for better player experience:
- Easier progression through levels
- More forgiving collision detection
- Balanced coin and power-up spawning
- Improved jump mechanics

---

**Happy Gaming! 🎮** 