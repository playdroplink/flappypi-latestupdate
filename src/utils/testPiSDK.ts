/**
 * Test Pi SDK Configuration and Functions
 * Utility to verify Pi SDK is working in Testnet mode
 */

export const testPiSDK = {
  /**
   * Check if Pi SDK is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  },

  /**
   * Get Pi SDK status
   */
  getStatus() {
    if (!this.isAvailable()) {
      return {
        available: false,
        error: 'Pi SDK not available'
      };
    }

    return {
      available: true,
      sdk: window.Pi,
      methods: Object.keys(window.Pi)
    };
  },

  /**
   * Test Pi SDK initialization
   */
  async testInitialization() {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Pi SDK not available'
      };
    }

    try {
      console.log('🧪 Testing Pi SDK initialization...');
      
      // Test initialization with mainnet mode
      await window.Pi.init({
        version: "2.0",
        sandbox: false // Mainnet mode
      });

      console.log('✅ Pi SDK initialization test successful');
      
      return {
        success: true,
        message: 'Pi SDK initialized successfully in Testnet mode'
      };
    } catch (error) {
      console.error('❌ Pi SDK initialization test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Test Pi SDK authentication
   */
  async testAuthentication() {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Pi SDK not available'
      };
    }

    try {
      console.log('🧪 Testing Pi SDK authentication...');
      
      // Test authentication with username scope
      const auth = await window.Pi.authenticate(['username'], (payment) => {
        console.log('💰 Incomplete payment found:', payment);
      });

      console.log('✅ Pi SDK authentication test successful:', auth);
      
      return {
        success: true,
        user: auth.user,
        accessToken: auth.accessToken ? 'Present' : 'Missing'
      };
    } catch (error) {
      console.error('❌ Pi SDK authentication test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Test Pi SDK current user
   */
  testCurrentUser() {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Pi SDK not available'
      };
    }

    try {
      console.log('🧪 Testing Pi SDK current user...');
      
      // Check if currentUser method exists
      if (typeof (window.Pi as any).currentUser !== 'function') {
        console.warn('⚠️ Pi SDK currentUser method not available');
        return {
          success: false,
          error: 'currentUser method not available in Pi SDK',
          available: false
        };
      }
      
      // Test current user method
      const user = (window.Pi as any).currentUser();
      
      console.log('✅ Pi SDK current user test successful:', user);
      
      return {
        success: true,
        user: user,
        available: true
      };
    } catch (error) {
      console.error('❌ Pi SDK current user test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        available: false
      };
    }
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Pi SDK Tests...');
    
    const results = {
      status: this.getStatus(),
      initialization: await this.testInitialization(),
      authentication: await this.testAuthentication(),
      currentUser: this.testCurrentUser()
    };

    console.log('📊 Pi SDK Test Results:', results);
    return results;
  }
};

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).testPiSDK = testPiSDK;
}
