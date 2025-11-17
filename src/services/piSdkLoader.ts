// Pi SDK Loader for Mainnet Environment
// Ensures the Pi SDK is loaded properly with correct mainnet settings

import { PI_CONFIG } from '../config/piConfig';

export const loadPiSdk = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const sdkUrl = 'https://sdk.minepi.com/pi-sdk.js';

    // Check if SDK is already loaded
    if (window.Pi) {
      console.log('Pi SDK already loaded');
      resolve(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(`script[src="${sdkUrl}"]`);
    if (existingScript) {
      // Script exists, wait for it to load
      existingScript.addEventListener('load', () => {
        console.log('Pi SDK loaded successfully for mainnet');
        resolve(true);
      });
      existingScript.addEventListener('error', () => {
        console.error('Failed to load Pi SDK');
        resolve(false);
      });
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => {
      console.log('Pi SDK loaded successfully for mainnet');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Pi SDK');
      resolve(false);
    };
    
    // Add to document
    document.head.appendChild(script);
  });
};

// Mainnet environment configuration
export const detectEnvironment = () => {
  const isDevelopment = PI_CONFIG.detectEnvironment().isDevelopment;
  const sandbox = PI_CONFIG.getSandboxSetting(); // Use sandbox (true)
  const networkMode = PI_CONFIG.getNetworkMode();
  
  console.log('🔍 Environment Detection:', {
    isDevelopment,
    sandbox,
    networkMode,
    shouldUseMainnet: PI_CONFIG.shouldUseMainnet()
  });
  
  return {
    isDevelopment,
    sandbox,
    networkMode,
    shouldUseMainnet: PI_CONFIG.shouldUseMainnet()
  };
};
