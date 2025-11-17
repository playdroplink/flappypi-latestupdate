
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Zap, Clock, Play, Gift, Coins, Heart, X } from 'lucide-react';
import { isPiAdNetworkAvailable } from '@/utils/piAdNetwork';

interface AdPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: (adType: 'continue' | 'coins' | 'life') => void;
  adType: 'continue' | 'coins' | 'life';
}

const AdPopup: React.FC<AdPopupProps> = ({ isOpen, onClose, onWatchAd, adType }) => {
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setIsWatching(false);
      setCountdown(3);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isWatching && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isWatching && countdown === 0) {
      // Ad completed - close popup immediately and trigger reward
      onClose();
      onWatchAd(adType);
    }
  }, [isWatching, countdown, onWatchAd, adType, onClose]);

  const getAdInfo = () => {
    switch (adType) {
      case 'continue':
        return {
          title: 'Continue Your Flight?',
          subtitle: 'Watch a Pi Ad to get an extra life and soar higher!',
          reward: 'Extra Life',
          icon: '❤️',
          emoji: '🚀'
        };
      case 'coins':
        return {
          title: 'Bonus Pi Treasure!',
          subtitle: 'Watch a Pi Ad to earn 25 bonus Pi coins!',
          reward: '25 Pi Coins',
          icon: '🪙',
          emoji: '💰'
        };
      case 'life':
        return {
          title: 'Power Up!',
          subtitle: 'Watch a Pi Ad to earn an extra life for your adventure!',
          reward: 'Extra Life',
          icon: '❤️',
          emoji: '⚡'
        };
    }
  };

  const adInfo = getAdInfo();
  const piAdAvailable = typeof window !== 'undefined' && isPiAdNetworkAvailable();

  const handleWatchAd = () => {
    setIsWatching(true);
    setCountdown(3);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-0 p-0 bg-transparent shadow-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-purple-600">Pi Ad Network</DialogTitle>
          <DialogDescription>Watch ads to earn rewards and support the game.</DialogDescription>
        </DialogHeader>
        <div className="relative bg-white rounded-2xl p-6 text-gray-800 shadow-2xl border border-gray-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="h-6 w-6 text-purple-500" />
              <span className="text-lg font-bold text-purple-600">Pi Ad Network</span>
            </div>
            <div className="text-xs text-gray-500">
              🌟 Powered by Pi Ecosystem 🌟
            </div>
          </div>

          {!isWatching ? (
            <>
              {/* Main content */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 text-center border border-blue-100">
                <div className="text-4xl mb-3">{adInfo.emoji}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{adInfo.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{adInfo.subtitle}</p>
                
                {/* Reward box */}
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Gift className="h-4 w-4 text-green-500" />
                    <span className="font-bold text-green-600 text-sm">Reward: {adInfo.reward}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                {piAdAvailable && (
                  <Button
                    onClick={handleWatchAd}
                    className="w-full bg-green-500 hover:bg-green-600 text-white border-0 rounded-xl py-3 font-bold text-base"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    🎬 Watch Pi Ad
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl py-2"
                >
                  Skip
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  🎯 Ads help support the game and Pi Network ecosystem
                </p>
              </div>
            </>
          ) : (
            /* Watching state */
            <div className="text-center py-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <Clock className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
                <h3 className="text-lg font-bold mb-4 text-gray-800">Watching Pi Ad...</h3>
                <div className="text-3xl font-bold text-blue-500 mb-3 animate-bounce">{countdown}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 text-sm">Please wait while the ad plays</p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200 mt-4">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className="text-lg">🎯</span>
                  <span className="font-semibold text-yellow-700 text-sm">Sample Pi Network Advertisement</span>
                </div>
                <p className="text-xs text-yellow-600">
                  🚀 Join millions in the Pi Network revolution!
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdPopup;
