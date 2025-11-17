// Pi Payment Modal Component
// Handles all Pi Network mainnet payments for subscriptions and shop items

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, CreditCard, Star, Zap, Crown, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { piMainnetWalletService, PaymentOrder, SubscriptionPlan, ShopItem } from '@/services/piMainnetWalletService';
import { piAuth } from '@/config/piAuth';

interface PiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'subscription' | 'shop_item';
  itemId: string;
  onPaymentComplete?: (order: PaymentOrder) => void;
}

const PiPaymentModal: React.FC<PiPaymentModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  onPaymentComplete
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'completed' | 'error'>('select');
  const [selectedItem, setSelectedItem] = useState<SubscriptionPlan | ShopItem | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadItemDetails();
      loadWalletBalance();
    }
  }, [isOpen, itemType, itemId]);

  const loadItemDetails = () => {
    let item: SubscriptionPlan | ShopItem | null = null;
    
    if (itemType === 'subscription') {
      const plans = piMainnetWalletService.getSubscriptionPlans();
      item = plans.find(plan => plan.id === itemId) || null;
    } else if (itemType === 'shop_item') {
      const items = piMainnetWalletService.getShopItems();
      item = items.find(shopItem => shopItem.id === itemId) || null;
    }
    
    setSelectedItem(item);
  };

  const loadWalletBalance = async () => {
    try {
      await piMainnetWalletService.refreshWalletBalance();
      const balance = piMainnetWalletService.getWalletBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    setPaymentStep('processing');
    setError(null);

    try {
      // Check if user is authenticated
      if (!piAuth.isUserAuthenticated()) {
        throw new Error('Please authenticate with Pi Network first');
      }

      const currentUser = piAuth.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Check wallet balance
      if (walletBalance < selectedItem.price) {
        throw new Error('Insufficient Pi balance');
      }

      // Create payment order
      const order = await piMainnetWalletService.createPaymentOrder(
        currentUser.uid,
        itemType,
        selectedItem.id,
        selectedItem.name,
        selectedItem.price,
        getItemMetadata(selectedItem)
      );

      setCurrentOrder(order);

      // Process payment
      const paymentResult = await piMainnetWalletService.processPayment(order.orderId);

      if (paymentResult.success) {
        setPaymentStep('completed');
        toast({
          title: 'Payment Successful!',
          description: `Your ${selectedItem.name} has been purchased successfully.`,
          variant: 'default',
        });

        if (onPaymentComplete) {
          onPaymentComplete(order);
        }
      } else {
        setPaymentStep('error');
        setError(paymentResult.error || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: paymentResult.error || 'Payment could not be completed.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setPaymentStep('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getItemMetadata = (item: SubscriptionPlan | ShopItem) => {
    if (itemType === 'subscription') {
      const plan = item as SubscriptionPlan;
      return {
        planType: plan.category,
        duration: plan.duration,
        features: plan.features
      };
    } else {
      const shopItem = item as ShopItem;
      return {
        itemCategory: shopItem.category,
        quantity: shopItem.quantity || 1,
        rarity: shopItem.rarity
      };
    }
  };

  const getItemIcon = (item: SubscriptionPlan | ShopItem) => {
    if (itemType === 'subscription') {
      const plan = item as SubscriptionPlan;
      switch (plan.category) {
        case 'premium': return <Star className="w-6 h-6 text-yellow-500" />;
        case 'pro': return <Zap className="w-6 h-6 text-blue-500" />;
        case 'ultimate': return <Crown className="w-6 h-6 text-purple-500" />;
        default: return <Star className="w-6 h-6 text-gray-500" />;
      }
    } else {
      return <Gift className="w-6 h-6 text-green-500" />;
    }
  };

  const renderSelectStep = () => (
    <div className="space-y-4">
      {selectedItem ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getItemIcon(selectedItem)}
              {selectedItem.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{selectedItem.description}</p>
            
            {itemType === 'subscription' && (
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {(selectedItem as SubscriptionPlan).features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {selectedItem.price} π
                </span>
                {itemType === 'subscription' && (selectedItem as SubscriptionPlan).discount && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {(selectedItem as SubscriptionPlan).discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Your Pi Balance:</span>
                <span className="font-medium">{walletBalance.toFixed(4)} π</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>After Payment:</span>
                <span className="font-medium">
                  {(walletBalance - selectedItem.price).toFixed(4)} π
                </span>
              </div>
            </div>

            {walletBalance < selectedItem.price && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  Insufficient Pi balance. You need {selectedItem.price} π but only have {walletBalance.toFixed(4)} π.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Item not found</p>
        </div>
      )}
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8 space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
      <div>
        <h3 className="text-lg font-medium">Processing Payment</h3>
        <p className="text-gray-600">Please wait while we process your payment...</p>
      </div>
      {currentOrder && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Order ID: {currentOrder.orderId}
          </p>
        </div>
      )}
    </div>
  );

  const renderCompletedStep = () => (
    <div className="text-center py-8 space-y-4">
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
      <div>
        <h3 className="text-lg font-medium text-green-800">Payment Successful!</h3>
        <p className="text-gray-600">
          Your {selectedItem?.name} has been purchased and will be delivered shortly.
        </p>
      </div>
      {currentOrder && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            Transaction ID: {currentOrder.txid || 'Processing...'}
          </p>
        </div>
      )}
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center py-8 space-y-4">
      <XCircle className="w-12 h-12 text-red-500 mx-auto" />
      <div>
        <h3 className="text-lg font-medium text-red-800">Payment Failed</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  const renderFooter = () => {
    switch (paymentStep) {
      case 'select':
        return (
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={!selectedItem || walletBalance < (selectedItem?.price || 0)}
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay {selectedItem?.price} π
            </Button>
          </div>
        );
      case 'processing':
        return (
          <Button disabled className="w-full">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </Button>
        );
      case 'completed':
        return (
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        );
      case 'error':
        return (
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={() => setPaymentStep('select')} className="flex-1">
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentStep === 'select' && 'Purchase with Pi'}
            {paymentStep === 'processing' && 'Processing Payment'}
            {paymentStep === 'completed' && 'Payment Complete'}
            {paymentStep === 'error' && 'Payment Failed'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {paymentStep === 'select' && renderSelectStep()}
          {paymentStep === 'processing' && renderProcessingStep()}
          {paymentStep === 'completed' && renderCompletedStep()}
          {paymentStep === 'error' && renderErrorStep()}
        </div>

        <div className="mt-6">
          {renderFooter()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PiPaymentModal;
