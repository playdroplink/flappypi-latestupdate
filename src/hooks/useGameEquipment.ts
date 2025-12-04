import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';

interface PowerUp {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  description?: string;
  effect?: string;
}

interface GameEquipment {
  equippedSkin: any;
  availablePowerUps: PowerUp[];
  activePowerUps: { [key: string]: any };
  isShieldActive: boolean;
  isMagnetActive: boolean;
  isExtraLifeActive: boolean;
  isCoinMultiplierActive: boolean;
  isTurboActive: boolean;
  // Anti-abuse tracking
  powerUpUsageCount: { [key: string]: number };
  lastPowerUpUse: { [key: string]: number };
  gameSessionStart: number;
  totalPowerUpsUsed: number;
}

export const useGameEquipment = () => {
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile(); // Get both profile and updateProfile
  const [equipment, setEquipment] = useState<GameEquipment>({
    equippedSkin: null,
    availablePowerUps: [],
    activePowerUps: {},
    isShieldActive: false,
    isMagnetActive: false,
    isExtraLifeActive: false,
    isCoinMultiplierActive: false,
    isTurboActive: false,
    // Anti-abuse tracking
    powerUpUsageCount: {},
    lastPowerUpUse: {},
    gameSessionStart: Date.now(),
    totalPowerUpsUsed: 0
  });

  // Load equipment from inventory
  const loadEquipment = useCallback(() => {
    // Loading equipment...
    console.log('🔧 [useGameEquipment] loadEquipment() called at', new Date().toISOString());
    try {
      const inventory = inventoryService.getInventory();
      console.log('🔧 [useGameEquipment] Full inventory loaded:', inventory.length, 'items');
      console.log('🔧 [useGameEquipment] Powerups in inventory:', inventory.filter(i => i.type === 'powerup'));
      
      // Get equipped skin
      const equippedSkin = inventory.find(item => item.type === 'skin' && item.equipped);
      console.log('🔧 [useGameEquipment] Equipped skin:', equippedSkin?.id || 'none');
      
      // MIGRATION: Auto-equip all powerups that don't have equipped field set (legacy purchases)
      let needsSave = false;
      inventory.forEach(item => {
        if (item.type === 'powerup' && item.quantity > 0 && item.equipped === undefined) {
          console.log('🔄 [MIGRATION] Auto-equipping legacy powerup:', item.id);
          item.equipped = true;
          needsSave = true;
        }
      });
      if (needsSave) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
        console.log('✅ [MIGRATION] Saved auto-equipped powerups to localStorage');
      }
      
      // Get available powerups from localStorage FIRST (this is the source of truth after purchase)
      // Only include powerups that are equipped (equipped === true) OR have no equipped field (undefined = auto-equipped)
      // This handles both shop purchases (equipped: undefined) and mystery box rewards (no equipped field)
      const allPowerUps = inventory.filter(item => 
        item.type === 'powerup' && 
        item.quantity > 0 && 
        (item.equipped === true || item.equipped === undefined)
      );
      
      console.log('📦 [useGameEquipment] Loaded EQUIPPED powerups from inventory:', allPowerUps.map(p => `${p.id}:${p.quantity} (equipped:${p.equipped})`).join(', ') || 'none');
      
      // Also check profile's owned_power_ups if available
      let profilePowerUps: PowerUp[] = [];
      if (profile && profile.owned_power_ups) {
        profilePowerUps = Object.entries(profile.owned_power_ups)
          .filter(([_, quantity]) => typeof quantity === 'number' && quantity > 0)
          .map(([powerUpId, quantity]) => ({
            id: powerUpId,
            name: getPowerUpName(powerUpId),
            icon: (() => {
              switch (powerUpId) {
                case 'shield': return '/powerups/shield.png';
                case 'magnet': return '/powerups/coin-magnet.png';
                case 'extra_life': return '/powerups/extra-life.png';
                case 'coin_multiplier': return '/powerups/2x-coin-multiplier.png';
                case 'turbo_start': return '/powerups/turbo-start.png';
                default:
                  return `/powerups/${powerUpId.replace('_', '-')}.png` || '/powerups/shield.png';
              }
            })(),
            quantity: quantity as number,
            description: typeof getPowerUpEffect(powerUpId) === 'string' ? getPowerUpEffect(powerUpId) : 'Power-up effect',
            effect: typeof getPowerUpEffect(powerUpId) === 'string' ? getPowerUpEffect(powerUpId) : 'Power-up effect'
          }));
      }
      
      // FIXED: Improved power-up loading with better sync
      // First, ensure inventory is synced with profile
      if (profile && profile.owned_power_ups) {
        inventoryService.syncWithProfilePowerUps(profile.owned_power_ups);
      }
      
      // Get fresh inventory after sync
      const freshInventory = inventoryService.getInventory();
      const freshPowerUps = freshInventory.filter(item => item.type === 'powerup' && item.quantity > 0);
      
      // Combine all sources with priority: profile > fresh inventory > old inventory
      const combinedPowerUps = [...profilePowerUps, ...freshPowerUps, ...allPowerUps];
      
      // Remove duplicates by keeping the one with higher quantity
      const powerUpsMap = new Map<string, PowerUp>();
      combinedPowerUps.forEach(powerUp => {
        const existing = powerUpsMap.get(powerUp.id);
        if (!existing || powerUp.quantity > existing.quantity) {
          // Ensure proper PowerUp type with safe property access
          const powerUpItem: PowerUp = {
            id: powerUp.id,
            name: powerUp.name,
            icon: 'icon' in powerUp ? powerUp.icon : `/powerups/${powerUp.id}.png`,
            quantity: powerUp.quantity,
            description: powerUp.description || '',
            effect: 'effect' in powerUp ? powerUp.effect : getPowerUpEffect(powerUp.id)
          };
          powerUpsMap.set(powerUp.id, powerUpItem);
        }
      });
      
      const powerUps: PowerUp[] = Array.from(powerUpsMap.values())
        .filter(item => item.quantity > 0) // Double-check: only show power-ups with quantity > 0
        .map(item => ({
          id: item.id,
          name: item.name,
          icon: (() => {
            switch (item.id) {
              case 'shield': return '/powerups/shield.png';
              case 'magnet': return '/powerups/coin-magnet.png';
              case 'extra_life': return '/powerups/extra-life.png';
              case 'coin_multiplier': return '/powerups/2x-coin-multiplier.png';
              case 'turbo_start': return '/powerups/turbo-start.png';
              default:
                // Fallback for unknown power-ups
                return `/powerups/${item.name.replace(/ /g, '-')}.png` || '/powerups/shield.png';
            }
          })(),
          quantity: item.quantity,
          description: item.description,
          effect: typeof getPowerUpEffect(item.id) === 'string' ? getPowerUpEffect(item.id) : 'Power-up effect'
        }))
        .filter(powerUp => powerUp.quantity > 0); // Final filter to ensure no 0 quantity power-ups

      console.log('✅ [useGameEquipment] Final powerups ready for game:', powerUps.map(p => `${p.id}:${p.quantity}`).join(', ') || 'NONE');

      setEquipment(prev => {
        const newEquipment = {
          ...prev,
          equippedSkin,
          availablePowerUps: powerUps
          // Note: We preserve activePowerUps and related flags to maintain active effects
        };
        

        
        return newEquipment;
      });
    } catch (error) {
      console.error('❌ Error loading equipment:', error);
    }
  }, [profile]);

  // Get powerup effect description
  const getPowerUpEffect = (powerUpId: string): string => {
    const effects = {
      'shield': 'Protects from one collision',
      'magnet': 'Attracts coins from distance',
      'extra_life': 'Revives you once when you die',
      'coin_multiplier': 'Doubles coin earnings',
      'turbo_start': 'Increases game speed temporarily'
    };
    return effects[powerUpId as keyof typeof effects] || 'Provides a special effect';
  };

  // Helper function to get power-up name
  const getPowerUpName = (powerUpId: string): string => {
    const names = {
      'shield': 'Shield',
      'magnet': 'Coin Magnet',
      'extra_life': 'Extra Life',
      'coin_multiplier': '2x Coin Multiplier',
      'turbo_start': 'Turbo Start'
    };
    return names[powerUpId as keyof typeof names] || powerUpId.replace('_', ' ');
  };

  // Anti-abuse validation
  const validatePowerUpUsage = useCallback((powerUpId: string): { allowed: boolean; reason?: string } => {
    const now = Date.now();
    const sessionDuration = now - equipment.gameSessionStart;
    
    // Rule 1: Maximum 2 power-ups active at the same time
    const activePowerUpCount = Object.keys(equipment.activePowerUps).length;
    if (activePowerUpCount >= 2) {
      return { allowed: false, reason: 'Maximum 2 power-ups can be active at the same time' };
    }
    
    // Rule 2: Cooldown between same power-up usage (30 seconds)
    const lastUse = equipment.lastPowerUpUse[powerUpId] || 0;
    const cooldownTime = 30000; // 30 seconds
    if (now - lastUse < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (now - lastUse)) / 1000);
      return { allowed: false, reason: `Cooldown active: ${remainingTime}s remaining` };
    }
    
    // Rule 3: Maximum power-ups per session (10 power-ups per 5 minutes)
    const maxPowerUpsPerSession = 10;
    const sessionTimeLimit = 5 * 60 * 1000; // 5 minutes
    if (sessionDuration < sessionTimeLimit && equipment.totalPowerUpsUsed >= maxPowerUpsPerSession) {
      return { allowed: false, reason: 'Maximum power-ups reached for this session' };
    }
    
    // Rule 4: Rate limiting - max 3 power-ups per minute
    const oneMinuteAgo = now - 60000;
    const recentUsage = Object.values(equipment.lastPowerUpUse).filter(time => time > oneMinuteAgo).length;
    if (recentUsage >= 3) {
      return { allowed: false, reason: 'Rate limit exceeded: max 3 power-ups per minute' };
    }
    
    return { allowed: true };
  }, [equipment]);

  // Activate a powerup with anti-abuse protection
  const activatePowerUp = useCallback(async (powerUpId: string) => {
    try {
      // Validate usage first
      const validation = validatePowerUpUsage(powerUpId);
      if (!validation.allowed) {
        console.warn(`❌ Power-up usage blocked: ${validation.reason}`);
        return false;
      }
      
      // Check if power-up is available with sufficient quantity
      const availablePowerUp = equipment.availablePowerUps.find(p => p.id === powerUpId);
      if (!availablePowerUp || availablePowerUp.quantity <= 0) {
        console.warn(`❌ Power-up ${powerUpId} not available or quantity is 0`);
        return false;
      }
      
      // Try to use from inventory service first
      let success = inventoryService.useItem(powerUpId, 'powerup', 1);
      
      // If that fails, try to use from profile's owned_power_ups and sync to inventory
      if (!success && profile && profile.owned_power_ups && profile.owned_power_ups[powerUpId] > 0) {
  
        
        // Add the power-up to inventory first, then use it
        const powerUpName = getPowerUpName(powerUpId);
        const powerUpIcon = (() => {
          switch (powerUpId) {
            case 'shield': return '/powerups/shield.png';
            case 'magnet': return '/powerups/coin-magnet.png';
            case 'extra_life': return '/powerups/extra-life.png';
            case 'coin_multiplier': return '/powerups/2x-coin-multiplier.png';
            case 'turbo_start': return '/powerups/turbo-start.png';
            default: return `/powerups/${powerUpId.replace('_', ' ')}.png`;
          }
        })();
        
        // Add to inventory and then use it
        inventoryService.saveToInventory({
          id: powerUpId,
          name: powerUpName,
          type: 'powerup',
          quantity: 1,
          image: powerUpIcon,
          description: getPowerUpEffect(powerUpId)
        });
        
        // Now try to use it from inventory
        success = inventoryService.useItem(powerUpId, 'powerup', 1);
        
        if (success) {

          
          // Update profile's owned_power_ups to reflect the usage
          if (profile && profile.owned_power_ups && profile.owned_power_ups[powerUpId] > 0) {
            const currentQuantity = profile.owned_power_ups[powerUpId];
            const newQuantity = Math.max(0, currentQuantity - 1);
            const updatedPowerUps = {
              ...profile.owned_power_ups,
              [powerUpId]: newQuantity,
            };
            
            if (newQuantity === 0) {
              delete updatedPowerUps[powerUpId];
            }
            
            // Update profile with the new power-up quantities
            try {
              await updateProfile({ owned_power_ups: updatedPowerUps });

            } catch (error) {
              console.error('Failed to update profile power-ups:', error);
            }
          }
        } else {
          console.log(`❌ Failed to use ${powerUpId} even after adding to inventory`);
        }
      }
      
      if (success) {
        // Find the power-up in available power-ups
        let powerUp = equipment.availablePowerUps.find(p => p.id === powerUpId);
        
        // If not found in available power-ups, create a default one
        if (!powerUp) {
          powerUp = {
            id: powerUpId,
            name: getPowerUpName(powerUpId),
            icon: (() => {
              switch (powerUpId) {
                case 'shield': return '/powerups/Shield.png';
                case 'magnet': return '/powerups/Coin Magnet.png';
                case 'extra_life': return '/powerups/Extra life.png';
                case 'coin_multiplier': return '/powerups/2x Coin Multiplier.png';
                case 'turbo_start': return '/powerups/turbo-start.png';
                default: return `/powerups/${powerUpId.replace('_', ' ')}.png`;
              }
            })(),
            quantity: 1,
            description: typeof getPowerUpEffect(powerUpId) === 'string' ? getPowerUpEffect(powerUpId) : 'Power-up effect',
            effect: typeof getPowerUpEffect(powerUpId) === 'string' ? getPowerUpEffect(powerUpId) : 'Power-up effect'
          };
        }
        
        if (powerUp) {
          const now = Date.now();
          
          // Set active powerup effects with anti-abuse tracking
          setEquipment(prev => {
            const newActivePowerUps = { ...prev.activePowerUps };
            newActivePowerUps[powerUpId] = {
              ...powerUp,
              activatedAt: now,
              duration: getPowerUpDuration(powerUpId)
            };

            // Update available power-ups by reducing quantity
            const updatedAvailablePowerUps = prev.availablePowerUps.map(p => {
              if (p.id === powerUpId) {
                return {
                  ...p,
                  quantity: Math.max(0, p.quantity - 1)
                };
              }
              return p;
            }).filter(p => p.quantity > 0); // Remove power-ups with 0 quantity

            return {
              ...prev,
              availablePowerUps: updatedAvailablePowerUps,
              activePowerUps: newActivePowerUps,
              isShieldActive: powerUpId === 'shield' || prev.isShieldActive,
              isMagnetActive: powerUpId === 'magnet' || prev.isMagnetActive,
              isExtraLifeActive: powerUpId === 'extra_life' || prev.isExtraLifeActive,
              isCoinMultiplierActive: powerUpId === 'coin_multiplier' || prev.isCoinMultiplierActive,
              isTurboActive: powerUpId === 'turbo_start' || prev.isTurboActive,
              // Update anti-abuse tracking
              powerUpUsageCount: {
                ...prev.powerUpUsageCount,
                [powerUpId]: (prev.powerUpUsageCount[powerUpId] || 0) + 1
              },
              lastPowerUpUse: {
                ...prev.lastPowerUpUse,
                [powerUpId]: now
              },
              totalPowerUpsUsed: prev.totalPowerUpsUsed + 1
            };
          });

          // Reload equipment to sync with inventory service
          setTimeout(() => loadEquipment(), 100);
          
          return true;
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error activating power-up:', error);
      return false;
    }
  }, [equipment, profile, updateProfile, validatePowerUpUsage, loadEquipment]);

  // Get powerup duration in milliseconds
  const getPowerUpDuration = (powerUpId: string): number => {
    const durations = {
      'shield': 10000, // 10 seconds
      'magnet': 15000, // 15 seconds
      'extra_life': 0, // Permanent until used
      'coin_multiplier': 20000, // 20 seconds
      'turbo_start': 12000 // 12 seconds
    };
    return durations[powerUpId as keyof typeof durations] || 10000;
  };

  // Deactivate expired powerups
  const deactivateExpiredPowerUps = useCallback(() => {
    setEquipment(prev => {
      const now = Date.now();
      const newActivePowerUps = { ...prev.activePowerUps };
      let hasChanges = false;

      Object.keys(newActivePowerUps).forEach(powerUpId => {
        const powerUp = newActivePowerUps[powerUpId];
        if (powerUp.duration > 0 && (now - powerUp.activatedAt) > powerUp.duration) {
          delete newActivePowerUps[powerUpId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        return {
          ...prev,
          activePowerUps: newActivePowerUps,
          isShieldActive: !!newActivePowerUps['shield'],
          isMagnetActive: !!newActivePowerUps['magnet'],
          isExtraLifeActive: !!newActivePowerUps['extra_life'],
          isCoinMultiplierActive: !!newActivePowerUps['coin_multiplier'],
          isTurboActive: !!newActivePowerUps['turbo_start']
        };
      }

      return prev;
    });
  }, []);

  // Use extra life (deactivates it)
  const useExtraLife = useCallback(() => {
    setEquipment(prev => {
      const newActivePowerUps = { ...prev.activePowerUps };
      delete newActivePowerUps['extra_life'];

      return {
        ...prev,
        activePowerUps: newActivePowerUps,
        isExtraLifeActive: false
      };
    });
  }, []);

  // Get powerup status for UI
  const getPowerUpStatus = useCallback((powerUpId: string) => {
    const powerUp = equipment.activePowerUps[powerUpId];
    if (!powerUp) return null;

    const now = Date.now();
    const timeLeft = powerUp.duration > 0 ? Math.max(0, powerUp.duration - (now - powerUp.activatedAt)) : null;
    const progress = powerUp.duration > 0 ? Math.max(0, 1 - (now - powerUp.activatedAt) / powerUp.duration) : 1;

    return {
      isActive: true,
      timeLeft,
      progress,
      powerUp
    };
  }, [equipment.activePowerUps]);

  // Check if powerup is active
  const isPowerUpActive = useCallback((powerUpId: string) => {
    return !!equipment.activePowerUps[powerUpId];
  }, [equipment.activePowerUps]);

  // Get all active powerup effects
  const getActiveEffects = useCallback(() => {
    return {
      hasShield: equipment.isShieldActive,
      hasMagnet: equipment.isMagnetActive,
      hasExtraLife: equipment.isExtraLifeActive,
      hasCoinMultiplier: equipment.isCoinMultiplierActive,
      hasTurbo: equipment.isTurboActive,
      coinMultiplier: equipment.isCoinMultiplierActive ? 2 : 1,
      gameSpeed: equipment.isTurboActive ? 1.5 : 1
    };
  }, [equipment]);

  // Refresh equipment (for real-time updates)
  const refreshEquipment = useCallback(() => {
    loadEquipment();
  }, [loadEquipment]);

  // Reset session for new game (anti-abuse)
  const resetGameSession = useCallback(() => {
    setEquipment(prev => ({
      ...prev,
      gameSessionStart: Date.now(),
      totalPowerUpsUsed: 0,
      powerUpUsageCount: {},
      lastPowerUpUse: {},
      activePowerUps: {},
      isShieldActive: false,
      isMagnetActive: false,
      isExtraLifeActive: false,
      isCoinMultiplierActive: false,
      isTurboActive: false
    }));
  }, []);

  // Listen for inventory updates to refresh equipment
  useEffect(() => {
    const handleInventoryChange = () => {
      console.log('🔄 [EVENT] Inventory update event received - refreshing equipment');
      loadEquipment();
    };

    const handlePowerUpPurchased = (event: CustomEvent) => {
      console.log('🎁 [EVENT] Power-up purchased event received:', event.detail);
      loadEquipment();
    };

    window.addEventListener('inventory-updated', handleInventoryChange);
    window.addEventListener('power-up-purchased', handlePowerUpPurchased as EventListener);
    console.log('✅ [LISTENERS] Registered inventory-updated and power-up-purchased listeners');
    
    // Initial load
    loadEquipment();
    
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryChange);
      window.removeEventListener('power-up-purchased', handlePowerUpPurchased as EventListener);
      console.log('✅ [LISTENERS] Removed event listeners');
    };
  }, [loadEquipment]);

  // CRITICAL: Also listen for game-started event to ensure fresh load
  useEffect(() => {
    const handleGameStarted = () => {
      console.log('🎮 [EVENT] Game started event received - refreshing equipment with fresh powerups');
      loadEquipment();
    };

    const handlePowerUpEquipped = (event: CustomEvent) => {
      console.log('⚙️ [EVENT] Power-up equipped event received:', event.detail);
      loadEquipment();
    };

    const handlePowerUpUnequipped = (event: CustomEvent) => {
      console.log('⚙️ [EVENT] Power-up unequipped event received:', event.detail);
      loadEquipment();
    };

    window.addEventListener('game-started', handleGameStarted);
    window.addEventListener('powerup-equipped', handlePowerUpEquipped as EventListener);
    window.addEventListener('powerup-unequipped', handlePowerUpUnequipped as EventListener);
    console.log('✅ [LISTENERS] Registered game-started, powerup-equipped, and powerup-unequipped listeners');
    
    return () => {
      window.removeEventListener('game-started', handleGameStarted);
      window.removeEventListener('powerup-equipped', handlePowerUpEquipped as EventListener);
      window.removeEventListener('powerup-unequipped', handlePowerUpUnequipped as EventListener);
      console.log('✅ [LISTENERS] Removed game-started, powerup-equipped, and powerup-unequipped listeners');
    };
  }, [loadEquipment]);

  // Reload equipment when profile changes (for shop purchases)
  useEffect(() => {
    // Profile changed, loading equipment...
    if (profile) {
      // Sync inventory with profile's owned_power_ups first (throttled)
      if (profile.owned_power_ups) {
        // Use setTimeout to throttle the sync call
        const timeoutId = setTimeout(() => {
          inventoryService.syncWithProfilePowerUps(profile.owned_power_ups);
          // Force reload equipment after sync
          setTimeout(() => {
            loadEquipment();
          }, 50);
        }, 100); // 100ms delay to prevent excessive calls
        
        return () => clearTimeout(timeoutId);
      }
      loadEquipment();
    }
  }, [profile, loadEquipment]);

  // Add a more immediate sync when profile.owned_power_ups changes specifically
  useEffect(() => {
    if (profile?.owned_power_ups) {
      // Immediate sync for power-up changes
      inventoryService.syncWithProfilePowerUps(profile.owned_power_ups);
      // Force reload equipment immediately
      setTimeout(() => {
        loadEquipment();
      }, 10);
    }
  }, [profile?.owned_power_ups, loadEquipment]);

  // Check for expired powerups every second
  useEffect(() => {
    const interval = setInterval(deactivateExpiredPowerUps, 1000);
    return () => clearInterval(interval);
  }, [deactivateExpiredPowerUps]);



  return {
    ...equipment,
    activatePowerUp,
    useExtraLife,
    getPowerUpStatus,
    isPowerUpActive,
    getActiveEffects,
    refreshEquipment,
    loadEquipment,
    resetGameSession,
    validatePowerUpUsage
  };
}; 