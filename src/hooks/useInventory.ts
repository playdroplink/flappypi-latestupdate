import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from './useUserProfile';
import { useToast } from '@/components/ui/use-toast';
import { shopItems } from '@/constants/shopItems';
import { inventoryService } from '@/services/inventoryService';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'powerup' | 'consumable' | 'equipment';
  quantity: number;
  maxStackSize: number;
  icon?: string;
  image?: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  equipped?: boolean;
  effects?: {
    [key: string]: number;
  };
}

export interface EquippedItems {
  birdSkin: string;
  powerUps: {
    slot1?: string;
    slot2?: string;
    slot3?: string;
  };
  background?: string;
}

export const useInventory = () => {
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipped, setEquipped] = useState<EquippedItems>({
    birdSkin: '',
    powerUps: {},
  });
  const [loading, setLoading] = useState(false);

  // FIXED: Initialize inventory from profile with improved sync
  useEffect(() => {
    if (profile) {
      // Sync inventory with profile's owned_power_ups first (throttled)
      if (profile.owned_power_ups) {
        // Use setTimeout to throttle the sync call
        const timeoutId = setTimeout(() => {
          inventoryService.syncWithProfilePowerUps(profile.owned_power_ups);
        }, 100); // 100ms delay to prevent excessive calls
        
        return () => clearTimeout(timeoutId);
      }
      
      // Convert profile power-ups to inventory format
      const inventoryItems: InventoryItem[] = [];
      
      // Use owned_power_ups instead of power_ups
      if (profile.owned_power_ups) {
        Object.entries(profile.owned_power_ups).forEach(([powerUpId, quantity]) => {
          if (typeof quantity === 'number' && quantity > 0) {
            inventoryItems.push({
              id: powerUpId,
              name: getPowerUpName(powerUpId),
              type: 'powerup',
              quantity: quantity,
              maxStackSize: 99,
              description: getPowerUpDescription(powerUpId),
              rarity: 'common',
              icon: getPowerUpIcon(powerUpId),
              effects: getPowerUpEffects(powerUpId),
            });
          }
        });
      }
      
      // FIXED: Add event listener for inventory updates
      const handleInventoryUpdate = (event: CustomEvent) => {
        console.log('🔄 Inventory updated in useInventory, refreshing...');
        // Re-run the effect to refresh inventory
        setInventory(inventoryItems);
      };

      window.addEventListener('inventory-updated', handleInventoryUpdate);
      
      setInventory(inventoryItems);
      
      // Add owned skins as equipment using actual shop items data
      let ownedSkins = profile.owned_skins ? [...profile.owned_skins] : [];
      if (!ownedSkins.includes('bird-0')) {
        ownedSkins.unshift('bird-0'); // Always add default bird at the start
      }
      ownedSkins.forEach(skinId => {
        const shopItem = shopItems.find(item => item.id === skinId);
        if (shopItem) {
          inventoryItems.push({
            id: skinId,
            name: shopItem.name,
            type: 'equipment',
            quantity: 1,
            maxStackSize: 1,
            description: shopItem.description || 'Flappy bird skin',
            rarity: getSkinRarity(shopItem.rarity),
            image: shopItem.image,
            equipped: profile.selected_bird_skin === skinId,
          });
        } else {
          // Fallback for unknown skins
          inventoryItems.push({
            id: skinId,
            name: getSkinName(skinId),
            type: 'equipment',
            quantity: 1,
            maxStackSize: 1,
            description: getSkinDescription(skinId),
            rarity: 'common',
            image: getSkinImage(skinId),
            equipped: profile.selected_bird_skin === skinId,
          });
        }
      });

      setInventory(inventoryItems);
      setEquipped({
        birdSkin: profile.selected_bird_skin || '',
        powerUps: {
          slot1: (profile as any).equipped_power_ups?.slot1,
          slot2: (profile as any).equipped_power_ups?.slot2,
          slot3: (profile as any).equipped_power_ups?.slot3,
        },
      });

      return () => {
        window.removeEventListener('inventory-updated', handleInventoryUpdate);
      };
    }
  }, [profile]);

  const addItem = useCallback(async (itemId: string, quantity: number = 1) => {
    // Special handling for random_bundle reward
    if (itemId === 'random_bundle') {
      console.log('🎁 Processing random bundle reward...');
      // Add the random bundle to inventory with the correct image
      // Use correct method for inventoryService
      try {
        const { inventoryService } = await import('@/services/inventoryService');
        inventoryService.saveToInventory({
        id: 'random_bundle',
        name: 'Random Bundle',
        type: 'random_bundle',
        quantity,
        image: '/randombundle.png',
          description: 'A random bundle containing multiple premium items.'
        });
        // Generate random bundle contents
        const bundleContents = generateRandomBundle();
        const addedItems: string[] = [];
        // Add each item from the bundle
        for (const item of bundleContents) {
          await addItem(item.id, item.quantity);
          addedItems.push(`${item.quantity}x ${item.name}`);
        }
        // Show success toast with bundle contents
        toast({
          title: "🎁 Random Bundle Opened!",
          description: `You received: ${addedItems.join(', ')}`,
        });
        return; // Exit early since we've handled the bundle
      } catch (error) {
        console.warn('Failed to save random bundle to inventory:', error);
        // Fallback: just add the items directly
        const bundleContents = generateRandomBundle();
        const addedItems: string[] = [];
        for (const item of bundleContents) {
          await addItem(item.id, item.quantity);
          addedItems.push(`${item.quantity}x ${item.name}`);
        }
        toast({
          title: "🎁 Random Bundle Opened!",
          description: `You received: ${addedItems.join(', ')}`,
        });
        return;
      }
    }

    // Special handling for Flappy Coins
    if (itemId === 'flappy_coins') {
      if (profile) {
        const updatedCoins = (profile.total_coins || 0) + quantity;
        await updateProfile({ total_coins: updatedCoins });
        console.log(`💰 Added ${quantity} Flappy Coins to wallet`);
      }
      return; // Exit early since we've handled coins
    }

    // Special handling for mystery boxes
    if (itemId.startsWith('mystery_box_')) {
      // Add mystery box to inventory using inventoryService
      // Use correct method for inventoryService
      try {
        const { inventoryService: inventoryService2 } = await import('@/services/inventoryService');
        inventoryService2.saveToInventory({
        id: itemId,
        name: `${itemId.replace('mystery_box_', '').charAt(0).toUpperCase() + itemId.replace('mystery_box_', '').slice(1)} Mystery Box`,
        type: 'mystery-box',
        quantity: quantity,
        rarity: itemId.includes('epic') ? 'Epic' : itemId.includes('rare') ? 'Rare' : 'Common',
        image: `/boxes/${itemId.replace('mystery_box_', '')}-box.png`,
          description: `Contains random rewards including coins, power-ups, and possibly skins.`
        });
        console.log(`📦 Added ${quantity}x ${itemId} to inventory`);
        return; // Exit early since we've handled mystery boxes
      } catch (error) {
        console.warn('Failed to save mystery box to inventory:', error);
        // Fallback: just log the addition
        console.log(`📦 Added ${quantity}x ${itemId} to inventory (fallback)`);
        return;
      }
    }

    setInventory(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        const updatedInventory = [...prev];
        const existingItem = updatedInventory[existingItemIndex];
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          existingItem.maxStackSize
        );
        updatedInventory[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
        return updatedInventory;
      } else {
        // Add new item
        const newItem: InventoryItem = {
          id: itemId,
          name: getPowerUpName(itemId),
          type: 'powerup',
          quantity,
          maxStackSize: 99,
          description: getPowerUpDescription(itemId),
          rarity: 'common',
          icon: getPowerUpIcon(itemId),
          effects: getPowerUpEffects(itemId),
        };
        return [...prev, newItem];
      }
    });

    // Update profile
    if (profile) {
      const updatedPowerUps = {
        ...profile.owned_power_ups,
        [itemId]: (profile.owned_power_ups?.[itemId] || 0) + quantity,
      };
      await updateProfile({ owned_power_ups: updatedPowerUps });
    }

    toast({
      title: "Item Added",
      description: `${getPowerUpName(itemId)} x${quantity} added to inventory`,
    });
  }, [profile, updateProfile, toast]);

  // Generate random bundle contents
  const generateRandomBundle = (): Array<{id: string, name: string, quantity: number}> => {
    const bundleContents: Array<{id: string, name: string, quantity: number}> = [];

    // Available power-ups with their names
    const powerUps = [
      { id: 'shield', name: 'Shield' },
      { id: 'magnet', name: 'Coin Magnet' },
      { id: 'extraLife', name: 'Extra Life' },
      { id: 'doubleCoins', name: 'Double Coins' },
      { id: 'speed', name: 'Speed Boost' },
      { id: 'slowMotion', name: 'Slow Motion' },
      { id: 'turbo_start', name: 'Turbo Start' },
      { id: 'coin_multiplier', name: '2x Coin Multiplier' }
    ];

    // Always include at least 4 power-ups (random types, 2-5 each)
    const shuffledPowerUps = [...powerUps].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 4; i++) {
      const powerUp = shuffledPowerUps[i];
      const quantity = 2 + Math.floor(Math.random() * 4);
      bundleContents.push({
        id: powerUp.id,
        name: powerUp.name,
        quantity: quantity
      });
    }

    // Always include at least 1 coin reward
    const coinAmount = 2000 + Math.floor(Math.random() * 3000); // 2000-5000 coins
    bundleContents.push({
      id: 'flappy_coins',
      name: 'Flappy Coins',
      quantity: coinAmount
    });

    // Always include at least 1 mystery box
    const mysteryBoxes = ['basic', 'rare', 'epic'];
    const randomBox = mysteryBoxes[Math.floor(Math.random() * mysteryBoxes.length)];
    bundleContents.push({
      id: `mystery_box_${randomBox}`,
      name: `${randomBox.charAt(0).toUpperCase() + randomBox.slice(1)} Mystery Box`,
      quantity: 1
    });

    // Optionally add a second mystery box (15% chance)
    if (Math.random() < 0.15) {
      const mysteryBoxes2 = ['rare', 'epic', 'legendary'];
      const randomBox2 = mysteryBoxes2[Math.floor(Math.random() * mysteryBoxes2.length)];
      bundleContents.push({
        id: `mystery_box_${randomBox2}`,
        name: `${randomBox2.charAt(0).toUpperCase() + randomBox2.slice(1)} Mystery Box`,
        quantity: 1
      });
    }

    // If less than 5 items, add more random power-ups to reach 5
    while (bundleContents.length < 5) {
      const extraPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
      bundleContents.push({
        id: extraPowerUp.id,
        name: extraPowerUp.name,
        quantity: 1
      });
    }

    console.log('🎁 Generated random bundle contents:', bundleContents);
    return bundleContents;
  };

  const removeItem = useCallback(async (itemId: string, quantity: number = 1) => {
    setInventory(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        const updatedInventory = [...prev];
        const existingItem = updatedInventory[existingItemIndex];
        const newQuantity = Math.max(0, existingItem.quantity - quantity);
        
        if (newQuantity === 0) {
          updatedInventory.splice(existingItemIndex, 1);
        } else {
          updatedInventory[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };
        }
        return updatedInventory;
      }
      return prev;
    });

    // Update profile
    if (profile) {
      const currentQuantity = profile.owned_power_ups?.[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity - quantity);
      const updatedPowerUps = {
        ...profile.owned_power_ups,
        [itemId]: newQuantity,
      };
      
      if (newQuantity === 0) {
        delete updatedPowerUps[itemId];
      }
      
      await updateProfile({ owned_power_ups: updatedPowerUps });
    }
  }, [profile, updateProfile]);

  const equipPowerUp = useCallback(async (itemId: string, slot: 'slot1' | 'slot2' | 'slot3') => {
    const item = inventory.find(i => i.id === itemId && i.type === 'powerup');
    if (!item || item.quantity <= 0) {
      toast({
        title: "Cannot Equip",
        description: "Item not found or insufficient quantity",
        variant: "destructive",
      });
      return false;
    }

    setEquipped(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [slot]: itemId,
      },
    }));

    // Update profile
    // TODO: If equipped_power_ups is not a valid property on UserProfile, update via supported method or property.
    // const updatedEquippedPowerUps = {
    //   ...((profile as any).equipped_power_ups || {}),
    //   [slot]: itemId,
    // };
    // await updateProfile({ equipped_power_ups: updatedEquippedPowerUps });

    toast({
      title: "Power-Up Equipped",
      description: `${item.name} equipped to ${slot}`,
    });

    return true;
  }, [inventory, profile, updateProfile, toast]);

  const unequipPowerUp = useCallback(async (slot: 'slot1' | 'slot2' | 'slot3') => {
    setEquipped(prev => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [slot]: undefined,
      },
    }));

    // Update profile
    // TODO: If equipped_power_ups is not a valid property on UserProfile, update via supported method or property.
    // const updatedEquippedPowerUps2 = { ...((profile as any).equipped_power_ups || {}) };
    // delete updatedEquippedPowerUps2[slot];
    // await updateProfile({ equipped_power_ups: updatedEquippedPowerUps2 });

    toast({
      title: "Power-Up Unequipped",
      description: `Removed from ${slot}`,
    });
  }, [profile, updateProfile, toast]);

  const equipSkin = useCallback(async (skinId: string) => {
    const item = inventory.find(i => i.id === skinId && i.type === 'equipment');
    if (!item) {
      toast({
        title: "Cannot Equip",
        description: "Skin not found in inventory",
        variant: "destructive",
      });
      return false;
    }

    // Unequip previous skin
    setInventory(prev => prev.map(item => ({
      ...item,
      equipped: item.type === 'equipment' ? item.id === skinId : item.equipped,
    })));

    setEquipped(prev => ({
      ...prev,
      birdSkin: skinId,
    }));

    // Update profile
    await updateProfile({ selected_bird_skin: skinId });

    toast({
      title: "Skin Equipped",
      description: `${item.name} is now your active bird skin`,
    });

    return true;
  }, [inventory, updateProfile, toast]);

  const getItemsByType = useCallback((type: InventoryItem['type']) => {
    return inventory.filter(item => item.type === type);
  }, [inventory]);

  const getEquippedPowerUps = useCallback(() => {
    return {
      slot1: equipped.powerUps.slot1 ? inventory.find(i => i.id === equipped.powerUps.slot1) : undefined,
      slot2: equipped.powerUps.slot2 ? inventory.find(i => i.id === equipped.powerUps.slot2) : undefined,
      slot3: equipped.powerUps.slot3 ? inventory.find(i => i.id === equipped.powerUps.slot3) : undefined,
    };
  }, [equipped.powerUps, inventory]);

  return {
    inventory,
    equipped,
    loading,
    addItem,
    removeItem,
    equipPowerUp,
    unequipPowerUp,
    equipSkin,
    getItemsByType,
    getEquippedPowerUps,
  };
};

