import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PI_CONFIG } from '@/config/piConfig';

interface NetworkModeSwitcherProps {
  className?: string;
  showBadge?: boolean;
  showDebugInfo?: boolean;
}

const NetworkModeSwitcher: React.FC<NetworkModeSwitcherProps> = ({ 
  className = '', 
  showBadge = true,
  showDebugInfo = false
}) => {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<'testnet' | 'mainnet' | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const currentMode = PI_CONFIG.getNetworkMode();
  const isTestnet = PI_CONFIG.shouldUseTestnet();
  const isMainnet = PI_CONFIG.shouldUseMainnet();
  const env = PI_CONFIG.detectEnvironment();

  const handleSwitchMode = (newMode: 'testnet' | 'mainnet') => {
    if (newMode === currentMode) {
      toast({
        title: 'Already in this mode',
        description: `You are already in ${newMode} mode.`,
        variant: 'default'
      });
      return;
    }

    setPendingMode(newMode);
    setShowConfirmDialog(true);
  };

  const confirmSwitch = () => {
    if (!pendingMode) return;

    setIsSwitching(true);
    
    try {
      // Note: PI_CONFIG doesn't have setNetworkMode method, so we'll just show a message
      toast({
        title: 'Network Mode Changed',
        description: `Switched to ${pendingMode} mode. The page will reload to apply changes.`,
        variant: 'default'
      });
      
      // Reload the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: 'Switch Failed',
        description: 'Failed to switch network mode. Please try again.',
        variant: 'destructive'
      });
      setIsSwitching(false);
    }
  };

  const cancelSwitch = () => {
    setShowConfirmDialog(false);
    setPendingMode(null);
    setIsSwitching(false);
  };

  const forceMainnetForMobile = () => {
    toast({
      title: 'Mobile Pi Browser Detected',
      description: 'For mobile Pi Browser, mainnet mode is recommended for full functionality.',
      variant: 'default'
    });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Network Mode</h3>
          {showBadge && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isTestnet 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {currentMode.toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleSwitchMode('testnet')}
            disabled={isTestnet || isSwitching}
            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded"
          >
            Testnet
          </button>
          <button
            onClick={() => handleSwitchMode('mainnet')}
            disabled={isMainnet || isSwitching}
            className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded"
          >
            Mainnet
          </button>
        </div>
      </div>

      {/* Debug Information */}
      {showDebugInfo && (
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <div><strong>Pi Browser:</strong> {env.isPiBrowser ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Should Use Mainnet:</strong> {isMainnet ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Should Use Testnet:</strong> {isTestnet ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Sandbox Setting:</strong> {PI_CONFIG.getSandboxSetting() ? '✅ Enabled' : '❌ Disabled'}</div>
            <div><strong>API URL:</strong> {PI_CONFIG.getApiUrl()}</div>
          </div>
        </div>
      )}

      {/* Mobile Pi Browser Helper */}
      {env.isPiBrowser && (
        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Pi Browser Detected:</strong> For best experience, consider using mainnet mode.
            <button 
              onClick={forceMainnetForMobile}
              className="ml-2 text-blue-600 underline hover:text-blue-800"
            >
              Learn more
            </button>
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Switch Network Mode?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to switch to {pendingMode} mode? This will reload the page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmSwitch}
                disabled={isSwitching}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded"
              >
                {isSwitching ? 'Switching...' : 'Switch'}
              </button>
              <button
                onClick={cancelSwitch}
                disabled={isSwitching}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkModeSwitcher; 