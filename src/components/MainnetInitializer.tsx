// Mainnet Initializer Component
// Handles complete Pi Network mainnet initialization and setup

import React, { useEffect, useState } from 'react';
import { mainnetSetup, MainnetSetupResult } from '../utils/mainnetSetup';
import { PI_CONFIG } from '../config/piConfig';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface MainnetInitializerProps {
  children: React.ReactNode;
  onSetupComplete?: (result: MainnetSetupResult) => void;
  showSetupStatus?: boolean;
}

const MainnetInitializer: React.FC<MainnetInitializerProps> = ({
  children,
  onSetupComplete,
  showSetupStatus = false
}) => {
  const [setupResult, setSetupResult] = useState<MainnetSetupResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    initializeMainnet();
  }, []);

  const initializeMainnet = async () => {
    try {
      setIsLoading(true);
      setSetupError(null);

      console.log('🚀 Initializing Pi Network Mainnet...');
      
      const result = await mainnetSetup.setupMainnet();
      setSetupResult(result);

      if (onSetupComplete) {
        onSetupComplete(result);
      }

      if (!result.success) {
        setSetupError(result.message);
      }

      console.log('🚀 Mainnet initialization complete:', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSetupError(errorMessage);
      console.error('❌ Mainnet initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    
    if (setupError) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (setupResult?.success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isLoading) {
      return 'Initializing Pi Network Mainnet...';
    }
    
    if (setupError) {
      return `Setup Error: ${setupError}`;
    }
    
    if (setupResult?.success) {
      return 'Pi Network Mainnet Ready';
    }
    
    return 'Setup Completed with Warnings';
  };

  const getNetworkStatus = () => {
    const isMainnet = PI_CONFIG.isMainnet();
    const isSandbox = PI_CONFIG.isSandbox();
    const networkMode = PI_CONFIG.getNetworkMode();

    if (isMainnet && !isSandbox) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Mainnet Connected</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Testnet Mode</span>
        </div>
      );
    }
  };

  if (showSetupStatus) {
    return (
      <div className="w-full">
        {/* Setup Status Bar */}
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
                {setupResult && (
                  <p className="text-xs text-gray-500">
                    {setupResult.details.piSDKInitialized && 'SDK • '}
                    {setupResult.details.authenticationReady && 'Auth • '}
                    {setupResult.details.paymentsReady && 'Payments • '}
                    {setupResult.details.adsReady && 'Ads • '}
                    {setupResult.details.metadataReady && 'Metadata'}
                  </p>
                )}
              </div>
            </div>
            {getNetworkStatus()}
          </div>

          {/* Error Details */}
          {setupError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{setupError}</p>
              {setupResult?.errors && setupResult.errors.length > 0 && (
                <ul className="mt-2 text-xs text-red-700 list-disc list-inside">
                  {setupResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Warning Details */}
          {setupResult?.warnings && setupResult.warnings.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">Warnings:</p>
              <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside">
                {setupResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Retry Button */}
          {setupError && (
            <div className="mt-3">
              <button
                onClick={initializeMainnet}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry Setup
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {children}
      </div>
    );
  }

  // If not showing setup status, just render children
  return <>{children}</>;
};

export default MainnetInitializer;
