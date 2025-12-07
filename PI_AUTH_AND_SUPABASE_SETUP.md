# Flappy Pi - Authentication Setup & Supabase Connection Guide

## Overview

This guide covers the complete setup of Pi Network authentication and Supabase database integration for Flappy Pi.

---

## Part 1: Pi Network Authentication Setup

### 1.1 Quick Setup

#### **Production Mode (Strict Authentication)**
Set environment variables in your `.env` file:

```bash
# Production - Requires Pi Browser + Pi Auth
NODE_ENV=production
REACT_APP_BYPASS_AUTH=false
REACT_APP_DEBUG_AUTH=false
```

#### **Development Mode (Relaxed)**
For testing without Pi Browser restrictions:

```bash
# Development - No restrictions, debug logging enabled
NODE_ENV=development
REACT_APP_BYPASS_AUTH=true
REACT_APP_DEBUG_AUTH=true
```

#### **Testing Mode (No Restrictions)**
For complete testing freedom:

```bash
# Testing - All features available, debug logging enabled
NODE_ENV=test
REACT_APP_BYPASS_AUTH=true
REACT_APP_DEBUG_AUTH=true
```

---

### 1.2 Configuration Modes

| Mode | Pi Browser | Pi Auth | Local Auth | Debug | Features |
|------|-----------|---------|-----------|-------|----------|
| **Production** | ✅ Required | ✅ Required | ❌ | ❌ | ❌ Restricted |
| **Development** | ❌ | ❌ | ✅ | ✅ | ❌ Restricted |
| **Testing** | ❌ | ❌ | ✅ | ✅ | ✅ All Allowed |

---

### 1.3 Environment Variables

| Variable | Description | Default | Values |
|----------|-------------|---------|--------|
| `NODE_ENV` | Environment mode | `development` | `production`, `development`, `test` |
| `REACT_APP_BYPASS_AUTH` | Bypass all auth restrictions | `false` | `true`, `false` |
| `REACT_APP_DEBUG_AUTH` | Enable auth debug logging | `false` | `true`, `false` |
| `VITE_PI_APP_ID` | Pi Network app ID | `flappypi2807` | - |
| `VITE_PI_NETWORK` | Pi Network environment | `mainnet` | `mainnet`, `testnet` |

---

### 1.4 Pi Network Authentication Flow

#### **Step 1: Browser Detection**
```typescript
// File: src/utils/piBrowserDetection.ts
// Checks:
// - User Agent for Pi Browser indicators
// - window.Pi SDK availability
// - Pi Network domain detection
// - PiNet environment detection
```

The app detects if user is in Pi Browser using:
- User Agent string parsing
- Pi SDK global object availability
- Domain environment detection

#### **Step 2: Authentication Initiation**
```typescript
// File: src/sdk/piJavaScriptSDK.ts (line 56)
// CRITICAL: Must call BEFORE any Pi operations
window.Pi.init({ version: "2.0" });

// User clicks "Login with Pi"
window.Pi.authenticate(
  ['payments', 'username'],  // Required scopes
  onIncompleteProfileHandler,
  onSuccessHandler,
  onErrorHandler
);
```

#### **Step 3: Token Verification**
```
Frontend receives accessToken → sends to `/api/pi/verify-pi-user`
                     ↓
Backend verifies with Pi API → returns user data (uid, username, wallet_address)
                     ↓
Frontend stores in AuthContext + localStorage → user is logged in
```

#### **Step 4: Session Management**
```typescript
// File: src/context/AuthContext.tsx
// Stores with "flappypi-*" prefix:
localStorage.setItem('flappypi-pi-user', JSON.stringify(userData));
localStorage.setItem('flappypi-pi-auth', 'true');
localStorage.setItem('flappypi-username', userData.username);
```

---

### 1.5 Component Architecture

#### **PiBrowserOnly Component**
- Wraps the entire app
- Checks browser environment
- Shows restriction page for non-Pi browsers
- Configuration: `src/config/authConfig.ts`

