import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameState } from '@/hooks/useGameState';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Coins as LucideCoinIcon, Gift, LifeBuoy, Magnet, Rocket, Shield, Bolt, Tag, Play, BookOpen, Diamond } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { shopItems as initialShopItems, ShopItem } from '@/constants/shopItems';
import { coinShopItems, CoinPackage } from '@/constants/coinShopItems';
import { powerUpItems, PowerUpItem } from '@/constants/powerUpItems';
import { mysteryBoxItems, MysteryBoxItem } from '@/constants/mysteryBoxItems';
import { cn } from '@/lib/utils';
import axios from 'axios';
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
import { unifiedPiPaymentService } from '@/services/unifiedPiPaymentService';
import { getSaleState, getItemDiscount, calculateDiscountedPrice, getCurrentSalePeriod, isItemOnSale, formatSaleCountdown } from '@/utils/saleUtils';
import PiPaymentModalV2 from '@/components/PiPaymentModalV2';
// Removed UnifiedPiPaymentModal import - using direct payments now
// Removed useUnifiedPiPayment hook import - using direct payments now

import EnhancedFooter from '@/components/EnhancedFooter';
import { inventoryService } from '@/services/inventoryService';
import ItemReceiveModal from '@/components/ItemReceiveModal';
import { useGameEquipment } from '@/hooks/useGameEquipment';
import type { InventoryItem } from '@/services/inventoryService';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';
import { useWallet } from '../context/WalletContext';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import WalletBalance from '@/components/WalletBalance';
import ConfirmationModal from '@/components/ConfirmationModal';
import { payWithPi, piAuthenticate } from '@/services/piPayment';
import { PI_CONFIG } from '@/config/piConfig';
import { sandboxPiPaymentService } from '@/services/sandboxPiPaymentService';
import { piMainnetPaymentService } from '@/services/piMainnetPaymentService';
import { realPiPaymentService } from '@/services/realPiPaymentService';
import { simplePiPaymentService } from '@/services/simplePiPaymentService';
import NetworkModeSwitcher from '@/components/NetworkModeSwitcher';
import FooterNPC from '../components/FooterNPC';
import { directPaymentService } from '@/services/directPaymentService';
import { officialPiPaymentService } from '@/services/officialPiPaymentService';
import { useSettings } from '../hooks/useSettings';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveButtonGrid } from '../components/game/ResponsiveGrid';
import SkyBackground from '../components/SkyBackground';
import { useLanguage } from '../context/LanguageContext';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { piBrowserRedirect } from '../utils/piBrowserRedirect';
import NFTNoteModal from '@/components/NFTNoteModal';


type ShopTab = 'characters' | 'coins' | 'power-ups' | 'mystery-boxes' | 'bundles' | 'accessories' | 'subscription' | 'pi-adnetwork';

const iconMap: { [key: string]: React.ElementType } = {
  LifeBuoy,
  Magnet,
  CoinIcon: LucideCoinIcon,
  Shield,
  Rocket,
  Gift,
  Bolt, // For general power-up icon if needed
  Tag, // Added for discount tag
  Play // Added for play icon
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

// Move shopNpcDialogs outside the component to fix dialog cycling
const shopNpcDialogs = [
  "Welcome to the Flappy Pi Shop! What can I help you find?",
  "We have the best skins and power-ups!",
  "Check out our mystery boxes for rare items!",
  "Coins can buy you amazing upgrades!",
  "The shop updates regularly with new items!",
  "Save your coins for special events!",
  "Legendary items are super rare and powerful!",
  "Rare items give you great advantages!",
  "Common items are perfect for beginners!",
  "Power-ups can help you survive longer!",
  "Skins make your bird look awesome!",
  "Mystery boxes contain random surprises!",
  "You can preview items before buying!",
  "Some items are limited time only!",
  "Check back daily for new deals!",
  "The shop accepts Flappy Coins and Pi!",
  "You can earn coins by playing the game!",
  "Watch ads to earn bonus coins!",
  "Invite friends to get shop discounts!",
  "The shop is always open for business!",
  "Quality guaranteed on all items!",
  "We have something for every player!",
  "Don't forget to check the sales!",
  "New items arrive every week!",
  "The shop loves loyal customers!",
  "Your satisfaction is our priority!",
  "Happy shopping and happy flapping!",
  "Come back soon for more deals!",
  "The shop is your one-stop shop for everything Flappy!"
];

const NPC_DIALOGS = [
  "Flap like nobody's watching!",
  "Those pipes look angry today...",
  // ... (rest of the 100 lines, omitted for brevity)
  "One more pipe and you're a legend!"
];

// Add this helper function near the top of the component:
function getItemImage(item) {
  if (!item) return '';
  
  // Power-ups
  if (item.type === 'powerup') {
    const powerUp = powerUpItems.find(p => p.id === item.id);
    return powerUp?.image || item.image;
  }
  
  // Skins - Enhanced logic for proper image loading
  if (item.type === 'skin') {
    // First try to find in shop items
    const shopSkin = initialShopItems.find(s => s.id === item.id);
    if (shopSkin?.image) {
      return shopSkin.image;
    }
    
    // If not found in shop items, try to construct the path
    if (item.id === 'inferno-phoenix') {
      return '/birds/bird_12.png';
    }
    
    // For other bird skins, try the bird_ pattern
    if (item.id?.startsWith('bird-')) {
      const birdNumber = item.id.split('-')[1];
      return `/birds/bird_${birdNumber}.png`;
    }
    
    // Fallback to item's own image
    return item.image || '/birds/bird_0.png';
  }
  
  // Mystery boxes
  if (item.type === 'mystery-box') {
    return item.image || `/boxes/${item.id}.png`;
  }
  
  // Bundles
  if (item.type === 'bundle') {
    return item.image || '/boxes/basic-box.png';
  }
  
  // Coins (Flappy Coin packages)
  if (item.type === 'coins' || item.id?.includes('coin') || item.name?.toLowerCase().includes('flappy coin')) {
    return '/flappycoins.png';
  }
  
  // Fallback
  return item.image || '/birds/bird_0.png';
}

// Utility to format date as 'Jul 11, 2025'
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Add this helper function near the top of the file (outside the component):
function inferItemType(item: any): InventoryItem['type'] {
  if ('rarity' in item) return 'skin';
  if ('effect' in item) return 'powerup';
  if ('rewards' in item) return 'mysterybox';
  if ('coins' in item) return 'coins';
  if (item.id === 'extra-life-bundle') return 'bundle';
  return 'skin'; // fallback
}

// Add organized button components at the top of the component
const ShopButton = ({ 
  type, 
  onClick, 
  disabled = false, 
  children, 
  className = "", 
  icon, 
  price,
  style
}: {
  type: 'pi' | 'coins' | 'equip' | 'unequip' | 'subscribe';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: string;
  price?: string;
  style?: React.CSSProperties;
}) => {
  const baseClasses = "font-bold px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px] min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const buttonStyles = {
    pi: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:scale-105",
    coins: "bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg hover:scale-105", 
    equip: "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105",
    unequip: "bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:scale-105",
    subscribe: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:scale-105"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${buttonStyles[type]} ${className}`}
      style={style}
    >
      {icon && <img src={icon} alt="" className="w-5 h-5" />}
      <span>{children}</span>
      {price && <span className="font-semibold ml-1">({price})</span>}
    </button>
  );
};

