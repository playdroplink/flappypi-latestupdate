import React from 'react';
import BirdSkinCard from './BirdSkinCard';
import { useNavigate } from 'react-router-dom';
import { ShopItem } from '@/constants/shopItems';
import { UserProfile } from '@/types/gameTypes';

interface BirdCharactersSectionProps {
  shopItems: ShopItem[];
  profile: UserProfile | null;
  flappyCoins: number;
  onCharPurchaseAttempt?: (item: ShopItem, method: 'pi' | 'coins') => void;
  onEquipSkin?: (skinId: string) => Promise<void>;
  getBirdImagePath: (id: string) => string;
  getRarityColor: (rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary') => string;
  getRarityGlow: (rarity: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary') => string;
  isPiBrowser: boolean;
  onSubscribe?: () => void;
}

const BirdCharactersSection: React.FC<BirdCharactersSectionProps> = ({
  shopItems,
  profile,
  flappyCoins,
  onCharPurchaseAttempt,
  onEquipSkin,
  getBirdImagePath,
  getRarityColor,
  getRarityGlow,
  isPiBrowser,
  onSubscribe,
}) => {
  const navigate = useNavigate();

  const isOwned = (itemId: string) => profile?.owned_skins?.includes(itemId);
  const isEquipped = (itemId: string) => profile?.selected_bird_skin === itemId;
  const isCharacterAffordable = (item: ShopItem, method: 'pi' | 'coins') => {
    if (!profile) return false;
    if (method === 'pi') return profile.pi_balance !== undefined && profile.pi_balance >= item.piPrice;
    return flappyCoins >= item.flappyCoinPrice;
  };

  const getBirdImagePathCustom = (id: string) => shopItems.find(i => i.id === id)?.image || '';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg">Bird Characters</h2>
        <button
          className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200"
          onClick={() => navigate('/wiki')}
        >
          Flappy Wiki
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.map((item) => (
          <BirdSkinCard
            key={item.id}
            item={item}
            isOwned={isOwned(item.id)}
            isSelected={isEquipped(item.id)}
            canUse={isOwned(item.id)}
            onSelect={() => {
              if (profile && profile.selected_bird_skin !== item.id) {
                if (onEquipSkin) {
                  onEquipSkin(item.id);
                }
              }
            }}
            onPurchasePi={(itemToPurchase) => onCharPurchaseAttempt && onCharPurchaseAttempt(itemToPurchase, 'pi')}
            onPurchaseCoins={(itemToPurchase) => onCharPurchaseAttempt && onCharPurchaseAttempt(itemToPurchase, 'coins')}
            userCoins={flappyCoins}
            isCharacterAffordable={isCharacterAffordable}
            getBirdImagePath={getBirdImagePathCustom}
            getRarityColor={getRarityColor}
            getRarityGlow={getRarityGlow}
            profilePiBalance={profile?.pi_balance || 0}
            isLimited={item.isLimited}
            supply={item.supply}
            isPiBrowser={isPiBrowser}
            onSubscribe={onSubscribe}
          />
        ))}
      </div>
    </div>
  );
};

export default BirdCharactersSection;
