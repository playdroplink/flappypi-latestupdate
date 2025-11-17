import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PiSDKTest: React.FC = () => {
  const [piStatus, setPiStatus] = useState<string>('Checking...');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [sdkInfo, setSdkInfo] = useState<any>(null);

  // Check if window.Pi is available
  const checkPiSDK = () => {
    if (typeof window === 'undefined') {
      setPiStatus('❌ Window not available (server-side)');
      return false;
    }

    if (!window.Pi) {
      setPiStatus('❌ window.Pi not available');
      return false;
    }

    setPiStatus('✅ window.Pi is available');
    return true;
  };

  // Get current user
  const getCurrentUser = async () => {
    try {
      if (!checkPiSDK()) return;

      console.log('🔍 Calling window.Pi.currentUser()...');
      const user = await window.Pi.currentUser();
      console.log('👤 Current user:', user);
      setUserInfo(user);
    } catch (error: any) {
      console.error('❌ Failed to get current user:', error);
      setUserInfo({ error: error.message });
    }
  };

  // Authenticate user
  const authenticateUser = async () => {
    try {
      if (!checkPiSDK()) return;

      console.log('🔐 Calling window.Pi.authenticate()...');
      const auth = await window.Pi.authenticate(['payments', 'username'], (incompletePayment) => {
        console.log('💰 Incomplete payment found:', incompletePayment);
      });
      console.log('✅ Authentication result:', auth);
      setUserInfo(auth.user);
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      setUserInfo({ error: error.message });
    }
  };

  // Get SDK information
  const getSDKInfo = () => {
    try {
      if (!checkPiSDK()) return;

      const info = {
        available: !!window.Pi,
        methods: Object.getOwnPropertyNames(window.Pi),
        version: window.Pi.version || 'Unknown',
        sandbox: window.Pi.sandbox || false,
        appId: window.Pi.appId || 'Unknown'
      };

      console.log('📊 SDK Info:', info);
      setSdkInfo(info);
    } catch (error: any) {
      console.error('❌ Failed to get SDK info:', error);
      setSdkInfo({ error: error.message });
    }
  };

  // Create a test payment
  const createTestPayment = async () => {
    try {
      if (!checkPiSDK()) return;

      console.log('💰 Calling window.Pi.createPayment()...');
      window.Pi.createPayment({
        amount: 1,
        memo: 'Test payment from window.Pi call',
        metadata: {
          test: true,
          timestamp: Date.now()
        }
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('✅ Payment ready for approval:', paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('✅ Payment ready for completion:', { paymentId, txid });
        },
        onCancel: (paymentId: string) => {
          console.log('❌ Payment cancelled:', paymentId);
        },
        onError: (error: any, payment: any) => {
          console.error('❌ Payment error:', error);
        }
      });
      console.log('✅ Payment initiation invoked');
    } catch (error: any) {
      console.error('❌ Payment creation failed:', error);
    }
  };

  // Initialize SDK
  const initializeSDK = async () => {
    try {
      if (!checkPiSDK()) return;

      console.log('🚀 Calling window.Pi.init()...');
      await window.Pi.init({
        version: "2.0",
        sandbox: false,
        appId: "flappypi2807"
      });
      console.log('✅ SDK initialized');
      setPiStatus('✅ SDK initialized successfully');
    } catch (error: any) {
      console.error('❌ SDK initialization failed:', error);
      setPiStatus('❌ SDK initialization failed: ' + error.message);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      if (!checkPiSDK()) return;

      console.log('🔍 Checking authentication status...');
      const isAuthenticated = await window.Pi.isAuthenticated();
      console.log('🔐 Is authenticated:', isAuthenticated);
      setPiStatus(`Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
    } catch (error: any) {
      console.error('❌ Failed to check auth status:', error);
      setPiStatus('❌ Auth check failed: ' + error.message);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      if (!checkPiSDK()) return;

      console.log('🚪 Calling window.Pi.signOut()...');
      await window.Pi.signOut();
      console.log('✅ Signed out successfully');
      setUserInfo(null);
      setPiStatus('✅ Signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      setPiStatus('❌ Sign out failed: ' + error.message);
    }
  };

  useEffect(() => {
    checkPiSDK();
    getSDKInfo();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Window.Pi SDK Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">SDK Status:</h3>
            <p className="text-sm">{piStatus}</p>
          </div>

          {/* SDK Info */}
          {sdkInfo && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold mb-2">SDK Information:</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(sdkInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* User Info */}
          {userInfo && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold mb-2">User Information:</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={checkPiSDK} variant="outline" size="sm">
              Check SDK
            </Button>
            <Button onClick={getSDKInfo} variant="outline" size="sm">
              Get SDK Info
            </Button>
            <Button onClick={initializeSDK} variant="outline" size="sm">
              Initialize SDK
            </Button>
            <Button onClick={getCurrentUser} variant="outline" size="sm">
              Get Current User
            </Button>
            <Button onClick={authenticateUser} variant="outline" size="sm">
              Authenticate
            </Button>
            <Button onClick={checkAuthStatus} variant="outline" size="sm">
              Check Auth
            </Button>
            <Button onClick={createTestPayment} variant="outline" size="sm">
              Test Payment
            </Button>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>

          {/* Console Output */}
          <div className="p-4 bg-gray-900 text-green-400 rounded-lg">
            <h3 className="font-bold mb-2 text-white">Console Output:</h3>
            <p className="text-xs">
              Check the browser console for detailed logs of all window.Pi calls.
              All function calls are logged with 🚀, ✅, or ❌ prefixes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PiSDKTest;