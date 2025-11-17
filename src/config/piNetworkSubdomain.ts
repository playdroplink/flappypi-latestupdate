/**
 * Pi Network Subdomain Configuration
 * Specific settings for deployment on Pi Network subdomains like flappypi2807.pinet.com
 */

export const PI_NETWORK_SUBDOMAIN_CONFIG = {
  // App identification
  appId: 'flappypi2807',
  appName: 'Flappy Pi',
  developer: '@Wain2020',
  
  // Pi Network specific settings
  validationKey: '94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce',
  networkMode: 'mainnet',
  
  // Subdomain detection
  subdomainPatterns: [
    'flappypi2807.pinet.com',
    '*.pinet.com',
    '*.minepi.com'
  ],
  
  // CORS origins for Pi Network
  corsOrigins: [
    'https://flappypi2807.pinet.com',
    'https://*.pinet.com',
    'https://*.minepi.com',
    'https://flappypi.fun'
  ],
  
  // Pi SDK configuration
  sdkConfig: {
    version: '2.0',
    sandbox: false, // Use mainnet mode
    appId: 'flappypi2807'
  },
  
  // Verification status
  verificationStatus: 'unverified', // This should be updated when verified
  
  // Deployment checklist
  deploymentChecklist: {
    sslEnabled: true,
    corsConfigured: true,
    piSDKLoaded: true,
    validationKeySet: true,
    appIdCorrect: true,
    networkModeSet: 'mainnet'
  }
};

/**
 * Check if current environment is Pi Network subdomain
 */
export const isPiNetworkSubdomain = (): boolean => {
  const hostname = window.location.hostname;
  return PI_NETWORK_SUBDOMAIN_CONFIG.subdomainPatterns.some(pattern => {
    if (pattern.includes('*')) {
      const domain = pattern.replace('*.', '');
      return hostname.endsWith(domain);
    }
    return hostname === pattern;
  });
};

/**
 * Get Pi Network subdomain configuration
 */
export const getPiNetworkConfig = () => {
  return {
    ...PI_NETWORK_SUBDOMAIN_CONFIG,
    currentHostname: window.location.hostname,
    isSubdomain: isPiNetworkSubdomain(),
    protocol: window.location.protocol,
    isSSL: window.location.protocol === 'https:'
  };
};

/**
 * Validate Pi Network subdomain setup
 */
export const validatePiNetworkSetup = () => {
  const config = getPiNetworkConfig();
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check SSL
  if (!config.isSSL) {
    issues.push('HTTPS not enabled - required for Pi Network subdomain');
  }
  
  // Check if it's a subdomain
  if (!config.isSubdomain) {
    warnings.push('Not running on Pi Network subdomain');
  }
  
  // Check Pi SDK
  if (typeof window.Pi === 'undefined') {
    issues.push('Pi SDK not loaded');
  }
  
  // Check app ID
  if (config.currentHostname !== config.appId + '.pinet.com') {
    warnings.push(`App ID mismatch: expected ${config.appId}.pinet.com, got ${config.currentHostname}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    config
  };
};
