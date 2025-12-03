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
import { shopItems } from '@/constants/shopItems';
import { subscriptionPlans } from '@/constants/subscriptionPlans';
import { PI_CONFIG } from '@/config/piConfig';
import { X, ShoppingCart, Crown, Zap, Heart, Star, QrCode, CreditCard } from 'lucide-react';

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

    // REMOVED: Authentication requirement - allow purchases without signing in

    toast({
      title: "Processing Pi Payment",
      description: `Processing payment for ${item.name}...`
    });

    try {
      // Use the same API call structure as subscription payments (plan payments)
      const result = await realPiPaymentService.processSubscriptionPayment({
        id: item.id,
        name: item.name,
        price: item.piPrice.toString()
      });

      if (result.success) {
        // If the purchased item is a Flappy Coin pack, add coins to wallet and show claim modal
        if (item.type === 'coins') {
          const walletCoins = parseInt(localStorage.getItem('flappypi-coins') || '0');
          let claimedAmount = 0;
          if (item.amount) {
            claimedAmount = item.amount;
          } else if (item.fcAmount) {
            claimedAmount = item.fcAmount;
          } else if (item.flappyCoinPrice) {
            claimedAmount = item.flappyCoinPrice;
          } else if (item.coinAmount) {
            claimedAmount = item.coinAmount;
          } else if (item.quantity) {
            claimedAmount = item.quantity;
          }
          // Fallback: try to parse from name (e.g., "FC500")
          if (!claimedAmount && item.name) {
            const match = item.name.match(/FC(\d+)/);
            if (match) claimedAmount = parseInt(match[1], 10);
          }
          // Fallback: try to parse from description
          if (!claimedAmount && item.description) {
            const match = item.description.match(/FC(\d+)/);
            if (match) claimedAmount = parseInt(match[1], 10);
          }
          const updatedWalletCoins = walletCoins + claimedAmount;
          setCoins(updatedWalletCoins);
          localStorage.setItem('flappypi-coins', updatedWalletCoins.toString());
          toast({
            title: "Coins Claimed! \ud83d\udcb0",
            description: `${claimedAmount} Flappy Coins have been added to your wallet.`
          });
          return;
        }

        // Build inventory item for all other types
        let itemType = item.type;
        if (!itemType) {
          if (["shield","magnet","extra_life","coin_multiplier","turbo_start"].includes(item.id)) {
            itemType = "powerup";
          } else {
            itemType = "skin";
          }
        }
        const inventoryItem = {
          id: item.id,
          name: item.name,
          type: itemType,
          image: item.image,
          description: item.description,
          rarity: item.rarity,
          quantity: 1,
          equipped: itemType === 'skin' ? false : undefined
        };

        // Save to inventory for all except coins
        if (inventoryItem.type !== 'coins') {
          inventoryService.saveToInventory(inventoryItem);
        }

        // Update localStorage ownership arrays
        if (inventoryItem.type === 'skin') {
          const newOwnedSkins = [...ownedSkins, item.id];
          setOwnedSkins(newOwnedSkins);
          localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));
        } else if (inventoryItem.type === 'powerup') {
          const ownedPowerups = JSON.parse(localStorage.getItem('flappypi-owned-powerups') || '[]');
          const newOwnedPowerups = [...ownedPowerups, item.id];
          localStorage.setItem('flappypi-owned-powerups', JSON.stringify(newOwnedPowerups));
        } else if (inventoryItem.type === 'bundle') {
          const ownedBundles = JSON.parse(localStorage.getItem('flappypi-owned-bundles') || '[]');
          const newOwnedBundles = [...ownedBundles, item.id];
          localStorage.setItem('flappypi-owned-bundles', JSON.stringify(newOwnedBundles));
        } else if (inventoryItem.type === 'mysterybox' || inventoryItem.type === 'mystery-box') {
          const ownedMysteryBoxes = JSON.parse(localStorage.getItem('flappypi-owned-mysteryboxes') || '[]');
          const newOwnedMysteryBoxes = [...ownedMysteryBoxes, item.id];
          localStorage.setItem('flappypi-owned-mysteryboxes', JSON.stringify(newOwnedMysteryBoxes));
        } else if (inventoryItem.type === 'accessory') {
          const ownedAccessories = JSON.parse(localStorage.getItem('flappypi-owned-accessories') || '[]');
          const newOwnedAccessories = [...ownedAccessories, item.id];
          localStorage.setItem('flappypi-owned-accessories', JSON.stringify(newOwnedAccessories));
        }

        toast({
          title: "Purchase Successful! 🎉",
          description: `${item.name} has been added to your collection.`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Failed to process payment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive"
      });
    }
  };

  const handleCoinPayment = async (item: any) => {
    // REMOVED: Authentication requirement - allow purchases without signing in

    const coinPrice = item.flappyCoinPrice || item.coinPrice;
    if (coins >= coinPrice) {
      const newCoins = coins - coinPrice;
      setCoins(newCoins);
      localStorage.setItem('flappypi-coins', newCoins.toString());

      // If the purchased item is Flappy Coins, increment wallet balance
      if (item.type === 'coins') {
        const walletCoins = parseInt(localStorage.getItem('flappypi-coins') || '0');
        const claimedAmount = item.amount || item.quantity || 0;
        const updatedWalletCoins = walletCoins + claimedAmount;
        setCoins(updatedWalletCoins);
        localStorage.setItem('flappypi-coins', updatedWalletCoins.toString());
        toast({
          title: "Coins Claimed! \ud83d\udcb0",
          description: `${claimedAmount} Flappy Coins have been added to your wallet.`
        });
        return;
      }

      // Add item to inventory using proper inventory service
      const inventoryItem = {
        id: item.id,
        name: item.name,
        type: item.type || 'skin',
        image: item.image, // Use the GIF image from shop items
        description: item.description,
        rarity: item.rarity,
        quantity: 1,
        equipped: false
      };

      // Save to inventory service
      inventoryService.saveToInventory(inventoryItem);

      // Also keep in ownedSkins for backwards compatibility
      const newOwnedSkins = [...ownedSkins, item.id];
      setOwnedSkins(newOwnedSkins);
      localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));

      toast({
        title: "Purchase Successful! \ud83c\udf89",
        description: `${item.name} has been added to your collection.`
      });
    } else {
      toast({
        title: "Insufficient Coins",
        description: "You need more coins to purchase this item.",
        variant: "destructive"
      });
    }
  };

  const handleSubscriptionPayment = async (item: any) => {
    // REMOVED: Authentication requirement - allow purchases without signing in

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
      
              if (result.success) {
          let description = '';
          if (item.id === 'adfree') {
            description = "You now have 7 days of ad-free gaming.";
          } else if (item.id === 'allskins') {
            description = "You now have access to all skins for 15 days.";
          } else if (item.id === 'elite') {
            description = "You now have 30 days of Elite benefits.";
          }

        toast({
          title: `${item.name} Active! 🎉`,
          description: description
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Failed to process payment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
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
        equipped: false
      };

      // Save to inventory service
      inventoryService.saveToInventory(inventoryItem);

      // Also keep in ownedSkins for backwards compatibility
      const newOwnedSkins = [...ownedSkins, paymentItem.id];
      setOwnedSkins(newOwnedSkins);
      localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));
      
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
        equipped: false
      };

      // Save to inventory service
      inventoryService.saveToInventory(inventoryItem);

      // Add to owned skins if it's not already there
      if (!ownedSkins.includes(paymentItem.id)) {
        const newOwnedSkins = [...ownedSkins, paymentItem.id];
        setOwnedSkins(newOwnedSkins);
        localStorage.setItem('flappypi-owned-skins', JSON.stringify(newOwnedSkins));
      }
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
              {getShopItemsWithOwnership().map((item) => (
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
    </div>
  );
};

export default ShopModal;
