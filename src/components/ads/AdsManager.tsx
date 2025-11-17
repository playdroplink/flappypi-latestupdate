import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/useToast';
import { useAdsSystem } from '@/hooks/useAdsSystem';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import { Loader2, Play, Coins, Heart, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AdsManagerProps {
  onRewardEarned?: (rewardType: 'revive' | 'coins', amount: number) => void;
  onAdCompleted?: () => void;
  onAdFailed?: (error: string) => void;
  className?: string;
}

export const AdsManager: React.FC<AdsManagerProps> = ({
  onRewardEarned,
  onAdCompleted,
  onAdFailed,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPiBrowserModal, setShowPiBrowserModal] = useState(false);
  
  const { toast } = useToast();
  const {
    isAdNetworkSupported,
    cooldownTime,
    isWatchingAd,
    adError,
    showRewardedAdForRevive,
    showRewardedAdForCoins,
    showInterstitialAd,
    resetCooldown
  } = useAdsSystem();

  const handleWatchAdForRevive = async () => {
    if (!piBrowserRedirect.isInPiBrowser()) {
      setShowPiBrowserModal(true);
      return;
    }

    if (!isAdNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update your Pi Browser to watch ads.",
        variant: "destructive",
      });
      return;
    }

    if (cooldownTime > 0) {
      toast({
        title: "Ad Cooldown",
        description: `Please wait ${cooldownTime} seconds before watching another ad.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use classic mode by default, but you can pass game mode as a prop
      const gameMode = 'classic'; // You can make this configurable
      const result = await showRewardedAdForRevive(gameMode);
      
      if (result.success) {
        onRewardEarned?.('revive', result.reward_amount);
        onAdCompleted?.();
        toast({
          title: "🎉 Revive Earned!",
          description: `You've been revived in ${gameMode} mode! Keep flying high!`,
        });
      } else {
        onAdFailed?.(result.description);
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error watching ad for revive:', error);
      onAdFailed?.('Failed to show ad');
      toast({
        title: "Ad Error",
        description: "Failed to load ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchAdForCoins = async () => {
    if (!piBrowserRedirect.isInPiBrowser()) {
      setShowPiBrowserModal(true);
      return;
    }

    if (!isAdNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update your Pi Browser to watch ads.",
        variant: "destructive",
      });
      return;
    }

    if (cooldownTime > 0) {
      toast({
        title: "Ad Cooldown",
        description: `Please wait ${cooldownTime} seconds before watching another ad.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use classic mode by default, but you can pass game mode as a prop
      const gameMode = 'classic'; // You can make this configurable
      const result = await showRewardedAdForCoins(gameMode);
      
      if (result.success) {
        onRewardEarned?.('coins', result.reward_amount);
        onAdCompleted?.();
        toast({
          title: "🎉 Coins Earned!",
          description: `You've earned ${result.reward_amount} coins in ${gameMode} mode! Keep flying to convert them to Pi!`,
        });
      } else {
        onAdFailed?.(result.description);
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error watching ad for coins:', error);
      onAdFailed?.('Failed to show ad');
      toast({
        title: "Ad Error",
        description: "Failed to load ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowInterstitialAd = async () => {
    if (!piBrowserRedirect.isInPiBrowser()) {
      setShowPiBrowserModal(true);
      return;
    }

    if (!isAdNetworkSupported) {
      toast({
        title: "Ads Not Supported",
        description: "Please update your Pi Browser to watch ads.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await showInterstitialAd();
      
      if (result) {
        onAdCompleted?.();
        toast({
          title: "Ad Completed",
          description: "Thank you for watching the ad!",
        });
      } else {
        onAdFailed?.('Failed to show ad');
        toast({
          title: "Ad Failed",
          description: "Failed to load ad. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      onAdFailed?.('Failed to show ad');
      toast({
        title: "Ad Error",
        description: "Failed to load ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isWatchingAd) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (adError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (isAdNetworkSupported) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isWatchingAd) return "Watching Ad...";
    if (adError) return "Ad Error";
    if (isAdNetworkSupported) return "Ads Available";
    return "Ads Not Supported";
  };

  const getStatusColor = () => {
    if (isWatchingAd) return "bg-blue-100 text-blue-800";
    if (adError) return "bg-red-100 text-red-800";
    if (isAdNetworkSupported) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Ads Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon()}
            Ads Status
          </CardTitle>
          <CardDescription>
            Watch ads to earn rewards and continue playing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            {cooldownTime > 0 && (
              <Badge variant="secondary">
                Cooldown: {cooldownTime}s
              </Badge>
            )}
          </div>

          {/* Cooldown Progress */}
          {cooldownTime > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Ad Cooldown</span>
                <span>{cooldownTime}s remaining</span>
              </div>
              <Progress value={100 - (cooldownTime / 60) * 100} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {adError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{adError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ad Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revive Ad Button */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-5 w-5 text-red-500" />
              Get Revive
            </CardTitle>
            <CardDescription>
              Watch an ad to revive and continue playing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleWatchAdForRevive}
              disabled={isLoading || isWatchingAd || cooldownTime > 0 || !isAdNetworkSupported}
              className="w-full"
              variant="outline"
            >
              {isLoading || isWatchingAd ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Ad...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Watch Ad for Revive
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Coins Ad Button */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-5 w-5 text-yellow-500" />
              Earn Coins
            </CardTitle>
            <CardDescription>
              Watch an ad to earn coins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleWatchAdForCoins}
              disabled={isLoading || isWatchingAd || cooldownTime > 0 || !isAdNetworkSupported}
              className="w-full"
              variant="outline"
            >
              {isLoading || isWatchingAd ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Ad...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Watch Ad for Coins
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Interstitial Ad Button */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interstitial Ad</CardTitle>
          <CardDescription>
            Watch a short ad (no reward)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleShowInterstitialAd}
            disabled={isLoading || isWatchingAd || !isAdNetworkSupported}
            className="w-full"
            variant="secondary"
          >
            {isLoading || isWatchingAd ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Ad...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Watch Interstitial Ad
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pi Browser Modal */}
      {showPiBrowserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Pi Browser Required
              </CardTitle>
              <CardDescription>
                Ads are only available in the Pi Browser app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To watch ads and earn rewards, please open this game in the Pi Browser app.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPiBrowserModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowPiBrowserModal(false);
                    piBrowserRedirect.redirectToPiBrowser();
                  }}
                  className="flex-1"
                >
                  Open in Pi Browser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debug Controls (only in development) */}
              {(typeof window !== 'undefined' && window.location.hostname === 'localhost') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Debug Controls</CardTitle>
            <CardDescription>
              Development tools for testing ads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={resetCooldown}
              variant="outline"
              size="sm"
              className="mr-2"
            >
              Reset Cooldown
            </Button>
            <Button
              onClick={() => {
                console.log('Ads Status:', {
                  isAdNetworkSupported,
                  cooldownTime,
                  isWatchingAd,
                  adError
                });
              }}
              variant="outline"
              size="sm"
            >
              Log Status
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
