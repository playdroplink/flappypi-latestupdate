# 🔑 NEW SUPABASE CREDENTIALS - QUICK REFERENCE

```bash
# ========================================
# SUPABASE PROJECT DETAILS
# ========================================
Project ID:    feiifpwfbfjrjpcvjdfz
Project URL:   https://feiifpwfbfjrjpcvjdfz.supabase.co
Region:        aws-1-us-east-1 (US East)
Dashboard:     https://app.supabase.com/project/feiifpwfbfjrjpcvjdfz

# ========================================
# FRONTEND CREDENTIALS (Vite/React)
# ========================================
VITE_SUPABASE_URL="https://feiifpwfbfjrjpcvjdfz.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ"

# ========================================
# BACKEND CREDENTIALS (Server-side)
# ========================================
SUPABASE_URL="https://feiifpwfbfjrjpcvjdfz.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzE4MDUwMSwiZXhwIjoyMDc4NzU2NTAxfQ.8UjMqbh3DTR_Dp63FhgtStUunfDojqxsx8ImCKiUtiw"
SUPABASE_JWT_SECRET="tqgOAaO/+jqKJCu32Zz7ldc9EZW9EucZN8MOfFIGjZRG+wi8sNB3xproi5EHSkx7TBCNwIcqAqcSXU5FA8WbWw=="

# ========================================
# POSTGRES DATABASE CREDENTIALS
# ========================================
POSTGRES_HOST="db.feiifpwfbfjrjpcvjdfz.supabase.co"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="M0E8P4wQGZcwThIw"
POSTGRES_DATABASE="postgres"

# Connection Strings:
# ────────────────────────────────────────

# Pooled (PgBouncer) - Recommended for serverless
POSTGRES_URL="postgres://postgres.feiifpwfbfjrjpcvjdfz:M0E8P4wQGZcwThIw@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"

# Prisma URL (PgBouncer with transaction mode)
POSTGRES_PRISMA_URL="postgres://postgres.feiifpwfbfjrjpcvjdfz:M0E8P4wQGZcwThIw@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Direct Connection (Non-pooling) - For migrations
POSTGRES_URL_NON_POOLING="postgres://postgres.feiifpwfbfjrjpcvjdfz:M0E8P4wQGZcwThIw@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# ========================================
# NEXT.JS / ALTERNATIVE FRAMEWORK
# ========================================
NEXT_PUBLIC_SUPABASE_URL="https://feiifpwfbfjrjpcvjdfz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ"

# ========================================
# CONNECTION VERIFICATION
# ========================================
# Test connection in SQL Editor:
SELECT NOW() AS server_time, current_database() AS database;

# Check all tables:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

# ========================================
# API ENDPOINTS
# ========================================
REST API:     https://feiifpwfbfjrjpcvjdfz.supabase.co/rest/v1/
GraphQL:      https://feiifpwfbfjrjpcvjdfz.supabase.co/graphql/v1
Realtime:     wss://feiifpwfbfjrjpcvjdfz.supabase.co/realtime/v1/
Storage:      https://feiifpwfbfjrjpcvjdfz.supabase.co/storage/v1/

# ========================================
# SECURITY NOTES
# ========================================
✅ SAFE TO EXPOSE (Frontend):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

❌ KEEP SECRET (Backend Only):
   - SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
   - POSTGRES_PASSWORD
   - SUPABASE_JWT_SECRET

⚠️ Row Level Security (RLS):
   - All tables have RLS enabled
   - Users can only access their own data
   - Anon key is safe because of RLS

# ========================================
# QUICK COMMANDS
# ========================================

# Restart dev server after credential change:
npm run dev

# Test Supabase connection in browser console:
const { supabase } = await import('./src/lib/supabase');
const { data, error } = await supabase.from('user_inventory_sync').select('*').limit(1);
console.log(data, error);

# Deploy migration to new database:
# 1. Go to https://app.supabase.com/project/feiifpwfbfjrjpcvjdfz/sql
# 2. Paste contents of migrations/cloud-sync-migration.sql
# 3. Click Run

# ========================================
# FILES UPDATED WITH NEW CREDENTIALS
# ========================================
✅ .env
✅ src/lib/supabase.ts
✅ src/config/supabaseConfig.ts
✅ backend/services/databaseService.js (uses .env automatically)

# ========================================
# MIGRATION STATUS
# ========================================
⚠️ ACTION REQUIRED:
   Deploy migrations/cloud-sync-migration.sql to NEW database
   
📋 Tables to be created:
   - user_inventory_sync
   - renewal_reminders
   - claimed_rewards
   - Plus 5 views and 4 functions

# ========================================
# SUPPORT LINKS
# ========================================
Dashboard:    https://app.supabase.com/project/feiifpwfbfjrjpcvjdfz
SQL Editor:   https://app.supabase.com/project/feiifpwfbfjrjpcvjdfz/sql
Table Editor: https://app.supabase.com/project/feiifpwfbfjrjpcvjdfz/editor
API Docs:     https://app.supabase.com/project/feiifpwfbfjrjpcvjdfz/api
Logs:         https://app.supabase.com/project/feiifpwfbfjrjpcvjdfz/logs

# ========================================
# STATUS
# ========================================
✅ Configuration updated in all files
✅ Credentials ready to use
⏳ Waiting for database migration deployment
⏳ Waiting for dev server restart
⏳ Waiting for connection test

```

**🎯 Next Action:** Deploy `migrations/cloud-sync-migration.sql` to your new Supabase instance!
