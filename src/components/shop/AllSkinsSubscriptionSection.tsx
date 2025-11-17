
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Infinity, Shield } from 'lucide-react';

interface AllSkinsSubscriptionSectionProps {
  allSkinsSubscription: {
    isActive: boolean;
    expiresAt: string | null;
    daysRemaining: number;
  };
  eliteSubscription: {
    isActive: boolean;
  };
  handleAllSkinsSubscription: () => void;
}

const AllSkinsSubscriptionSection: React.FC<AllSkinsSubscriptionSectionProps> = ({
  allSkinsSubscription,
  eliteSubscription,
  handleAllSkinsSubscription
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
        <Sparkles className="mr-2 h-5 w-5 text-pink-600" />
        All Skins Subscription
        <span className="ml-2 text-sm bg-pink-100 px-2 py-1 rounded text-pink-700">
          30 Days Access
        </span>
      </h3>
      
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        {allSkinsSubscription.isActive && !eliteSubscription.isActive ? (
          <div className="text-center">
            <div className="text-4xl mb-3">✨</div>
            <h4 className="text-xl font-bold text-pink-700 mb-2">All Skins Unlocked!</h4>
            <p className="text-gray-600 text-sm mb-4">
              You have access to all standard bird skins right now!
            </p>
            
            <div className="bg-white rounded-lg p-3 border border-pink-200 mb-4">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-pink-600" />
                <span className="font-semibold text-sm">Time Remaining</span>
              </div>
              <p className="text-pink-700 text-lg font-bold">
                {allSkinsSubscription.daysRemaining} days
              </p>
            </div>
            
            <div className="text-sm text-left space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <Sparkles className="h-4 w-4" />
                <span>All standard skins unlocked</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <Infinity className="h-4 w-4" />
                <span>Switch between any standard skin anytime</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-pink-100 rounded-lg">
              <p className="text-xs text-pink-700">
                <Shield className="h-3 w-3 inline mr-1" />
                No refunds after payment. One-time 30-day access.
              </p>
            </div>
          </div>
        ) : eliteSubscription.isActive ? (
          <div className="text-center">
            <div className="text-4xl mb-3">👑</div>
            <h4 className="text-xl font-bold text-yellow-700 mb-2">Included in Elite Pack!</h4>
            <p className="text-gray-600 text-sm">
              All skins are included in your Elite subscription
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-800">Unlock All Standard Skins</h4>
                <p className="text-gray-600 text-sm">
                  Get instant access to all standard bird skins for 30 days
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-pink-600">15 Pi</div>
                <div className="text-sm text-gray-500">for 30 days</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-4 text-sm">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-pink-500" />
                <span>Access to all standard bird skins immediately</span>
              </div>
              <div className="flex items-center space-x-3">
                <Infinity className="h-5 w-5 text-pink-500" />
                <span>Switch between any standard skin anytime during subscription</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-pink-500" />
                <span>30 days of unlimited standard skin access</span>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-pink-100 rounded-lg">
              <p className="text-xs text-pink-700">
                <Shield className="h-3 w-3 inline mr-1" />
                No refunds after payment. One-time purchase for 30-day access.
              </p>
            </div>
            
            <Button
              onClick={handleAllSkinsSubscription}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 rounded-lg py-3 font-bold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              🎨 Subscribe with Pi (15 Pi/30 days)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSkinsSubscriptionSection;
