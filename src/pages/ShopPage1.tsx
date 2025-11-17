import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameState } from '@/hooks/useGameState';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Coins as LucideCoinIcon, Gift, LifeBuoy, Magnet, Rocket, Shield, Bolt } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { shopItems as initialShopItems, ShopItem } from '@/constants/shopItems';
import { coinShopItems, CoinPackage } from '@/constants/coinShopItems';
import { powerUpItems, PowerUpItem } from '@/constants/powerUpItems';
import { mysteryBoxItems, MysteryBoxItem } from '@/constants/mysteryBoxItems';
import { cn } from '@/lib/utils';
import axios from 'axios';
import PiPaymentModal from '@/components/PiPaymentModalV2';
import BirdCharactersSection from '@/components/shop/BirdCharactersSection';
import CollapsibleFooterAdSection from '@/components/shop/CollapsibleFooterAdSection';
import { addReceipt } from '@/services/receiptService';
import { showRewardedAd } from '@/utils/piAds';
import ImageWithFallback from '@/components/ImageWithFallback';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';
import { gameBackendService } from '@/services/gameBackendService';
import { shopItems as staticShopItems } from '@/constants/shopItems';
import { CoinIcon } from '@/components/CoinIcon';
import { Spinner } from '@/components/ui/spinner';
import { subscriptionPlans } from '@/constants/subscriptionPlans';
import BackgroundDecoration from '@/components/home/BackgroundDecoration';
import { v4 as uuidv4 } from 'uuid';
import { getSaleState, getItemDiscount } from '@/utils/saleUtils';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

import EnhancedFooter from '@/components/EnhancedFooter';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';
import { useWallet } from '../context/WalletContext';
import { inventoryService } from '@/services/inventoryService';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { useGameEquipment } from '@/hooks/useGameEquipment';
import { usePiAuth } from '../context/PiAuthContext';

// Import unified payment system
import { useUnifiedPayment } from '@/hooks/useUnifiedPayment';
import UnifiedPaymentModal from '@/components/UnifiedPaymentModal';
import { PaymentItem } from '@/services/unifiedShopPaymentService';

type ShopTab = 'characters' | 'coins' | 'power-ups' | 'mystery-boxes' | 'bundles' | 'subscription' | 'pi-adnetwork';

const iconMap: { [key: string]: React.ElementType } = {
  LifeBuoy,
  Magnet,
  CoinIcon: LucideCoinIcon,
  Shield,
  Rocket,
  Gift,
  Bolt // For general power-up icon if needed
};

const getPowerUpIconComponent = (iconName: string) => {
  if (iconName && iconName.startsWith('/')) {
    return (
      <ImageWithFallback 
        src={iconName} 
        alt="Power Up" 
        className="w-24 h-24 mb-4 filter drop-shadow-md"
        fallbackSrc="/flappy-logo.png"
        lazy={true}
        retryAttempts={3}
      />
    );
  }
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className="w-24 h-24 text-blue-500 mb-4 filter drop-shadow-md" /> : null;
};

const birds = [
  { name: 'Blue', img: '/birds/bird_0.png', color: 'blue', price: 0 },
  { name: 'Red', img: '/birds/bird_4.png', color: 'red', price: 100 },
  { name: 'Pink', img: '/birds/bird_3.png', color: 'pink', price: 100 },
  { name: 'Green', img: '/birds/bird_2.png', color: 'green', price: 100 },
  { name: 'Purple', img: '/birds/bird_1.png', color: 'purple', price: 100 },
];

