import React, { useState, useEffect } from 'react';
import { usePiAuth } from '../hooks/usePiAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, User, LogOut, Smartphone, Globe, Shield, Wallet, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext'; // Add AuthContext integration

interface PiMobileAuthProps {
  onAuthSuccess?: (user: any) => void;
  onAuthError?: (error: string) => void;
  autoAuth?: boolean;
  showStatus?: boolean;
  className?: string;
}

const PiMobileAuth: React.FC<PiMobileAuthProps> = ({
  onAuthSuccess,
  onAuthError,
  autoAuth = true,
  showStatus = true,
  className = ''
}) => {
  const { toast } = useToast();
  const auth = usePiAuth();
  const { loginWithPi } = useAuth(); // Get loginWithPi from AuthContext
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'detecting' | 'prompting' | 'authenticating' | 'success' | 'error'>('idle');
  const hasIntegratedRef = React.useRef(false);

  // Auto-authenticate if enabled and in Pi Browser
  useEffect(() => {
    if (autoAuth && auth.authStatus.isPiBrowser && !auth.isAuthenticated && !isAuthenticating) {
      handleAutoAuth();
    }
  }, [autoAuth, auth.authStatus.isPiBrowser, auth.isAuthenticated, isAuthenticating]);

  // Handle authentication success
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !hasIntegratedRef.current) {
      setAuthStep('success');
      if (onAuthSuccess) {
        onAuthSuccess(auth.user);
      }
      toast({
        title: "Welcome to Flappy Pi!",
        description: `Hello ${auth.user.username}! You're now authenticated.`,
      });
      hasIntegratedRef.current = true;
      // Use a ref to prevent infinite loops
      const timeoutId = setTimeout(() => {
        loginWithPi(auth.user); // Call loginWithPi from AuthContext
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [auth.isAuthenticated, auth.user, onAuthSuccess, toast]);

  // Handle authentication error
  useEffect(() => {
    if (auth.error) {
      setAuthStep('error');
      if (onAuthError) {
        onAuthError(auth.error);
      }
      toast({
        title: "Authentication Failed",
        description: auth.error,
        variant: "destructive"
      });
    }
  }, [auth.error, onAuthError, toast]);

  // Reset integration ref when user logs out
  useEffect(() => {
    if (!auth.isAuthenticated) {
      hasIntegratedRef.current = false;
    }
  }, [auth.isAuthenticated]);

  const handleAutoAuth = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    setAuthStep('detecting');
    
    try {
      console.log('🔄 Auto-authenticating in Pi Browser...');
      
      const result = await auth.authenticate({
        scopes: ['username', 'payments', 'wallet_address'],
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
        enablePayments: true,
        enableAds: false
      });

      if (result.success) {
        setAuthStep('success');
        console.log('✅ Auto-authentication successful');
      } else {
        setAuthStep('error');
        console.error('❌ Auto-authentication failed:', result.error);
      }
    } catch (error) {
      setAuthStep('error');
      console.error('❌ Auto-authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleManualAuth = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    setAuthStep('authenticating');
    
    try {
      console.log('🔐 Starting manual authentication...');
      
      const result = await auth.authenticate({
        scopes: ['username', 'payments', 'wallet_address'],
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 45000, // Longer timeout for mobile
        enablePayments: true,
        enableAds: false
      });

      if (result.success) {
        setAuthStep('success');
        console.log('✅ Manual authentication successful');
      } else {
        setAuthStep('error');
        console.error('❌ Manual authentication failed:', result.error);
      }
    } catch (error) {
      setAuthStep('error');
      console.error('❌ Manual authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setAuthStep('idle');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleRetry = () => {
    setAuthStep('idle');
    auth.clearError();
    handleManualAuth();
  };

  // Show mobile-specific prompt
  const showMobileAuthPrompt = () => {
    setShowMobilePrompt(true);
    setAuthStep('prompting');
  };

  // Render based on authentication state
  if (auth.isAuthenticated && auth.user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authenticated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Username:</span>
              <Badge variant="secondary">{auth.user.username}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">User ID:</span>
              <span className="text-sm text-gray-500">{auth.user.uid.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Environment:</span>
              <Badge variant={auth.authStatus.isPiBrowser ? "default" : "secondary"}>
                {auth.authStatus.isPiBrowser ? "Pi Browser" : "External Browser"}
              </Badge>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (authStep === 'error') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Authentication Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {auth.error || 'Failed to authenticate with Pi Network. Please try again.'}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                <Loader2 className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => setAuthStep('idle')} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isAuthenticating || authStep === 'detecting' || authStep === 'authenticating') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {authStep === 'detecting' ? 'Detecting Pi Browser...' : 'Authenticating...'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">
                {authStep === 'detecting' 
                  ? 'Checking if you\'re using Pi Browser...'
                  : 'Please complete the authentication in Pi Browser...'
                }
              </p>
            </div>
            {showStatus && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Pi Browser:</span>
                  <Badge variant={auth.authStatus.isPiBrowser ? "default" : "secondary"}>
                    {auth.authStatus.isPiBrowser ? "Detected" : "Not Detected"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>SDK Available:</span>
                  <Badge variant={auth.authStatus.isSDKAvailable ? "default" : "secondary"}>
                    {auth.authStatus.isSDKAvailable ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show mobile prompt
  if (showMobilePrompt && authStep === 'prompting') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Pi Browser Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Globe className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold">Welcome to Flappy Pi!</h3>
              <p className="text-sm text-gray-600">
                To play Flappy Pi and earn rewards, you need to authenticate with your Pi account.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Secure Authentication</p>
                  <p className="text-xs text-gray-600">Your data is protected by Pi Network</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Wallet className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Earn Pi Rewards</p>
                  <p className="text-xs text-gray-600">Play games and earn Pi cryptocurrency</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleManualAuth} className="flex-1">
                <User className="h-4 w-4 mr-2" />
                Sign In with Pi
              </Button>
              <Button onClick={() => setShowMobilePrompt(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default state - show authentication options
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Pi Browser Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {showStatus && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Pi Browser:</span>
                <Badge variant={auth.authStatus.isPiBrowser ? "default" : "secondary"}>
                  {auth.authStatus.isPiBrowser ? "Detected" : "Not Detected"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>SDK Available:</span>
                <Badge variant={auth.authStatus.isSDKAvailable ? "default" : "secondary"}>
                  {auth.authStatus.isSDKAvailable ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          )}

          {auth.authStatus.isPiBrowser ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                You're using Pi Browser! Tap below to authenticate with your Pi account.
              </p>
              <Button onClick={handleManualAuth} className="w-full">
                <User className="h-4 w-4 mr-2" />
                Sign In with Pi
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert>
                <AlertDescription>
                  For the best experience, please use Pi Browser mobile app to play Flappy Pi and earn rewards.
                </AlertDescription>
              </Alert>
              <Button onClick={showMobileAuthPrompt} className="w-full">
                <Smartphone className="h-4 w-4 mr-2" />
                Continue Anyway
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PiMobileAuth; 