/**
 * Pi Authentication Sequence Implementation
 * 
 * This service implements the exact authentication sequence:
 * 1. User clicks "Connect with Pi Network"
 * 2. App calls Pi.authenticate(scopes)
 * 3. PiBrowser prompts for permissions
 * 4. User approves
 * 5. PiBrowser returns authResult (user, accessToken)
 * 6. App validates accessToken via /v2/me (Production)
 * 7. PiAPI returns user info
 * 8. App signs up/logs in user
 */

export interface PiAuthSequenceResult {
  success: boolean;
  user?: {
    uid: string;
    username: string;
    accessToken: string;
  };
  error?: string;
  step?: string;
}

export interface PiAuthSequenceConfig {
  scopes?: string[];
  enableProductionValidation?: boolean;
  timeout?: number;
}

export class PiAuthSequence {
  private static instance: PiAuthSequence;
  private isAuthenticating = false;

  private constructor() {}

  public static getInstance(): PiAuthSequence {
    if (!PiAuthSequence.instance) {
      PiAuthSequence.instance = new PiAuthSequence();
    }
    return PiAuthSequence.instance;
  }

  /**
   * Step 1: User clicks "Connect with Pi Network"
   * Step 2: App calls Pi.authenticate(scopes)
   */
  private async initiateAuthentication(scopes: string[]): Promise<PiAuthSequenceResult> {
    try {
      console.log('🔐 Step 1-2: Initiating Pi authentication...');
      console.log('📋 Requesting scopes:', scopes);

      // Check if Pi SDK is available
      if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
        return {
          success: false,
          error: 'Pi SDK not available. Please use Pi Browser.',
          step: 'sdk_check'
        };
      }

      // Handle incomplete payments callback
      const onIncompletePaymentFound = (payment: any) => {
        console.log('💰 Incomplete payment found:', payment);
        // Handle incomplete payment if needed
      };

      // Call Pi.authenticate with scopes
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      if (!authResult || !authResult.user || !authResult.accessToken) {
        return {
          success: false,
          error: 'Invalid authentication response from Pi Browser',
          step: 'authentication'
        };
      }

      console.log('✅ Step 2: Pi.authenticate successful');
      console.log('👤 User:', authResult.user.username);
      console.log('🔑 Access Token:', authResult.accessToken ? 'Present' : 'Missing');

      return {
        success: true,
        user: {
          uid: authResult.user.uid,
          username: authResult.user.username,
          accessToken: authResult.accessToken
        },
        step: 'authentication'
      };

    } catch (error) {
      console.error('❌ Step 2: Pi.authenticate failed:', error);
      return {
        success: false,
        error: `Authentication failed: ${error.message}`,
        step: 'authentication'
      };
    }
  }

  /**
   * Step 6: App validates accessToken via /v2/me (Production)
   * Step 7: PiAPI returns user info
   */
  private async validateAccessToken(accessToken: string): Promise<PiAuthSequenceResult> {
    try {
      console.log('🔍 Step 6: Validating access token with Pi API...');

      const response = await fetch('https://api.minepi.com/v2/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ Step 6: Token validation failed:', response.status);
        return {
          success: false,
          error: `Token validation failed: ${response.status}`,
          step: 'validation'
        };
      }

      const userData = await response.json();
      console.log('✅ Step 7: PiAPI validation successful');
      console.log('👤 Verified user:', userData.username);

      return {
        success: true,
        user: {
          uid: userData.uid,
          username: userData.username,
          accessToken: accessToken
        },
        step: 'validation'
      };

    } catch (error) {
      console.error('❌ Step 6-7: Token validation error:', error);
      return {
        success: false,
        error: `Token validation error: ${error.message}`,
        step: 'validation'
      };
    }
  }

  /**
   * Step 8: App signs up/logs in user
   */
  private async signUpOrLoginUser(user: any): Promise<PiAuthSequenceResult> {
    try {
      console.log('👤 Step 8: Signing up/logging in user...');

      // Store user data in localStorage for session management
      localStorage.setItem('flappypi-user', JSON.stringify(user));
      localStorage.setItem('flappypi-auth-timestamp', Date.now().toString());

      // Store access token globally for other services
      (window as any).piAccessToken = user.accessToken;

      console.log('✅ Step 8: User signed up/logged in successfully');
      console.log('👤 Username:', user.username);
      console.log('🆔 UID:', user.uid);

      return {
        success: true,
        user: user,
        step: 'signup_login'
      };

    } catch (error) {
      console.error('❌ Step 8: User signup/login failed:', error);
      return {
        success: false,
        error: `User signup/login failed: ${error.message}`,
        step: 'signup_login'
      };
    }
  }

  /**
   * Complete Pi Authentication Sequence
   * Implements the full sequence diagram flow
   */
  async authenticate(config: PiAuthSequenceConfig = {}): Promise<PiAuthSequenceResult> {
    // Prevent multiple simultaneous authentications
    if (this.isAuthenticating) {
      return {
        success: false,
        error: 'Authentication already in progress',
        step: 'prevention'
      };
    }

    this.isAuthenticating = true;

    try {
      console.log('🚀 Starting Pi Authentication Sequence...');
      console.log('📱 Environment:', {
        isPiBrowser: this.isPiBrowser(),
        userAgent: navigator.userAgent.substring(0, 100),
        hostname: window.location.hostname
      });

      // Default scopes
      const scopes = config.scopes || ['payments', 'username'];
      const enableProductionValidation = config.enableProductionValidation !== false; // Default to true

      // Step 1-2: User clicks "Connect with Pi Network" -> App calls Pi.authenticate(scopes)
      const authResult = await this.initiateAuthentication(scopes);
      if (!authResult.success) {
        return authResult;
      }

      // Step 3-4: PiBrowser prompts for permissions -> User approves
      // (This happens automatically in the Pi.authenticate call above)

      // Step 5: PiBrowser returns authResult (user, accessToken)
      // (This is the authResult we received above)

      // Step 6-7: App validates accessToken via /v2/me (Production) -> PiAPI returns user info
      if (enableProductionValidation) {
        const validationResult = await this.validateAccessToken(authResult.user!.accessToken);
        if (!validationResult.success) {
          return validationResult;
        }
        // Use the validated user data
        authResult.user = validationResult.user;
      }

      // Step 8: App signs up/logs in user
      const signupResult = await this.signUpOrLoginUser(authResult.user!);
      if (!signupResult.success) {
        return signupResult;
      }

      console.log('🎉 Pi Authentication Sequence completed successfully!');
      return {
        success: true,
        user: signupResult.user,
        step: 'complete'
      };

    } catch (error) {
      console.error('❌ Pi Authentication Sequence failed:', error);
      return {
        success: false,
        error: `Authentication sequence failed: ${error.message}`,
        step: 'error'
      };
    } finally {
      this.isAuthenticating = false;
    }
  }

  /**
   * Check if we're in Pi Browser
   */
  private isPiBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const ua = navigator.userAgent.toLowerCase();
    
    // Check for Pi SDK object
    const hasPiObject = typeof window.Pi !== 'undefined';
    
    // Check user agent for Pi Browser indicators
    const hasPiUserAgent = ua.includes('pi browser') || 
                          ua.includes('pibrowser') || 
                          ua.includes('pi-browser') ||
                          ua.includes('minepi') ||
                          ua.includes('pinet') ||
                          ua.includes('pi/');
    
    // Check for Pi-specific features
    const hasPiFeatures = typeof window.Pi?.authenticate === 'function';
    
    return hasPiObject || hasPiUserAgent || hasPiFeatures;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): any {
    try {
      const userData = localStorage.getItem('flappypi-user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const timestamp = localStorage.getItem('flappypi-auth-timestamp');
    
    if (!user || !timestamp) return false;
    
    // Check if authentication is still valid (24 hours)
    const authTime = parseInt(timestamp);
    const now = Date.now();
    const validDuration = 24 * 60 * 60 * 1000; // 24 hours
    
    return (now - authTime) < validDuration;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('flappypi-user');
    localStorage.removeItem('flappypi-auth-timestamp');
    delete (window as any).piAccessToken;
    console.log('👋 User logged out');
  }

  /**
   * Get authentication status
   */
  getAuthStatus(): {
    isPiBrowser: boolean;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    user: any;
  } {
    return {
      isPiBrowser: this.isPiBrowser(),
      isAuthenticated: this.isAuthenticated(),
      isAuthenticating: this.isAuthenticating,
      user: this.getCurrentUser()
    };
  }
}

// Export singleton instance
export const piAuthSequence = PiAuthSequence.getInstance();

// Export convenience functions
export const authenticateWithPiSequence = (config?: PiAuthSequenceConfig) => 
  piAuthSequence.authenticate(config);

export const getPiAuthSequenceStatus = () => 
  piAuthSequence.getAuthStatus();

export const logoutPiUser = () => 
  piAuthSequence.logout(); 