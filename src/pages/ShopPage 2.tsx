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
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

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

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile, loading: profileLoading, refreshProfile, signOut, hasActiveSubscription } = useUserProfile();
  const { coins: flappyCoins, addCoins, setCoins } = useGameState();
  const { toast } = useToast();
  const { isPiBrowser } = usePiBrowserDetection();

  const [activeTab, setActiveTab] = useState<ShopTab>('characters');
  const [shopItems, setShopItems] = useState<ShopItem[]>([]); // State for shop items
  const [loading, setLoading] = useState(false); // Add loading state

  // Background music
  const { isPlaying, currentTrack } = useGlobalMusic();

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
    setPaymentModal((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Simulate coin payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // TODO: Deduct coins, update profile, etc.
      setPaymentModal((prev) => ({ ...prev, loading: false, success: true }));
      setTimeout(() => setPaymentModal({ type: null, item: null, loading: false, success: false, error: null }), 1500);
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

    setIsConfirmingPowerUpPurchase(false); // Close dialog immediately

    const quantity = selectedPowerUpItem.quantity || 1;
    try {
      if (powerUpPurchaseMethod === 'pi') {
        if (typeof window.Pi === 'undefined') {
          toast({
            title: "Pi SDK Not Available",
            description: "Cannot initiate Pi payment. Please ensure you are in the Pi Browser.",
            variant: "destructive"
          });
          return;
        }

        const item = selectedPowerUpItem;
        const totalPiPrice = item.piPrice * quantity;

        window.Pi.payments.charge({
          amount: totalPiPrice,
          memo: `Purchase of ${quantity} ${item.name} power-up(s)` ,
          metadata: { itemId: item.id, itemType: 'power_up', quantity },
          uid: profile.pi_user_id,
        }, {
          onReadyForServerApproval: async (paymentId: string) => {
            await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });

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

      } else if (powerUpPurchaseMethod === 'coins') {
        const totalFCPrice = selectedPowerUpItem.flappyCoinPrice * quantity;
        if (flappyCoins >= totalFCPrice) {
          const newCoinBalance = flappyCoins - totalFCPrice;
          const item = selectedPowerUpItem;

          await updateProfile({
            total_coins: newCoinBalance,
            owned_power_ups: {
              ...(profile.owned_power_ups || {}),
              [item.id]: ((profile.owned_power_ups || {})[item.id] || 0) + quantity
            }
          });
          setCoins(newCoinBalance);
          refreshProfile();

          toast({
            title: "Purchase Successful! 🎉",
            description: `You've received ${quantity} ${selectedPowerUpItem.name}(s) for ${totalFCPrice.toFixed(2)} FC!`,
            variant: "default"
          });
        } else {
          toast({
            title: "Insufficient FC",
            description: `You need ${(totalFCPrice - flappyCoins).toFixed(2)} more FC to purchase ${quantity} ${selectedPowerUpItem.name}(s).`, 
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Power-up purchase failed:", error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during power-up purchase. Please try again.",
        variant: "destructive"
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

      window.Pi.payments.charge({
        amount: pkg.piPrice,
        memo: 'Purchase of ' + pkg.coins + ' FC',
        metadata: { itemId: pkg.id, itemType: 'coins', coinsEarned: pkg.coins },
        uid: profile.pi_user_id,
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch('/api/pi/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          await fetch('/api/pi/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });

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

        window.Pi.payments.charge({
          amount: 6.99, // Fixed Pi price for Extra Life Bundle
          memo: 'Purchase of Extra Life Bundle',
          metadata: { itemId: 'extra-life-bundle', itemType: 'bundle' },
          uid: profile.pi_user_id,
        }, {
          onReadyForServerApproval: async (paymentId: string) => {
            await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });

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
        });

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
    if (!piBrowserRedirect.isInPiBrowser()) {
      piBrowserRedirect.handleAdWatchAttempt({ showModal: true });
      return;
    }
    
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
  const handleShopPlanPurchase = async (plan: any) => {
    if (!profile || profileLoading) {
      toast({
        title: 'Profile Not Loaded',
        description: 'Please wait for your profile to load before making a purchase.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (typeof window.Pi === 'undefined') {
        toast({
          title: 'Pi SDK Not Available',
          description: 'Cannot process Pi payments. Please ensure Pi Browser is used or SDK is loaded.',
          variant: 'destructive',
        });
        return;
      }

      // First, authenticate the user with proper scopes for payments
      console.log('🔐 Authenticating user for subscription purchase...');
      const authResult = await window.Pi.authenticate(['payments'], (incompletePayment) => {
        console.log('💰 Incomplete payment found during authentication:', incompletePayment);
      });

      if (!authResult || !authResult.user) {
        throw new Error('Pi authentication failed');
      }

      console.log('✅ User authenticated for subscription purchase:', authResult.user.username);

      toast({
        title: 'Processing Pi Payment',
        description: `Processing ${plan.price} Pi payment for ${plan.name}...`,
      });

      const amountPi = parseFloat(plan.price);

      // Use the official Pi.createPayment API
      window.Pi.createPayment({
        amount: amountPi,
        memo: `Flappy Pi Subscription: ${plan.name}`,
        metadata: { 
          planId: plan.id, 
          planName: plan.name, 
          amount: amountPi,
          username: authResult.user.username
        },
      }, {
        onReadyForServerApproval: function(paymentId: string) {
          // In a real application, send paymentId to your backend for approval
          toast({ title: 'Payment Ready for Approval', description: paymentId });
        },
        onReadyForServerCompletion: async function(paymentId: string, txid: string) {
          // In a real application, send paymentId and txid to your backend for completion and subscription activation
          toast({ title: 'Subscription Activated!', description: `Plan: ${plan.name}` });
          await refreshProfile();
        },
        onCancel: function(paymentId: string) {
          toast({ title: 'Pi Payment Cancelled', description: 'Your Pi transaction for subscription was cancelled.' });
        },
        onError: function(error: any, payment: any) {
          toast({ title: 'Payment Failed', description: 'Your Pi transaction for subscription could not be completed. ' + (error ? error.message : ''), variant: 'destructive' });
        },
      });
    } catch (error) {
      console.error('❌ Subscription purchase error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
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
    if (!selectedMysteryBoxItem || mysteryBoxPurchaseMethod !== 'coins' || !profile) return;

    setIsConfirmingMysteryBoxPurchase(false); // Close dialog immediately

    try {
      const item = selectedMysteryBoxItem;
      const boxPrice = item.flappyCoinPrice;

      if (flappyCoins < boxPrice) {
        toast({
          title: "Insufficient FC",
          description: `You need ${(boxPrice - flappyCoins).toFixed(2)} more FC to purchase the ${item.name}.`,
          variant: "destructive"
        });
        return;
      }

      if (isBoxPurchaseLimitReached(item.id)) {
        toast({
          title: "Daily Limit Reached",
          description: `You can only purchase 5 ${item.name}s per day.`, // Example message
          variant: "destructive"
        });
        return;
      }

      const newCoins = flappyCoins - boxPrice;
      setCoins(newCoins);
      await updateProfile({ total_coins: newCoins });

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
        await updateProfile({ total_coins: newCoins + rewardAmount }); // Add rewarded coins
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
        userId: profile.id,
        product: item.name,
        type: 'mysterybox',
        amount: boxPrice,
        currency: 'coins',
        transactionId: 'N/A'
      });

      await refreshProfile();

    } catch (error) {
      console.error("Mystery box purchase failed:", error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during purchase. Please try again.",
        variant: "destructive"
      });
    }
    setMysteryBoxPurchaseMethod(null);
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
      setShowSerialEnvelope(true);
      addReceipt({
        userId: profile.id,
        product: item.name,
        type: 'skin',
        amount: item.piPrice || item.flappyCoinPrice,
        currency: paymentModal.type === 'pi' ? 'pi' : 'coins',
        transactionId: uuidv4()
      });
    }
    // ...rest of purchase logic (update profile, inventory, etc.)
    setPaymentModal({ type: null, item: null, loading: false, success: false, error: null });
  };

  // Fix: Use a separate quantity state for payment modals
  const [paymentQuantity, setPaymentQuantity] = useState<number>(1);

  // When opening payment modal, set paymentQuantity
  const openPaymentModal = (type: 'pi' | 'coins', item: any, quantity: number = 1) => {
    setPaymentQuantity(quantity);
    setPaymentModal({ type, item, loading: false, success: false, error: null });
  };

  // Compact Pi button style
  const compactPiButtonClass = "w-full py-2.5 px-6 bg-[#A259FF] hover:bg-[#8B3DFF] text-white text-lg font-bold rounded-full border-none outline-none flex items-center justify-center gap-2 transition-all duration-150";
  // Compact FC button style
  const compactFCButtonClass = "w-full py-2.5 px-6 bg-[#FFD600] hover:bg-[#FFC300] text-[#7C5C00] text-lg font-bold rounded-full border-none outline-none flex items-center justify-center gap-2 transition-all duration-150";

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-200 to-blue-200">
      <BackgroundDecoration />
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200 p-0">
        <div className="w-full max-w-xl mx-auto relative pt-8 pb-16">
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black text-yellow-400 drop-shadow-lg tracking-wide" style={{ textShadow: '2px 4px 0 #2b3990' }}>SHOP</h1>
              <button
                className="ml-4 px-6 py-3 bg-[#A259FF] text-white font-extrabold text-lg rounded-full border-none outline-none flex items-center gap-2"
                onClick={() => navigate('/wiki')}
                aria-label="Go to Flappy Wiki"
              >
                <span role="img" aria-label="book">📖</span> Flappy Wiki
              </button>
            </div>
            <img src="/birds/bird_0.png" alt="Flappy Pi Bird" className="w-24 h-24 -mt-8 animate-bounce drop-shadow-2xl" />
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
                <TabsTrigger value="subscription">Subscription Plan</TabsTrigger>
                <TabsTrigger value="pi-adnetwork">Pi AdNetwork</TabsTrigger>
              </TabsList>
              <TabsContent value="characters">
                <div className="space-y-6">
                  {shopItems.map((item) => {
                    const owned = isOwned(item.id);
                    const equipped = isEquipped(item.id);
                    const soldOut = item.isLimited && item.supply !== undefined && item.supply <= 0;
                    const isDefaultSkin = item.isDefault;
                    return (
                      <div key={item.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 mb-2 border-2 border-blue-200 relative">
                        {/* SALE BADGE & COUNTDOWN (not for default skin) */}
                        {!isDefaultSkin && (
                          <>
                            <div className={`absolute top-4 left-4 px-4 py-1 rounded-full font-bold text-xs shadow-lg z-10 border-2 border-white ${saleActive ? 'bg-red-600 text-white' : 'bg-gray-400 text-white'}`}>{saleActive ? 'SALE' : 'Sale Over'}</div>
                            {saleActive && (
                              <div className="absolute top-4 right-4 bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full font-semibold text-xs shadow">
                                Sale ends in: {getCountdown()}
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
                            <button className="bg-yellow-300 text-blue-900 font-bold px-8 py-2 rounded-full border-4 border-yellow-500 shadow-md text-lg cursor-default" disabled>
                              EQUIPPED
                            </button>
                          ) : equipped ? (
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-8 py-2 rounded-full border-4 border-yellow-600 shadow-md text-lg" onClick={() => handleEquipSkin(item.id)}>
                              EQUIP
                            </button>
                          ) : soldOut ? (
                            <button className="bg-red-400 text-white font-bold px-8 py-2 rounded-full border-4 border-red-600 shadow-md text-lg cursor-not-allowed" disabled>
                              SOLD OUT
                            </button>
                          ) : item.isDefault ? null : (
                            <div className="flex gap-2 mt-2">
                              <Button
                                className={compactPiButtonClass}
                                onClick={() => openPaymentModal('pi', { ...item, image: item.image })}
                              >
                                <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span> Buy for {item.piPrice} Pi
                              </Button>
                              <Button
                                className={compactFCButtonClass}
                                onClick={() => openPaymentModal('coins', { ...item, image: item.image })}
                              >
                                <img src="/flappycoins.png" alt="Coin" className="w-6 h-6 mr-2" /> Buy for {item.flappyCoinPrice} Coins
                              </Button>
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
                          <div className="flex items-center gap-2 mt-2">
                            <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(item.id, Math.max(1, getQuantity(item.id) - 1))} disabled={getQuantity(item.id) === 1}>-</button>
                            <input type="number" min={1} max={10} value={getQuantity(item.id)} onChange={e => setItemQuantity(item.id, Math.max(1, Math.min(10, Number(e.target.value))))} className="w-10 text-center border border-purple-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(item.id, Math.min(10, getQuantity(item.id) + 1))} disabled={getQuantity(item.id) === 10}>+</button>
                            <div className="flex gap-2 mt-2">
                              <Button
                                className={compactPiButtonClass}
                                onClick={() => openPaymentModal('pi', { ...item, image: item.image, quantity: getQuantity(item.id) })}
                                disabled={getQuantity(item.id) < 1}
                              >
                                Buy for {Number(item.piPrice * getQuantity(item.id)).toFixed(2)} Pi
                              </Button>
                              <Button
                                className={compactFCButtonClass}
                                onClick={() => openPaymentModal('coins', { ...item, image: item.image, quantity: getQuantity(item.id) })}
                                disabled={getQuantity(item.id) < 1}
                              >
                                Buy for {Number(item.flappyCoinPrice * getQuantity(item.id)).toFixed(0)} Coins
                              </Button>
                            </div>
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
                      <div key={pkg.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 border-2 border-yellow-200">
                        <img src={pkg.image ? pkg.image : '/flappycoins.png'} alt={pkg.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xl font-bold text-yellow-700 mb-1">{pkg.name}</div>
                          <div className="text-gray-600 mb-2 text-sm">{pkg.coins.toLocaleString()} FC {pkg.bonusCoins ? `+${pkg.bonusCoins} Bonus` : ''}</div>
                          <div className="flex gap-3 mb-2 items-center">
                            {typeof (pkg as any).promoPiPrice === 'number' && (pkg as any).promoPiPrice < pkg.piPrice ? (
                              <>
                                <span className="bg-purple-100 text-purple-400 px-3 py-1 rounded-full font-semibold text-xs line-through opacity-60">{pkg.piPrice.toFixed(2)} Pi</span>
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-xs border-2 border-purple-400">{(pkg as any).promoPiPrice.toFixed(2)} Pi</span>
                              </>
                            ) : (
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof pkg.piPrice === 'number' ? pkg.piPrice.toFixed(2) : 'N/A'} Pi</span>
                            )}
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof pkg.flappyCoinPrice === 'number' ? pkg.flappyCoinPrice.toFixed(2) : 'N/A'} FC</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(pkg.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(pkg.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-purple-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(pkg.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                            <div className="flex gap-2 mt-2">
                              <Button
                                className={compactPiButtonClass}
                                onClick={() => openPaymentModal('pi', { ...pkg, image: pkg.image, quantity: getQuantity(pkg.id) })}
                                disabled={quantity < 1}
                              >
                                Buy for {Number(pkg.piPrice * getQuantity(pkg.id)).toFixed(2)} Pi
                              </Button>
                              <Button
                                className={compactFCButtonClass}
                                onClick={() => openPaymentModal('coins', { ...pkg, image: pkg.image, quantity: getQuantity(pkg.id) })}
                                disabled={quantity < 1}
                              >
                                Buy for {Number(pkg.flappyCoinPrice * getQuantity(pkg.id)).toFixed(0)} Coins
                              </Button>
                            </div>
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
                      <div key={box.id} className="flex items-center bg-white/80 rounded-2xl shadow-lg px-6 py-4 border-2 border-pink-200">
                        <img src={box.image} alt={box.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xl font-bold text-pink-700 mb-1">{box.name}</div>
                          <div className="text-gray-600 mb-2 text-sm">{box.description}</div>
                          <div className="flex gap-3 mb-2 items-center">
                            {typeof (box as any).promoPiPrice === 'number' && (box as any).promoPiPrice < box.piPrice ? (
                              <>
                                <span className="bg-purple-100 text-purple-400 px-3 py-1 rounded-full font-semibold text-xs line-through opacity-60">{box.piPrice.toFixed(2)} Pi</span>
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-xs border-2 border-purple-400">{(box as any).promoPiPrice.toFixed(2)} Pi</span>
                              </>
                            ) : (
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof box.piPrice === 'number' ? box.piPrice.toFixed(2) : 'N/A'} Pi</span>
                            )}
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof box.flappyCoinPrice === 'number' ? box.flappyCoinPrice.toFixed(2) : 'N/A'} FC</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(box.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(box.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-purple-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(box.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                            <div className="flex gap-2 mt-2">
                              <Button
                                className={compactPiButtonClass}
                                onClick={() => openPaymentModal('pi', { ...box, image: box.image, quantity: getQuantity(box.id) })}
                                disabled={quantity < 1}
                              >
                                Buy for {Number(box.piPrice * getQuantity(box.id)).toFixed(2)} Pi
                              </Button>
                              <Button
                                className={compactFCButtonClass}
                                onClick={() => openPaymentModal('coins', { ...box, image: box.image, quantity: getQuantity(box.id) })}
                                disabled={quantity < 1}
                              >
                                Buy for {Number(box.flappyCoinPrice * getQuantity(box.id)).toFixed(0)} Coins
                              </Button>
                            </div>
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
                        <div className={`absolute top-4 left-4 px-4 py-1 rounded-full font-bold text-xs shadow-lg z-10 border-2 border-white ${saleActive ? 'bg-red-600 text-white' : 'bg-gray-400 text-white'}`}>
                          {saleActive ? 'SALE' : 'Sale Over'}
                        </div>
                        {/* COUNTDOWN */}
                        {saleActive && (
                          <div className="absolute top-4 right-4 bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full font-semibold text-xs shadow">
                            Sale ends in: {getCountdown()}
                          </div>
                        )}
                        <img src={bundle.image} alt={bundle.name + ' Bundle'} className="w-20 h-20 object-contain bg-purple-50 rounded-xl p-2 border border-gray-200 shadow-sm mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xl font-bold text-purple-700 mb-1">{bundle.name} Bundle</div>
                          <div className="text-gray-600 mb-2 text-sm">A bundle of 15 {bundle.name}s (10 + 5 bonus) for more chances!</div>
                          <div className="flex gap-3 mb-2">
                            {typeof (bundle as any).promoPiPrice === 'number' && (bundle as any).promoPiPrice < bundle.piPrice ? (
                              <>
                                <span className="bg-purple-100 text-purple-400 px-3 py-1 rounded-full font-semibold text-xs line-through opacity-60">{bundle.piPrice.toFixed(2)} Pi</span>
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-xs border-2 border-purple-400">{(bundle as any).promoPiPrice.toFixed(2)} Pi</span>
                              </>
                            ) : (
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof bundle.piPrice === 'number' ? bundle.piPrice.toFixed(2) : 'N/A'} Pi</span>
                            )}
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof bundle.flappyCoinPrice === 'number' ? bundle.flappyCoinPrice.toFixed(2) : 'N/A'} FC</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                            <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(bundle.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-10 text-center border border-purple-300 mx-1 rounded" />
                            <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                            <div className="flex gap-2 mt-2">
                              <Button
                                className={compactPiButtonClass}
                                onClick={() => openPaymentModal('pi', { ...bundle, image: bundle.image, quantity: getQuantity(bundle.id) })}
                                disabled={quantity < 1}
                              >
                                Buy for {Number(bundle.piPrice * getQuantity(bundle.id)).toFixed(2)} Pi
                              </Button>
                              <Button
                                className={compactFCButtonClass}
                                onClick={() => openPaymentModal('coins', { ...bundle, image: bundle.image, quantity: getQuantity(bundle.id) })}
                                disabled={quantity < 1}
                              >
                                Buy for {Number(bundle.flappyCoinPrice * getQuantity(bundle.id)).toFixed(0)} Coins
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="subscription">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subscriptionPlans.map(plan => (
                    <div key={plan.id} className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg px-8 py-6 border-2 border-purple-200 relative overflow-visible">
                      {typeof (plan as any).badge === 'string' && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white px-4 py-1 rounded-full font-bold text-xs shadow-lg z-10 border-2 border-white">
                          {(plan as any).badge}
                        </div>
                      )}
                      <img src={plan.image} alt={plan.name} className="w-24 h-24 object-contain bg-white rounded-full border-4 border-purple-300 shadow-xl mb-4 object-cover" />
                      <div className="text-2xl font-bold text-purple-700 mb-1">{plan.name}</div>
                      <div className="text-gray-600 mb-2 text-sm text-center">{plan.description}</div>
                      <div className="flex gap-4 mb-4">
                        {typeof (plan as any).promoPiPrice === 'number' && (plan as any).promoPiPrice < plan.piPrice ? (
                          <>
                            <span className="bg-purple-100 text-purple-400 px-3 py-1 rounded-full font-semibold text-xs line-through opacity-60">{plan.piPrice.toFixed(2)} Pi</span>
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-xs border-2 border-purple-400">{(plan as any).promoPiPrice.toFixed(2)} Pi</span>
                          </>
                        ) : (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">{typeof plan.piPrice === 'number' ? plan.piPrice.toFixed(2) : 'N/A'} Pi</span>
                        )}
                        <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full font-bold text-lg shadow">{typeof plan.coinPrice === 'number' ? plan.coinPrice.toFixed(2) : 'N/A'} FC</span>
                      </div>
                      <ul className="mb-4 text-left w-full max-w-xs mx-auto">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 w-full max-w-xs mx-auto">
                        <div className="flex gap-2 mt-2">
                          <Button
                            className={compactPiButtonClass}
                            onClick={() => openPaymentModal('pi', { ...plan, image: plan.image, quantity: getQuantity(plan.id) })}
                          >
                            <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</span> Buy with Pi
                          </Button>
                          <Button
                            className={compactFCButtonClass}
                            onClick={() => openPaymentModal('coins', { ...plan, image: plan.image, quantity: getQuantity(plan.id) })}
                          >
                            <img src="/flappycoins.png" alt="Coin" className="w-6 h-6 mr-2" /> Buy with FC
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="pi-adnetwork">
                <div className="bg-yellow-400 rounded-t-2xl px-6 py-3 flex items-center gap-3 w-full">
                  <img src="/flappycoins.png" alt="Flappy Coin" className="w-7 h-7" />
                  <span className="text-lg font-bold text-white tracking-wide flex-1">Earn Flappy Coins</span>
                </div>
                <div className="bg-white rounded-b-2xl px-8 py-8 flex flex-col items-center w-full border-t-0 border-2 border-yellow-400">
                  <div className="flex items-center gap-4 mb-4">
                    <img src="/flappycoins.png" alt="Flappy Coin" className="w-16 h-16" />
                    <div>
                      <div className="text-2xl font-extrabold text-yellow-600 mb-1">Earn Flappy Coins</div>
                      <div className="text-gray-700 text-base font-medium">Watch a Pi Ad Network ad and get <span className="font-bold text-yellow-700">10 FC</span> instantly!</div>
                    </div>
                  </div>
                  <button
                    onClick={piBrowserRedirect.isInPiBrowser() && !isWatchingAd ? handleWatchAd : () => piBrowserRedirect.handleAdWatchAttempt({ showModal: true })}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mb-3 ${
                      piBrowserRedirect.isInPiBrowser() && !isWatchingAd
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-white disabled:opacity-50' 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={isWatchingAd || !piBrowserRedirect.isInPiBrowser()}
                  >
                    {!piBrowserRedirect.isInPiBrowser() 
                      ? '🌐 Pi Browser Required' 
                      : isWatchingAd 
                        ? 'Loading Ad...' 
                        : 'Watch Ad for 10 FC'
                    }
                  </button>
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
              onSuccess: () => {},
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
                    <div className="flex flex-col items-center py-8">
                      <Spinner className="text-yellow-500 w-16 h-16 mb-4" />
                      <div className="text-lg font-semibold text-yellow-700 mt-2">Loading...</div>
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
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 rounded-lg shadow-md" onClick={handleConfirmCoinPayment}>
                        <img src='/flappycoins.png' alt='Coin' className='w-6 h-6 mr-2' /> Confirm Payment
                      </Button>
                      <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg text-lg shadow-md" onClick={() => setPaymentModal({ type: null, item: null, loading: false, success: false, error: null })}>
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
                <Button onClick={() => setShowSerialEnvelope(false)} className="w-full mt-2">Close</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
