import React from 'react';
import PiAuthExample from '../components/PiAuthExample';
import PiAuthLogin from '../components/PiAuthLogin';

const PiAuthTest: React.FC = () => {
  // Debug information
  const debugInfo = {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) : 'unknown',
    hasPiSDK: typeof window !== 'undefined' && !!window.Pi,
    isPiNetworkSubdomain: typeof window !== 'undefined' && 
      (window.location.hostname.includes('.pinet.com') || 
       window.location.hostname.includes('.minepi.com')),
    localStorage: typeof window !== 'undefined' ? {
      piUser: localStorage.getItem('flappypi-pi-user'),
      piAuth: localStorage.getItem('flappypi-pi-auth'),
      username: localStorage.getItem('flappypi-username')
    } : null
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          Pi Network Authentication Test
        </h1>
        
        {/* Debug Information */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🔍 Debug Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Hostname:</strong> {debugInfo.hostname}
            </div>
            <div>
              <strong>User Agent:</strong> {debugInfo.userAgent}
            </div>
            <div>
              <strong>Pi SDK Available:</strong> {debugInfo.hasPiSDK ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Pi Network Subdomain:</strong> {debugInfo.isPiNetworkSubdomain ? '✅ Yes' : '❌ No'}
            </div>
            <div className="md:col-span-2">
              <strong>LocalStorage:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {JSON.stringify(debugInfo.localStorage, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Environment Status */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🌐 Environment Status</h2>
          <div className="space-y-2">
            {debugInfo.isPiNetworkSubdomain && (
              <div className="flex items-center gap-2 text-green-600">
                <span>✅</span>
                <span>Pi Network Subdomain detected: {debugInfo.hostname}</span>
              </div>
            )}
            {debugInfo.hasPiSDK && (
              <div className="flex items-center gap-2 text-green-600">
                <span>✅</span>
                <span>Pi SDK is available</span>
              </div>
            )}
            {!debugInfo.hasPiSDK && (
              <div className="flex items-center gap-2 text-red-600">
                <span>❌</span>
                <span>Pi SDK is not available</span>
              </div>
            )}
            {debugInfo.userAgent.includes('PiBrowser') && (
              <div className="flex items-center gap-2 text-green-600">
                <span>✅</span>
                <span>Pi Browser detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">🔐 PiAuthLogin Component</h2>
            <PiAuthLogin />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">🧪 PiAuthExample Component</h2>
            <PiAuthExample />
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h2 className="text-lg font-semibold mb-3 text-yellow-800">🔧 Troubleshooting</h2>
          <div className="space-y-2 text-sm text-yellow-700">
            <p><strong>If Pi authentication is not working:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Make sure you're using Pi Browser or on a Pi Network subdomain</li>
              <li>Check that the Pi SDK is loaded (should show "✅ Pi SDK is available")</li>
              <li>Verify the app ID matches your Pi Network app configuration</li>
              <li>Check the browser console for any error messages</li>
              <li>Ensure you're using HTTPS on Pi Network subdomains</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiAuthTest;
