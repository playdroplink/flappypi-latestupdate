import React, { useState } from 'react';
import { usePiAuthSequence } from '../hooks/usePiAuthSequence';

interface PiAuthSequenceButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showSteps?: boolean;
  className?: string;
  onAuthSuccess?: (user: any) => void;
  onAuthError?: (error: string) => void;
  children?: React.ReactNode;
}

export const PiAuthSequenceButton: React.FC<PiAuthSequenceButtonProps> = ({
  variant = 'default',
  size = 'md',
  showStatus = true,
  showSteps = true,
  className = '',
  onAuthSuccess,
  onAuthError,
  children
}) => {
  const auth = usePiAuthSequence();
  const [showStepDetails, setShowStepDetails] = useState(false);

  // Handle authentication success
  React.useEffect(() => {
    if (auth.isAuthenticated && auth.user && onAuthSuccess) {
      onAuthSuccess(auth.user);
    }
  }, [auth.isAuthenticated, auth.user, onAuthSuccess]);

  // Handle authentication error
  React.useEffect(() => {
    if (auth.error && onAuthError) {
      onAuthError(auth.error);
    }
  }, [auth.error, onAuthError]);

  // Handle authentication click
  const handleAuthenticate = async () => {
    if (auth.isAuthenticating) return;
    
    try {
      const result = await auth.authenticate({
        scopes: ['payments', 'username'],
        enableProductionValidation: true
      });

      if (!result.success) {
        console.error('Authentication failed:', result.error);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    auth.logout();
  };

  // Get button variant styles
  const getButtonStyles = () => {
    const baseStyles = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const variantStyles = {
      default: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  // Get step description
  const getStepDescription = (step: string) => {
    const stepDescriptions: Record<string, string> = {
      'starting': '🚀 Starting authentication sequence...',
      'sdk_check': '🔧 Checking Pi SDK availability...',
      'authentication': '🔐 Calling Pi.authenticate(scopes)...',
      'validation': '🔍 Validating access token with Pi API...',
      'signup_login': '👤 Signing up/logging in user...',
      'complete': '✅ Authentication sequence completed!',
      'error': '❌ Authentication failed',
      'prevention': '⏳ Authentication already in progress'
    };
    return stepDescriptions[step] || step;
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Authentication Button */}
      <div className="flex flex-col gap-2">
        {auth.isAuthenticated ? (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-600">
              ✅ Authenticated as: <span className="font-medium">{auth.user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className={`${getButtonStyles()} bg-red-600 hover:bg-red-700 focus:ring-red-500`}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleAuthenticate}
            disabled={auth.isAuthenticating}
            className={`${getButtonStyles()} ${auth.isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {auth.isAuthenticating ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Authenticating...
              </span>
            ) : (
              children || 'Connect with Pi Network'
            )}
          </button>
        )}
      </div>

      {/* Status Display */}
      {showStatus && (
        <div className="text-sm">
          {auth.error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">
              ❌ {auth.error}
            </div>
          )}
          
          {auth.step && showSteps && (
            <div className="text-blue-600 bg-blue-50 p-2 rounded">
              {getStepDescription(auth.step)}
            </div>
          )}
        </div>
      )}

      {/* Step Details Toggle */}
      {showSteps && auth.step && (
        <div className="text-xs">
          <button
            onClick={() => setShowStepDetails(!showStepDetails)}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            {showStepDetails ? 'Hide' : 'Show'} Step Details
          </button>
          
          {showStepDetails && (
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
              <h4 className="font-medium mb-2">Sequence Diagram Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>User clicks "Connect with Pi Network"</li>
                <li>App calls Pi.authenticate(scopes)</li>
                <li>PiBrowser prompts for permissions</li>
                <li>User approves</li>
                <li>PiBrowser returns authResult (user, accessToken)</li>
                <li>App validates accessToken via /v2/me (Production)</li>
                <li>PiAPI returns user info</li>
                <li>App signs up/logs in user</li>
              </ol>
              <div className="mt-2 text-gray-500">
                Current step: <span className="font-medium">{auth.step}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Environment Info */}
      <div className="text-xs text-gray-500">
        <div>Pi Browser: {auth.isAuthenticated ? '✅' : '❌'}</div>
        <div>Status: {auth.isAuthenticating ? 'Authenticating' : auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      </div>
    </div>
  );
};

// Auto-authentication wrapper component
export const PiAuthSequenceWrapper: React.FC<{
  children: React.ReactNode;
  autoAuth?: boolean;
  showStatus?: boolean;
}> = ({ children, autoAuth = true, showStatus = true }) => {
  const auth = usePiAuthSequence();

  // Auto-authenticate on mount
  React.useEffect(() => {
    if (autoAuth && !auth.isAuthenticated && !auth.isAuthenticating) {
      const status = auth.getAuthStatus?.() || { isPiBrowser: false };
      if (status.isPiBrowser) {
        console.log('🔄 Auto-authenticating with Pi Sequence...');
        auth.authenticate({
          scopes: ['payments', 'username'],
          enableProductionValidation: true
        });
      }
    }
  }, [autoAuth, auth.isAuthenticated, auth.isAuthenticating, auth.authenticate]);

  return (
    <div className="flex flex-col gap-4">
      {showStatus && (
        <div className="text-sm">
          {auth.error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">
              ❌ {auth.error}
            </div>
          )}
          {auth.step && (
            <div className="text-blue-600 bg-blue-50 p-2 rounded">
              🔄 {auth.step}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}; 