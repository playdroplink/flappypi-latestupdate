import React from 'react';
import { usePiAuth } from '../context/PiAuthContext';

interface AutoLoginStatusProps {
  className?: string;
}

const AutoLoginStatus: React.FC<AutoLoginStatusProps> = ({ className = '' }) => {
  const { 
    isAutoLoginEnabled, 
    enableAutoLogin, 
    disableAutoLogin, 
    isAuthenticated, 
    isLoading 
  } = usePiAuth();

  // Check if we're in a PiNet environment
  const isPiNet = typeof window !== 'undefined' && (
    window.location.hostname.includes('ecosystem.pinet.com') || 
    window.location.hostname.includes('flappypi2807.pinet.com')
  );

  if (!isPiNet) {
    return null; // Don't show auto-login controls outside PiNet
  }

  return (
    <div className={`auto-login-status ${className}`}>
      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isAutoLoginEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Auto Sign-In
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isAutoLoginEnabled 
                ? 'Automatically sign in when available' 
                : 'Manual sign-in required'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
              Signed In
            </span>
          )}
          
          <button
            onClick={isAutoLoginEnabled ? disableAutoLogin : enableAutoLogin}
            disabled={isLoading}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              isAutoLoginEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Loading...' : isAutoLoginEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      
      {isAutoLoginEnabled && !isAuthenticated && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Auto sign-in is enabled. You'll be automatically signed in when you visit this app in Pi Browser.
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoLoginStatus;
