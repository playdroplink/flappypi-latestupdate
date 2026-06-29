// Pi Network Authentication Service
// Based on official Pi SDK documentation: https://pi-apps.github.io/pi-sdk-docs/quick-start/genai/Authentication

import { piNetworkConfig } from '../config/piNetworkConfig';
import { initPi, isPiSDKAvailable, isPiBrowser } from './piSdk';

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

export interface BackendAuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class PiAuthService {
  private static instance: PiAuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;
  private isInitialized = false;
  private autoAuthAttempted = false;

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

  // Validate access token with backend using Pi Network API
  private async validateTokenWithBackend(accessToken: string): Promise<BackendAuthResponse> {
    try {
      console.log('🔐 Validating access token with backend...');
      
      // Call backend to validate token via Pi Network API
      const response = await fetch('/api/auth/validate-pi-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });

      if (!response.ok) {
        throw new Error(`Backend validation failed: ${response.statusText}`);
      }

      const result: BackendAuthResponse = await response.json();
      
      if (result.success && result.user) {
        console.log('✅ Token validated successfully:', result.user);
        return result;
      } else {
        throw new Error(result.error || 'Token validation failed');
      }
    } catch (error) {
      console.error('❌ Backend token validation error:', error);
      throw error;
    }
  }

  // Main authentication method following official Pi SDK flow
  async authenticateUser(): Promise<User> {
    await this.initializeAuth();

    try {
      console.log('🔍 Starting Pi authentication...');
      
      // Check if Pi SDK is available
      if (!isPiSDKAvailable()) {
        throw new Error('Pi SDK is not available. Please ensure you are using Pi Browser.');
      }

      // Check if running in Pi Browser
      if (!isPiBrowser()) {
        console.warn('⚠️ Not running in Pi Browser. OAuth login should be used instead.');
        throw new Error('Please open this app in Pi Browser to use Pi Network authentication.');
      }

      // Initialize Pi SDK using the centralized initPi function
      console.log('🔄 Initializing Pi SDK...');
      const initSuccess = initPi({
        version: "2.0",
        sandbox: piNetworkConfig.pi.sandbox,
        environment: piNetworkConfig.pi.environment
      });
      
      if (!initSuccess) {
        throw new Error('Failed to initialize Pi SDK');
      }
      
      console.log('✅ Pi SDK initialized successfully');

      // Authenticate with username and payments scopes
      const scopes = ['username', 'payments'];
      console.log('🚀 Calling Pi.authenticate with scopes:', scopes);
      
      // Provide incomplete payment callback
      const authResult: AuthResult = await window.Pi.authenticate(scopes, this.onIncompletePaymentFound);
      
      console.log('✅ Pi authentication successful, received access token');
      
      // Validate access token with backend before establishing session
      const backendValidation = await this.validateTokenWithBackend(authResult.accessToken);
      
      // Store validated user data
      this.currentUser = backendValidation.user!;
      this.authToken = authResult.accessToken;
      
      // Save to localStorage with timestamp
      const userData = {
        user: backendValidation.user,
        token: authResult.accessToken,
        scopes: scopes,
        timestamp: Date.now()
      };
      
      localStorage.setItem('pi_user_data', JSON.stringify(userData));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('piUserAuthenticated', {
        detail: { user: backendValidation.user }
      }));
      
      return backendValidation.user;
    } catch (error: any) {
      console.error('❌ Pi authentication failed:', error);
      
      // Clear potentially corrupted data
      this.currentUser = null;
      this.authToken = null;
      localStorage.removeItem('pi_user_data');
      localStorage.removeItem('pi_requested_scopes');
      
      throw error;
    }
  }

  // Auto-trigger authentication on app load
  async autoAuthenticate(): Promise<User | null> {
    if (this.autoAuthAttempted) {
      return this.currentUser;
    }
    
    this.autoAuthAttempted = true;
    
    try {
      // Check if already authenticated from cache
      if (this.isAuthenticated()) {
        console.log('✅ User already authenticated from cache');
        return this.currentUser;
      }
      
      // Attempt automatic authentication
      console.log('🔄 Attempting automatic authentication...');
      return await this.authenticateUser();
    } catch (error) {
      console.warn('⚠️ Automatic authentication failed, user needs to sign in manually:', error);
      return null;
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
      // Don't return false here - let the fallback logic handle it
    }

    // Additional fallback: check current user data for scope information
    try {
      const userData = localStorage.getItem('pi_user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.scopes && parsed.scopes.includes('payments')) {
          console.log('✅ PiAuthService - Payments scope found in user data');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Error checking user data scopes:', error);
    }

    return false;
  }

  // Force re-authentication to get new scopes
  async forceReAuthentication(): Promise<any> {
    console.log('🔄 Forcing re-authentication...');
    
    // Clear current authentication
    this.signOut();
    
    // Clear cached data
    localStorage.removeItem('pi_user_data');
    sessionStorage.removeItem('pi_user_data');
    
    // Reset auto-auth flag
    this.autoAuthAttempted = false;
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Re-authenticate
    try {
      const result = await this.authenticateUser();
      console.log('✅ Re-authentication successful');
      return result;
    } catch (error) {
      console.error('❌ Re-authentication failed:', error);
      throw new Error('Failed to re-authenticate.');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    if (this.currentUser && this.currentUser.uid !== 'mock-user-123') {
      return this.currentUser;
    }
    return null;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.authToken;
  }

  // Sign out
  signOut(): void {
    this.currentUser = null;
    this.authToken = null;
    this.autoAuthAttempted = false;
    localStorage.removeItem('pi_user_data');
    sessionStorage.removeItem('pi_user_data');
    localStorage.removeItem('pi_requested_scopes');
    
    // Dispatch sign out event
    window.dispatchEvent(new CustomEvent('piUserSignedOut'));
  }

  // Handle incomplete payments
  private onIncompletePaymentFound = async (payment: any) => {
    console.log('🔄 Incomplete payment found during authentication:', payment);
    
    try {
      // Complete the in-flight payment via backend
      const paymentId = payment.identifier || payment.payment_id || payment.id;
      if (paymentId) {
        const response = await fetch('/api/payments/complete-incomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentId })
        });

        if (response.ok) {
          console.log('✅ Incomplete payment completed:', paymentId);
        } else {
          console.warn('⚠️ Failed to complete incomplete payment:', paymentId);
        }
      }
    } catch (error) {
      console.error('❌ Error handling incomplete payment:', error);
    }
  };
}

export const piAuthService = new PiAuthService();