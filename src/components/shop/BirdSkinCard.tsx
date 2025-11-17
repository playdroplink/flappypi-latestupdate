import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Crown, Lock, Check } from 'lucide-react';
import PiPaymentModal from '../PiPaymentModal';
import { shopItems, ShopItem } from '@/constants/shopItems';
import ImageWithFallback from '../ImageWithFallback';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';

interface BirdSkinCardProps {
  item: ShopItem;
  isOwned: boolean;
  isSelected: boolean;
  canUse: boolean;
  onSelect: () => void;
  onPurchasePi: (item: ShopItem) => void;
  onPurchaseCoins: (item: ShopItem) => void;
  userCoins: number;
  isCharacterAffordable: (item: ShopItem, method: 'pi' | 'coins') => boolean;
  getBirdImagePath: (id: string) => string;
  getRarityColor: (rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary') => string;
  getRarityGlow: (rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary') => string;
  profilePiBalance: number;
  isLimited?: boolean;
  supply?: number;
  onSubscribe?: () => void;
}

const BirdSkinCard: React.FC<BirdSkinCardProps> = ({
  item,
  isOwned,
  isSelected,
  canUse,
  onSelect,
  onPurchasePi,
  onPurchaseCoins,
  userCoins,
  isCharacterAffordable,
  getBirdImagePath,
  getRarityColor,
  getRarityGlow,
  profilePiBalance,
  isLimited,
  supply,
  onSubscribe,
}) => {
  const [showPiModal, setShowPiModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    console.log(`BirdSkinCard: Item ${item.name} (${item.id})`);
    console.log(`  isOwned: ${isOwned}`);
    console.log(`  isSelected: ${isSelected}`);
    console.log(`  isDefault: ${item.isDefault}`);
    console.log(`  isLimited: ${isLimited}, supply: ${supply}`);
    console.log(`  isSoldOut: ${isLimited && supply !== undefined && supply <= 0}`);
    console.log(`  Pi Price: ${item.piPrice}, Coin Price: ${item.flappyCoinPrice}`);
    console.log(`  User Coins: ${userCoins}`);
    console.log(`  Profile Pi Balance: ${profilePiBalance}`);
    console.log(`  Is affordable with Pi?: ${isCharacterAffordable(item, 'pi')}`);
    console.log(`  Is affordable with Coins?: ${isCharacterAffordable(item, 'coins')}`);
  }, [item, isOwned, isSelected, canUse, userCoins, profilePiBalance, isLimited, supply, isCharacterAffordable]);

  // Calculate status text and styles
  let statusText = '';
  let statusColor = '';
  const isDefault = item.id === 'bird-0';
  const isInfernoPhoenix = item.id === 'inferno_phoenix' || item.id === 'inferno-phoenix';
  const isSoldOut = isLimited && supply !== undefined && supply <= 0; // Check for sold out

  if (isDefault) {
    statusText = 'Default';
    statusColor = 'bg-purple-100 text-purple-700';
  } else if (isInfernoPhoenix) {
    statusText = 'Not for Sale';
    statusColor = 'bg-orange-500 text-white font-bold';
  } else if (isSoldOut) {
    statusText = 'Sold Out';
    statusColor = 'bg-red-500 text-white';
  } else if (isSelected) {
    statusText = 'Selected';
    statusColor = 'bg-green-100 text-green-700';
  } else if (isOwned) {
    statusText = 'Owned';
    statusColor = 'bg-blue-100 text-blue-700';
  } else {
    statusText = 'Available';
    statusColor = 'bg-gray-100 text-gray-700';
  }

  // Promo logic
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (item.promoEndDate) {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [item.promoEndDate]);
  const promoActive = item.promoPiPrice && item.promoEndDate && new Date(item.promoEndDate).getTime() > now;
  const timeLeft = promoActive ? new Date(item.promoEndDate).getTime() - now : 0;
  const hours = Math.max(0, Math.floor(timeLeft / 3600000)) || 0;
  const minutes = Math.max(0, Math.floor((timeLeft % 3600000) / 60000)) || 0;
  const seconds = Math.max(0, Math.floor((timeLeft % 60000) / 1000)) || 0;

  // Random discount logic (1 or 2 Pi) if no promo is active
  const [randomDiscount, setRandomDiscount] = useState<number | null>(null);
  useEffect(() => {
    if (!promoActive && !isDefault && item.piPrice > 2) {
      setRandomDiscount(Math.floor(Math.random() * 2) + 1); // 1 or 2
    } else {
      setRandomDiscount(null);
    }
  }, [promoActive, item.piPrice, item.id, isDefault]);
  const discountedPiPrice = promoActive
    ? item.promoPiPrice
    : randomDiscount
      ? item.piPrice - randomDiscount
      : item.piPrice;

  const handlePiPaymentClick = () => {
    onPurchasePi(item);
  };

  const handleCoinPurchaseClick = () => {
    onPurchaseCoins(item);
  };

  // Custom placeholder for bird images
  const BirdImagePlaceholder = ({ isLoading, hasError }: { isLoading: boolean; hasError: boolean }) => (
    <div className="h-32 flex items-center justify-center w-full bg-blue-50/50 rounded-lg mb-2">
      <div className="flex flex-col items-center space-y-2">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-xs text-gray-500">Loading bird...</p>
          </>
        ) : hasError ? (
          <>
            <div className="text-red-500 text-2xl">🐦</div>
            <p className="text-xs text-red-500 text-center">Image failed</p>
          </>
        ) : (
          <div className="text-gray-400 text-4xl">🐦</div>
        )}
      </div>
    </div>
  );

  // Special handling for Fire Phoenix
  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSubscribe) onSubscribe();
  };

  // Only show sale/discount if item.type === 'skin' or item.type === 'bundle' and sale is active
  const isFlappySkinOrBundle = item.type === 'skin' || item.type === 'bundle';
  const showPromo = isFlappySkinOrBundle && promoActive;
  const showDiscount = isFlappySkinOrBundle && !promoActive && randomDiscount;

  return (
    <Card className={`flex flex-col items-center justify-between p-6 bg-white rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden ${isSelected ? 'border-2 border-green-500' : isInfernoPhoenix ? 'border-4 border-yellow-400 shadow-yellow-400/60 ring-4 ring-yellow-300 animate-glow' : 'border border-gray-200'} ${getRarityGlow(item.rarity)}`}>
      <div className="relative w-full flex flex-col items-center">
        {/* Promo Badge or Discount Badge */}
        {showPromo ? (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-pink-500 text-white z-20 animate-pulse shadow-lg">
            Limited Time: <span className="font-extrabold">{item.promoPiPrice} Pi</span> <span className="ml-2">⏰ {hours}:{minutes.toString().padStart(2,'0')}:{seconds.toString().padStart(2,'0')}</span>
          </div>
        ) : showDiscount ? (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white z-20 animate-pulse shadow-lg">
            Discount: <span className="font-extrabold">-{randomDiscount} Pi</span>
          </div>
        ) : null}
        
        {/* Status Badge */}
        {(isDefault || isSoldOut || isSelected || isOwned || isInfernoPhoenix) && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
            isInfernoPhoenix ? 'bg-orange-500 text-white animate-pulse' : statusColor
          } z-10`}>
            {isInfernoPhoenix ? 'Not for Sale' : statusText}
          </div>
        )}
        {/* Special Rarity Badge for Fire Phoenix */}
        {isInfernoPhoenix && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-pink-500 text-white z-10 animate-pulse">
            Special
          </div>
        )}
        {/* Fire Phoenix Marketing Message */}
        {isInfernoPhoenix && !isOwned && (
          <div className="absolute left-1/2 top-12 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-300 text-red-700 z-20 animate-bounce shadow-lg border border-yellow-500">
            🔥 Fire Phoenix is exclusive! Subscribe to Ultimate Pack for 30 Pi to unlock.
          </div>
        )}
        
        {/* Image with enhanced preview and fixed glow effect */}
        <div className="h-32 flex items-center justify-center w-full bg-blue-50/50 rounded-lg mb-2 relative overflow-hidden">
          <div className="relative">
            <ImageWithFallback
              src={getBirdImageSrc(item)}
              alt={item.name}
              className="h-20 w-20 object-contain animate-bounce mx-auto filter drop-shadow-lg"
              fallbackSrc="/birds/bird_12.png"
              lazy={true}
              placeholder={<BirdImagePlaceholder isLoading={true} hasError={false} />}
              onLoad={() => {
                setImageLoaded(true);
                console.log(`✅ Bird image loaded: ${item.name}`);
              }}
              onError={() => {
                console.warn(`❌ Bird image failed: ${item.name}`);
              }}
              retryAttempts={3}
              retryDelay={1000}
            />
            
            {/* Fixed glow effect - positioned behind the image and properly sized */}
            {imageLoaded && (item.rarity === 'Epic' || item.rarity === 'Legendary') && (
              <div className={`absolute inset-0 rounded-full opacity-40 animate-pulse pointer-events-none transform scale-125 ${
                item.rarity === 'Legendary' 
                  ? 'bg-gradient-radial-yellow' 
                  : 'bg-gradient-radial-purple'
              }`} 
              style={{
                zIndex: -1
              }}>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between w-full">
        <div className="mt-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            {item.name}
            {item.isDefault ? (
              <span className="px-2 py-0.5 rounded text-xs font-bold ml-2 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 text-gray-700 border border-gray-400 shadow-sm" style={{boxShadow:'0 1px 4px 0 rgba(180,180,180,0.15)'}}>
                Free
              </span>
            ) : (
              <span
                className={
                  `px-2 py-0.5 rounded text-xs font-bold ml-2 ` +
                  (item.rarity === 'Common' ? 'bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 text-gray-700 border border-gray-400 shadow-sm' : item.rarity === 'Special' ? 'bg-pink-500 text-white border border-pink-600 shadow-md animate-pulse' : getRarityColor(item.rarity))
                }
                style={item.rarity === 'Common' ? {boxShadow:'0 1px 4px 0 rgba(180,180,180,0.15)'} : {}}
              >
                {item.rarity}
              </span>
            )}
            {isLimited && supply !== undefined && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-yellow-200 text-yellow-800">
                Limited: {supply} left
              </span>
            )}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden text-ellipsis">{item.description}</p>
          )}
        </div>
        
        {/* Price Section */}
        {!isInfernoPhoenix ? (
          <div className="flex flex-col items-center mt-2 mb-4">
            {promoActive ? (
              <>
                <span className="text-lg font-bold text-gray-400 line-through">{item.piPrice} Pi</span>
                <span className="text-2xl font-extrabold text-pink-500">{item.promoPiPrice} Pi</span>
              </>
            ) : randomDiscount ? (
              <>
                <span className="text-lg font-bold text-gray-400 line-through">{item.piPrice} Pi</span>
                <span className="text-2xl font-extrabold text-green-500">{discountedPiPrice} Pi</span>
                <span className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">SALE</span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-blue-700">{item.piPrice} Pi</span>
            )}
          </div>
        ) : null}
        
        {/* Price and Actions */}
        {!isInfernoPhoenix && !isOwned && !isDefault && !isSoldOut && (
          <div className="mt-4 flex flex-col gap-2">
            {item.piPrice > 0 && (
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center shadow-md transition-transform duration-150 hover:scale-105"
                onClick={() => onPurchasePi({ ...item, piPrice: discountedPiPrice })}
                disabled={!isCharacterAffordable({ ...item, piPrice: discountedPiPrice }, 'pi')}
              >
                <img src="/pi-logo.png" alt="Pi" className="w-6 h-6 mr-2" />
                {discountedPiPrice} Pi
              </Button>
            )}
            {item.flappyCoinPrice > 0 && (
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center shadow-md transition-transform duration-150 hover:scale-105"
                onClick={handleCoinPurchaseClick}
                disabled={!isCharacterAffordable(item, 'coins')}
              >
                <Coins className="h-6 w-6 mr-2" />
                {item.flappyCoinPrice} Coins
              </Button>
            )}
          </div>
        )}
        
        {/* Claim by Subscribing Ultimate Pack Button */}
        {isInfernoPhoenix && !isOwned && (
          <button
            className="w-full py-3 rounded-xl font-extrabold text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-2 border-purple-500 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 mt-2 mb-1 relative overflow-hidden group hover:scale-105 shimmer"
            onClick={handleSubscribeClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 shimmer-effect"></div>
            <div className="relative z-10 flex items-center justify-center">
              <img 
                src="/npc gif/subscriptionplanbutton.gif.gif" 
                alt="Subscription Plan" 
                className="w-6 h-6 mr-2 filter brightness-0 invert group-hover:scale-110 transition-transform duration-300"
              />
              Subscribe to Ultimate Pack
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
          </button>
        )}
        
        {/* Remove equip/select button for Fire Phoenix */}
        {(!isInfernoPhoenix && (isOwned || isDefault) && !isSelected) && (
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg mt-4 shadow-md transition-transform duration-150 hover:scale-105"
            onClick={onSelect}
          >
            Select Character <Check className="ml-2 h-5 w-5" />
          </Button>
        )}
        {(!isInfernoPhoenix && isSelected) && (
          <Button
            className="w-full bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg text-lg mt-4 cursor-default"
            disabled
          >
            Selected <Check className="ml-2 h-5 w-5" />
          </Button>
        )}
        {!isOwned && !isDefault && isSoldOut && (
          <Button
            className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-lg mt-4 cursor-not-allowed"
            disabled
          >
            Sold Out <Lock className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BirdSkinCard;
