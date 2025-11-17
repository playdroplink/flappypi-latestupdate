import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionStatus } from '../hooks/use-subscription-status'; // Import the subscription status hook

export const useAdSystem = () => {
  const [gameCount, setGameCount] = useState(0);
  const [adFreeExpiresAt, setAdFreeExpiresAt] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if the user is subscribed
  const { isSubscribed } = useSubscriptionStatus();

  // Load ad-free status from localStorage
  useEffect(() => {
    const adFreeData = localStorage.getItem('flappypi-adfree');
    if (adFreeData) {
      try {
        const data = JSON.parse(adFreeData);
        const expiryDate = new Date(data.expiresAt);
        if (expiryDate > new Date()) {
          setAdFreeExpiresAt(data.expiresAt);
        } else {
          localStorage.removeItem('flappypi-adfree');
        }
      } catch (error) {
        localStorage.removeItem('flappypi-adfree');
      }
    }

    // Load game count
    const savedCount = localStorage.getItem('flappypi-game-count');
    if (savedCount) {
      setGameCount(parseInt(savedCount));
    }
  }, []);

  const incrementGameCount = useCallback(() => {
    const newCount = gameCount + 1;
    setGameCount(newCount);
    localStorage.setItem('flappypi-game-count', newCount.toString());
    console.log(`Game count incremented to: ${newCount}`);
  }, [gameCount]);

  const resetAdCounter = useCallback(() => {
    setGameCount(0);
    localStorage.setItem('flappypi-game-count', '0');
    console.log('Ad counter reset');
  }, []);

  // Show mandatory ad every 3 games (not if user has ad-free)
  const shouldShowMandatoryAd = !isSubscribed && gameCount > 0 && gameCount % 3 === 0; // Ensure ads show every 3 games

  // User can continue without ad if they have ad-free subscription
  const canContinueWithoutAd = isSubscribed;

  const purchaseAdFree = useCallback(async (coins?: number) => {
    toast({
      title: "Processing Pi Payment",
      description: "Purchasing ad-free subscription..."
    });

    // Simulate Pi Network payment
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        const adFreeData = {
          expiresAt: expiryDate.toISOString()
        };
        
        localStorage.setItem('flappypi-adfree', JSON.stringify(adFreeData));
        setAdFreeExpiresAt(expiryDate.toISOString());
        
        toast({
          title: "🎉 Ad-Free Activated!",
          description: "You now have 30 days of ad-free gaming!"
        });
        
        resolve(true);
      }, 2000);
    });
  }, [toast]);

  const purchaseAdFreeWithPi = useCallback(async () => {
    // Enhanced Pi Network integration would go here
    return await purchaseAdFree();
  }, [purchaseAdFree]);

  const adFreeTimeRemaining = adFreeExpiresAt 
    ? (() => {
        const timeLeft = new Date(adFreeExpiresAt).getTime() - new Date().getTime();
        const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
        const hoursLeft = Math.max(0, Math.ceil((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        return { days: daysLeft, hours: hoursLeft };
      })()
    : null;

  return {
    gameCount,
    isAdFree: isSubscribed,
    shouldShowMandatoryAd,
    canContinueWithoutAd,
    adFreeTimeRemaining,
    incrementGameCount,
    resetAdCounter,
    purchaseAdFree,
    purchaseAdFreeWithPi
  };
};
