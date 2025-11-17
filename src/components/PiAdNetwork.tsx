import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdsSystem } from '../hooks/useAdsSystem';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Play, Coins, Heart, RotateCcw, Gift, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface PiAdNetworkProps {
  className?: string;
  onRewardEarned?: (rewardType: string, amount: number) => void;
  onAdCompleted?: () => void;
  onAdFailed?: (error: string) => void;
}

const PiAdNetwork: React.FC<PiAdNetworkProps> = ({
  className = '',
  onRewardEarned,
  onAdCompleted,
  onAdFailed
}) => {
  const { isAuthenticated, isPiAuth, piUser } = useAuth();
  const { toast } = useToast();
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    isAdNetworkSupported,
    isWatchingAd,
    adError,
    showRewardedAdForRevive,
    showRewardedAdForCoins,
    showRewardedAdForExtraLife,
    showRewardedAdForRouletteSpin,
    showInterstitialAd,
    initializeAdsSystem
  } = useAdsSystem();

  // Initialize ads system on mount
  useEffect(() => {
    if (isAuthenticated && isPiAuth) {
      initializeAdsSystem();
    }
  }, [isAuthenticated, isPiAuth, initializeAdsSystem]);

  // Handle reward selection
  const handleRewardSelection = (rewardType: string) => {
    setSelectedReward(rewardType);
  };

  // Handle watching ad for specific reward
  const handleWatchAd = async (rewardType: string) => {
    if (!isAuthenticated || !isPiAuth) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Pi Network to watch ads.",
        variant: "destructive"
      });
      return;
    }

    if (!isAdNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update your Pi Browser to watch ads.",
        variant: "destructive"
      });
      return;
    }

    if (isWatchingAd) {
      toast({
        title: "Ad Already Playing",
        description: "Please wait for the current ad to finish.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSelectedReward(rewardType);

    try {
      let result;
      const gameMode = 'classic'; // Default game mode

      switch (rewardType) {
        case 'revive':
          result = await showRewardedAdForRevive(gameMode);
          break;
        case 'coins':
          result = await showRewardedAdForCoins(gameMode);
          break;
        case 'extra_life':
          result = await showRewardedAdForExtraLife(gameMode);
          break;
        case 'roulette_spin':
          result = await showRewardedAdForRouletteSpin(gameMode);
          break;
        default:
          throw new Error('Invalid reward type');
      }

      if (result.success) {
        onRewardEarned?.(rewardType, result.reward_amount);
        onAdCompleted?.();
        
        toast({
          title: "🎉 Reward Earned!",
          description: result.description,
        });
      } else {
        onAdFailed?.(result.description);
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      onAdFailed?.('Failed to show ad');
      toast({
        title: "Ad Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSelectedReward(null);
    }
  };

  // Handle interstitial ad
  const handleInterstitialAd = async () => {
    if (!isAuthenticated || !isPiAuth) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Pi Network to watch ads.",
        variant: "destructive"
      });
      return;
    }

    if (!isAdNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update your Pi Browser to watch ads.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await showInterstitialAd();
      
      if (result) {
        toast({
          title: "✅ Ad Completed",
          description: "Thank you for watching the ad!",
        });
      } else {
        toast({
          title: "Ad Failed",
          description: "Failed to show ad. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      toast({
        title: "Ad Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reward options
  const rewardOptions = [
    {
      id: 'revive',
      title: 'Revive',
      description: 'Get a second chance to continue your game',
      icon: <RotateCcw className="w-5 h-5" />,
      color: 'bg-red-500',
      reward: '1 Revive'
    },
    {
      id: 'coins',
      title: 'Coins',
      description: 'Earn Flappy Coins to spend in the shop',
      icon: <Coins className="w-5 h-5" />,
      color: 'bg-yellow-500',
      reward: '25-35 Coins'
    },
    {
      id: 'extra_life',
      title: 'Extra Life',
      description: 'Get an extra life for your next game',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-pink-500',
      reward: '1 Extra Life'
    },
    {
      id: 'roulette_spin',
      title: 'Roulette Spin',
      description: 'Spin the roulette for a chance to win big',
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-purple-500',
      reward: '1 Spin'
    }
  ];

  // Show authentication required message
  if (!isAuthenticated || !isPiAuth) {
    return (
      <Card className={`w-full max-w-2xl mx-auto ${className}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pi Authentication Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please sign in with your Pi Network account to watch ads and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Pi Network authentication is required to access the ad network and earn rewards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Play className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Pi Ad Network
        </CardTitle>
        <CardDescription className="text-gray-600">
          Watch ads to earn rewards and support Flappy Pi
        </CardDescription>
        
        {/* User Info */}
        {piUser && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Signed in as:</strong> @{piUser.username}
            </p>
          </div>
        )}

        {/* Ad Network Status */}
        <div className="mt-4 flex justify-center">
          {isAdNetworkSupported ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-4 h-4 mr-1" />
              Ad Network Available
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              <XCircle className="w-4 h-4 mr-1" />
              Ad Network Not Available
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Display */}
        {adError && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Ad Network Error</p>
                <p className="text-sm text-red-700">{adError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reward Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewardOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedReward === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${option.color} text-white`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {option.reward}
                    </span>
                    <Button
                      onClick={() => handleWatchAd(option.id)}
                      disabled={isLoading || isWatchingAd || !isAdNetworkSupported}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading && selectedReward === option.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : isWatchingAd ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Watching...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Watch Ad
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interstitial Ad Option */}
        <div className="border-t pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Support Flappy Pi
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Watch an interstitial ad to support the development of Flappy Pi
            </p>
            <Button
              onClick={handleInterstitialAd}
              disabled={isLoading || isWatchingAd || !isAdNetworkSupported}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isWatchingAd ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Watching...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Watch Support Ad
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pi Browser Notice */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Pi Browser Required</p>
              <p className="text-sm text-yellow-700">
                To watch ads and earn rewards, you need to use Pi Browser. 
                The ad network is only available in Pi Browser for security and verification.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PiAdNetwork;
