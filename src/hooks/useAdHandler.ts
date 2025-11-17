import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { gameBackendService } from '@/services/gameBackendService';
import { adService } from '@/services/adService';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useAdHandler = ({
  coins,
  setCoins,
  adWatched,
  setAdWatched,
  isPausedForRevive,
  setShowContinueButton,
  lives,
  setLives,
  refreshProfile,
  score,
  toast
}: {
  coins: number;
  setCoins: (coins: number) => void;
  adWatched: boolean;
  setAdWatched: (watched: boolean) => void;
  isPausedForRevive: boolean;
  setShowContinueButton: (show: boolean) => void;
  lives: number;
  setLives: (lives: number) => void;
  refreshProfile: () => Promise<void>;
  score: number;
  toast: any;
}) => {
  const { profile } = useUserProfile();

  const handleMandatoryAdWatch = useCallback(async () => {
    if (!profile) {
      console.warn('No user profile available for ad reward');
      return;
    }

    try {
      const result = await adService.showRewardedAdForReward('revive', 'classic');
      
      if (result.success) {
        console.log('Revive ad watched - showing continue button');
        setShowContinueButton(true);
        setAdWatched(true);
        
        toast({
          title: "🔄 Revive Earned!",
          description: result.description || "You're back in the game! Keep flying high!"
        });
      } else {
        console.error('Ad failed:', result.description);
        toast({
          title: "Ad Failed",
          description: result.description || "Failed to watch ad",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error handling mandatory ad watch:', error);
      toast({
        title: "Ad Error",
        description: "Failed to watch ad. Please try again.",
        variant: "destructive"
      });
    }
  }, [profile, setShowContinueButton, setAdWatched, toast]);

  const handleAdWatch = useCallback(async (adType: 'continue' | 'coins' | 'life', gameMode: string = 'classic') => {
    if (!profile) {
      console.warn('No user profile available for ad reward');
      return;
    }

    try {
      let result;
      
      switch (adType) {
        case 'continue':
          result = await adService.showRewardedAdForReward('revive', gameMode);
          if (result.success && !adWatched && isPausedForRevive) {
            console.log('Revive ad watched - showing continue button');
            setShowContinueButton(true);
            setAdWatched(true);
            
            toast({
              title: "🔄 Revive Earned!",
              description: result.description || "You're back in the game! Keep flying high!"
            });
          }
          break;
          
        case 'coins':
          result = await adService.showRewardedAdForReward('coins', gameMode);
          if (result.success) {
            // Update local coins immediately
            const newCoins = coins + result.reward_amount;
            setCoins(newCoins);
            localStorage.setItem('flappypi-coins', newCoins.toString());
            
            // Refresh profile to sync with backend
            await refreshProfile();
            
            toast({
              title: "🎉 Coins Earned! 🪙",
              description: result.description || `You've earned ${result.reward_amount} Flappy Coins! Keep flying to convert them to Pi soon! Top players win real Pi weekly!`
            });
          }
          break;
          
        case 'life':
          result = await adService.showRewardedAdForReward('extra_life', gameMode);
          if (result.success) {
            setLives(lives + 1);
            
            toast({
              title: "❤️ Extra Life Earned!",
              description: result.description || "🔥 Watch ads to earn coins — top players win real Pi weekly!"
            });
          }
          break;
      }
      
      if (!result?.success) {
        console.error('Ad failed:', result?.description);
        toast({
          title: "Ad Failed",
          description: result?.description || "Failed to watch ad",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error handling ad watch:', error);
      toast({
        title: "Ad Error",
        description: "Failed to watch ad. Please try again.",
        variant: "destructive"
      });
    }
  }, [profile, coins, setCoins, adWatched, setAdWatched, isPausedForRevive, setShowContinueButton, lives, setLives, refreshProfile, toast]);

  const handleWatchAdForCoins = useCallback(async (gameMode: string = 'classic') => {
    await handleAdWatch('coins', gameMode);
  }, [handleAdWatch]);

  const handleWatchAdForRevive = useCallback(async (gameMode: string = 'classic') => {
    await handleAdWatch('continue', gameMode);
  }, [handleAdWatch]);

  const handleWatchAdForLife = useCallback(async (gameMode: string = 'classic') => {
    await handleAdWatch('life', gameMode);
  }, [handleAdWatch]);

  return {
    handleMandatoryAdWatch,
    handleAdWatch,
    handleWatchAdForCoins,
    handleWatchAdForRevive,
    handleWatchAdForLife
  };
};
