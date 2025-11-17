// Cloud Storage Utility - Works without Pi login
// Uses Supabase for cloud storage with local fallback

import { createClient } from '@supabase/supabase-js';

interface GameData {
  coins: number;
  highScore: number;
  unlockedItems: string[];
  settings: any;
  lastPlayed: string;
  [key: string]: any;
}

interface CloudStorageResponse {
  success: boolean;
  data?: GameData;
  error?: string;
}

class CloudStorageManager {
  private anonymousId: string;
  private supabase: any;

  constructor() {
    this.anonymousId = this.getOrCreateAnonymousId();
    
    // Initialize Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Supabase credentials not found. Cloud storage will be limited to local only.');
      this.supabase = null;
    }
  }

  private getOrCreateAnonymousId(): string {
    let id = localStorage.getItem('anonymous-user-id');
    if (!id) {
      id = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('anonymous-user-id', id);
    }
    return id;
  }

  // Add network prefix helper
  private getNetworkPrefix() {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PI_NETWORK) {
      return import.meta.env.VITE_PI_NETWORK === 'testnet' ? 'testnet' : 'mainnet';
    }
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'testnet';
    }
    return 'mainnet';
  }

  private getCloudGameDataKey() {
    return `${this.getNetworkPrefix()}_flappy-game-data`;
  }

  private getCloudGameDataLastSaveKey() {
    return `${this.getNetworkPrefix()}_flappy-last-save`;
  }

  // Save data locally (always works)
  async saveLocally(data: GameData): Promise<boolean> {
    try {
      localStorage.setItem(this.getCloudGameDataKey(), JSON.stringify(data));
      localStorage.setItem(this.getCloudGameDataLastSaveKey(), new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Local save failed:', error);
      return false;
    }
  }

  // Load data from local storage
  async loadLocally(): Promise<GameData | null> {
    try {
      const data = localStorage.getItem(this.getCloudGameDataKey());
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Local load failed:', error);
      return null;
    }
  }

  // Save to Supabase anonymous cloud storage
  async saveToCloud(data: GameData): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('game_data')
        .upsert({
          user_id: this.anonymousId,
          data: data,
          updated_at: new Date().toISOString(),
          is_anonymous: true
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Supabase cloud save failed:', error);
      return false;
    }
  }

  // Load from Supabase anonymous cloud storage
  async loadFromCloud(): Promise<GameData | null> {
    if (!this.supabase) {
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('game_data')
        .select('data')
        .eq('user_id', this.anonymousId)
        .eq('is_anonymous', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Supabase cloud load failed:', error);
      return null;
    }
  }

  // Save to Pi cloud (if Pi user is available)
  async saveToPiCloud(data: GameData): Promise<boolean> {
    if (!this.supabase || typeof window.Pi === 'undefined' || !window.Pi.currentUser()) {
      return false;
    }

    try {
      const piUser = window.Pi.currentUser();
      
      const { error } = await this.supabase
        .from('game_data')
        .upsert({
          user_id: piUser.uid,
          data: data,
          updated_at: new Date().toISOString(),
          is_anonymous: false,
          pi_username: piUser.username
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Pi cloud save failed:', error);
      return false;
    }
  }

  // Load from Pi cloud (if Pi user is available)
  async loadFromPiCloud(): Promise<GameData | null> {
    if (!this.supabase || typeof window.Pi === 'undefined' || !window.Pi.currentUser()) {
      return null;
    }

    try {
      const piUser = window.Pi.currentUser();
      
      const { data, error } = await this.supabase
        .from('game_data')
        .select('data')
        .eq('user_id', piUser.uid)
        .eq('is_anonymous', false)
        .single();

      if (error || !data) {
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Pi cloud load failed:', error);
      return null;
    }
  }

  // Smart save - tries multiple methods
  async saveGameData(data: GameData): Promise<boolean> {
    const results = await Promise.allSettled([
      this.saveLocally(data), // Always try local first
      this.saveToCloud(data), // Try Supabase cloud
      this.saveToPiCloud(data) // Try Pi cloud if available
    ]);

    // Log results
    console.log('Save results:', {
      local: results[0].status,
      cloud: results[1].status,
      piCloud: results[2].status
    });

    // Return true if at least local save succeeded
    return results[0].status === 'fulfilled' && results[0].value;
  }

  // Smart load - tries multiple sources and merges
  async loadGameData(): Promise<GameData | null> {
    const [localData, cloudData, piCloudData] = await Promise.allSettled([
      this.loadLocally(),
      this.loadFromCloud(),
      this.loadFromPiCloud()
    ]);

    // Merge data intelligently
    const mergedData = this.mergeGameData(
      localData.status === 'fulfilled' ? localData.value : null,
      cloudData.status === 'fulfilled' ? cloudData.value : null,
      piCloudData.status === 'fulfilled' ? piCloudData.value : null
    );

    return mergedData;
  }

  // Merge data from multiple sources
  private mergeGameData(local: GameData | null, cloud: GameData | null, piCloud: GameData | null): GameData | null {
    const defaultData: GameData = {
      coins: 0,
      highScore: 0,
      unlockedItems: [],
      settings: {},
      lastPlayed: new Date().toISOString()
    };

    // Priority: Pi Cloud > Cloud > Local > Default
    const sources = [piCloud, cloud, local, defaultData];
    
    let mergedData: GameData = { ...defaultData };

    for (const source of sources) {
      if (source) {
        // Merge coins (take highest)
        mergedData.coins = Math.max(mergedData.coins, source.coins || 0);
        
        // Merge high score (take highest)
        mergedData.highScore = Math.max(mergedData.highScore, source.highScore || 0);
        
        // Merge unlocked items (union)
        if (source.unlockedItems) {
          mergedData.unlockedItems = [...new Set([...mergedData.unlockedItems, ...source.unlockedItems])];
        }
        
        // Merge settings (cloud overrides local)
        if (source.settings) {
          mergedData.settings = { ...mergedData.settings, ...source.settings };
        }
        
        // Take most recent last played
        if (source.lastPlayed && (!mergedData.lastPlayed || source.lastPlayed > mergedData.lastPlayed)) {
          mergedData.lastPlayed = source.lastPlayed;
        }
        
        // Merge any other properties
        for (const [key, value] of Object.entries(source)) {
          if (!['coins', 'highScore', 'unlockedItems', 'settings', 'lastPlayed'].includes(key)) {
            mergedData[key] = value;
          }
        }
      }
    }

    return mergedData;
  }

  // Get storage status
  async getStorageStatus(): Promise<{
    local: boolean;
    cloud: boolean;
    piCloud: boolean;
    anonymousId: string;
  }> {
    const localData = await this.loadLocally();
    const cloudData = await this.loadFromCloud();
    const piCloudData = await this.loadFromPiCloud();

    return {
      local: !!localData,
      cloud: !!cloudData,
      piCloud: !!piCloudData,
      anonymousId: this.anonymousId
    };
  }

  // Migrate anonymous data to Pi user when they log in
  async migrateToPiUser(piUser: any): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    try {
      // Get anonymous data
      const { data: anonymousData } = await this.supabase
        .from('game_data')
        .select('data')
        .eq('user_id', this.anonymousId)
        .eq('is_anonymous', true)
        .single();

      if (anonymousData) {
        // Save to Pi user
        const { error } = await this.supabase
          .from('game_data')
          .upsert({
            user_id: piUser.uid,
            data: anonymousData.data,
            updated_at: new Date().toISOString(),
            is_anonymous: false,
            pi_username: piUser.username
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          throw error;
        }

        // Delete anonymous data
        await this.supabase
          .from('game_data')
          .delete()
          .eq('user_id', this.anonymousId)
          .eq('is_anonymous', true);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cloudStorage = new CloudStorageManager();

// Export types
export type { GameData, CloudStorageResponse }; 