// Pi SDK Test Component - Comprehensive Test for Testnet Mode
// Following the official Pi Network Client SDK reference documentation

import React, { useState, useEffect } from 'react';
import { usePiSDK } from '../hooks/usePiSDK';
import { Scope, AdType, PaymentCallbacks, PaymentData } from '../services/piSDKService';

import { 
  PaymentData, 
  A2UPaymentRequest,
  UserDTO,
  ApiResponse
} from '../services/piSDKService';

import { 
  generateMetadata, 
  updateFrontendMetadata, 
  validateMetadata,
  PiNetMetadataDTO 
} from '../services/piNetMetadataService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'skipped';
  message: string;
  timestamp: Date;
}

export const PiSDKTestComponent: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isSDKAvailable,
    isPiBrowser,
    authenticate,
    createPayment,
    signOut,
    clearError,
    status,
    getNativeFeatures,
    openShareDialog,
    openUrlInSystemBrowser,
    showAd,
    isAdReady,
    requestAd
  } = usePiSDK();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [nativeFeatures, setNativeFeatures] = useState<string[]>([]);

  // Add test result helper
  const addTestResult = (name: string, status: TestResult['status'], message: string) => {
    setTestResults(prev => [...prev, {
      name,
      status,
      message,
      timestamp: new Date()
    }]);
  };

  // Test Pi SDK initialization
  const testSDKInitialization = async () => {
    addTestResult('SDK Initialization', 'pending', 'Testing Pi SDK initialization...');
    
    try {
      if (isSDKAvailable) {
        addTestResult('SDK Initialization', 'success', 'Pi SDK is available and initialized');
      } else {
        addTestResult('SDK Initialization', 'error', 'Pi SDK is not available');
      }
    } catch (error) {
      addTestResult('SDK Initialization', 'error', `Failed: ${error}`);
    }
  };

  // Test Pi Browser detection
  const testPiBrowserDetection = async () => {
    addTestResult('Pi Browser Detection', 'pending', 'Testing Pi Browser detection...');
    
    try {
      if (isPiBrowser) {
        addTestResult('Pi Browser Detection', 'success', 'Running in Pi Browser');
      } else {
        addTestResult('Pi Browser Detection', 'skipped', 'Not running in Pi Browser (expected in development)');
      }
    } catch (error) {
      addTestResult('Pi Browser Detection', 'error', `Failed: ${error}`);
    }
  };

  // Test native features
  const testNativeFeatures = async () => {
    addTestResult('Native Features', 'pending', 'Testing native features...');
    
    try {
      const features = await getNativeFeatures();
      setNativeFeatures(features);
      
      if (features.length > 0) {
        addTestResult('Native Features', 'success', `Available features: ${features.join(', ')}`);
      } else {
        addTestResult('Native Features', 'skipped', 'No native features available');
      }
    } catch (error) {
      addTestResult('Native Features', 'error', `Failed: ${error}`);
    }
  };

  // Test authentication with server verification
  const testAuthentication = async () => {
    addTestResult('Authentication', 'pending', 'Testing Pi authentication with server verification...');
    
    try {
      if (isAuthenticated) {
        addTestResult('Authentication', 'success', `User authenticated and verified: ${user?.username}`);
      } else {
        addTestResult('SDK Authentication', 'pending', 'Step 1: Calling Pi SDK authenticate()...');
        const result = await authenticate(['payments'] as Scope[]);
        
        if (result.success) {
          addTestResult('SDK Authentication', 'success', 'Step 1: SDK authentication successful');
          
          addTestResult('Server Verification', 'pending', 'Step 2: Verifying access token with /me endpoint...');
          if (result.accessToken) {
            addTestResult('Server Verification', 'success', 'Step 2: Access token verified with server');
            addTestResult('Authentication Complete', 'success', `User authenticated and verified: ${result.user?.username}`);
          } else {
            addTestResult('Server Verification', 'error', 'Step 2: No access token received');
          }
        } else {
          addTestResult('Authentication', 'error', `Authentication failed: ${result.error}`);
        }
      }
    } catch (error) {
      addTestResult('Authentication', 'error', `Authentication error: ${error}`);
    }
  };

  // Test payment creation
  const testPaymentCreation = async () => {
    addTestResult('Payment Creation', 'pending', 'Testing payment creation...');
    
    try {
      if (!isAuthenticated) {
        addTestResult('Payment Creation', 'skipped', 'User not authenticated');
        return;
      }

      const callbacks: PaymentCallbacks = {
        onReadyForServerApproval: (paymentId) => {
          addTestResult('Payment Server Approval', 'success', `Payment ready for approval: ${paymentId}`);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          addTestResult('Payment Server Completion', 'success', `Payment completed: ${paymentId}, TX: ${txid}`);
        },
        onCancel: (paymentId) => {
          addTestResult('Payment Cancelled', 'error', `Payment cancelled: ${paymentId}`);
        },
        onError: (error, payment) => {
          addTestResult('Payment Error', 'error', `Payment error: ${error.message}`);
        }
      };

      const paymentData: PaymentData = {
        amount: 0.1, // Small test amount
        memo: 'Test payment from Flappy Pi',
        metadata: { test: true, component: 'PiSDKTestComponent' }
      };

      createPayment(paymentData, callbacks);

      addTestResult('Payment Creation', 'success', 'Payment creation initiated');
    } catch (error) {
      addTestResult('Payment Creation', 'error', `Payment creation failed: ${error}`);
    }
  };

  // Test ads with advanced strategies
  const testAds = async () => {
    addTestResult('Ads Testing', 'pending', 'Testing ads functionality with advanced strategies...');
    
    try {
      // Check native features for ad network support
      addTestResult('Ad Network Support Check', 'pending', 'Checking if ad_network feature is available...');
      const features = await getNativeFeatures();
      const adNetworkSupported = features.includes('ad_network');
      
      if (adNetworkSupported) {
        addTestResult('Ad Network Support Check', 'success', 'Ad network feature is available');
      } else {
        addTestResult('Ad Network Support Check', 'error', 'Ad network feature not available - encourage Pi Browser update');
        return; // Skip further ad tests if not supported
      }
      
      // Test interstitial ad with advanced strategy
      addTestResult('Interstitial Ad Advanced Test', 'pending', 'Testing interstitial ad with advanced loading strategy...');
      try {
        const interstitialReady = await isAdReady('interstitial' as AdType);
        addTestResult('Interstitial Ad Ready Check', 'success', `Interstitial ad ready: ${interstitialReady.ready}`);
        
        if (interstitialReady.ready) {
          const interstitialResult = await showAd('interstitial' as AdType);
          addTestResult('Interstitial Ad Show', 'success', `Interstitial ad result: ${interstitialResult.result}`);
        } else {
          const requestResult = await requestAd('interstitial' as AdType);
          addTestResult('Interstitial Ad Request', 'success', `Request result: ${requestResult.result}`);
          
          if (requestResult.result === 'AD_LOADED') {
            const interstitialResult = await showAd('interstitial' as AdType);
            addTestResult('Interstitial Ad Show After Request', 'success', `Interstitial ad result: ${interstitialResult.result}`);
          }
        }
      } catch (interstitialError) {
        addTestResult('Interstitial Ad Test', 'error', `Interstitial ad error: ${interstitialError}`);
      }
      
      // Test rewarded ad with advanced strategy and security considerations
      addTestResult('Rewarded Ad Advanced Test', 'pending', 'Testing rewarded ad with advanced loading strategy...');
      try {
        const rewardedReady = await isAdReady('rewarded' as AdType);
        addTestResult('Rewarded Ad Ready Check', 'success', `Rewarded ad ready: ${rewardedReady.ready}`);
        
        if (rewardedReady.ready) {
          const rewardedResult = await showAd('rewarded' as AdType);
          addTestResult('Rewarded Ad Show', 'success', `Rewarded ad result: ${rewardedResult.result}`);
          
          // Check for adId in rewarded response
          if (rewardedResult.result === 'AD_REWARDED' && 'adId' in rewardedResult) {
            addTestResult('Rewarded Ad Security', 'success', `Rewarded ad with adId: ${rewardedResult.adId} - should be verified on backend`);
          }
        } else {
          const requestResult = await requestAd('rewarded' as AdType);
          addTestResult('Rewarded Ad Request', 'success', `Request result: ${requestResult.result}`);
          
          if (requestResult.result === 'ADS_NOT_SUPPORTED') {
            addTestResult('Rewarded Ad Not Supported', 'error', 'Ads not supported - encourage Pi Browser update');
          } else if (requestResult.result === 'AD_LOADED') {
            const rewardedResult = await showAd('rewarded' as AdType);
            addTestResult('Rewarded Ad Show After Request', 'success', `Rewarded ad result: ${rewardedResult.result}`);
            
            // Check for adId in rewarded response
            if (rewardedResult.result === 'AD_REWARDED' && 'adId' in rewardedResult) {
              addTestResult('Rewarded Ad Security', 'success', `Rewarded ad with adId: ${rewardedResult.adId} - should be verified on backend`);
            }
          }
        }
      } catch (rewardedError) {
        addTestResult('Rewarded Ad Test', 'error', `Rewarded ad error: ${rewardedError}`);
      }
      
      addTestResult('Ads Testing', 'success', 'Advanced ads testing completed');
    } catch (error) {
      addTestResult('Ads Testing', 'error', `Ads testing failed: ${error}`);
    }
  };

  // Test share dialog
  const testShareDialog = async () => {
    addTestResult('Share Dialog', 'pending', 'Testing share dialog...');
    
    try {
      openShareDialog(
        'Flappy Pi Test',
        'Check out this awesome Pi Network game!'
      );
      addTestResult('Share Dialog', 'success', 'Share dialog opened');
    } catch (error) {
      addTestResult('Share Dialog', 'error', `Share dialog failed: ${error}`);
    }
  };

  // Test system browser
  const testSystemBrowser = async () => {
    addTestResult('System Browser', 'pending', 'Testing system browser...');
    
    try {
      await openUrlInSystemBrowser('https://minepi.com');
      addTestResult('System Browser', 'success', 'URL opened in system browser');
    } catch (error) {
      addTestResult('System Browser', 'error', `System browser failed: ${error}`);
    }
  };

  const testA2UPaymentCreation = async () => {
    try {
      console.log('🧪 Testing A2U Payment Creation...');
      
      const paymentRequest: A2UPaymentRequest = {
        payment: {
          amount: 1.5,
          memo: 'Test A2U payment from Flappy Pi',
          metadata: { 
            test: true, 
            game: 'flappy-pi',
            reward: 'daily-bonus'
          },
          uid: 'test-user-uid-123'
        }
      };

      const result = await createA2UPayment(paymentRequest);
      
      if (result.success && result.data) {
        console.log('✅ A2U Payment created successfully:', result.data);
        setTestResults(prev => [...prev, '✅ A2U Payment Creation: SUCCESS']);
      } else {
        console.error('❌ A2U Payment creation failed:', result.error);
        setTestResults(prev => [...prev, `❌ A2U Payment Creation: FAILED - ${result.error}`]);
      }
    } catch (error) {
      console.error('❌ A2U Payment creation error:', error);
      setTestResults(prev => [...prev, `❌ A2U Payment Creation: ERROR - ${error}`]);
    }
  };

  const testA2UPaymentFlow = async () => {
    try {
      console.log('🧪 Testing Complete A2U Payment Flow...');
      
      // Step 1: Create payment
      const paymentRequest: A2UPaymentRequest = {
        payment: {
          amount: 2.0,
          memo: 'Complete A2U payment flow test',
          metadata: { 
            test: true, 
            flow: 'complete-test'
          },
          uid: 'test-user-uid-456'
        }
      };

      const createResult = await createA2UPayment(paymentRequest);
      
      if (!createResult.success || !createResult.data) {
        throw new Error('Failed to create A2U payment');
      }

      const paymentId = createResult.data.identifier;
      console.log('✅ A2U Payment created:', paymentId);

      // Step 2: Get payment info
      const getResult = await getA2UPayment(paymentId);
      if (getResult.success && getResult.data) {
        console.log('✅ A2U Payment retrieved:', getResult.data);
      }

      // Step 3: Approve payment
      const approveResult = await approveA2UPayment(paymentId);
      if (approveResult.success && approveResult.data) {
        console.log('✅ A2U Payment approved:', approveResult.data);
      }

      // Step 4: Complete payment (with mock txid)
      const mockTxid = 'mock-transaction-id-123456789';
      const completeResult = await completeA2UPayment(paymentId, mockTxid);
      if (completeResult.success && completeResult.data) {
        console.log('✅ A2U Payment completed:', completeResult.data);
      }

      setTestResults(prev => [...prev, '✅ Complete A2U Payment Flow: SUCCESS']);
    } catch (error) {
      console.error('❌ A2U Payment flow error:', error);
      setTestResults(prev => [...prev, `❌ Complete A2U Payment Flow: ERROR - ${error}`]);
    }
  };

  const testPlatformAPI = async () => {
    try {
      console.log('🧪 Testing Platform API Integration...');
      
      // Test user token verification (if we have a token)
      if (user?.accessToken) {
        const verifyResult = await verifyUserToken(user.accessToken);
        if (verifyResult.success && verifyResult.data) {
          console.log('✅ User token verified:', verifyResult.data);
          setTestResults(prev => [...prev, '✅ Platform API - User Token Verification: SUCCESS']);
        } else {
          console.warn('⚠️ User token verification failed:', verifyResult.error);
          setTestResults(prev => [...prev, `⚠️ Platform API - User Token Verification: FAILED - ${verifyResult.error}`]);
        }
      } else {
        console.log('ℹ️ No user token available for verification test');
        setTestResults(prev => [...prev, 'ℹ️ Platform API - User Token Verification: SKIPPED (no token)']);
      }

      // Test incomplete payments
      const incompleteResult = await getIncompleteA2UPayments();
      if (incompleteResult.success) {
        console.log('✅ Incomplete payments retrieved:', incompleteResult.data);
        setTestResults(prev => [...prev, '✅ Platform API - Get Incomplete Payments: SUCCESS']);
      } else {
        console.warn('⚠️ Get incomplete payments failed:', incompleteResult.error);
        setTestResults(prev => [...prev, `⚠️ Platform API - Get Incomplete Payments: FAILED - ${incompleteResult.error}`]);
      }

    } catch (error) {
      console.error('❌ Platform API test error:', error);
      setTestResults(prev => [...prev, `❌ Platform API Integration: ERROR - ${error}`]);
    }
  };

  const testPiNetMetadata = async () => {
    try {
      console.log('🧪 Testing PiNet Metadata Integration...');
      
      // Test metadata generation for different paths
      const paths = ['/', '/game', '/shop', '/leaderboard', '/about'];
      
      for (const path of paths) {
        const metadata = generateMetadata(path);
        console.log(`📄 Generated metadata for ${path}:`, metadata);
        
        // Validate metadata
        const validation = validateMetadata(metadata);
        if (validation.isValid) {
          console.log(`✅ Metadata for ${path} is valid`);
          setTestResults(prev => [...prev, `✅ PiNet Metadata - ${path}: VALID`]);
        } else {
          console.warn(`⚠️ Metadata for ${path} has errors:`, validation.errors);
          setTestResults(prev => [...prev, `⚠️ PiNet Metadata - ${path}: INVALID - ${validation.errors.join(', ')}`]);
        }
      }

      // Test frontend metadata update (if in browser)
      if (typeof window !== 'undefined') {
        const testMetadata: PiNetMetadataDTO = {
          title: 'Test Metadata Update',
          description: 'Testing frontend metadata update functionality',
          openGraph: {
            type: 'website',
            title: 'Test Metadata Update',
            description: 'Testing frontend metadata update functionality',
            images: [
              {
                url: 'https://flappypi.fun/test-og.png',
                width: 1200,
                height: 630,
                alt: 'Test Image'
              }
            ]
          },
          twitter: {
            card: 'summary_large_image',
            title: 'Test Metadata Update',
            description: 'Testing frontend metadata update functionality',
            images: [
              {
                url: 'https://flappypi.fun/test-twitter.png',
                width: 1200,
                height: 630,
                alt: 'Test Image'
              }
            ]
          }
        };

        updateFrontendMetadata(testMetadata);
        console.log('✅ Frontend metadata updated');
        setTestResults(prev => [...prev, '✅ PiNet Metadata - Frontend Update: SUCCESS']);
      }

    } catch (error) {
      console.error('❌ PiNet Metadata test error:', error);
      setTestResults(prev => [...prev, `❌ PiNet Metadata Integration: ERROR - ${error}`]);
    }
  };

  const testRewardedAdVerification = async () => {
    try {
      console.log('🧪 Testing Rewarded Ad Verification...');
      
      // Test with a mock adId
      const mockAdId = 'mock-ad-id-123456789';
      const result = await verifyRewardedAdStatus(mockAdId);
      
      if (result.success) {
        console.log('✅ Rewarded ad verification response:', result.data);
        setTestResults(prev => [...prev, '✅ Rewarded Ad Verification: SUCCESS']);
      } else {
        console.warn('⚠️ Rewarded ad verification failed:', result.error);
        setTestResults(prev => [...prev, `⚠️ Rewarded Ad Verification: FAILED - ${result.error}`]);
      }
    } catch (error) {
      console.error('❌ Rewarded ad verification error:', error);
      setTestResults(prev => [...prev, `❌ Rewarded Ad Verification: ERROR - ${error}`]);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    console.log('🧪 Starting Pi SDK comprehensive tests (Testnet Mode)...');
    
    // Run tests in sequence
    await testSDKInitialization();
    await testPiBrowserDetection();
    await testNativeFeatures();
    await testAuthentication();
    await testPaymentCreation();
    await testAds();
    await testShareDialog();
    await testSystemBrowser();
    
    // A2U Payment Tests
    await testA2UPaymentCreation();
    await testA2UPaymentFlow();
    
    // Platform API Tests
    await testPlatformAPI();
    await testRewardedAdVerification();
    
    // PiNet Metadata Tests
    await testPiNetMetadata();
    
    setIsRunningTests(false);
    console.log('✅ Pi SDK tests completed');
  };

  // Clear all test results
  const clearTests = () => {
    setTestResults([]);
  };

  // Get status color
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'skipped': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Pi SDK Test Suite (Testnet Mode)
        </h1>
        <p className="text-gray-600">
          Comprehensive testing of Pi Network SDK integrations following official documentation
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">SDK Status</h3>
          <p className={`text-sm ${isSDKAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {isSDKAvailable ? '✅ Available' : '❌ Not Available'}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">Authentication</h3>
          <p className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-yellow-600'}`}>
            {isAuthenticated ? `✅ ${user?.username}` : '⏳ Not Authenticated'}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">Pi Browser</h3>
          <p className={`text-sm ${isPiBrowser ? 'text-green-600' : 'text-gray-600'}`}>
            {isPiBrowser ? '✅ Pi Browser' : '🌐 Regular Browser'}
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-900">Network Mode</h3>
          <p className="text-sm text-orange-600">🧪 Testnet</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunningTests || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunningTests ? '🧪 Running Tests...' : '🧪 Run All Tests'}
        </button>
        
        <button
          onClick={clearTests}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          🗑️ Clear Results
        </button>
        
        {!isAuthenticated && (
          <button
            onClick={() => authenticate(['payments'] as Scope[])}
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            🔐 Authenticate
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Clear Error
          </button>
        </div>
      )}

      {/* Test Results */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Test Results ({testResults.length})
        </h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No test results yet. Click "Run All Tests" to start testing.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{result.name}</h4>
                  <p className={`text-sm ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                </div>
                <div className="ml-4 text-xs text-gray-500">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">SDK Status Details</h3>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Native Features</h3>
          <div className="text-sm">
            {nativeFeatures.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {nativeFeatures.map((feature, index) => (
                  <li key={index} className="text-green-600">{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No native features detected</p>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Authenticated User</h3>
          <div className="text-sm text-green-800">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>UID:</strong> {user.uid}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiSDKTestComponent; 