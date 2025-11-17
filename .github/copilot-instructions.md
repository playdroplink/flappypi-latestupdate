# Flappy Pi - AI Agent Instructions

## Project Overview
Flappy Pi is a Flappy Bird-style game with **deep Pi Network blockchain integration**. This is NOT a simple game - it's a production blockchain payment system with authentication, A2U payments, ad network, and cloud persistence.

## Architecture: Dual Runtime

### Frontend (Vite + React + TypeScript)
- **Port**: 1113 (dev server via `npm run dev`)
- **Build**: `npm run build` → outputs to `dist/`
- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Key Directories**:
  - `src/components/` - UI components (game, auth, shop, modals)
  - `src/services/` - Business logic (inventory, subscriptions, Pi ads, payments)
  - `src/context/` - React contexts (AuthContext manages both Pi OAuth and local auth)
  - `src/utils/` - Helpers (Pi auth, payment flows, browser detection)
  - `src/sdk/` - Pi JavaScript SDK wrapper (`piJavaScriptSDK.ts`)

### Backend (Express + Node.js)
- **Location**: `backend/` directory
- **Port**: 3001 (production) or as configured
- **Entry**: `backend/server.cjs`
- **API Routes**:
  - `/api/pi/*` - Pi Network verification and auth
  - `/api/payments/*` - A2U payment lifecycle (create/submit/complete/cancel)
- **Key Services**: `backend/services/piService.js` - handles Pi Network API calls

## Pi Network Integration (Critical)

### Authentication Flow
1. User clicks "Login with Pi" → triggers `window.Pi.authenticate(['payments', 'username'])`
2. Pi OAuth popup → user approves scopes
3. Frontend receives `accessToken` → sends to `/api/pi/verify-pi-user`
4. Backend verifies with Pi API → returns user data (`uid`, `username`, `wallet_address`)
5. Frontend stores in AuthContext and localStorage with `flappypi-*` prefix

**Key Files**:
- `src/context/AuthContext.tsx` - manages auth state and Pi login flow
- `src/sdk/piJavaScriptSDK.ts` - Pi SDK initialization and wrapper
- `backend/routes/pi.cjs` - Pi verification endpoints

### Payment Flow (A2U - App-to-User)
This is a **3-step process** (create → submit → complete):
1. **Create**: Frontend calls `/api/payments/create` with amount/memo/uid → backend creates payment via Pi API → returns `paymentId`
2. **Submit**: Frontend calls `/api/payments/submit` with `paymentId` → backend submits to blockchain → returns `txid`
3. **Complete**: Frontend calls `/api/payments/complete` with `paymentId` and `txid` → backend marks payment complete and stores in Supabase

**Key Files**:
- `backend/routes/payments.js` - payment endpoints
- `backend/services/piService.js` - Pi Network API integration
- `src/utils/piPayment.ts` - frontend payment helpers
- See `A2U_PAYMENT_SYSTEM_IMPLEMENTATION.md` for detailed flow diagrams

### Environment Variables
- **CRITICAL**: Use `.env` for public values (tracked in git), `.env.local` for secrets (gitignored)
- **Naming Convention**: 
  - `VITE_*` prefix for frontend build-time variables
  - `REACT_APP_*` prefix for frontend runtime
  - Backend uses plain `PI_API_KEY`, `PI_NETWORK_API_KEY`, etc.
- **Pi Config**: `PI_APP_ID=flappypi2807`, `PI_NETWORK=mainnet`, `ENABLE_PI_PAYMENTS=true`

## Data Persistence Strategy

### localStorage Patterns
- **Prefix**: ALL keys use `flappypi-*` namespace (e.g., `flappypi-inventory`, `flappypi-pi-user`, `flappypi-username`)
- **Why**: Prevents collisions with other apps in browser
- **Key Stores**:
  - `flappypi-inventory` - user's items/purchases (array of InventoryItem objects)
  - `flappypi-pi-user` - Pi Network user data (JSON stringified)
  - `flappypi-pi-auth` - boolean flag for Pi auth status
  - `flappypi-username` and `flappypi-password` - local auth fallback

### Supabase Integration
- **Tables**: `payments`, `users`, `inventory` (see `database-schema.sql`)
- **Pattern**: localStorage is cache, Supabase is source of truth
- **Service**: `src/services/inventoryService.ts` (2090+ lines) manages inventory with plan for cloud sync
- **Future**: Cloud sync hooks planned (see `BACKEND_INTEGRATION_OVERVIEW.md` and `BACKEND_CLOUD_SYNC_PLAN.md`)

## Key Services Architecture

### inventoryService.ts (Most Complex Service)
- **Purpose**: Manages all user items, subscriptions, purchases
- **Pattern**: Singleton (`InventoryService.getInstance()`)
- **Key Methods**:
  - `saveToInventory(item)` - adds item to localStorage
  - `getInventory()` - retrieves all items
  - `getSubscriptions()` - filters active subscriptions
  - `sanitizeInventoryData()` - fixes malformed data