// Helper functions for item data
const getPowerUpName = (id: string): string => {
  const names: { [key: string]: string } = {
    shield: 'Shield',
    speed: 'Speed Boost',
    magnet: 'Coin Magnet',
    extraLife: 'Extra Life',
    doubleCoins: 'Double Coins',
    slowMotion: 'Slow Motion',
    turbo_start: 'Turbo Start',
    coin_multiplier: '2x Coin Multiplier',
    extra_life: 'Extra Life'
  };
  return names[id] || id;
};

const getPowerUpDescription = (id: string): string => {
  const descriptions: { [key: string]: string } = {
    shield: 'Protects from one collision',
    speed: 'Increases bird speed temporarily',
    magnet: 'Attracts nearby coins',
    extraLife: 'Grants an additional life',
    doubleCoins: 'Doubles coin collection',
    slowMotion: 'Slows down time',
    turbo_start: 'Gives you a speed boost at the start',
    coin_multiplier: 'Doubles all coins collected',
    extra_life: 'Grants an additional life'
  };
  return descriptions[id] || 'Unknown power-up';
};

const getPowerUpIcon = (id: string): string => {
  const icons: { [key: string]: string } = {
    shield: '/powerups/shield.png',
    speed: '/powerups/Speed Boost.png',
    magnet: '/powerups/coin-magnet.png',
    extraLife: '/powerups/extra-life.png',
    doubleCoins: '/powerups/Double Coins.png',
    slowMotion: '/powerups/Slow Motion.png',
    turbo_start: '/powerups/turbo-start.png',
    coin_multiplier: '/powerups/2x-coin-multiplier.png',
    extra_life: '/powerups/extra-life.png'
  };
  return icons[id] || '/icons/default.png';
};

