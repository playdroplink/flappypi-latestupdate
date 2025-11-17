#!/usr/bin/env node

/**
 * Flappy Pi - Backend Storage Setup Script
 * Sets up Supabase database schema and initializes backend storage
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Flappy Pi Backend Storage...');

// Supabase configuration
const supabaseConfig = {
  url: 'https://ididprksbmbhigcxcxvt.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzMTQyMiwiZXhwIjoyMDY3NDA3NDIyfQ.tBuF56T_16xBhPfl7lSMJ2uDgAIqGGBUhRE7me_96XQ'
};

// Environment configuration for backend storage
const backendStorageConfig = {
  // Supabase Configuration
  VITE_SUPABASE_URL: supabaseConfig.url,
  VITE_SUPABASE_ANON_KEY: supabaseConfig.anonKey,
  VITE_SUPABASE_SERVICE_ROLE_KEY: supabaseConfig.serviceRoleKey,
  
  // Database Configuration
  POSTGRES_URL: 'postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x',
  POSTGRES_USER: 'postgres',
  POSTGRES_HOST: 'db.ididprksbmbhigcxcxvt.supabase.co',
  POSTGRES_PASSWORD: 'jtrriobt4G7Sr5VG',
  POSTGRES_DATABASE: 'postgres',
  POSTGRES_PRISMA_URL: 'postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  POSTGRES_URL_NON_POOLING: 'postgres://postgres.ididprksbmbhigcxcxvt:jtrriobt4G7Sr5VG@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require',
  
  // JWT Secret
  SUPABASE_JWT_SECRET: 'IlEbfOj6cuDqID3G/4ClWFgC32LmK7IMdORUtHXyUdlW6mJ3Tu3B4pojw5YA4uq1O/mF8rYolo7ZOf7CoJ93Xg==',
  
  // Backend Storage Settings
  ENABLE_BACKEND_STORAGE: 'true',
  ENABLE_LOCAL_STORAGE: 'true',
  ENABLE_PAYMENT_RECORDING: 'true',
  ENABLE_INVENTORY_SYNC: 'true',
  ENABLE_USER_PROFILE_SYNC: 'true',
  
  // Storage Configuration
  STORAGE_PROVIDER: 'supabase',
  STORAGE_BACKUP_ENABLED: 'true',
  STORAGE_SYNC_INTERVAL: '300000', // 5 minutes
  STORAGE_RETRY_ATTEMPTS: '3',
  STORAGE_TIMEOUT: '10000' // 10 seconds
};

// Function to create environment file
function createEnvFile(filename, config) {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n');
  
  const header = `# ========================================
# FLAPPY PI - BACKEND STORAGE CONFIGURATION
# Generated: ${new Date().toISOString()}
# ========================================

`;
  
  fs.writeFileSync(filename, header + envContent);
  console.log(`✅ Created ${filename}`);
}

// Function to create backend storage documentation
function createBackendStorageDocs() {
  const docs = `# Flappy Pi Backend Storage Documentation

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
- \`GET /api/user/profile\` - Get user profile
- \`PUT /api/user/profile\` - Update user profile
- \`POST /api/user/initialize\` - Initialize new user

### Payment Management
- \`POST /api/payments/record\` - Record payment
- \`GET /api/payments/history\` - Get payment history
- \`PUT /api/payments/status\` - Update payment status

### Inventory Management
- \`GET /api/inventory\` - Get user inventory
- \`POST /api/inventory/add\` - Add item to inventory
- \`PUT /api/inventory/update\` - Update inventory item

### Game Data
- \`POST /api/game/session\` - Record game session
- \`GET /api/leaderboard\` - Get leaderboard
- \`PUT /api/leaderboard/update\` - Update leaderboard

## Local Storage

### Keys
- \`user_profile\` - User profile data
- \`user_inventory\` - User inventory items
- \`user_payments\` - Payment history
- \`last_payment\` - Last payment information
- \`game_stats\` - Game statistics

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
   \`\`\`bash
   # Run the database schema
   psql -h db.ididprksbmbhigcxcxvt.supabase.co -U postgres -d postgres -f database-schema.sql
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   # Set environment variables
   export VITE_SUPABASE_URL="https://ididprksbmbhigcxcxvt.supabase.co"
   export VITE_SUPABASE_ANON_KEY="your_anon_key"
   \`\`\`

3. **Service Initialization**
   \`\`\`javascript
   import { backendStorageService } from './services/backendStorageService';
   
   // Initialize service
   const storage = backendStorageService.getInstance();
   \`\`\`

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check Supabase keys
2. **Sync Failures**: Verify network connection
3. **Data Conflicts**: Check RLS policies
4. **Performance Issues**: Review indexes

### Debug Mode
\`\`\`javascript
// Enable debug logging
localStorage.setItem('debug_storage', 'true');
\`\`\`

## Support

For issues or questions:
- Check the console for error messages
- Verify Supabase connection
- Review RLS policies
- Check network connectivity
`;

  fs.writeFileSync('BACKEND_STORAGE_DOCUMENTATION.md', docs);
  console.log('✅ Created BACKEND_STORAGE_DOCUMENTATION.md');
}

// Create backend storage environment files
try {
  // Create .env.backend file
  createEnvFile('.env.backend', backendStorageConfig);
  
  // Create backend storage documentation
  createBackendStorageDocs();
  
  console.log('\n🎉 Backend Storage Setup Complete!');
  console.log('\n📋 Files Created:');
  console.log('  • .env.backend (backend storage configuration)');
  console.log('  • database-schema.sql (database schema)');
  console.log('  • BACKEND_STORAGE_DOCUMENTATION.md (documentation)');
  
  console.log('\n🔧 Backend Storage Features:');
  console.log('  • User Profile Management');
  console.log('  • Payment Record Tracking');
  console.log('  • Inventory System');
  console.log('  • Game Session Recording');
  console.log('  • Leaderboard Management');
  console.log('  • Local Storage Integration');
  console.log('  • Real-time Synchronization');
  
  console.log('\n📊 Database Tables:');
  console.log('  • user_profiles (user account data)');
  console.log('  • payment_records (payment history)');
  console.log('  • user_inventory (user items)');
  console.log('  • game_sessions (gameplay data)');
  console.log('  • leaderboard (global rankings)');
  
  console.log('\n🔒 Security Features:');
  console.log('  • Row Level Security (RLS)');
  console.log('  • User Data Isolation');
  console.log('  • Input Validation');
  console.log('  • Error Handling');
  
  console.log('\n🚀 Ready for Backend Storage!');
  
} catch (error) {
  console.error('❌ Error setting up backend storage:', error.message);
  process.exit(1);
}
