import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Play, Clock } from 'lucide-react';
import { isPiAdNetworkAvailable } from '@/utils/piAdNetwork';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';

interface RevivePromptProps {
  isVisible: boolean;
  onWatchAd: () => void;
  onDecline: () => void;
  score: number;
}

const RevivePrompt: React.FC<RevivePromptProps> = ({
  isVisible,
  onWatchAd,
  onDecline,
  score
}) => {
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isVisible) {
      setIsWatchingAd(false);
      setCountdown(5);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isWatchingAd && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isWatchingAd && countdown === 0) {
      // Ad completed
      console.log('🎉 Ad watch completed - calling onWatchAd');
      setIsWatchingAd(false);
      onWatchAd();
    }
  }, [isWatchingAd, countdown, onWatchAd]);

  const handleWatchAd = () => {
    console.log('🎥 Starting ad watch simulation...');
    setIsWatchingAd(true);
    setCountdown(5); // 5 second simulated ad
  };

  const piAdAvailable = typeof window !== 'undefined' && isPiAdNetworkAvailable();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm mx-4 bg-gradient-to-b from-red-900 to-purple-900 text-white border-2 border-yellow-400 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <Heart className="w-16 h-16 text-red-500 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-300">
            {isWatchingAd ? 'Watching Ad...' : 'Second Chance!'}
          </CardTitle>
          <p className="text-sm text-gray-300">
            Score: {score} points
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isWatchingAd ? (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold mb-2 text-white">Watch a Pi Ad to revive?</p>
                <p className="text-sm text-gray-300 mb-4">
                  Continue your flight exactly where you left off!
                </p>
                <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-3 border border-yellow-600">
                  <p className="text-xs text-yellow-200">
                    💡 Ads support the game and help fund weekly Pi rewards for top players!
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {piAdAvailable && piBrowserRedirect.isInPiBrowser() && (
                  <Button
                    onClick={handleWatchAd}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg border-0 transition-colors duration-200"
                    variant="default"
                    type="button"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Pi Ad
                  </Button>
                )}
                {(!piAdAvailable || !piBrowserRedirect.isInPiBrowser()) && (
                  <Button
                    onClick={() => piBrowserRedirect.showPiBrowserMessage()}
                    className="flex-1 bg-gray-400 text-gray-600 font-semibold py-3 px-4 rounded-lg border-0 cursor-not-allowed"
                    variant="default"
                    type="button"
                    disabled
                  >
                    🌐 Pi Browser Required
                  </Button>
                )}
                <Button
                  onClick={onDecline}
                  variant="destructive"
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-gray-300 border-gray-500 border py-3 px-4 rounded-lg transition-colors duration-200"
                  type="button"
                >
                  Game Over
                </Button>
              </div>
              
              {/* Pi Browser Download Link */}
              {!piBrowserRedirect.isInPiBrowser() && (
                <div className="mt-3">
                  <Button
                    onClick={() => piBrowserRedirect.redirectToPiBrowser()}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg"
                  >
                    📱 Download Pi Browser
                  </Button>
                  <div className="mt-2 text-center">
                    <p className="text-orange-400 text-xs font-semibold">
                      💡 Download Pi Browser to watch ads and earn rewards!
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-xl font-bold mb-2 text-white">Pi Network Ad</h3>
              <p className="text-gray-300 mb-4">Please wait while the ad plays...</p>
              
              <div className="flex items-center justify-center space-x-2 text-yellow-300">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-mono">{countdown}s</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-center text-gray-400">
            One revive per game • Supports Pi Network ecosystem
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevivePrompt;