- **Critical**: Always check expiration dates on subscriptions before granting benefits

### subscriptionService.ts
- **Purpose**: Handles subscription lifecycle and rewards
- **Pattern**: Reward distribution happens at purchase time (not lazy)
- **Key Files**: `src/constants/subscriptionRewards.ts` defines rewards per plan tier

### piAdsService.ts
- **Purpose**: Pi Ad Network integration (interstitials, rewarded ads)
- **Pattern**: Initialize AFTER authentication completes
- **Rewards**: Directly updates wallet balance and localStorage

## Development Workflows

### Starting Dev Environment
```bash
# Frontend (port 1113)
npm run dev

# Backend (port 3001, separate terminal)
cd backend
node server.cjs
```

### Common Build/Deploy Commands
- `npm run build` - production build to `dist/`
- `npm run build:dev` - development mode build
- `npm run preview` - preview production build

### Testing Payment Flow
Use test scripts in root:
- `test-payment-system.cjs` - full E2E payment test
- `test-pi-mainnet-payments.js` - mainnet payment verification
- `verify-payment-fixes.cjs` - payment system health check

## Code Conventions & Patterns

### TypeScript Typing
- **Strict**: All new code should have explicit types
- **Pi Types**: See `src/types/pi.d.ts` for Pi SDK type definitions
- **Service Interfaces**: Define interfaces for inventory items, purchase history, etc.

### Error Handling
- **Pattern**: Try-catch with console warnings, not errors (graceful degradation)
- **Example**: `safeSupabaseCall()` wrapper in `inventoryService.ts` - Supabase failures don't crash app
- **User Feedback**: Use `toast()` from `@/hooks/use-toast` for user-facing errors

### Modal/Dialog Pattern
- **Library**: Radix UI dialogs (`@radix-ui/react-dialog`)
- **Payment Modals**: `src/components/NewPiPaymentModal.tsx` is the canonical payment UI
- **Auth Modals**: `src/components/PiAuthLogin.tsx` for Pi login flow

### State Management
- **Global State**: React Context (AuthContext, GlobalMusicContext)
- **Local State**: React hooks (useState, useEffect)
- **NO Redux or external state library**

## Critical "Gotchas"

1. **Pi SDK Initialization**: MUST call `window.Pi.init()` before ANY Pi operations. Check `src/sdk/piJavaScriptSDK.ts` line 56
2. **Payment Status**: Payments go through states: `pending` → `submitted` → `completed`. NEVER assume immediate completion
3. **CORS Configuration**: Backend CORS must allow Pi Browser domains (`*.pinet.com`, `*.minepi.com`). See `backend/server.cjs`
4. **Localhost vs Production**: Pi SDK behaves differently in localhost (sandbox mode allowed) vs production (mainnet only)
5. **Inventory Cleanup**: `inventoryService.ts` runs expiration monitor - don't duplicate this logic elsewhere

## Documentation Resources

### Architecture & Integration
- `PI_ARCHITECTURE.md` - full system architecture with diagrams
- `BACKEND_INTEGRATION_OVERVIEW.md` - backend cloud sync explanation
- `COMPREHENSIVE_PI_AUDIT.md` - complete Pi integration audit

### Payment System
- `A2U_PAYMENT_SYSTEM_IMPLEMENTATION.md` - payment flow details
- `PAYMENT_SYSTEM_README.md` - payment system overview
- `PAYMENT_TESTING_GUIDE.md` - how to test payments

### Quick References
- `QUICK_START.md` - 3-minute setup guide
- `START_HERE.md` - orientation for new developers
- Many feature-specific docs (100+ markdown files) - use grep/search to find relevant docs

## When Making Changes

### Adding New Features
1. Check if similar feature exists in 100+ markdown docs (grep for keywords)
2. Follow existing service patterns (singleton, error handling, localStorage prefix)
3. Update relevant documentation (feature-specific .md file)
4. Test with BOTH Pi authentication and local auth

### Modifying Payment Flow
1. **STOP**: Read `A2U_PAYMENT_SYSTEM_IMPLEMENTATION.md` first
2. Changes require coordinating frontend + backend
3. Test with `test-payment-system.cjs` before deploying
4. Update Supabase schema if adding fields to `payments` table

### Working with Inventory
1. Use `inventoryService.getInstance()` - don't create new instances
2. ALL writes go through `saveToInventory()` method
3. Check for expiration before granting subscription benefits
4. Sanitize data with `sanitizeInventoryData()` if modifying structure

## Deployment Notes
- **Platform**: Vercel (see `vercel.json`)
- **Environment Variables**: Set in Vercel dashboard (NOT in .env)
- **Validation Keys**: Required in `public/.well-known/` for Pi Browser validation
- **Backend**: Deploys as serverless functions via Vercel
