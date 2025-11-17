import { createClient } from '@supabase/supabase-js';
import { testSupabaseConfig } from '../utils/supabaseConfigTest';

// Check if we have valid Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://feiifpwfbfjrjpcvjdfz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ';

// Validate Supabase configuration
const isValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co');

if (!isValidSupabaseConfig) {
  console.warn('⚠️ Invalid Supabase configuration detected');
  console.warn('⚠️ Please set up correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  console.warn('⚠️ Supabase features will be disabled until configuration is fixed');
  
  // Run detailed configuration test
  testSupabaseConfig();
} else {
  console.log('✅ Supabase configuration validated successfully');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface GameData {
  id?: number;
  user_id: string;
  data: {
    coins?: number;
    highScore?: number;
    level?: number;
    achievements?: string[];
    settings?: {
      soundEnabled?: boolean;
      musicEnabled?: boolean;
      sensitivity?: number;
    };
    statistics?: {
      gamesPlayed?: number;
      totalDistance?: number;
      totalCoins?: number;
      bestScore?: number;
    };
  };
  updated_at?: string;
  is_anonymous?: boolean;
  pi_username?: string;
  created_at?: string;
}

export interface PublicScore {
  id?: number;
  username: string;
  score: number;
  created_at?: string;
}

// Game data operations
export const gameDataService = {
  // Save game data
  async saveGameData(userId: string, data: GameData['data'], isAnonymous = true, piUsername?: string): Promise<GameData | null> {
    try {
      const { data: result, error } = await supabase
        .from('game_data')
        .upsert({
          user_id: userId,
          data,
          is_anonymous: isAnonymous,
          pi_username: piUsername,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving game data:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error saving game data:', error);
      return null;
    }
  },

  // Load game data
  async loadGameData(userId: string): Promise<GameData | null> {
    try {
      const { data, error } = await supabase
        .from('game_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading game data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading game data:', error);
      return null;
    }
  },

  // Submit score to leaderboard
  async submitScore(username: string, score: number): Promise<PublicScore | null> {
    try {
      const { data, error } = await supabase
        .from('public_scores')
        .insert({
          username,
          score
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting score:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error submitting score:', error);
      return null;
    }
  },

  // Get leaderboard
  async getLeaderboard(limit = 10): Promise<PublicScore[]> {
    try {
      const { data, error } = await supabase
        .from('public_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  // Get user's best score
  async getUserBestScore(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('game_data')
        .select('data')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return 0;
      }

      return data.data?.highScore || data.data?.bestScore || 0;
    } catch (error) {
      console.error('Error getting user best score:', error);
      return 0;
    }
  }
};

// Analytics service
export const analyticsService = {
  // Track game event
  async trackEvent(eventName: string, eventData: any): Promise<void> {
    try {
      // You can implement analytics tracking here
      console.log('Analytics event:', eventName, eventData);
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  },

  // Get game analytics
  async getGameAnalytics(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('game_analytics')
        .select('*')
        .single();

      if (error) {
        console.error('Error getting analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }
}; 