const SALE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const NPC_DIALOGS = [
  "Flap like nobody's watching!",
  "Those pipes look angry today...",
  // ... (rest of the 100 lines, omitted for brevity)
  "One more pipe and you're a legend!"
];

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile, loading: profileLoading, refreshProfile, signOut, hasActiveSubscription } = useUserProfile();
  const { coins: flappyCoins, addCoins, setCoins } = useGameState();
  const { toast } = useToast();
  const { isPiBrowser } = usePiBrowserDetection();
  const { spendCoins, refreshBalance, balance } = useWallet();
  const { isAuthenticated, piUser } = usePiAuth();
  
  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();
  
  // Add unified payment system
  const {
    paymentModal,
    showPiPaymentModal,
    showCoinPaymentModal,
    handlePaymentConfirmation,
    closePaymentModal,
    cancelPayment,
    quickPiPurchase,
    quickCoinPurchase,
    canAffordWithCoins,
    getFormattedPrice,
    isPaymentModalOpen,
    isProcessing,
    hasError,
    isSuccess
  } = useUnifiedPayment();

  const [activeTab, setActiveTab] = useState<ShopTab>('characters');
  const [shopItems, setShopItems] = useState<ShopItem[]>([]); // State for shop items
  const [loading, setLoading] = useState(false); // Add loading state

  // State for character shop purchases
  const [selectedCharItem, setSelectedCharItem] = useState<ShopItem | null>(null);
  const [isConfirmingCharPurchase, setIsConfirmingCharPurchase] = useState(false);
  const [charPurchaseMethod, setCharPurchaseMethod] = useState<'pi' | 'coins' | null>(null);

  // State for coin shop purchases
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<CoinPackage | null>(null);
  const [isConfirmingCoinPurchase, setIsConfirmingCoinPurchase] = useState(false);

  // State for power-up purchases
  const [selectedPowerUpItem, setSelectedPowerUpItem] = useState<PowerUpItem | null>(null);
  const [isConfirmingPowerUpPurchase, setIsConfirmingPowerUpPurchase] = useState(false);
  const [powerUpPurchaseMethod, setPowerUpPurchaseMethod] = useState<'pi' | 'coins' | null>(null);

  // State for mystery box purchases
  const [selectedMysteryBoxItem, setSelectedMysteryBoxItem] = useState<MysteryBoxItem | null>(null);
  const [isConfirmingMysteryBoxPurchase, setIsConfirmingMysteryBoxPurchase] = useState(false);
  const [mysteryBoxPurchaseMethod, setMysteryBoxPurchaseMethod] = useState<'pi' | 'coins' | 'ad' | null>(null);

  // Optional: Daily purchase limit state
  const [dailyBoxPurchases, setDailyBoxPurchases] = useState<{ [key: string]: { count: number; date: string } }>({});

  // Add state for Extra Life Bundle purchase
  const [isConfirmingExtraLifeBundle, setIsConfirmingExtraLifeBundle] = useState(false);
  const [extraLifeBundleMethod, setExtraLifeBundleMethod] = useState<'pi' | 'coins' | null>(null);

  // Add state for ad watching
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  // 2. Add state for PiPaymentModal usage for each shop section
  const [piModalOpen, setPiModalOpen] = useState(false);
  const [piModalItem, setPiModalItem] = useState<{ name: string; description?: string; piAmount: number; image?: string; onSuccess: () => void; skinId?: string; } | null>(null);

  const [paymentModal, setPaymentModal] = useState<{
    type: 'pi' | 'coins' | null;
    item: ShopItem | null;
    loading: boolean;
    success: boolean;
    error: string | null;
  }>({ type: null, item: null, loading: false, success: false, error: null });

  const [showSerialEnvelope, setShowSerialEnvelope] = useState(false);
  const [serialCode, setSerialCode] = useState<string | null>(null);
  const [serialCharacter, setSerialCharacter] = useState<ShopItem | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const APIKEY = "c7ae8gictxhmoffku5c551z30qef6oldnhqp6ynlyqueblshw8yxd394m1aregsf";

  // Add at the top of ShopPage component
  const [saleEnd, setSaleEnd] = useState(() => {
    const saved = localStorage.getItem('bundle-sale-end');
    if (saved) return new Date(saved);
    const end = new Date(Date.now() + SALE_DURATION_MS);
    localStorage.setItem('bundle-sale-end', end.toISOString());
    return end;
  });
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const saleActive = saleEnd.getTime() > now.getTime();
  const getCountdown = () => {
    const diff = saleEnd.getTime() - now.getTime();
    if (diff <= 0) return '00:00:00';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const getQuantity = (id: string) => quantities[id] || 1;
  const setItemQuantity = (id: string, value: number) => setQuantities(q => ({ ...q, [id]: value }));

  // Payment functions for shop items
  const handlePiPurchase = useCallback(async (item: ShopItem | CoinPackage | PowerUpItem | MysteryBoxItem) => {
    const paymentItem: PaymentItem = {
      id: item.id,
      name: item.name,
      type: item.type as any,
      piPrice: item.piPrice,
      coinPrice: 'coinPrice' in item ? item.coinPrice : undefined,
      image: item.image,
      description: item.description,
      coins: 'coins' in item ? item.coins : undefined,
      skinId: 'skinId' in item ? item.skinId : undefined,
      metadata: {
        originalItem: item
      }
    };
    
    showPiPaymentModal(paymentItem);
  }, [showPiPaymentModal]);

  const handleCoinPurchase = useCallback(async (item: ShopItem | CoinPackage | PowerUpItem | MysteryBoxItem) => {
    const paymentItem: PaymentItem = {
      id: item.id,
      name: item.name,
      type: item.type as any,
      piPrice: item.piPrice,
      coinPrice: 'coinPrice' in item ? item.coinPrice : undefined,
      image: item.image,
      description: item.description,
      coins: 'coins' in item ? item.coins : undefined,
      skinId: 'skinId' in item ? item.skinId : undefined,
      metadata: {
        originalItem: item
      }
    };
    
    showCoinPaymentModal(paymentItem);
  }, [showCoinPaymentModal]);

  useEffect(() => {
    const fetchAndSetShopItems = async () => {
      setLoading(true);
      try {
        let fetchedItems = [];
        try {
          fetchedItems = await gameBackendService.fetchShopItems();
        } catch (e) {
          // In development, fallback to static data if backend fails
          fetchedItems = staticShopItems;
        }
        const mergedItems = initialShopItems.map(staticItem => {
          const fetchedItem = fetchedItems.find(fi => fi.id === staticItem.id);
          return {
            ...staticItem,
            ...fetchedItem,
            isDefault: staticItem.isDefault
          };
        });
        setShopItems(mergedItems);
      } catch (error) {
        setShopItems(staticShopItems); // fallback to static
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetShopItems();

    if (!profile && !profileLoading) {
      console.log("Profile not loaded yet in ShopPage.");
    } else if (profile) {
      console.log("ShopPage: User Profile:", profile);
      console.log("ShopPage: Flappy Coins (from gameState):", flappyCoins);
    }

    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab') as ShopTab;
    if (tab && ['characters', 'coins', 'power-ups', 'mystery-boxes'].includes(tab)) {
      setActiveTab(tab);
    }

    // Load daily purchases from localStorage
    const storedDailyPurchases = localStorage.getItem('flappypi-daily-box-purchases');
    if (storedDailyPurchases) {
      try {
        const parsed = JSON.parse(storedDailyPurchases);
        const today = new Date().toDateString();
        // Reset count if date is not today
        const updatedPurchases = Object.fromEntries(
          Object.entries(parsed).map(([boxId, data]: [string, any]) => (
            [boxId, data.date === today ? data : { count: 0, date: today }]
          ))
        );
        setDailyBoxPurchases(updatedPurchases);
      } catch (e) {
        console.error('Error parsing daily box purchases from localStorage:', e);
        localStorage.removeItem('flappypi-daily-box-purchases');
      }
    }
  }, [profile, profileLoading, location.search]);

  useEffect(() => {
    // Save daily purchases to localStorage whenever it changes
    localStorage.setItem('flappypi-daily-box-purchases', JSON.stringify(dailyBoxPurchases));
  }, [dailyBoxPurchases]);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page (HomePage)
  };

  // Character Shop Logic
  const getBirdImagePath = (id: string) => {
    const item = shopItems.find(i => i.id === id);
    if (item) {
      return item.image;
    }
    // Fallback to default if not found in shopItems
    return shopItems.find(i => i.id === 'fluppy')?.image || '/flappy-logo.png';
  };

  const getRarityColor = (rarity: 'Common' | 'Rare' | 'Epic' | 'Special') => {
    switch (rarity) {
      case 'Common': return 'text-gray-500';
      case 'Rare': return 'text-blue-500';
      case 'Epic': return 'text-purple-500';
      case 'Special': return 'text-pink-500';
      default: return 'text-gray-500';
    }
  };

  const getRarityGlow = (rarity: 'Common' | 'Rare' | 'Epic' | 'Special') => {
    switch (rarity) {
      case 'Common': return 'shadow-common-glow';
      case 'Rare': return 'shadow-rare-glow';
      case 'Epic': return 'shadow-epic-glow';
      case 'Special': return 'shadow-special-glow';
      default: return '';
    }
  };

  const handleCharPurchaseAttempt = (item: ShopItem, method: 'pi' | 'coins') => {
    setPaymentModal({ type: method, item, loading: false, success: false, error: null });
  };

  const handleConfirmCoinPayment = async () => {
    if (!paymentModal.item || !profile) return;
    const item = paymentModal.item;
    const isSkin = !!item.rarity;
    const price = item.flappyCoinPrice * (item.quantity || 1);
    if (balance < price) {
      setPaymentModal((prev) => ({ ...prev, error: `You need ${(price - balance).toFixed(2)} more FC to buy this item.` }));
      return;
    }
    setPaymentModal((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Deduct coins using wallet context
      const success = await spendCoins(price, `Shop purchase: ${item.name}`);
      if (!success) {
        setPaymentModal((prev) => ({ ...prev, loading: false, error: 'Payment failed. Not enough coins.' }));
        return;
      }
      await refreshBalance();
      let updatedProfile = { ...profile, total_coins: balance - price };
      if (isSkin) {
        if (!updatedProfile.owned_skins?.includes(item.id)) {
          updatedProfile.owned_skins = [...(updatedProfile.owned_skins || []), item.id];
        }
      } else {
        updatedProfile.owned_power_ups = {
          ...(updatedProfile.owned_power_ups || {}),
          [item.id]: ((updatedProfile.owned_power_ups || {})[item.id] || 0) + (item.quantity || 1)
        };
      }
      await updateProfile(updatedProfile);
      refreshProfile();
      setCongratsItem(item);
      setShowCongratsModal(true);
      setPaymentModal({ type: null, item: null, loading: false, success: false, error: null });
    } catch (e) {
      setPaymentModal((prev) => ({ ...prev, loading: false, error: 'Payment failed. Please try again.' }));
    }
  };

  const handleEquipSkin = async (skinId: string) => {
    if (!profile) return;
    try {
      // Get the correct image path from shopItems
      const shopItem = shopItems.find(item => item.id === skinId);
      
      await updateProfile({ 
        selected_bird_skin: skinId
      });
      
      toast({
        title: "Skin Equipped! ✨",
        description: `You are now flying with the ${shopItem?.name || skinId}.`,
      });
    } catch (error) {
      console.error("Failed to equip skin:", error);
      toast({
        title: "Equip Failed",
        description: "Could not equip skin. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isOwned = (itemId: string) => profile?.owned_skins?.includes(itemId);
  const isEquipped = (itemId: string) => profile?.selected_bird_skin === itemId;

  const isCharacterAffordable = (item: ShopItem, method: 'pi' | 'coins') => {
    if (!profile) return false;
    if (method === 'pi') return profile.pi_balance !== undefined && profile.pi_balance >= item.piPrice;
    return flappyCoins >= item.flappyCoinPrice;
  };

  // Power-up Shop Logic
  const isPowerUpAffordable = (item: PowerUpItem, method: 'pi' | 'coins', quantity = 1) => {
    if (!profile) return false;
    if (method === 'pi') return profile.pi_balance !== undefined && profile.pi_balance >= item.piPrice * quantity;
    return flappyCoins >= item.flappyCoinPrice * quantity;
  };

  const handlePowerUpPurchaseAttempt = (item: PowerUpItem, method: 'pi' | 'coins', quantity = 1) => {
    setSelectedPowerUpItem({ ...item, quantity });
    setPowerUpPurchaseMethod(method);
    setIsConfirmingPowerUpPurchase(true);
  };

  const confirmPowerUpPurchase = async () => {
    if (!selectedPowerUpItem || !powerUpPurchaseMethod || !profile) return;
    setIsConfirmingPowerUpPurchase(false);
    const quantity = selectedPowerUpItem.quantity || 1;
    if (powerUpPurchaseMethod === 'coins') {
      const totalPrice = selectedPowerUpItem.flappyCoinPrice * quantity;
      const success = await spendCoins(totalPrice, `Shop purchase: ${selectedPowerUpItem.name}`);
      if (!success) {
        toast({
          title: 'Insufficient Coins',
          description: `You need ${(totalPrice - balance).toFixed(2)} more FC to purchase ${selectedPowerUpItem.name}.`,
          variant: 'destructive',
        });
        return;
      }
      await refreshBalance();
      // Real Pi Network payment processing
      try {
        const result = await realPiPaymentService.processShopPayment({
          id: selectedPowerUpItem.id,
          name: selectedPowerUpItem.name,
          price: selectedPowerUpItem.piPrice * quantity,
          quantity: quantity,
          type: 'powerup'
        });

        if (result.success) {
          // Add power-ups to inventory
          const currentPowerUps = profile.owned_power_ups || {};
          const itemId = selectedPowerUpItem.id;
          currentPowerUps[itemId] = (currentPowerUps[itemId] || 0) + quantity;
          
          // Update profile
          await updateProfile({ owned_power_ups: currentPowerUps });
          
          toast({
            title: 'Purchase Successful! 🎉',
            description: `Successfully purchased ${quantity} ${selectedPowerUpItem.name}!`,
          });
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } catch (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'Unable to process payment',
          variant: 'destructive'
        });
      }
    } else if (powerUpPurchaseMethod === 'pi') {
      // Mock payment processing
      toast({
        title: 'Processing Mock Payment',
        description: `Processing payment for ${quantity} ${selectedPowerUpItem.name}...`,
      });
      
      setTimeout(() => {
        // Add power-ups to inventory (mock implementation)
        const currentPowerUps = profile.owned_power_ups || {};
        const itemId = selectedPowerUpItem.id;
        currentPowerUps[itemId] = (currentPowerUps[itemId] || 0) + quantity;
        
        // Update profile (mock)
        console.log('Mock: Power-ups added to inventory:', currentPowerUps);
        
        toast({
          title: 'Purchase Successful! 🎉',
          description: `Successfully purchased ${quantity} ${selectedPowerUpItem.name}!`,
        });
      }, 2000);
    }
  };

  // Coin Shop Logic
  const handleCoinPurchaseAttempt = (pkg: CoinPackage) => {
    setSelectedCoinPackage(pkg);
    setIsConfirmingCoinPurchase(true);
  };

  const confirmCoinPurchase = async () => {
    if (!selectedCoinPackage || !profile) return;

    setIsConfirmingCoinPurchase(false); // Close dialog immediately

    try {
      if (typeof window.Pi === 'undefined') {
        toast({
          title: "Pi SDK Not Available",
          description: "Cannot initiate Pi payment. Please ensure you are in the Pi Browser.",
          variant: "destructive"
        });
        return;
      }

      // First, authenticate the user with proper scopes for payments
      console.log('🔐 Authenticating user for coin purchase...');
      const authResult = await window.Pi.authenticate(['payments'], (incompletePayment) => {
        console.log('💰 Incomplete payment found during authentication:', incompletePayment);
      });

      if (!authResult || !authResult.user) {
        throw new Error('Pi authentication failed');
      }

      console.log('✅ User authenticated for coin purchase:', authResult.user.username);

      const pkg = selectedCoinPackage;

      // Use the official Pi.createPayment API
      window.Pi.createPayment({
        amount: pkg.piPrice,
        memo: 'Purchase of ' + pkg.coins + ' FC',
        metadata: { 
          itemId: pkg.id, 
          itemType: 'coins', 
          coinsEarned: pkg.coins,
          username: authResult.user.username
        },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('🎯 Coin payment ready for approval:', paymentId);
          // No backend call needed - Pi Network handles approval automatically
          console.log('✅ Coin payment approved automatically');
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('🎯 Coin payment ready for completion:', paymentId, txid);
          // No backend call needed - Pi Network handles completion automatically
          console.log('✅ Coin payment completed automatically');

          // Apply rewards here after successful completion
          const newCoinBalance = (profile.total_coins || 0) + pkg.coins; // Use total_coins
          await updateProfile({ total_coins: newCoinBalance });
          setCoins(newCoinBalance); // Update local game state
          
          // Generate receipt for coin package purchase
          addReceipt({
            userId: profile.id,
            product: `${pkg.coins} FC`,
            type: 'coins',
            amount: pkg.piPrice,
            currency: 'pi',
            transactionId: txid
          });

          toast({
            title: "Purchase Successful! 🎉",
            description: `You've received ${pkg.coins} FC with Pi!`,
            variant: "default"
          });

        },
        onCancel: (paymentId: string) => {
          toast({
            title: "Payment Cancelled",
            description: "You have cancelled the Pi payment.",
            variant: "destructive"
          });
          console.log(`Pi payment ${paymentId} cancelled.`);
        },
        onError: (error: any, payment: any) => {
          toast({
            title: "Pi Payment Error",
            description: `An error occurred during Pi payment: ${error.message || "Unknown error"}.`,
            variant: "destructive"
          });
          console.error("Pi payment error:", error, payment);
        },
      });
    } catch (error) {
      console.error("Coin package purchase failed:", error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during coin package purchase. Please try again.",
        variant: "destructive"
      });
    }
    setSelectedCoinPackage(null);
  };

  const isCoinPackageAffordable = (piPrice: number) => {
    if (!profile) return false;
    return profile.pi_balance !== undefined && profile.pi_balance >= piPrice; // Use pi_balance
  };

  const getPowerUpDisplayName = (id: string) => {
    const powerUp = powerUpItems.find(p => p.id === id);
    return powerUp ? powerUp.name : id; // Fallback to ID if not found
  };

  // 2. Add handler for Extra Life Bundle purchase
  const handleExtraLifeBundlePurchaseAttempt = (method: 'pi' | 'coins') => {
    setIsConfirmingExtraLifeBundle(true);
    setExtraLifeBundleMethod(method);
  };

  const confirmExtraLifeBundlePurchase = async () => {
    if (!profile || !extraLifeBundleMethod) return;

    setIsConfirmingExtraLifeBundle(false);

    try {
      if (extraLifeBundleMethod === 'pi') {
        if (typeof window.Pi === 'undefined') {
          toast({
            title: "Pi SDK Not Available",
            description: "Cannot initiate Pi payment. Please ensure you are in the Pi Browser.",
            variant: "destructive"
          });
          return;
        }

        // Create Pi payment with recipientAddress
        const paymentData = {
          amount: 6.99, // Fixed Pi price for Extra Life Bundle
          memo: 'Purchase of Extra Life Bundle',
          recipientAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
          metadata: { 
            itemId: 'extra-life-bundle', 
            itemType: 'bundle',
            type: 'bundle_purchase',
            game: 'flappy_pi',
            walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ'
          }
        };

        const paymentCallbacks = {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log('🎯 Bundle payment ready for approval:', paymentId);
            // No backend call needed - Pi Network handles approval automatically
            console.log('✅ Bundle payment approved automatically');
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            console.log('🎯 Bundle payment ready for completion:', paymentId, txid);
            // No backend call needed - Pi Network handles completion automatically
            console.log('✅ Bundle payment completed automatically');

            await updateProfile({ extra_lives: (profile.extra_lives || 0) + 15 });

            addReceipt({
              userId: profile.id,
              product: 'Extra Life Bundle',
              type: 'bundle',
              amount: 6.99,
              currency: 'pi',
              transactionId: txid
            });

            toast({
              title: "Extra Lives Gained! ❤️",
              description: "You've received 10 + 5 Extra Lives (15 total) with Pi!",
              variant: "default"
            });

            // Add bundle items to inventory
            const bundleResult = inventoryService.useBundle('extra-life-bundle');
            if (bundleResult.success && bundleResult.items.length > 0) {
              bundleResult.items.forEach(item => {
                toast({
                  title: 'Bundle Item Received!',
                  description: `You received: ${item.name} x${item.quantity}`,
                  variant: 'default',
                });
              });
            }
          },
          onCancel: (paymentId: string) => {
            toast({
              title: "Payment Cancelled",
              description: "You have cancelled the Pi payment for Extra Life Bundle.",
              variant: "destructive"
            });
            console.log(`Pi payment ${paymentId} cancelled.`);
          },
          onError: (error: any, payment: any) => {
            toast({
              title: "Pi Payment Error",
              description: `An error occurred during Pi payment for Extra Life Bundle: ${error.message || "Unknown error"}.`,
              variant: "destructive"
            });
            console.error("Pi payment error:", error, payment);
          },
        };

        // Create the payment using the callback-based API (no await)
        window.Pi.createPayment(paymentData, paymentCallbacks);
        console.log('✅ Bundle payment initiated');

      } else if (extraLifeBundleMethod === 'coins') {
        const bundlePrice = 6999;
        if (flappyCoins < bundlePrice) {
          toast({
            title: "Insufficient FC",
            description: `You need ${(bundlePrice - flappyCoins).toFixed(2)} more FC to purchase the Extra Life Bundle.`,
            variant: "destructive"
          });
          return;
        }

        const newCoins = flappyCoins - bundlePrice;
        setCoins(newCoins);
        await updateProfile({ total_coins: newCoins, extra_lives: (profile.extra_lives || 0) + 15 });

        addReceipt({
          userId: profile.id,
          product: 'Extra Life Bundle',
          type: 'bundle',
          amount: bundlePrice,
          currency: 'coins',
          transactionId: 'N/A'
        });

        toast({
          title: "Extra Lives Gained! ❤️",
          description: "You've received 10 + 5 Extra Lives (15 total) with FC!",
          variant: "default"
        });
        await refreshProfile();
      }
    } catch (error) {
      console.error("Extra Life Bundle purchase failed:", error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during purchase. Please try again.",
        variant: "destructive"
      });
    }
    setExtraLifeBundleMethod(null);
  };

  // 2. Add handler for watching ad
  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    // Simulate ad watching delay
    setTimeout(() => {
      setIsWatchingAd(false);
      setCoins(flappyCoins + 10);
      toast({
        title: 'Reward Earned!',
        description: 'You earned 10 FC for watching a Pi Ad.',
      });
    }, 3000); // Simulate 3 seconds ad
  };

  // Add handler for shop subscription plan purchase
  const handleShopPlanPurchase = (plan: any) => {
    if (!profile || profileLoading) {
      toast({
        title: 'Profile Not Loaded',
        description: 'Please wait for your profile to load before making a purchase.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Processing Mock Payment',
      description: `Processing ${plan.price} Pi payment for ${plan.name}...`,
    });
    
    // Mock payment processing
    setTimeout(() => {
      // Activate subscription based on plan type
      if (plan.name?.toLowerCase().includes('all skins') || plan.name?.toLowerCase().includes('premium')) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem('flappypi-all-skins-subscription', JSON.stringify({
          expiresAt: expiryDate.toISOString()
        }));
      }
      
      if (plan.name?.toLowerCase().includes('elite')) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem('flappypi-elite-subscription', JSON.stringify({
          expiresAt: expiryDate.toISOString()
        }));
      }
      
      if (plan.name?.toLowerCase().includes('ultimate')) {
        // Ultimate pack includes both all skins and elite
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem('flappypi-all-skins-subscription', JSON.stringify({
          expiresAt: expiryDate.toISOString()
        }));
        localStorage.setItem('flappypi-elite-subscription', JSON.stringify({
          expiresAt: expiryDate.toISOString()
        }));
      }
      
      toast({ 
        title: 'Subscription Activated! 🎉', 
        description: `Successfully purchased ${plan.name} for ${plan.price} Pi!` 
      });
      
      // Refresh profile to update UI
      refreshProfile();
    }, 2000);
  };

  const isBoxPurchaseLimitReached = (boxId: string) => {
    const today = new Date().toDateString();
    const boxPurchase = dailyBoxPurchases[boxId];
    if (boxPurchase && boxPurchase.date === today && boxPurchase.count >= 5) { // Example: Limit to 5 per day
      return true;
    }
    return false;
  };

  const handleMysteryBoxPurchaseAttempt = (item: MysteryBoxItem, method: 'pi' | 'coins') => {
    if (method === 'pi') {
      setPiModalItem({
        name: item.name,
        description: item.description || 'Mystery Box',
        piAmount: item.piPrice,
        image: item.image,
        onSuccess: async () => {
          // Use inventoryService to open the mystery box and get real rewards
          let boxType: 'basic' | 'rare' | 'epic' | 'legendary' = 'basic';
          if (item.id.toLowerCase().includes('rare')) boxType = 'rare';
          else if (item.id.toLowerCase().includes('epic')) boxType = 'epic';
          else if (item.id.toLowerCase().includes('legendary')) boxType = 'legendary';
          const { rewards, success } = inventoryService.openMysteryBox(boxType);
          if (!success || !rewards.length) {
            toast({
              title: 'Mystery Box Failed',
              description: 'No reward could be generated. Please try again.',
              variant: 'destructive',
            });
            return;
          }
          // For simplicity, show the first reward (could be extended to show all)
          const reward = rewards[0];
          if (reward.type === 'coins') {
            await updateProfile({ total_coins: (profile?.total_coins || 0) + reward.quantity });
            setCoins((profile?.total_coins || 0) + reward.quantity);
            toast({
              title: 'Mystery Box Reward! 💰',
              description: `You received ${reward.quantity} FC!`,
              variant: 'default',
            });
          } else if (reward.type === 'powerup') {
            const currentPowerUps = profile?.owned_power_ups || {};
            const updatedPowerUps = {
              ...currentPowerUps,
              [reward.id]: (currentPowerUps[reward.id] || 0) + reward.quantity,
            };
            await updateProfile({ owned_power_ups: updatedPowerUps });
            toast({
              title: 'Mystery Box Reward! ⚡',
              description: `You received ${reward.quantity} ${reward.name}!`,
              variant: 'default',
            });
          } else if (reward.type === 'skin' && !reward.name.toLowerCase().includes('mystery box')) {
            if (!profile.owned_skins?.includes(reward.id)) {
              await updateProfile({ owned_skins: [...(profile.owned_skins || []), reward.id] });
            }
            setCongratsItem(reward);
            setShowCongratsModal(true);
            toast({
              title: 'Mystery Box Reward! 🎒',
              description: `You received a new skin: ${reward.name}!`,
              variant: 'default',
            });
          } else if (reward.type === 'bundle') {
            toast({
              title: 'Mystery Box Reward! 🎁',
              description: `You received a bundle: ${reward.name}!`,
              variant: 'default',
            });
          } else {
            toast({
              title: 'Mystery Box Reward!',
              description: `You received: ${reward.name}!`,
              variant: 'default',
            });
          }
          addReceipt({
            userId: profile?.id || '',
            product: reward.name,
            type: reward.type,
            amount: item.piPrice,
            currency: 'pi',
            transactionId: '',
          });
          await refreshProfile();
        }
      });
      setPiModalOpen(true);
    } else {
      setSelectedMysteryBoxItem(item);
      setMysteryBoxPurchaseMethod(method);
      setIsConfirmingMysteryBoxPurchase(true);
    }
  };

  const confirmMysteryBoxPurchase = async () => {
    if (!selectedMysteryBoxItem || !mysteryBoxPurchaseMethod) return;
    const quantity = getQuantity(selectedMysteryBoxItem.id);
    const boxPrice = selectedMysteryBoxItem.flappyCoinPrice * quantity;
    if (mysteryBoxPurchaseMethod === 'coins') {
      const success = await spendCoins(boxPrice, `Shop purchase: ${selectedMysteryBoxItem.name}`);
      if (!success) {
        toast({
          title: 'Insufficient Coins',
          description: `You need ${(boxPrice - balance).toFixed(2)} more FC to purchase the ${selectedMysteryBoxItem.name}.`,
          variant: 'destructive',
        });
        return;
      }
      await refreshBalance();
      // ... rest of the logic remains unchanged ...
    }
    // ... existing Pi payment logic ...
  };

  const isMysteryBoxAffordable = (item: MysteryBoxItem, method: 'pi' | 'coins') => {
    if (method === 'pi') {
      // Assuming Pi balance check would happen within the Pi SDK payment flow or similar
      return true; // For now, assume Pi payments are handled externally
    } else {
      return flappyCoins >= item.flappyCoinPrice;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ShopTab);
  };

  const handleConfirmCharPurchase = async () => {
    if (!paymentModal.item || !profile) return;
    const item = paymentModal.item;
    // Only generate serial code for Flappy character purchases
    if (item && item.id && item.rarity) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `FLP-${item.id.toUpperCase()}-${timestamp}-${random}`;
      setSerialCode(code);
      setSerialCharacter(item);
      addReceipt({
        userId: profile.id,
        product: item.name,
        type: 'skin',
        amount: item.piPrice || item.flappyCoinPrice,
        currency: paymentModal.type === 'pi' ? 'pi' : 'coins',
        transactionId: uuidv4()
      });
      // Add skin to owned_skins if not already present
      if (!profile.owned_skins?.includes(item.id)) {
        await updateProfile({ owned_skins: [...(profile.owned_skins || []), item.id] });
        refreshProfile();
      }
      setCongratsItem(item);
      setShowCongratsModal(true);
    }
    setPaymentModal({ type: null, item: null, loading: false, success: false, error: null });
  };

  // Fix: Use a separate quantity state for payment modals
  const [paymentQuantity, setPaymentQuantity] = useState<number>(1);

  // When opening payment modal, set paymentQuantity
  const openPaymentModal = (type: 'pi' | 'coins', item: any, quantity: number = 1) => {
    setPaymentQuantity(quantity);
    
    // Convert to PaymentItem format and use unified payment system
    const paymentItem: PaymentItem = {
      id: item.id,
      name: item.name,
      type: item.type as any,
      piPrice: item.piPrice,
      coinPrice: item.flappyCoinPrice || item.coinPrice,
      quantity: quantity,
      image: item.image,
      description: item.description,
      coins: item.coins,
      skinId: item.skinId,
      metadata: {
        originalItem: item
      }
    };
    
    if (type === 'pi') {
      showPiPaymentModal(paymentItem);
    } else {
      showCoinPaymentModal(paymentItem);
    }
  };

  // Sale logic
  const { isSaleDay, msLeft, periodEnd } = getSaleState();
  const salePeriod = Math.floor((Date.now() - Date.UTC(2025, 5, 1, 0, 0, 0, 0)) / (24 * 60 * 60 * 1000));
  const saleCountdown = () => {
    const diff = msLeft;
    if (diff <= 0) return '00:00:00';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Sync shop coin display with profile
  useEffect(() => {
    setCoins(profile?.total_coins ?? 0);
  }, [profile]);

  const [npcDialogIndex, setNpcDialogIndex] = useState(0);
  const shopDialogs = [
    "Welcome to the Flappy Shop! Let's gear up!",
    "Looking for power-ups? I've got you.",
    "Skins, boosts, extras — it's all here!",
    "Spend your coins wisely… or wildly.",
    "New stock added! Check the shop!",
    "I've got the rarest skins in stock!",
    "Want to flap in style? Grab a new outfit.",
    "Shop till you flap!",
    "Buying boosts makes flapping easier.",
    "You've got coins. Let's use them!",
    "Check the daily deal section.",
    "Got something shiny with your name on it!",
    "This one boosts your speed. Tempting?",
    "Special deals rotate weekly!",
    "That skin is 🔥 — grab it now!",
    "Want to preview before buying?",
    "Feeling lucky? Try a mystery item!",
    "That one's popular with pro flappers!",
    "Here's my personal favorite — take a look!",
    "Want to upgrade your power-ups?",
    "You look like someone who appreciates good gear!",
    "Don't miss limited-edition items!",
    "Your style game is about to level up.",
    "Check back daily for flash sales!",
    "Every item helps you stand out!",
    "Watch an ad to unlock special deals!",
    "Want to buy with Pi instead?",
    "Let me show you the best deals!",
    "Your coins deserve to be spent!",
    "Custom trails are in — want one?",
    "You earned it — time to treat yourself.",
    "Skins don't help you flap… but they look cool!",
    "Everything's more fun with new gear!",
    "Match your look to your mood.",
    "Use coins or Pi to unlock premium items!",
    "Support the devs by shopping in here 💙",
    "Skins from the vault are now available!",
    "Power-ups = high scores.",
    "Score big, shop big!",
    "Want a speed boost or a shield?",
    "These items won't last forever!",
    "Customize everything — even your flap sound!",
    "That's a rare color combo!",
    "Want glowing wings? You got it!",
    "Seasonal skins just dropped!",
    "Flap with flair using shop exclusives!",
    "Time to level up your look.",
    "These boosts will help you break records!",
    "Shop smart, flap smarter.",
    "See something shiny? Grab it fast!"
  ];
  const handleNpcAsk = () => {
    setNpcDialogIndex((prev) => (prev + 1) % shopDialogs.length);
  };

  // 1. Add state for congrats modal
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [congratsItem, setCongratsItem] = useState<any>(null);

  // 4. Equip Now handler for congrats modal
  const handleCongratsEquip = async () => {
    if (!congratsItem || !profile) return;
    await handleEquipSkin(congratsItem.id);
    setShowCongratsModal(false);
  };

  // Daily login reward state
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(0);
  const [lastClaim, setLastClaim] = useState<number | null>(null);
  const [streak, setStreak] = useState(1);

  // Check daily login reward on mount - ONLY FOR AUTHENTICATED USERS
  useEffect(() => {
    if (!profile || !isAuthenticated) return;
    const lastClaimTime = Number(localStorage.getItem('flappy-last-claim')) || 0;
    const streakCount = Number(localStorage.getItem('flappy-streak')) || 1;
    const now = Date.now();
    const hoursSince = (now - lastClaimTime) / (1000 * 60 * 60);
    if (hoursSince >= 24 || lastClaimTime === 0) {
      setShowDailyReward(true);
      setDailyRewardAmount(streakCount * 10); // Changed from 100 to 10 flappy coins per day
      setStreak(streakCount);
    }
    setLastClaim(lastClaimTime);
  }, [profile, isAuthenticated]);

  const handleClaimDailyReward = async () => {
    if (!profile) return;
    
    const now = Date.now();
    const lastClaim = localStorage.getItem('flappy-last-claim');
    const lastClaimDate = lastClaim ? new Date(parseInt(lastClaim)).toDateString() : null;
    const today = new Date().toDateString();
    
    if (lastClaimDate === today) {
      toast({
        title: "Already Claimed",
        description: "You've already claimed your daily reward today!",
        variant: "destructive"
      });
      return;
    }
    
    const currentStreak = parseInt(localStorage.getItem('flappy-streak') || '0');
    const streakCount = lastClaimDate === new Date(now - 24 * 60 * 60 * 1000).toDateString() ? currentStreak + 1 : 1;
    const reward = Math.min(100 + (streakCount - 1) * 50, 500); // 100-500 coins based on streak
    
    await updateProfile({ total_coins: (profile.total_coins || 0) + reward });
    setCoins((profile.total_coins || 0) + reward);
    localStorage.setItem('flappy-last-claim', now.toString());
    localStorage.setItem('flappy-streak', streakCount.toString());
    setShowDailyReward(false);
    setStreak(streakCount);
    setDailyRewardAmount(reward);
    // Redirect to wallet (simulate navigation)
    navigate('/wallet');
  };

  const [showSubscriptionPlansModal, setShowSubscriptionPlansModal] = useState(false);

  useEffect(() => {
    const openModal = () => setShowSubscriptionPlansModal(true);
    document.addEventListener('openSubscriptionPlansModal', openModal);
    return () => document.removeEventListener('openSubscriptionPlansModal', openModal);
  }, []);

  // Use equippedSkin from useGameEquipment if available
  const { equippedSkin } = useGameEquipment();
  const equippedSkinImg = getBirdImageSrc(equippedSkin);

  return (
    <div className="relative min-h-screen bg-sky-200">
      <BackgroundDecoration />
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-sky-100 p-0">
        <div className="w-full max-w-xl mx-auto relative pt-8 pb-16">
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black text-yellow-400 drop-shadow-lg tracking-wide" style={{ textShadow: '2px 4px 0 #8b16f7' }}>SHOP</h1>
              <button
                className="ml-4 px-6 py-3 bg-[#A259FF] text-white font-extrabold text-lg rounded-full border-none outline-none flex items-center gap-2"
                onClick={() => navigate('/full-flappy-wiki')}
                aria-label="Go to Flappy Wiki"
              >
                <span role="img" aria-label="book">📖</span> Flappy Wiki
              </button>
            </div>
            <img src={equippedSkinImg} alt="Flappy Pi Bird" className="w-24 h-24 -mt-8 animate-bounce drop-shadow-2xl" />
          </div>
          <div className="flex items-center justify-end px-4 mb-6">
            <img src="/flappycoins.png" alt="Pi Coin" className="w-8 h-8 mr-2" />
            <span className="text-2xl font-bold text-yellow-500">{flappyCoins}</span>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Spinner className="text-purple-600 w-32 h-32 mb-6" />
              <div className="text-2xl font-bold text-purple-700">Loading...</div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShopTab)} className="w-full">
              <TabsList className="flex flex-wrap gap-2 mb-8 justify-center">
                <TabsTrigger value="characters">Characters</TabsTrigger>
                <TabsTrigger value="power-ups">Power Ups</TabsTrigger>
                <TabsTrigger value="coins">Flappy Coin</TabsTrigger>
                <TabsTrigger value="mystery-boxes">Mystery Box</TabsTrigger>
                <TabsTrigger value="bundles">Bundles</TabsTrigger>
              </TabsList>
              <TabsContent value="characters">
                <div className="space-y-6">
                  {shopItems.filter(item => !item.locked || item.id === 'inferno-phoenix').map((item) => {
                    const owned = isOwned(item.id);
                    const equipped = isEquipped(item.id);
                    const soldOut = item.isLimited && item.supply !== undefined && item.supply <= 0;
                    const isDefaultSkin = item.isDefault;
                    return (
                      <div key={item.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 mb-2 border-2 border-blue-200 relative">
                        {/* SALE BADGE & COUNTDOWN (not for default skin) */}
                        {item.id === 'inferno-phoenix' ? (
                          <div className="absolute top-4 left-4 px-4 py-1 rounded-full font-bold text-xs shadow-lg z-10 border-2 border-white bg-gray-400 text-gray-700">Not for Sale</div>
                        ) : !isDefaultSkin && (
                          <>
                            <div className={`absolute top-4 left-4 px-4 py-1 rounded-full font-bold text-xs shadow-lg z-10 border-2 border-white ${isSaleDay ? 'bg-red-600 text-white' : 'bg-gray-400 text-white'}`}>{isSaleDay ? 'SALE' : 'Sale Over'}</div>
                            {isSaleDay && (
                              <div className="absolute top-4 right-4 bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full font-semibold text-xs shadow">
                                Sale ends in: {saleCountdown()}
                              </div>
                            )}
                          </>
                        )}
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1 ml-6">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-xl font-bold text-blue-700">{item.name}</div>
                            {/* RARITY BADGE for all skins */}
                            {isDefaultSkin ? (
                              <span className="ml-2 px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-white bg-gray-200 text-gray-700">Common · Free</span>
                            ) : item.id === 'inferno-phoenix' ? (
                              <span className="ml-2 px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-white bg-pink-200 text-pink-700">Special</span>
                            ) : (
                              <span className={
                                item.rarity === 'Epic'
                                  ? 'ml-2 px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-white bg-violet-100 text-violet-700'
                                  : item.rarity === 'Rare'
                                  ? 'ml-2 px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-white bg-green-100 text-green-700'
                                  : item.rarity === 'Legendary'
                                  ? 'ml-2 px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-white bg-yellow-400 text-yellow-900'
                                  : 'ml-2 px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-white bg-white/90'
                              }>{item.rarity}</span>
                            )}
                          </div>
                          <div className="text-gray-600 mb-2 text-sm flex items-center gap-2">
                            <span>{item.description}</span>
                            {item.supply && (
                              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold text-xs ml-2">Limited Supply: {item.supply.toLocaleString()}</span>
                            )}
                          </div>
                          {/* Action Button for Fire Phoenix */}
                          {item.id === 'inferno-phoenix' ? (
                            <div className="flex flex-col gap-2 mt-2">
                              <button
                                className="w-full py-3 rounded-xl font-extrabold text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-2 border-purple-500 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 animate-pulse relative overflow-hidden flex items-center justify-center"
                                onClick={() => setShowSubscriptionModal(true)}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
                                <div className="relative z-10 flex items-center justify-center">
                                  <img 
                                    src="/npc gif/subscriptionplanbutton.gif.gif" 
                                    alt="Subscription Plan" 
                                    className="w-6 h-6 mr-2 filter brightness-0 invert"
                                  />
                                  Subscribe to Ultimate Pack
                                </div>
                              </button>
                            </div>
                          ) : isDefaultSkin ? (
                            <div className="flex flex-col gap-2 mt-2">
                              <button style={{backgroundColor:'#f7d216',color:'#7C5C00'}} className="font-bold px-8 py-2 rounded-full border-4 border-yellow-400 text-lg cursor-default" disabled>
                                EQUIPPED
                              </button>
                            </div>
                          ) : owned ? (
                            <div className="flex flex-col gap-2 mt-2">
                              <button style={{backgroundColor:'#f7d216',color:'#7C5C00'}} className="font-bold px-8 py-2 rounded-full border-4 border-yellow-400 text-lg" onClick={() => handleEquipSkin(item.id)}>
                                EQUIP
                              </button>
                            </div>
                          ) : equipped ? (
                            <div className="flex flex-col gap-2 mt-2">
                              <button style={{backgroundColor:'#f7d216',color:'#7C5C00'}} className="font-bold px-8 py-2 rounded-full border-4 border-yellow-400 text-lg" onClick={() => handleEquipSkin(item.id)}>
                                EQUIP
                              </button>
                            </div>
                          ) : soldOut ? (
                            <div className="flex flex-col gap-2 mt-2">
                              <button style={{backgroundColor:'#e53935',color:'#fff'}} className="font-bold px-8 py-2 rounded-full border-4 border-red-600 text-lg cursor-not-allowed" disabled>
                                SOLD OUT
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-col gap-2 mt-2">
                                <button
                                  className="buy-pi-button bg-purple-600 text-white px-6 py-3 text-lg rounded-xl hover:bg-purple-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                                  onClick={() => openPaymentModal('pi', { ...item, image: item.image, quantity: getQuantity(item.id) })}
                                >
                                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                                  Buy for {(item.piPrice * getQuantity(item.id)).toFixed(2)} Pi
                                </button>
                                <button
                                  className="buy-coin-button bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                                  onClick={() => openPaymentModal('coins', { ...item, image: item.image, quantity: getQuantity(item.id) })}
                                >
                                  <img src="/flappycoins.png" alt="Coin" className="w-7 h-7 mr-2" />
                                  Buy for {(item.flappyCoinPrice * getQuantity(item.id)).toFixed(0)} Coins
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="power-ups">
                <div className="grid grid-cols-1 gap-6">
                  {powerUpItems.map((item) => {
                    const ownedCount = profile?.owned_power_ups?.[item.id] || 0;
                    const quantity = getQuantity(item.id);
                    const maxQuantity = 10;
                    const totalPiPrice = item.piPrice * quantity;
                    const totalFCPrice = item.flappyCoinPrice * quantity;
                    return (
                      <div key={item.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 border-2 border-purple-200">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xl font-bold text-purple-700 mb-1">{item.name}</div>
                          <div className="text-gray-600 mb-2 text-sm">{item.description}</div>
                          <div className="flex gap-3 mb-2 items-center">
                            {typeof (item as any).promoPiPrice === 'number' && (item as any).promoPiPrice < item.piPrice ? (
                              <>
                                <span className="bg-purple-100 text-purple-400 px-3 py-1 rounded-full font-semibold text-xs line-through opacity-60">{item.piPrice.toFixed(2)} Pi</span>
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-xs border-2 border-purple-400">{(item as any).promoPiPrice.toFixed(2)} Pi</span>
                              </>
                            ) : (
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof item.piPrice === 'number' ? item.piPrice.toFixed(2) : 'N/A'} Pi</span>
                            )}
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof item.flappyCoinPrice === 'number' ? item.flappyCoinPrice.toFixed(2) : 'N/A'} FC</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(item.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(item.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-purple-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(item.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="buy-pi-button bg-purple-600 text-white px-6 py-3 text-lg rounded-xl hover:bg-purple-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('pi', { ...item, image: item.image, quantity: getQuantity(item.id) })}
                            >
                              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                              Buy for {(item.piPrice * getQuantity(item.id)).toFixed(2)} Pi
                            </button>
                            <button
                              className="buy-coin-button bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('coins', { ...item, image: item.image, quantity: getQuantity(item.id) })}
                            >
                              <img src="/flappycoins.png" alt="Coin" className="w-7 h-7 mr-2" />
                              Buy for {(item.flappyCoinPrice * getQuantity(item.id)).toFixed(0)} Coins
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="coins">
                <div className="grid grid-cols-1 gap-6">
                  {coinShopItems.map((pkg) => {
                    const quantity = getQuantity(pkg.id);
                    const maxQuantity = 10;
                    const totalPiPrice = pkg.piPrice * quantity;
                    return (
                      <div key={pkg.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 border border-yellow-200">
                        <img src={pkg.image ? pkg.image : '/flappycoins.png'} alt={pkg.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xl font-bold text-yellow-700 mb-1">{pkg.name}</div>
                          <div className="text-gray-600 mb-2 text-sm">{pkg.coins.toLocaleString()} FC {pkg.bonusCoins ? `+${pkg.bonusCoins} Bonus` : ''}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <button className="px-2 py-1 bg-yellow-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(pkg.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(pkg.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-yellow-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-yellow-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(pkg.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="buy-pi-button bg-purple-600 text-white px-6 py-3 text-lg rounded-xl hover:bg-purple-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('pi', {
                                name: pkg.name,
                                description: pkg.description || '',
                                piAmount: pkg.piPrice * getQuantity(pkg.id),
                                image: pkg.image,
                                quantity: getQuantity(pkg.id),
                              })}
                            >
                              <img src="/flappycoins.png" alt="Flappy Coin" className="w-7 h-7 mr-2" />
                              {(pkg.piPrice * getQuantity(pkg.id)).toFixed(2)}
                            </button>
                            <button
                              className="buy-coin-button bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('coins', { ...pkg, image: pkg.image, quantity: getQuantity(pkg.id) })}
                            >
                              <img src="/flappycoins.png" alt="Coin" className="w-7 h-7 mr-2" />
                              Buy for {(pkg.flappyCoinPrice * getQuantity(pkg.id)).toFixed(0)} Coins
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="mystery-boxes">
                <div className="grid grid-cols-1 gap-6">
                  {mysteryBoxItems.map((box) => {
                    const quantity = getQuantity(box.id);
                    const maxQuantity = 10;
                    const totalPiPrice = box.piPrice * quantity;
                    const totalFCPrice = box.flappyCoinPrice * quantity;
                    return (
                      <div key={box.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 border border-pink-200">
                        <img src={box.image} alt={box.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xl font-bold text-pink-700 mb-1">{box.name}</div>
                          <div className="text-gray-600 mb-2 text-sm">{box.description}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <button className="px-2 py-1 bg-pink-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(box.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(box.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-pink-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-pink-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(box.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="buy-pi-button bg-purple-600 text-white px-6 py-3 text-lg rounded-xl hover:bg-purple-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('pi', { ...box, image: box.image, quantity: getQuantity(box.id) })}
                            >
                              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                              Buy for {(box.piPrice * getQuantity(box.id)).toFixed(2)} Pi
                            </button>
                            <button
                              className="buy-coin-button bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('coins', { ...box, image: box.image, quantity: getQuantity(box.id) })}
                            >
                              <img src="/flappycoins.png" alt="Coin" className="w-7 h-7 mr-2" />
                              Buy for {(box.flappyCoinPrice * getQuantity(box.id)).toFixed(0)} Coins
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="bundles">
                <div className="flex flex-col gap-6">
                  {[{ id: 'extra-life', name: 'Extra Life', image: '/powerups/Extra life.png', piPrice: 8, flappyCoinPrice: 8000 },
                    { id: 'coin-magnet', name: 'Coin Magnet', image: '/powerups/Coin Magnet.png', piPrice: 8, flappyCoinPrice: 8000 },
                    { id: '2x-coin-multiplier', name: '2x Coin Multiplier', image: '/powerups/2x Coin Multiplier.png', piPrice: 8, flappyCoinPrice: 8000 },
                    { id: 'shield', name: 'Shield', image: '/powerups/Shield.png', piPrice: 8, flappyCoinPrice: 8000 },
                    { id: 'turbo-start', name: 'Turbo Start', image: '/powerups/turbo-start.png', piPrice: 8, flappyCoinPrice: 8000 }
                  ].map((bundle) => {
                    const quantity = getQuantity(bundle.id);
                    const maxQuantity = 10;
                    const totalPiPrice = (bundle.piPrice || 0) * quantity;
                    const totalFCPrice = (bundle.flappyCoinPrice || 0) * quantity;
                    return (
                      <div key={bundle.id + '-bundle'} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 border-2 border-purple-200 relative">
                        {/* SALE BADGE */}
                        <div className={`absolute top-4 left-4 px-4 py-1 rounded-full font-bold text-xs shadow-lg z-10 border-2 border-white ${isSaleDay ? 'bg-red-600 text-white' : 'bg-gray-400 text-white'}`}>
                          {isSaleDay ? 'SALE' : 'Sale Over'}
                        </div>
                        {/* COUNTDOWN */}
                        {isSaleDay && (
                          <div className="absolute top-4 right-4 bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full font-semibold text-xs shadow">
                            Sale ends in: {saleCountdown()}
                          </div>
                        )}
                        <img src={bundle.image} alt={bundle.name + ' Bundle'} className="w-20 h-20 object-contain bg-purple-50 rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xl font-bold text-purple-700 mb-1">{bundle.name} Bundle</div>
                          <div className="text-gray-600 mb-2 text-sm">{`A bundle of 15 ${bundle.name}s (10 + 5 bonus) for more chances!`}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(bundle.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-purple-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="buy-pi-button bg-purple-600 text-white px-6 py-3 text-lg rounded-xl hover:bg-purple-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('pi', {
                                name: bundle.name,
                                description: `A bundle of 15 ${bundle.name}s (10 + 5 bonus) for more chances!`,
                                piAmount: bundle.piPrice * getQuantity(bundle.id),
                                image: bundle.image,
                                quantity: getQuantity(bundle.id),
                              })}
                            >
                              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                              Buy for {(bundle.piPrice * getQuantity(bundle.id)).toFixed(2)} Pi
                            </button>
                            <button
                              className="buy-coin-button bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('coins', { ...bundle, image: bundle.image, quantity: getQuantity(bundle.id) })}
                            >
                              <img src="/flappycoins.png" alt="Coin" className="w-7 h-7 mr-2" />
                              Buy for {(bundle.flappyCoinPrice * getQuantity(bundle.id)).toFixed(0)} Coins
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Pi Payment Modal */}
          <PiPaymentModal
            isOpen={paymentModal.type === 'pi' && !!paymentModal.item}
            onClose={() => setPaymentModal({ type: null, item: null, loading: false, success: false, error: null })}
            item={paymentModal.item ? {
              name: paymentModal.item.name,
              description: paymentModal.item.description,
              piAmount: paymentModal.item.piPrice && paymentQuantity ? Number((paymentModal.item.piPrice * paymentQuantity).toFixed(2)) : Number(paymentModal.item.piPrice?.toFixed(2)),
              image: paymentModal.item.image,
            } : null}
            onPayment={async () => ({ success: true, txid: 'mock-txid' })}
            onPaymentSuccess={() => setPaymentModal({ type: null, item: null, loading: false, success: false, error: null })}
          />

          {/* Flappy Coin Payment Modal */}
          <Dialog open={paymentModal.type === 'coins' && !!paymentModal.item} onOpenChange={() => setPaymentModal({ type: null, item: null, loading: false, success: false, error: null })}>
            <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl text-yellow-600 font-extrabold mb-2">Coin Payment</DialogTitle>
              </DialogHeader>
              {paymentModal.item && (
                <div className="flex flex-col items-center w-full">
                  <img src={paymentModal.item.image} alt={paymentModal.item.name} className="w-24 h-24 mb-3 drop-shadow-xl animate-bounce-slow" />
                  <div className="text-xl font-bold mb-1 text-gray-800">Confirm Coin Payment</div>
                  <div className="text-gray-600 text-sm mb-4">For: {paymentModal.item.name}</div>
                  {paymentModal.item.quantity > 1 && (
                    <div className="text-center text-lg font-semibold text-yellow-700 mt-2 mb-2">
                      You will receive: <span className="font-bold">{paymentModal.item.quantity} {paymentModal.item.name}{paymentModal.item.quantity > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <div className="w-full bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-lg px-3 py-1 rounded-full bg-yellow-300 text-yellow-900 shadow">
                        {typeof paymentModal.item?.flappyCoinPrice === 'number' && typeof paymentQuantity === 'number' ? `${paymentModal.item.flappyCoinPrice.toFixed(2)} FC x ${paymentQuantity} = ${(paymentModal.item.flappyCoinPrice * paymentQuantity).toFixed(2)} FC` : typeof paymentModal.item?.flappyCoinPrice === 'number' ? `${paymentModal.item.flappyCoinPrice.toFixed(2)} FC` : 'N/A FC'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 flex items-center">Payment Method:
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold"><img src='/flappycoins.png' alt='Coin' className='w-4 h-4 mr-1' />Trusted</span>
                      </span>
                      <span className="font-medium">Flappy Coins</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Your Flappy Coins will be used to complete this transaction.
                    </div>
                  </div>
                  {paymentModal.loading ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                      <img src="/flappycoins.png" alt="Coin" style={{ width: 64, height: 64, marginBottom: 16, animation: 'spin 1.2s linear infinite' }} />
                      <div className="text-xl font-bold text-yellow-700 mt-2 mb-2">Processing Coin Payment...</div>
                      <div className="text-base text-gray-600">Please wait while we complete your transaction.</div>
                    </div>
                  ) : paymentModal.success ? (
                    <div className="flex flex-col items-center">
                      <div className="text-green-500 text-4xl mb-2">✔</div>
                      <div className="text-green-700 font-bold mb-2">Payment Successful!</div>
                    </div>
                  ) : paymentModal.error ? (
                    <div className="flex flex-col items-center">
                      <div className="text-red-500 text-4xl mb-2">✖</div>
                      <div className="text-red-700 font-bold mb-2">{paymentModal.error}</div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                      <Button
                        className="w-full font-bold bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px]"
                        onClick={handleConfirmCoinPayment}
                      >
                        <img src='/flappycoins.png' alt='Coin' className='w-7 h-7 mr-2' />
                        Confirm Payment
                      </Button>
                      <button style={{backgroundColor:'#e0e0e0',color:'#333'}} className="w-full font-bold py-2 px-6 rounded-lg text-lg" onClick={() => setPaymentModal({ type: null, item: null, loading: false, success: false, error: null })}>
                        Cancel
                            </button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Envelope Modal for Serial Code */}
          {showSerialEnvelope && serialCode && serialCharacter && (
            <Dialog open={showSerialEnvelope} onOpenChange={() => setShowSerialEnvelope(false)}>
              <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
                <img src="/assets/img/envelope.png" alt="Envelope" className="w-24 h-24 mb-4 animate-bounce" />
                <div className="text-xl font-bold text-purple-700 mb-2">Congratulations!</div>
                <div className="text-gray-700 mb-2">You received a special code for your <span className="font-bold">{serialCharacter.name}</span>:</div>
                <div className="bg-gray-100 border border-purple-300 rounded-lg px-4 py-2 text-lg font-mono text-purple-700 mb-4 select-all">
                  {serialCode}
                </div>
                <div className="text-xs text-gray-500 mb-2">Keep this code safe! It will unlock a special door in the Flappy Wiki in the future.</div>
                <Button style={{backgroundColor:'#8b16f7',color:'#fff'}} className="w-full mt-2 font-bold">Close</Button>
              </DialogContent>
            </Dialog>
          )}

          {showCongratsModal && congratsItem && (
            <Dialog open={showCongratsModal} onOpenChange={() => setShowCongratsModal(false)}>
              <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
                <img src={congratsItem.image} alt={congratsItem.name} className="w-24 h-24 mb-4 animate-bounce" />
                <div className="text-xl font-bold text-purple-700 mb-2">Congratulations!</div>
                <div className="text-gray-700 mb-2">You bought <span className="font-bold">{congratsItem.name}</span>!</div>
                {congratsItem.rarity ? (
                  <Button className="mt-4 bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 font-bold" onClick={handleCongratsEquip}>
                    Equip Now
                  </Button>
                ) : null}
                <Button className="mt-2 bg-gray-200 text-gray-800 px-6 py-3 text-lg rounded-xl hover:bg-gray-300 font-bold" onClick={() => setShowCongratsModal(false)}>
                  Close
                </Button>
              </DialogContent>
            </Dialog>
          )}

          {/* Daily Reward Modal - ONLY FOR AUTHENTICATED USERS */}
          {isAuthenticated && showDailyReward && (
            <Dialog open={showDailyReward} onOpenChange={() => setShowDailyReward(false)}>
              <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
                <img src="/flappycoins.png" alt="Flappy Coins" className="w-24 h-24 mb-4 animate-bounce" />
                <div className="text-xl font-bold text-yellow-600 mb-2">Daily Login Reward</div>
                <div className="text-gray-700 mb-2">You received <span className="font-bold">{dailyRewardAmount} Flappy Coins</span> today!</div>
                <div className="text-sm text-gray-500 mb-4">Come back every 24 hours to increase your reward! (+100 FC per day streak)</div>
                <Button className="mt-4 bg-yellow-400 text-white px-6 py-3 text-lg rounded-xl hover:bg-yellow-500 transition-transform duration-200 hover:scale-105 font-bold" onClick={handleClaimDailyReward}>
                  Claim
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <EnhancedFooter 
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={false}
        setSoundEnabled={() => {}}
      />
      <SubscriptionPlansModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
        onPurchase={handleShopPlanPurchase}
      />
      
      {/* Unified Payment Modal */}
      <UnifiedPaymentModal
        paymentModal={paymentModal}
        onConfirm={handlePaymentConfirmation}
        onClose={closePaymentModal}
        onCancel={cancelPayment}
      />
    </div>
  );
};

export default ShopPage;
