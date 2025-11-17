import React, { useState, useEffect } from 'react';
import { piAuth, PiUser } from '../config/piAuth';

interface PiAuthButtonProps {
  onAuthSuccess?: (user: PiUser) => void;
  onAuthError?: (error: string) => void;
  className?: string;
}

const PiAuthButton: React.FC<PiAuthButtonProps> = ({ 
  onAuthSuccess, 
  onAuthError, 
  className = "" 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentUser, setCurrentUser] = useState<PiUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [isPiSDKAvailable, setIsPiSDKAvailable] = useState(false);

  useEffect(() => {
    // Check environment on mount
    const checkEnvironment = () => {
      const piBrowser = piAuth.isInPiBrowser();
      const sdkAvailable = piAuth.isPiSDKAvailable();
      
      setIsPiBrowser(piBrowser);
      setIsPiSDKAvailable(sdkAvailable);
      
      console.log('🔍 PiAuthButton Environment:', {
        isPiBrowser: piBrowser,
        isPiSDKAvailable: sdkAvailable
      });
    };

    checkEnvironment();
  }, []);

  useEffect(() => {
    // Check authentication status
    const checkAuthStatus = () => {
      const authenticated = piAuth.isUserAuthenticated();
      const user = piAuth.getCurrentUser();
      
      if (authenticated && user) {
        setCurrentUser(user);
        setAuthError(null);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAuthenticate = async () => {
    if (!isPiSDKAvailable) {
      setAuthError('Pi SDK not available');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      console.log('🔐 Starting Pi Network authentication...');
      
      const authResult = await piAuth.authenticate(['payments', 'username']);
      
      console.log('✅ Authentication successful:', authResult);
      setCurrentUser(authResult.user);
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Check if we're in sandbox mode
  const isSandbox = window.location.hostname.includes('sandbox.minepi.com');

  // Show different content based on environment and authentication status
  if (!isPiBrowser && !isSandbox) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-yellow-800">Pi Browser Required</h3>
            <p className="text-sm text-yellow-700">
              This app requires Pi Browser for authentication and payments.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-yellow-600">
              Current: {isPiSDKAvailable ? 'SDK Available' : 'SDK Not Available'}
            </div>
            <div className="text-xs text-yellow-600">
              Browser: {navigator.userAgent.includes('Pi') ? 'Pi Browser' : 'External Browser'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isPiSDKAvailable) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-800">Pi SDK Not Available</h3>
            <p className="text-sm text-red-700">
              Pi SDK is not loaded. Please refresh the page or check your connection.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-green-800">Authenticated</h3>
            <p className="text-sm text-green-700">
              Welcome, <span className="font-medium">{currentUser.username}</span>!
            </p>
            <p className="text-xs text-green-600">
              UID: {currentUser.uid}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="text-center">
        <h3 className="font-semibold text-blue-800 mb-2">Pi Network Authentication</h3>
        <p className="text-sm text-blue-700 mb-4">
          Connect with your Pi Network account for secure authentication and payments.
        </p>
        
        <button
          onClick={handleAuthenticate}
          disabled={isAuthenticating}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isAuthenticating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Authenticating...
            </div>
          ) : (
            'Connect with Pi Network'
          )}
        </button>
        
        {authError && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
            {authError}
          </div>
        )}
        
        <div className="mt-3 text-xs text-blue-600">
          <div>✅ Secure blockchain authentication</div>
          <div>✅ No password to remember</div>
          <div>✅ Access to Pi payments</div>
          <div>✅ Cross-device sync</div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {isSandbox ? 'Sandbox Mode - Testing Environment' : 'Requires Pi Browser or Pi SDK'}
        </div>
      </div>
    </div>
  );
};

export default PiAuthButton; 