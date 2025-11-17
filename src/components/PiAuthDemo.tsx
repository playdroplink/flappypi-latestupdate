import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, User, Wallet } from 'lucide-react';
import { PI_CONFIG } from '@/config/piConfig';

// Following official Pi demo patterns
interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

interface PiAuthDemoProps {
  onAuthSuccess?: (user: PiUser) => void;
  onAuthError?: (error: string) => void;
}

const PiAuthDemo: React.FC<PiAuthDemoProps> = ({ onAuthSuccess, onAuthError }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Check if Pi SDK is available
  useEffect(() => {
    const checkPiSDK = () => {
      if (typeof window !== 'undefined' && window.Pi) {
        setSdkReady(true);
        console.log('✅ Pi SDK is available');
      } else {
        console.warn('⚠️ Pi SDK not available');
        setSdkReady(false);
      }
    };

    checkPiSDK();
  }, []);

  // Authenticate with Pi Network (following official demo pattern)
  const authenticateWithPi = async () => {
    if (!window.Pi) {
      const errorMsg = 'Pi SDK not available. Please use Pi Browser.';
      setError(errorMsg);
      onAuthError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Starting Pi authentication...');
      
      // Following official demo pattern for authentication with username scope
      const authResult = await window.Pi.authenticate(PI_CONFIG.AUTH_SCOPES, (incompletePayment) => {
        console.log('💰 Incomplete payment found:', incompletePayment);
        // Handle incomplete payments as per official demo
        return window.Pi.createPayment({
          amount: incompletePayment.amount,
          memo: incompletePayment.memo,
          metadata: incompletePayment.metadata
        }, {
          onReadyForServerApproval: async (paymentId) => {
            console.log('🔄 Incomplete payment approval:', paymentId);
            try {
              const response = await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  paymentId,
                  amount: incompletePayment.amount,
                  memo: incompletePayment.memo,
                  metadata: incompletePayment.metadata
                })
              });
              const result = await response.json();
              return result.approved;
            } catch (error) {
              console.error('❌ Incomplete payment approval failed:', error);
              return false;
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log('✅ Incomplete payment completion:', paymentId, txid);
            try {
              const response = await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid })
              });
              const result = await response.json();
              return result.completed;
            } catch (error) {
              console.error('❌ Incomplete payment completion failed:', error);
              return false;
            }
          },
          onCancel: (paymentId) => {
            console.log('❌ Incomplete payment cancelled:', paymentId);
            return false;
          },
          onError: (error, payment) => {
            console.error('❌ Incomplete payment error:', error, payment);
            return false;
          }
        });
      });

      if (authResult && authResult.user) {
        console.log('🔐 Verifying authentication with backend...');
        console.log('🔑 Access Token:', authResult.accessToken);
        console.log('👤 User:', authResult.user);
        
        // Verify authentication with backend
        try {
          const response = await fetch('/api/pi/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authResult })
          });
          
          const result = await response.json();
          
          if (result.success && result.user) {
            const userData: PiUser = {
              uid: result.user.uid,
              username: result.user.username,
              accessToken: result.user.accessToken
            };

            setUser(userData);
            setIsAuthenticated(true);
            console.log('✅ Pi authentication successful:', userData);
            onAuthSuccess?.(userData);
          } else {
            throw new Error(result.error || 'Backend verification failed');
          }
        } catch (backendError) {
          console.error('❌ Backend verification failed:', backendError);
          throw new Error('Backend verification failed');
        }
      } else {
        throw new Error('Authentication failed - no user data received');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Authentication failed';
      console.error('❌ Pi authentication failed:', err);
      setError(errorMsg);
      onAuthError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('👋 User signed out');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Pi Network Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SDK Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pi SDK Status:</span>
          <Badge variant={sdkReady ? "default" : "destructive"}>
            {sdkReady ? "Ready" : "Not Available"}
          </Badge>
        </div>

        {/* Network Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Network Mode:</span>
          <Badge variant="secondary">Testnet (Sandbox)</Badge>
        </div>

        {/* Authentication Status */}
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Authenticated</span>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium">Welcome, {user.username}!</p>
              <p className="text-xs text-gray-600">UID: {user.uid}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <Button 
              onClick={authenticateWithPi} 
              disabled={!sdkReady || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect with Pi Network
                </>
              )}
            </Button>
            
            {!sdkReady && (
              <p className="text-xs text-gray-500 text-center">
                Please use Pi Browser to access Pi Network features
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PiAuthDemo;
