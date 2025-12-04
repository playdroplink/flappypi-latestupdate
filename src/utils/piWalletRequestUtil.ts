/**
 * Pi Wallet Address Request Utility
 * Handles requesting wallet address from Pi authentication
 */

import { walletService } from '../services/walletService';

export class PiWalletRequestUtil {
  /**
   * Request wallet address from user during authentication
   * This can be called after successful Pi auth to explicitly request wallet
   */
  static async requestWalletAddressPermission(): Promise<string | null> {
    try {
      console.log('💳 Requesting wallet address permission from user...');

      if (typeof window.Pi === 'undefined') {
        console.warn('⚠️ Pi SDK not available');
        return null;
      }

      // Use the scoped authentication to request wallet_address
      const authResult = await window.Pi.authenticate(
        ['wallet_address'],
        (incompletePayment) => {
          console.log('💰 Incomplete payment found:', incompletePayment);
        }
      );

      if (authResult?.user?.wallet_address) {
        console.log('✅ User granted wallet permission:', authResult.user.wallet_address);
        return authResult.user.wallet_address;
      }

      return null;
    } catch (error) {
      console.error('❌ Error requesting wallet permission:', error);
      return null;
    }
  }

  /**
   * Check if wallet collection should be shown
   */
  static shouldShowWalletRequest(piUser: any): boolean {
    if (!piUser) return false;

    // Check if already has wallet in user object
    if (piUser.wallet_address || piUser.address) {
      return false;
    }

    // Check if already requested
    const alreadyRequested = localStorage.getItem('flappypi-wallet-collected') === 'true';
    if (alreadyRequested) {
      return false;
    }

    return true;
  }

  /**
   * Show wallet request modal (call from UI)
   */
  static showWalletRequestModal(): void {
    console.log('🔔 Wallet request modal triggered');
    // Dispatch event that ProfilePage can listen to
    window.dispatchEvent(new CustomEvent('show-wallet-request', {
      detail: {
        timestamp: new Date().toISOString()
      }
    }));
  }

  /**
   * Get wallet display info for UI
   */
  static getWalletDisplayInfo(wallet: string | null): {
    isCollected: boolean;
    displayAddress: string;
    isMasked: boolean;
  } {
    if (!wallet) {
      return {
        isCollected: false,
        displayAddress: '',
        isMasked: false
      };
    }

    // Mask wallet address for security (show first 6 and last 6 chars)
    const masked = wallet.length > 12
      ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 6)}`
      : wallet;

    return {
      isCollected: true,
      displayAddress: masked,
      isMasked: wallet.length > 12
    };
  }

  /**
   * Verify if wallet address is valid Pi mainnet format
   */
  static isValidPiWallet(address: string): boolean {
    if (!address) return false;

    // Pi mainnet wallet addresses are alphanumeric
    // Basic validation - Pi addresses are typically 32-64 characters
    const piWalletRegex = /^[a-zA-Z0-9]{32,64}$/;
    return piWalletRegex.test(address.trim());
  }

  /**
   * Get wallet collection status
   */
  static getWalletCollectionStatus(): {
    hasBeenRequested: boolean;
    hasBeenCollected: boolean;
    lastRequestTime: string | null;
  } {
    const hasBeenRequested = localStorage.getItem('flappypi-wallet-request-shown') === 'true';
    const hasBeenCollected = localStorage.getItem('flappypi-wallet-collected') === 'true';
    const lastRequestTime = localStorage.getItem('flappypi-wallet-request-timestamp');

    return {
      hasBeenRequested,
      hasBeenCollected,
      lastRequestTime
    };
  }

  /**
   * Mark wallet request as shown
   */
  static markWalletRequestAsShown(): void {
    localStorage.setItem('flappypi-wallet-request-shown', 'true');
    localStorage.setItem('flappypi-wallet-request-timestamp', new Date().toISOString());
  }

  /**
   * Mark wallet as successfully collected
   */
  static markWalletAsCollected(piUserId: string): void {
    localStorage.setItem('flappypi-wallet-collected', 'true');
    localStorage.setItem(`flappypi-wallet-collected-${piUserId}`, 'true');
    localStorage.setItem('flappypi-wallet-timestamp', new Date().toISOString());
  }
}

export default PiWalletRequestUtil;
