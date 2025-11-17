
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Infinity, Calendar, Sparkles, Star, Shield } from 'lucide-react';

interface EliteSubscriptionSectionProps {
  eliteSubscription: {
    isActive: boolean;
    expiresAt: string | null;
    daysRemaining: number;
  };
  handleEliteSubscription: () => void;
}

const EliteSubscriptionSection: React.FC<EliteSubscriptionSectionProps> = ({
  eliteSubscription,
  handleEliteSubscription
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
        <Crown className="mr-2 h-5 w-5 text-yellow-600" />
        Elite Pack Subscription
        <span className="ml-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded">
          Premium
        </span>
      </h3>
      
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300">
        {eliteSubscription.isActive ? (
          <div className="text-center">
            <div className="text-4xl mb-3">👑</div>
            <h4 className="text-xl font-bold text-yellow-700 mb-2">Elite Member Active!</h4>
            <p className="text-gray-600 text-sm mb-4">
              You're enjoying elite privileges right now!
            </p>
            
            <div className="bg-white rounded-lg p-3 border border-yellow-300 mb-4">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <span className="font-semibold text-sm">Time Remaining</span>
              </div>
              <p className="text-yellow-700 text-lg font-bold">
                {eliteSubscription.daysRemaining} days
              </p>
            </div>
            
            <div className="text-sm text-left space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <Crown className="h-4 w-4" />
                <span>Elite badge and status</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Sparkles className="h-4 w-4" />
                <span>All skins including exclusive elite characters</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Star className="h-4 w-4" />
                <span>Priority support and early features</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-xs text-orange-700">
                <Shield className="h-3 w-3 inline mr-1" />
                No refunds after payment. Subscription auto-renews monthly.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-800">Elite Pack</h4>
                <p className="text-gray-600 text-sm">
                  Premium membership with exclusive content and elite status
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">20 Pi</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>Elite badge and special status recognition</span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>All bird skins including exclusive elite characters</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Priority support and early access to new features</span>
              </div>
              <div className="flex items-center space-x-3">
                <Infinity className="h-5 w-5 text-yellow-500" />
                <span>All features from standard subscriptions included</span>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-xs text-yellow-700">
                <Shield className="h-3 w-3 inline mr-1" />
                No refunds after payment. Subscription renews monthly. Cancel anytime.
              </p>
            </div>
            
            <Button
              onClick={handleEliteSubscription}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 rounded-lg py-3 font-bold"
            >
              <Crown className="mr-2 h-5 w-5" />
              👑 Subscribe Elite Pack (20 Pi/month)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EliteSubscriptionSection;
