import React, { useEffect, useState } from 'react';

interface PiSDKInitializerProps {
  children: React.ReactNode;
}

const PiSDKInitializer: React.FC<PiSDKInitializerProps> = ({ children }) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    const initializePiSDK = async () => {
      if (initAttempted) return;
      setInitAttempted(true);

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('🔄 Server-side rendering, skipping Pi SDK initialization');
        setSdkReady(true);
        return;
      }

      // Check if Pi SDK is available
      if (!window.Pi) {
        console.log('⚠️ Pi SDK not found in window object');
        setSdkReady(true); // Continue without Pi SDK for regular browsers
        return;
      }

      try {
        console.log('🚀 Initializing Pi SDK...');
        
        // Initialize with minimal configuration for maximum compatibility
        await window.Pi.init({
          version: '2.0'
        });

        console.log('✅ Pi SDK initialized successfully');
        
        // Dispatch global event
        window.dispatchEvent(new CustomEvent('pi-sdk-ready'));
        
        setSdkReady(true);
      } catch (error) {
        console.error('❌ Pi SDK initialization failed:', error);
        
        // Continue anyway - app should work without Pi SDK
        setSdkReady(true);
      }
    };

    // Initialize immediately
    initializePiSDK();

    // Also listen for the SDK ready event in case it's initialized elsewhere
    const handleSDKReady = () => {
      console.log('🎉 Pi SDK ready event received');
      setSdkReady(true);
    };

    window.addEventListener('pi-sdk-ready', handleSDKReady);

    return () => {
      window.removeEventListener('pi-sdk-ready', handleSDKReady);
    };
  }, [initAttempted]);

  // Always render children - don't block the app
  return <>{children}</>;
};

export default PiSDKInitializer;