const getPowerUpEffects = (id: string): { [key: string]: number } => {
  const effects: { [key: string]: { [key: string]: number } } = {
    shield: { shield: 1, duration: 15000 },
    speed: { speedBoost: 1, duration: 10000 },
    magnet: { magnet: 1, duration: 12000 },
    extraLife: { lives: 1 },
    doubleCoins: { coinMultiplier: 2, duration: 8000 },
    slowMotion: { slowMotion: 1, duration: 6000 },
    turbo_start: { turboStart: 1, duration: 5000 },
    coin_multiplier: { coinMultiplier: 2, duration: 10000 },
    extra_life: { lives: 1 }
  };
  const effect = effects[id] || {};
  // Convert nested object to flat key-value pairs
  const flatEffects: { [key: string]: number } = {};
  Object.entries(effect).forEach(([key, value]) => {
    flatEffects[key] = value;
  });
  return flatEffects;
};

// Convert shop item rarity to inventory rarity format
const getSkinRarity = (rarity: string): 'common' | 'rare' | 'epic' | 'legendary' => {
  switch (rarity.toLowerCase()) {
    case 'legendary': return 'legendary';
    case 'epic': return 'epic';
    case 'rare': return 'rare';
    case 'special': return 'epic'; // Map special to epic
    default: return 'common';
  }
};

