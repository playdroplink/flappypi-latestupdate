// Supabase Configuration
export const SUPABASE_CONFIG = {
  // Get environment variables with fallbacks
  URL: import.meta.env.VITE_SUPABASE_URL || 'https://feiifpwfbfjrjpcvjdfz.supabase.co',
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ',
  
  // Service role key (for server-side functions)
  SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Project settings
  PROJECT_ID: 'feiifpwfbfjrjpcvjdfz',
  
  // API settings
  API_VERSION: 'v1',
  
  // Auth settings
  AUTH: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  
  // Database tables
  TABLES: {
    USER_PROFILES: 'user_profiles',
    GAME_SESSIONS: 'game_sessions',
    LEADERBOARDS: 'leaderboards',
    PURCHASES: 'purchases',
    SHOP_ITEMS: 'shop_items',
    ANALYTICS_EVENTS: 'analytics_events',
    AD_WATCHES: 'ad_watches',
    DAILY_REWARDS: 'daily_rewards'
  },
  
  // Functions
  FUNCTIONS: {
    PI_AUTH: 'pi-auth',
    PI_APPROVE_PAYMENT: 'pi-approve-payment',
    PI_COMPLETE_PAYMENT: 'pi-complete-payment',
    ANALYTICS_TRACK: 'analytics-track',
    REWARD_AD: 'reward-ad',
    SEND_FLAPPY_COINS: 'send-flappy-coins',
    CREATE_REFERRAL_LINK: 'create-referral-link',
    TRACK_REFERRAL: 'track-referral',
    CASH_OUT_REFERRAL_COINS: 'cash-out-referral-coins',
    VERIFY_ADMIN_ROLE: 'verify-admin-role'
  },
  
  // Validation
  isValid(): boolean {
    return !!(this.URL && this.ANON_KEY && this.URL.startsWith('https://'));
  },
  
  // Get headers for API calls
  getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'apikey': this.ANON_KEY
    };
  }
};

// Log configuration status
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration:', {
    url: SUPABASE_CONFIG.URL,
    hasAnonKey: !!SUPABASE_CONFIG.ANON_KEY,
    isValid: SUPABASE_CONFIG.isValid(),
    projectId: SUPABASE_CONFIG.PROJECT_ID
  });
}

export default SUPABASE_CONFIG; 