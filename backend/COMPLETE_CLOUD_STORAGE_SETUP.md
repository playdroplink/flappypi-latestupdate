# 🌐 Flappy Pi Backend Cloud Storage - Complete Setup Guide

## 🎯 Overview

This is the **complete backend cloud storage implementation** for Flappy Pi, providing comprehensive data synchronization, offline support, and cross-device compatibility. The system handles user profiles, inventory, payments, game sessions, achievements, and more.

## 📋 Quick Start

### 1. Install Dependencies
```bash
cd backend
node setup-cloud-storage.cjs
```

### 2. Setup Database Schema
Copy and run the SQL from `database/comprehensive-cloud-storage-schema.sql` in your Supabase dashboard.

### 3. Start Backend
```bash
npm start
```

### 4. Test Everything
```bash
node test-cloud-storage.cjs
```

---

## 🏗️ Architecture Overview

### Core Services

| Service | Purpose | Location |
|---------|---------|----------|
| **Supabase Client** | Database connection & operations | `services/supabaseClient.js` |
| **Cloud Storage** | Main data sync & CRUD operations | `services/cloudStorageService.js` |
| **Data Migration** | localStorage → cloud migration | `services/dataMigrationService.js` |
| **Error Handling** | Retry, circuit breaker, fallbacks | `services/errorHandlingService.js` |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/cloud/user/:id/profile` | User profile management |
| `/api/cloud/user/:id/inventory` | Inventory sync & management |
| `/api/cloud/user/:id/payments` | Payment history & tracking |
| `/api/cloud/user/:id/session` | Game session recording |
| `/api/cloud/leaderboard` | Global leaderboard |
| `/api/cloud/health` | Service health check |

---

## 🗄️ Database Schema

### Tables Created

#### **user_profiles**
- User account information and game statistics
- Pi Network user authentication data
- Subscription status and preferences

#### **user_inventory** 
- User-owned items (skins, powerups, subscriptions)
- Real-time sync with localStorage
- Conflict resolution for multi-device access

#### **payment_records**
- Complete payment transaction history  
- Pi Network payment verification
- Status tracking (pending → completed)

#### **game_sessions**
- Individual game session data
- Score, coins, achievements per session
- Analytics and performance tracking

#### **leaderboard**
- Global and seasonal rankings
- Real-time score updates
- Achievement badges and stats

#### **claimed_rewards & renewal_reminders**
- Subscription reward tracking
- Automatic renewal notifications
- Expiry monitoring

#### **achievements & analytics_events**
- User achievement progress
- Detailed analytics and event tracking

---

## 🔧 Service Details

### CloudStorageService

**Core Functions:**
```javascript
// User Management
await cloudStorageService.upsertUserProfile(piUserId, userData)
await cloudStorageService.getUserProfile(piUserId)
await cloudStorageService.updateUserStats(piUserId, stats)

// Inventory Management  
await cloudStorageService.syncInventoryToCloud(piUserId, items)
await cloudStorageService.loadInventoryFromCloud(piUserId)
await cloudStorageService.addItemToInventory(piUserId, item)

// Payment Tracking
await cloudStorageService.recordPayment(paymentData)
await cloudStorageService.updatePaymentStatus(paymentId, status)
await cloudStorageService.getPaymentHistory(piUserId)

// Game Sessions
await cloudStorageService.recordGameSession(piUserId, sessionData)

// Leaderboard
await cloudStorageService.updateLeaderboard(piUserId, score, username)
await cloudStorageService.getLeaderboard(limit)
```

**Features:**
- ✅ Automatic retries on failure
- ✅ Data validation and sanitization  
- ✅ Concurrent operation handling
- ✅ Performance optimization
- ✅ Error logging and monitoring

### DataMigrationService

**Migration Functions:**
```javascript
// Full data migration from localStorage
await dataMigrationService.migrateUserData(piUserId, localStorageData)

// Smart sync with conflict resolution
await dataMigrationService.smartDataSync(piUserId, localStorageData)

// Check migration status
await dataMigrationService.needsMigration(piUserId)
```

**Conflict Resolution:**
- **Profile Data**: Cloud takes priority for subscription info, local for stats
- **Inventory Items**: Stackable items sum quantities, subscriptions keep latest expiry
- **Equipment**: Prefer equipped items
- **Achievements**: Merge progress, keep highest completion

### ErrorHandlingService

**Error Handling Features:**
```javascript
// Retry with exponential backoff
await errorHandlingService.withRetry(operation, options)

