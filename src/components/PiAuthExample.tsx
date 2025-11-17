import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { Pi } from 'lucide-react';

const PiAuthExample: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  
  const { loginWithPi: authLogin } = useAuth();

  // Check environment on mount
  useEffect(() => {
    const checkEnvironment = () => {
      const hostname = window.location.hostname;
      const userAgent = window.navigator.userAgent;
      
      // Check for Pi Browser
      const isPiBrowserApp = userAgent.includes('PiBrowser') || 
                            userAgent.includes('PiNetwork') ||
                            userAgent.includes('PiApp');
      
      // Check for Pi Network subdomain
      const isPiNetworkSubdomain = hostname.includes('.pinet.com') || 
                                  hostname.includes('.minepi.com') ||
                                  hostname === 'flappypi2807.pinet.com';
      
      // Check if Pi SDK is available
      const hasPiSDK = typeof window !== 'undefined' && window.Pi;
      
      setIsPiBrowser(isPiBrowserApp || isPiNetworkSubdomain || hasPiSDK);
      
      if (hasPiSDK) {
        setSdkReady(true);
        setError(null);
      }
    };

    checkEnvironment();

    // Listen for SDK ready event
    const handleSdkReady = () => {
      console.log('✅ Pi SDK ready event received');
      setSdkReady(true);
      setError(null);
    };
    
    window.addEventListener('pi-sdk-ready', handleSdkReady);

    // Check if SDK is already ready
    if (window.Pi) {
      setSdkReady(true);
      setError(null);
    }

    return () => {
      window.removeEventListener('pi-sdk-ready', handleSdkReady);
    };
  }, []);

  const signIn = async () => {
    if (!sdkReady) {
      setError('Pi SDK not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Starting Pi authentication...');
      
      const authResult = await window.Pi.authenticate(['payments', 'username'], onIncompletePaymentFound);
      
      console.log('✅ Authentication successful:', authResult);
      
      setUser(authResult.user);
      
      // Update main app state
      authLogin(authResult.user);
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Pi className="w-6 h-6 mr-2 text-yellow-600" />
          <CardTitle className="text-xl">Pi Auth Example</CardTitle>
        </div>
        <CardDescription>
          Example Pi Network authentication component
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Environment Status */}
        <div className="text-sm text-gray-600 text-center">
          {isPiBrowser ? "Pi Browser detected" : "Pi Browser not detected"}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* SDK Status */}
        {!sdkReady && (
          <Alert>
            <AlertDescription>
              Waiting for Pi SDK to initialize...
            </AlertDescription>
          </Alert>
        )}

        {/* User Info */}
        {user && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">✅ Authenticated</h4>
            <div className="text-sm text-green-700">
              <div><strong>Username:</strong> {user.username}</div>
              <div><strong>UID:</strong> {user.uid}</div>
            </div>
          </div>
        )}

        {/* Authentication Buttons */}
        <div className="space-y-2">
          {!user && (
            <Button
              onClick={signIn}
              disabled={isLoading || !sdkReady}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Pi className="w-4 h-4 mr-2" />
                  Sign In with Pi
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PiAuthExample;
