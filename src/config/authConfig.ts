// Authentication Configuration for Flappy Pi
// This file controls all authentication and browser restrictions

export interface AuthConfig {
  // Main authentication settings
  requirePiBrowser: boolean;
  requirePiAuth: boolean;
  allowLocalAuth: boolean;
  
  // Browser detection settings
  strictBrowserDetection: boolean;
  allowPiNet: boolean;
  allowMainnet: boolean;
  
  // Authentication flow settings
  autoLogin: boolean;
  sessionTimeout: number; // in minutes
  maxAuthAttempts: number;
  forceAutoSignIn: boolean; // Always attempt auto sign-in
  
  // Feature restrictions
  restrictPayments: boolean;
  restrictAds: boolean;
  restrictLeaderboard: boolean;
  
  // Debug settings
  debugMode: boolean;
  bypassAuth: boolean;
}

// Browser-safe environment variable access
const getEnvVar = (key: string, fallback: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - use window.__ENV__ or localStorage
    return (window as any).__ENV__?.[key] || 
           localStorage.getItem(key) || 
           fallback;
  }
  // Node.js environment
  return (process?.env?.[key] as string) || fallback;
};

const getNodeEnv = (): string => {
  if (typeof window !== 'undefined') {
    // Browser environment - try to detect from various sources
    const env = (window as any).__ENV__?.NODE_ENV ||
                localStorage.getItem('NODE_ENV') ||
                (window.location.hostname === 'localhost' ? 'development' : 'production');
    return env;
  }
  // Node.js environment
  return process?.env?.NODE_ENV || 'development';
};

// Default configuration - FULL MAINNET PRODUCTION MODE
export const defaultAuthConfig: AuthConfig = {
  // Main authentication settings
  requirePiBrowser: false,  // Allow any browser for mainnet access
  requirePiAuth: false,     // No authentication required for mainnet testing
  allowLocalAuth: true,     // Enable local auth for mainnet
  
  // Browser detection settings
  strictBrowserDetection: false,  // Less strict for mainnet access
  allowPiNet: true,
  allowMainnet: true,
  
  // Authentication flow settings
  autoLogin: false, // Disabled - require manual sign-in
  sessionTimeout: 60, // 1 hour
  maxAuthAttempts: 3,
  forceAutoSignIn: false, // Disabled - require manual sign-in
  
  // Feature restrictions - ALL DISABLED FOR MAINNET
  restrictPayments: false, // Enable real Pi payments
  restrictAds: false,
  restrictLeaderboard: false,
  
  // Debug settings
  debugMode: false,   // Disable debug for mainnet production
  bypassAuth: true,   // Allow full access without restrictions
};

// Development configuration - MAINNET MODE
export const devAuthConfig: AuthConfig = {
  ...defaultAuthConfig,
  requirePiBrowser: false,
  requirePiAuth: false,
  allowLocalAuth: true,
  strictBrowserDetection: false,
  debugMode: false,    // Mainnet production mode
  bypassAuth: true,    // No restrictions for mainnet
};

// Testing configuration - MAINNET MODE
export const testAuthConfig: AuthConfig = {
  ...defaultAuthConfig,
  requirePiBrowser: false,
  requirePiAuth: false,
  allowLocalAuth: true,
  strictBrowserDetection: false,
  restrictPayments: false, // Enable real Pi payments
  restrictAds: false,
  restrictLeaderboard: false,
  debugMode: false,    // Mainnet production mode
  bypassAuth: true,    // No restrictions for mainnet
};

import { isPiNetDomain, isPiBrowser, getPiNetworkEnvironment } from './piNetworkConfig';

// Get current environment
const currentEnv = getNodeEnv();
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const isPiNet = typeof window !== 'undefined' && isPiNetDomain(window.location.hostname);

// Dynamic configuration based on environment - FULL MAINNET MODE
export const getAuthConfig = (): AuthConfig => {
  // AUTO SIGN-IN MODE - No restrictions, always attempt auto sign-in
  return {
    ...defaultAuthConfig,
    requirePiBrowser: false,     // Allow any browser
    requirePiAuth: false,        // No authentication required
    allowLocalAuth: true,        // Enable local auth
    autoLogin: false,            // Disabled - require manual sign-in
    debugMode: false,            // Production mode
    bypassAuth: true,            // NO RESTRICTIONS - Full access
    allowPiNet: true,            // Allow PiNet domain
    allowMainnet: true,          // Full mainnet enabled
    restrictPayments: false,     // Enable REAL Pi payments
    restrictAds: false,          // No ad restrictions
    restrictLeaderboard: false,  // No leaderboard restrictions
    strictBrowserDetection: false, // No browser restrictions
    forceAutoSignIn: false,      // Disabled - require manual sign-in
  };
};

// Helper functions for checking authentication requirements
export const shouldRequirePiBrowser = (): boolean => {
  const config = getAuthConfig();
  return config.requirePiBrowser && !config.bypassAuth;
};

export const shouldRequirePiAuth = (): boolean => {
  const config = getAuthConfig();
  return config.requirePiAuth && !config.bypassAuth;
};

export const shouldAllowLocalAuth = (): boolean => {
  const config = getAuthConfig();
  return config.allowLocalAuth || config.bypassAuth;
};

export const shouldRestrictPayments = (): boolean => {
  const config = getAuthConfig();
  return config.restrictPayments && !config.bypassAuth;
};

export const shouldRestrictAds = (): boolean => {
  const config = getAuthConfig();
  return config.restrictAds && !config.bypassAuth;
};

export const shouldRestrictLeaderboard = (): boolean => {
  const config = getAuthConfig();
  return config.restrictLeaderboard && !config.bypassAuth;
};

export const isDebugMode = (): boolean => {
  const config = getAuthConfig();
  return config.debugMode;
};

// Authentication validation functions
export const validatePiBrowser = (browserInfo: any): boolean => {
  const config = getAuthConfig();
  
  if (config.bypassAuth) return true;
  if (!config.requirePiBrowser) return true;
  
  return browserInfo.isPiBrowser || 
         (config.allowPiNet && browserInfo.isPiNet) ||
         (config.allowMainnet && browserInfo.isMainnet);
};

export const validatePiAuth = (authInfo: any): boolean => {
  const config = getAuthConfig();
  
  if (config.bypassAuth) return true;
  if (!config.requirePiAuth) return true;
  
  return authInfo.isPiAuth && authInfo.isAuthenticated;
};

// Session management
export const getSessionTimeout = (): number => {
  const config = getAuthConfig();
  return config.sessionTimeout * 60 * 1000; // Convert to milliseconds
};

export const getMaxAuthAttempts = (): number => {
  const config = getAuthConfig();
  return config.maxAuthAttempts;
};

// Logging utility
export const logAuth = (message: string, data?: any): void => {
  if (isDebugMode()) {
    console.log(`🔐 [Auth] ${message}`, data || '');
  }
};

// Export current configuration
export const authConfig = getAuthConfig();
