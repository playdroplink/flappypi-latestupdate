import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePiBrowserDetection } from '@/hooks/usePiBrowserDetection';
import { PiAuthUtils } from '@/utils/piAuthUtils';
import { realPiPaymentService } from '@/services/realPiPaymentService';
import { manualPaymentService } from '@/services/manualPaymentService';
import { inventoryService } from '@/services/inventoryService';
import DualPaymentModal from './DualPaymentModal';
import ManualPaymentModal from './ManualPaymentModal';
import RewardModal from './RewardModal';
import { shopItems } from '@/constants/shopItems';
import { subscriptionPlans } from '@/constants/subscriptionPlans';
import { PI_CONFIG } from '@/config/piConfig';
import { X, ShoppingCart, Crown, Zap, Heart, Star, QrCode, CreditCard, ArrowLeft } from 'lucide-react';

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  musicEnabled: boolean;
}

// Payment Confirmation Modal Component
const PaymentConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: any;
  paymentType: 'pi' | 'coins' | 'manual' | 'dual';
}> = ({ isOpen, onClose, onConfirm, item, paymentType }) => {
  if (!isOpen) return null;

  const getPaymentText = () => {
    if (paymentType === 'pi') {
      return `${item.piPrice} Pi`;
    } else {
      return `${item.flappyCoinPrice || item.coinPrice} Flappy Coins`;
    }
  };

  const getPaymentLabel = () => {
    if (paymentType === 'pi') {
      return 'Pi';
    } else {
      return 'FC';
    }
  };

  const getModalTitle = () => {
    if (paymentType === 'pi') {
      return 'Pi Payment';
    } else {
      return 'Flappy Coin Payment';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: paymentType === 'pi' ? '#8f38ff' : '#3b82f6' }}>
            {getModalTitle()}
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Item Image */}
        <div className="flex justify-center mb-4">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>

        {/* Confirmation Text */}
        <div className="text-center mb-6">
          <h4 className="text-lg font-semibold mb-2" style={{ color: paymentType === 'pi' ? '#8f38ff' : '#3b82f6' }}>
            Are you sure?
          </h4>
          <p className="text-gray-700">
            Are you sure you want to buy {item.name} for {getPaymentText()}?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1" style={{ borderColor: paymentType === 'pi' ? '#8f38ff' : '#3b82f6', color: paymentType === 'pi' ? '#8f38ff' : '#3b82f6', background: paymentType === 'pi' ? '#f3e8ff' : '#e0f2fe' }}
          >
            No
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1" style={{ background: paymentType === 'pi' ? '#8f38ff' : '#3b82f6', color: '#fff' }}
          >
            Yes
          </Button>
        </div>

        {/* Confirm Payment Button */}
        <Button
          onClick={onConfirm}
          className="w-full mb-3" style={{ background: paymentType === 'pi' ? '#8f38ff' : '#3b82f6', color: '#fff' }}
        >
          Confirm {paymentType === 'pi' ? 'Pi' : 'Flappy Coin'} Payment
        </Button>

        {/* Cancel Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

const ShopModal: React.FC<ShopModalProps> = ({ open, onClose, musicEnabled }) => {
  const [coins, setCoins] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentItem, setPaymentItem] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [showDualPaymentModal, setShowDualPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'pi' | 'coins' | 'manual' | 'dual'>('pi');
  const [showCoinRewardModal, setShowCoinRewardModal] = useState(false);
  const [coinRewards, setCoinRewards] = useState<any[]>([]);
  const { toast } = useToast();
  const { profile, isAuthenticated, updateProfile } = useUserProfile();
  const { isPiBrowser } = usePiBrowserDetection();

  // Remove authentication check - allow access without signing in
  // if (!isAuthenticated) {
  //   return null;
  // }

  useEffect(() => {
    if (open) {
      const savedCoins = parseInt(localStorage.getItem('flappypi-coins') || '0');
      setCoins(savedCoins);
      
      const savedOwnedSkins = JSON.parse(localStorage.getItem('flappypi-owned-skins') || '[]');
      setOwnedSkins(savedOwnedSkins);
      
      console.log('Shop modal opened with:', { savedCoins, savedOwnedSkins, open });
    }
  }, [open]);

  const isOwned = (skinId: string) => ownedSkins.includes(skinId);

  // Show payment confirmation modal
  const showPaymentConfirmation = (item: any, type: 'pi' | 'coins' | 'manual' | 'dual') => {
    console.log('showPaymentConfirmation called:', { item, type });
    setPaymentItem(item);
    setPaymentType(type);
    
    if (type === 'manual') {
      console.log('Opening manual payment modal');
      setShowManualPaymentModal(true);
    } else if (type === 'dual') {
      console.log('Opening dual payment modal');
      setShowDualPaymentModal(true);
    } else {
      console.log('Opening standard payment modal');
      setShowPaymentModal(true);
    }
  };

  // Handle confirmed payment
  const handleConfirmedPayment = async () => {
    if (!paymentItem) return;

    setShowPaymentModal(false);
    setIsProcessingPayment(true);

    try {
      if (paymentType === 'pi') {
        // Check if it's a subscription or skin purchase
        if (paymentItem.id === 'adfree' || paymentItem.id === 'allskins' || paymentItem.id === 'elite') {
          await handleSubscriptionPayment(paymentItem);
        } else {
          await handlePiPayment(paymentItem);
        }
      } else {
        await handleCoinPayment(paymentItem);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
      setPaymentItem(null);
    }
  };

  const handlePiPayment = async (item: any) => {
    // CRITICAL: Items are NOT delivered here anymore
    // realPiPaymentService.processSubscriptionPayment() handles:
    // 1. Payment creation via Pi SDK
    // 2. Payment verification (3-phase flow)
    // 3. Item delivery ONLY after verified completion
    // 4. Cancellation handling (no items delivered on cancel)

    toast({
      title: "Processing Pi Payment",
      description: `Processing payment for ${item.name}...`
    });

    try {
      // Process payment with realPiPaymentService
      // This handles the FULL payment lifecycle including verification
      const result = await realPiPaymentService.processSubscriptionPayment({
        id: item.id,
        name: item.name,
        price: item.piPrice.toString()
      });

      // Check if payment was successful AND verified
      if (result.success && result.deliveredItems && result.deliveredItems.length > 0) {
        // Payment was completed and verified - items were already delivered by realPiPaymentService
        
        // Update local UI state to reflect the owned items
        if (item.type === 'skin' || !item.type) {
          const newOwnedSkins = [...ownedSkins, item.id];
          setOwnedSkins(newOwnedSkins);
          localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));
        }

        // Refresh coins from localStorage in case they were updated
        const savedCoins = parseInt(localStorage.getItem('flappypi-coins') || '0');
        setCoins(savedCoins);

        toast({
          title: "Purchase Successful! 🎉",
          description: `${item.name} has been added to your collection.`,
        });
      } else {
        // Payment was not successfully completed or verified
        // NO items were delivered
        const errorMessage = result.error || "Payment was not completed. No items were delivered.";
        
        toast({
          title: "Payment Failed or Cancelled",
          description: errorMessage,
          variant: "destructive"
        });

        console.log('❌ [Shop] Payment not completed:', {
          success: result.success,
          hasDeliveredItems: result.deliveredItems && result.deliveredItems.length > 0,
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive"
      });
    }
  };

  const handleCoinPayment = async (item: any) => {
    // CRITICAL: Verify coin balance before deducting coins
    // This prevents giving items without proper payment
    
    const coinPrice = item.flappyCoinPrice || item.coinPrice;
    
    if (coins < coinPrice) {
      toast({
        title: "Insufficient Coins",
        description: "You need more coins to purchase this item.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Step 1: Deduct coins from user balance (atomic operation)
      const newCoins = coins - coinPrice;
      setCoins(newCoins);
      localStorage.setItem('flappypi-coins', newCoins.toString());
      
      console.log('💰 [Shop-Coins] Coins deducted:', { 
        previous: coins, 
        deducted: coinPrice, 
        remaining: newCoins,
        itemId: item.id 
      });

      // Step 2: Add item to inventory ONLY after coin deduction
      // If the purchased item is Flappy Coins, show claim modal instead of direct wallet update
      if (item.type === 'coins') {
        const claimedAmount = item.amount || item.quantity || 0;
        
        // Show reward modal for coin claim
        setCoinRewards([{
          id: item.id,
          name: item.name,
          type: 'coins',
          quantity: claimedAmount,
          rarity: 'Common',
          image: item.image,
          description: item.description || 'Flappy Coins'
        }]);
        setShowCoinRewardModal(true);
        return;
      }

      // For other items, add to inventory after coin deduction is confirmed
      const inventoryItem = {
        id: item.id,
        name: item.name,
        type: item.type || 'skin',
        image: item.image,
        description: item.description,
        rarity: item.rarity,
        quantity: 1,
        equipped: item.type === 'powerup' ? true : false
      };

      // Save to inventory service - ONLY AFTER coins are deducted
      inventoryService.saveToInventory(inventoryItem);

      // Update localStorage ownership arrays
      const newOwnedSkins = [...ownedSkins, item.id];
      setOwnedSkins(newOwnedSkins);
      localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));

      // Dispatch event for powerup purchase to sync game equipment
      if (inventoryItem.type === 'powerup') {
        console.log('🛍️ [Shop-Coins] Dispatching power-up-purchased event for:', item.id);
        window.dispatchEvent(new CustomEvent('power-up-purchased', {
          detail: {
            powerUpId: item.id,
            name: item.name,
            quantity: 1,
            purchasedAt: new Date().toISOString()
          }
        }));
        console.log('✅ [Shop-Coins] power-up-purchased event dispatched');
      }

      // Dispatch inventory update event
      console.log('🛍️ [Shop-Coins] Dispatching inventory-updated event for:', item.id);
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: {
          itemId: item.id,
          type: inventoryItem.type,
          action: 'purchased'
        }
      }));
      console.log('✅ [Shop-Coins] inventory-updated event dispatched');

      toast({
        title: "Purchase Successful! 🎉",
        description: `${item.name} has been added to your collection.`
      });

      // Log transaction for audit trail
      const transactions = JSON.parse(localStorage.getItem('flappypi-transactions') || '[]');
      transactions.push({
        id: `tx_${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        type: item.type || 'skin',
        coinPrice: coinPrice,
        quantity: 1,
        timestamp: Date.now(),
        status: 'completed',
        paymentMethod: 'coins'
      });
      localStorage.setItem('flappypi-transactions', JSON.stringify(transactions));

    } catch (error) {
      console.error('❌ Coin payment error:', error);
      
      // Restore coins if transaction failed
      setCoins(coins);
      localStorage.setItem('flappypi-coins', coins.toString());
      
      toast({
        title: "Purchase Failed",
        description: "An error occurred. Coins have been restored.",
        variant: "destructive"
      });
    }
  };

  const handleSubscriptionPayment = async (item: any) => {
    // CRITICAL: Wait for full payment verification before activating subscription
    // realPiPaymentService.processSubscriptionPayment handles:
    // 1. Payment creation via Pi SDK (3-phase flow)
    // 2. Payment verification with backend
    // 3. Subscription delivery ONLY after verified completion
    // 4. Cancellation handling (no subscription given on cancel/failure)

    toast({
      title: "Processing Pi Payment",
      description: `Processing ${item.name} purchase...`
    });

    try {
      const result = await realPiPaymentService.processSubscriptionPayment({
        id: item.id,
        name: item.name,
        price: item.piPrice.toString()
      });
      
      // Check if payment was successful AND subscription was delivered
      if (result.success && result.deliveredItems && result.deliveredItems.length > 0) {
        // Subscription was activated by realPiPaymentService
        let description = '';
        if (item.id === 'adfree') {
          description = "You now have 7 days of ad-free gaming.";
        } else if (item.id === 'allskins') {
          description = "You now have access to all skins for 15 days.";
        } else if (item.id === 'elite') {
          description = "You now have 30 days of Elite benefits.";
        }

        // Refresh coins from localStorage in case they were updated
        const savedCoins = parseInt(localStorage.getItem('flappypi-coins') || '0');
        setCoins(savedCoins);

        toast({
          title: `${item.name} Active! 🎉`,
          description: description
        });
      } else {
        // Payment was not completed or subscription was not delivered
        const errorMessage = result.error || "Payment failed or was cancelled. Subscription not activated.";
        
        toast({
          title: "Payment Failed or Cancelled",
          description: errorMessage,
          variant: "destructive"
        });

        console.log('❌ [Shop] Subscription payment not completed:', {
          success: result.success,
          hasDeliveredItems: result.deliveredItems && result.deliveredItems.length > 0,
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Subscription payment error:', error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive"
      });
    }
  };

  const handleBuyWithPi = async (item: any) => {
    showPaymentConfirmation(item, 'pi');
  };

  const handleCoinPurchase = async (skin: any) => {
    showPaymentConfirmation(skin, 'coins');
  };

  const handlePurchaseAdFree = async () => {
    const subscriptionItem = {
      id: 'adfree',
      name: 'Ad-Free Gaming',
      piPrice: 5,
      description: 'Remove all ads for 7 days',
      image: '/images/adfree-icon.png'
    };
    showPaymentConfirmation(subscriptionItem, 'pi');
  };

  const handlePurchaseAllSkins = async () => {
    const subscriptionItem = {
      id: 'allskins',
      name: 'All Skins Access',
      piPrice: 15,
      description: 'Unlock all skins for 15 days',
      image: '/images/allskins-icon.png'
    };
    showPaymentConfirmation(subscriptionItem, 'pi');
  };

  const handlePurchaseElite = async () => {
    const subscriptionItem = {
      id: 'elite',
      name: 'Elite Membership',
      piPrice: 30,
      description: 'All benefits for 30 days',
      image: '/images/elite-icon.png'
    };
    showPaymentConfirmation(subscriptionItem, 'pi');
  };

  const handlePurchaseSkin = async (skin: any) => {
    // Use the same payment confirmation flow as other items
    // This ensures ALL Pi payments use the same processSubscriptionPayment API
    showPaymentConfirmation(skin, 'pi');
  };

  // Manual payment handlers
  const handleManualPaymentSuccess = (transaction: any) => {
    console.log('🛍️ [Shop-Manual] Manual payment success:', transaction);
    if (paymentItem) {
      // Add item to inventory using proper inventory service
      const inventoryItem = {
        id: paymentItem.id,
        name: paymentItem.name,
        type: paymentItem.type || 'skin',
        image: paymentItem.image, // Use the GIF image from shop items
        description: paymentItem.description,
        rarity: paymentItem.rarity,
        quantity: 1,
        equipped: paymentItem.type === 'powerup' ? true : false
      };

      // Save to inventory service
      console.log('🛍️ [Shop-Manual] Saving to inventory:', inventoryItem);
      inventoryService.saveToInventory(inventoryItem);

      // Also keep in ownedSkins for backwards compatibility
      const newOwnedSkins = [...ownedSkins, paymentItem.id];
      setOwnedSkins(newOwnedSkins);
      localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));

      // Dispatch event for powerup purchase to sync game equipment
      if (inventoryItem.type === 'powerup') {
        console.log('🛍️ [Shop-Manual] Dispatching power-up-purchased for:', paymentItem.id);
        window.dispatchEvent(new CustomEvent('power-up-purchased', {
          detail: {
            powerUpId: paymentItem.id,
            name: paymentItem.name,
            quantity: 1,
            purchasedAt: new Date().toISOString()
          }
        }));
      }

      // Dispatch inventory update event
      console.log('🛍️ [Shop-Manual] Dispatching inventory-updated');
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: {
          itemId: paymentItem.id,
          type: inventoryItem.type,
          action: 'purchased'
        }
      }));
      
      toast({
        title: "Manual Payment Successful! 🎉",
        description: `${paymentItem.name} has been added to your collection.`,
      });
    }
    
    setShowManualPaymentModal(false);
    setPaymentItem(null);
  };

  const handleManualPaymentError = (error: string) => {
    toast({
      title: "Manual Payment Failed",
      description: error,
      variant: "destructive"
    });
    
    setShowManualPaymentModal(false);
    setPaymentItem(null);
  };

  const handleDualPaymentSuccess = (transaction: any) => {
    // Handle successful dual payment
    console.log('Dual payment successful:', transaction);
    
    if (paymentItem) {
      // Add item to inventory using proper inventory service
      const inventoryItem = {
        id: paymentItem.id,
        name: paymentItem.name,
        type: paymentItem.type || 'skin',
        image: paymentItem.image, // Use the GIF image from shop items
        description: paymentItem.description,
        rarity: paymentItem.rarity,
        quantity: 1,
        equipped: paymentItem.type === 'powerup' ? true : false
      };

      // Save to inventory service
      inventoryService.saveToInventory(inventoryItem);

      // Add to owned skins if it's not already there
      if (!ownedSkins.includes(paymentItem.id)) {
        const newOwnedSkins = [...ownedSkins, paymentItem.id];
        setOwnedSkins(newOwnedSkins);
        localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));
      }

      // Dispatch event for powerup purchase to sync game equipment
      if (inventoryItem.type === 'powerup') {
        window.dispatchEvent(new CustomEvent('power-up-purchased', {
          detail: {
            powerUpId: paymentItem.id,
            name: paymentItem.name,
            quantity: 1,
            purchasedAt: new Date().toISOString()
          }
        }));
      }

      // Dispatch inventory update event
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: {
          itemId: paymentItem.id,
          type: inventoryItem.type,
          action: 'purchased'
        }
      }));
    }
    
    // Show success message
    toast({
      title: "Purchase Successful! 🎉",
      description: `${paymentItem?.name} has been unlocked!`
    });
    
    setShowDualPaymentModal(false);
    setPaymentItem(null);
  };

  const handleDualPaymentError = (error: string) => {
    console.error('Dual payment error:', error);
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const getShopItemsWithOwnership = () => {
    return shopItems.map(item => ({
      ...item,
      isOwned: isOwned(item.id)
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <ShoppingCart className="w-6 h-6" style={{ color: '#3b82f6' }} />
            <h2 className="text-2xl font-bold text-gray-900">
              Shop
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                MAINNET
              </span>
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#e0f2fe' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#3b82f6' }}>Your Balance</p>
                <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>{coins.toLocaleString()} Coins</p>
              </div>
                             <div className="text-right">
                 <p className="text-sm" style={{ color: '#3b82f6' }}>
                   {PI_CONFIG.isSandbox() ? 'Sandbox Mode' : 'Pi Browser'}
                 </p>
                 <Badge variant={PI_CONFIG.isSandbox() ? "default" : (isPiBrowser ? "default" : "destructive")}>
                   {PI_CONFIG.isSandbox() ? "Testing" : (isPiBrowser ? "Available" : "Required")}
                 </Badge>
               </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Premium Subscriptions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ad-Free */}
              <Card style={{ border: '2px solid #3b82f6' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" style={{ color: '#3b82f6' }} />
                    Ad-Free Gaming
                  </CardTitle>
                  <CardDescription>Remove all ads for 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4" style={{ color: '#3b82f6' }}>5 Pi</div>
                  <div className="space-y-2">
                    <Button 
                      onClick={handlePurchaseAdFree}
                      disabled={isProcessingPayment || !isPiBrowser}
                      className="w-full" style={{ background: '#3b82f6', color: '#fff' }}
                    >
                      {isProcessingPayment ? "Processing..." : "Buy with Pi"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* All Skins */}
              <Card style={{ border: '2px solid #8f38ff' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: '#8f38ff' }} />
                    All Skins Access
                  </CardTitle>
                  <CardDescription>Unlock all skins for 15 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4" style={{ color: '#8f38ff' }}>15 Pi</div>
                  <div className="space-y-2">
                    <Button 
                      onClick={handlePurchaseAllSkins}
                      disabled={isProcessingPayment}
                      className="w-full" style={{ background: '#8f38ff', color: '#fff' }}
                    >
                      {isProcessingPayment ? "Processing..." : "Buy with Pi"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Elite */}
              <Card className="border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    Elite Membership
                  </CardTitle>
                  <CardDescription>All benefits for 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 mb-4">30 Pi</div>
                  <div className="space-y-2">
                    <Button 
                      onClick={handlePurchaseElite}
                      disabled={isProcessingPayment}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isProcessingPayment ? "Processing..." : "Buy with Pi"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Individual Skins */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Bird Skins
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getShopItemsWithOwnership().filter(item => item.type === 'skin').map((item) => (
                <Card key={item.id} className={`relative ${item.isOwned ? 'border-green-300 bg-green-50' : 'hover:shadow-lg'} transition-all`}>
                  <CardHeader className="pb-2">
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {item.isOwned && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-sm">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">{item.flappyCoinPrice} Coins</span>
                      <span className="text-sm font-semibold" style={{ color: '#3b82f6' }}>{item.piPrice} Pi</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleCoinPurchase(item)}
                          disabled={coins < item.flappyCoinPrice || item.isOwned}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          {item.isOwned ? "Owned" : "Buy Coins"}
                        </Button>
                        <Button 
                          onClick={() => handleBuyWithPi(item)}
                          disabled={isProcessingPayment || item.isOwned}
                          size="sm"
                          className="flex-1" style={{ background: '#3b82f6', color: '#fff' }}
                        >
                          {item.isOwned ? "Owned" : "Buy Pi"}
                        </Button>
                      </div>
                      <Button 
                        onClick={() => showPaymentConfirmation(item, 'manual')}
                        disabled={item.isOwned}
                        size="sm"
                        variant="outline"
                        className="w-full" style={{ background: '#22c55e', color: '#fff', border: '2px solid #22c55e' }}
                      >
                        <QrCode className="w-3 h-3 mr-1" />
                        {item.isOwned ? "Owned" : "Manual Payment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmedPayment}
        item={paymentItem}
        paymentType={paymentType}
      />
      <ManualPaymentModal
        isOpen={showManualPaymentModal}
        onClose={() => setShowManualPaymentModal(false)}
        item={paymentItem}
        onPaymentSuccess={handleManualPaymentSuccess}
        onPaymentError={handleManualPaymentError}
      />
      

      <DualPaymentModal
        isOpen={showDualPaymentModal}
        onClose={() => setShowDualPaymentModal(false)}
        item={{
          id: paymentItem?.id || 'item',
          name: paymentItem?.name || 'Item',
          description: paymentItem?.description,
          piPrice: paymentItem?.piPrice || 0,
          image: paymentItem?.image
        }}
        onPaymentSuccess={handleDualPaymentSuccess}
        onPaymentError={handleDualPaymentError}
      />

      {/* Coin Rewards Modal - For Flappy Coins section claims */}
      <RewardModal
        open={showCoinRewardModal}
        onClose={() => {
          setShowCoinRewardModal(false);
          // Reload wallet balance after coin claim
          const savedCoins = parseInt(localStorage.getItem('flappypi-coins') || '0');
          setCoins(savedCoins);
        }}
        rewards={coinRewards}
        onClaim={() => {
          // Reload wallet balance after coin claim
          const savedCoins = parseInt(localStorage.getItem('flappypi-coins') || '0');
          setCoins(savedCoins);
        }}
      />
    </div>
  );
};

export default ShopModal;
