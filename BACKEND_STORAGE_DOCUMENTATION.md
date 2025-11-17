# Flappy Pi Backend Storage Documentation

## Overview
The Flappy Pi backend storage system provides comprehensive data management using Supabase and local storage.

## Features
- **User Profiles**: Complete user profile management
- **Payment Records**: Full payment history tracking
- **Inventory System**: User item and power-up management
- **Game Sessions**: Gameplay data and statistics
- **Leaderboard**: Global and user rankings
- **Local Storage**: Offline data caching
- **Real-time Sync**: Automatic data synchronization

## Database Schema

### Tables
1. **user_profiles**: User account information
2. **payment_records**: Payment transaction history
3. **user_inventory**: User-owned items and power-ups
4. **game_sessions**: Individual game session data
5. **leaderboard**: Global leaderboard rankings

### Key Features
- Row Level Security (RLS) for data protection
- Automatic timestamp management
- JSONB support for flexible data structures
- Optimized indexes for performance
- Real-time triggers for leaderboard updates

## API Endpoints

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/initialize` - Initialize new user

### Payment Management
- `POST /api/payments/record` - Record payment
- `GET /api/payments/history` - Get payment history
- `PUT /api/payments/status` - Update payment status

### Inventory Management
- `GET /api/inventory` - Get user inventory
- `POST /api/inventory/add` - Add item to inventory
- `PUT /api/inventory/update` - Update inventory item

### Game Data
- `POST /api/game/session` - Record game session
- `GET /api/leaderboard` - Get leaderboard
- `PUT /api/leaderboard/update` - Update leaderboard

## Local Storage

### Keys
- `user_profile` - User profile data
- `user_inventory` - User inventory items
- `user_payments` - Payment history
- `last_payment` - Last payment information
- `game_stats` - Game statistics

### Sync Process
1. Check for local changes
2. Upload to Supabase
3. Download remote changes
4. Merge conflicts
5. Update local storage

## Security

### Row Level Security
- Users can only access their own data
- Public read access for leaderboard
- Authenticated write access for all tables

### Data Validation
- Input sanitization
- Type checking
- Required field validation
- JSON schema validation

## Performance

### Indexes
- User ID indexes for fast lookups
- Payment status indexes for filtering
- Score indexes for leaderboard sorting
- Timestamp indexes for time-based queries

### Caching
- Local storage for immediate access
- Supabase caching for remote data
- Automatic cache invalidation
- Background sync processes

## Error Handling

### Retry Logic
- Automatic retry for failed requests
- Exponential backoff for rate limiting
- Fallback to local storage
- Error logging and monitoring

### Offline Support
- Local storage backup
- Queue for offline actions
- Automatic sync when online
- Conflict resolution

## Monitoring

### Metrics
- Payment success rates
- Storage sync performance
- User engagement data
- Error rates and types

### Logging
- Payment transactions
- Storage operations
- Error tracking
- Performance metrics

## Setup Instructions

1. **Database Setup**
   ```bash
   # Run the database schema
   psql -h db.ididprksbmbhigcxcxvt.supabase.co -U postgres -d postgres -f database-schema.sql
   ```

2. **Environment Configuration**
   ```bash
   # Set environment variables
   export VITE_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
   export VITE_SUPABASE_ANON_KEY="your_anon_key"
   ```

3. **Service Initialization**
   ```javascript
   import { backendStorageService } from './services/backendStorageService';
   
   // Initialize service
   const storage = backendStorageService.getInstance();
   ```

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check Supabase keys
2. **Sync Failures**: Verify network connection
3. **Data Conflicts**: Check RLS policies
4. **Performance Issues**: Review indexes

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug_storage', 'true');
```

## Support

For issues or questions:
- Check the console for error messages
- Verify Supabase connection
- Review RLS policies
- Check network connectivity
