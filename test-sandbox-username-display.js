/**
 * Test Sandbox Username Display
 * This script tests the enhanced sandbox username display functionality
 */

console.log('🧪 Testing Sandbox Username Display...');

// Test environment detection
function testEnvironmentDetection() {
  console.log('\n🔍 Testing Environment Detection:');
  
  const isSandbox = window.location.hostname.includes('sandbox.minepi.com');
  const isPiNet = window.location.hostname.includes('pinet.com');
  const isPiBrowser = typeof window !== 'undefined' && !!window.Pi;
  
  console.log('Environment:', {
    isSandbox,
    isPiNet,
    isPiBrowser,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent
  });
  
  return { isSandbox, isPiNet, isPiBrowser };
}

// Test window.Pi access methods
function testWindowPiAccess() {
  console.log('\n🔍 Testing window.Pi Access Methods:');
  
  if (typeof window === 'undefined' || !window.Pi) {
    console.log('❌ window.Pi not available');
    return null;
  }
  
  console.log('✅ window.Pi is available');
  
  // Test different access methods
  const methods = {
    'window.Pi.currentUser function': () => {
      try {
        if (typeof window.Pi.currentUser === 'function') {
          return window.Pi.currentUser();
        }
        return null;
      } catch (error) {
        console.warn('window.Pi.currentUser() failed:', error);
        return null;
      }
    },
    'window.Pi.currentUser property': () => {
      try {
        if (window.Pi.currentUser && typeof window.Pi.currentUser === 'object') {
          return window.Pi.currentUser;
        }
        return null;
      } catch (error) {
        console.warn('window.Pi.currentUser property failed:', error);
        return null;
      }
    },
    'window.Pi.user': () => {
      try {
        return window.Pi.user || null;
      } catch (error) {
        console.warn('window.Pi.user failed:', error);
        return null;
      }
    }
  };
  
  const results = {};
  for (const [methodName, method] of Object.entries(methods)) {
    try {
      const result = method();
      results[methodName] = result;
      console.log(`${methodName}:`, result ? '✅ Found user' : '❌ No user');
    } catch (error) {
      results[methodName] = null;
      console.log(`${methodName}: ❌ Error -`, error.message);
    }
  }
  
  return results;
}

// Test username extraction
function testUsernameExtraction() {
  console.log('\n🔍 Testing Username Extraction:');
  
  const extractUsername = (user) => {
    if (!user) return 'Pi User';
    
    // Check for username first (most common in Pi Network)
    if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
      return user.username.trim();
    }
    
    // Check for name field
    if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
      return user.name.trim();
    }
    
    // Check for displayName
    if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
      return user.displayName.trim();
    }
    
    // Check for first_name + last_name combination
    if (user.first_name || user.last_name) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName && fullName !== 'Player') {
        return fullName;
      }
    }
    
    return 'Pi User';
  };
  
  // Test with different user objects
  const testUsers = [
    { username: 'testuser123' },
    { name: 'John Doe' },
    { displayName: 'Jane Smith' },
    { first_name: 'Alice', last_name: 'Johnson' },
    { username: 'Player' }, // Should fallback
    { name: 'Player' }, // Should fallback
    { username: '' }, // Should fallback
    { username: '   ' }, // Should fallback
    null,
    undefined,
    {}
  ];
  
  testUsers.forEach((user, index) => {
    const username = extractUsername(user);
    console.log(`Test ${index + 1}:`, { user, extractedUsername: username });
  });
}

// Test localStorage integration
function testLocalStorageIntegration() {
  console.log('\n🔍 Testing localStorage Integration:');
  
  // Check existing localStorage
  const keys = [
    'flappypi-username',
    'flappypi-pi-user',
    'flappypi-pi-auth',
    'pi_user',
    'pi_access_token'
  ];
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value ? '✅ Has value' : '❌ No value');
    if (value && (key.includes('user') || key.includes('username'))) {
      try {
        const parsed = JSON.parse(value);
        console.log(`  Parsed ${key}:`, parsed);
      } catch (error) {
        console.log(`  Raw ${key}:`, value);
      }
    }
  });
}

// Test complete username display flow
function testCompleteUsernameDisplay() {
  console.log('\n🔍 Testing Complete Username Display Flow:');
  
  const { isSandbox, isPiNet, isPiBrowser } = testEnvironmentDetection();
  const windowPiResults = testWindowPiAccess();
  
  // Simulate the getUserDisplay function logic
  const extractUsername = (user) => {
    if (!user) return 'Pi User';
    
    if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
      return user.username.trim();
    }
    
    if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
      return user.name.trim();
    }
    
    if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
      return user.displayName.trim();
    }
    
    if (user.first_name || user.last_name) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName && fullName !== 'Player') {
        return fullName;
      }
    }
    
    return 'Pi User';
  };
  
  // Check localStorage first
  const storedPiUser = localStorage.getItem('flappypi-pi-user');
  const storedPiAuth = localStorage.getItem('flappypi-pi-auth');
  
  if (storedPiAuth === 'true' && storedPiUser) {
    try {
      const parsedUser = JSON.parse(storedPiUser);
      const username = extractUsername(parsedUser);
      console.log('✅ Found username in localStorage:', username);
      return { username, source: 'localStorage', isPiAuth: true };
    } catch (error) {
      console.error('❌ Error parsing stored Pi user:', error);
    }
  }
  
  // Check window.Pi directly for sandbox/PiNet
  if ((isSandbox || isPiNet) && windowPiResults) {
    for (const [methodName, user] of Object.entries(windowPiResults)) {
      if (user && user.uid) {
        const username = extractUsername(user);
        if (username !== 'Pi User') {
          console.log(`✅ Found username via ${methodName}:`, username);
          return { username, source: methodName, isPiAuth: true };
        }
      }
    }
  }
  
  // Fallback
  console.log('⚠️ No username found, using fallback');
  return { username: 'Pi User', source: 'fallback', isPiAuth: false };
}

// Run all tests
function runAllTests() {
  console.log('🧪 Starting Sandbox Username Display Tests...\n');
  
  testEnvironmentDetection();
  testWindowPiAccess();
  testUsernameExtraction();
  testLocalStorageIntegration();
  
  const result = testCompleteUsernameDisplay();
  
  console.log('\n📊 Test Results Summary:');
  console.log('Final username result:', result);
  
  if (result.username !== 'Pi User') {
    console.log('✅ SUCCESS: Username display is working!');
  } else {
    console.log('⚠️ WARNING: Using fallback username - may need authentication');
  }
  
  return result;
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  runAllTests();
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testEnvironmentDetection,
    testWindowPiAccess,
    testUsernameExtraction,
    testLocalStorageIntegration,
    testCompleteUsernameDisplay,
    runAllTests
  };
}