#### **PiAuthGuard Component**
- Protects individual routes
- Checks authentication status
- Redirects to login if needed
- Handles authentication errors

#### **PiAuthLogin Component**
- Handles Pi Network authentication
- Shows login interface
- Manages authentication flow
- Path: `src/components/PiAuthLogin.tsx`

---

### 1.6 LocalStorage Keys (Flappy Pi Namespace)

All authentication data uses the `flappypi-*` prefix to prevent collisions:

```javascript
localStorage.getItem('flappypi-pi-user')          // Pi user data (JSON)
localStorage.getItem('flappypi-pi-auth')          // Auth status (boolean)
localStorage.getItem('flappypi-username')         // Username (string)
localStorage.getItem('flappypi-password')         // Password hash (local auth)
localStorage.getItem('flappypi-inventory')        // User inventory (JSON array)
localStorage.getItem('flappypi-accessToken')      // Pi access token
```

---

### 1.7 Feature Restrictions (When Auth Enabled)

When authentication is enforced, these features are restricted to authenticated users:

**Payment Features:**
- Pi cryptocurrency payments
- In-app purchases
- Payment history
- Subscription management

**Social Features:**
- Leaderboards
- Community features
- User profiles
- Rewards distribution

**Ad Features:**
- Banner ads
- Rewarded ads
- Ad-free subscriptions

---

### 1.8 Testing Authentication

#### **Test Pi Browser Detection**
```javascript
// In browser console
console.log(window.Pi);                          // Should be defined in Pi Browser
console.log(navigator.userAgent);                // Should contain Pi Browser indicators
```

#### **Test Authentication Status**
```javascript
// Check localStorage for auth data
console.log(localStorage.getItem('flappypi-pi-auth'));
console.log(localStorage.getItem('flappypi-pi-user'));
console.log(JSON.parse(localStorage.getItem('flappypi-pi-user')));
```

#### **Test Configuration**
```javascript
// Check auth config
import { authConfig } from './src/config/authConfig';
console.log(authConfig);
```

#### **Enable Debug Mode**
```bash
REACT_APP_DEBUG_AUTH=true
# Restart dev server - will show detailed auth logs in console
```

---

### 1.9 Troubleshooting Authentication

#### **Problem: Infinite Redirect Loop**
**Cause:** Authentication check keeps redirecting to login
**Solution:** Check `location.pathname !== '/pi-browser-login'` condition is working

#### **Problem: Pi Browser Not Detected**
**Cause:** Pi Browser users see restriction page
**Solution:**
- Check browser detection logic in `src/utils/piBrowserDetection.ts`
- Verify Pi SDK is loaded
- Check user agent string in browser console

#### **Problem: Authentication Not Persisting**
**Cause:** Users need to login repeatedly
**Solution:**
- Check localStorage permissions
- Verify session timeout settings
- Check AuthContext implementation

#### **Problem: Development Mode Not Working**
**Cause:** Restrictions still active despite dev settings
**Solution:**
- Verify `NODE_ENV=development`
- Set `REACT_APP_BYPASS_AUTH=true`
- Verify `.env` file is in project root
- Restart development server with `npm run dev`

---

## Part 2: Supabase Database Connection

### 2.1 Quick Setup

#### **Required Environment Variables**

Add these to your `.env` file:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Where to find these:**
1. Go to https://app.supabase.com
2. Select your Flappy Pi project
3. Click "Settings" → "API"
4. Copy the values under "Project URL" and "API Keys"

---

### 2.2 Supabase Database Schema

#### **Key Tables**

##### **1. user_profiles**
Stores Pi user data and game statistics.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT UNIQUE NOT NULL,
  username VARCHAR(255),
  email VARCHAR(255),
  wallet_address VARCHAR(255),
  
  -- Game Statistics
  total_score BIGINT DEFAULT 0,
  high_score BIGINT DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  coins_earned BIGINT DEFAULT 0,
  
  -- Subscription Information
  subscription_status VARCHAR(50) DEFAULT 'none',
  subscription_plan VARCHAR(50),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

