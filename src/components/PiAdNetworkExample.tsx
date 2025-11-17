import React, { useState } from 'react';
import { usePiAdNetwork } from '../hooks/usePiAdNetwork';

export const PiAdNetworkExample: React.FC = () => {
  const {
    status,
    isLoading,
    error,
    isSupported,
    isInitialized,
    showInterstitialAd,
    showRewardedAd,
    requestAd,
    isAdReady,
    preloadAds,
    clearError,
  } = usePiAdNetwork();

  const [interstitialReady, setInterstitialReady] = useState(false);
  const [rewardedReady, setRewardedReady] = useState(false);
  const [rewardResult, setRewardResult] = useState<string>('');

  const handleCheckInterstitialReady = async () => {
    const ready = await isAdReady('interstitial');
    setInterstitialReady(ready);
  };

  const handleCheckRewardedReady = async () => {
    const ready = await isAdReady('rewarded');
    setRewardedReady(ready);
  };

  const handleRequestInterstitial = async () => {
    const success = await requestAd('interstitial');
    if (success) {
      setInterstitialReady(true);
    }
  };

  const handleRequestRewarded = async () => {
    const success = await requestAd('rewarded');
    if (success) {
      setRewardedReady(true);
    }
  };

  const handleShowInterstitial = async () => {
    const success = await showInterstitialAd();
    if (success) {
      setInterstitialReady(false); // Ad was shown, need to request new one
    }
  };

  const handleShowRewarded = async () => {
    const result = await showRewardedAd();
    setRewardResult(JSON.stringify(result, null, 2));
    if (result.success) {
      setRewardedReady(false); // Ad was shown, need to request new one
    }
  };

  const handlePreloadAds = async () => {
    await preloadAds();
    // Check readiness after preloading
    setTimeout(async () => {
      const interstitialReady = await isAdReady('interstitial');
      const rewardedReady = await isAdReady('rewarded');
      setInterstitialReady(interstitialReady);
      setRewardedReady(rewardedReady);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Pi Ad Network Integration</h2>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Status Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Ad Network Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Supported:</span>
            <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
              {isSupported ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Initialized:</span>
            <span className={isInitialized ? 'text-green-600' : 'text-red-600'}>
              {isInitialized ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Loading:</span>
            <span className={isLoading ? 'text-blue-600' : 'text-gray-600'}>
              {isLoading ? '⏳ Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Sandbox Mode:</span>
            <span className="text-red-600">❌ Disabled (Mainnet)</span>
          </div>
        </div>
      </div>

      {/* Ad Controls */}
      <div className="space-y-6">
        {/* Interstitial Ads */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Interstitial Ads</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className={interstitialReady ? 'text-green-600' : 'text-red-600'}>
                {interstitialReady ? '✅ Ready' : '❌ Not Ready'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCheckInterstitialReady}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded"
              >
                Check Ready
              </button>
              <button
                onClick={handleRequestInterstitial}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white rounded"
              >
                Request Ad
              </button>
              <button
                onClick={handleShowInterstitial}
                disabled={isLoading || !interstitialReady}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded"
              >
                Show Ad
              </button>
            </div>
          </div>
        </div>

        {/* Rewarded Ads */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Rewarded Ads</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className={rewardedReady ? 'text-green-600' : 'text-red-600'}>
                {rewardedReady ? '✅ Ready' : '❌ Not Ready'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCheckRewardedReady}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded"
              >
                Check Ready
              </button>
              <button
                onClick={handleRequestRewarded}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white rounded"
              >
                Request Ad
              </button>
              <button
                onClick={handleShowRewarded}
                disabled={isLoading || !rewardedReady}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded"
              >
                Show Ad
              </button>
            </div>
            {rewardResult && (
              <div className="mt-3 p-3 bg-gray-100 rounded">
                <h4 className="font-medium mb-2">Last Reward Result:</h4>
                <pre className="text-xs overflow-auto max-h-32">
                  {rewardResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Utility Actions */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Utility Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePreloadAds}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded"
            >
              Preload All Ads
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Pi Browser Required:</strong> Ads work best in Pi Browser mobile app</p>
          <p>• <strong>Check Ready:</strong> Verify if an ad is ready to show</p>
          <p>• <strong>Request Ad:</strong> Load a new ad into memory</p>
          <p>• <strong>Show Ad:</strong> Display the ad to the user</p>
          <p>• <strong>Preload:</strong> Load both interstitial and rewarded ads</p>
          <p>• <strong>Mainnet Mode:</strong> Ads are configured for production (no sandbox)</p>
        </div>
      </div>
    </div>
  );
}; 