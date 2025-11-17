import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Play, Zap, Gift, CreditCard } from 'lucide-react';
import { usePiPayments } from '@/hooks/usePiPayments';
import { inventoryService } from '@/services/inventoryService';
import DualPaymentModal from './DualPaymentModal';
import { DualPaymentTransaction } from '@/services/dualPaymentService';

interface PaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  piPrice: number;
  coinPrice: number;
  onPayWithPi: () => void;
  onPayWithCoins: () => void;
  onWatchAd: () => void;
  userCoins: number;
  itemDescription?: string;
  skinId?: string;
  isSubscription?: boolean;
  itemImage?: string;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemDescription,
  piPrice,
  coinPrice,
  onPayWithPi,
  onPayWithCoins,
  onWatchAd,
  userCoins,
  skinId,
  isSubscription = false,
  itemImage,
}) => {
  const { isPiAvailable } = usePiPayments();
  const canAffordCoins = userCoins >= coinPrice;
  const [showDualPayment, setShowDualPayment] = useState(false);

  const handleDualPaymentSuccess = (transaction: DualPaymentTransaction) => {
    // Handle successful payment
    console.log('Dual payment successful:', transaction);
    onPayWithPi(); // Trigger the same success flow as Pi payment
    setShowDualPayment(false);
  };

  const handleDualPaymentError = (error: string) => {
    console.error('Dual payment error:', error);
    // Handle payment error
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full bg-white/60 backdrop-blur-lg border border-gray-200 shadow-2xl rounded-2xl p-0 animate-fade-in relative overflow-hidden">
          {/* Glassy animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-purple-100/40 to-blue-100/40 pointer-events-none z-0" style={{filter:'blur(2px)'}} />
          <div className="relative z-10 p-6">
            {/* Item image and name */}
            <div className="flex flex-col items-center mb-4">
              {itemImage && (
                <img src={itemImage} alt={itemName} className="w-20 h-20 rounded-xl shadow-lg mb-2 animate-bounce-slow bg-white/80" />
              )}
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-extrabold text-purple-700 drop-shadow-sm mb-1 animate-fade-in">
                  Purchase {itemName}
                </DialogTitle>
                {itemDescription && <p className="text-center text-gray-600 text-sm mb-2 animate-fade-in-slow">{itemDescription}</p>}
              </DialogHeader>
            </div>

            <div className="space-y-5 mt-2">
              {/* Enhanced Pi Payment Options */}
              <Card className="p-4 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 shadow-md animate-fade-in-slow"> 
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500 rounded-full">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pay with Pi</h3>
                      <p className="text-sm text-gray-600">Multiple payment options</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-600">{piPrice} Pi</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Pi SDK Payment */}
                  <Button 
                    onClick={onPayWithPi}
                    disabled={!isPiAvailable}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-500 text-white font-extrabold py-3 rounded-lg shadow-md transition-all duration-200 text-lg hover:scale-105 hover:from-yellow-500 hover:to-purple-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <img src="/pi-logo.png" alt="Pi" className="h-6 w-6 mr-2 inline-block align-middle" />
                    Pi SDK Payment
                  </Button>

                  {/* Dual Payment Option */}
                  <Button 
                    onClick={() => setShowDualPayment(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <CreditCard className="w-5 h-5" />
                    Choose Payment Method
                  </Button>
                </div>

                {!isPiAvailable && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Pi Network is not available on this platform or browser.
                  </p>
                )}
              </Card>

              {/* Coin Payment */}
              <Card className={`p-4 border-2 ${canAffordCoins ? 'border-blue-200 bg-gradient-to-r from-blue-50/80 to-cyan-50/80' : 'border-gray-200 bg-gray-50/80 opacity-60'} shadow-md animate-fade-in-slow`}> 
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${canAffordCoins ? 'bg-blue-500' : 'bg-gray-400'}`}>
                      <img src="/flappycoins.png" alt="Flappy Coin" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Pay with Coins</h3>
                      <p className="text-sm text-gray-600">
                        You have: {userCoins.toLocaleString()} coins
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${canAffordCoins ? 'text-blue-600' : 'text-gray-500'}`}>
                      {coinPrice.toLocaleString()} coins
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={onPayWithCoins}
                  disabled={!canAffordCoins}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-400 text-white font-extrabold text-lg rounded-2xl shadow-lg py-3 transition-all duration-200 hover:scale-105 hover:from-yellow-400 hover:to-orange-500 active:scale-95 min-h-[56px] ${!canAffordCoins ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <img src="/flappycoins.png" alt="Flappy Coin" className="h-6 w-6 mr-2 inline-block align-middle" />
                  {canAffordCoins ? 'Pay with Coins' : 'Not Enough Coins'}
                </Button>
              </Card>

              {/* Watch Ad Option */}
              <Card className="p-4 border-2 border-green-200 bg-gradient-to-r from-green-50/80 to-emerald-50/80 shadow-md animate-fade-in-slow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-full">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Watch Ad</h3>
                      <p className="text-sm text-gray-600">Get 24h trial access</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">FREE</p>
                  </div>
                </div>
                <Button 
                  onClick={onWatchAd}
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Watch Ad for Trial
                </Button>
              </Card>
            </div>

            <div className="mt-6 p-3 bg-gray-50/80 rounded-lg animate-fade-in-slow">
              <p className="text-xs text-gray-600 text-center">
                Pi payments support the Pi Network ecosystem and provide permanent access.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dual Payment Modal */}
      <DualPaymentModal
        isOpen={showDualPayment}
        onClose={() => setShowDualPayment(false)}
        item={{
          id: skinId || 'item',
          name: itemName,
          description: itemDescription,
          piPrice: piPrice,
          image: itemImage
        }}
        onPaymentSuccess={handleDualPaymentSuccess}
        onPaymentError={handleDualPaymentError}
      />
    </>
  );
};

export default PaymentOptionsModal;
