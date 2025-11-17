/**
 * Centralized username extraction utility for Pi authentication
 * This ensures consistent username display across all components
 */

import { useAuth } from '../context/AuthContext';

/**
 * Enhanced username extraction function that handles all Pi authentication scenarios
 * @param user - User object from any source (Pi SDK, localStorage, etc.)
 * @returns Extracted username or fallback
 */
export const extractUsername = (user: any): string => {
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

/**
 * Get the best available username from all sources
 * This function checks multiple sources in order of priority
 * @returns The best available username
 */
export const getBestUsername = (): string => {
  console.log('🔍 UsernameUtils - Starting comprehensive username extraction...');
  
  // Helper function to extract username from user object
  const extractUsernameFromUser = (user: any) => {
    if (!user) return null;
    
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
    
    return null;
  };
  
  // Check if we're in sandbox environment
  const isSandbox = typeof window !== 'undefined' && window.location.hostname.includes('sandbox.minepi.com');
  const isPiNet = typeof window !== 'undefined' && window.location.hostname.includes('pinet.com');
  const isPiBrowser = typeof window !== 'undefined' && !!window.Pi;
  
  console.log('🧪 UsernameUtils - Environment check:', {
    isSandbox,
    isPiNet,
    isPiBrowser,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    windowPiExists: typeof window !== 'undefined' ? !!window.Pi : false,
    windowPiType: typeof window !== 'undefined' ? typeof window.Pi : 'undefined',
    windowPiKeys: typeof window !== 'undefined' && window.Pi ? Object.keys(window.Pi) : []
  });
  
  // Method 1: Check localStorage for flappypi-pi-user (most reliable for Pi auth)
  const storedPiUser = localStorage.getItem('flappypi-pi-user');
  const storedPiAuth = localStorage.getItem('flappypi-pi-auth');
  
  if (storedPiAuth === 'true' && storedPiUser) {
    try {
      const parsedUser = JSON.parse(storedPiUser);
      const username = extractUsernameFromUser(parsedUser);
      if (username && username !== 'Player') {
        console.log('✅ UsernameUtils - Using localStorage Pi user:', username);
        return username;
      }
    } catch (error) {
      console.error('❌ UsernameUtils - Error parsing stored Pi user:', error);
    }
  }
  
  // Method 2: Check Pi SDK localStorage directly
  const piSDKUser = localStorage.getItem('pi_user');
  const piSDKToken = localStorage.getItem('pi_access_token');
  
  if (piSDKToken && piSDKUser) {
    try {
      const parsedPiSDKUser = JSON.parse(piSDKUser);
      const username = extractUsernameFromUser(parsedPiSDKUser);
      if (username && username !== 'Player') {
        console.log('✅ UsernameUtils - Using Pi SDK localStorage user:', username);
        return username;
      }
    } catch (error) {
      console.error('❌ UsernameUtils - Error parsing Pi SDK user:', error);
    }
  }
  
  // Method 3: Check window.Pi.currentUser if available
  if (typeof window !== 'undefined' && window.Pi) {
    try {
      // Check if currentUser is a function
      if (typeof window.Pi.currentUser === 'function') {
        const currentUser = window.Pi.currentUser();
        if (currentUser) {
          const username = extractUsernameFromUser(currentUser);
          if (username && username !== 'Player') {
            console.log('✅ UsernameUtils - Using window.Pi.currentUser():', username);
            return username;
          }
        }
      }
      
      // Check if currentUser is an object
      if (window.Pi.currentUser && typeof window.Pi.currentUser === 'object') {
        const username = extractUsernameFromUser(window.Pi.currentUser);
        if (username && username !== 'Player') {
          console.log('✅ UsernameUtils - Using window.Pi.currentUser object:', username);
          return username;
        }
      }
      
      // Check if user property exists
      if (window.Pi.user) {
        const username = extractUsernameFromUser(window.Pi.user);
        if (username && username !== 'Player') {
          console.log('✅ UsernameUtils - Using window.Pi.user:', username);
          return username;
        }
      }
    } catch (error) {
      console.warn('⚠️ UsernameUtils - Error checking window.Pi:', error);
    }
  }
  
  // Method 4: Check regular localStorage username
  const storedUsername = localStorage.getItem('flappypi-username');
  if (storedUsername && storedUsername !== 'Player' && storedUsername.trim() !== '') {
    console.log('✅ UsernameUtils - Using stored username:', storedUsername);
    return storedUsername.trim();
  }
  
  // Method 5: Check for Pi SDK user in other localStorage keys
  const possibleKeys = ['pi_user', 'piUser', 'user', 'currentUser', 'authenticatedUser'];
  for (const key of possibleKeys) {
    const userData = localStorage.getItem(key);
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const username = extractUsernameFromUser(parsedUser);
        if (username && username !== 'Player') {
          console.log(`✅ UsernameUtils - Using localStorage key ${key}:`, username);
          return username;
        }
      } catch (error) {
        // Not JSON, might be plain text
        if (userData && userData !== 'Player' && userData.trim() !== '') {
          console.log(`✅ UsernameUtils - Using localStorage key ${key} as text:`, userData);
          return userData.trim();
        }
      }
    }
  }
  
  // Final fallback
  console.log('⚠️ UsernameUtils - No username found, using fallback');
  return 'Pi User';
};

/**
 * Hook to get the best available username
 * This can be used in React components
 */
export const useBestUsername = (): string => {
  const { isAuthenticated, username, isPiAuth, piUser } = useAuth();
  
  // If we have a username from AuthContext, use it
  if (username && username !== 'Player' && username.trim() !== '') {
    return username.trim();
  }
  
  // If we have a piUser from AuthContext, extract username from it
  if (piUser && isPiAuth) {
    const extractedUsername = extractUsername(piUser);
    if (extractedUsername !== 'Pi User') {
      return extractedUsername;
    }
  }
  
  // Fallback to comprehensive extraction
  return getBestUsername();
};

/**
 * Get username for display in modals and score screens
 * This is the main function to use in components
 */
export const getDisplayUsername = (): string => {
  return getBestUsername();
};
