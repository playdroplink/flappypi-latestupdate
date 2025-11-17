import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Zap, X, Calendar, Infinity } from 'lucide-react';

interface AdFreeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => Promise<boolean>;
  isAdFree: boolean;
  adFreeTimeRemaining: { days: number; hours: number } | null;
}

const AdFreeSubscriptionModal: React.FC<AdFreeSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  isAdFree,
  adFreeTimeRemaining
}) => {
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const success = await onPurchase();
      if (success) {
        onClose();
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 p-0 bg-transparent shadow-none">
        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-2xl border border-purple-300">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Crown className="h-8 w-8 text-yellow-300" />
              <span className="text-2xl font-bold">Pi Premium</span>
            </div>
            <div className="text-sm text-purple-100">
              🚀 Unlimited Gaming Experience 🚀
            </div>
          </div>

          {isAdFree ? (
            /* Current subscription status */
            <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-xl font-bold mb-2">Premium Active!</h3>
              <p className="text-purple-100 text-sm mb-4">
                You're enjoying ad-free gaming right now!
              </p>
              
              {adFreeTimeRemaining && (
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Calendar className="h-4 w-4 text-yellow-300" />
                    <span className="font-semibold text-sm">Time Remaining</span>
                  </div>
                  <p className="text-white text-lg font-bold">
                    {adFreeTimeRemaining.days}d {adFreeTimeRemaining.hours}h
                  </p>
                </div>
              )}
              
              <div className="mt-4 space-y-2 text-sm text-left">
                <div className="flex items-center space-x-2">
                  <Infinity className="h-4 w-4 text-green-300" />
                  <span>Continue games unlimited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-300" />
                  <span>No mandatory ads</span>
                </div>
              </div>
            </div>
          ) : (
            /* Purchase offer */
            <>
              <div className="bg-white/10 rounded-xl p-6 mb-6 text-center border border-white/20">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold mb-2">Go Ad-Free!</h3>
                <p className="text-purple-100 text-sm mb-4 leading-relaxed">
                  Remove all mandatory ads and continue games unlimited for just 10 Pi!
                </p>
                
                {/* Features */}
                <div className="space-y-3 text-sm text-left">
                  <div className="flex items-center space-x-3">
                    <Infinity className="h-5 w-5 text-green-300" />
                    <span>Continue games unlimited without watching ads</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-green-300" />
                    <span>No mandatory ads every 2 games</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-300" />
                    <span>Full month access (30 days)</span>
                  </div>
                </div>
                
                {/* Price box */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-4 mt-4 text-gray-900">
                  <div className="text-2xl font-bold">10 Pi</div>
                  <div className="text-sm font-semibold">One Month Premium</div>
                </div>
              </div>

              {/* Purchase button */}
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 border-0 rounded-xl py-3 font-bold text-base"
              >
                {isPurchasing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5" />
                    <span>💎 Purchase with Pi</span>
                  </div>
                )}
              </Button>

              {/* Dual Payment Option */}

              <div className="text-center mt-4">
                <p className="text-xs text-purple-200">
                  🌟 Support the game and Pi Network ecosystem
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdFreeSubscriptionModal;
