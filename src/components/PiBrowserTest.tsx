import React, { useState, useEffect } from 'react';
import { piAuth, PiUser } from '../config/piAuth';

const PiBrowserTest: React.FC = () => {
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [isPiSDKAvailable, setIsPiSDKAvailable] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<PiUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // Check Pi Browser and SDK availability
    const checkEnvironment = () => {
      const piBrowser = piAuth.isInPiBrowser();
      const sdkAvailable = piAuth.isPiSDKAvailable();
      
      setIsPiBrowser(piBrowser);
      setIsPiSDKAvailable(sdkAvailable);
      
      console.log('🔍 Environment Check:', {
        isPiBrowser: piBrowser,
        isPiSDKAvailable: sdkAvailable,
        userAgent: navigator.userAgent,
        hostname: window.location.hostname
      });
    };

    checkEnvironment();
  }, []);

  useEffect(() => {
    // Check authentication status
    const checkAuthStatus = () => {
      const authenticated = piAuth.isUserAuthenticated();
      const user = piAuth.getCurrentUser();
      
      setIsAuthenticated(authenticated);
      setCurrentUser(user);
      
      console.log('🔐 Auth Status Check:', {
        isAuthenticated: authenticated,
        currentUser: user
      });
    };

    checkAuthStatus();
  }, []);

  const handleAuthenticate = async () => {
    if (!isPiSDKAvailable) {
      setError('Pi SDK not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Starting authentication...');
      
      const authResult = await piAuth.authenticate(['payments', 'username']);
      
      console.log('✅ Authentication successful:', authResult);
      
      setIsAuthenticated(true);
      setCurrentUser(authResult.user);
      
      setTestResults(prev => ({
        ...prev,
        authentication: {
          success: true,
          user: authResult.user,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (err) {
      console.error('❌ Authentication failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      
      setTestResults(prev => ({
        ...prev,
        authentication: {
          success: false,
          error: err instanceof Error ? err.message : 'Authentication failed',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPayment = async () => {
    if (!isAuthenticated) {
      setError('Please authenticate first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💰 Testing payment creation...');
      
      const payment = await piAuth.createPayment(
        1, // 1 Pi (testnet)
        'Test payment from Flappy Pi',
        { 
          game: 'Flappy Pi',
          test: true,
          timestamp: new Date().toISOString()
        }
      );
      
      console.log('✅ Payment created successfully:', payment);
      
      setTestResults(prev => ({
        ...prev,
        payment: {
          success: true,
          payment: payment,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (err) {
      console.error('❌ Payment test failed:', err);
      setError(err instanceof Error ? err.message : 'Payment test failed');
      
      setTestResults(prev => ({
        ...prev,
        payment: {
          success: false,
          error: err instanceof Error ? err.message : 'Payment test failed',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunFullTest = async () => {
    setIsLoading(true);
    setError(null);
    
    const results: any = {};
    
    try {
      // Test 1: Environment Check
      results.environment = {
        isPiBrowser: piAuth.isInPiBrowser(),
        isPiSDKAvailable: piAuth.isPiSDKAvailable(),
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        timestamp: new Date().toISOString()
      };
      
      // Test 2: SDK Initialization
      try {
        const initialized = await piAuth.initialize();
        results.initialization = {
          success: initialized,
          timestamp: new Date().toISOString()
        };
      } catch (err) {
        results.initialization = {
          success: false,
          error: err instanceof Error ? err.message : 'Initialization failed',
          timestamp: new Date().toISOString()
        };
      }
      
      // Test 3: Authentication (if SDK is available)
      if (results.initialization.success) {
        try {
          const authResult = await piAuth.authenticate(['payments', 'username']);
          results.authentication = {
            success: true,
            user: authResult.user,
            timestamp: new Date().toISOString()
          };
          
          setIsAuthenticated(true);
          setCurrentUser(authResult.user);
          
        } catch (err) {
          results.authentication = {
            success: false,
            error: err instanceof Error ? err.message : 'Authentication failed',
            timestamp: new Date().toISOString()
          };
        }
      }
      
      setTestResults(results);
      console.log('🧪 Full test completed:', results);
      
    } catch (err) {
      console.error('❌ Full test failed:', err);
      setError(err instanceof Error ? err.message : 'Full test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Pi Browser Test Panel</h2>
      
      {/* Environment Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Environment Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className="mr-2">Pi Browser:</span>
            <span className={`px-2 py-1 rounded text-sm ${isPiBrowser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isPiBrowser ? '✅ Detected' : '❌ Not Detected'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Pi SDK:</span>
            <span className={`px-2 py-1 rounded text-sm ${isPiSDKAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isPiSDKAvailable ? '✅ Available' : '❌ Not Available'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Authentication:</span>
            <span className={`px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">User:</span>
            <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
              {currentUser ? currentUser.username : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 space-y-3">
        <button
          onClick={handleRunFullTest}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Running Tests...' : 'Run Full Test Suite'}
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAuthenticate}
            disabled={isLoading || !isPiSDKAvailable}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Authenticating...' : 'Authenticate'}
          </button>
          
        </div>
        
        <button
          onClick={handleTestPayment}
          disabled={isLoading}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Creating Payment...' : 'Test Payment (1 Pi)'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-64">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Debug Information */}
      <div className="text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <div className="space-y-1">
          <div>User Agent: {navigator.userAgent.substring(0, 100)}...</div>
          <div>Hostname: {window.location.hostname}</div>
          <div>Protocol: {window.location.protocol}</div>
          <div>URL: {window.location.href}</div>
        </div>
      </div>
    </div>
  );
};

export default PiBrowserTest; 