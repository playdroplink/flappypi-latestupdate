import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventoryService';
import { getItemImage } from '@/utils/itemImageMapping';

interface MysteryBoxReward {
  id: string;
  name: string;
  type: 'skin' | 'powerup' | 'subscription' | 'mystery-box' | 'bundle';
  quantity: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary';
  image?: string;
  description?: string;
}

interface MysteryBoxRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: MysteryBoxReward[];
  onClaim?: () => void;
}

const MysteryBoxRewardModal: React.FC<MysteryBoxRewardModalProps> = ({
  isOpen,
  onClose,
  rewards,
  onClaim
}) => {
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    if (isOpen && rewards.length > 0) {
      setShowRewards(true);
      setClaimed(false);
    }
  }, [isOpen, rewards]);

  const handleClaim = () => {
    try {
      // Save all rewards to inventory
      rewards.forEach(reward => {
        inventoryService.saveToInventory({
          id: reward.id,
          name: reward.name,
          type: reward.type,
          quantity: reward.quantity,
          rarity: reward.rarity,
          image: reward.image,
          description: reward.description
        });
      });

      setClaimed(true);
      onClaim();

      toast({
        title: 'Rewards Claimed! 🎉',
        description: `Successfully claimed ${rewards.length} item(s) from your mystery box!`,
        duration: 3000
      });

      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setShowRewards(false);
        setClaimed(false);
      }, 2000);
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Claim Failed',
        description: 'An error occurred while claiming your rewards.',
        variant: 'destructive'
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100';
      case 'Rare': return 'text-blue-600 bg-blue-100';
      case 'Epic': return 'text-purple-600 bg-purple-100';
      case 'Special': return 'text-pink-600 bg-pink-100';
      case 'Legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {claimed ? '🎉 Rewards Claimed!' : '🎁 Mystery Box Rewards!'}
          </h2>
          <p className="text-gray-600">
            {claimed ? 'Your rewards have been added to your inventory!' : 'Here\'s what you found in your mystery box!'}
          </p>
        </div>

        {showRewards && (
          <div className="space-y-4 mb-6">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${getRarityColor(reward.rarity)} transition-all duration-300 hover:scale-105`}
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'slideInUp 0.5s ease-out forwards'
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={reward.image || getItemImage(reward.id) || '/icons/icon-128x128.png'}
                      alt={reward.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-lg">{reward.name}</h3>
                      <span className="text-sm">{getRarityIcon(reward.rarity)}</span>
                    </div>
                    <p className="text-sm opacity-75 mb-2">{reward.description || `${reward.type} item`}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(reward.rarity)}`}>
                        {reward.rarity}
                      </span>
                      <span className="text-sm font-medium">
                        Quantity: {reward.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-3">
          {!claimed ? (
            <button
              onClick={handleClaim}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              🎉 Claim All Rewards
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-200"
            >
              ✅ Done
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
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
  );
};

export default MysteryBoxRewardModal; 