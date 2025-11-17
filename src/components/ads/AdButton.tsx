import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { useAdsSystem } from '@/hooks/useAdsSystem';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import { Loader2, Play, Coins, Heart, AlertCircle } from 'lucide-react';

interface AdButtonProps {
  type: 'revive' | 'coins' | 'interstitial';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: (rewardType: 'revive' | 'coins', amount: number) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const AdButton: React.FC<AdButtonProps> = ({
  type,
  variant = 'default',
  size = 'default',
  className = '',
  onSuccess,
  onError,
  children,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPiBrowserModal, setShowPiBrowserModal] = useState(false);
  
  const { toast } = useToast();
  const {
    isAdNetworkSupported,
    cooldownTime,
    isWatchingAd,
    showRewardedAdForRevive,
    showRewardedAdForCoins,
    showInterstitialAd
  } = useAdsSystem();

  const handleClick = async () => {
    if (!piBrowserRedirect.isInPiBrowser()) {
      piBrowserRedirect.showPiBrowserMessage();
      return;
    }

    setIsLoading(true);
    try {
      let result;
      const gameMode = 'classic'; // You can make this configurable via props
      
      switch (type) {
        case 'revive':
          result = await showRewardedAdForRevive(gameMode);
          if (result.success) {
            onSuccess?.('revive', result.reward_amount);
            toast({
              title: "🎉 Revive Earned!",
              description: `You've been revived in ${gameMode} mode! Keep flying high!`,
            });
          } else {
            onError?.(result.description);
            toast({
              title: "Ad Failed",
              description: result.description,
              variant: "destructive",
            });
          }
          break;
          
        case 'coins':
          result = await showRewardedAdForCoins(gameMode);
          if (result.success) {
            onSuccess?.('coins', result.reward_amount);
            toast({
              title: "🎉 Coins Earned!",
              description: `You've earned ${result.reward_amount} coins in ${gameMode} mode! Keep flying to convert them to Pi!`,
            });
          } else {
            onError?.(result.description);
            toast({
              title: "Ad Failed",
              description: result.description,
              variant: "destructive",
            });
          }
          break;
          
        case 'interstitial':
          const interstitialResult = await showInterstitialAd();
          if (interstitialResult) {
            toast({
              title: "Ad Completed",
              description: "Thank you for watching the ad!",
            });
          } else {
            onError?.('Failed to show ad');
            toast({
              title: "Ad Failed",
              description: "Failed to load ad. Please try again.",
              variant: "destructive",
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      onError?.('Failed to show ad');
      toast({
        title: "Ad Error",
        description: "Failed to load ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    if (isLoading || isWatchingAd) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    switch (type) {
      case 'revive':
        return <Heart className="h-4 w-4" />;
      case 'coins':
        return <Coins className="h-4 w-4" />;
      case 'interstitial':
        return <Play className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getDefaultText = () => {
    if (isLoading || isWatchingAd) return "Loading...";
    
    switch (type) {
      case 'revive':
        return "Watch Ad for Revive";
      case 'coins':
        return "Watch Ad for Coins";
      case 'interstitial':
        return "Watch Ad";
      default:
        return "Watch Ad";
    }
  };

  const isButtonDisabled = disabled || isLoading || isWatchingAd || cooldownTime > 0 || !isAdNetworkSupported;

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isButtonDisabled}
        variant={variant}
        size={size}
        className={className}
      >
        {getIcon()}
        {children || getDefaultText()}
      </Button>

      {/* Pi Browser Modal */}
      {showPiBrowserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Pi Browser Required</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ads are only available in the Pi Browser app. Please open this game in Pi Browser to watch ads.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPiBrowserModal(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowPiBrowserModal(false);
                  piBrowserRedirect.redirectToPiBrowser();
                }}
                size="sm"
                className="flex-1"
              >
                Open in Pi Browser
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Convenience components for common use cases
export const ReviveAdButton: React.FC<Omit<AdButtonProps, 'type'>> = (props) => (
  <AdButton type="revive" {...props} />
);

export const CoinsAdButton: React.FC<Omit<AdButtonProps, 'type'>> = (props) => (
  <AdButton type="coins" {...props} />
);

export const InterstitialAdButton: React.FC<Omit<AdButtonProps, 'type'>> = (props) => (
  <AdButton type="interstitial" {...props} />
);
