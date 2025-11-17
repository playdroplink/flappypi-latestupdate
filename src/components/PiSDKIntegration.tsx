// Pi SDK Integration Component
// Complete integration following official Pi Network documentation: https://github.com/pi-apps/pi-platform-docs.git

import React, { useState, useEffect } from 'react';
import { piSDKService } from '../services/piSDKService';

interface PiSDKIntegrationProps {
  onAuthSuccess?: (user: any) => void;
  onAuthError?: (error: any) => void;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

export const PiSDKIntegration: React.FC<PiSDKIntegrationProps> = ({
  onAuthSuccess,
  onAuthError,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePiSDK();
  }, []);

  const initializePiSDK = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Initializing Pi SDK integration...');
      
      const initialized = await piSDKService.initialize();
      
      if (initialized) {
        setIsInitialized(true);
        setIsPiBrowser(piSDKService.isPiBrowser());
        console.log('✅ Pi SDK integration initialized successfully');
      } else {
        throw new Error('Failed to initialize Pi SDK');
      }
    } catch (err: any) {
      console.error('❌ Pi SDK initialization failed:', err);
      setError(err.message || 'Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthentication = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Starting Pi Network authentication...');
      
      const authenticated = await piSDKService.authenticate(['payments', 'username']);
      
      if (authenticated) {
        setIsAuthenticated(true);
        setUser(piSDKService.getCurrentUser());
        console.log('✅ Authentication successful:', user);
        onAuthSuccess?.(user);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err: any) {
      console.error('❌ Authentication failed:', err);
      setError(err.message || 'Authentication failed');
      onAuthError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShopPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        throw new Error('User must be authenticated to make payments');
      }

      console.log('🛒 Creating shop payment...');
      
      const shopItem = {
        id: 'flappy_coin_pack_100',
        name: 'Flappy Coin Pack (100 coins)',
        price: 1.0, // 1 Pi
        description: 'Get 100 Flappy Coins to enhance your gameplay'
      };

      const result = await piSDKService.createShopPayment(shopItem, 1);
      
      if (result.success) {
        console.log('✅ Shop payment created successfully');
        onPaymentSuccess?.(result);
      } else {
        throw new Error(result.error || 'Payment creation failed');
      }
    } catch (err: any) {
      console.error('❌ Shop payment failed:', err);
      setError(err.message || 'Payment failed');
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated) {
        throw new Error('User must be authenticated to make payments');
      }

      console.log('📅 Creating subscription payment...');
      
      const subscription = {
        id: 'premium_monthly',
        name: 'Premium Monthly Subscription',
        price: 5.0, // 5 Pi
        duration: '1 month'
      };

      const result = await piSDKService.createSubscriptionPayment(subscription);
      
      if (result.success) {
        console.log('✅ Subscription payment created successfully');
        onPaymentSuccess?.(result);
      } else {
        throw new Error(result.error || 'Subscription payment failed');
      }
    } catch (err: any) {
      console.error('❌ Subscription payment failed:', err);
      setError(err.message || 'Subscription payment failed');
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAd = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📱 Showing Pi Network ad...');
      
      const result = await piSDKService.showRewardedAd();
      
      if (result.success) {
        console.log('✅ Ad shown successfully');
      } else {
        console.warn('⚠️ Ad not available:', result.error);
      }
    } catch (err: any) {
      console.error('❌ Ad failed:', err);
      setError(err.message || 'Ad failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await piSDKService.logout();
      setIsAuthenticated(false);
      setUser(null);
      console.log('✅ User logged out successfully');
    } catch (err: any) {
      console.error('❌ Logout failed:', err);
      setError(err.message || 'Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Pi SDK...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Pi Network SDK Integration
      </h2>

      {/* Status Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">SDK Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Initialized: {isInitialized ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${isPiBrowser ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span>Pi Browser: {isPiBrowser ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2 bg-blue-500"></span>
            <span>Network: Mainnet</span>
          </div>
        </div>
        
        {user && (
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>User:</strong> {user.username} ({user.uid})
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        {!isAuthenticated ? (
          <button
            onClick={handleAuthentication}
            disabled={!isInitialized || loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Authenticate with Pi Network'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleShopPayment}
                disabled={loading}
                className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Buy Shop Item (1 Pi)'}
              </button>
              
              <button
                onClick={handleSubscriptionPayment}
                disabled={loading}
                className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Subscribe (5 Pi)'}
              </button>
            </div>
            
            <button
              onClick={handleShowAd}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Show Rewarded Ad'}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Documentation Link */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Documentation:</strong> Based on official Pi Network documentation from{' '}
          <a 
            href="https://github.com/pi-apps/pi-platform-docs.git" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-blue-600"
          >
            pi-platform-docs
          </a>
        </p>
      </div>
    </div>
  );
};

export default PiSDKIntegration;
