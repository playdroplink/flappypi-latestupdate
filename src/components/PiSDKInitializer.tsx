import React, { useEffect, useState } from 'react';
import { piAuthService } from '../services/piAuthService';

interface PiSDKInitializerProps {
  children: React.ReactNode;
}

const PiSDKInitializer: React.FC<PiSDKInitializerProps> = ({ children }) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [initAttempted, setInitAttempted] = useState(false);
  const [autoAuthAttempted, setAutoAuthAttempted] = useState(false);

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
        console.log('⚠️ Pi SDK not found in window object - not in Pi Browser');
        setSdkReady(true); // Continue without Pi SDK for regular browsers
        return;
      }

      // Check if already initialized
      if (window.Pi._initialized) {
        console.log('✅ Pi SDK already initialized');
        setSdkReady(true);
        window.dispatchEvent(new CustomEvent('pi-sdk-ready'));
        return;
      }

      try {
        console.log('🚀 Initializing Pi SDK...');
        
        // Initialize with minimal configuration for maximum compatibility
        await window.Pi.init({
          version: '2.0'
        });

        // Mark as initialized
        window.Pi._initialized = true;

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

    // Auto-trigger authentication after SDK is ready
    const autoAuthenticate = async () => {
      if (autoAuthAttempted || !sdkReady) return;
      setAutoAuthAttempted(true);

      try {
        console.log('🔄 Attempting automatic Pi authentication...');
        const user = await piAuthService.autoAuthenticate();
        if (user) {
          console.log('✅ Automatic authentication successful:', user.username);
        } else {
          console.log('ℹ️ Automatic authentication failed or skipped, user can sign in manually');
        }
      } catch (error) {
        console.warn('⚠️ Automatic authentication error:', error);
      }
    };

    // Initialize immediately
    initializePiSDK().then(() => {
      // Only attempt auto-auth after SDK is ready
      if (sdkReady) {
        autoAuthenticate();
      }
    });

    // Also listen for the SDK ready event in case it's initialized elsewhere
    const handleSDKReady = () => {
      console.log('🎉 Pi SDK ready event received');
      setSdkReady(true);
      // Attempt auto-auth when SDK is ready
      autoAuthenticate();
    };

    window.addEventListener('pi-sdk-ready', handleSDKReady);

    return () => {
      window.removeEventListener('pi-sdk-ready', handleSDKReady);
    };
  }, [initAttempted, sdkReady, autoAuthAttempted]);

  // Always render children - don't block the app
  return <>{children}</>;
};

export default PiSDKInitializer;