##### **2. user_inventory**
Stores user's items, power-ups, and purchases.

```sql
CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT UNIQUE NOT NULL,
  items JSONB DEFAULT '[]',
  
  -- Sync Information
  last_sync_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id)
);
```

##### **3. payment_records**
Tracks all Pi cryptocurrency payments.

```sql
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  pi_user_id TEXT NOT NULL,
  
  amount DECIMAL(20, 8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PI',
  memo TEXT,
  
  -- Transaction Information
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id)
);
```

##### **4. renewal_reminders**
Tracks subscription expiry and renewal notifications.

```sql
CREATE TABLE renewal_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  subscription_id VARCHAR(255),
  subscription_type VARCHAR(50),
  expiry_date TIMESTAMPTZ,
  
  reminder_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id)
);
```

##### **5. claimed_rewards**
Records all rewards distributed to users.

```sql
CREATE TABLE claimed_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pi_user_id TEXT NOT NULL,
  
  reward_type VARCHAR(50),
  subscription_type VARCHAR(50),
  reward_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (pi_user_id) REFERENCES user_profiles(pi_user_id)
);
```

---

### 2.3 Database Setup Steps

#### **Step 1: Deploy Database Migration**

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your Flappy Pi project

2. **Access SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run Migration**
   - Copy entire contents of `CLEAN_SUPABASE_SETUP.sql`
   - Paste into SQL editor
   - Click "Run" button

4. **Verify Tables Created**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'user_profiles', 
     'user_inventory', 
     'payment_records',
     'renewal_reminders',
     'claimed_rewards'
   );
   ```
   **Expected Result:** 5 rows

---

#### **Step 2: Configure Client Connection**

The Supabase client is initialized in `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Verify this file exists and has correct imports before proceeding.**

---

#### **Step 3: Test Connection**

In browser console:

```javascript
// Test Supabase connection
const { supabase } = await import('./src/integrations/supabase/client.ts');
const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
console.log(data, error);  // Should return empty array, no error
```

---

### 2.4 Cloud Sync Integration

#### **How It Works**

1. **localStorage is the cache** - Fast, offline access
2. **Supabase is the source of truth** - Cloud persistence
3. **Sync happens automatically** - On login, purchase, or interval

#### **Sync Flow**
```
User Login
    ↓
Load inventory from localStorage (fast)
    ↓
Check Supabase for cloud version (in background)
    ↓
If cloud version is newer, merge and update localStorage
    ↓
User sees instant response, cloud sync completes silently
```

#### **Inventory Service Cloud Sync**

File: `src/services/inventoryService.ts` (2090+ lines)

**Key Methods:**

```typescript
// Upload inventory to Supabase
syncInventoryToCloud(userId: string): Promise<void>

// Download inventory from Supabase
loadInventoryFromCloud(userId: string): Promise<any[]>

// Merge local and cloud data intelligently
mergeInventoryData(local: any[], cloud: any[]): any[]

// Full sync workflow
performFullCloudSync(userId: string): Promise<void>

// Check sync status
getCloudSyncStatus(userId: string): Promise<SyncStatus>
```

#### **Subscription Service Cloud Tracking**

File: `src/services/subscriptionService.ts`

**Key Methods:**

```typescript
// Find subscriptions expiring soon
checkExpiringSubscriptions(userId: string, daysThreshold: number = 7)

// Get exact expiry date
getSubscriptionExpiryDate(plan: string): Date

// Create renewal notifications
saveRenewalReminders(userId: string, subscriptions: any[])

// Get pending reminders
getPendingRenewalReminders(userId: string)

// Record claimed rewards
recordClaimedRewards(userId: string, rewardType: string, rewardData: any)

// Get reward history
getClaimedRewardsHistory(userId: string)
```

---

### 2.5 Cloud Sync Testing

#### **Test Initial Sync**

1. **Start Development Server**
   ```powershell
   npm run dev
   ```

2. **Login with Pi Account**
   - Click "Login with Pi"
   - Approve authentication

