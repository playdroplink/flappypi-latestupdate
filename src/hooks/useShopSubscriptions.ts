
import { useState, useEffect } from 'react';

interface Subscription {
  isActive: boolean;
  expiresAt: string | null;
  daysRemaining: number;
}

export const useShopSubscriptions = () => {
  const [allSkinsSubscription, setAllSkinsSubscription] = useState<Subscription>({
    isActive: false,
    expiresAt: null,
    daysRemaining: 0
  });
  
  const [eliteSubscription, setEliteSubscription] = useState<Subscription>({
    isActive: false,
    expiresAt: null,
    daysRemaining: 0
  });

  const checkSubscriptions = () => {
    // Check All Skins subscription
    const allSkinsData = localStorage.getItem('flappypi-all-skins-subscription');
    if (allSkinsData) {
      const subscription = JSON.parse(allSkinsData);
      const expiryDate = new Date(subscription.expiresAt);
      const now = new Date();
      
      if (expiryDate > now) {
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setAllSkinsSubscription({
          isActive: true,
          expiresAt: subscription.expiresAt,
          daysRemaining
        });
      } else {
        localStorage.removeItem('flappypi-all-skins-subscription');
        setAllSkinsSubscription({
          isActive: false,
          expiresAt: null,
          daysRemaining: 0
        });
      }
    }

    // Check Elite subscription
    const eliteData = localStorage.getItem('flappypi-elite-subscription');
    if (eliteData) {
      const subscription = JSON.parse(eliteData);
      const expiryDate = new Date(subscription.expiresAt);
      const now = new Date();
      
      if (expiryDate > now) {
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setEliteSubscription({
          isActive: true,
          expiresAt: subscription.expiresAt,
          daysRemaining
        });
      } else {
        localStorage.removeItem('flappypi-elite-subscription');
        setEliteSubscription({
          isActive: false,
          expiresAt: null,
          daysRemaining: 0
        });
      }
    }
  };

  return {
    allSkinsSubscription,
    eliteSubscription,
    checkSubscriptions
  };
};
