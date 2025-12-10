import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Gift, Star, Zap, Shield, Heart, Magnet, Coins, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { inventoryService, UnclaimedSubscriptionReward } from '@/services/inventoryService';
import ImageWithFallback from './ImageWithFallback';
import { SubscriptionReward } from '@/constants/subscriptionRewards';

interface UnclaimedRewardsModalProps {
  open: boolean;
  onClose: () => void;
  onClaim?: () => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Common': return 'text-gray-600 bg-gray-100 border-gray-300';
    case 'Rare': return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'Epic': return 'text-purple-600 bg-purple-100 border-purple-300';
    case 'Special': return 'text-pink-600 bg-pink-100 border-pink-300';
    case 'Legendary': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    default: return 'text-gray-600 bg-gray-100 border-gray-300';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'Common': return '⭐';
    case 'Rare': return '⭐⭐';
    case 'Epic': return '⭐⭐⭐';
    case 'Special': return '⭐⭐⭐⭐';
    case 'Legendary': return '⭐⭐⭐⭐⭐';
    default: return '⭐';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'skin': return <Heart className="w-4 h-4" />;
    case 'powerup': return <Zap className="w-4 h-4" />;
    case 'mystery-box': return <Package className="w-4 h-4" />;
    case 'bundle': return <Gift className="w-4 h-4" />;
    case 'coins': return <Coins className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

const UnclaimedRewardsModal: React.FC<UnclaimedRewardsModalProps> = ({ 
  open, 
  onClose, 
  onClaim 
}) => {
  const { toast } = useToast();
  const [unclaimedRewards, setUnclaimedRewards] = useState<UnclaimedSubscriptionReward[]>([]);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (open) {
      const rewards = inventoryService.getUnclaimedSubscriptionRewards();
      setUnclaimedRewards(rewards);
      setClaimed(false);
    }
  }, [open]);

  const handleClaimAll = async () => {
    if (unclaimedRewards.length === 0) return;
    
    setClaiming(true);
    try {
      const claimedResults = inventoryService.claimAllSubscriptionRewards();
      
      if (claimedResults.length > 0) {
        setClaimed(true);
        
        const totalRewards = claimedResults.reduce((total, result) => total + result.rewards.length, 0);
        
        toast({
          title: '🎉 All Rewards Claimed!',
          description: `Successfully claimed ${totalRewards} item(s) from ${claimedResults.length} subscription plan(s)!`,
          duration: 4000
        });
        
        if (onClaim) onClaim();
        
        // Close modal after 2 seconds and check for new rewards
        setTimeout(() => {
          // Refresh unclaimed rewards to check if new ones appeared
          const updatedRewards = inventoryService.getUnclaimedSubscriptionRewards();
          if (updatedRewards.length === 0) {
            // No new rewards - close modal
            onClose();
            setClaimed(false);
            setClaiming(false);
          } else {
            // New rewards appeared - refresh the list
            setUnclaimedRewards(updatedRewards);
            setClaimed(false);
            setClaiming(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Claim Failed',
        description: 'An error occurred while claiming your rewards.',
        variant: 'destructive'
      });
      setClaiming(false);
    }
  };

  const handleClaimPlan = async (planId: string) => {
    setClaiming(true);
    try {
      // FIXED: claimSubscriptionRewards now returns rewards even if already in inventory
      // This allows users to claim rewards without "Already Claimed" restrictions
      const claimedRewards = inventoryService.claimSubscriptionRewards(planId);
      if (claimedRewards && claimedRewards.length > 0) {
        const plan = unclaimedRewards.find(r => r.planId === planId);
        toast({
          title: '🎉 Rewards Claimed!',
          description: `Successfully claimed ${claimedRewards.length} item(s) from ${plan?.planName}!`,
          duration: 3000
        });
        
        // Update local state - remove claimed plan from the list
        const updatedRewards = unclaimedRewards.filter(r => r.planId !== planId);
        setUnclaimedRewards(updatedRewards);
        
        // Check if there are any remaining rewards to claim
        if (updatedRewards.length === 0) {
          // No more rewards - close modal after brief delay
          setTimeout(() => {
            onClose();
            setClaiming(false);
          }, 1500);
        } else {
          // More rewards available - keep modal open but show updated list
          setClaiming(false);
        }
        
        if (onClaim) onClaim();
      } else {
        // This should rarely happen - only if the unclaimed rewards don't exist at all
        toast({
          title: 'No Rewards Available',
          description: 'This subscription plan has no unclaimed rewards.',
          variant: 'destructive',
          duration: 3000
        });
        setClaiming(false);
      }
    } catch (error) {
      console.error('Error claiming plan rewards:', error);
      toast({
        title: 'Claim Failed',
        description: 'An error occurred while claiming your rewards.',
        variant: 'destructive'
      });
      setClaiming(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">
              {claimed ? '🎉 Rewards Claimed!' : '📦 Unclaimed Subscription Rewards!'}
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            {claimed 
              ? 'Your rewards have been added to your inventory!' 
              : `You have ${unclaimedRewards.length} subscription plan(s) with unclaimed rewards!`
            }
          </p>
        </div>

        {unclaimedRewards.length > 0 && !claimed && (
          <>
            {/* Claim All Button */}
            <div className="mb-6 text-center">
              <Button
                onClick={handleClaimAll}
                disabled={claiming}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {claiming ? 'Claiming...' : `🎉 Claim All Rewards (${unclaimedRewards.reduce((total, plan) => total + plan.rewards.length, 0)} items)`}
              </Button>
            </div>

            {/* Individual Plan Rewards */}
            <div className="space-y-6">
              {unclaimedRewards.map((planRewards, planIndex) => (
                <Card key={planRewards.id} className="border-2 border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {planRewards.planName}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Purchased on {new Date(planRewards.purchasedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleClaimPlan(planRewards.planId)}
                        disabled={claiming}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                      >
                        {claiming ? 'Claiming...' : `Claim ${planRewards.rewards.length} Items`}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {planRewards.rewards.map((reward, rewardIndex) => (
                        <div
                          key={rewardIndex}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${getRarityColor(reward.rarity)}`}
                          style={{
                            animationDelay: `${rewardIndex * 100}ms`,
                            animation: 'slideInUp 0.5s ease-out forwards'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <ImageWithFallback
                                src={reward.image}
                                alt={reward.name}
                                className="w-12 h-12 object-contain bg-white rounded-lg p-2 border border-gray-200"
                                fallbackSrc="/icons/icon-128x128.png"
                                lazy={true}
                                retryAttempts={2}
                                retryDelay={500}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-sm truncate">{reward.name}</h4>
                                <span className="text-xs">{getRarityIcon(reward.rarity)}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2 truncate">
                                {reward.description || `${reward.type} item`}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {reward.rarity}
                                </Badge>
                                <span className="text-xs font-medium">
                                  Qty: {reward.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {claimed && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-700 font-semibold text-lg">
              All rewards have been successfully added to your inventory!
            </p>
          </div>
        )}

        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default UnclaimedRewardsModal; 