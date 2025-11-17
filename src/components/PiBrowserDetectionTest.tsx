import React, { useState, useEffect } from 'react';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';

interface DetectionResult {
  method: string;
  result: boolean;
  details: string;
}

const PiBrowserDetectionTest: React.FC = () => {
  const { isPiBrowser, isMobile, browserName, detectionMethod, adNetworkSupported } = usePiBrowserDetection();
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [userAgent, setUserAgent] = useState<string>('');
  const [piSDKAvailable, setPiSDKAvailable] = useState<boolean>(false);
  const [piSDKMethods, setPiSDKMethods] = useState<string[]>([]);

  useEffect(() => {
    // Get user agent
    setUserAgent(navigator.userAgent);

    // Check Pi SDK availability
    const checkPiSDK = () => {
      const hasPi = typeof window !== 'undefined' && window.Pi;
      setPiSDKAvailable(!!hasPi);
      
      if (hasPi) {
        const methods: string[] = [];
        if (typeof window.Pi.authenticate === 'function') methods.push('authenticate');
        if (typeof window.Pi.currentUser === 'function') methods.push('currentUser');
        if (typeof window.Pi.nativeFeaturesList === 'function') methods.push('nativeFeaturesList');
        if (typeof window.Pi.createPayment === 'function') methods.push('createPayment');
        if (typeof window.Pi.completePayment === 'function') methods.push('completePayment');
        if (typeof window.Pi.cancelPayment === 'function') methods.push('cancelPayment');
        setPiSDKMethods(methods);
      }
    };

    // Run detection tests
    const runDetectionTests = () => {
      const results: DetectionResult[] = [];

      // Test 1: User Agent Detection
      const ua = navigator.userAgent.toLowerCase();
      const uaTest = ua.includes('pi browser') || ua.includes('pibrowser') || ua.includes('pi-browser');
      results.push({
        method: 'User Agent Detection',
        result: uaTest,
        details: `User agent: ${navigator.userAgent.substring(0, 100)}...`
      });

      // Test 2: Pi SDK Detection
      const sdkTest = typeof window !== 'undefined' && window.Pi;
      results.push({
        method: 'Pi SDK Detection',
        result: !!sdkTest,
        details: sdkTest ? 'Pi SDK object found' : 'Pi SDK object not found'
      });

      // Test 3: Pi SDK Methods
      if (sdkTest) {
        const hasNativeFeatures = typeof window.Pi.nativeFeaturesList === 'function';
        results.push({
          method: 'Pi SDK nativeFeaturesList',
          result: hasNativeFeatures,
          details: hasNativeFeatures ? 'Method available' : 'Method not available'
        });
      }

      // Test 4: Mobile Detection
      const mobileTest = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      results.push({
        method: 'Mobile Device Detection',
        result: mobileTest,
        details: mobileTest ? 'Mobile device detected' : 'Desktop device detected'
      });

      // Test 5: Screen Size Detection
      const screenTest = window.screen && window.screen.width <= 500 && window.screen.height <= 900;
      results.push({
        method: 'Mobile Screen Size',
        result: screenTest,
        details: screenTest ? `Screen: ${window.screen.width}x${window.screen.height}` : `Screen: ${window.screen.width}x${window.screen.height}`
      });

      // Test 6: Local Storage Pi Indicators
      try {
        const hasPiStorage = localStorage.getItem('pi_authentication') || 
                           sessionStorage.getItem('pi_session') ||
                           localStorage.getItem('pi_wallet');
        results.push({
          method: 'Pi Storage Detection',
          result: !!hasPiStorage,
          details: hasPiStorage ? 'Pi storage items found' : 'No Pi storage items found'
        });
      } catch (e) {
        results.push({
          method: 'Pi Storage Detection',
          result: false,
          details: 'Storage access blocked'
        });
      }

      // Test 7: Cookie Detection
      const hasPiCookies = document.cookie.includes('pi_auth') || document.cookie.includes('pi_session');
      results.push({
        method: 'Pi Cookie Detection',
        result: hasPiCookies,
        details: hasPiCookies ? 'Pi cookies found' : 'No Pi cookies found'
      });

      // Test 8: Platform Features
      const hasPlatformFeatures = typeof window.AndroidInterface !== 'undefined' || 
                                typeof window.webkit?.messageHandlers?.piWallet !== 'undefined';
      results.push({
        method: 'Platform Features',
        result: hasPlatformFeatures,
        details: hasPlatformFeatures ? 'Platform features available' : 'No platform features'
      });

      setDetectionResults(results);
    };

    checkPiSDK();
    runDetectionTests();
  }, []);

  const getOverallResult = () => {
    const positiveTests = detectionResults.filter(r => r.result).length;
    const totalTests = detectionResults.length;
    const percentage = totalTests > 0 ? (positiveTests / totalTests) * 100 : 0;
    
    if (percentage >= 70) return { status: 'LIKELY_PI_BROWSER', color: 'text-green-600' };
    if (percentage >= 40) return { status: 'POSSIBLE_PI_BROWSER', color: 'text-yellow-600' };
    return { status: 'NOT_PI_BROWSER', color: 'text-red-600' };
  };

  const overallResult = getOverallResult();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Pi Browser Detection Test</h2>
      
      {/* Overall Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Overall Detection Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Hook Result:</span>
            <span className={`ml-2 ${isPiBrowser ? 'text-green-600' : 'text-red-600'}`}>
              {isPiBrowser ? '✅ Pi Browser' : '❌ Not Pi Browser'}
            </span>
          </div>
          <div>
            <span className="font-medium">Mobile:</span>
            <span className={`ml-2 ${isMobile ? 'text-green-600' : 'text-blue-600'}`}>
              {isMobile ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Browser:</span>
            <span className="ml-2 text-gray-600">{browserName || 'Unknown'}</span>
          </div>
          <div>
            <span className="font-medium">Method:</span>
            <span className="ml-2 text-gray-600">{detectionMethod || 'Unknown'}</span>
          </div>
        </div>
        
        <div className="mt-3">
          <span className="font-medium">Overall Assessment:</span>
          <span className={`ml-2 ${overallResult.color} font-semibold`}>
            {overallResult.status}
          </span>
        </div>
      </div>

      {/* Detailed Test Results */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Detailed Detection Tests</h3>
        <div className="space-y-2">
          {detectionResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="font-medium">{result.method}</div>
                <div className="text-sm text-gray-600">{result.details}</div>
              </div>
              <div className={`ml-4 font-semibold ${result.result ? 'text-green-600' : 'text-red-600'}`}>
                {result.result ? '✅ PASS' : '❌ FAIL'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pi SDK Information */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Pi SDK Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">SDK Available:</span>
            <span className={`ml-2 ${piSDKAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {piSDKAvailable ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Available Methods:</span>
            <span className="ml-2 text-gray-600">
              {piSDKMethods.length > 0 ? piSDKMethods.join(', ') : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* User Agent */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">User Agent</h3>
        <div className="text-sm text-gray-600 break-all">
          {userAgent}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Recommendations</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          {!isPiBrowser && (
            <p>• Open this app in Pi Browser mobile app for full functionality</p>
          )}
          {!isMobile && (
            <p>• Pi Network features work best on mobile devices</p>
          )}
          {!piSDKAvailable && (
            <p>• Pi SDK not detected - ensure you're using Pi Browser</p>
          )}
          {detectionResults.filter(r => r.result).length < 3 && (
            <p>• Multiple detection methods failed - may not be Pi Browser</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PiBrowserDetectionTest; 