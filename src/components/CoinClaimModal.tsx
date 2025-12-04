import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getItemImage } from '@/utils/itemImageMapping';
import ImageWithFallback from './ImageWithFallback';

interface CoinClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  itemsCount?: number;
  claimedItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    image?: string;
    rarity?: string;
  }>;
}

const CoinClaimModal: React.FC<CoinClaimModalProps> = ({
  isOpen,
  onClose,
  coins,
  itemsCount = 0,
  claimedItems = []
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setConfirmed(false);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setConfirmed(true);
    toast({
      title: 'Coins Claimed! 🎉',
      description: `${coins} coins have been added to your wallet!`,
      duration: 2000
    });

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleGoToWallet = () => {
    onClose();
    // Navigate or scroll to wallet section if needed
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
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

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {confirmed ? '🎉 Coins Claimed!' : '🪙 Claim Your Coins!'}
          </h2>
          <p className="text-gray-600">
            {confirmed
              ? 'Your coins have been added to your wallet!'
              : 'You have coins ready to claim!'}
          </p>
        </div>

        {/* Coin Display */}
        <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-6 mb-6 border-2 border-yellow-400 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <img src="/flappycoins.png" alt="Flappy Coins" className="w-12 h-12" />
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium">Coins to Claim</p>
              <p className="text-4xl font-bold text-yellow-600">{coins}</p>
            </div>
          </div>
        </div>

        {/* Items Claimed (if any) */}
        {itemsCount > 0 && (
          <div className="bg-purple-50 rounded-xl p-4 mb-6 border-2 border-purple-200">
            <p className="text-center font-semibold text-purple-900 mb-3">
              + {itemsCount} Item{itemsCount > 1 ? 's' : ''} Claimed
            </p>
            {claimedItems.length > 0 && (
              <div className="space-y-2">
                {claimedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-200"
                  >
                    <div className="flex items-center space-x-3">
                      <ImageWithFallback
                        src={item.image || getItemImage(item.id)}
                        alt={item.name}
                        className="w-8 h-8 rounded object-cover border border-gray-200"
                        fallbackSrc="/icons/icon-128x128.png"
                        lazy={true}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        {item.rarity && (
                          <p className="text-xs text-gray-600">{item.rarity}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-700">x{item.quantity}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary Text */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <p className="text-sm text-blue-900 text-center">
            <strong>Total Rewards:</strong> {coins} coins
            {itemsCount > 0 ? ` + ${itemsCount} item${itemsCount > 1 ? 's' : ''}` : ''}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {!confirmed ? (
            <>
              <button
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                💰 Claim {coins} Coins
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleGoToWallet}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
            >
              👛 View Wallet
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
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default CoinClaimModal;