// Circuit breaker pattern
await errorHandlingService.withCircuitBreaker(name, operation)

// Graceful fallback to localStorage
await errorHandlingService.withLocalStorageFallback(operation, fallback, name)

// Health monitoring
const health = await errorHandlingService.getHealthReport()
```

**Offline Support:**
- ✅ Automatic detection of network status
- ✅ Queue operations when offline
- ✅ Automatic sync when connection restored
- ✅ Data integrity preservation

---

## 🔌 API Integration

### Frontend Integration

```javascript
// Example: Sync user data on login
const syncUserData = async (piUserId) => {
  try {
    // 1. Load cloud inventory
    const response = await fetch(`/api/cloud/user/${piUserId}/inventory`);
    const cloudData = await response.json();
    
    // 2. Merge with local data
    const localInventory = JSON.parse(localStorage.getItem('flappypi-inventory') || '[]');
    
    // 3. Sync to cloud
    await fetch(`/api/cloud/user/${piUserId}/inventory/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: mergedInventory })
    });
    
    console.log('✅ User data synced');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
};
```

### Payment Flow Integration

```javascript
// Example: Record payment and deliver items
const handlePaymentComplete = async (paymentData) => {
  try {
    // 1. Record payment
    await fetch('/api/cloud/payments/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    // 2. Add purchased item to inventory
    await fetch(`/api/cloud/user/${piUserId}/inventory/item`, {
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchasedItem)
    });
    
    // 3. Update payment status
    await fetch(`/api/cloud/payments/${paymentData.payment_id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    
  } catch (error) {
    console.error('❌ Payment processing failed:', error);
  }
};
```

---

## 🧪 Testing

### Automated Test Suite

The `test-cloud-storage.cjs` script provides comprehensive testing:

```bash
node test-cloud-storage.cjs
```

**Test Coverage:**
- ✅ Database connection and schema
- ✅ User profile CRUD operations  
- ✅ Inventory sync and management
- ✅ Payment recording and tracking
- ✅ Game session recording
- ✅ Leaderboard operations
- ✅ Data migration and conflict resolution
- ✅ Error handling and retry logic
- ✅ Circuit breaker functionality  
- ✅ Offline support and sync queue
- ✅ Performance and load testing

### Manual Testing

```bash
# Test database connection
curl http://localhost:3001/api/health/cloud

# Test user profile
curl -X PUT http://localhost:3001/api/cloud/user/test123/profile \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","total_score":1000}'

# Test inventory sync
curl -X POST http://localhost:3001/api/cloud/user/test123/inventory/sync \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"skin1","name":"Test Skin","type":"skin"}]}'
```

---

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in production:

```bash
# Supabase Configuration
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Pi Network Configuration  
PI_API_KEY="your-pi-api-key"
PI_APP_ID="flappypi2807"
PI_NETWORK="mainnet"

# Security
ALLOWED_ORIGINS="https://flappypi.fun,https://flappypi2807.pinet.com"

# Performance
NODE_ENV="production"
PORT="3001"
```

### Database Setup

1. **Create Tables**: Run `comprehensive-cloud-storage-schema.sql` in Supabase
2. **Enable RLS**: Row Level Security is automatically enabled
3. **Set Policies**: User isolation policies are created automatically
4. **Create Indexes**: Performance indexes are included in schema

### Server Configuration

```javascript
// Production server settings
app.use(helmet()); // Security headers
app.use(compression()); // Response compression  
app.use(cors(corsOptions)); // Secure CORS
```

### Monitoring

- **Health Checks**: `/api/health` and `/api/health/cloud`
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response times and operation counts
- **Circuit Breaker Status**: Automatic failure detection

---

## 📊 Performance Optimization

### Database Optimization

- **Indexes**: Optimized for common query patterns
- **Connection Pooling**: Supabase handles connection management
- **Query Optimization**: Efficient queries with proper filtering
- **Batch Operations**: Bulk updates when possible

### Caching Strategy

- **Local Storage**: Browser cache for immediate access
- **Memory Caching**: Server-side operation result caching
- **CDN**: Static assets served from edge locations

### Error Recovery

- **Exponential Backoff**: Progressive retry delays
- **Circuit Breakers**: Fast failure for degraded services  
- **Graceful Degradation**: Continue with limited functionality
- **Sync Queues**: Offline operation queuing

---

## 🔒 Security Features

### Data Protection

- **Row Level Security**: Users can only access their own data
- **Input Validation**: All data sanitized and validated
- **CORS Protection**: Restricted to authorized domains
- **Rate Limiting**: Protection against abuse

### Authentication Integration

- **Pi Network Auth**: Seamless integration with Pi authentication
- **User Isolation**: Complete data separation between users
- **Secure Headers**: Security headers for all responses

---

## 🎯 Usage Examples

### Complete User Onboarding Flow

```javascript
// 1. User logs in with Pi Network
const piUser = await authenticateWithPi();

// 2. Check if migration is needed
const migrationStatus = await fetch(`/api/cloud/user/${piUser.uid}/sync`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profile: localProfile,
    inventory: localInventory
  })
});

