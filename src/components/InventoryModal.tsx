import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Crown, Star, Zap, Heart, Coins, ShoppingBag, Clock, Check, X, Gift, Package, AlertTriangle } from 'lucide-react';
import { inventoryService, InventoryItem, PurchaseHistory } from '@/services/inventoryService';
import ImageWithFallback from '@/components/ImageWithFallback';
import MysteryBoxRewardModal from '@/components/MysteryBoxRewardModal';
import dayjs from 'dayjs';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';
import UnclaimedRewardsModal from '@/components/UnclaimedRewardsModal';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { useUserProfile } from '@/hooks/useUserProfile';

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const { profile, isAuthenticated } = useUserProfile();
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

  // Remove authentication check - allow access without signing in
  // if (!isAuthenticated) {
  //   return null;
  // }

  useEffect(() => {
    if (open) {
      loadInventoryData();
      checkUnclaimedRewards();
      inventoryService.clearExpiredSubscriptions();
    }
  }, [open]);

  // Add keyboard shortcut to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

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
    const rewards = inventoryService.claimSubscriptionRewards(undefined);
    setMysteryBoxRewards(rewards);
    setShowMysteryBoxModal(true);
    loadInventoryData();
    checkUnclaimedRewards();
    
    toast({
      title: "Rewards Claimed! 🎉",
      description: "Your subscription rewards have been added to your inventory."
    });
  };

  const handleEquipSkin = async (skinId: string) => {
    const success = inventoryService.equipItem(skinId, 'skin');
    if (success) {
      toast({
        title: 'Skin Equipped! 🎨',
        description: 'Your new skin has been equipped successfully!',
      });
      loadInventoryData();
    } else {
      toast({
        title: 'Equip Failed',
        description: 'Failed to equip the skin. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUsePowerUp = async (item: InventoryItem) => {
    const success = inventoryService.useItem(item.id, item.type, 1);
    if (success) {
      toast({
        title: `${item.name} Used! ⚡`,
        description: `You used a ${item.name} powerup.`,
      });
      loadInventoryData();
    } else {
      toast({
        title: 'Use Failed',
        description: 'Failed to use the powerup. Please try again.',
        variant: 'destructive',
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
      });
    }
  };

  const handleUseBundle = async (bundleId: string) => {
    const result = inventoryService.useBundle(bundleId);
    if (result.success) {
      result.items.forEach(item => {
        inventoryService.saveToInventory(item);
      });
      
      toast({
        title: 'Bundle Used! 📦',
        description: `Successfully used bundle and added ${result.items.length} items to your inventory!`,
      });
      loadInventoryData();
    } else {
      toast({
        title: 'Cannot Use Bundle',
        description: 'You don\'t have this bundle or it\'s already empty.',
        variant: 'destructive',
      });
    }
  };

  const handleClaimMysteryBoxRewards = () => {
    setShowMysteryBoxModal(false);
    loadInventoryData();
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    inventoryService.removeSubscription(subscriptionId);
    toast({
      title: 'Subscription Cancelled',
      description: 'Your subscription plan has been cancelled. No refund was given.',
    });
    loadInventoryData();
    setShowSubscriptionPlansModal(true);
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

  const getInventoryByType = (type: string) => {
    return inventory.filter(item => item.type === type);
  };

  const getBundleImage = (bundleId: string) => {
    switch (bundleId) {
      case 'starter-bundle': return '/boxes/starter-bundle.png';
      case 'premium-bundle': return '/boxes/premium-bundle.png';
      case 'ultimate-bundle': return '/boxes/ultimate-bundle.png';
      default: return '/boxes/basic-box.png';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-2xl max-h-[98vh] sm:max-w-6xl sm:max-h-[90vh] bg-white border shadow-lg rounded-lg overflow-hidden p-0 relative">
        {/* Floating Close Button - Always Visible */}
        <div className="fixed top-4 right-4 z-[99999]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-12 w-12 p-0 hover:bg-red-100 hover:text-red-700 rounded-full bg-white shadow-xl border-2 border-gray-300 transition-all duration-200 text-gray-700"
            title="Close (Esc)"
          >
            <X className="h-6 w-6 font-bold" />
          </Button>
        </div>
        
        <DialogHeader className="relative">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-800">Inventory</DialogTitle>
          <DialogDescription className="text-xs sm:text-base">View and manage your collected power-ups and items.</DialogDescription>
          {/* Secondary Close Button in Header */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        {/* Custom Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-6 border-b gap-2 sm:gap-0 w-full">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-800">Inventory</DialogTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            {hasUnclaimedRewards && (
              <Button
                onClick={() => setShowUnclaimedModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-2 w-full sm:w-auto mb-1 sm:mb-0"
              >
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="sm:inline">Claim Rewards</span>
                <span className="sm:hidden">Claim</span>
              </Button>
            )}
            <Button
              onClick={() => setShowSubscriptionPlansModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-2 w-full sm:w-auto"
            >
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="sm:inline">Subscribe</span>
              <span className="sm:hidden">Sub</span>
            </Button>
          </div>
        </div>
        <div className="p-2 sm:p-6 overflow-y-auto max-h-[70vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm mb-2 sm:mb-4">
              <TabsTrigger value="inventory" className="text-xs sm:text-sm px-2 sm:px-4">Inventory</TabsTrigger>
              <TabsTrigger value="equipped" className="text-xs sm:text-sm px-2 sm:px-4">Equipped</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm px-2 sm:px-4">History</TabsTrigger>
            </TabsList>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-4 sm:space-y-6">
              {/* Skins */}
              <div>
                <h2 className="text-base sm:text-lg font-bold mb-2 text-black flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  Bird Skins ({getInventoryByType('skin').length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                  {getInventoryByType('skin').map((item) => (
                    <Card key={item.id} className="relative overflow-hidden border-2 hover:border-gray-300 transition-all duration-200">
                      <CardHeader className="pb-2 p-3 sm:p-4">
                        <CardTitle className="text-sm sm:text-lg">{item.name}</CardTitle>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <Badge className={`w-fit text-xs sm:text-sm ${getRarityColor(item.rarity)}`}>
                            {item.rarity || 'Common'}
                          </Badge>
                          {item.equipped && (
                            <Badge className="w-fit bg-green-100 text-green-800 text-xs sm:text-sm">
                              <Check className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                              <span className="hidden sm:inline">Equipped</span>
                              <span className="sm:hidden">Eq</span>
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <ImageWithFallback
                            src={getBirdImageSrc(item)}
                            alt={item.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                            fallbackSrc="/birds2/bird_0.gif"
                          />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                          {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                        </div>
                        <Button
                          onClick={() => handleEquipSkin(item.id)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm py-1 sm:py-2"
                          disabled={item.equipped}
                        >
                          {item.equipped ? 'Equipped' : 'Equip Skin'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Power-ups */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    Power-ups ({inventoryService.getOrganizedPowerUps().length}/5)
                  </h2>
                  <div className="text-sm text-gray-600">
                    Total: {inventoryService.getTotalPowerUpCount()} items
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                  {inventoryService.getOrganizedPowerUps().map((item) => (
                    <Card key={item.id} className="relative overflow-hidden border-2 border-blue-200">
                      <CardHeader className="pb-2 p-3 sm:p-4">
                        <CardTitle className="text-sm sm:text-lg">{item.name}</CardTitle>
                        <Badge className="w-fit bg-blue-100 text-blue-800 text-xs sm:text-sm">
                          x{item.quantity}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <ImageWithFallback
                            src={(() => {
                              switch (item.id) {
                                case 'shield': return 'powerups/Shield.png';
                                case 'magnet': return 'powerups/Coin Magnet.png';
                                case 'extra_life': return 'powerups/Extra life.png';
                                case 'coin_multiplier': return 'powerups/2x Coin Multiplier.png';
                                case 'turbo_start': return 'powerups/turbo-start.png';
                                default: return item.image || `powerups/${item.name.replace(/ /g, '_')}.png` || 'powerups/Shield.png';
                              }
                            })()}
                            alt={item.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                            fallbackSrc="/powerups/extra-life.png"
                          />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                          {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                        </div>
                        <Button
                          onClick={() => { setSelectedPowerUp(item); setShowPowerUpModal(true); }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-1 sm:py-2"
                          disabled={item.quantity <= 0}
                        >
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Power-up Summary (shows all power-ups) */}
                {inventoryService.getPowerUpSummary().length > 5 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">All Power-ups Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {inventoryService.getPowerUpSummary().map((powerUp) => (
                        <div key={powerUp.id} className={`text-xs p-2 rounded ${powerUp.isInTop5 ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100 border border-gray-300'}`}>
                          <div className="font-medium truncate">{powerUp.name}</div>
                          <div className="text-gray-600">x{powerUp.quantity}</div>
                          {!powerUp.isInTop5 && (
                            <div className="text-xs text-gray-500 mt-1">(Stored)</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mystery Boxes */}
              <div>
                <h2 className="text-base sm:text-lg font-bold mb-2 text-black flex items-center gap-2">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  Mystery Boxes ({getInventoryByType('mystery-box').length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                  {getInventoryByType('mystery-box').map((item) => (
                    <Card key={item.id} className="relative overflow-hidden border-2 border-purple-200">
                      <CardHeader className="pb-2 p-3 sm:p-4">
                        <CardTitle className="text-sm sm:text-lg">{item.name}</CardTitle>
                        <Badge className="w-fit bg-purple-100 text-purple-800 text-xs sm:text-sm">
                          x{item.quantity}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <ImageWithFallback
                            src={item.image || `/boxes/${item.id}.png`}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                            fallbackSrc="/boxes/basic-box.png"
                          />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                          {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                        </div>
                        <Button
                          onClick={() => handleOpenMysteryBox(item.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm py-1 sm:py-2"
                          disabled={item.quantity <= 0}
                        >
                          🎁 <span className="hidden sm:inline">Open Box</span>
                          <span className="sm:hidden">Open</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Bundles */}
              <div>
                <h2 className="text-base sm:text-lg font-bold mb-2 text-black flex items-center gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Bundles ({getInventoryByType('bundle').length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                  {getInventoryByType('bundle').map((item) => (
                    <Card key={item.id} className="relative overflow-hidden border-2 border-green-200">
                      <CardHeader className="pb-2 p-3 sm:p-4">
                        <CardTitle className="text-sm sm:text-lg">{item.name}</CardTitle>
                        <Badge className="w-fit bg-green-100 text-green-800 text-xs sm:text-sm">
                          x{item.quantity}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <ImageWithFallback
                            src={item.image || getBundleImage(item.id)}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                            fallbackSrc="/boxes/basic-box.png"
                            lazy={true}
                            retryAttempts={2}
                            retryDelay={500}
                          />
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                          {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                        </div>
                        <Button
                          onClick={() => handleUseBundle(item.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-1 sm:py-2"
                          disabled={item.quantity <= 0}
                        >
                          📦 <span className="hidden sm:inline">Use Bundle</span>
                          <span className="sm:hidden">Use</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Equipped Tab */}
            <TabsContent value="equipped" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                {inventory.filter(item => item.equipped).map((item) => (
                  <Card key={item.id} className="relative overflow-hidden border-2 border-green-300 bg-green-50">
                    <CardHeader className="pb-2 p-3 sm:p-4">
                      <CardTitle className="text-sm sm:text-lg">{item.name}</CardTitle>
                      <Badge className="w-fit bg-green-100 text-green-800 text-xs sm:text-sm">
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        <span className="hidden sm:inline">Equipped</span>
                        <span className="sm:hidden">Eq</span>
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <ImageWithFallback
                          src={getBirdImageSrc(item)}
                          alt={item.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                          fallbackSrc="/birds/bird_0.png"
                        />
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        {dayjs(item.purchasedAt).format('MMM D, YYYY')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Purchase History Tab */}
            <TabsContent value="history" className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                {purchaseHistory.map((purchase) => (
                  <Card key={purchase.id} className="border-l-4 border-blue-500">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-lg">{purchase.itemName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {dayjs(purchase.purchasedAt).format('MMM D, YYYY at h:mm A')}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Price: {purchase.price} {purchase.currency}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
                            Completed
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
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

        <UnclaimedRewardsModal
          open={showUnclaimedModal}
          onClose={() => setShowUnclaimedModal(false)}
          onClaim={handleClaimRewards}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal; 