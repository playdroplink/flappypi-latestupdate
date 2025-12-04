import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Gift, Star, Zap, Shield, Heart, Magnet, Coins } from 'lucide-react';
import { shopItems } from '@/constants/shopItems';
import { useToast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventoryService';
import ImageWithFallback from './ImageWithFallback';
import { getItemImage, getExactItemImage } from '@/utils/itemImageMapping';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import CoinClaimModal from './CoinClaimModal';

/**
 * Get the appropriate image for any item type (skin, powerup, etc)
 */
const getRewardImage = (reward: Reward): string => {
  // If item has explicit image path, use it
  if (reward.image) {
    return reward.image;
  }
  
  // For bird/skin types, use getBirdImageSrc
  if (reward.type === 'skin') {
    return getBirdImageSrc(reward);
  }
  
  // For all other types (powerup, subscription, etc), use getItemImage
  return getItemImage(reward.id);
};

interface Reward {
  id: string;
  name: string;
  type: 'skin' | 'powerup' | 'subscription' | 'mystery-box' | 'bundle' | 'coins';
  quantity: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary';
  image?: string;
  description?: string;
}

interface RewardModalProps {
  open: boolean;
  onClose: () => void;
  rewards: Reward[];
  onClaim?: () => void;
}

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

const RewardModal: React.FC<RewardModalProps> = ({ open, onClose, rewards, onClaim }) => {
  const { toast } = useToast();
  const [claimed, setClaimed] = React.useState(false);
  const [showRewards, setShowRewards] = React.useState(false);
  const [showCoinClaimModal, setShowCoinClaimModal] = useState(false);
  const [totalCoinsToShow, setTotalCoinsToShow] = useState(0);
  const [claimedItemsToShow, setClaimedItemsToShow] = useState<Array<{
    id: string;
    name: string;
    quantity: number;
    image?: string;
    rarity?: string;
  }>>([]);

  React.useEffect(() => {
    if (open && rewards.length > 0) {
      setShowRewards(true);
      setClaimed(false);
    }
  }, [open, rewards]);

  const handleClaim = async () => {
    try {
      let totalCoinsAdded = 0;
      let claimedItems = [];
      
      // Process each reward separately based on type
      rewards.forEach(reward => {
        // Handle coin rewards specially - add to wallet instead of inventory
        if (reward.type === 'coins') {
          const { loadWalletBalance, saveWalletBalance } = require('@/utils/walletUtils');
          const savedUsername = localStorage.getItem('flappypi-username');
          const currentBalance = loadWalletBalance(savedUsername);
          const coinsToAdd = reward.quantity || 0;
          const newBalance = currentBalance + coinsToAdd;
          
          // Save updated wallet balance
          saveWalletBalance(newBalance, savedUsername);
          localStorage.setItem('flappypi-coins', newBalance.toString());
          totalCoinsAdded += coinsToAdd;
          
          // Dispatch wallet update event
          window.dispatchEvent(new CustomEvent('wallet-balance-updated', { 
            detail: { balance: newBalance, added: coinsToAdd } 
          }));
          
          console.log(`✅ Added ${coinsToAdd} coins to wallet. New balance: ${newBalance}`);
        } else {
          // For non-coin rewards (items, skins, powerups), save to inventory
          const itemToAdd = {
            id: reward.id,
            name: reward.name,
            type: reward.type,
            quantity: reward.quantity,
            rarity: reward.rarity,
            image: reward.image,
            description: reward.description
          };
          
          inventoryService.saveToInventory(itemToAdd);
          claimedItems.push(itemToAdd);
          
          console.log(`✅ Added ${reward.name} to inventory`);
        }
      });

      // Supabase sync: get user_id from localStorage (from user_profiles.uid or pi user)
      // Only sync items, not coins (coins are handled via wallet service)
      let user_id = null;
      try {
        const piUser = localStorage.getItem('flappypi-pi-user');
        if (piUser) {
          const parsed = JSON.parse(piUser);
          user_id = parsed.uid || parsed.user_id || parsed.username;
        }
      } catch {}

      if (user_id && claimedItems.length > 0) {
        try {
          await fetch('/api/inventory/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, items: claimedItems })
          });
          console.log(`✅ Synced ${claimedItems.length} item(s) to cloud`);
        } catch (err) {
          console.warn('Cloud sync failed for items:', err);
          // Don't show error toast - items already saved locally
        }
      }

      setClaimed(true);
      if (onClaim) onClaim();
      
      const itemCount = rewards.filter(r => r.type !== 'coins').length;
      const coinCount = rewards.filter(r => r.type === 'coins').reduce((sum, r) => sum + r.quantity, 0);
      
      // If there are coins, show the coin claim modal
      if (coinCount > 0) {
        setTotalCoinsToShow(coinCount);
        setClaimedItemsToShow(
          rewards
            .filter(r => r.type !== 'coins')
            .map(r => ({
              id: r.id,
              name: r.name,
              quantity: r.quantity,
              image: r.image,
              rarity: r.rarity
            }))
        );
        setShowCoinClaimModal(true);
      }
      
      // Show toast for non-coin claims only (coins get their own modal)
      if (itemCount > 0 && coinCount === 0) {
        let description = '';
        if (itemCount > 0) {
          description = `Successfully claimed ${itemCount} item(s)!`;
        }
        
        toast({
          title: 'Rewards Claimed! 🎉',
          description: description,
          duration: 3000
        });
      }
      
      setTimeout(() => {
        if (coinCount === 0) {
          // Only close if no coins to claim
          onClose();
          setShowRewards(false);
          setClaimed(false);
        }
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto relative">
        {/* Close (X) button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          style={{ lineHeight: 1 }}
        >
          ×
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {claimed ? '🎉 Rewards Claimed!' : '🎁 Subscription Rewards!'}
          </h2>
          <p className="text-gray-600">
            {claimed ? 'Your rewards have been added to your inventory!' : 'Here are your subscription rewards!'}
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
                    <ImageWithFallback
                      src={getRewardImage(reward)}
                      alt={reward.name}
                      className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-2 border border-gray-200"
                      fallbackSrc="/icons/icon-128x128.png"
                      lazy={true}
                      retryAttempts={2}
                      retryDelay={500}
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

      {/* Coin Claim Modal - Show when coins are claimed */}
      <CoinClaimModal
        isOpen={showCoinClaimModal}
        onClose={() => {
          setShowCoinClaimModal(false);
          onClose();
          setShowRewards(false);
          setClaimed(false);
        }}
        coins={totalCoinsToShow}
        itemsCount={claimedItemsToShow.length}
        claimedItems={claimedItemsToShow}
      />
    </div>
  );
};

export default RewardModal; 