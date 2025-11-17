# 🚀 FLAPPY PI - PRODUCTION DEPLOYMENT GUIDE

## ✅ Pre-Deployment Checklist

### 1. Database Setup (Supabase)
```bash
# 1. Run the automated deployment script
node deploy-database.cjs

# OR manually in Supabase SQL Editor:
# - Copy contents of COMPLETE_DATABASE_SCHEMA.sql
# - Paste in SQL Editor
# - Click "Run"
```

### 2. Environment Variables
Ensure these are set in your production environment:

**Frontend (.env)**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_PI_APP_ID=flappypi2807
VITE_PI_NETWORK=mainnet
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ENABLE_PI_PAYMENTS=true
```

**Backend (.env)**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PI_API_KEY=your_pi_network_api_key
PI_NETWORK_API_KEY=your_pi_network_api_key
PI_APP_ID=flappypi2807
PI_NETWORK=mainnet
PORT=3001
NODE_ENV=production
```

### 3. Backend Server Deployment
```bash
# Install dependencies
npm install express @supabase/supabase-js cors helmet express-rate-limit dotenv

# Start the server
node backend/complete-api-server.cjs
```

### 4. Frontend Build & Deploy
```bash
# Build for production
npm run build

# Deploy to Vercel, Netlify, or your hosting provider
# Ensure environment variables are set in hosting platform
```

### 5. Test Everything
```bash
# Test database connectivity and schema
node deploy-database.cjs

# Test all API endpoints
node test-complete-api.cjs

# Test frontend integration
npm run dev
```

---

## 📊 Database Schema Overview

### Core Tables (13 Total)
1. **user_profiles** - User account data and statistics
2. **user_inventory** - Items, power-ups, and purchases
3. **payment_records** - Pi Network payment transactions
4. **game_sessions** - Individual game play records
5. **leaderboard** - High scores across all game modes
6. **shop_items** - Available items for purchase
7. **daily_rewards** - Daily login reward system
8. **ad_watches** - Ad viewing rewards tracking
9. **achievements** - User achievement progress
10. **analytics_events** - User behavior tracking
11. **renewal_reminders** - Subscription renewal alerts
12. **claimed_rewards** - Reward claim tracking
13. **payment_history** - Complete payment audit trail

### Key Features
- **Row Level Security (RLS)** - All tables secured by Pi User ID
- **Automated Triggers** - Auto-update timestamps and computed fields
- **Comprehensive Views** - Unified leaderboard across game modes
- **Stored Procedures** - Game completion and subscription management
- **Full Indexing** - Optimized for high-performance queries

---

## 🌐 API Endpoints Reference

### User Management
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Create user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

### Inventory System
- `GET /api/inventory` - Get user inventory
- `POST /api/inventory/add` - Add item to inventory
- `PUT /api/inventory/update` - Update inventory item
- `DELETE /api/inventory/remove` - Remove inventory item

### Payment Processing
- `POST /api/payments/create` - Create payment record
- `PUT /api/payments/update` - Update payment status
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/verify/:paymentId` - Verify payment

### Game Sessions
- `POST /api/game/session` - Record game session
- `GET /api/game/sessions` - Get user game history
- `GET /api/game/stats` - Get game statistics

### Leaderboards
- `POST /api/leaderboard/submit` - Submit high score
- `GET /api/leaderboard` - Get mode-specific leaderboard
- `GET /api/leaderboard/unified` - Get unified leaderboard
- `GET /api/leaderboard/user-rank` - Get user rank

### Shop System
- `GET /api/shop/items` - Get available shop items
- `POST /api/shop/purchase` - Process purchase
- `GET /api/shop/categories` - Get item categories

### Rewards & Achievements
- `GET /api/rewards/daily-status` - Check daily reward status
- `POST /api/rewards/daily-claim` - Claim daily reward
- `GET /api/achievements` - Get user achievements
- `POST /api/achievements/unlock` - Unlock achievement

### Analytics & Ads
- `POST /api/analytics/event` - Record analytics event
- `GET /api/analytics/summary` - Get analytics summary
- `POST /api/ads/watch` - Record ad viewing
- `GET /api/ads/earnings` - Get ad earnings

---

## 🔧 Production Configuration

### Security Headers
```javascript
// Already configured in complete-api-server.cjs
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: ['https://flappypi.vercel.app', 'https://your-domain.com'],
  credentials: true
}));
```

### Rate Limiting
```javascript
// Configured for production load
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### Database Connection Pool
```javascript
// Optimized Supabase configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});
```

---

## 📋 Deployment Steps

### Step 1: Database Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `deploy-database.cjs` OR paste `COMPLETE_DATABASE_SCHEMA.sql`
4. Verify all 13 tables are created

### Step 2: Backend Deployment
1. Deploy `backend/complete-api-server.cjs` to your server
2. Set all environment variables
3. Test with `node test-complete-api.cjs`

### Step 3: Frontend Deployment
1. Set environment variables in hosting platform
2. Run `npm run build`
3. Deploy `dist/` folder

### Step 4: Integration Testing
1. Test Pi Network authentication
2. Test payment flow (create/submit/complete)
3. Test game session recording
4. Test leaderboard updates

---

## 🎯 Performance Optimizations

### Database Indexes
- User lookup by `pi_user_id` (all tables)
- Leaderboard sorting by `score DESC`
- Payment lookup by `payment_id`
- Game session filtering by `game_mode`

### API Caching
- User profiles cached for 5 minutes
- Leaderboards cached for 1 minute
- Shop items cached for 1 hour

### Frontend Optimizations
- Bundle splitting for faster loading
- Service worker for offline capability
- Lazy loading for non-critical components

---

## 🚨 Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Basic server health
- `GET /api/health/database` - Database connectivity
- `GET /api/health/detailed` - Full system status

### Key Metrics to Monitor
- API response times
- Database connection pool usage
- Payment success rates
- User authentication errors
- Game session completion rates

---

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
node -e "console.log(require('@supabase/supabase-js').createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY))"
```

**API Endpoints Return 404**
```bash
# Verify server is running
curl http://localhost:3001/health

# Check CORS configuration
curl -H "Origin: https://your-frontend-domain.com" http://localhost:3001/api/user/profile
```

**Pi Network Integration Issues**
```bash
# Verify Pi Network configuration
node -e "console.log('PI_APP_ID:', process.env.PI_APP_ID); console.log('PI_NETWORK:', process.env.PI_NETWORK);"

# Test Pi API connectivity
curl -X POST https://api.minepi.com/v2/me/authenticate \
  -H "Authorization: Key YOUR_PI_API_KEY"
```

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ All 13 database tables created successfully
2. ✅ API server responds to `/health` endpoint
3. ✅ All 20+ API endpoints return success responses
4. ✅ Pi Network authentication works
5. ✅ Payment flow completes without errors
6. ✅ Game sessions save to database
7. ✅ Leaderboards update in real-time
8. ✅ Frontend connects to backend successfully

---

## 📞 Support

If you encounter issues:
1. Check the logs in your hosting platform
2. Run `node test-complete-api.cjs` for diagnostics
3. Verify all environment variables are set correctly
4. Ensure Supabase RLS policies allow your operations

Your Flappy Pi application is now ready for production! 🎉