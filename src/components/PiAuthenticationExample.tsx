import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/useToast';
import { piAuthService, type ServerAuthResult, type UserDTO } from '@/services/piAuthService';
import { 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  LogOut,
  Key
} from 'lucide-react';

/**
 * Pi Network Authentication Example Component
 * Demonstrates complete authentication flow with server-side verification
 */
export const PiAuthenticationExample: React.FC = () => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isServerVerified, setIsServerVerified] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);

  // Initialize authentication service
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const initialized = await piAuthService.init();
        setIsInitialized(initialized);
        
        if (initialized) {
          // Check current authentication status
          const status = piAuthService.getAuthStatus();
          setAuthStatus(status);
          
          if (status.isAuthenticated) {
            setIsAuthenticated(true);
            setCurrentUser(status.currentUser);
            setAccessToken(piAuthService.getCurrentAccessToken());
            
            // Check server verification
            const verified = await piAuthService.isServerVerified();
            setIsServerVerified(verified);
          }
        }
        
        toast({
          title: "Auth Service Initialized",
          description: initialized ? "Authentication service ready" : "Failed to initialize",
          variant: initialized ? "default" : "destructive",
        });
      } catch (error) {
        console.error('Failed to initialize auth service:', error);
        toast({
          title: "Initialization Failed",
          description: "Please ensure you are using Pi Browser",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [toast]);

  // Listen for incomplete payment events
  useEffect(() => {
    const handleIncompletePayment = (event: CustomEvent) => {
      const { payment } = event.detail;
      console.log('💰 Incomplete payment event received:', payment);
      
      toast({
        title: "Incomplete Payment Found",
        description: `Payment of ${payment.amount} Pi needs to be completed`,
        variant: "destructive",
      });
    };

    window.addEventListener('pi-incomplete-payment', handleIncompletePayment as EventListener);
    
    return () => {
      window.removeEventListener('pi-incomplete-payment', handleIncompletePayment as EventListener);
    };
  }, [toast]);

  // Authenticate user (complete flow)
  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      
      // Complete authentication with server verification
      const result: ServerAuthResult = await piAuthService.authenticate([
        'username', 
        'payments', 
        'wallet_address'
      ]);
      
      if (result.success) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setIsServerVerified(result.serverVerified || false);
        
        toast({
          title: "Authentication Successful",
          description: `Welcome, ${result.user?.username}! Server verified: ${result.serverVerified ? 'Yes' : 'No'}`,
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      
      // Update auth status
      setAuthStatus(piAuthService.getAuthStatus());
    } catch (error) {
      console.error('Authentication failed:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Client-only authentication (without server verification)
  const handleClientAuth = async () => {
    try {
      setIsLoading(true);
      
      const result = await piAuthService.authenticateClient([
        'username', 
        'payments', 
        'wallet_address'
      ]);
      
      setIsAuthenticated(true);
      setCurrentUser(result.user);
      setAccessToken(result.accessToken);
      setIsServerVerified(false);
      
      toast({
        title: "Client Authentication Successful",
        description: `Welcome, ${result.user.username}! (Not server verified)`,
      });
      
      setAuthStatus(piAuthService.getAuthStatus());
    } catch (error) {
      console.error('Client authentication failed:', error);
      toast({
        title: "Client Authentication Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify with server
  const handleServerVerification = async () => {
    if (!accessToken) {
      toast({
        title: "No Access Token",
        description: "Please authenticate first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const serverUser: UserDTO = await piAuthService.verifyWithServer(accessToken);
      
      setIsServerVerified(true);
      setCurrentUser({
        uid: serverUser.uid,
        username: serverUser.username
      });
      
      toast({
        title: "Server Verification Successful",
        description: `Verified user: ${serverUser.username}`,
      });
    } catch (error) {
      console.error('Server verification failed:', error);
      setIsServerVerified(false);
      
      toast({
        title: "Server Verification Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh authentication
  const handleRefreshAuth = async () => {
    try {
      setIsLoading(true);
      
      const result = await piAuthService.refreshAuth([
        'username', 
        'payments', 
        'wallet_address'
      ]);
      
      if (result.success) {
        setIsAuthenticated(true);
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        setIsServerVerified(result.serverVerified || false);
        
        toast({
          title: "Authentication Refreshed",
          description: `Welcome back, ${result.user?.username}!`,
        });
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setAccessToken(null);
        setIsServerVerified(false);
        
        toast({
          title: "Refresh Failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
      
      setAuthStatus(piAuthService.getAuthStatus());
    } catch (error) {
      console.error('Refresh authentication failed:', error);
      toast({
        title: "Refresh Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    piAuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAccessToken(null);
    setIsServerVerified(false);
    setAuthStatus(piAuthService.getAuthStatus());
    
    toast({
      title: "Logged Out",
      description: "Successfully logged out",
    });
  };

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing Authentication Service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pi Network Authentication Example
          </CardTitle>
          <CardDescription>
            Complete authentication flow with server-side verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isInitialized ? "default" : "secondary"}>
                {isInitialized ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Service Initialized
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Authenticated
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isServerVerified ? "default" : "secondary"}>
                {isServerVerified ? <Shield className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                Server Verified
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={accessToken ? "default" : "secondary"}>
                {accessToken ? <Key className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                Access Token
              </Badge>
            </div>
          </div>

          {/* Current User */}
          {currentUser && (
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                Logged in as: <strong>{currentUser.username}</strong> (UID: {currentUser.uid})
                {isServerVerified && (
                  <span className="ml-2 text-green-600">
                    ✓ Server Verified
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Access Token (truncated for security) */}
          {accessToken && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Access Token: <code className="text-xs bg-gray-100 px-1 rounded">
                  {accessToken.substring(0, 20)}...{accessToken.substring(accessToken.length - 10)}
                </code>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Authentication Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Actions</CardTitle>
          <CardDescription>Choose your authentication method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleAuthenticate} 
              disabled={!isInitialized || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Complete Authentication (Client + Server)
            </Button>
            
            <Button 
              onClick={handleClientAuth} 
              disabled={!isInitialized || isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <User className="h-4 w-4 mr-2" />}
              Client Authentication Only
            </Button>
          </div>
          
          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handleServerVerification} 
                disabled={!accessToken || isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                Verify with Server
              </Button>
              
              <Button 
                onClick={handleRefreshAuth} 
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh Authentication
              </Button>
              
              <Button 
                onClick={handleLogout} 
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Status Details */}
      {authStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Official Authentication Flow Info */}
      <Card>
        <CardHeader>
          <CardTitle>Official Authentication Flow</CardTitle>
          <CardDescription>How Pi Network authentication works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Step 1: Client Authentication</h4>
            <p className="text-sm text-gray-600">
              Call <code>Pi.authenticate()</code> to get user information and access token from Pi SDK.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Step 2: Server Verification</h4>
            <p className="text-sm text-gray-600">
              Make a GET request to <code>/me</code> Pi API endpoint using the access token to verify the data.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Security Benefits</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Prevents client-side data tampering</li>
              <li>• Ensures user identity is verified by Pi Network</li>
              <li>• Provides server-side source of truth</li>
              <li>• Handles token expiration and validation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiAuthenticationExample;