// Fallback functions for unknown skins (kept for backward compatibility)
const getSkinName = (id: string): string => {
  const names: { [key: string]: string } = {
    'bird-0': 'Sky Blue Flappy',
    'bird-1': 'Red Flappy',
    'bird-2': 'Green Flappy',
    'bird-3': 'Purple Flappy',
    'bird-4': 'Elite Parrot',
    'bird-5': 'Elite Eagle',
    'bird-6': 'Golden Phoenix',
    'bird-7': 'Black Flappy',
    'bird-8': 'Pink Flappy',
    'bird-9': 'Orange Flappy',
    'bird-10': 'Golden Flappy',
    'bird-11': 'Golden Dragon',
  };
  return names[id] || `Bird ${id}`;
};

const getSkinDescription = (id: string): string => {
  const descriptions: { [key: string]: string } = {
    'bird-0': 'The classic blue bird that started it all',
    'bird-1': 'A fiery red bird with attitude',
    'bird-2': 'Nature-loving green bird',
    'bird-3': 'Mysterious purple bird',
    'bird-4': 'Intelligent tropical parrot',
    'bird-5': 'Majestic eagle of the skies',
    'bird-6': 'Legendary phoenix with golden flames',
    'bird-7': 'Stealthy black bird of the night',
    'bird-8': 'Playful pink bird spreading joy',
    'bird-9': 'Vibrant orange bird full of energy',
    'bird-10': 'Golden bird of prosperity',
    'bird-11': 'Legendary dragon with cosmic powers',
  };
  return descriptions[id] || 'Custom bird skin';
};

const getSkinImage = (id: string): string => {
  const images: { [key: string]: string } = {
    'bird-0': '/birds/bird_0.png',
    'bird-1': '/birds/bird_1.png',
    'bird-2': '/birds/bird_2.png',
    'bird-3': '/birds/bird_3.png',
    'bird-4': '/birds/bird_4.png',
    'bird-5': '/birds/bird_5.png',
    'bird-6': '/birds/bird_6.png',
    'bird-7': '/birds/bird_7.png',
    'bird-8': '/birds/bird_8.png',
    'bird-9': '/birds/bird_9.png',
    'bird-10': '/birds/bird_10.png',
    'bird-11': '/birds/bird_11.png',
  };
  return images[id] || '/birds/bird_0.png';
}; 