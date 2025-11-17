import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface PiAuthDebugProps {
  className?: string;
}

const PiAuthDebug: React.FC<PiAuthDebugProps> = ({ className = '' }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    runEnvironmentCheck();
  }, []);

  const runEnvironmentCheck = () => {
    const info = {
      // Environment detection
      userAgent: navigator.userAgent,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isPiBrowser: /PiBrowser|Pi\//i.test(navigator.userAgent),
      isPiNetworkSubdomain: window.location.hostname.includes('.pinet.com') || 
                           window.location.hostname.includes('.minepi.com'),
      
      // Pi SDK status
      piSDKAvailable: typeof window.Pi !== 'undefined',
      piSDKVersion: window.Pi?.version || 'Not available',
      piSDKInit: typeof window.Pi?.init === 'function',
      piSDKAuth: typeof window.Pi?.authenticate === 'function',
      
      // Local storage
      storedPiUser: localStorage.getItem('flappypi-pi-user'),
      storedPiAuth: localStorage.getItem('flappypi-pi-auth'),
      storedUsername: localStorage.getItem('flappypi-username'),
      
      // Timestamp
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
  };

  const testPiSDK = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test 1: SDK Availability
      results.sdkAvailable = typeof window.Pi !== 'undefined';
      
      // Test 2: SDK Initialization
      if (window.Pi && typeof window.Pi.init === 'function') {
        try {
          await window.Pi.init({ version: "2.0", sandbox: false });
          results.sdkInit = true;
        } catch (error) {
          results.sdkInit = false;
          results.sdkInitError = error.message;
        }
      } else {
        results.sdkInit = false;
        results.sdkInitError = 'Pi SDK not available';
      }

      // Test 3: Authentication (if SDK is ready)
      if (results.sdkInit && window.Pi && typeof window.Pi.authenticate === 'function') {
        try {
          // This will trigger the Pi authentication flow
          const authResult = await window.Pi.authenticate(['payments', 'username'], (payment: any) => {
            console.log('Incomplete payment found:', payment);
            return Promise.resolve();
          });
          
          results.authSuccess = true;
          results.authUser = authResult.user;
          results.authToken = authResult.accessToken ? 'Present' : 'Missing';
          
          // Test 4: Token verification
          if (authResult.accessToken) {
            try {
              const meResponse = await fetch('https://api.minepi.com/me', {
                headers: { 'Authorization': `Bearer ${authResult.accessToken}` }
              });
              
              results.tokenVerification = meResponse.ok;
              if (meResponse.ok) {
                const meData = await meResponse.json();
                results.verifiedUser = meData;
              } else {
                results.tokenVerificationError = `${meResponse.status} ${meResponse.statusText}`;
              }
            } catch (error) {
              results.tokenVerification = false;
              results.tokenVerificationError = error.message;
            }
          }
          
        } catch (error) {
          results.authSuccess = false;
          results.authError = error.message;
        }
      } else {
        results.authSuccess = false;
        results.authError = 'Pi SDK not ready for authentication';
      }

    } catch (error) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const clearStorage = () => {
    localStorage.removeItem('flappypi-pi-user');
    localStorage.removeItem('flappypi-pi-auth');
    localStorage.removeItem('flappypi-username');
    runEnvironmentCheck();
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Pi Authentication Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Environment Status */}
          <div>
            <h3 className="font-semibold mb-2">Environment Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.isPiBrowser)}
                <span>Pi Browser: {debugInfo.isPiBrowser ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.isPiNetworkSubdomain)}
                <span>Pi Network Subdomain: {debugInfo.isPiNetworkSubdomain ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.piSDKAvailable)}
                <span>Pi SDK Available: {debugInfo.piSDKAvailable ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.piSDKInit)}
                <span>Pi SDK Init Function: {debugInfo.piSDKInit ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Test Results</h3>
              <div className="space-y-2">
                {testResults.sdkAvailable !== undefined && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.sdkAvailable)}
                    <span>SDK Available: {testResults.sdkAvailable ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {testResults.sdkInit !== undefined && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.sdkInit)}
                    <span>SDK Initialization: {testResults.sdkInit ? 'Success' : 'Failed'}</span>
                    {testResults.sdkInitError && (
                      <Badge variant="destructive" className="text-xs">{testResults.sdkInitError}</Badge>
                    )}
                  </div>
                )}
                {testResults.authSuccess !== undefined && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.authSuccess)}
                    <span>Authentication: {testResults.authSuccess ? 'Success' : 'Failed'}</span>
                    {testResults.authError && (
                      <Badge variant="destructive" className="text-xs">{testResults.authError}</Badge>
                    )}
                  </div>
                )}
                {testResults.tokenVerification !== undefined && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.tokenVerification)}
                    <span>Token Verification: {testResults.tokenVerification ? 'Success' : 'Failed'}</span>
                    {testResults.tokenVerificationError && (
                      <Badge variant="destructive" className="text-xs">{testResults.tokenVerificationError}</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={testPiSDK} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Testing...' : 'Test Pi Authentication'}
            </Button>
            <Button 
              onClick={runEnvironmentCheck} 
              variant="outline"
            >
              Refresh
            </Button>
            <Button 
              onClick={clearStorage} 
              variant="outline"
            >
              Clear Storage
            </Button>
          </div>

          {/* Debug Info */}
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Debug Information</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>

          {/* Recommendations */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Troubleshooting Tips:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Ensure you're using Pi Browser mobile app</li>
                <li>• Check that your app is registered in Pi Developer Portal</li>
                <li>• Verify your app ID matches: <code>flappypi2807</code></li>
                <li>• Make sure you're using testnet mode for development</li>
                <li>• Check browser console for detailed error messages</li>
              </ul>
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
};

export default PiAuthDebug;
