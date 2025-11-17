import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/supabaseConfig';

// Create Supabase client with proper configuration
export const supabase = createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY,
  {
    auth: SUPABASE_CONFIG.AUTH,
    db: {
      schema: 'public'
    },
    global: {
      headers: SUPABASE_CONFIG.getHeaders()
    }
  }
);

// Test connection on initialization
if (import.meta.env.DEV) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection error:', error);
    } else {
      console.log('✅ Supabase connected successfully');
      if (data.session) {
        console.log('🔐 User session found');
      }
    }
  });
}

export default supabase; 