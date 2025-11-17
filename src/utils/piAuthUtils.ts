import { piAuthenticate } from '@/services/piPayment';
import { getUserAvatar } from './getUserAvatar';

export interface PiAuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * Smart Pi authentication utility that handles different user types:
 * - Pi Network users: Already authenticated, no need to re-authenticate
 * - Local users: Need to authenticate with Pi for payments
 */
export class PiAuthUtils {
  /**
   * Check if user is authenticated with Pi Network
   */
  static isPiAuthenticated(): boolean {
    return localStorage.getItem('flappypi-pi-auth') === 'true';
  }

  /**
   * Get current Pi user data
   */
  static getPiUser(): any {
    const piUserData = localStorage.getItem('flappypi-pi-user');
    if (piUserData) {
      try {
        return JSON.parse(piUserData);
      } catch (e) {
        console.error('Error parsing Pi user data:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Get current user type (pi or local)
   */
  static getUserType(): 'pi' | 'local' {
    return this.isPiAuthenticated() ? 'pi' : 'local';
  }

  /**
   * Smart authentication for payments
   * - Pi users: Returns existing user data
   * - Local users: Triggers Pi authentication
   */
  static async authenticateForPayment(): Promise<PiAuthResult> {
    try {
      // Check if user is already Pi authenticated
      if (this.isPiAuthenticated()) {
        const piUser = this.getPiUser();
        if (piUser) {
          return {
            success: true,
            user: piUser
          };
        }
      }

      // For local users, trigger Pi authentication with valid scopes
      const result = await piAuthenticate(['payments']);
      if (result && result.user) {
        // Save Pi user info for this session
        localStorage.setItem('flappypi-pi-user', JSON.stringify(result.user));
        localStorage.setItem('flappypi-pi-auth', 'true');
        
        return {
          success: true,
          user: result.user
        };
      } else {
        return {
          success: false,
          error: 'Pi authentication failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Authentication error'
      };
    }
  }

  /**
   * Check if Pi authentication is required for current user
   */
  static requiresPiAuth(): boolean {
    return !this.isPiAuthenticated();
  }

  /**
   * Get user display info for UI - ENHANCED VERSION
   */
  static getUserDisplay() {
    console.log('🔍 PiAuthUtils.getUserDisplay() called');
    
    // Import enhanced Pi utilities
    const { getCurrentPiUser, checkPiAuthentication } = require('./piNetworkUtils');
    
    // First, try to get from Pi SDK directly using enhanced utilities
    const currentUser = getCurrentPiUser();
    const isAuthenticated = checkPiAuthentication();
    
    if (currentUser && currentUser.username && currentUser.username !== 'Player') {
      console.log('✅ Found Pi username from enhanced SDK utilities:', currentUser.username);
      return {
        username: currentUser.username,
        avatar: getUserAvatar(currentUser),
        isPiAuth: true
      };
    }
    
    // Check Pi authentication status
    const isPiAuth = this.isPiAuthenticated();
    console.log('🔍 Pi auth status:', isPiAuth);
    
    if (isPiAuth) {
      const piUser = this.getPiUser();
      console.log('🔍 Pi user data:', piUser);
      
      if (piUser && piUser.username && piUser.username !== 'Player') {
        console.log('✅ Found Pi username:', piUser.username);
        return {
          username: piUser.username,
          avatar: getUserAvatar(piUser),
          isPiAuth: true
        };
      } else {
        console.warn('⚠️ Pi user data missing or invalid:', piUser);
      }
    }
    
    // Fallback: Check main app format
    const mainAppPiUser = localStorage.getItem('flappypi-pi-user');
    const mainAppPiAuth = localStorage.getItem('flappypi-pi-auth');
    const mainAppUsername = localStorage.getItem('flappypi-username');
    
    console.log('🔍 Main app data:', {
      piUser: mainAppPiUser,
      piAuth: mainAppPiAuth,
      username: mainAppUsername
    });
    
    if (mainAppPiAuth === 'true' && mainAppPiUser) {
      try {
        const piUser = JSON.parse(mainAppPiUser);
        console.log('🔍 Parsed Pi user:', piUser);
        
        if (piUser.username && piUser.username !== 'Player') {
          console.log('✅ Found username in main app format:', piUser.username);
          return {
            username: piUser.username,
            avatar: getUserAvatar(piUser),
            isPiAuth: true
          };
        }
      } catch (e) {
        console.error('❌ Error parsing Pi user from localStorage:', e);
      }
    }
    
    // Check if we have a username stored directly
    if (mainAppUsername && mainAppUsername !== 'Player') {
      console.log('✅ Found username in localStorage:', mainAppUsername);
      return {
        username: mainAppUsername,
        avatar: 'flappy-logo.png',
        isPiAuth: true
      };
    }
    
    // Final fallback
    const localUsername = localStorage.getItem('flappypi-username') || 'Player';
    console.log('🔍 Final fallback username:', localUsername);
    
    return {
      username: localUsername,
      avatar: 'flappy-logo.png',
      isPiAuth: false
    };
  }

  /**
   * Clear Pi authentication data (for logout)
   */
  static clearPiAuth() {
    localStorage.removeItem('flappypi-pi-user');
    localStorage.removeItem('flappypi-pi-auth');
    localStorage.removeItem('flappypi-username');
    localStorage.removeItem('pi_user');
  }
} 