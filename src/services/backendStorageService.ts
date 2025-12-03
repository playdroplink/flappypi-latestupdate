// Backend Storage Service
// Handles user data storage in Supabase and local storage
// Provides unified storage interface for payments, user data, and game progress

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ididprksbmbhigcxcxvt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaWRwcmtzYm1iaGlnY3hjeHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzE0MjIsImV4cCI6MjA2NzQwNzQyMn0.oaqH6N-aBs9eVPUhY6jYXfauPShALeKDe4sQGBv8g9Q';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserProfile {
  id: string;
  username: string;
  uid: string;
  total_coins: number;
  owned_power_ups: Record<string, number>;
  owned_skins: Record<string, boolean>;
  subscriptions: Record<string, any>;
  payment_history: any[];
  game_stats: {
    high_score: number;
    total_games: number;
    total_coins_earned: number;
    achievements: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  payment_id: string;
  txid: string;
  amount: number;
  currency: string;
  item_type: string;
  item_id: string;
  item_name: string;
  quantity: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  wallet_address: string;
  network: string;
  metadata: any;
  created_at: string;
  completed_at?: string;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  item_name: string;
  quantity: number;
  metadata: any;
  created_at: string;
  updated_at: string;
  serial_code?: string; // Unique serial code for NFT future support
  rarity?: string; // Rarity tier: Common, Rare, Epic, Special, Legendary
}

export class BackendStorageService {
  private static instance: BackendStorageService;
  private localStorage: Storage;
  
  private constructor() {
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : null as any;
  }
  
  static getInstance(): BackendStorageService {
    if (!BackendStorageService.instance) {
      BackendStorageService.instance = new BackendStorageService();
    }
    return BackendStorageService.instance;
  }

  /**
   * Initialize user profile in Supabase
   */
  async initializeUserProfile(user: any): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      console.log('🔧 Initializing user profile for:', user.username);
      
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('uid', user.uid)
        .single();

      if (existingUser) {
        console.log('✅ User profile already exists:', existingUser);
        return { success: true, profile: existingUser };
      }

