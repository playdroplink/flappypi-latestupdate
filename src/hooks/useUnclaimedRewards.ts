import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';

export const useUnclaimedRewards = () => {
  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);
  const [showUnclaimedModal, setShowUnclaimedModal] = useState(false);

  useEffect(() => {
    // Check for unclaimed rewards on mount
    const checkUnclaimedRewards = () => {
      const hasUnclaimed = inventoryService.hasUnclaimedSubscriptionRewards();
      setHasUnclaimedRewards(hasUnclaimed);
      
      // Show modal if there are unclaimed rewards
      if (hasUnclaimed) {
        // Small delay to ensure app is fully loaded
        setTimeout(() => {
          setShowUnclaimedModal(true);
        }, 2000);
      }
    };

    checkUnclaimedRewards();

    // Listen for unclaimed rewards updates
    const handleUnclaimedRewardsUpdate = () => {
      const hasUnclaimed = inventoryService.hasUnclaimedSubscriptionRewards();
      setHasUnclaimedRewards(hasUnclaimed);
    };

    window.addEventListener('unclaimed-rewards-updated', handleUnclaimedRewardsUpdate);

    // Clean up expired unclaimed rewards
    inventoryService.clearExpiredUnclaimedRewards();

    return () => {
      window.removeEventListener('unclaimed-rewards-updated', handleUnclaimedRewardsUpdate);
    };
  }, []);

  const handleClaimRewards = () => {
    setShowUnclaimedModal(false);
    setHasUnclaimedRewards(false);
  };

  return {
    hasUnclaimedRewards,
    showUnclaimedModal,
    setShowUnclaimedModal,
    handleClaimRewards
  };
}; 