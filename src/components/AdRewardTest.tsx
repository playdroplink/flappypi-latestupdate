import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../context/AuthContext';
import { adService } from '../services/adService';
import { getUserRewardCounts } from '../utils/rewardUtils';
import { loadWalletBalance } from '../utils/walletUtils';
import { toast } from './ui/use-toast';

const AdRewardTest: React.FC = () => {
  const { isAuthenticated, username } = useAuth();
  const [rewardCounts, setRewardCounts] = useState({
    revives: 0,
    extraLives: 0,
    rouletteSpins: 0,
    coins: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && username) {
      updateRewardCounts();
    }
  }, [isAuthenticated, username]);

  const updateRewardCounts = () => {
    if (username) {
      const counts = getUserRewardCounts(username);
      setRewardCounts(counts);
    }
  };

  const handleWatchAdForReward = async (rewardType: 'revive' | 'coins' | 'extra_life' | 'roulette_spin') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to watch ads for rewards.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🎥 Testing ad reward for: ${rewardType}`);
      
      const result = await adService.showRewardedAdForReward(rewardType, 'classic');
      
      if (result.success) {
        toast({
          title: "🎉 Reward Earned!",
          description: result.description,
        });
        
        // Update the display
        updateRewardCounts();
      } else {
        toast({
          title: "Ad Failed",
          description: result.description,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error testing ad reward:', error);
      toast({
        title: "Error",
        description: "Failed to show ad. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Ad Reward Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Please sign in to test ad rewards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🎁 Ad Reward Test Panel</CardTitle>
        <p className="text-sm text-gray-600">
          Test the ad reward system to ensure users get proper rewards after watching ads.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Reward Counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{rewardCounts.coins}</div>
            <div className="text-sm text-blue-700">Flappy Coins</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{rewardCounts.revives}</div>
            <div className="text-sm text-green-700">Revives</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{rewardCounts.extraLives}</div>
            <div className="text-sm text-purple-700">Extra Lives</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{rewardCounts.rouletteSpins}</div>
            <div className="text-sm text-orange-700">Roulette Spins</div>
          </div>
        </div>

        {/* Ad Reward Buttons */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Test Ad Rewards:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => handleWatchAdForReward('coins')}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isLoading ? 'Loading...' : '🎯 Watch Ad for Coins'}
            </Button>
            
            <Button
              onClick={() => handleWatchAdForReward('revive')}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? 'Loading...' : '🔄 Watch Ad for Revive'}
            </Button>
            
            <Button
              onClick={() => handleWatchAdForReward('extra_life')}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isLoading ? 'Loading...' : '❤️ Watch Ad for Extra Life'}
            </Button>
            
            <Button
              onClick={() => handleWatchAdForReward('roulette_spin')}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? 'Loading...' : '🎰 Watch Ad for Roulette Spin'}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How it works:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Coins:</strong> Earn 25-35 Flappy Coins based on game mode</li>
            <li>• <strong>Revive:</strong> Get 1 revive to continue after game over</li>
            <li>• <strong>Extra Life:</strong> Get 1 extra life for the current game session</li>
            <li>• <strong>Roulette Spin:</strong> Get 1 spin on the roulette wheel</li>
            <li>• <strong>Cooldown:</strong> 60 seconds between ad watches</li>
            <li>• <strong>Verification:</strong> All rewards are verified and saved locally</li>
          </ul>
        </div>

        {/* User Info */}
        <div className="text-center text-sm text-gray-600">
          <p>Testing as: <strong>{username}</strong></p>
          <p>Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdRewardTest;
