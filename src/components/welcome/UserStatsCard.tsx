import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Coins, Music, MicOff, Crown, ShoppingBag, Calendar, Settings } from 'lucide-react';
import SubscriptionHistoryModal from '@/components/SubscriptionHistoryModal';

interface UserStatsCardProps {
  coins: number;
  musicEnabled: boolean;
  onToggleMusic: (enabled: boolean) => void;
  onOpenPurchaseHistory?: () => void;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({
  coins,
  musicEnabled,
  onToggleMusic,
  onOpenPurchaseHistory
}) => {
  const { profile, hasPremium, isAdFree, hasActiveSubscription, subscriptionStatus } = useUserProfile();
  const [isSubscriptionHistoryOpen, setIsSubscriptionHistoryOpen] = useState(false);

  const getSubscriptionBadge = () => {
    if (hasActiveSubscription) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Crown className="h-3 w-3 mr-1" />
          {profile?.subscription_plan?.charAt(0).toUpperCase() + profile?.subscription_plan?.slice(1)} Active
        </Badge>
      );
    }
    
    if (subscriptionStatus === 'cancelled') {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Calendar className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    }
    
    if (subscriptionStatus === 'expired') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Expired
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <>
      <Card className="w-full bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-6 animate-fade-in" 
            style={{ animationDelay: '0.1s' }}>
        <div className="p-6">
          {/* User Info */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              {profile?.username || 'Flappy Pilot'}
            </h2>
            <div className="flex items-center justify-center space-x-2 flex-wrap gap-1">
              {getSubscriptionBadge()}
              {hasPremium && !hasActiveSubscription && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {isAdFree && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Ad-Free
                </Badge>
              )}
            </div>
          </div>

          {/* Coins Display */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/flappycoins.png" alt="Flappy Coin" className="h-6 w-6 inline-block align-middle" />
            <span className="text-2xl font-bold text-yellow-600">
              {coins.toLocaleString()}
            </span>
            <span className="text-gray-600">coins</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Music Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleMusic(!musicEnabled)}
              className="flex items-center space-x-2"
            >
              {musicEnabled ? (
                <Music className="h-4 w-4 text-blue-600" />
              ) : (
                <MicOff className="h-4 w-4 text-gray-600" />
              )}
              <span className="text-sm">
                {musicEnabled ? 'Music On' : 'Music Off'}
              </span>
            </Button>

            {/* Purchase History Button */}
            {onOpenPurchaseHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPurchaseHistory}
                className="flex items-center space-x-2"
              >
                <ShoppingBag className="h-4 w-4 text-green-600" />
                <span className="text-sm">History</span>
              </Button>
            )}
          </div>

          {/* Subscription Actions */}
          {(hasActiveSubscription || subscriptionStatus !== 'none') && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubscriptionHistoryOpen(true)}
                className="w-full flex items-center space-x-2"
              >
                <Settings className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Subscription History</span>
              </Button>
            </div>
          )}

          {/* Subscription Status */}
          {hasActiveSubscription && profile?.subscription_end && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-800">Active until:</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    {new Date(profile.subscription_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <SubscriptionHistoryModal
        isOpen={isSubscriptionHistoryOpen}
        onClose={() => setIsSubscriptionHistoryOpen(false)}
      />
    </>
  );
};

export default UserStatsCard;
