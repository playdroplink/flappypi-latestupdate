import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { inventoryService, InventoryItem } from '@/services/inventoryService';
import { useNavigate } from 'react-router-dom';
import { getItemImage } from '@/utils/itemImageMapping';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';

interface ItemReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    type: 'skin' | 'powerup' | 'subscription' | 'mystery-box' | 'bundle';
    quantity: number;
    rarity?: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary';
    image?: string;
    description?: string;
    price: number;
    currency: 'pi' | 'coins';
  } | null;
}

const ItemReceiveModal: React.FC<ItemReceiveModalProps> = ({ isOpen, onClose, item }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [claimed, setClaimed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setShowConfetti(true);
      setClaimed(false);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen, item]);

  const handleClaim = async () => {
    if (!item) return;
    try {
      inventoryService.saveToInventory({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        rarity: item.rarity,
        image: item.image,
        description: item.description
      });
      setClaimed(true);
      toast({
        title: 'Item Claimed! 🎉',
        description: `${item.name} has been added to your inventory!`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Claim Failed',
        description: 'Failed to claim the item. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleGoToInventory = () => {
    onClose();
    navigate('/inventory');
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-600 bg-gray-100';
      case 'Rare': return 'text-blue-600 bg-blue-100';
      case 'Epic': return 'text-purple-600 bg-purple-100';
      case 'Special': return 'text-pink-600 bg-pink-100';
      case 'Legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'Common': return '⭐';
      case 'Rare': return '⭐⭐';
      case 'Epic': return '⭐⭐⭐';
      case 'Special': return '⭐⭐⭐⭐';
      case 'Legendary': return '⭐⭐⭐⭐⭐';
      default: return '⭐';
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              >
                {['🎉', '🎊', '✨', '💫', '🌟'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {claimed ? '🎉 Item Claimed!' : '🎁 You Got a New Item!'}
          </h2>
          <p className="text-gray-600">
            {claimed ? 'Your item has been added to your inventory!' : 'Here is your reward from the shop!'}
          </p>
        </div>
        <div className="space-y-4 mb-6">
          <div className={`p-4 rounded-xl border-2 ${getRarityColor(item.rarity)} transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={getBirdImageSrc(item)}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className="text-sm">{getRarityIcon(item.rarity)}</span>
                </div>
                <p className="text-sm opacity-75 mb-2">{item.description || `${item.type} item`}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  <span className="text-sm font-medium">
                    Quantity: {item.quantity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {!claimed ? (
            <button
              onClick={handleClaim}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              🎉 Claim
            </button>
          ) : (
            <button
              onClick={handleGoToInventory}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-200"
            >
              📦 Go to Inventory
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
    </div>
  );
};

export default ItemReceiveModal; 