3. **Watch Console for Sync Messages**
   ```
   🔄 Starting full cloud sync for user: [user_id]
   📦 Local inventory: X items
   ☁️ Cloud inventory: X items
   🔀 Merged inventory: X items
   💾 Saved merged inventory to localStorage
   ✅ Full cloud sync completed successfully
   ```

4. **Verify in Supabase**
   - Go to Supabase Dashboard → Table Editor
   - Open `user_inventory` table
   - Find your `pi_user_id`
   - Check `items` column (should have JSON array)

#### **Test Cross-Device Sync**

1. **Device A**
   - Login with Pi account
   - Purchase an item
   - Verify item appears in inventory

2. **Device B (Different Browser/Device)**
   - Login with SAME Pi account
   - Wait for sync (1-2 seconds)
   - Verify item appears

3. **Expected Console Messages**
   ```
   ✅ Loaded X items from cloud (last sync: [timestamp])
   🔀 Merged inventory: X items
   ✅ Cloud sync completed successfully
   ```

#### **Test Subscription Expiry Tracking**

1. **Create Test Subscription in Supabase**
   ```sql
   UPDATE user_profiles
   SET 
     subscription_status = 'active',
     subscription_start = NOW(),
     subscription_end = NOW() + INTERVAL '5 days',
     subscription_plan = 'starter'
   WHERE pi_user_id = 'your_pi_user_id';
   ```

2. **Login and Check Expiry**
   - Should see: `✅ Active subscription found, checking expiry...`
   
3. **Verify Renewal Reminder Created**
   ```sql
   SELECT * FROM renewal_reminders 
   WHERE pi_user_id = 'your_pi_user_id';
   ```
   Expected: 1 row with `reminder_sent = false`

---

### 2.6 Configuration Options

#### **Auto-Sync Settings**

File: `src/hooks/useCloudSync.ts`

```typescript
// Enable auto-sync
const { syncStatus } = useCloudSync(piUserId, true);

// Disable auto-sync (manual only)
const { syncStatus } = useCloudSync(piUserId, false);

// Trigger manual sync
const { triggerManualSync } = useCloudSync(piUserId);
await triggerManualSync();
```

#### **Customize Sync Frequency**

Edit `useCloudSync.ts`:

```typescript
// Status check interval (default: 5 minutes)
const statusCheckInterval = setInterval(() => {
  getSyncStatus();
}, 5 * 60 * 1000);  // Change this value

// Inventory update debounce (default: 2 seconds)
setTimeout(() => {
  if (!isSyncingRef.current) {
    performCloudSync(piUserId);
  }
}, 2000);  // Change this value
```

#### **Customize Expiry Warning Window**

Edit `subscriptionService.ts`:

```typescript
// Default 7 days before expiry
async checkExpiringSubscriptions(
  piUserId: string, 
  daysThreshold: number = 7  // Change this value
)
```

---

### 2.7 Monitoring & Debugging

#### **View Sync Status in Console**

```javascript
const { inventoryService } = await import('./src/services/inventoryService');
const status = await inventoryService.getCloudSyncStatus('your_pi_user_id');
console.log(status);
```

**Expected Output:**
```javascript
{
  hasSyncedData: true,
  lastSyncTime: "2025-11-15T10:30:00.000Z",
  itemCount: 15,
  syncStatus: "completed"
}
```

#### **View Supabase Logs**

1. Go to Supabase Dashboard
2. Click "Logs" → "Edge Functions"
3. Check for any sync errors

#### **Check Table Data**

In Supabase Dashboard → Table Editor:

```sql
-- View your user profile
SELECT * FROM user_profiles WHERE pi_user_id = 'your_user_id';

-- View your inventory
SELECT * FROM user_inventory WHERE pi_user_id = 'your_user_id';

-- View your payments
SELECT * FROM payment_records WHERE pi_user_id = 'your_user_id';

-- View renewal reminders
SELECT * FROM renewal_reminders WHERE pi_user_id = 'your_user_id';

-- View claimed rewards
SELECT * FROM claimed_rewards WHERE pi_user_id = 'your_user_id';
```