// 3. Load synchronized data
const inventory = await fetch(`/api/cloud/user/${piUser.uid}/inventory`);
const profile = await fetch(`/api/cloud/user/${piUser.uid}/profile`);

// 4. Update localStorage with merged data
localStorage.setItem('flappypi-inventory', JSON.stringify(inventory.data));
localStorage.setItem('flappypi-profile', JSON.stringify(profile.data));
```

### Game Session Recording

```javascript
// Record completed game session
const recordSession = async (sessionData) => {
  const response = await fetch(`/api/cloud/user/${piUserId}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      score: sessionData.score,
      coins_earned: sessionData.coins,
      duration_seconds: sessionData.duration,
      pipes_passed: sessionData.pipes,
      game_mode: 'normal',
      newTotalScore: updatedTotalScore,
      newGamesPlayed: updatedGamesPlayed,
      newCoinsEarned: updatedCoinsEarned
    })
  });
  
  if (response.ok) {
    console.log('✅ Session recorded and stats updated');
  }
};
```

---

## 🔄 Data Flow Diagrams

### User Login & Sync Flow
```
1. User Login (Pi Network) 
   ↓
2. Check Cloud Data Exists
   ↓
3. Load Local Storage Data
   ↓  
4. Merge Local + Cloud Data
   ↓
5. Sync Merged Data to Cloud
   ↓
6. Update Local Storage
   ↓
7. User Ready to Play
```

### Payment & Item Delivery Flow  
```
1. User Initiates Purchase
   ↓
2. Record Payment (Pending)
   ↓
3. Process Pi Payment
   ↓  
4. Update Payment Status (Completed)
   ↓
5. Add Item to Inventory
   ↓
6. Sync Inventory to Cloud
   ↓
7. Update Local Storage
   ↓
8. Item Available in Game
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Failed**
- Check environment variables
- Verify Supabase URL and keys  
- Ensure network connectivity

**Sync Conflicts**
- Data automatically merged using smart conflict resolution
- Manual resolution available through migration service

**Performance Issues**  
- Check network connectivity
- Monitor circuit breaker status
- Review error logs and retry patterns

### Debug Mode

Enable debug logging:
```bash
DEBUG=flappypi:* npm start
```

### Health Monitoring

```bash
# Check overall health
curl http://localhost:3001/api/health

# Check cloud storage health  
curl http://localhost:3001/api/health/cloud

# Get error statistics
curl http://localhost:3001/api/cloud/health
```

---

## 🎉 Complete Setup Summary

Your Flappy Pi backend now includes:

✅ **Complete Cloud Storage System**
- User profiles, inventory, payments, sessions
- Real-time sync with localStorage  
- Cross-device data compatibility

✅ **Data Migration & Conflict Resolution**
- Smart merging of local and cloud data
- Automatic conflict resolution
- Seamless user experience

✅ **Production-Ready Error Handling**  
- Automatic retries with exponential backoff
- Circuit breaker pattern for resilience
- Graceful degradation and offline support

✅ **Comprehensive API**
- RESTful endpoints for all operations
- Proper HTTP status codes and error messages
- Security and rate limiting

✅ **Performance Optimization**
- Database indexes and query optimization  
- Caching strategies and bulk operations
- Connection pooling and resource management

✅ **Security & Compliance**
- Row Level Security for data isolation
- Input validation and sanitization  
- CORS protection and secure headers

✅ **Testing & Monitoring**
- Comprehensive test suite
- Health monitoring and alerting
- Performance metrics and logging

**🚀 Your Flappy Pi backend cloud storage system is now production-ready!**

---

*For additional support, check the generated test reports and health monitoring endpoints.*