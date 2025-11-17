import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useAdsSystem } from '@/hooks/useAdsSystem';
import { ReviveAdButton, CoinsAdButton } from '@/components/ads/AdButton';
import { Heart, Coins, Play, Trophy } from 'lucide-react';

/**
 * Example component showing how to integrate ads into game components
 * This demonstrates the different ways to use the ads system
 */
export const AdsIntegrationExample: React.FC = () => {
  const [coins, setCoins] = useState(100);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing');
  
  const { toast } = useToast();
  const {
    isAdNetworkSupported,
    cooldownTime,
    isWatchingAd,
    showRewardedAdForRevive,
    showRewardedAdForCoins,
    incrementGameCount,
    shouldShowMandatoryAd,
    handleMandatoryAd
  } = useAdsSystem();

  // Example: Handle revive from ad
  const handleReviveSuccess = (rewardType: 'revive', amount: number) => {
    setLives(prev => prev + amount);
    setGameState('playing');
    toast({
      title: "🎉 Revived!",
      description: "You're back in the game!",
    });
  };

  // Example: Handle coins earned from ad
  const handleCoinsSuccess = (rewardType: 'coins', amount: number) => {
    setCoins(prev => prev + amount);
    toast({
      title: "🎉 Coins Earned!",
      description: `You earned ${amount} coins!`,
    });
  };

  // Example: Handle game over with mandatory ad
  const handleGameOver = () => {
    setGameState('gameOver');
    incrementGameCount(); // This triggers mandatory ad check
    
    if (shouldShowMandatoryAd) {
      // Show mandatory ad modal
      setGameState('paused');
    }
  };

  // Example: Handle mandatory ad
  const handleMandatoryAdWatch = async () => {
    const success = await handleMandatoryAd();
    if (success) {
      setGameState('gameOver');
    }
  };

  // Example: Simulate collision (triggers revive option)
  const handleCollision = () => {
    if (lives > 0) {
      setLives(prev => prev - 1);
      if (lives - 1 <= 0) {
        // Offer revive with ad
        setGameState('paused');
      }
    } else {
      handleGameOver();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Game Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-semibold">{lives}</span>
              </div>
              <span className="text-sm text-muted-foreground">Lives</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{coins}</span>
              </div>
              <span className="text-sm text-muted-foreground">Coins</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">{score}</span>
              </div>
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={isAdNetworkSupported ? "default" : "secondary"}>
              {isAdNetworkSupported ? "Ads Available" : "Ads Not Available"}
            </Badge>
            {cooldownTime > 0 && (
              <Badge variant="outline">
                Cooldown: {cooldownTime}s
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Example 1: Using AdButton Components */}
      <Card>
        <CardHeader>
          <CardTitle>Example 1: Using AdButton Components</CardTitle>
          <CardDescription>
            Simple integration using pre-built ad button components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReviveAdButton
              onSuccess={handleReviveSuccess}
              variant="outline"
              className="w-full"
              disabled={gameState !== 'paused'}
            >
              <Heart className="mr-2 h-4 w-4" />
              Watch Ad for Revive
            </ReviveAdButton>

            <CoinsAdButton
              onSuccess={handleCoinsSuccess}
              variant="outline"
              className="w-full"
            >
              <Coins className="mr-2 h-4 w-4" />
              Watch Ad for Coins
            </CoinsAdButton>
          </div>
        </CardContent>
      </Card>

      {/* Example 2: Using Ads Hook Directly */}
      <Card>
        <CardHeader>
          <CardTitle>Example 2: Using Ads Hook Directly</CardTitle>
          <CardDescription>
            More control using the ads hook directly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={async () => {
                const result = await showRewardedAdForRevive();
                if (result.success) {
                  handleReviveSuccess('revive', 1);
                }
              }}
              disabled={!isAdNetworkSupported || cooldownTime > 0 || isWatchingAd || gameState !== 'paused'}
              variant="outline"
              className="w-full"
            >
              {isWatchingAd ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Custom Revive Ad
                </>
              )}
            </Button>

            <Button
              onClick={async () => {
                const result = await showRewardedAdForCoins();
                if (result.success) {
                  handleCoinsSuccess('coins', result.reward_amount);
                }
              }}
              disabled={!isAdNetworkSupported || cooldownTime > 0 || isWatchingAd}
              variant="outline"
              className="w-full"
            >
              {isWatchingAd ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Custom Coins Ad
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Example 3: Game Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Example 3: Game Simulation</CardTitle>
          <CardDescription>
            Simulate game events to test ads integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setScore(prev => prev + 10)}
              variant="outline"
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Add Score (+10)
            </Button>

            <Button
              onClick={handleCollision}
              variant="outline"
              className="w-full"
            >
              <Heart className="mr-2 h-4 w-4" />
              Simulate Collision
            </Button>

            <Button
              onClick={handleGameOver}
              variant="outline"
              className="w-full"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Game Over
            </Button>
          </div>

          <div className="text-center">
            <Badge variant="outline">
              Game State: {gameState}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Example 4: Mandatory Ad Modal */}
      {shouldShowMandatoryAd && gameState === 'paused' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <div className="animate-pulse">📺</div>
              Mandatory Ad
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Watch a quick ad to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-yellow-700">
              This ad appears every 2 games to support the game development.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleMandatoryAdWatch}
                className="flex-1"
                disabled={isWatchingAd}
              >
                {isWatchingAd ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Loading Ad...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Watch Ad
                  </>
                )}
              </Button>
              <Button
                onClick={() => setGameState('gameOver')}
                variant="outline"
                className="flex-1"
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example 5: Game Over Modal with Ads */}
      {gameState === 'gameOver' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Trophy className="h-5 w-5" />
              Game Over
            </CardTitle>
            <CardDescription className="text-red-700">
              Final Score: {score}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-red-700 mb-4">
                Want to continue playing? Watch an ad to get more coins!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReviveAdButton
                onSuccess={handleReviveSuccess}
                variant="outline"
                className="w-full"
              >
                <Heart className="mr-2 h-4 w-4" />
                Watch Ad for Revive
              </ReviveAdButton>

              <CoinsAdButton
                onSuccess={handleCoinsSuccess}
                variant="outline"
                className="w-full"
              >
                <Coins className="mr-2 h-4 w-4" />
                Watch Ad for Coins
              </CoinsAdButton>
            </div>

            <Button
              onClick={() => {
                setGameState('playing');
                setScore(0);
                setLives(3);
              }}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>
            Current ads system status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ad Network Supported:</span>
              <Badge variant={isAdNetworkSupported ? "default" : "secondary"}>
                {isAdNetworkSupported ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Watching Ad:</span>
              <Badge variant={isWatchingAd ? "default" : "secondary"}>
                {isWatchingAd ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Cooldown Time:</span>
              <span>{cooldownTime}s</span>
            </div>
            <div className="flex justify-between">
              <span>Game Count:</span>
              <span>{Math.floor(score / 10)}</span>
            </div>
            <div className="flex justify-between">
              <span>Should Show Mandatory Ad:</span>
              <Badge variant={shouldShowMandatoryAd ? "default" : "secondary"}>
                {shouldShowMandatoryAd ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