---

## Part 3: Integrated Authentication + Supabase Flow

### 3.1 Complete User Journey

```
1. User opens app
   ↓
2. Detects browser (Pi Browser vs Regular)
   ↓
3. If Pi Browser detected:
   a. Shows "Login with Pi" button
   b. User clicks → Pi OAuth popup
   c. User approves scopes (payments, username)
   ↓
4. Frontend receives accessToken
   ↓
5. Sends token to backend: POST /api/pi/verify-pi-user
   ↓
6. Backend verifies with Pi API
   ↓
7. Backend returns user data (uid, username, wallet_address)
   ↓
8. Frontend stores in:
   - localStorage with flappypi-* prefix
   - React Context (AuthContext)
   ↓
9. useCloudSync hook triggers
   ↓
10. Loads user inventory from Supabase
    - If cloud newer: merge and update
    - If local newer: upload to cloud
   ↓
11. Checks subscription status and expiry
   ↓
12. User can now make purchases, see leaderboard, etc.
```

---

### 3.2 Error Handling Pattern

Both Pi Auth and Supabase use graceful degradation:

```typescript
// Example: Supabase failures don't crash app
async safeSupabaseCall<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('Supabase operation failed:', error);
    return fallback;  // Return fallback instead of crashing
  }
}
```

**Pattern:** Use console.warn, not console.error. App continues gracefully.

---

## Part 4: Critical Security Notes

### 4.1 Client-Side Limitations

⚠️ **Important:**
- All auth checks are client-side
- Users can bypass with browser dev tools
- **ALWAYS validate server-side for sensitive operations**

### 4.2 Environment Variable Safety

**Safe (tracked in git):**
```bash
# .env (committed to git)
VITE_PI_APP_ID=flappypi2807
VITE_PI_NETWORK=mainnet
NODE_ENV=production
```

**Secret (NOT tracked in git):**
```bash
# .env.local (gitignored)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_SERVICE_ROLE_KEY=...
```

### 4.3 Supabase Row Level Security (RLS)

Policies are configured in `CLEAN_SUPABASE_SETUP.sql`:

```sql
-- Example: Users can only access their own data
CREATE POLICY "Users can manage own profile"
ON user_profiles
FOR ALL
USING (auth.uid()::text = pi_user_id);
```

---

## Part 5: Quick Reference Commands

### Development Commands

```powershell
# Start frontend dev server (port 1113)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Start backend server (port 3001)
cd backend
node server.cjs
```

### Testing Commands

```powershell
# Test payment system
node test-payment-system.cjs

# Test Pi mainnet payments
node test-pi-mainnet-payments.js

# Verify payment fixes
node verify-payment-fixes.cjs
```

### Database Commands (Supabase SQL Editor)

```sql
-- View all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- View user profile
SELECT * FROM user_profiles WHERE pi_user_id = 'your_user_id';

-- View user inventory
SELECT * FROM user_inventory WHERE pi_user_id = 'your_user_id';

-- Check payment history
SELECT * FROM payment_records WHERE pi_user_id = 'your_user_id';

-- View renewal reminders
SELECT * FROM renewal_reminders 
WHERE pi_user_id = 'your_user_id' AND reminder_sent = false;
```

---

## Summary

**Pi Auth Setup:**
✅ Environment variables configured
✅ Components in place (PiBrowserOnly, PiAuthGuard, PiAuthLogin)
✅ localStorage namespace (flappypi-*)
✅ Testing/debugging tools available

**Supabase Connection:**
✅ Database tables created (5 main tables)
✅ Client initialized in `src/integrations/supabase/client.ts`
✅ Cloud sync implemented in inventoryService
✅ Subscription tracking in subscriptionService
✅ Cross-device sync working

**Next Steps:**
1. Verify `.env` file has all required variables
2. Run database migration in Supabase
3. Test authentication flow with `npm run dev`
4. Test cloud sync with cross-device login
5. Monitor console for sync messages and errors

