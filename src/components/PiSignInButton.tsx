import React, { useState, useEffect } from 'react';
import { piAuthService } from '../services/piAuthService';

interface PiSignInButtonProps {
  onAuthSuccess?: (user: { uid: string; username: string }) => void;
  onAuthError?: (error: string) => void;
  className?: string;
}

const PiSignInButton: React.FC<PiSignInButtonProps> = ({ 
  onAuthSuccess, 
  onAuthError, 
  className = "" 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ uid: string; username: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  useEffect(() => {
    // Check environment on mount
    const checkEnvironment = () => {
      const piBrowser = typeof window !== 'undefined' && window.Pi;
      setIsPiBrowser(!!piBrowser);
      
      console.log('🔍 PiSignInButton Environment:', {
        isPiBrowser: piBrowser
      });
    };

    checkEnvironment();

    // Check authentication status
    const checkAuthStatus = () => {
      const authenticated = piAuthService.isAuthenticated();
      const user = piAuthService.getCurrentUser();
      
      if (authenticated && user) {
        setCurrentUser(user);
        setAuthError(null);
      }
    };

    checkAuthStatus();

    // Listen for authentication events
    const handleAuthSuccess = (event: CustomEvent) => {
      console.log('🎉 Authentication success event received:', event.detail);
      setCurrentUser(event.detail.user);
      setAuthError(null);
      onAuthSuccess?.(event.detail.user);
    };

    const handleAuthSignOut = () => {
      console.log('👋 Sign out event received');
      setCurrentUser(null);
    };

    window.addEventListener('piUserAuthenticated', handleAuthSuccess as EventListener);
    window.addEventListener('piUserSignedOut', handleAuthSignOut as EventListener);

    return () => {
      window.removeEventListener('piUserAuthenticated', handleAuthSuccess as EventListener);
      window.removeEventListener('piUserSignedOut', handleAuthSignOut as EventListener);
    };
  }, [onAuthSuccess]);

  const handleSignIn = async () => {
    if (!isPiBrowser) {
      setAuthError('Pi Browser is required for authentication');
      onAuthError?.('Pi Browser is required for authentication');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      console.log('🔐 Starting Pi Network authentication...');
      
      const user = await piAuthService.authenticateUser();
      
      console.log('✅ Authentication successful:', user);
      setCurrentUser(user);
      onAuthSuccess?.(user);
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthError(errorMessage);
      onAuthError?.(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = () => {
    piAuthService.signOut();
    setCurrentUser(null);
  };

  // Show different content based on environment and authentication status
  if (!isPiBrowser) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="font-semibold text-yellow-800 mb-2">Pi Browser Required</h3>
          <p className="text-sm text-yellow-700 mb-4">
            Please open this app in Pi Browser to authenticate with your Pi Network account.
          </p>
          <a
            href="https://minepi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Download Pi Browser
          </a>
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
          <button
            onClick={handleSignOut}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="text-center">
        <h3 className="font-semibold text-blue-800 mb-2">Pi Network Authentication</h3>
        <p className="text-sm text-blue-700 mb-4">
          Connect with your Pi Network account for secure authentication.
        </p>
        
        <button
          onClick={handleSignIn}
          disabled={isAuthenticating}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isAuthenticating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Authenticating...
            </div>
          ) : (
            'Sign In with Pi'
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
          <div>✅ Username scope access</div>
        </div>
      </div>
    </div>
  );
};

export default PiSignInButton;