/**
 * Quick window.Pi Check
 * This script quickly checks if window.Pi is available and working
 */

console.log('🔍 Checking window.Pi availability...');

// Basic availability check
function checkWindowPiAvailability() {
  console.log('\n📋 Basic Availability Check:');
  
  if (typeof window === 'undefined') {
    console.log('❌ window is undefined (server-side rendering)');
    return false;
  }
  
  if (!window.Pi) {
    console.log('❌ window.Pi is not available');
    console.log('💡 This could mean:');
    console.log('   - Not in Pi Browser');
    console.log('   - Not in sandbox environment');
    console.log('   - Pi SDK not loaded');
    return false;
  }
  
  console.log('✅ window.Pi is available');
  return true;
}

// Check window.Pi properties and methods
function checkWindowPiMethods() {
  console.log('\n🔧 window.Pi Methods and Properties:');
  
  if (!window.Pi) {
    console.log('❌ window.Pi not available');
    return null;
  }
  
  const methods = {
    'window.Pi.init': typeof window.Pi.init,
    'window.Pi.authenticate': typeof window.Pi.authenticate,
    'window.Pi.currentUser': typeof window.Pi.currentUser,
    'window.Pi.createPayment': typeof window.Pi.createPayment,
    'window.Pi.signOut': typeof window.Pi.signOut,
    'window.Pi.isPiBrowser': typeof window.Pi.isPiBrowser,
    'window.Pi.user': typeof window.Pi.user
  };
  
  console.log('Available methods:');
  Object.entries(methods).forEach(([method, type]) => {
    const status = type !== 'undefined' ? '✅' : '❌';
    console.log(`  ${status} ${method}: ${type}`);
  });
  
  return methods;
}

// Test current user access
function testCurrentUserAccess() {
  console.log('\n👤 Testing Current User Access:');
  
  if (!window.Pi) {
    console.log('❌ window.Pi not available');
    return null;
  }
  
  // Test 1: window.Pi.currentUser() function
  if (typeof window.Pi.currentUser === 'function') {
    try {
      const user = window.Pi.currentUser();
      console.log('✅ window.Pi.currentUser() result:', user);
      return user;
    } catch (error) {
      console.log('❌ window.Pi.currentUser() failed:', error.message);
    }
  }
  
  // Test 2: window.Pi.currentUser property
  if (window.Pi.currentUser && typeof window.Pi.currentUser === 'object') {
    console.log('✅ window.Pi.currentUser property:', window.Pi.currentUser);
    return window.Pi.currentUser;
  }
  
  // Test 3: window.Pi.user
  if (window.Pi.user) {
    console.log('✅ window.Pi.user:', window.Pi.user);
    return window.Pi.user;
  }
  
  console.log('❌ No current user found');
  return null;
}

// Test authentication status
function testAuthenticationStatus() {
  console.log('\n🔐 Testing Authentication Status:');
  
  if (!window.Pi) {
    console.log('❌ window.Pi not available');
    return false;
  }
  
  // Check if user is authenticated
  const user = testCurrentUserAccess();
  if (user && user.uid) {
    console.log('✅ User appears to be authenticated');
    console.log('   User ID:', user.uid);
    console.log('   Username:', user.username || user.name || 'No username');
    return true;
  }
  
  console.log('❌ User not authenticated');
  return false;
}

// Environment information
function getEnvironmentInfo() {
  console.log('\n🌍 Environment Information:');
  
  const info = {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    userAgent: navigator.userAgent,
    isSandbox: window.location.hostname.includes('sandbox.minepi.com'),
    isPiNet: window.location.hostname.includes('pinet.com'),
    isPiBrowser: navigator.userAgent.includes('Pi') || navigator.userAgent.includes('PiBrowser'),
    hasWindowPi: !!window.Pi
  };
  
  console.log('Environment details:');
  Object.entries(info).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  
  return info;
}

// Run all checks
function runWindowPiCheck() {
  console.log('🧪 Starting window.Pi Check...\n');
  
  const isAvailable = checkWindowPiAvailability();
  const methods = checkWindowPiMethods();
  const user = testCurrentUserAccess();
  const isAuthenticated = testAuthenticationStatus();
  const envInfo = getEnvironmentInfo();
  
  console.log('\n📊 Summary:');
  console.log('window.Pi available:', isAvailable ? '✅ Yes' : '❌ No');
  console.log('User authenticated:', isAuthenticated ? '✅ Yes' : '❌ No');
  console.log('Environment:', envInfo.isSandbox ? '🧪 Sandbox' : envInfo.isPiNet ? '🌐 PiNet' : '🌍 Regular');
  
  if (user) {
    console.log('Current user:', {
      uid: user.uid,
      username: user.username || user.name,
      hasAvatar: !!user.avatar
    });
  }
  
  return {
    isAvailable,
    methods,
    user,
    isAuthenticated,
    envInfo
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runWindowPiCheck();
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkWindowPiAvailability,
    checkWindowPiMethods,
    testCurrentUserAccess,
    testAuthenticationStatus,
    getEnvironmentInfo,
    runWindowPiCheck
  };
}
