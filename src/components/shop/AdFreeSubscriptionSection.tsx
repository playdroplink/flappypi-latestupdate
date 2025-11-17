
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Infinity, Calendar } from 'lucide-react';

interface AdFreeSubscriptionSectionProps {
  adSystem: {
    gameCount: number;
    isAdFree: boolean;
    shouldShowMandatoryAd: boolean;
    canContinueWithoutAd: boolean;
    adFreeTimeRemaining: { days: number; hours: number } | null;
    incrementGameCount: () => void;
    resetAdCounter: () => void;
    purchaseAdFree: (coins?: number) => Promise<boolean>;
    purchaseAdFreeWithPi: () => Promise<boolean>;
  };
  handlePurchaseAdFree: () => void;
}

const AdFreeSubscriptionSection: React.FC<AdFreeSubscriptionSectionProps> = ({
  adSystem,
  handlePurchaseAdFree
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
        <Crown className="mr-2 h-5 w-5 text-purple-600" />
        Pi Premium Subscription
        <span className="ml-2 text-sm bg-purple-100 px-2 py-1 rounded text-purple-700">
          Remove Ads
        </span>
      </h3>
      
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        {adSystem.isAdFree ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✨</div>
            <h4 className="text-xl font-bold text-purple-700 mb-2">Premium Active!</h4>
            <p className="text-gray-600 text-sm mb-4">
              You're enjoying ad-free gaming right now!
            </p>
            
            {adSystem.adFreeTimeRemaining && (
              <div className="bg-white rounded-lg p-3 border border-purple-200 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-sm">Time Remaining</span>
                </div>
                <p className="text-purple-700 text-lg font-bold">
                  {adSystem.adFreeTimeRemaining.days}d {adSystem.adFreeTimeRemaining.hours}h
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2 text-sm text-left">
              <div className="flex items-center space-x-2 text-green-600">
                <Infinity className="h-4 w-4" />
                <span>Continue games unlimited</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Zap className="h-4 w-4" />
                <span>No mandatory ads</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-800">Remove Pi Ads</h4>
                <p className="text-gray-600 text-sm">
                  Skip all mandatory ads and continue unlimited
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">10 Pi</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
              <div className="flex items-center space-x-3">
                <Infinity className="h-5 w-5 text-green-500" />
                <span>Continue games unlimited without watching ads</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-green-500" />
                <span>No mandatory ads every 2 games</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-500" />
                <span>30 days of ad-free gaming</span>
              </div>
            </div>
            
            <Button
              onClick={handlePurchaseAdFree}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 rounded-lg py-3 font-bold"
            >
              <Crown className="mr-2 h-5 w-5" />
              💎 Subscribe with Pi (10 Pi/month)
            </Button>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AdFreeSubscriptionSection;
