import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Star, Zap, Heart, Coins, ShoppingBag, Clock, Check, X, Gift, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { inventoryService, InventoryItem, PurchaseHistory } from '@/services/inventoryService';
import BackgroundDecoration from '@/components/home/BackgroundDecoration';
import EnhancedFooter from '@/components/EnhancedFooter';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';

import ImageWithFallback from '@/components/ImageWithFallback';
import MysteryBoxRewardModal from '@/components/MysteryBoxRewardModal';
import dayjs from 'dayjs';
import WalletBalance from '../components/WalletBalance';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';
import UnclaimedRewardsModal from '@/components/UnclaimedRewardsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SubscriptionReward } from '@/constants/subscriptionRewards';
import { shopItems } from '@/constants/shopItems';
import FooterNPC from '../components/FooterNPC';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGameState } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [showMysteryBoxModal, setShowMysteryBoxModal] = useState(false);
  const [mysteryBoxRewards, setMysteryBoxRewards] = useState<any[]>([]);
  const [showSubscriptionPlansModal, setShowSubscriptionPlansModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSubscriptionId, setCancelSubscriptionId] = useState<string | null>(null);
  const [showPowerUpModal, setShowPowerUpModal] = useState(false);
  const [selectedPowerUp, setSelectedPowerUp] = useState<InventoryItem | null>(null);
  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);
  const [showUnclaimedModal, setShowUnclaimedModal] = useState(false);
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  // Get subscription status for display
  const subscriptionStatus = {
    activeSubscriptions: inventory.filter(item => 
      item.type === 'subscription' && 
      item.expiresAt && 
      new Date(item.expiresAt) > new Date()
    )
  };

  // Calculate total items for display
  const getTotalItemsCount = () => {
    return inventory.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  useEffect(() => {
    loadInventoryData();
    checkUnclaimedRewards();
    // Clear expired subscriptions on page load
    inventoryService.clearExpiredSubscriptions();

    // Listen for inventory updates from purchases
    const handleInventoryUpdate = () => {
      loadInventoryData();
      checkUnclaimedRewards();
    };

    const handlePurchaseNotification = () => {
      // Refresh inventory when new purchase is made
      setTimeout(() => {
        loadInventoryData();
        checkUnclaimedRewards();
      }, 1000); // Small delay to ensure inventory is updated
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener('show-purchase-notification', handlePurchaseNotification);
    
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener('show-purchase-notification', handlePurchaseNotification);
    };
  }, []);

  const loadInventoryData = () => {
    const inventoryData = inventoryService.getInventory();
    const historyData = inventoryService.getPurchaseHistory();
    setInventory(inventoryData);
    setPurchaseHistory(historyData);
  };

  const checkUnclaimedRewards = () => {
    const hasUnclaimed = inventoryService.hasUnclaimedSubscriptionRewards();
    setHasUnclaimedRewards(hasUnclaimed);
  };

  const handleClaimRewards = () => {
    setShowUnclaimedModal(false);
    checkUnclaimedRewards();
    loadInventoryData();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEquipSkin = async (skinId: string) => {
    const success = inventoryService.equipItem(skinId, 'skin');
    if (success) {
      toast({
        title: 'Skin Equipped! 🎨',
        description: 'Your new skin has been equipped successfully!',
        duration: 3000,
      });
      loadInventoryData(); // Refresh to show equipped status
    } else {
      toast({
        title: 'Equip Failed',
        description: 'Failed to equip the skin. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleUsePowerUp = async (item: InventoryItem) => {
    const success = inventoryService.useItem(item.id, item.type, 1);
    if (success) {
      toast({
        title: `${item.name} Used! ⚡`,
        description: `You used a ${item.name} powerup.`,
        duration: 3000,
      });
      loadInventoryData(); // Refresh inventory
    } else {
      toast({
        title: 'Use Failed',
        description: 'Failed to use the powerup. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleEquipPowerUp = async (powerUpId: string) => {
    console.log('🎮 [InventoryPage] Attempting to equip powerup:', powerUpId);
    const success = inventoryService.equipItem(powerUpId, 'powerup');
    if (success) {
      toast({
        title: 'Power-up Enabled! ⚡',
        description: 'This power-up will be available in game mode!',
        duration: 3000,
      });
      console.log('✅ [InventoryPage] Power-up equipped successfully');
      loadInventoryData(); // Refresh to show equipped status
      // Dispatch event to notify game that powerups changed
      window.dispatchEvent(new CustomEvent('powerup-equipped', {
        detail: { powerUpId, equipped: true }
      }));
    } else {
      toast({
        title: 'Equip Failed',
        description: 'Failed to enable this power-up. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleUnequipPowerUp = async (powerUpId: string) => {
    console.log('🎮 [InventoryPage] Attempting to unequip powerup:', powerUpId);
    const success = inventoryService.unequipItem(powerUpId, 'powerup');
    if (success) {
      toast({
        title: 'Power-up Disabled ⚠️',
        description: 'This power-up will no longer be available in game mode.',
        duration: 3000,
      });
      console.log('✅ [InventoryPage] Power-up unequipped successfully');
      loadInventoryData(); // Refresh to show equipped status
      // Dispatch event to notify game that powerups changed
      window.dispatchEvent(new CustomEvent('powerup-unequipped', {
        detail: { powerUpId, equipped: false }
      }));
    } else {
      toast({
        title: 'Disable Failed',
        description: 'Failed to disable this power-up. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleOpenMysteryBox = async (boxType: string) => {
    const result = inventoryService.openMysteryBox(boxType as any);
    if (result.success) {
      setMysteryBoxRewards(result.rewards);
      setShowMysteryBoxModal(true);
    } else {
      toast({
        title: 'Cannot Open Box',
        description: 'You don\'t have this mystery box or it\'s already empty.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleUseBundle = async (bundleId: string) => {
    const result = inventoryService.useBundle(bundleId);
    if (result.success) {
      // Save all bundle items to inventory
      result.items.forEach(item => {
        inventoryService.saveToInventory(item);
      });
      
      toast({
        title: 'Bundle Used! 📦',
        description: `Successfully used bundle and added ${result.items.length} items to your inventory!`,
        duration: 3000,
      });
      loadInventoryData(); // Refresh inventory
    } else {
      toast({
        title: 'Cannot Use Bundle',
        description: 'You don\'t have this bundle or it\'s already empty.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleClaimMysteryBoxRewards = () => {
    setShowMysteryBoxModal(false);
    loadInventoryData(); // Refresh inventory after claiming
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    // Remove the subscription from inventory (no refund)
    inventoryService.removeSubscription(subscriptionId);
    toast({
      title: 'Subscription Cancelled',
      description: 'Your subscription plan has been cancelled. No refund was given.',
      duration: 3000,
    });
    loadInventoryData();
    setShowSubscriptionPlansModal(true); // Open the subscription plans modal after cancel
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-yellow-500 text-yellow-900';
      case 'Epic': return 'bg-purple-500 text-purple-900';
      case 'Rare': return 'bg-blue-500 text-blue-900';
      case 'Special': return 'bg-green-500 text-green-900';
      default: return 'bg-gray-500 text-gray-900';
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'skin': return <Star className="w-5 h-5" />;
      case 'powerup': return <Zap className="w-5 h-5" />;
      case 'subscription': return <Crown className="w-5 h-5" />;
      case 'mystery-box': return <Gift className="w-5 h-5" />;
      case 'bundle': return <Package className="w-5 h-5" />;
      default: return <Coins className="w-5 h-5" />;
    }
  };

  const getInventoryByType = (type: InventoryItem['type']) => {
    return inventory.filter(item => item.type === type);
  };

  const getEquippedSkin = () => {
    return inventory.find(item => item.type === 'skin' && item.equipped);
  };

  const getBundleImage = (bundleId: string) => {
    const bundleImages = {
      'starter_pack': '/boxes/basic-box.png',
      'powerup_pack': '/boxes/rare-box.png',
      'premium_pack': '/boxes/legendary-box.png',
      'skin_pack': '/boxes/epic-box.png',
      'mega_pack': '/boxes/legendary-box.png',
      'extra-life-bundle': '/boxes/legendary-box.png'
    };
    return bundleImages[bundleId as keyof typeof bundleImages] || '/boxes/basic-box.png';
  };

  const getShopSkinInfo = (skinId: string) => shopItems.find(item => item.id === skinId);

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <BackgroundDecoration />
      
      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:h-16 gap-4">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex-1 sm:flex-none">
                <h1 className={`text-lg sm:text-2xl font-bold text-center sm:text-left ${theme === 'night' ? 'text-white' : 'text-blue-900'}`}>Inventory</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your purchased items</p>
              </div>
            </div>
            
            {/* Right side - Subscription status and buttons */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {/* Subscription Status - Mobile optimized */}
              {subscriptionStatus.activeSubscriptions.length > 0 && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-lg border border-purple-200 w-full sm:w-auto">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <div className="text-xs sm:text-sm">
                    <div className="font-semibold text-purple-800">
                      {subscriptionStatus.activeSubscriptions.length > 1 
                        ? `${subscriptionStatus.activeSubscriptions.length} Active Plans`
                        : subscriptionStatus.activeSubscriptions[0].name
                      }
                    </div>
                    <div className="text-purple-600">
                      {subscriptionStatus.activeSubscriptions.length > 1
                        ? `Longest: ${subscriptionStatus.activeSubscriptions[0].daysRemaining ?? ''} days remaining`
                        : `${subscriptionStatus.activeSubscriptions[0].daysRemaining ?? ''} days remaining`
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <WalletBalance />
                <Button
                  onClick={() => navigate('/shop')}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 text-xs sm:text-sm w-full sm:w-auto"
                >
                  Shop
                </Button>
                
                {/* Unclaimed Rewards Button */}
                {hasUnclaimedRewards && (
                  <Button
                    onClick={() => setShowUnclaimedModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-2 w-full sm:w-auto"
                  >
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Claim</span>
                  </Button>
                )}
                
                <Button
                  onClick={() => setShowSubscriptionPlansModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-2 w-full sm:w-auto"
                >
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Subscribe</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 mb-28">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Improved mobile tabs with better spacing */}
          <TabsList className="grid w-full grid-cols-3 overflow-x-auto whitespace-nowrap rounded-lg border mb-4 text-xs sm:text-sm bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="inventory" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Inventory</TabsTrigger>
            <TabsTrigger value="equipped" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Equipped</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm px-2 sm:px-4 py-2">History</TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4 sm:space-y-6">
            {/* Skins */}
            <div>
              <h2 className={`text-base sm:text-lg font-bold mb-2 ${theme === 'night' ? 'text-white' : 'text-blue-900'} flex items-center gap-2`}>
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                Bird Skins ({getInventoryByType('skin').length})
              </h2>
              {/* Improved mobile grid for skins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {getInventoryByType('skin')
                  .filter(item => !item.name.toLowerCase().includes('mystery box'))
                  .map((item) => (
                  <Card key={item.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="text-sm sm:text-lg text-center sm:text-left">
                          {getShopSkinInfo(item.id)?.name || item.name}
                        </CardTitle>
                        <span className={
                          item.rarity === 'Special'
                            ? 'px-2 sm:px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-pink-600 bg-pink-500 text-white self-center sm:self-auto'
                            : item.rarity === 'Common'
                            ? 'px-2 sm:px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-gray-400 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 text-gray-700 self-center sm:self-auto'
                            : item.rarity === 'Legendary'
                            ? 'px-2 sm:px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-yellow-500 bg-yellow-400 text-yellow-900 self-center sm:self-auto'
                            : 'px-2 sm:px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-blue-400 bg-blue-400 text-white self-center sm:self-auto'
                        }>
                          {item.rarity || 'Common'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <ImageWithFallback
                          src={getShopSkinInfo(item.id)?.image || item.image}
                          alt={getShopSkinInfo(item.id)?.name || item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          fallbackSrc="/birds/bird_0.png"
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-3 text-center">
                        Purchased: {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                      </div>
                      {!item.equipped && (
                        <Button
                          onClick={() => handleEquipSkin(item.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-2"
                        >
                          Equip Skin
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Power-ups */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <h2 className={`text-base sm:text-lg font-bold ${theme === 'night' ? 'text-white' : 'text-blue-900'} flex items-center gap-2`}>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Power-ups ({inventoryService.getOrganizedPowerUps().length}/5)
                </h2>
                <div className="text-sm text-gray-600 text-center sm:text-right">
                  Total: {getTotalItemsCount()} items
                </div>
              </div>
              {/* Improved mobile power-ups layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {inventoryService.getOrganizedPowerUps().map((item) => (
                  <Card key={item.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="text-xs sm:text-lg truncate text-center sm:text-left">
                          {item.name}
                        </CardTitle>
                        <div className="flex gap-1 justify-center sm:justify-start">
                          <Badge className="w-fit bg-blue-100 text-blue-800 text-xs self-center sm:self-auto">
                            x{item.quantity}
                          </Badge>
                          {item.equipped && (
                            <Badge className="w-fit bg-green-100 text-green-800 text-xs self-center sm:self-auto flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-center mb-3 aspect-square w-full max-w-[60px] sm:max-w-[80px] mx-auto">
                        <ImageWithFallback
                          src={(() => {
                            switch (item.id) {
                              case 'shield': return '/powerups/shield.png';
                              case 'magnet': return '/powerups/coin-magnet.png';
                              case 'extra_life': return '/powerups/extra-life.png';
                              case 'coin_multiplier': return '/powerups/2x-coin-multiplier.png';
                              case 'turbo_start': return '/powerups/turbo-start.png';
                              default: return item.image || `/powerups/${item.name.replace(/ /g, '-')}.png` || '/powerups/shield.png';
                            }
                          })()}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg bg-gray-100"
                          fallbackSrc="/powerups/extra-life.png"
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-3 text-center truncate">
                        {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => { 
                            if (item.equipped) {
                              handleUnequipPowerUp(item.id);
                            } else {
                              handleEquipPowerUp(item.id);
                            }
                          }}
                          className={`w-full text-xs sm:text-sm py-2 ${
                            item.equipped 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          disabled={item.quantity <= 0}
                        >
                          {item.equipped ? '✅ Enabled' : 'Enable for Game'}
                        </Button>
                        <Button
                          onClick={() => { setSelectedPowerUp(item); setShowPowerUpModal(true); }}
                          className="w-full bg-gray-500 hover:bg-gray-600 text-xs sm:text-sm py-2"
                          disabled={item.quantity <= 0}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mystery Boxes */}
            <div>
              <h2 className={`text-base sm:text-lg font-bold mb-2 ${theme === 'night' ? 'text-white' : 'text-blue-900'} flex items-center gap-2`}>
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                Mystery Boxes ({getInventoryByType('mystery-box').length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {getInventoryByType('mystery-box').map((item) => (
                  <Card key={item.id} className="relative overflow-hidden border-2 border-purple-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="text-sm sm:text-lg text-center sm:text-left">
                          {item.name}
                        </CardTitle>
                        <Badge className="w-fit bg-purple-100 text-purple-800 text-xs self-center sm:self-auto">
                          x{item.quantity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <ImageWithFallback
                          src={item.image || '/boxes/mystery-box.png'}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          fallbackSrc="/boxes/mystery-box.png"
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-3 text-center">
                        Purchased: {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                      </div>
                      <Button
                        onClick={() => handleOpenMysteryBox(item.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm py-2"
                        disabled={item.quantity <= 0}
                      >
                        Open Box
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bundles */}
            <div>
              <h2 className={`text-base sm:text-lg font-bold mb-2 ${theme === 'night' ? 'text-white' : 'text-blue-900'} flex items-center gap-2`}>
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                Bundles ({getInventoryByType('bundle').length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {getInventoryByType('bundle').map((item) => (
                  <Card key={item.id} className="relative overflow-hidden border-2 border-green-200 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="text-sm sm:text-lg text-center sm:text-left">
                          {item.name}
                        </CardTitle>
                        <Badge className="w-fit bg-green-100 text-green-800 text-xs self-center sm:self-auto">
                          x{item.quantity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <ImageWithFallback
                          src={getBundleImage(item.id)}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          fallbackSrc="/boxes/basic-box.png"
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-3 text-center">
                        Purchased: {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                      </div>
                      <Button
                        onClick={() => handleUseBundle(item.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-2"
                        disabled={item.quantity <= 0}
                      >
                        Use Bundle
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Subscriptions */}
            <div>
              <h2 className={`text-base sm:text-lg font-bold mb-2 ${theme === 'night' ? 'text-white' : 'text-blue-900'} flex items-center gap-2`}>
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                Subscriptions ({getInventoryByType('subscription').length})
                {subscriptionStatus.activeSubscriptions.length > 0 && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs sm:text-sm">
                    {subscriptionStatus.activeSubscriptions.length} Active
                  </Badge>
                )}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {getInventoryByType('subscription').map((item) => {
                  const isActive = item.expiresAt && new Date(item.expiresAt) > new Date();
                  const daysRemaining = isActive && item.expiresAt 
                    ? Math.ceil((new Date(item.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                  
                  return (
                    <Card key={item.id} className="relative overflow-hidden border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2 p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <CardTitle className="text-sm sm:text-lg text-center sm:text-left">
                            {item.name}
                          </CardTitle>
                          <Badge className={`w-fit text-xs self-center sm:self-auto ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isActive ? 'Active' : 'Expired'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <Crown className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-3 text-center">
                          {isActive ? (
                            <span className="text-green-600">
                              {daysRemaining} days remaining
                            </span>
                          ) : (
                            <span className="text-red-600">
                              Expired: {dayjs(item.expiresAt).format('MMM D, YYYY')}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <Button
                            onClick={() => { setCancelSubscriptionId(item.id); setShowCancelModal(true); }}
                            className="w-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm py-2"
                          >
                            Cancel
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Equipped Tab */}
          <TabsContent value="equipped" className="space-y-4 sm:space-y-6">
            <div>
              <h2 className={`text-lg sm:text-xl font-bold text-center ${theme === 'night' ? 'text-white' : 'text-blue-900'}`}>Currently Equipped</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {getEquippedSkin() && (
                  <Card className="border-2 border-green-500 bg-green-50">
                    <CardHeader className="p-3 sm:p-4">
                      <CardTitle className="text-sm sm:text-lg flex items-center">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                        {getEquippedSkin()?.name}
                      </CardTitle>
                      <Badge className="w-fit bg-green-500 text-white text-xs sm:text-sm">
                        Currently Equipped
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <ImageWithFallback
                          src={getBirdImageSrc(getEquippedSkin())}
                          alt={getEquippedSkin()?.name || ''}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                          fallbackSrc="/flappy pi gif/flappy-2.gif.gif"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Purchase History Tab */}
          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <div>
              <h2 className={`text-lg sm:text-xl font-bold text-center ${theme === 'night' ? 'text-white' : 'text-blue-900'}`}>Purchase History</h2>
              <div className="space-y-3 sm:space-y-4">
                {purchaseHistory.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getItemIcon(purchase.itemType)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">{purchase.itemName}</div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              {dayjs(purchase.purchasedAt).format('MMM D, YYYY [at] h:mm A')}
                            </div>
                            <div className="text-xs text-gray-500">
                              Quantity: {purchase.quantity} • {purchase.itemType}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-sm sm:text-base">
                            {purchase.price} {purchase.currency === 'pi' ? 'π' : 'Coins'}
                          </div>
                          <Badge className={`mt-1 text-xs sm:text-sm ${purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {purchase.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {purchaseHistory.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Your purchase history will appear here once you make your first purchase.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* FooterNPC above the footer */}
      <FooterNPC
        npcType="default"
        npcName="Inventory NPC"
        dialogs={[
          "Welcome to your Inventory! Here's all your stuff!",
          "Your items are safe and organized here!",
          "Check out your power-ups and skins!",
          "Use your items to improve your game!",
          "Inventory management is key to success!",
          "You can equip different skins for variety!",
          "Power-ups give you special abilities!",
          "Mystery boxes contain random surprises!",
          "Legendary items are super rare!",
          "Rare items are quite valuable!",
          "Common items are perfect for beginners!",
          "Your collection grows as you play!",
          "Some items are limited edition!",
          "You can trade items with friends soon!",
          "Inventory space is unlimited!",
          "Items never expire or disappear!",
          "You can preview items before using!",
          "Some items have special effects!",
          "Your inventory shows your progress!",
          "Collect them all to complete your set!",
          "Items can be used in any game mode!",
          "Your inventory is your treasure chest!",
          "Keep your items organized!",
          "You can sort items by rarity!",
          "Some items are seasonal!",
          "Your inventory is unique to you!",
          "Items help you customize your experience!",
          "Enjoy your collection!",
          "Your inventory is your legacy!",
          "Keep collecting and keep flapping!"
        ]}
      />
      <EnhancedFooter
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={false}
        setSoundEnabled={() => {}}
      />

      {/* Mystery Box Reward Modal */}
      <MysteryBoxRewardModal
        isOpen={showMysteryBoxModal}
        onClose={() => setShowMysteryBoxModal(false)}
        rewards={mysteryBoxRewards}
        onClaim={handleClaimMysteryBoxRewards}
      />
      <SubscriptionPlansModal
        isOpen={showSubscriptionPlansModal}
        onClose={() => setShowSubscriptionPlansModal(false)}
      />

      {/* Cancel Subscription Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-red-600 font-extrabold mb-2 flex flex-col items-center">
              <span className="text-5xl mb-2">❗</span>
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription>Warning: This will immediately cancel your subscription.</DialogDescription>
          </DialogHeader>
          <div className="text-center text-red-700 font-bold mb-2">Warning: This will immediately cancel your subscription.</div>
          <div className="text-center text-red-500 font-semibold mb-2">You will lose:</div>
          <ul className="text-sm text-gray-700 mb-4 text-left mx-auto max-w-xs list-disc list-inside">
            <li>All premium features from this plan</li>
            <li>Remaining subscription time</li>
            <li>Access to exclusive rewards</li>
          </ul>
          <div className="text-center text-gray-700 mb-4">No refund will be given. This action cannot be undone.</div>
          <div className="flex gap-4 justify-center">
            <Button
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-6 py-2 rounded-lg"
              onClick={() => {
                if (cancelSubscriptionId) handleCancelSubscription(cancelSubscriptionId);
                setShowCancelModal(false);
              }}
            >
              Yes, Cancel Subscription
            </Button>
            <Button
              className="bg-gray-200 text-white font-bold px-6 py-2 rounded-lg"
              onClick={() => setShowCancelModal(false)}
            >
              No, Keep Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Power-up Details Modal */}
      <Dialog open={showPowerUpModal} onOpenChange={setShowPowerUpModal}>
        <DialogContent className="max-w-md bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center">
          {/* Modal NPC with dialog cycling */}
          <FooterNPC
            npcType="default"
            npcName="Inventory NPC"
            dialogs={[
              "Power-ups give you special abilities!",
              "Tap a power-up to use it in-game.",
              "Use power-ups strategically for high scores!",
              "Each power-up has a unique effect.",
              "Collect more power-ups to boost your gameplay!"
            ]}
          />
          {selectedPowerUp && (
            <>
              <img src={selectedPowerUp.image} alt={selectedPowerUp.name} className="w-24 h-24 mb-3 drop-shadow-xl" />
              <div className="text-2xl font-bold text-blue-700 mb-2">{selectedPowerUp.name}</div>
              <div className="text-gray-700 text-base mb-4">{selectedPowerUp.description || 'No description available.'}</div>
              <div className="w-full bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100 mb-2">
                <div className="font-semibold text-blue-800 mb-1">How to Use in Game Mode</div>
                <div className="text-sm text-blue-700">Power-ups can be activated during gameplay. Tap the power-up icon when available to gain its effect. Use them strategically to boost your performance and survive longer!</div>
              </div>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg" onClick={() => setShowPowerUpModal(false)}>Close</Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Unclaimed Rewards Modal */}
      <UnclaimedRewardsModal
        open={showUnclaimedModal}
        onClose={() => setShowUnclaimedModal(false)}
        onClaim={handleClaimRewards}
      />
    </SkyBackground>
  );
};

export default InventoryPage;