const ShopItemCard = ({ 
  item, 
  image, 
  title, 
  description, 
  price, 
  rarity, 
  isOwned, 
  isEquipped, 
  onBuyWithPi, 
  onBuyWithCoins, 
  onEquip, 
  onUnequip,
  children 
}: {
  item: any;
  image: string;
  title: string;
  description: string;
  price?: { pi?: number; coins?: number };
  rarity?: string;
  isOwned?: boolean;
  isEquipped?: boolean;
  onBuyWithPi?: () => void;
  onBuyWithCoins?: () => void;
  onEquip?: () => void;
  onUnequip?: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center bg-white/90 rounded-xl shadow-lg p-4 mb-4 border-2 border-gray-200 hover:border-purple-300 transition-all duration-200">
      {/* Item Image */}
      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
        <img 
          src={image} 
          alt={title} 
          className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm" 
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        {/* Title and Rarity */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {rarity && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              rarity === 'Common' ? 'bg-gray-200 text-gray-700' :
              rarity === 'Rare' ? 'bg-blue-200 text-blue-700' :
              rarity === 'Epic' ? 'bg-purple-200 text-purple-700' :
              rarity === 'Legendary' ? 'bg-yellow-200 text-yellow-700' :
              'bg-gray-200 text-gray-700'
            }`}>
              {rarity}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3">{description}</p>

        {/* Price Display */}
        {price && (
          <div className="flex flex-wrap gap-2 mb-3">
            {price.pi && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                {price.pi.toFixed(2)} Pi
              </span>
            )}
            {price.coins && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                {price.coins.toFixed(0)} FC
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {isOwned ? (
            <>
              {isEquipped ? (
                <>
                  <ShopButton type="equip" onClick={() => {}} disabled>
                    ✓ Equipped
                  </ShopButton>
                  {onUnequip && (
                    <ShopButton type="unequip" onClick={onUnequip}>
                      Unequip
                    </ShopButton>
                  )}
                </>
              ) : (
                onEquip && (
                  <ShopButton type="equip" onClick={onEquip}>
                    Equip
                  </ShopButton>
                )
              )}
            </>
          ) : (
            <>
              {onBuyWithCoins && (
                <ShopButton 
                  type="coins" 
                  onClick={onBuyWithCoins}
                  icon="/flappycoins.png"
                  price={price?.coins?.toFixed(0)}
                >
                  Buy with FC
                </ShopButton>
              )}
              {onBuyWithPi && (
                <ShopButton 
                  type="pi" 
                  onClick={onBuyWithPi}
                  icon="/pi-logo.png"
                  price={price?.pi?.toFixed(2)}
                >
                  Buy with Pi
                </ShopButton>
              )}
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile, loading: profileLoading, refreshProfile, signOut, hasActiveSubscription } = useUserProfile();
  const { coins: flappyCoins, addCoins, setCoins } = useGameState();
  const { toast } = useToast();
  const { isPiBrowser } = usePiBrowserDetection();
  const { equippedSkin } = useGameEquipment();
  const equippedSkinImg = getBirdImageSrc(equippedSkin);
  const { spendCoins, refreshBalance, balance } = useWallet();
  const { t } = useLanguage();
  const { isPlaying, currentTrack } = useGlobalMusic();

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

  // State for NFT note modal
  const [showNFTNoteModal, setShowNFTNoteModal] = useState(false);

  // Removed payment modal state - using direct payments now

  const [showSerialEnvelope, setShowSerialEnvelope] = useState(false);
  const [serialCode, setSerialCode] = useState<string | null>(null);
  const [serialCharacter, setSerialCharacter] = useState<ShopItem | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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

  // Add sale state management with real-time countdown
  const { isSaleDay: isGlobalSaleDay, periodEnd: globalPeriodEnd } = getSaleState();
  const currentSalePeriod = getCurrentSalePeriod();
  
  // Global countdown for main sale banner
  const globalCountdown = () => {
    if (!isGlobalSaleDay || !globalPeriodEnd) return '00:00:00';
    
    const diff = globalPeriodEnd.getTime() - currentTime;
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to get discounted price for an item
  const getDiscountedPrice = (item: ShopItem | PowerUpItem | MysteryBoxItem | CoinPackage) => {
    if (!isGlobalSaleDay || !item.piPrice) return null;
    
    // Only apply discounts to character skins and bundles
    // Character skins are in the shopItems array (ShopItem type)
    const isCharacterSkin = 'isDefault' in item || 'rarity' in item;
    // Bundles typically have bundle-related properties or are in bundles tab
    const isBundle = item.id?.includes('bundle') || item.name?.toLowerCase().includes('bundle');
    
    if (!isCharacterSkin && !isBundle) return null;
    
    const discountInfo = getItemDiscount(item.id, item.piPrice);
    if (!discountInfo.isOnSale) return null;
    
    return {
      originalPrice: item.piPrice,
      discountedPrice: discountInfo.finalPrice,
      discount: discountInfo.discount,
      discountPercent: discountInfo.discountPercent
    };
  };

  // Function to check if item is on sale
  const isItemOnSale = (item: ShopItem | PowerUpItem | MysteryBoxItem | CoinPackage) => {
    return getDiscountedPrice(item) !== null;
  };

  // Function to render price with discount
  const renderPriceWithDiscount = (item: ShopItem | PowerUpItem | MysteryBoxItem | CoinPackage) => {
    const discountInfo = getDiscountedPrice(item);
    
    if (!discountInfo) {
      return `${(item.piPrice * getQuantity(item.id)).toFixed(2)} Pi`;
    }

    return `${(discountInfo.discountedPrice * getQuantity(item.id)).toFixed(2)} Pi`;
  };

  // Function to render original price with strikethrough
  const renderOriginalPrice = (item: ShopItem | PowerUpItem | MysteryBoxItem | CoinPackage) => {
    const discountInfo = getDiscountedPrice(item);
    
    if (!discountInfo) {
      return null;
    }

    return (
      <div className="flex items-center gap-1 text-sm">
        <span className="line-through text-gray-500">{item.piPrice} Pi</span>
        <span className="text-red-600 font-bold">-{discountInfo.discount} Pi</span>
        <Tag className="w-4 h-4 text-red-600" />
      </div>
    );
  };

  // Function to render sale badge
  const renderSaleBadge = (item: ShopItem | PowerUpItem | MysteryBoxItem | CoinPackage) => {
    if (!isItemOnSale(item)) return null;
    
    const discountInfo = getDiscountedPrice(item);
    if (!discountInfo) return null;
    
    return (
      <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-red-400 z-20">
        <Tag className="w-3 h-3" />
        -{discountInfo.discount} Pi
      </div>
    );
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
        
        // Remove authentication-based locking - allow all users to buy skins
        const processedItems = mergedItems.map(item => {
          // Default skin is always unlocked
          if (item.isDefault) {
            return { ...item, locked: false };
          }
          
          // Fire Phoenix is special - only for Ultimate Pack subscribers
          if (item.id === 'inferno-phoenix' || item.id === 'inferno_phoenix') {
            return { ...item, locked: false, notForSale: true, claimByUltimatePack: true };
          }
          
          // All other items are unlocked for everyone - no authentication required
          return { ...item, locked: false };
        });
        

        setShopItems(processedItems);
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
        localStorage.removeItem('flappypi-daily-box-purchases');
      }
    }
  }, [profile, profileLoading, location.search]);

  useEffect(() => {
    // Save daily purchases to localStorage whenever it changes
    localStorage.setItem('flappypi-daily-box-purchases', JSON.stringify(dailyBoxPurchases));
  }, [dailyBoxPurchases]);

  // Listen for inventory updates to refresh UI
  useEffect(() => {
    const handleInventoryUpdate = () => {
      // Force re-render when inventory changes
      setShopItems([...shopItems]);
    };

    const handlePurchaseNotification = (event: CustomEvent) => {
      // Show ItemReceiveModal when purchase notification is received
      if (event.detail?.item) {
        setReceiveItem(event.detail.item);
        setShowReceiveModal(true);
      }
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener('show-purchase-notification', handlePurchaseNotification as EventListener);
    
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener('show-purchase-notification', handlePurchaseNotification as EventListener);
    };
  }, [shopItems]);

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

  const handleCharPurchaseAttempt = async (item: ShopItem, method: 'pi' | 'coins') => {
    if (method === 'pi') {
      // Use direct payment for Pi payments
      try {
        // Set toast function for the service
        directPaymentService.setToast(toast);
        
        // Create payment item
        const paymentItem = {
          id: item.id,
          name: item.name,
          description: item.description || item.name,
          piAmount: item.piPrice || 0,
          type: 'shop_item' as const
        };
        
        // Process direct payment
        const result = await directPaymentService.processShopItemPayment(paymentItem);
        
        if (result.success) {
          // Payment initiated successfully - items will be delivered via payment callback
          toast({
            title: "Payment Processing... ⏳",
            description: "Your payment is being processed. Items will be delivered upon completion.",
            duration: 3000,
          });
        }
      } catch (error) {
        toast({
          title: "Payment Failed",
          description: "Failed to process payment. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Handle coin payments (existing logic)
      // This would be the existing coin payment logic
    }
  };

  const [coinPaymentLoading, setCoinPaymentLoading] = useState(false);
  const [coinPaymentSuccess, setCoinPaymentSuccess] = useState(false);

  const handleConfirmCoinPayment = async (item: ShopItem, quantity: number = 1) => {
    const totalPrice = item.flappyCoinPrice * quantity;
    
    if (balance < totalPrice) {
      toast({
        title: 'Insufficient Flappy Coins',
        description: 'You do not have enough Flappy Coins to complete this purchase.',
        variant: 'destructive',
      });
      return;
    }
    setCoinPaymentLoading(true);
    try {
      // Deduct coins and save to inventory/cloud
      const success = await spendCoins(totalPrice, item.id);
      if (success) {
        // Determine item type based on the item
        let itemType = 'skin'; // default
        if (powerUpItems.some(p => p.id === item.id)) {
          itemType = 'powerup';
        } else if (mysteryBoxItems.some(m => m.id === item.id)) {
          itemType = 'mystery-box'; // Use correct type
        } else if ((item as any).type && ['skin','powerup','mystery-box','bundle','random_bundle','subscription'].includes((item as any).type)) {
          itemType = (item as any).type;
        } else {
          itemType = 'skin'; // fallback to a safe default
        }
        
        // Save to inventory with exact quantity
        inventoryService.saveToInventory({
          ...item,
          type: itemType as 'skin' | 'powerup' | 'mystery-box' | 'bundle' | 'random_bundle' | 'subscription',
          quantity: quantity // Ensure exact quantity is saved
        });
        
        await loadInventoryData(); // Refresh inventory
        
        // Pass exact quantity to receive modal
        setReceiveItem({ ...item, quantity: quantity });
        setShowReceiveModal(true); // Show receive modal
      } else {
        toast({
          title: 'Payment Failed',
          description: 'Payment failed. Not enough coins or error occurred.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      toast({
        title: 'Payment Failed',
        description: 'Payment failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCoinPaymentLoading(false);
    }
  };

  const isOwned = (itemId: string) => {
    // Check if skin exists in inventory
    const inventory = inventoryService.getInventoryByType('skin');
    return inventory.some(item => item.id === itemId);
  };

  const isEquipped = (itemId: string) => {
    // Check if skin is equipped in inventory
    const inventory = inventoryService.getInventoryByType('skin');
    return inventory.some(item => item.id === itemId && item.equipped);
  };

  const handleEquipSkin = async (skinId: string) => {
    try {
      const success = inventoryService.equipItem(skinId, 'skin');
      if (success) {
        toast({
          title: "Skin Equipped! ✨",
          description: `You are now flying with the ${shopItems.find(item => item.id === skinId)?.name || skinId}.`,
        });
        // Force refresh to update UI
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      } else {
        toast({
          title: "Equip Failed",
          description: "Could not equip skin. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Equip Failed",
        description: "Could not equip skin. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnequipSkin = async (skinId: string) => {
    try {
      const success = inventoryService.unequipItem(skinId, 'skin');
      if (success) {
        toast({
          title: "Skin Unequipped! 🎨",
          description: "Skin has been unequipped successfully.",
        });
        // Force refresh to update UI
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      } else {
        toast({
          title: "Unequip Failed",
          description: "Could not unequip skin. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Unequip Failed",
        description: "Could not unequip skin. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isCharacterAffordable = (item: ShopItem, method: 'pi' | 'coins') => {
    if (!profile) return false;
    if (method === 'pi') return profile.pi_balance !== undefined && profile.pi_balance >= item.piPrice;
    return balance >= item.flappyCoinPrice;
  };

  // Power-up Shop Logic
  const isPowerUpAffordable = (item: PowerUpItem, method: 'pi' | 'coins', quantity = 1) => {
    if (!profile) return false;
    if (method === 'pi') return profile.pi_balance !== undefined && profile.pi_balance >= item.piPrice * quantity;
    return balance >= item.flappyCoinPrice * quantity;
  };

  const handlePowerUpPurchaseAttempt = async (item: PowerUpItem, method: 'pi' | 'coins', quantity = 1) => {
    if (method === 'pi') {
      // Use direct payment for Pi payments
      try {
        directPaymentService.setToast(toast);
        
        const paymentItem = {
          id: item.id,
          name: item.name,
          description: item.description || item.name,
          piAmount: item.piPrice || 0,
          type: 'shop_item' as const
        };
        
        const result = await directPaymentService.processShopItemPayment(paymentItem);
        
        if (result.success) {
          // Add to inventory
          inventoryService.saveToInventory({
            ...item,
            type: 'powerup',
            quantity: quantity
          });
          await loadInventoryData();
          
          toast({
            title: "Purchase Successful! 🎉",
            description: `${item.name} has been added to your inventory.`,
          });
        }
      } catch (error) {
        toast({
          title: "Payment Failed",
          description: "Failed to process payment. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      setSelectedPowerUpItem({ ...item, quantity });
      setPowerUpPurchaseMethod(method);
      setIsConfirmingPowerUpPurchase(true);
    }
  };

  const confirmPowerUpPurchase = async () => {
    if (!selectedPowerUpItem || !powerUpPurchaseMethod || !profile) return;
    setIsConfirmingPowerUpPurchase(false);
    const quantity = selectedPowerUpItem.quantity || 1;
      const totalPrice = selectedPowerUpItem.flappyCoinPrice * quantity;
    
    if (powerUpPurchaseMethod === 'coins') {
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
      
      // Save the exact quantity to inventory
      inventoryService.saveToInventory({
        ...selectedPowerUpItem,
        type: 'powerup',
        quantity: quantity // Ensure exact quantity is saved
      });
      
      // Force sync with profile and refresh equipment
      if (profile) {
        const updatedPowerUps = {
          ...(profile.owned_power_ups || {}),
          [selectedPowerUpItem.id]: ((profile.owned_power_ups || {})[selectedPowerUpItem.id] || 0) + quantity
        };
        await updateProfile({ owned_power_ups: updatedPowerUps });
        
        // Force inventory sync
        inventoryService.syncWithProfilePowerUps(updatedPowerUps);
        
        // Dispatch custom event to force equipment refresh
        window.dispatchEvent(new CustomEvent('power-up-purchased', {
          detail: { powerUpId: selectedPowerUpItem.id, quantity: quantity }
        }));
      }
      
      await loadInventoryData();
      setSelectedPowerUpItem(null);
      setPowerUpPurchaseMethod(null);
      
      // Pass exact quantity to receive modal
      setReceiveItem({ ...selectedPowerUpItem, quantity: quantity });
      setShowReceiveModal(true);
    } else if (powerUpPurchaseMethod === 'pi') {
      try {
        // REMOVED: Pi Browser requirement checks - allow payments from any browser

        const item = selectedPowerUpItem;
        const totalPiPrice = item.piPrice * quantity;
        

        
        // Create Pi payment using official service
        const result = await officialPiPaymentService.processShopPayment({
          id: item.id,
          name: item.name,
          amount: totalPiPrice,
          type: 'power_up',
          metadata: {
            itemType: 'power_up',
            quantity: quantity,
            game: 'flappy_pi',
            timestamp: Date.now()
          }
        });

        if (result.success && result.txid) {
          // Add to inventory after successful payment
          inventoryService.saveToInventory({
            ...item,
            type: 'powerup',
            quantity: quantity
          });
          
          // Force sync with profile and refresh equipment
          if (profile) {
            const updatedPowerUps = {
              ...(profile.owned_power_ups || {}),
              [item.id]: ((profile.owned_power_ups || {})[item.id] || 0) + quantity
            };
            await updateProfile({ owned_power_ups: updatedPowerUps });
            
            // Force inventory sync
            inventoryService.syncWithProfilePowerUps(updatedPowerUps);
            
            // Dispatch custom event to force equipment refresh
            window.dispatchEvent(new CustomEvent('power-up-purchased', {
              detail: { powerUpId: item.id, quantity: quantity }
            }));
          }
          
          loadInventoryData();
          
          // Generate receipt
          addReceipt({
            userId: profile.id,
            product: `${item.name} x${quantity}`,
            type: 'powerup',
            amount: totalPiPrice,
            currency: 'pi',
            transactionId: result.txid
          });

          setSelectedPowerUpItem(null);
          setPowerUpPurchaseMethod(null);
          
          // Pass exact quantity to receive modal
          setReceiveItem({ ...item, quantity: quantity });
          setShowReceiveModal(true);

          toast({
            title: "🎉 Payment Successful!",
            description: `${item.name} x${quantity} added to your inventory!`,
            duration: 4000
          });
        } else {
          throw new Error(result.error || 'Payment failed');
        }

        
      } catch (error: any) {
        toast({
          title: "Payment Error",
          description: error.message || "Payment failed. Please try again.",
          variant: "destructive",
        });
      }
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
    const quantity = getQuantity(selectedCoinPackage.id);

    try {
      // REMOVED: Pi Browser requirement checks - allow payments from any browser

      const pkg = selectedCoinPackage;
      const totalPiPrice = pkg.piPrice * quantity;
      
      

      // Use official payment service for coin purchase
      const result = await officialPiPaymentService.processShopPayment({
        id: pkg.id,
        name: `${pkg.coins * quantity} FC`,
        amount: totalPiPrice,
        type: 'coins',
        metadata: {
          coinsEarned: pkg.coins * quantity,
          quantity,
          game: 'flappy_pi',
          timestamp: Date.now()
        }
      });

      if (result.success && result.txid) {
        // Apply rewards
        const newCoinBalance = (profile.total_coins || 0) + (pkg.coins * quantity);
        updateProfile({ total_coins: newCoinBalance });
        setCoins(newCoinBalance);
        
        // Generate receipt
        addReceipt({
          userId: profile.id,
          product: `${pkg.coins * quantity} FC`,
          type: 'coins',
          amount: totalPiPrice,
          currency: 'pi',
          transactionId: result.txid
        });

        toast({
          title: "🎉 Purchase Successful!",
          description: `You've received ${pkg.coins * quantity} FC!`,
          variant: "default"
        });
      } else {
        throw new Error(result.error || 'Payment failed');
      }

      
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Payment failed. Please try again.",
        variant: "destructive",
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
  const handleExtraLifeBundlePurchaseAttempt = async (method: 'pi' | 'coins') => {
    const quantity = getQuantity('extra-life-bundle');
    const bundleItem = { 
      id: 'extra-life-bundle',
      name: 'Extra Life Bundle',
      piPrice: 6.99,
      flappyCoinPrice: 6999,
      image: '/powerups/extra-life.png',
      description: 'Contains 15 Extra Lives (10 + 5 bonus)',
      type: 'bundle'
    };
    
    await handleDirectPayment(bundleItem, method, quantity);
  };

  const confirmExtraLifeBundlePurchase = async () => {
    if (!profile || !extraLifeBundleMethod) return;

    setIsConfirmingExtraLifeBundle(false);
    const quantity = getQuantity('extra-life-bundle');

    try {
      if (extraLifeBundleMethod === 'pi') {
        try {
          if (typeof window.Pi === 'undefined') {
            throw new Error('Pi SDK not available. Please use Pi Browser.');
          }
          
          // REMOVED: Pi Browser requirement checks - allow payments from any browser

          const totalPiPrice = 6.99 * quantity;
          
  
          
          // Use official payment service for bundle purchase
          const result = await officialPiPaymentService.processShopPayment({
            id: 'extra-life-bundle',
            name: 'Extra Life Bundle',
            amount: totalPiPrice,
            type: 'bundle',
            metadata: {
              quantity,
              game: 'flappy_pi',
              timestamp: Date.now()
            }
          });

          if (result.success && result.txid) {
            // Save bundle to inventory with exact quantity
            const bundleItem = {
              id: 'extra-life-bundle',
              name: 'Extra Life Bundle',
              type: 'bundle' as const,
              quantity: quantity,
              rarity: 'Rare' as const,
              image: '/powerups/extra-life.png',
              description: 'Contains 15 Extra Lives (10 + 5 bonus)'
            };
            
            inventoryService.saveToInventory(bundleItem);

            addReceipt({
              userId: profile.id,
              product: 'Extra Life Bundle',
              type: 'bundle',
              amount: totalPiPrice,
              currency: 'pi',
              transactionId: result.txid
            });

            toast({
              title: "🎉 Purchase Successful!",
              description: `Extra Life Bundle x${quantity} has been added to your inventory!`,
              variant: "default"
            });
          } else {
            throw new Error(result.error || 'Payment failed');
          }
  
          
        } catch (error: any) {
          toast({
            title: "Payment Error",
            description: error.message || "Payment failed. Please try again.",
            variant: "destructive",
          });
        }

      } else if (extraLifeBundleMethod === 'coins') {
        const bundlePrice = 6999 * quantity; // Use quantity in price calculation
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

        // Save bundle to inventory with exact quantity
        const bundleItem = {
          id: 'extra-life-bundle',
          name: 'Extra Life Bundle',
          type: 'bundle' as const,
          quantity: quantity, // <-- Use the exact selected quantity
          rarity: 'Rare' as const,
          image: '/powerups/extra-life.png',
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
          description: `Extra Life Bundle x${quantity} has been added to your inventory.`,
          variant: "default"
        });
        await refreshProfile();
      }
    } catch (error) {
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
      piBrowserRedirect.showPiBrowserMessage();
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

  // Removed handleShopPlanPurchase function - testnetPaymentService not defined

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
    if (!selectedMysteryBoxItem || !mysteryBoxPurchaseMethod) return;
    const quantity = getQuantity(selectedMysteryBoxItem.id);
    const totalPrice = selectedMysteryBoxItem.flappyCoinPrice * quantity;
    
    if (mysteryBoxPurchaseMethod === 'coins') {
      const success = await spendCoins(totalPrice, `Shop purchase: ${selectedMysteryBoxItem.name}`);
      if (!success) {
        toast({
          title: 'Insufficient Coins',
          description: `You need ${(totalPrice - balance).toFixed(2)} more FC to purchase the ${selectedMysteryBoxItem.name}.`,
          variant: 'destructive',
        });
        return;
      }
      await refreshBalance();
      
      // Save the exact quantity to inventory
      inventoryService.saveToInventory({
        ...selectedMysteryBoxItem,
        type: 'mysterybox',
        quantity: quantity // Ensure exact quantity is saved
      });
      await loadInventoryData();
      setSelectedMysteryBoxItem(null);
      setMysteryBoxPurchaseMethod(null);
      
      // Pass exact quantity to receive modal
      setReceiveItem({ ...selectedMysteryBoxItem, quantity: quantity });
      setShowReceiveModal(true);
      } else if (mysteryBoxPurchaseMethod === 'pi') {
      try {
        if (typeof window.Pi === 'undefined') {
          throw new Error('Pi SDK not available. Please use Pi Browser.');
        }
        
        const item = selectedMysteryBoxItem;
        const totalPiPrice = item.piPrice * quantity;
        
        // Use official payment service for mystery box purchase
        const result = await officialPiPaymentService.processShopPayment({
          id: item.id,
          name: item.name,
          amount: totalPiPrice,
          type: 'shop_item',
          metadata: {
            type: 'mystery-box',
            itemId: item.id,
            itemType: 'mystery-box',
            quantity,
            game: 'flappy_pi',
            timestamp: Date.now()
          }
        });

        if (result.success && result.txid) {
          // Save to inventory
          inventoryService.saveToInventory({
            ...item,
            type: 'mysterybox',
            quantity: quantity
          });
          loadInventoryData();
          
          // Generate receipt
          addReceipt({
            userId: profile.id,
            product: `${item.name} x${quantity}`,
            type: 'mystery-box',
            amount: totalPiPrice,
            currency: 'pi',
            transactionId: result.txid
          });

          setSelectedMysteryBoxItem(null);
          setMysteryBoxPurchaseMethod(null);
          
          // Pass exact quantity to receive modal
          setReceiveItem({ ...item, quantity: quantity });
          setShowReceiveModal(true);

          toast({
            title: "🎉 Payment Successful!",
            description: `${item.name} x${quantity} added to your inventory!`,
            duration: 4000
          });
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } catch (error: any) {
        toast({
          title: "Payment Error",
          description: error.message || "Payment failed. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const isMysteryBoxAffordable = (item: MysteryBoxItem, method: 'pi' | 'coins') => {
    if (!profile) return false;
    if (method === 'pi') return profile.pi_balance !== undefined && profile.pi_balance >= item.piPrice;
    return balance >= item.flappyCoinPrice;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ShopTab);
  };

  // Removed handleConfirmCharPurchase - using direct payments now

  // Fix: Use a separate quantity state for payment modals
  const [paymentQuantity, setPaymentQuantity] = useState<number>(1);

  // Removed payment modal functions - using direct payments now

  // Removed handleConfirmPiPayment - using direct payments now

  // Removed handleCancelPiPayment - using direct payments now

  // Removed handlePiPaymentSuccess - using direct payments now

  // Generic function to handle direct payments for different item types
  const handleDirectPayment = async (item: any, method: 'pi' | 'coins', quantity: number = 1) => {
    if (method === 'pi') {
      try {
        // Use official payment service for all payments
        const result = await officialPiPaymentService.processShopPayment({
          id: item.id,
          name: item.name,
          amount: item.piPrice || 0,
          type: 'shop_item',
          metadata: {
            itemType: item.type || 'shop_item',
            quantity: quantity,
            game: 'flappy_pi',
            timestamp: Date.now()
          }
        });
        
        if (result.success && result.txid) {
          toast({
            title: "Payment Successful! 🎉",
            description: `${item.name} has been purchased successfully.`,
          });
          
          // Add item to inventory or handle success
          if (item.type === 'powerup') {
            inventoryService.saveToInventory({
              ...item,
              type: 'powerup',
              quantity: quantity
            });
          }
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "Failed to process payment. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Handle coin payments
      await handleConfirmCoinPayment(item, quantity);
    }
  };

  // Sale logic with real-time countdown
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { isSaleDay, msLeft, periodEnd } = getSaleState();
  const salePeriod = Math.floor((Date.now() - Date.UTC(2025, 5, 1, 0, 0, 0, 0)) / (24 * 60 * 60 * 1000));
  
  // Real-time countdown update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const saleCountdown = () => {
    if (!isSaleDay || !periodEnd) return '00:00:00';
    
    const diff = periodEnd.getTime() - currentTime;
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
    if (!profile) return;
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
  }, [profile]);

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

  // Add a helper to check if a skin is owned
  const isSkinOwned = (skinId: string) => {
    const normalizedId =
      skinId === 'golden_phoenix' || skinId === 'golden-phoenix' || skinId === 'goldenphoenix' ? 'bird-6' : skinId;
    const inventory = inventoryService.getInventoryByType('skin');
    return inventory.some(item => {
      if (
        item.id === 'bird-6' &&
        (skinId === 'golden_phoenix' || skinId === 'golden-phoenix' || skinId === 'goldenphoenix' || skinId === 'bird-6')
      ) {
        return true;
      }
      return item.id === normalizedId;
    });
  };

  // Add a helper to check if a skin is equipped
  const isSkinEquipped = (skinId: string) => {
    const normalizedId =
      skinId === 'golden_phoenix' || skinId === 'golden-phoenix' || skinId === 'goldenphoenix' ? 'bird-6' : skinId;
    const inventory = inventoryService.getInventoryByType('skin');
    return inventory.some(item => {
      if (
        item.id === 'bird-6' && item.equipped &&
        (skinId === 'golden_phoenix' || skinId === 'golden-phoenix' || skinId === 'goldenphoenix' || skinId === 'bird-6')
      ) {
        return true;
      }
      return item.id === normalizedId && item.equipped;
    });
  };

  // Add state for receive modal
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [receiveModalItem, setReceiveModalItem] = useState(null);

  // Payment success handler - items are now delivered via payment callback
  const handlePurchaseSuccess = (item) => {
    // Items are now delivered automatically via payment callback
    // No need to manually add items here - they're handled in directPaymentService
  };

  const handleSubscribeToUltimate = () => {
    setShowSubscriptionModal(true);
  };

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveItem, setReceiveItem] = useState<any>(null);

  const [showCoinConfirm, setShowCoinConfirm] = useState(false);
  const [showPiConfirm, setShowPiConfirm] = useState(false);
  const [pendingPiPayment, setPendingPiPayment] = useState<any>(null);
  // Removed payment modal state variables - using direct payments now

  // Add a simple loadInventoryData function to avoid ReferenceError
  const loadInventoryData = () => {
    // If you have a real inventory refresh, call it here. For now, this is a placeholder.
    // Example: inventoryService.refreshInventory();
  };

  // Add state for coin receive modal
  const [showCoinReceiveModal, setShowCoinReceiveModal] = useState(false);
  const [coinReceiveAmount, setCoinReceiveAmount] = useState(0);

  const [showPiLogin, setShowPiLogin] = useState(false);

  // Removed handleBuyWithPi - using direct payments now


  // 1. Add a helper to check for mainnet mode - now using mainnet for all environments
  const isTestEnv = false; // Force mainnet mode

  // Removed handleTestPiPayment function - piPaymentService not defined

  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  // Unified Pi Payment Hook
  // Removed useUnifiedPiPayment hook - using direct payments now

  // Removed payment success handler - using direct payments now

  // Removed payment error handler - using direct payments now

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen w-full">
          <div className="max-w-5xl w-full mx-auto flex flex-col flex-1">
            <div className="relative min-h-screen bg-sky-100">
              {/* Responsive header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-gray-200 shadow-sm">
                <Button onClick={handleBack} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 text-sm">
                  ← Back
                </Button>
                <h1 className="text-xl font-bold text-gray-900">{t('shop')}</h1>
                <div className="flex items-center gap-3">
                  <img src={equippedSkinImg} alt="Flappy Pi Bird" className="w-12 h-12 animate-bounce drop-shadow-2xl" />
                  <WalletBalance className="w-full" />
                </div>
              </div>
              
              <div className="min-h-screen w-full flex flex-col items-center justify-start bg-sky-100 p-0">
                <div className="w-full max-w-6xl mx-auto relative pt-4 pb-16 px-4">
                  {/* Responsive header section */}
                  <div className="flex flex-col items-center justify-center mb-6 px-4 gap-4 w-full">
                    <div className="flex flex-col items-center gap-4 w-full">
                      <h1 className="text-4xl font-black text-yellow-400 drop-shadow-lg tracking-wide text-center" style={{ textShadow: '2px 4px 0 #8b16f7' }}>SHOP</h1>
                    </div>
                  </div>

                  {/* Sale Banner */}
                  {isGlobalSaleDay && (
                    <div className="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white p-4 rounded-xl mb-6 shadow-xl border-2 border-red-400 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Tag className="w-6 h-6 text-white animate-bounce" />
                          <div>
                            <h3 className="text-lg font-bold">🎉 FLAPPY PI SALE! 🎉</h3>
                            <p className="text-sm opacity-90">Limited time discounts on select items!</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs opacity-75">Sale ends in:</div>
                          <div className="text-lg font-bold font-mono">{globalCountdown()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {loading ? (
                    <ResponsiveContainer>
                      <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
                        <Spinner className="text-purple-600 w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6" />
                        <div className="text-xl sm:text-2xl font-bold text-purple-700">Loading...</div>
                      </div>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer>
                      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ShopTab)} className="w-full">
                        {/* Responsive tabs */}
                        {/* NFT Note Button */}
                        <div className="mb-4 flex justify-center">
                          <Button
                            onClick={() => setShowNFTNoteModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg border-2 border-purple-400 hover:border-purple-300 transition-all duration-300 transform hover:scale-105"
                          >
                            <Diamond className="w-5 h-5 mr-2" />
                            🚀 Future NFT Skins - Learn More!
                          </Button>
                        </div>

                        <TabsList className="flex flex-row gap-2 mb-6 overflow-x-auto w-full max-w-full whitespace-nowrap bg-white/80 rounded-xl p-1 shadow-lg">
                          <TabsTrigger value="characters" className="text-sm px-3 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg transition-all">{t('characters')}</TabsTrigger>
                          <TabsTrigger value="power-ups" className="text-sm px-3 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg transition-all">{t('powerUps')}</TabsTrigger>
                          <TabsTrigger value="coins" className="text-sm px-3 py-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-lg transition-all">{t('flappyCoin')}</TabsTrigger>
                          <TabsTrigger value="mystery-boxes" className="text-sm px-3 py-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg transition-all">{t('mysteryBox')}</TabsTrigger>
                          <TabsTrigger value="bundles" className="text-sm px-3 py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg transition-all">{t('bundles')}</TabsTrigger>
                          <TabsTrigger value="accessories" className="text-sm px-3 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg transition-all opacity-60 cursor-not-allowed" disabled>
                            🔒 {t('accessories')}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="characters">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* REMOVED: Authentication warning message - all items are now unlocked */}
                            
                            {/* REMOVED: Authentication success message - shop is always unlocked */}
                            
                            {shopItems.filter(item => !item.locked).map((item) => {
                              const owned = isOwned(item.id);
                              const equipped = isEquipped(item.id);
                              const soldOut = item.isLimited && item.supply !== undefined && item.supply <= 0;
                              const isDefaultSkin = item.isDefault;
                              const isInfernoPhoenix = item.id === 'inferno-phoenix' || item.id === 'inferno_phoenix';
                              return (
                                <div key={item.id} className="bg-white/90 rounded-xl shadow-lg border-2 border-blue-200 hover:border-purple-300 transition-all duration-200 overflow-hidden relative">
                                  {/* SALE BADGE & COUNTDOWN (not for default skin) */}
                                  {!isDefaultSkin && !isInfernoPhoenix && (
                                    <>
                                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full font-bold text-xs shadow-lg z-10 border border-white ${isSaleDay ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{isSaleDay ? t('sale') : t('available')}</div>
                                      {isSaleDay && (
                                        <div className="absolute top-2 right-2 bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full font-semibold text-xs shadow">
                                          {saleCountdown()}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {/* Sale Badge for discounted items - positioned to avoid conflicts */}
                                  {isItemOnSale(item) && !isDefaultSkin && !isInfernoPhoenix && (
                                    <div className="absolute top-12 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-red-400 z-20">
                                      <Tag className="w-3 h-3" />
                                      -{getDiscountedPrice(item)?.discount || 0} Pi
                                    </div>
                                  )}
                                  {/* Fire Phoenix Not for Sale Badge */}
                                  {isInfernoPhoenix && (
                                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full font-bold text-xs shadow-lg z-10 border border-white bg-orange-500 text-white animate-pulse">Not for Sale</div>
                                  )}
                                  
                                  {/* Item Image */}
                                  <div className="p-4 flex justify-center">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm" />
                                  </div>
                                  
                                  {/* Item Details */}
                                  <div className="px-4 pb-4">
                                    <div className="flex flex-col gap-2 mb-3">
                                      <div className="text-lg font-bold text-blue-700 text-center">{item.name}</div>
                                      {/* RARITY BADGE for all skins */}
                                      {isDefaultSkin ? (
                                        <span className="px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-white bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 text-gray-700 text-center mx-auto">{t('common')} · Free</span>
                                      ) : (
                                        <span className={
                                          item.rarity === 'Special'
                                            ? 'px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-pink-600 bg-pink-500 text-white text-center mx-auto'
                                            : item.rarity === 'Common'
                                            ? 'px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-gray-400 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 text-gray-700 text-center mx-auto'
                                            : item.rarity === 'Epic'
                                            ? 'px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-white bg-violet-100 text-violet-700 text-center mx-auto'
                                            : item.rarity === 'Rare'
                                            ? 'px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-white bg-green-100 text-green-700 text-center mx-auto'
                                            : item.rarity === 'Legendary'
                                            ? 'px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-white bg-yellow-400 text-yellow-900 text-center mx-auto'
                                            : 'px-2 py-1 rounded-full font-bold text-xs shadow-lg border border-white bg-white/90 text-center mx-auto'
                                        }>{item.rarity}</span>
                                      )}
                                    </div>
                                    <div className="text-gray-600 mb-3 text-sm text-center">
                                      <span>{item.description}</span>
                                      {item.supply && (
                                        <div className="mt-1">
                                          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold text-xs">{t('limitedSupply')}: {item.supply.toLocaleString()}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Price Display */}
                                    {!isDefaultSkin && !soldOut && !isInfernoPhoenix && (
                                      <div className="flex justify-center gap-2 mb-3">
                                        {false && item.flappyCoinPrice && (
                                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <img src="/flappycoins.png" alt="FC" className="w-4 h-4" />
                                            {item.flappyCoinPrice.toFixed(0)}
                                          </span>
                                        )}
                                        {item.piPrice && (
                                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            <img src="/pi-logo.png" alt="Pi" className="w-4 h-4" />
                                            {renderPriceWithDiscount(item)}
                                          </span>
                                        )}
                                        {/* Mock payments disabled - only real Pi Network mainnet payments enabled */}
                                      </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                      {owned ? (
                                        <>
                                          {equipped ? (
                                            <>
                                              <ShopButton type="equip" onClick={() => {}} disabled className="w-full bg-green-500 text-white">
                                                ✓ Equipped
                                              </ShopButton>
                                              <ShopButton type="unequip" onClick={() => handleUnequipSkin(item.id)} className="w-full">
                                                Unequip
                                              </ShopButton>
                                            </>
                                          ) : (
                                            <ShopButton type="equip" onClick={() => handleEquipSkin(item.id)} className="w-full bg-green-500 text-white">
                                              Equip
                                            </ShopButton>
                                          )}
                                        </>
                                      ) : soldOut ? (
                                        <button style={{backgroundColor:'#e53935',color:'#fff'}} className="w-full font-bold px-4 py-2 rounded-full border-2 border-red-600 text-sm sm:text-lg cursor-not-allowed" disabled>
                                          {t('soldOut')}
                                        </button>
                                      ) : (item.id === 'inferno-phoenix' || item.id === 'inferno_phoenix') ? (
                                        <ShopButton type="subscribe" onClick={handleSubscribeToUltimate} className="w-full">
                                          Subscribe to Ultimate Pack
                                        </ShopButton>
                                      ) : item.isDefault ? null : (
                                        <>
                                          {/* Flappy Coin Payment disabled */}
                                          {/* Pi Payment */}
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <ShopButton 
                                                type="pi" 
                                                onClick={() => handleCharPurchaseAttempt(item, 'pi')}
                                                icon="/pi-logo.png"
                                                price={renderPriceWithDiscount(item)}
                                                className="w-full"
                                              >
                                                Buy with Pi
                                              </ShopButton>
                                            </TooltipTrigger>
                                          </Tooltip>
                                          {isItemOnSale(item) && (
                                            <div className="text-center mt-1 text-xs text-gray-500">
                                              {renderOriginalPrice(item)}
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                        <TabsContent value="power-ups">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {powerUpItems.map((item) => {
                              const quantity = getQuantity(item.id);
                              const maxQuantity = 10;
                              const totalPiPrice = item.piPrice * quantity;
                              const totalFCPrice = item.flappyCoinPrice * quantity;
                              return (
                                <div key={item.id} className="bg-white/90 rounded-xl shadow-lg border-2 border-green-200 hover:border-green-300 transition-all duration-200 overflow-hidden relative">
                                  {/* Sale Badge for Power-ups */}
                                  {isItemOnSale(item) && (
                                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-red-400 z-20">
                                      <Tag className="w-3 h-3" />
                                      -{getDiscountedPrice(item)?.discount || 0} Pi
                                    </div>
                                  )}
                                  <div className="p-4 flex justify-center">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm" />
                                  </div>
                                  <div className="px-4 pb-4">
                                    <div className="text-lg font-bold text-green-700 text-center mb-2">{item.name}</div>
                                    <div className="text-gray-600 mb-3 text-sm text-center">{item.description}</div>
                                    
                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                      <button className="px-2 py-1 bg-green-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(item.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                                      <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(item.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-12 text-center border border-green-300 rounded" />
                                      <button className="px-2 py-1 bg-green-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(item.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                                    </div>
                                    
                                    {/* Price Display */}
                                    <div className="flex justify-center gap-2 mb-3">
                                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/flappycoins.png" alt="FC" className="w-4 h-4" />
                                        {totalFCPrice.toFixed(0)}
                                      </span>
                                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/pi-logo.png" alt="Pi" className="w-4 h-4" />
                                        {totalPiPrice.toFixed(2)}
                                      </span>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                      <ShopButton 
                                        type="coins" 
                                        onClick={() => handleDirectPayment({ ...item, image: item.image, flappyCoinPrice: item.flappyCoinPrice }, 'coins', getQuantity(item.id))}
                                        icon="/flappycoins.png"
                                        price={totalFCPrice.toFixed(0)}
                                        className="w-full"
                                      >
                                        Buy with FC
                                      </ShopButton>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ShopButton 
                                            type="pi" 
                                            onClick={() => handlePowerUpPurchaseAttempt(item, 'pi', getQuantity(item.id))}
                                            icon="/pi-logo.png"
                                            price={totalPiPrice.toFixed(2)}
                                            className="w-full"
                                          >
                                            Buy with Pi
                                          </ShopButton>
                                        </TooltipTrigger>
                                      </Tooltip>
                                      {/* Mock payments disabled - only real Pi Network mainnet payments enabled */}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                        <TabsContent value="coins">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {coinShopItems.map((pkg) => {
                              const quantity = getQuantity(pkg.id);
                              const maxQuantity = 10;
                              const totalPiPrice = pkg.piPrice * quantity;
                              const totalCoins = pkg.coins * quantity;
                              return (
                                <div key={pkg.id} className="bg-white/90 rounded-xl shadow-lg border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-200 overflow-hidden relative">
                                  <div className="p-4 flex justify-center">
                                    <img src="/flappycoins.png" alt="Flappy Coins" className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm" />
                                  </div>
                                  <div className="px-4 pb-4">
                                    <div className="text-lg font-bold text-yellow-700 text-center mb-2">{pkg.name}</div>
                                    <div className="text-gray-600 mb-3 text-sm text-center">{pkg.description}</div>
                                    
                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                      <button className="px-2 py-1 bg-yellow-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(pkg.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                                      <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(pkg.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-12 text-center border border-yellow-300 rounded" />
                                      <button className="px-2 py-1 bg-yellow-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(pkg.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                                    </div>
                                    
                                    {/* Price and Reward Display */}
                                    <div className="flex justify-center gap-2 mb-3">
                                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/pi-logo.png" alt="Pi" className="w-4 h-4" />
                                        {totalPiPrice.toFixed(2)}
                                      </span>
                                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/flappycoins.png" alt="FC" className="w-4 h-4" />
                                        {totalCoins.toLocaleString()}
                                      </span>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ShopButton 
                                          type="pi" 
                                          onClick={() => handleDirectPayment({ ...pkg, image: '/flappycoins.png', quantity: getQuantity(pkg.id), type: 'coins' }, 'pi', getQuantity(pkg.id))}
                                          icon="/pi-logo.png"
                                          price={totalPiPrice.toFixed(2)}
                                          className="w-full"
                                        >
                                          Buy with Pi
                                        </ShopButton>
                                      </TooltipTrigger>
                                    </Tooltip>
                                    {/* Mock payments disabled - only real Pi Network mainnet payments enabled */}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                        <TabsContent value="mystery-boxes">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {mysteryBoxItems.map((box) => {
                              const quantity = getQuantity(box.id);
                              const maxQuantity = 10;
                              const totalPiPrice = box.piPrice * quantity;
                              const totalFCPrice = box.flappyCoinPrice * quantity;
                              return (
                                <div key={box.id} className="bg-white/90 rounded-xl shadow-lg border-2 border-pink-200 hover:border-pink-300 transition-all duration-200 overflow-hidden relative">
                                  {/* Sale Badge for Mystery Boxes */}
                                  {isItemOnSale(box) && (
                                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-red-400 z-20">
                                      <Tag className="w-3 h-3" />
                                      -{getDiscountedPrice(box)?.discount || 0} Pi
                                    </div>
                                  )}
                                  <div className="p-4 flex justify-center">
                                    <img src={box.image} alt={box.name} className="w-20 h-20 object-contain bg-white rounded-xl p-2 border border-gray-200 shadow-sm" />
                                  </div>
                                  <div className="px-4 pb-4">
                                    <div className="text-lg font-bold text-pink-700 text-center mb-2">{box.name}</div>
                                    <div className="text-gray-600 mb-3 text-sm text-center">{box.description}</div>
                                    
                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                      <button className="px-2 py-1 bg-pink-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(box.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                                      <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(box.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-12 text-center border border-pink-300 rounded" />
                                      <button className="px-2 py-1 bg-pink-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(box.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                                    </div>
                                    
                                    {/* Price Display */}
                                    <div className="flex justify-center gap-2 mb-3">
                                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/flappycoins.png" alt="FC" className="w-4 h-4" />
                                        {totalFCPrice.toFixed(0)}
                                      </span>
                                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/pi-logo.png" alt="Pi" className="w-4 h-4" />
                                        {totalPiPrice.toFixed(2)}
                                      </span>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                      <ShopButton 
                                        type="coins" 
                                        onClick={() => handleDirectPayment({ ...box, image: box.image, quantity: getQuantity(box.id), type: 'mystery-box' }, 'coins', getQuantity(box.id))}
                                        icon="/flappycoins.png"
                                        price={totalFCPrice.toFixed(0)}
                                        className="w-full"
                                      >
                                        Buy with FC
                                      </ShopButton>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ShopButton 
                                            type="pi" 
                                            onClick={() => handleDirectPayment({ ...box, image: box.image, quantity: getQuantity(box.id), type: 'mystery-box' }, 'pi', getQuantity(box.id))}
                                            icon="/pi-logo.png"
                                            price={totalPiPrice.toFixed(2)}
                                            className="w-full"
                                          >
                                            Buy with Pi
                                          </ShopButton>
                                        </TooltipTrigger>
                                      </Tooltip>
                                      {/* Mock payments disabled - only real Pi Network mainnet payments enabled */}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                        <TabsContent value="bundles">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                                <div key={bundle.id + '-bundle'} className="bg-white/90 rounded-xl shadow-lg border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 overflow-hidden relative">
                                  {/* SALE BADGE */}
                                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full font-bold text-xs shadow-lg z-10 border border-white ${isSaleDay ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                    {isSaleDay ? t('sale') : t('available')}
                                  </div>
                                  {/* COUNTDOWN */}
                                  {isSaleDay && (
                                    <div className="absolute top-2 right-2 bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full font-semibold text-xs shadow">
                                      {saleCountdown()}
                                    </div>
                                  )}
                                  
                                  <div className="p-4 flex justify-center">
                                    <img src={bundle.image} alt={bundle.name + ' Bundle'} className="w-20 h-20 object-contain bg-purple-50 rounded-xl p-2 border border-gray-200 shadow-sm" />
                                  </div>
                                  <div className="px-4 pb-4">
                                    <div className="text-lg font-bold text-purple-700 text-center mb-2">{bundle.name} Bundle</div>
                                    <div className="text-gray-600 mb-3 text-sm text-center">{t('bundleDescription')}</div>
                                    
                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                      <button className="px-2 py-1 bg-purple-200 rounded-l font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.max(1, quantity - 1))} disabled={quantity === 1}>-</button>
                                      <input type="number" min={1} max={maxQuantity} value={quantity} onChange={e => setItemQuantity(bundle.id, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))} className="w-12 text-center border border-purple-300 rounded" />
                                      <button className="px-2 py-1 bg-purple-200 rounded-r font-bold text-lg" onClick={() => setItemQuantity(bundle.id, Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>+</button>
                                    </div>
                                    
                                    {/* Price Display */}
                                    <div className="flex justify-center gap-2 mb-3">
                                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/flappycoins.png" alt="FC" className="w-4 h-4" />
                                        {totalFCPrice.toFixed(0)}
                                      </span>
                                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <img src="/pi-logo.png" alt="Pi" className="w-4 h-4" />
                                        {totalPiPrice.toFixed(2)}
                                      </span>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                      <ShopButton 
                                        type="coins" 
                                        onClick={() => handleDirectPayment({ ...bundle, image: bundle.image, quantity: getQuantity(bundle.id), type: 'bundle' }, 'coins', getQuantity(bundle.id))}
                                        icon="/flappycoins.png"
                                        price={totalFCPrice.toFixed(0)}
                                        className="w-full"
                                      >
                                        Buy with FC
                                      </ShopButton>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <ShopButton 
                                            type="pi" 
                                            onClick={() => handleDirectPayment({ ...bundle, image: bundle.image, quantity: getQuantity(bundle.id), type: 'bundle' }, 'pi', getQuantity(bundle.id))}
                                            icon="/pi-logo.png"
                                            price={totalPiPrice.toFixed(2)}
                                            className="w-full"
                                          >
                                            Buy with Pi
                                          </ShopButton>
                                        </TooltipTrigger>
                                      </Tooltip>
                                      {/* Mock payments disabled - only real Pi Network mainnet payments enabled */}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                        <TabsContent value="accessories">
                          <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8">
                            <div className="text-center">
                              <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                                <img 
                                  src="/flappy pi gif/flappy-2.gif.gif" 
                                  alt="Flappy Pi" 
                                  className="w-16 h-16 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = '/flappy-logo.png';
                                  }}
                                />
                              </div>
                              <h3 className="text-2xl font-bold text-orange-700 mb-4">🔒 Accessories Coming Soon!</h3>
                              <p className="text-gray-600 mb-6 max-w-md">
                                We're working on amazing accessories for your Flappy Pi characters. 
                                Stay tuned for updates on when these items will be available!
                              </p>
                              <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-orange-800 mb-2">What to expect:</h4>
                                <ul className="text-sm text-orange-700 space-y-1 text-left">
                                  <li>• Golden Crowns and Royal Accessories</li>
                                  <li>• Magical Wings and Special Effects</li>
                                  <li>• Rare Jewelry and Collectibles</li>
                                  <li>• Exclusive Seasonal Items</li>
                                </ul>
                              </div>
                              <div className="flex gap-3 justify-center">
                                <Button 
                                  onClick={() => setActiveTab('characters')}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                                >
                                  View Characters
                                </Button>
                                <Button 
                                  onClick={() => setActiveTab('power-ups')}
                                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                                >
                                  Browse Power-ups
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>


                      </Tabs>
                    </ResponsiveContainer>
                  )}

                  {/* Removed Pi Payment Modal - using direct payments now */}

                  {/* Removed Flappy Coin Payment Modal - using direct payments now */}
                  {/* Removed coin payment modal content - using direct payments now */}
                  {/* Removed payment confirmation dialogs - using direct payments now */}
                  {/* Receive Item Modal */}
                  <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
                    <DialogContent className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
                      <DialogHeader>
                        <DialogTitle className="text-center text-2xl text-yellow-600 font-extrabold mb-2">{`${t('youReceived').replace('{item}', receiveItem?.name || '')}!`}</DialogTitle>
                      </DialogHeader>
                      {receiveItem && (
                        <>
                          <img src={getItemImage(receiveItem)} alt={receiveItem.name} className="w-24 h-24 mb-3 drop-shadow-xl animate-bounce-slow" />
                          <div className="text-lg font-bold text-gray-800 mb-2">
                            {receiveItem.name}
                            {receiveItem.quantity && receiveItem.quantity > 1 && (
                              <span className="ml-2 text-yellow-600 font-extrabold">x{receiveItem.quantity}</span>
                            )}
                          </div>
                          <ShopButton 
                            type="equip"
                            onClick={() => {
                              setShowReceiveModal(false);
                            }}
                          >
                            Close
                          </ShopButton>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  {showCongratsModal && congratsItem && (
                    <Dialog open={showCongratsModal} onOpenChange={setShowCongratsModal}>
                      <DialogContent className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
                        {congratsItem && (
                          <>
                            <img src={getItemImage(congratsItem)} alt={congratsItem.name} className="w-24 h-24 mb-3 drop-shadow-xl animate-bounce-slow" />
                            <div className="text-2xl font-bold text-green-700 mb-2">{t('newItem').replace('{item}', congratsItem.type === 'skin' ? t('skin') : t('item'))}</div>
                            <div className="text-lg font-bold text-gray-800 mb-2">{congratsItem.name}</div>
                            <ShopButton 
                              type="equip" 
                              onClick={() => setShowCongratsModal(false)}
                            >
                              Close
                            </ShopButton>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Daily Reward Modal - ONLY FOR AUTHENTICATED USERS */}
                  {showDailyReward && (
                    <Dialog open={showDailyReward} onOpenChange={() => setShowDailyReward(false)}>
                      <DialogContent className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
                        <img src="/flappycoins.png" alt="Flappy Coins" className="w-24 h-24 mb-4 animate-bounce" />
                        <div className="text-xl font-bold text-yellow-600 mb-2">{t('dailyLoginReward')}</div>
                        <div className="text-gray-700 mb-2">{`${t('youReceived').replace('{item}', String(dailyRewardAmount))} ${t('flappyCoins')} today!`}</div>
                        <div className="text-sm text-gray-500 mb-4">{t('comeBackEvery24HoursToIncreaseYourReward')}</div>
                        <ShopButton 
                          type="coins" 
                          onClick={handleClaimDailyReward}
                        >
                          {t('claim')}
                        </ShopButton>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Coin Receive Modal */}
                  <Dialog open={showCoinReceiveModal} onOpenChange={setShowCoinReceiveModal}>
                    <DialogContent className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
                      <DialogHeader>
                        <DialogTitle className="text-center text-2xl text-yellow-600 font-extrabold mb-2">{t('coinsClaimed')}</DialogTitle>
                      </DialogHeader>
                      <img src="/flappycoins.png" alt="Flappy Coins" className="w-24 h-24 mb-4 animate-bounce" />
                      <div className="text-xl font-bold text-yellow-700 mb-2">{`${t('youReceived').replace('{item}', coinReceiveAmount.toLocaleString())} ${t('flappyCoins')}!`}</div>
                      <ShopButton 
                        type="coins" 
                        onClick={() => {
                          addCoins(coinReceiveAmount);
                          setShowCoinReceiveModal(false);
                          toast({ title: t('coinsAdded'), description: t('youReceived').replace('{item}', coinReceiveAmount.toLocaleString()) });
                        }}
                      >
                        {t('claim')}
                      </ShopButton>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {/* Enhanced Wiki Buttons above FooterNPC */}
              <div className="flex justify-center items-center gap-6 mb-6">
                <ShopButton 
                  type="pi" 
                  onClick={() => navigate('/wiki')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-xl shadow-lg flex items-center gap-3 border-2 border-blue-400 hover:border-blue-300"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <BookOpen className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-semibold">Wiki</span>
                  <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                </ShopButton>
                <ShopButton 
                  type="pi" 
                  onClick={() => navigate('/full-flappy-wiki')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-xl shadow-lg flex items-center gap-3 border-2 border-purple-400 hover:border-purple-300"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <BookOpen className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-semibold">Full Wiki</span>
                  <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
                </ShopButton>
              </div>
              
              {/* FooterNPC above the footer */}
              <FooterNPC
                npcType="default"
                npcName="Shop NPC"
                dialogs={shopNpcDialogs}
              />
              <EnhancedFooter 
                musicEnabled={false}
                setMusicEnabled={() => {}}
                soundEnabled={false}
                setSoundEnabled={() => {}}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
      {/* Add the missing SubscriptionPlansModal */}
      <SubscriptionPlansModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
      
      {/* Item Receive Modal for purchase notifications */}
      <ItemReceiveModal 
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        item={receiveItem}
      />
      
      {/* Removed Pi Payment Modal - using direct payments now */}

      {/* Removed Unified Pi Payment Modal - using direct payments now */}
      
      {/* NFT Note Modal */}
      <NFTNoteModal 
        isOpen={showNFTNoteModal} 
        onClose={() => setShowNFTNoteModal(false)} 
      />
      
    </SkyBackground>
  );
};

export default ShopPage;
