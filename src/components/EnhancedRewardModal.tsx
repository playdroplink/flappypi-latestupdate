import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Gift, Star, Zap, Shield, Heart, Magnet, Coins, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventoryService';
import ImageWithFallback from './ImageWithFallback';
import { SubscriptionReward } from '@/constants/subscriptionRewards';

interface EnhancedRewardModalProps {
  open: boolean;
  onClose: () => void;
  rewards: SubscriptionReward[];
  planName?: string;
  planId?: string;
  onClaim?: () => void;
  isPreview?: boolean;
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
    case 'coins': return <img src="/flappycoins.png" alt="Flappy Coin" className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

const EnhancedRewardModal: React.FC<EnhancedRewardModalProps> = ({ 
  open, 
  onClose, 
  rewards, 
  planName = 'Subscription',
  planId,
  onClaim,
  isPreview = false
}) => {
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [previewReward, setPreviewReward] = useState<SubscriptionReward | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open && rewards.length > 0) {
      setShowRewards(true);
      setClaimed(false);
      setPreviewReward(null);
      setShowPreview(false);
    }
  }, [open, rewards]);

  // Save unclaimed rewards when modal is closed without claiming
  const handleClose = () => {
    if (!claimed && !isPreview && planId && rewards.length > 0) {
      // Save rewards as unclaimed
      inventoryService.saveUnclaimedSubscriptionRewards(planId, planName, rewards);
      
      toast({
        title: '📦 Rewards Saved!',
        description: `Your ${planName} rewards have been saved. You can claim them later from your inventory!`,
        duration: 4000
      });
    }
    
    onClose();
    setShowRewards(false);
    setClaimed(false);
  };

  const handleClaim = () => {
    try {
      // Use the proper unclaimed rewards system to prevent double redemption
      if (planId) {
        const claimedRewards = inventoryService.claimSubscriptionRewards(planId);
        if (claimedRewards) {
          setClaimed(true);
          if (onClaim) onClaim();
          
          toast({
            title: 'Rewards Claimed! 🎉',
            description: `Successfully claimed ${claimedRewards.length} item(s) from your ${planName}!`,
            duration: 3000
          });
          
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          toast({
            title: 'Already Claimed',
            description: 'You have already claimed the rewards for this subscription plan.',
            variant: 'destructive',
            duration: 3000
          });
        }
      } else {
        // Fallback for cases without planId (should not happen in normal flow)
        rewards.forEach(reward => {
          const inventoryItem = {
            id: reward.id,
            name: reward.name,
            type: reward.type as any,
            quantity: reward.quantity,
            rarity: reward.rarity,
            image: reward.image,
            description: reward.description
          };
          
          inventoryService.saveToInventory(inventoryItem);
          
          if (reward.type === 'coins') {
            inventoryService.logDailyReward(
              reward.id,
              reward.name,
              reward.type,
              reward.quantity
            );
          } else {
            inventoryService.logTransaction(
              reward.id,
              reward.name,
              reward.type,
              reward.quantity,
              0,
              'coins',
              'subscription',
              'completed',
              { rewardType: 'subscription_reward' }
            );
          }
        });
        
        setClaimed(true);
        if (onClaim) onClaim();
        
        toast({
          title: 'Rewards Claimed! 🎉',
          description: `Successfully claimed ${rewards.length} item(s) from your ${planName}!`,
          duration: 3000
        });
        
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Claim Failed',
        description: 'An error occurred while claiming your rewards.',
        variant: 'destructive'
      });
    }
  };

  const handlePreviewReward = (reward: SubscriptionReward) => {
    setPreviewReward(reward);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewReward(null);
  };

  // Move the claimed rewards check to useEffect to avoid calling onClose during render
  useEffect(() => {
    if (planId && inventoryService.hasClaimedPlanRewards(planId) && open) {
      onClose();
    }
  }, [planId, open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Main Reward Modal */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${isPreview ? 'z-[17000]' : 'z-50'}`}>
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 z-10"
          >
            <X className="w-5 h-5" />
          </Button>
          {isPreview && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center text-yellow-800 text-sm font-medium">
                <Eye className="w-4 h-4 mr-2" />
                This is a preview only. Subscribe to the plan to claim these rewards!
              </div>
            </div>
          )}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isPreview ? '👁️ Reward Preview' : (claimed ? '🎉 Rewards Claimed!' : '🎁 Subscription Rewards!')}
            </h2>
            <p className="text-gray-600 text-lg">
              {isPreview 
                ? `Preview of ${planName} rewards - Subscribe to claim these items!`
                : (claimed 
                  ? 'Your rewards have been added to your inventory!' 
                  : `Here are your ${planName} rewards!`
                )
              }
            </p>
          </div>
          
          {showRewards && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {rewards.map((reward, index) => (
                <Card
                  key={index}
                  className={`border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${getRarityColor(reward.rarity)}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInUp 0.5s ease-out forwards'
                  }}
                  onClick={() => handlePreviewReward(reward)}
                >
                  <CardContent className="flex items-center space-x-4 p-4">
                    <ImageWithFallback
                      src={reward.image}
                      alt={reward.name}
                      className="w-16 h-16 object-contain bg-white rounded-lg p-2 border border-gray-200"
                      fallbackSrc="/icons/icon-128x128.png"
                      lazy={true}
                      retryAttempts={1}
                      retryDelay={300}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-lg text-black truncate">{reward.name}</h3>
                        <span className="text-sm text-gray-800">{getRarityIcon(reward.rarity)}</span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2 truncate">{reward.description || `${reward.type} item`}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs text-gray-800 bg-gray-200 border-gray-300">
                          {reward.rarity}
                        </Badge>
                        <span className="text-sm font-medium text-black">
                          Qty: {reward.quantity}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="flex space-x-3">
            {isPreview ? (
              <Button
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-bold text-lg cursor-default"
                disabled
              >
                🔒 Subscribe to Claim
              </Button>
            ) : !claimed ? (
              <Button
                onClick={handleClaim}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
              >
                🎉 Claim All Rewards
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-200"
              >
                ✅ Done
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reward Preview Modal */}
      {showPreview && previewReward && (
        <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 ${isPreview ? 'z-[18000]' : 'z-[60]'}`}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Item Preview</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <ImageWithFallback
                  src={previewReward.image}
                  alt={previewReward.name}
                  className="w-32 h-32 object-contain bg-gray-50 rounded-xl p-4 border-2 border-gray-200 shadow-lg"
                  fallbackSrc="/icons/icon-128x128.png"
                  lazy={false}
                />
                <div className="absolute -top-2 -right-2">
                  <Badge className={`text-xs font-medium ${getRarityColor(previewReward.rarity)}`}>
                    {getRarityIcon(previewReward.rarity)}
                  </Badge>
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 mt-4 mb-2">{previewReward.name}</h4>
              <p className="text-gray-600 mb-4">{previewReward.description}</p>
              
              <div className="flex items-center justify-center space-x-4">
                <Badge className={`text-sm font-medium ${getRarityColor(previewReward.rarity)}`}>
                  {getTypeIcon(previewReward.type)}
                  <span className="ml-1">{previewReward.type.replace('-', ' ')}</span>
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Quantity: {previewReward.quantity}
                </Badge>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={closePreview}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Close
              </Button>
            </div>
          </div>
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
    </>
  );
};

export default EnhancedRewardModal; 