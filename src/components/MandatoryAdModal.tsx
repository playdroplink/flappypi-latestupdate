import React, { useState, useEffect } from 'react';
import { Clock, Crown, Zap, Shield, Star } from 'lucide-react';
import { showInterstitialAd } from '../utils/piAds';

interface MandatoryAdModalProps {
  isOpen: boolean;
  onWatchAd: () => void;
  onUpgradeToPremium: () => void;
  canUpgrade?: boolean;
}

const MandatoryAdModal: React.FC<MandatoryAdModalProps> = ({
  isOpen,
  onWatchAd,
  onUpgradeToPremium,
  canUpgrade = true
}) => {
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowCountdown(true);
      setCountdown(3);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setShowCountdown(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleWatchAd = async () => {
    setIsLoadingAd(true);
    
    try {
      console.log('🎥 Showing mandatory interstitial ad...');
      await showInterstitialAd();
      console.log('✅ Mandatory ad completed');
      onWatchAd();
    } catch (error) {
      console.error('❌ Mandatory ad failed:', error);
      // Still allow to continue even if ad fails
      onWatchAd();
    } finally {
      setIsLoadingAd(false);
    }
  };

  // Prevent modal from closing - users must choose one of the two options
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={handleBackdropClick}
      >
        {/* Header with Alert Design - NO CLOSE BUTTON */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold">⚡ Mandatory Ad Break ⚡</h2>
            <Zap className="w-6 h-6 animate-pulse" />
          </div>

          <p className="text-red-100 text-sm font-medium">
            You've played 3 games! Choose one option to continue.
          </p>

          {showCountdown && (
            <div className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {countdown}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Premium Upsell - Enhanced */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Skip All Ads for 30 Days!</h3>
                <p className="text-sm text-purple-600 font-medium">Premium gaming subscription</p>
                  </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs text-gray-700 mb-4">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium">No Ads</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Unlimited Revives</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Double Coins</span>
                </div>
              </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg p-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">Only 10π</div>
                <div className="text-sm text-orange-700 font-medium">30 days of premium gaming</div>
                <div className="text-xs text-orange-600 mt-1">🔥 Limited time offer!</div>
              </div>
            </div>
                
                {canUpgrade && (
              <button
                      onClick={onUpgradeToPremium}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                         text-white py-4 px-4 rounded-lg font-bold transition-all duration-200 
                         transform hover:scale-105 active:scale-95 text-lg"
                    >
                <Crown className="w-5 h-5 inline mr-2" />
                🚀 Get Premium Now - 10π
              </button>
                )}
              </div>

          {/* Ad Option */}
          <div className="border-2 border-gray-300 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Watch Pi Network Ad</h3>
                <p className="text-sm text-gray-600">30-second video advertisement</p>
              </div>
                </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-center">
                <div className="text-blue-700 font-medium mb-1">🎯 Support Pi Network Ecosystem</div>
                <div className="text-xs text-blue-600">Help grow the Pi community while you play!</div>
              </div>
              </div>
              
            <button
              onClick={handleWatchAd}
              disabled={isLoadingAd || showCountdown}
              className={`w-full py-4 px-4 rounded-lg font-bold transition-all duration-200 text-lg ${
                isLoadingAd || showCountdown
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105 active:scale-95'
              }`}
            >
              {isLoadingAd ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading Pi Ad...
                </div>
              ) : showCountdown ? (
                `Please wait ${countdown}s...`
              ) : (
                <>
                  <Clock className="w-5 h-5 inline mr-2" />
                  🎬 Watch Pi Ad & Continue
                </>
              )}
            </button>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-red-700 font-bold text-sm mb-1">
              ⚠️ You must choose one option to continue playing
              </div>
            <div className="text-red-600 text-xs">
              Free users see this every 3 games • Premium users never see ads
            </div>
          </div>

          {/* Marketing Message */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2 font-medium">
              💡 Join thousands of players who upgraded to Premium!
            </p>
            <p className="text-gray-500 text-xs">
              Support development • Powered by Pi Network • Mrwain Organization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandatoryAdModal;