      // Create new user profile
      const newProfile: Partial<UserProfile> = {
        id: user.uid,
        username: user.username,
        uid: user.uid,
        total_coins: 0,
        owned_power_ups: {},
        owned_skins: {},
        subscriptions: {},
        payment_history: [],
        game_stats: {
          high_score: 0,
          total_games: 0,
          total_coins_earned: 0,
          achievements: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create user profile:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ User profile created successfully:', data);
      return { success: true, profile: data };

    } catch (error: any) {
      console.error('❌ User profile initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile from Supabase
   */
  async getUserProfile(uid: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error) {
        console.error('❌ Failed to get user profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, profile: data };

    } catch (error: any) {
      console.error('❌ Get user profile failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile in Supabase
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('uid', uid)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update user profile:', error);
        return { success: false, error: error.message };
      }

      // Update local storage
      this.saveToLocalStorage('user_profile', data);

      return { success: true, profile: data };

    } catch (error: any) {
      console.error('❌ Update user profile failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record payment in Supabase
   */
  async recordPayment(paymentData: {
    user_id: string;
    payment_id: string;
    txid: string;
    amount: number;
    currency: string;
    item_type: string;
    item_id: string;
    item_name: string;
    quantity: number;
    status: string;
    wallet_address: string;
    network: string;
    metadata: any;
  }): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
    try {
      const paymentRecord: Partial<PaymentRecord> = {
        user_id: paymentData.user_id,
        payment_id: paymentData.payment_id,
        txid: paymentData.txid,
        amount: paymentData.amount,
        currency: paymentData.currency,
        item_type: paymentData.item_type,
        item_id: paymentData.item_id,
        item_name: paymentData.item_name,
        quantity: paymentData.quantity,
        status: paymentData.status as any,
        wallet_address: paymentData.wallet_address,
        network: paymentData.network,
        metadata: paymentData.metadata,
        created_at: new Date().toISOString(),
        completed_at: paymentData.status === 'completed' ? new Date().toISOString() : undefined
      };

      const { data, error } = await supabase
        .from('payment_records')
        .insert([paymentRecord])
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to record payment:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Payment recorded successfully:', data);
      return { success: true, payment: data };

    } catch (error: any) {
      console.error('❌ Record payment failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: string, txid?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed' && txid) {
        updateData.completed_at = new Date().toISOString();
        updateData.txid = txid;
      }

      const { error } = await supabase
        .from('payment_records')
        .update(updateData)
        .eq('payment_id', paymentId);

      if (error) {
        console.error('❌ Failed to update payment status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error: any) {
      console.error('❌ Update payment status failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add item to user inventory
   */
  async addToInventory(userId: string, item: {
    item_type: string;
    item_id: string;
    item_name: string;
    quantity: number;
    metadata?: any;
  }): Promise<{ success: boolean; inventoryItem?: InventoryItem; error?: string }> {
    try {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type', item.item_type)
        .eq('item_id', item.item_id)
        .single();

      if (existingItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('user_inventory')
          .update({
            quantity: existingItem.quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Failed to update inventory item:', error);
          return { success: false, error: error.message };
        }

        return { success: true, inventoryItem: data };
      } else {
        // Create new inventory item
        const inventoryItem: Partial<InventoryItem> = {
          user_id: userId,
          item_type: item.item_type,
          item_id: item.item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          metadata: item.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('user_inventory')
          .insert([inventoryItem])
          .select()
          .single();

        if (error) {
          console.error('❌ Failed to create inventory item:', error);
          return { success: false, error: error.message };
        }

        return { success: true, inventoryItem: data };
      }

    } catch (error: any) {
      console.error('❌ Add to inventory failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user inventory
   */
  async getUserInventory(userId: string): Promise<{ success: boolean; inventory?: InventoryItem[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to get user inventory:', error);
        return { success: false, error: error.message };
      }

      return { success: true, inventory: data || [] };

    } catch (error: any) {
      console.error('❌ Get user inventory failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user payment history
   */
  async getUserPaymentHistory(userId: string): Promise<{ success: boolean; payments?: PaymentRecord[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to get payment history:', error);
        return { success: false, error: error.message };
      }

      return { success: true, payments: data || [] };

    } catch (error: any) {
      console.error('❌ Get payment history failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Local Storage Methods
   */
  saveToLocalStorage(key: string, data: any): void {
    try {
      if (this.localStorage) {
        this.localStorage.setItem(key, JSON.stringify(data));
        console.log('💾 Saved to local storage:', key);
      }
    } catch (error) {
      console.error('❌ Failed to save to local storage:', error);
    }
  }

  getFromLocalStorage(key: string): any {
    try {
      if (this.localStorage) {
        const data = this.localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get from local storage:', error);
      return null;
    }
  }

  removeFromLocalStorage(key: string): void {
    try {
      if (this.localStorage) {
        this.localStorage.removeItem(key);
        console.log('🗑️ Removed from local storage:', key);
      }
    } catch (error) {
      console.error('❌ Failed to remove from local storage:', error);
    }
  }

  /**
   * Sync local storage with Supabase
   */
  async syncWithSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get local data
      const localProfile = this.getFromLocalStorage('user_profile');
      const localInventory = this.getFromLocalStorage('user_inventory');
      const localPayments = this.getFromLocalStorage('user_payments');

      // Sync profile
      if (localProfile) {
        await this.updateUserProfile(userId, localProfile);
      }

      // Sync inventory
      if (localInventory && Array.isArray(localInventory)) {
        for (const item of localInventory) {
          await this.addToInventory(userId, item);
        }
      }

      // Sync payments
      if (localPayments && Array.isArray(localPayments)) {
        for (const payment of localPayments) {
          await this.recordPayment(payment);
        }
      }

      console.log('✅ Local storage synced with Supabase');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Sync with Supabase failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all local storage
   */
  clearLocalStorage(): void {
    try {
      if (this.localStorage) {
        this.localStorage.clear();
        console.log('🗑️ Local storage cleared');
      }
    } catch (error) {
      console.error('❌ Failed to clear local storage:', error);
    }
  }
}

// Export singleton instance
export const backendStorageService = BackendStorageService.getInstance();
export default backendStorageService;
