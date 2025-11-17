// Pi SDK Test Utility
// This file provides functions to test and debug Pi SDK integration

declare global {
  interface Window {
    Pi: any;
  }
}

export interface PiSDKStatus {
  isAvailable: boolean;
  isInitialized: boolean;
  version: string;
  features: string[];
  errors: string[];
}

export function testPiSDK(): PiSDKStatus {
  const status: PiSDKStatus = {
    isAvailable: false,
    isInitialized: false,
    version: 'unknown',
    features: [],
    errors: []
  };

  try {
    // Check if Pi SDK is available
    if (typeof window !== 'undefined' && window.Pi) {
      status.isAvailable = true;
      console.log('✅ Pi SDK is available');
    } else {
      status.errors.push('Pi SDK not found in window.Pi');
      console.warn('❌ Pi SDK not found in window.Pi');
      return status;
    }

    // Check if Pi SDK is initialized
    if (window.Pi && window.Pi.auth) {
      status.isInitialized = true;
      status.features.push('authentication');
      console.log('✅ Pi SDK is initialized');
    }

    // Check for specific features
    if (window.Pi && window.Pi.payments) {
      status.features.push('payments');
      console.log('✅ Pi payments available');
    }

    if (window.Pi && window.Pi.Ads) {
      status.features.push('ads');
      console.log('✅ Pi ads available');
    }

    if (window.Pi && window.Pi.currentUser) {
      status.features.push('currentUser');
      console.log('✅ Pi currentUser available');
    }

    if (window.Pi && window.Pi.openShareDialog) {
      status.features.push('share');
      console.log('✅ Pi share dialog available');
    }

    // Check version
    if (window.Pi && window.Pi.version) {
      status.version = window.Pi.version;
    }

    console.log('📊 Pi SDK Status:', status);
    return status;

  } catch (error) {
    status.errors.push(`Error testing Pi SDK: ${error}`);
    console.error('❌ Error testing Pi SDK:', error);
    return status;
  }
}

export async function testPiAuthentication(): Promise<boolean> {
  try {
    if (!window.Pi || !window.Pi.authenticate) {
      console.warn('❌ Pi authentication not available');
      return false;
    }

    console.log('🔐 Testing Pi authentication...');
    
    const auth = await window.Pi.authenticate(['username'], () => {
      console.log('💰 Incomplete payment found during auth test');
    });

    console.log('✅ Pi authentication successful:', auth);
    return true;

  } catch (error) {
    console.error('❌ Pi authentication failed:', error);
    return false;
  }
}

export function isPiBrowser(): boolean {
  const ua = navigator.userAgent;
  const hasPiBrowser = /PiBrowser|Pi\//i.test(ua);
  const hasPiObject = typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
  
  console.log('🔍 Pi Browser Detection:', {
    userAgent: ua,
    hasPiBrowser: hasPiBrowser,
    hasPiObject: hasPiObject,
    isPiBrowser: hasPiBrowser || hasPiObject
  });
  
  return hasPiBrowser || hasPiObject;
}

export function logPiSDKInfo(): void {
  console.log('📋 Pi SDK Information:');
  console.log('- User Agent:', navigator.userAgent);
  console.log('- Is Pi Browser:', isPiBrowser());
  console.log('- Pi SDK Available:', typeof window !== 'undefined' && !!window.Pi);
  console.log('- Pi SDK Object:', window.Pi);
  
  if (window.Pi) {
    console.log('- Pi SDK Methods:', Object.keys(window.Pi));
  }
}

// Auto-run tests when imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        console.log('🧪 Running Pi SDK tests...');
        testPiSDK();
        logPiSDKInfo();
      }, 1000); // Wait 1 second for SDK to initialize
    });
  } else {
    setTimeout(() => {
      console.log('🧪 Running Pi SDK tests...');
      testPiSDK();
      logPiSDKInfo();
    }, 1000);
  }
} 