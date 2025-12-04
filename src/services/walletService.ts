/**
 * Wallet Service
 * Handles Pi wallet address collection, storage, and retrieval from Supabase
 */

import { supabase } from '../utils/supabaseClient';

interface WalletData {
  pi_user_id: string;
  username: string;
  wallet_address: string;
  collected_at: string;
}

export class WalletService {
  private static instance: WalletService;
  
  private constructor() {}
  
  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Request wallet address from Pi auth with wallet_address scope
   * This should be called during Pi authentication
   */
  async requestWalletFromPiAuth(): Promise<string | null> {
    try {
      console.log('🔐 Requesting wallet address from Pi auth...');
      
      if (typeof window.Pi === 'undefined') {
        console.warn('⚠️ Pi SDK not available');
        return null;
      }

      // Authenticate with wallet_address scope
      const authResult = await window.Pi.authenticate(
        ['payments', 'username', 'wallet_address'],
        (incompletePayment) => {
          console.log('💰 Incomplete payment found:', incompletePayment);
        }
      );

      if (authResult?.user?.wallet_address) {
        console.log('✅ Wallet address retrieved from Pi auth:', authResult.user.wallet_address);
        return authResult.user.wallet_address;
      }

      // Fallback: check if wallet_address is in the user object
      if (authResult?.user?.address) {
        console.log('✅ Wallet address retrieved (alt format):', authResult.user.address);
        return authResult.user.address;
      }

      console.warn('⚠️ No wallet address in Pi auth response');
      return null;
    } catch (error) {
      console.error('❌ Error requesting wallet from Pi auth:', error);
      return null;
    }
  }

  /**
   * Save wallet address to Supabase user_profiles table
   */
  async saveWalletToSupabase(
    piUserId: string,
    username: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      console.log('💾 Saving wallet address to Supabase for user:', username);

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            pi_user_id: piUserId,
            username: username,
            wallet_address: walletAddress,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'pi_user_id' }
        )
        .select('wallet_address');

      if (error) {
        console.error('❌ Error saving wallet to Supabase:', error);
        return false;
      }

      console.log('✅ Wallet address saved to Supabase:', data);
      
      // Also save to localStorage for quick access
      localStorage.setItem(`flappypi-wallet-${piUserId}`, walletAddress);
      localStorage.setItem('flappypi-wallet-collected', 'true');
      localStorage.setItem('flappypi-wallet-timestamp', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('❌ Error in saveWalletToSupabase:', error);
      return false;
    }
  }

  /**
   * Retrieve wallet address from Supabase
   */
  async getWalletFromSupabase(piUserId: string): Promise<string | null> {
    try {
      console.log('🔍 Retrieving wallet address from Supabase for user:', piUserId);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_address')
        .eq('pi_user_id', piUserId)
        .single();

      if (error) {
        console.warn('⚠️ Error retrieving wallet from Supabase:', error);
        return null;
      }

      if (data?.wallet_address) {
        console.log('✅ Wallet address retrieved from Supabase');
        
        // Cache in localStorage
        localStorage.setItem(`flappypi-wallet-${piUserId}`, data.wallet_address);
        
        return data.wallet_address;
      }

      return null;
    } catch (error) {
      console.error('❌ Error in getWalletFromSupabase:', error);
      return null;
    }
  }

  /**
   * Get wallet from localStorage cache
   */
  getWalletFromCache(piUserId: string): string | null {
    try {
      const cachedWallet = localStorage.getItem(`flappypi-wallet-${piUserId}`);
      if (cachedWallet) {
        console.log('✅ Wallet address retrieved from cache');
        return cachedWallet;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting wallet from cache:', error);
      return null;
    }
  }

  /**
   * Get wallet address - tries multiple sources
   * Priority: Supabase > localStorage cache > null
   */
  async getWalletAddress(piUserId: string): Promise<string | null> {
    try {
      // First try cache
      let wallet = this.getWalletFromCache(piUserId);
      if (wallet) return wallet;

      // Then try Supabase
      wallet = await this.getWalletFromSupabase(piUserId);
      if (wallet) return wallet;

      return null;
    } catch (error) {
      console.error('❌ Error in getWalletAddress:', error);
      return null;
    }
  }

  /**
   * Check if wallet is already collected for user
   */
  isWalletCollected(piUserId: string): boolean {
    try {
      const isCollected = localStorage.getItem('flappypi-wallet-collected') === 'true';
      const cachedWallet = localStorage.getItem(`flappypi-wallet-${piUserId}`);
      
      return isCollected && !!cachedWallet;
    } catch (error) {
      console.error('❌ Error in isWalletCollected:', error);
      return false;
    }
  }

  /**
   * Clear wallet data (for logout/reset)
   */
  clearWallet(piUserId: string): void {
    try {
      localStorage.removeItem(`flappypi-wallet-${piUserId}`);
      localStorage.removeItem('flappypi-wallet-collected');
      localStorage.removeItem('flappypi-wallet-timestamp');
      console.log('✅ Wallet data cleared');
    } catch (error) {
      console.error('❌ Error clearing wallet:', error);
    }
  }

  /**
   * Auto-collect wallet during Pi authentication
   * This should be called in the loginWithPi function
   */
  async autoCollectWallet(piUser: any): Promise<string | null> {
    try {
      console.log('🔄 Auto-collecting wallet for Pi user:', piUser.username);

      let walletAddress = piUser.wallet_address || piUser.address;

      if (walletAddress) {
        console.log('✅ Wallet address found in Pi user object:', walletAddress);
        
        // Save to Supabase
        const saved = await this.saveWalletToSupabase(
          piUser.uid || piUser.id,
          piUser.username,
          walletAddress
        );

        if (saved) {
          console.log('💾 Wallet auto-collected and saved');
          return walletAddress;
        }
      } else {
        console.warn('⚠️ No wallet address in Pi user data, user will be prompted later');
      }

      return null;
    } catch (error) {
      console.error('❌ Error in autoCollectWallet:', error);
      return null;
    }
  }

  /**
   * Get all wallet addresses (admin function)
   */
  async getAllWalletAddresses(): Promise<WalletData[]> {
    try {
      console.log('📊 Fetching all wallet addresses...');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('pi_user_id, username, wallet_address, updated_at')
        .not('wallet_address', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching all wallets:', error);
        return [];
      }

      console.log(`✅ Retrieved ${data?.length || 0} wallet addresses`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllWalletAddresses:', error);
      return [];
    }
  }

  /**
   * Export wallet addresses for rewards distribution
   */
  async exportWalletAddressesForRewards(): Promise<Record<string, string>> {
    try {
      const wallets = await this.getAllWalletAddresses();
      
      const walletMap: Record<string, string> = {};
      wallets.forEach(wallet => {
        if (wallet.wallet_address) {
          walletMap[wallet.pi_user_id] = wallet.wallet_address;
        }
      });

      console.log(`✅ Exported ${Object.keys(walletMap).length} wallet addresses for rewards`);
      return walletMap;
    } catch (error) {
      console.error('❌ Error exporting wallet addresses:', error);
      return {};
    }
  }
}

export const walletService = WalletService.getInstance();
