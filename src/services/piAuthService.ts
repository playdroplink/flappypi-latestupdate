// Pi Network Authentication Service
// Based on the comprehensive Pi Network Payment Integration Guide

import { piNetworkConfig } from '../config/piNetworkConfig';

export interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

export interface User {
  uid: string;
  username: string;
}

class PiAuthService {
  private static instance: PiAuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;
  private isInitialized = false;

  static getInstance(): PiAuthService {
    if (!PiAuthService.instance) {
      PiAuthService.instance = new PiAuthService();
    }
    return PiAuthService.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  // Initialize authentication
  private async initializeAuth() {
    if (this.isInitialized) return;
    
    try {
      // Check for existing user data
      const storedUser = localStorage.getItem('pi_user_data');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const tokenAge = Date.now() - userData.timestamp;
        
        if (tokenAge < 24 * 60 * 60 * 1000) { // 24 hours
          this.currentUser = userData.user;
          this.authToken = userData.token;
          this.isInitialized = true;
          return;
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Pi Auth Service:', error);
      this.isInitialized = true;
    }
  }

  // Main authentication method
  async authenticateUser(): Promise<User> {
    await this.initializeAuth();

    try {
      console.log('🔍 Starting Pi authentication...');
      
      // Check if Pi SDK is available
      if (!window.Pi) {
        throw new Error('Pi SDK is not available. Please ensure you are using Pi Browser.');
      }

      // Initialize Pi SDK for mainnet
      if (window.Pi.init) {
        window.Pi.init({ 
          version: "2.0",
          sandbox: false, // Mainnet mode
          environment: 'mainnet'
        });
      }

      // Authenticate user with payments and username scopes
      const scopes = ['payments', 'username'];
      console.log('🚀 Calling Pi.authenticate with scopes:', scopes);
      
      // Store scopes for later validation
      localStorage.setItem('pi_requested_scopes', JSON.stringify(scopes));
      
      const authResult: AuthResult = await window.Pi.authenticate(scopes, this.onIncompletePaymentFound);
      
      console.log('✅ Pi authentication successful:', authResult);
      
      // Store user data
      this.currentUser = authResult.user;
      this.authToken = authResult.accessToken;
      
      // Save to localStorage with timestamp
      const userData = {
        user: authResult.user,
        token: authResult.accessToken,
        scopes: scopes,
        timestamp: Date.now()
      };
      
      localStorage.setItem('pi_user_data', JSON.stringify(userData));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('piUserAuthenticated', {
        detail: { user: authResult.user }
      }));
      
      return authResult.user;
    } catch (error: any) {
      console.error('❌ Pi authentication failed:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (this.currentUser && this.authToken) {
      if (this.currentUser.uid && this.currentUser.uid !== 'mock-user-123') {
        console.log('✅ PiAuthService - Real Pi Network user authenticated:', this.currentUser.username);
        return true;
      }
    }
    
    console.log('❌ PiAuthService - No valid authentication found');
    return false;
  }

  // Check if user has payments scope
  hasPaymentsScope(): boolean {
    if (!this.isAuthenticated() || !this.currentUser) {
      console.log('❌ PiAuthService - User not authenticated');
      return false;
    }

    // For production mode, assume payments scope is available
    if (piNetworkConfig.pi.productionMode && !piNetworkConfig.pi.sandbox) {
      console.log('✅ PiAuthService - Production mode: Payments scope always available');
      return true;
    }

    // Check if we requested payments scope during authentication
    try {
      const requestedScopes = localStorage.getItem('pi_requested_scopes');
      if (requestedScopes) {
        const scopes = JSON.parse(requestedScopes);
        if (scopes.includes('payments')) {
          console.log('✅ PiAuthService - Payments scope was requested during authentication');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Error checking requested scopes:', error);
    }

    return false;
  }

  // Force re-authentication to get new scopes
  async forceReAuthentication(): Promise<any> {
    console.log('🔄 Forcing re-authentication to get payments scope...');
    
    // Clear current authentication
    this.signOut();
    
    // Clear cached data
    localStorage.removeItem('pi_user_data');
    sessionStorage.removeItem('pi_user_data');
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Re-authenticate
    try {
      const result = await this.authenticateUser();
      
      if (!this.hasPaymentsScope()) {
        console.warn('⚠️ Re-authentication completed but payments scope still not available');
        if (piNetworkConfig.pi.sandbox) {
          console.log('🔧 Sandbox mode: Continuing without strict scope validation');
          return result;
        } else {
          throw new Error('Payments scope not obtained after re-authentication.');
        }
      }
      
      console.log('✅ Re-authentication successful with payments scope');
      return result;
    } catch (error) {
      console.error('❌ Re-authentication failed:', error);
      throw new Error('Failed to re-authenticate with payments scope.');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (this.currentUser && this.currentUser.uid !== 'mock-user-123') {
      return this.currentUser;
    }
    return null;
  }

  // Sign out
  signOut(): void {
    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem('pi_user_data');
    sessionStorage.removeItem('pi_user_data');
    localStorage.removeItem('pi_requested_scopes');
  }

  // Handle incomplete payments
  private onIncompletePaymentFound = (payment: any) => {
    console.log('Incomplete payment found:', payment);
    return Promise.resolve();
  };
}

export const piAuthService = new PiAuthService();