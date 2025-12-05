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
import { supabase } from '@/utils/supabaseClient';

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
  const { isAuthenticated } = usePiAuth();
  
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



  const [showSerialEnvelope, setShowSerialEnvelope] = useState(false);
  const [serialCode, setSerialCode] = useState<string | null>(null);
  const [serialCharacter, setSerialCharacter] = useState<ShopItem | null>(null);

  const APIKEY = "xaimdfajnizkjbp0dr28ez8nek9acrj9ptcuwy08buk0efihfyykov7smuy6d89z";

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
    // Use correct price for Pi payment
    let piAmount = 'piPrice' in item ? item.piPrice : 0;
    if ('promoPiPrice' in item && item.promoPiPrice && saleActive) {
      piAmount = item.promoPiPrice;
    }
    // For ShopItem, use getEffectivePiPrice
    if ('type' in item && item.type === 'skin') {
      piAmount = getEffectivePiPrice(item as ShopItem);
    }
    const paymentItem: PaymentItem = {
      id: item.id,
      name: item.name,
      type: item.type as any,
      piPrice: piAmount,
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
  }, [showPiPaymentModal, saleActive]);

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

  const [soldOutModalOpen, setSoldOutModalOpen] = useState(false);
  const [soldOutSkin, setSoldOutSkin] = useState<ShopItem | null>(null);

  // Fetch skin supply from Supabase and merge into shopItems
  const fetchSkinSupply = async () => {
    const { data, error } = await supabase.from('skin_supply').select('skin_id,current_supply');
    if (error) {
      console.error('Failed to fetch skin supply:', error);
      return {};
    }
    // Map skin_id to current_supply
    const supplyMap = {};
    data.forEach(row => {
      supplyMap[row.skin_id] = row.current_supply;
    });
    return supplyMap;
  };

  // Add this function to refresh supply after purchase
  const refreshSkinSupply = async () => {
    const supplyMap = await fetchSkinSupply();
    setShopItems(prevItems => prevItems.map(item => {
      if (item.type === 'skin') {
        const current_supply = supplyMap[item.id];
        return {
          ...item,
          current_supply: typeof current_supply === 'number' ? current_supply : item.current_supply
        };
      }
      return item;
    }));
  };

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
        // Fetch supply and merge
        const supplyMap = await fetchSkinSupply();
        const mergedItems = initialShopItems.map(staticItem => {
          const fetchedItem = fetchedItems.find(fi => fi.id === staticItem.id);
          const current_supply = supplyMap[staticItem.id];
          return {
            ...staticItem,
            ...fetchedItem,
            isDefault: staticItem.isDefault,
            current_supply: typeof current_supply === 'number' ? current_supply : staticItem.supply || null
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
      // Profile not loaded yet
    } else if (profile) {
      // Profile loaded successfully
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
      setReceiveItem({
        id: item.id,
        name: item.name,
        type: (isSkin ? 'skin' : 'powerup') as 'skin' | 'powerup',
        quantity: item.quantity || 1,
        rarity: item.rarity,
        image: item.image,
        description: item.description,
        price: item.flappyCoinPrice,
        currency: 'coins',
      });
      setShowReceiveModal(true);
      const inventoryItem: Omit<import('@/services/inventoryService').InventoryItem, 'purchasedAt'> = isSkin
        ? {
            id: item.id,
            name: item.name,
            type: 'skin',
            quantity: item.quantity || 1,
            rarity: item.rarity,
            image: item.image,
            description: item.description,
          }
        : {
            id: item.id,
            name: item.name,
            type: 'powerup',
            quantity: item.quantity || 1,
            rarity: item.rarity,
            image: item.image,
            description: item.description,
          };
      inventoryService.saveToInventory(inventoryItem);
      inventoryService.logTransaction(
        item.id,
        item.name,
        isSkin ? 'skin' : 'powerup',
        item.quantity || 1,
        item.flappyCoinPrice,
        'coins',
        'coins_payment',
        'completed'
      );
    } catch (e) {
      setPaymentModal((prev) => ({ ...prev, loading: false, error: 'Payment failed. Please try again.' }));
    }
  };

  const handleEquipSkin = async (skinId: string) => {
    if (!profile) return;
    try {
      await updateProfile({ selected_bird_skin: skinId });
      toast({
        title: "Skin Equipped! ✨",
        description: `You are now flying with the ${shopItems.find(item => item.id === skinId)?.name || skinId}.`,
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
      // Simulate payment
      await new Promise((resolve) => setTimeout(resolve, 1200));
      // Add quantity to inventory
      await updateProfile({
        owned_power_ups: {
          ...(profile.owned_power_ups || {}),
          [selectedPowerUpItem.id]: ((profile.owned_power_ups || {})[selectedPowerUpItem.id] || 0) + quantity
        }
      });
      addReceipt({
        userId: profile.id,
        product: `${quantity} ${selectedPowerUpItem.name}`,
        type: 'powerup',
        amount: totalPrice,
        currency: 'coins',
        transactionId: uuidv4()
      });
      refreshProfile();
      toast({
        title: "Purchase Successful! 🎉",
        description: `You've received ${quantity} ${selectedPowerUpItem.name}(s) with Pi!`,
        variant: "default"
      });
    } else if (powerUpPurchaseMethod === 'pi') {
      if (typeof window.Pi === 'undefined') {
        toast({
          title: "Pi SDK Not Available",
          description: "Cannot initiate Pi payment. Please ensure you are in the Pi Browser.",
          variant: "destructive"
        });
        return;
      }

      // First, authenticate the user with proper scopes for payments
      console.log('🔐 Authenticating user for power-up purchase...');
      const authResult = await window.Pi.authenticate(['payments'], (incompletePayment) => {
        console.log('💰 Incomplete payment found during authentication:', incompletePayment);
      });

      if (!authResult || !authResult.user) {
        throw new Error('Pi authentication failed');
      }

      console.log('✅ User authenticated for power-up purchase:', authResult.user.username);

      const item = selectedPowerUpItem;
      const totalPiPrice = item.piPrice * quantity;

      // Use the official Pi.createPayment API
      window.Pi.createPayment({
        amount: totalPiPrice,
        memo: `Purchase of ${quantity} ${item.name} power-up(s)`,
        metadata: { 
          itemId: item.id, 
          itemType: 'power_up', 
          quantity,
          username: authResult.user.username
        },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('🎯 Power-up payment ready for approval:', paymentId);
          // No backend call needed - Pi Network handles approval automatically
          console.log('✅ Power-up payment approved automatically');
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('🎯 Power-up payment ready for completion:', paymentId, txid);
          // No backend call needed - Pi Network handles completion automatically
          console.log('✅ Power-up payment completed automatically');
          // Add quantity to inventory
          await updateProfile({
            owned_power_ups: {
              ...(profile.owned_power_ups || {}),
              [item.id]: ((profile.owned_power_ups || {})[item.id] || 0) + quantity
            }
          });
          addReceipt({
            userId: profile.id,
            product: `${quantity} ${item.name}`,
            type: 'powerup',
            amount: totalPiPrice,
            currency: 'pi',
            transactionId: txid
          });
          refreshProfile();
          toast({
            title: "Purchase Successful! 🎉",
            description: `You've received ${quantity} ${item.name}(s) with Pi!`,
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
            description: `An error occurred during Pi payment: ${error.message || "Unknown error"}`,
            variant: "destructive"
          });
          console.error("Pi payment error:", error, payment);
        },
      });
    }
    setSelectedPowerUpItem(null);
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

      const pkg = selectedCoinPackage;

      // Create Pi payment with recipientAddress
      const paymentData = {
        amount: pkg.piPrice,
        memo: 'Purchase of ' + pkg.coins + ' FC',
        recipientAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
        metadata: { 
          itemId: pkg.id, 
          itemType: 'coins', 
          coinsEarned: pkg.coins,
          type: 'coin_purchase',
          game: 'flappy_pi',
          walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ'
        }
      };

      const paymentCallbacks = {
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

          setReceiveItem({
            id: pkg.id,
            name: `${pkg.coins} Flappy Coins`,
            type: 'coins',
            quantity: pkg.coins,
            image: pkg.image || '/flappycoins.png',
            description: `You received ${pkg.coins} Flappy Coins!`,
            price: pkg.piPrice,
            currency: 'pi',
            message: `Congrats! You bought ${pkg.coins} Flappy Coins. Claim your coins below.`
          });
          setShowReceiveModal(true);

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
      };

      // Create the payment using the callback-based API (no await)
      window.Pi.createPayment(paymentData, paymentCallbacks);
      console.log('✅ Coin payment initiated');
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

            // Save bundle to inventory like the test function
            const bundleItem = {
              id: 'extra-life-bundle',
              name: 'Extra Life Bundle',
              type: 'bundle' as const,
              quantity: 1,
              rarity: 'Rare' as const,
              image: '/powerups/extra-life.png',
              description: 'Contains 15 Extra Lives (10 + 5 bonus)'
            };
            
            inventoryService.saveToInventory(bundleItem);

            addReceipt({
              userId: profile.id,
              product: 'Extra Life Bundle',
              type: 'bundle',
              amount: 6.99,
              currency: 'pi',
              transactionId: txid
            });

            toast({
              title: "Bundle Added to Inventory! 📦",
              description: "Extra Life Bundle has been added to your inventory.",
              variant: "default"
            });

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
        await updateProfile({ total_coins: newCoins });

        // Save bundle to inventory like the test function
        const bundleItem = {
          id: 'extra-life-bundle',
          name: 'Extra Life Bundle',
          type: 'bundle' as const,
          quantity: 1,
          rarity: 'Rare' as const,
          image: '/powerups/Extra life.png',
          description: 'Contains 15 Extra Lives (10 + 5 bonus)'
        };
        
        inventoryService.saveToInventory(bundleItem);

        addReceipt({
          userId: profile.id,
          product: 'Extra Life Bundle',
          type: 'bundle',
          amount: bundlePrice,
          currency: 'coins',
          transactionId: 'N/A'
        });

        toast({
          title: "Bundle Added to Inventory! 📦",
          description: "Extra Life Bundle has been added to your inventory.",
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
      title: 'Processing Pi Payment',
      description: `Processing ${plan.price} Pi payment for ${plan.name}...`,
    });
    if (typeof window.Pi !== 'undefined') {
      const amountPi = parseFloat(plan.price);
      
      // Create Pi payment with recipientAddress
      const paymentData = {
        amount: amountPi,
        memo: `Flappy Pi Subscription: ${plan.name}`,
        recipientAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
        metadata: { 
          planId: plan.id, 
          planName: plan.name, 
          amount: amountPi,
          type: 'subscription_purchase',
          game: 'flappy_pi',
          walletAddress: 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ'
        }
      };

      const paymentCallbacks = {
        onReadyForServerApproval: function(paymentId: string) {
          console.log('🎯 Subscription payment ready for approval:', paymentId);
          // No backend call needed - Pi Network handles approval automatically
          console.log('✅ Subscription payment approved automatically');
        },
        onReadyForServerCompletion: async function(paymentId: string, txid: string) {
          console.log('🎯 Subscription payment ready for completion:', paymentId, txid);
          // No backend call needed - Pi Network handles completion automatically
          console.log('✅ Subscription payment completed automatically');
          
          toast({ title: 'Subscription Activated!', description: `Plan: ${plan.name}` });
          await refreshProfile();
        },
        onCancel: function(paymentId: string) {
          toast({ title: 'Pi Payment Cancelled', description: 'Your Pi transaction for subscription was cancelled.' });
        },
        onError: function(error: any, payment: any) {
          toast({ title: 'Payment Failed', description: 'Your Pi transaction for subscription could not be completed. ' + (error ? error.message : ''), variant: 'destructive' });
        },
      };

      // Create the payment using the callback-based API (no await)
      window.Pi.createPayment(paymentData, paymentCallbacks);
      console.log('✅ Subscription payment initiated');
    } else {
      toast({
        title: 'Pi SDK Not Available',
        description: 'Cannot process Pi payments. Please ensure Pi Browser is used or SDK is loaded.',
        variant: 'destructive',
      });
    }
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
          // Logic previously in confirmMysteryBoxPurchase for Pi payment
          // This will now be handled when PiPaymentModal confirms success

          // Update daily purchase count
          const today = new Date().toDateString();
          const currentPurchases = dailyBoxPurchases[item.id] || { count: 0, date: today };
          const updatedPurchases = { ...dailyBoxPurchases, [item.id]: { count: currentPurchases.count + 1, date: today } };
          setDailyBoxPurchases(updatedPurchases);

          // Simulate random reward for now
          const rewardType = Math.random() < 0.5 ? 'coins' : 'power-up';
          let rewardAmount = 0;
          let rewardName = '';

          if (rewardType === 'coins') {
            rewardAmount = Math.floor(Math.random() * 50) + 10; // 10-50 coins
            await updateProfile({ total_coins: (profile?.total_coins || 0) + rewardAmount });
            toast({
              title: "Mystery Box Reward! 💰",
              description: `You received ${rewardAmount} FC!`, // Customize later
              variant: "default"
            });
            rewardName = `${rewardAmount} FC`;
          } else {
            // Random power-up (e.g., 'turbo-start', 'extra-life', 'shield')
            const randomPowerUp = powerUpItems[Math.floor(Math.random() * powerUpItems.length)];
            const powerUpAmount = Math.floor(Math.random() * 3) + 1; // 1-3 of a power-up
            const currentPowerUps = profile?.owned_power_ups || {}; // Use owned_power_ups
            const updatedPowerUps = {
              ...currentPowerUps,
              [randomPowerUp.id]: (currentPowerUps[randomPowerUp.id] || 0) + powerUpAmount
            };
            await updateProfile({ owned_power_ups: updatedPowerUps }); // Update owned_power_ups
            toast({
              title: "Mystery Box Reward! ⚡",
              description: `You received ${powerUpAmount} ${randomPowerUp.name}!`, // Customize later
              variant: "default"
            });
            rewardName = `${powerUpAmount} ${randomPowerUp.name}`;
          }

          addReceipt({
            userId: profile?.id || '',
            product: item.name,
            type: 'mysterybox',
            amount: item.piPrice,
            currency: 'pi',
            transactionId: '' // Txid will be passed by Pi SDK to the modal's onSuccess
          });
          await refreshProfile();

          inventoryService.saveToInventory({
            id: item.id,
            name: item.name,
            type: 'mystery-box',
            quantity: 1,
            image: item.image,
            description: item.description || ''
          });
          setReceiveItem({
            id: item.id,
            name: item.name,
            type: 'mystery-box',
            quantity: 1,
            image: item.image,
            description: item.description || '',
            message: `Congrats! You bought a ${item.name}. Open your box below!`,
            showOpenButton: true
          });
          setShowReceiveModal(true);
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
      // Save mystery box to inventory like the test function
      const mysteryBoxItem = {
        id: selectedMysteryBoxItem.id,
        name: selectedMysteryBoxItem.name,
        type: 'mystery-box' as const,
        quantity: quantity,
        rarity: selectedMysteryBoxItem.id.includes('legendary') ? 'Legendary' : 
               selectedMysteryBoxItem.id.includes('rare') ? 'Rare' : 'Common',
        image: selectedMysteryBoxItem.image,
        description: selectedMysteryBoxItem.description
      };
      
      inventoryService.saveToInventory(mysteryBoxItem);
      
      // Update daily purchase count
      const today = new Date().toDateString();
      const updatedPurchases = { ...dailyBoxPurchases };
      const currentCount = updatedPurchases[selectedMysteryBoxItem.id]?.count || 0;
      updatedPurchases[selectedMysteryBoxItem.id] = { count: currentCount + quantity, date: today };
      setDailyBoxPurchases(updatedPurchases);
      localStorage.setItem('flappypi-daily-box-purchases', JSON.stringify(updatedPurchases));

      toast({
        title: 'Purchase Successful! 🎁',
        description: `Added ${quantity} ${selectedMysteryBoxItem.name} to your inventory.`,
      });

      setSelectedMysteryBoxItem(null);
      setIsConfirmingMysteryBoxPurchase(false);
      setMysteryBoxPurchaseMethod(null);
    } else if (mysteryBoxPurchaseMethod === 'pi') {
      // Handle Pi payment
      setPiModalItem({
        name: selectedMysteryBoxItem.name,
        description: selectedMysteryBoxItem.description,
        piAmount: selectedMysteryBoxItem.piPrice * quantity,
        image: selectedMysteryBoxItem.image,
        onSuccess: () => {
          // Save mystery box to inventory like the test function
          const mysteryBoxItem = {
            id: selectedMysteryBoxItem.id,
            name: selectedMysteryBoxItem.name,
            type: 'mystery-box' as const,
            quantity: quantity,
            rarity: selectedMysteryBoxItem.id.includes('legendary') ? 'Legendary' : 
                   selectedMysteryBoxItem.id.includes('rare') ? 'Rare' : 'Common',
            image: selectedMysteryBoxItem.image,
            description: selectedMysteryBoxItem.description
          };
          
          inventoryService.saveToInventory(mysteryBoxItem);
          
          // Update daily purchase count
          const today = new Date().toDateString();
          const updatedPurchases = { ...dailyBoxPurchases };
          const currentCount = updatedPurchases[selectedMysteryBoxItem.id]?.count || 0;
          updatedPurchases[selectedMysteryBoxItem.id] = { count: currentCount + quantity, date: today };
          setDailyBoxPurchases(updatedPurchases);
          localStorage.setItem('flappypi-daily-box-purchases', JSON.stringify(updatedPurchases));

          toast({
            title: 'Purchase Successful! 🎁',
            description: `Added ${quantity} ${selectedMysteryBoxItem.name} to your inventory.`,
          });

          setSelectedMysteryBoxItem(null);
          setIsConfirmingMysteryBoxPurchase(false);
          setMysteryBoxPurchaseMethod(null);
        }
      });
      setPiModalOpen(true);
    }
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

  // Create wrapper for payment confirmation to handle receive modal
  const handlePaymentConfirmationWrapper = useCallback(async () => {
    try {
      const result = await handlePaymentConfirmation();
      
      // Show receive modal for successful payments
      if (result.success && paymentModal.item) {
        const item = paymentModal.item;
        const quantity = item.quantity || 1;
        
        if (item.type === 'coins' && item.coins) {
          // For coins, show the total amount earned
          const totalCoins = item.coins * quantity;
          setReceiveItem({
            id: item.id,
            name: `${totalCoins} Flappy Coins`,
            type: 'coins',
            quantity: totalCoins,  // This is the coin amount, not quantity
            image: item.image || '/flappycoins.png',
            description: `You received ${totalCoins} Flappy Coins!`,
            price: item.piPrice,
            currency: paymentModal.type === 'pi' ? 'pi' : 'coins',
            message: `Congrats! You bought ${totalCoins} Flappy Coins. Claim your coins below.`
          });
          closePaymentModal(); // Close payment modal before showing receive modal
          setShowReceiveModal(true);
        } else {
          // For other items (subscriptions, etc.), show the standard receive modal
          setReceiveItem({
            ...item,
            price: item.piPrice || item.coinPrice || 0,
            currency: paymentModal.type === 'pi' ? 'pi' : 'coins'
          });
          closePaymentModal(); // Close payment modal before showing receive modal
          setShowReceiveModal(true);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }, [handlePaymentConfirmation, paymentModal]);

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
      setDailyRewardAmount(streakCount * 100);
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
  };

  // Add a helper to check if a skin is owned
  const isSkinOwned = (skinId: string) => {
    const inventory = inventoryService.getInventoryByType('skin');
    return inventory.some(item => item.id === skinId);
  };

  // Add a helper to check if a skin is equipped
  const isSkinEquipped = (skinId: string) => {
    const inventory = inventoryService.getInventoryByType('skin');
    return inventory.some(item => item.id === skinId && item.equipped);
  };

  // Add test mystery boxes and bundles
  const addTestMysteryBoxes = () => {
    inventoryService.saveToInventory({
      id: 'basic',
      name: 'Basic Mystery Box',
      type: 'mystery-box',
      quantity: 3,
      rarity: 'Common',
      image: '/boxes/basic-box.png',
      description: 'Contains random common and rare items'
    });
    
    inventoryService.saveToInventory({
      id: 'rare',
      name: 'Rare Mystery Box',
      type: 'mystery-box',
      quantity: 2,
      rarity: 'Rare',
      image: '/boxes/rare-box.png',
      description: 'Contains random rare and epic items'
    });
    
    inventoryService.saveToInventory({
      id: 'epic',
      name: 'Epic Mystery Box',
      type: 'mystery-box',
      quantity: 1,
      rarity: 'Epic',
      image: '/boxes/epic-box.png',
      description: 'Contains random epic and legendary items'
    });

    toast({
      title: 'Test Mystery Boxes Added! 🎁',
      description: 'Added basic, rare, and epic mystery boxes to your inventory.',
    });
  };

  const addTestBundles = () => {
    inventoryService.saveToInventory({
      id: 'starter_pack',
      name: 'Starter Pack',
      type: 'bundle',
      quantity: 2,
      rarity: 'Common',
      image: '/boxes/basic-box.png',
      description: 'Contains skin and powerups for beginners'
    });
    
    inventoryService.saveToInventory({
      id: 'premium_pack',
      name: 'Premium Pack',
      type: 'bundle',
      quantity: 1,
      rarity: 'Legendary',
      image: '/boxes/legendary-box.png',
      description: 'Contains legendary skin and premium items'
    });

    toast({
      title: 'Test Bundles Added! 📦',
      description: 'Added starter and premium bundles to your inventory.',
    });
  };

  // Add state for receive modal
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [receiveModalItem, setReceiveModalItem] = useState(null);

  // After successful payment (coin or Pi), show receive modal
  const handlePurchaseSuccess = async (item) => {
    // If Ultimate Plan, add Fire Phoenix skin
    if (item.id === 'ultimate-plan') {
      const infernoPhoenix: Omit<import('@/services/inventoryService').InventoryItem, 'purchasedAt'> = {
        id: 'bird-12',
        name: 'Fire Phoenix',
        type: 'skin',
        quantity: 1,
        rarity: 'Legendary',
        image: '/birds/Inferno-Phoenix.png',
        description: 'The ultimate legendary skin!'
      };
      inventoryService.saveToInventory(infernoPhoenix);
      setReceiveModalItem({ ...infernoPhoenix, price: item.price, currency: item.currency });
      setReceiveModalOpen(true);
      return;
    }
    setReceiveModalItem(item);
    setReceiveModalOpen(true);
  };

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveItem, setReceiveItem] = useState<any>(null);

  return (
    <div className="relative min-h-screen bg-sky-100">
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 border-b border-gray-200 shadow-sm">
        <Button onClick={handleBack} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
        <Button onClick={() => navigate('/inventory')} variant="outline" size="sm" className="text-blue-600 border-blue-300">
          Inventory
        </Button>
      </div>
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-sky-100 p-0">
        <div className="w-full max-w-xl mx-auto relative pt-8 pb-16">
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black text-yellow-400 drop-shadow-lg tracking-wide" style={{ textShadow: '2px 4px 0 #8b16f7' }}>SHOP</h1>
              <button
                className="ml-4 px-6 py-3 bg-[#A259FF] text-white font-extrabold text-lg rounded-full border-none outline-none flex items-center gap-2"
                onClick={() => navigate('/FullFlappyWikiPage')}
                aria-label="Go to Flappy Wiki"
              >
                <span role="img" aria-label="book">📖</span> Flappy Wiki
              </button>
            </div>
            <img src="/birds/bird_0.png" alt="Flappy Pi Bird" className="w-24 h-24 -mt-8 animate-bounce drop-shadow-2xl" />
            <WalletBalance className="ml-auto" />
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
                  {shopItems.filter(item => !item.locked).map((item) => {
                    const owned = isOwned(item.id);
                    const equipped = isEquipped(item.id);
                    const soldOut = item.isLimited && item.supply !== undefined && item.supply <= 0;
                    const isDefaultSkin = item.isDefault;
                    return (
                      <div key={item.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 mb-2 border-2 border-blue-200 relative">
                        {/* SALE BADGE & COUNTDOWN (not for default skin) */}
                        {!isDefaultSkin && (
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
                          {owned ? (
                            <Button
                              className={`w-full font-bold px-6 py-3 text-lg rounded-xl transition-transform duration-200 min-w-[160px] min-h-[56px] ${isSkinEquipped(item.id) ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                              onClick={() => handleEquipSkin(item.id)}
                              disabled={isSkinEquipped(item.id)}
                            >
                              {isSkinEquipped(item.id) ? 'Equipped' : 'Equip'}
                            </Button>
                          ) : soldOut ? (
                            <button style={{backgroundColor:'#e53935',color:'#fff'}} className="font-bold px-8 py-2 rounded-full border-4 border-red-600 text-lg cursor-not-allowed" disabled>
                              SOLD OUT
                            </button>
                          ) : item.isDefault ? null : (
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
                              onClick={() => openPaymentModal('pi', { ...pkg, image: pkg.image, quantity: getQuantity(pkg.id) })}
                            >
                              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span>
                              Buy for {(pkg.piPrice * getQuantity(pkg.id)).toFixed(2)} Pi
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
                  {[{ id: 'extra-life', name: 'Extra Life', image: '/powerups/extra-life.png', piPrice: 8, flappyCoinPrice: 8000 },
                    { id: 'coin-magnet', name: 'Coin Magnet', image: '/powerups/coin-magnet.png', piPrice: 8, flappyCoinPrice: 8000 },
                    { id: '2x-coin-multiplier', name: '2x Coin Multiplier', image: '/powerups/2x-coin-multiplier.png', piPrice: 8, flappyCoinPrice: 8000 },
                    { id: 'shield', name: 'Shield', image: '/powerups/shield.png', piPrice: 8, flappyCoinPrice: 8000 },
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
                          <div className="text-gray-600 mb-2 text-sm">A bundle of 15 {bundle.name}s (10 + 5 bonus) for more chances!</div>
                          <div className="flex items-center gap-2 mb-2">
                            <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(bundle.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-purple-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="buy-pi-button bg-purple-600 text-white px-6 py-3 text-lg rounded-xl hover:bg-purple-700 transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[160px] min-h-[56px] font-bold"
                              onClick={() => openPaymentModal('pi', { ...bundle, image: bundle.image, quantity: getQuantity(bundle.id) })}
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
              onSuccess: () => setPaymentModal({ type: null, item: null, loading: false, success: false, error: null }),
              skinId: paymentModal.item.id,
            } : null}
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
      <ItemReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        item={receiveModalItem}
      />
      {/* Item Receive Modal */}
      <ItemReceiveModal
        isOpen={showReceiveModal}
        onClose={() => {
          setShowReceiveModal(false);
          closePaymentModal(); // Also close the payment modal
        }}
        item={receiveItem}
      />
      
      {/* Unified Payment Modal */}
      <UnifiedPaymentModal
        paymentModal={paymentModal}
        onConfirm={handlePaymentConfirmationWrapper}
        onClose={closePaymentModal}
        onCancel={cancelPayment}
      />
    </div>
  );
};

export default ShopPage;
