// ...existing code...
import { toast } from '@/hooks/use-toast';
import { powerUpItems } from '../constants/powerUpItems';
import { getSkinNameById } from '@/utils/getSkinName';
import { SubscriptionReward } from '@/constants/subscriptionRewards';
import { supabase } from '../lib/supabase';
import { generateSkinSerialCode, type SkinRarity } from '@/utils/serialCodeGenerator';

// Add error handling wrapper
const safeSupabaseCall = async (operation: () => Promise<any>) => {
  try {
    return await operation();
  } catch (error) {
    console.warn('🔧 Supabase operation failed:', error);
    return null;
  }
};

export interface InventoryItem {
  id: string;
  name: string;
  type: 'skin' | 'powerup' | 'subscription' | 'mystery-box' | 'bundle' | 'random_bundle' | 'coins' | 'mysterybox' | 'accessory';
    unlocked?: boolean;
  quantity: number;
  purchasedAt: string;
  expiresAt?: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary';
  image?: string;
  description?: string;
  equipped?: boolean;
  daysRemaining?: number;
  serialCode?: string; // Unique serial code for NFT future support (format: RARITY-SKINID-DATE-RANDOM)
}

export interface PurchaseHistory {
  id: string;
  itemId: string;
  itemName: string;
  itemType: string;
  quantity: number;
  price: number;
  currency: 'pi' | 'coins';
  purchasedAt: string;
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod?: 'pi_payment' | 'coins_payment' | 'subscription' | 'mystery_box' | 'bundle' | 'daily_reward' | 'ad_reward';
  metadata?: {
    subscriptionType?: string;
    subscriptionDuration?: string;
    mysteryBoxType?: string;
    bundleContents?: string[];
    adProvider?: string;
    rewardType?: string;
  };
}

export interface UnclaimedSubscriptionReward {
  id: string;
  planId: string;
  planName: string;
  rewards: SubscriptionReward[];
  purchasedAt: string;
  expiresAt?: string;
}


class InventoryService {
  // Normalize powerup IDs to consistent format (use underscores)
  private normalizePowerUpId(id: string): string {
    // Map of known powerup ID variations to canonical ID
    const idMap: { [key: string]: string } = {
      'extra-life': 'extra_life',
      'extra_life': 'extra_life',
      'coin-magnet': 'magnet',
      'coin_magnet': 'magnet',
      'magnet': 'magnet',
      '2x-coin-multiplier': 'coin_multiplier',
      '2x_coin_multiplier': 'coin_multiplier',
      'coin-multiplier': 'coin_multiplier',
      'coin_multiplier': 'coin_multiplier',
      'shield': 'shield',
      'turbo-start': 'turbo_start',
      'turbo_start': 'turbo_start'
    };
    return idMap[id] || id;
  }

  // Deduplicate powerups with different ID formats and normalize them
  private deduplicatePowerUps(inventory: InventoryItem[]): InventoryItem[] {
    const powerUpMap = new Map<string, InventoryItem>();
    const nonPowerUps: InventoryItem[] = [];
    let hasDuplicates = false;
    
    inventory.forEach(item => {
      if (item.type === 'powerup') {
        const normalizedId = this.normalizePowerUpId(item.id);
        const existing = powerUpMap.get(normalizedId);
        
        if (existing) {
          // Found duplicate! Merge quantities
          hasDuplicates = true;
          existing.quantity += item.quantity;
          // Preserve equipped flag if either is equipped
          if (item.equipped === true) {
            existing.equipped = true;
          }
          console.log(`🔧 [dedup] Merged ${item.id} (${item.quantity}) -> ${normalizedId} (total: ${existing.quantity})`);
        } else {
          // Add with normalized ID
          if (item.id !== normalizedId) {
            hasDuplicates = true;
            console.log(`🔧 [dedup] Normalized ${item.id} -> ${normalizedId}`);
          }
          powerUpMap.set(normalizedId, {
            ...item,
            id: normalizedId
          });
        }
      } else {
        nonPowerUps.push(item);
      }
    });
    
    if (hasDuplicates) {
      const originalCount = inventory.filter(i => i.type === 'powerup').length;
      const deduplicatedCount = powerUpMap.size;
      console.log(`✅ [dedup] Deduplicated powerups: ${originalCount} -> ${deduplicatedCount} unique types`);
    }
    
    // Combine deduplicated powerups with other items
    return [...nonPowerUps, ...Array.from(powerUpMap.values())];
  }

  // Save all user game data under a username-specific key (for mobile/PC sync)
  saveAllUserGameDataToLocal(username: string): void {
    try {
      const user = localStorage.getItem('flappypi-pi-user');
      const inventory = localStorage.getItem('flappypi-inventory');
      const coins = localStorage.getItem('flappypi-coins');
      const purchaseHistory = localStorage.getItem('flappypi-purchase-history');
      const gameModes = localStorage.getItem('flappypi-gamemodes');
      const data = {
        user: user ? JSON.parse(user) : null,
        inventory: inventory ? JSON.parse(inventory) : [],
        coins: coins ? parseInt(coins, 10) : 0,
        purchaseHistory: purchaseHistory ? JSON.parse(purchaseHistory) : [],
        gameModes: gameModes ? JSON.parse(gameModes) : {},
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`flappypi-data-${username}`, JSON.stringify(data));
      console.log(`✅ Saved all game data for user ${username} to localStorage`);
    } catch (error) {
      console.error('❌ Failed to save all user game data:', error);
    }
  }

  // Load all user game data from a username-specific key
  loadAllUserGameDataFromLocal(username: string): void {
    try {
      const dataStr = localStorage.getItem(`flappypi-data-${username}`);
      if (!dataStr) {
        console.warn(`⚠️ No saved game data found for user ${username}`);
        return;
      }
      const data = JSON.parse(dataStr);
      if (data.user) localStorage.setItem('flappypi-pi-user', JSON.stringify(data.user));
      if (data.inventory) localStorage.setItem('flappypi-inventory', JSON.stringify(data.inventory));
      if (typeof data.coins === 'number') localStorage.setItem('flappypi-coins', data.coins.toString());
      if (data.purchaseHistory) localStorage.setItem('flappypi-purchase-history', JSON.stringify(data.purchaseHistory));
      if (data.gameModes) localStorage.setItem('flappypi-gamemodes', JSON.stringify(data.gameModes));
      console.log(`✅ Loaded all game data for user ${username} from localStorage`);
    } catch (error) {
      console.error('❌ Failed to load all user game data:', error);
    }
  }

    // ...existing code...
  private static instance: InventoryService;
  private expirationCheckInterval: NodeJS.Timeout | null = null;
  private cleanupTimeout: NodeJS.Timeout | null = null;
  
  // Sanitize inventory data in localStorage to ensure all descriptions are strings
  private sanitizeInventoryData(): void {
    try {
      const inventoryData = localStorage.getItem('flappypi-inventory');
      if (!inventoryData) return;
      
      let inventory;
      try {
        inventory = JSON.parse(inventoryData);
      } catch (parseError) {
        console.warn('⚠️ Corrupted inventory data found, resetting...', parseError);
        localStorage.removeItem('flappypi-inventory');
        return;
      }
      
      if (!Array.isArray(inventory)) {
        console.warn('⚠️ Invalid inventory format, resetting...', inventory);
        localStorage.removeItem('flappypi-inventory');
        return;
      }
      
      let changed = false;
      for (const item of inventory) {
        if (!item || typeof item !== 'object') {
          console.warn('⚠️ Invalid item found in inventory:', item);
          continue;
        }
        
        // Fix description
        if (item && typeof item.description !== 'string') {
          if (item.description && typeof item.description.description === 'string') {
            item.description = item.description.description;
            changed = true;
          } else {
            item.description = 'Power-up effect';
            changed = true;
          }
        }
        
        // Ensure required fields exist
        if (!item.id || !item.name || !item.type) {
          console.warn('⚠️ Item missing required fields:', item);
          continue;
        }
        
        // Ensure quantity is a number
        if (typeof item.quantity !== 'number' || item.quantity < 0) {
          item.quantity = 1;
          changed = true;
        }
        
        // Ensure purchasedAt exists
        if (!item.purchasedAt) {
          item.purchasedAt = new Date().toISOString();
          changed = true;
        }
      }
      
      if (changed) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
        console.log('🧹 Inventory data sanitized');
      }
    } catch (e) {
      console.error('❌ Failed to sanitize inventory data:', e);
      // In case of critical error, backup and reset inventory
      try {
        const backupData = localStorage.getItem('flappypi-inventory');
        if (backupData) {
          localStorage.setItem('flappypi-inventory-backup', backupData);
          console.log('📦 Inventory backed up before reset');
        }
        localStorage.removeItem('flappypi-inventory');
        console.log('🔄 Inventory reset due to critical error');
      } catch (backupError) {
        console.error('❌ Failed to backup inventory:', backupError);
      }
    }
  }

  // Call sanitizeInventoryData in the constructor
  private constructor() {
    try {
      console.log('🔧 Initializing InventoryService...');
      this.sanitizeInventoryData();
      
      // Run inventory health check
      this.performHealthCheck();
      
      // Start the global expiration monitor with delay to ensure localStorage is ready
      setTimeout(() => {
        this.startExpirationMonitor();
      }, 100);
      console.log('✅ InventoryService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize InventoryService:', error);
      // Continue with basic functionality even if initialization fails
    }
  }

  // Perform inventory health check
  private performHealthCheck(): void {
    try {
      console.log('🏥 Performing inventory health check...');
      
      const rawData = localStorage.getItem('flappypi-inventory');
      if (!rawData) {
        console.log('✅ No inventory data - healthy state');
        return;
      }
      
      // Test if data is parseable
      let items;
      try {
        items = JSON.parse(rawData);
      } catch (parseError) {
        console.error('❌ Health check failed: Corrupted JSON');
        this.repairInventory();
        return;
      }
      
      if (!Array.isArray(items)) {
        console.error('❌ Health check failed: Not an array');
        this.repairInventory();
        return;
      }
      
      // Check for invalid items
      let hasInvalidItems = false;
      for (const item of items) {
        if (!item || !item.id || !item.name || !item.type) {
          hasInvalidItems = true;
          break;
        }
      }
      
      if (hasInvalidItems) {
        console.warn('⚠️ Health check found invalid items, repairing...');
        this.repairInventory();
        return;
      }
      
      console.log('✅ Inventory health check passed');
    } catch (error) {
      console.error('❌ Health check error:', error);
      // Continue even if health check fails
    }
  }
  
  static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      try {
        InventoryService.instance = new InventoryService();
      } catch (error) {
        console.error('❌ Failed to create InventoryService instance:', error);
        // Create a minimal instance for error recovery
        InventoryService.instance = Object.create(InventoryService.prototype);
        console.log('⚠️ Created minimal InventoryService instance for error recovery');
      }
    }
    return InventoryService.instance;
  }

  // Start global subscription expiration monitor
  private startExpirationMonitor(): void {
    // Clear any existing interval
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval);
    }
    
    // Check for expired subscriptions every minute
    this.expirationCheckInterval = setInterval(() => {
      this.checkSubscriptionExpiration();
    }, 60000); // Check every minute
    
    // Also check immediately on startup
    this.checkSubscriptionExpiration();
    
    console.log('🔍 Subscription expiration monitor started');
  }

  // Stop the expiration monitor (for cleanup)
  stopExpirationMonitor(): void {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval);
      this.expirationCheckInterval = null;
      console.log('🔍 Subscription expiration monitor stopped');
    }
    
    // Clear cleanup timeout
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = null;
      console.log('🧹 Cleanup timeout cleared');
    }
  }

  // Save item to inventory
  saveToInventory(item: Omit<InventoryItem, 'purchasedAt'>): void {
    console.log('💾 [inventoryService] saveToInventory called with:', item);
    try {
      // Normalize powerup IDs to prevent duplicates from different naming conventions
      if (item.type === 'powerup') {
        item.id = this.normalizePowerUpId(item.id);
        console.log('💾 [inventoryService] Normalized powerup ID to:', item.id);
      }
      
      const inventory = this.getInventory();
      console.log('💾 [inventoryService] Current inventory size:', inventory.length);
      // Only add default skin if user has no skins at all
      if (item.type === 'skin' && (item.id === 'classic' || item.id === 'fluppy' || item.id === 'default')) {
        const hasAnySkin = inventory.some(i => i.type === 'skin');
        if (hasAnySkin) return;
      }
      // Always use correct id/image for Fire Phoenix (ID or name or image match)
      if (
        item.type === 'skin' && (
          item.id === 'inferno_phoenix' ||
          item.id === 'inferno-phoenix' ||
          (item.name && item.name.toLowerCase().includes('phoenix')) ||
          (item.image && item.image.includes('bird_12.gif'))
        )
      ) {
        item.id = 'inferno_phoenix';
        item.image = '/birds2/bird_12.gif';
        item.rarity = 'Special';
        item.equipped = item.equipped ?? true;
        console.log('🔥 [Fire Phoenix] Normalized Fire Phoenix ID and image:', {
          id: item.id,
          image: item.image,
          equipped: item.equipped,
          name: item.name
        });
      }
      // Check if item already exists
      const existingItem = inventory.find(i => i.id === item.id && i.type === item.type);
      if (existingItem) {
        console.log('💾 [inventoryService] Item exists, updating quantity from', existingItem.quantity);
        if (item.type === 'skin') {
          existingItem.quantity = 1;
          if (item.equipped) {
            existingItem.equipped = true;
          }
        } else if (item.type === 'accessory') {
          // Accessories: only 1 per type, unlock if not already
          existingItem.quantity = 1;
          existingItem.unlocked = true;
        } else if (item.type === 'powerup') {
          // For powerups: add quantity and preserve/set equipped flag
          existingItem.quantity += item.quantity;
          // If new item has equipped flag, ensure existing item gets it
          if (item.equipped === true) {
            existingItem.equipped = true;
          }
          console.log(`💾 [inventoryService] Updated powerup ${item.id} quantity to ${existingItem.quantity}, equipped: ${existingItem.equipped}`);
        } else {
          // For other types, add quantity
          existingItem.quantity += item.quantity;
        }
        console.log('💾 [inventoryService] Updated to quantity', existingItem.quantity);
      } else {
        // Add new item for all types
        console.log('💾 [inventoryService] Adding new item:', item.id);
        const newItem: InventoryItem = {
          ...item,
          quantity: item.type === 'skin' || item.type === 'accessory' ? 1 : item.quantity,
          purchasedAt: new Date().toISOString(),
          ...(item.type === 'accessory' ? { unlocked: true } : {})
        };
        
        // Generate serial code for skins (NFT future support)
        if (item.type === 'skin' && !item.serialCode) {
          const rarity = (item.rarity as SkinRarity) || 'Common';
          const serialMetadata = generateSkinSerialCode(item.id, rarity);
          newItem.serialCode = serialMetadata.serialCode;
          newItem.rarity = rarity; // Ensure rarity is set
          console.log(`🎫 Generated serial code for ${item.name}: ${serialMetadata.serialCode}`);
        }
        
        if (item.type === 'skin') {
          const hasEquippedSkin = inventory.some(i => i.type === 'skin' && i.equipped);
          if (!hasEquippedSkin) {
            newItem.equipped = true;
            console.log('🎯 Auto-equipping first skin:', item.id);
          }
        }
        
        // For powerups: set equipped flag if not explicitly provided
        if (item.type === 'powerup') {
          if (item.equipped === undefined) {
            newItem.equipped = true; // Default to equipped for new powerups
          }
          console.log(`🎯 [powerup] Added new powerup ${item.id} with equipped: ${newItem.equipped}`);
        }
        
        inventory.push(newItem);
      }
      // Save to localStorage
      try {
        localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
        console.log('✅ [inventoryService] Inventory saved to localStorage, total items:', inventory.length);
        console.log('✅ [inventoryService] Powerups in inventory after save:', inventory.filter(i => i.type === 'powerup').map(p => `${p.id}:${p.quantity}`).join(', ') || 'NONE');
      } catch (storageError) {
        console.error('❌ Failed to save inventory to localStorage:', storageError);
        // Attempt to clear some space and retry
        try {
          localStorage.removeItem('flappypi-inventory-backup');
          localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
          console.log('✅ Inventory saved after clearing backup');
        } catch (retryError) {
          console.error('❌ Critical: Unable to save inventory:', retryError);
          throw new Error('Failed to save inventory');
        }
      }
      
      // Dispatch custom event to notify components
      try {
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { itemId: item.id, type: item.type, action: 'added' } 
        }));
        console.log('✅ [inventoryService] inventory-updated event dispatched from saveToInventory');
      } catch (eventError) {
        console.error('❌ Failed to dispatch inventory event:', eventError);
      }
      
      console.log(`📦 [inventoryService] Added to inventory: ${item.name} (${item.quantity})`);
      
      // Try to sync with Supabase immediately after purchase (but don't fail if it doesn't work)
      this.syncToCloudAfterPurchase(item);
    } catch (error) {
      console.error('Error saving to inventory:', error);
    }
  }

  // New method: Auto-sync to cloud after purchase
  private async syncToCloudAfterPurchase(item: Omit<InventoryItem, 'purchasedAt'>): Promise<void> {
    try {
      // Get current Pi user
      const piUserData = localStorage.getItem('flappypi-pi-user');
      if (!piUserData) return;
      
      const piUser = JSON.parse(piUserData);
      if (!piUser?.uid) return;
      
      console.log('💾 Auto-syncing purchase to cloud for user:', piUser.uid);
      
      // Perform full cloud sync to ensure all data is saved
      const syncSuccess = await this.performFullCloudSync(piUser.uid);
      
      if (syncSuccess) {
        console.log('✅ Purchase auto-synced to cloud successfully');
        
        // Dispatch purchase synced event
        window.dispatchEvent(new CustomEvent('purchase-synced', { 
          detail: { 
            item: item,
            piUserId: piUser.uid,
            syncedAt: new Date().toISOString()
          } 
        }));
      } else {
        console.warn('⚠️ Purchase sync to cloud failed, data saved locally');
      }
    } catch (error) {
      console.warn('⚠️ Auto-sync after purchase failed:', error);
      // Continue normally - item is still saved locally
    }
  }

  // Get all inventory items
  getInventory(): InventoryItem[] {
    try {
      let inventory = localStorage.getItem('flappypi-inventory');
      if (!inventory) {
        console.log('📦 No inventory found in localStorage, starting fresh');
        return [];
      }
      
      let items: InventoryItem[];
      try {
        items = JSON.parse(inventory);
      } catch (parseError) {
        console.error('❌ Failed to parse inventory JSON:', parseError);
        console.log('🔄 Resetting corrupted inventory');
        localStorage.removeItem('flappypi-inventory');
        return [];
      }
      
      if (!Array.isArray(items)) {
        console.error('❌ Inventory is not an array:', items);
        localStorage.removeItem('flappypi-inventory');
        return [];
      }
      
      // CRITICAL: Deduplicate powerups with different ID formats FIRST
      items = this.deduplicatePowerUps(items);
      
      let changed = false;
      
      // 1. Normalize Fire Phoenix skin for all variants
      items = items.map(item => {
        if (
          item.type === 'skin' && (
            item.id === 'inferno_phoenix' ||
            item.id === 'inferno-phoenix' ||
            (item.name && item.name.toLowerCase().includes('phoenix')) ||
            (item.image && item.image.includes('bird_12.gif'))
          )
        ) {
          changed = true;
          return {
            ...item,
            id: 'inferno_phoenix',
            image: '/birds2/bird_12.gif',
            rarity: 'Special',
            name: 'Fire Phoenix Skin'
          };
        }
        return item;
      });
      
      // 2. Fix all skin image paths to match shop items
      items = items.map(item => {
        if (item.type === 'skin') {
          // Use getBirdImageSrc utility instead of require
          const getBirdImageSrc = (skinId: string) => {
            const birdImages = {
              'bird-0': '/flappy pi gif/flappy-2.gif.gif',
              'bird-1': '/birds2/bird_1.gif',
              'bird-2': '/birds2/bird_2.gif',
              'bird-3': '/birds2/bird_3.gif',
              'bird-4': '/birds2/bird_4.gif',
              'bird-5': '/birds2/bird_5.gif',
              'bird-6': '/birds2/bird_6.gif',
              'bird-7': '/birds2/bird_7.gif',
              'bird-8': '/birds2/bird_8.gif',
              'bird-9': '/birds2/bird_9.gif',
              'bird-10': '/birds2/bird_10.gif',
              'bird-11': '/birds2/bird_11.gif',
              'bird-12': '/birds2/bird_12.gif'
            };
            return birdImages[skinId as keyof typeof birdImages] || '/flappy pi gif/flappy-2.gif.gif';
          };
          
          const correctImage = getBirdImageSrc(item.id);
          if (correctImage !== item.image) {
            changed = true;
            return { ...item, image: correctImage };
          }
        }
        return item;
      });
      
      // 3. Ensure at least one default skin exists
      const hasAnySkin = items.some(i => i.type === 'skin');
      if (!hasAnySkin) {
        changed = true;
        items.push({
          id: 'bird-0',
          name: 'Sky Blue Flappy',
          type: 'skin',
          quantity: 1,
          rarity: 'Common',
          image: '/flappy pi gif/flappy-2.gif.gif',
          description: 'The original Flappy Pi bird',
          equipped: true,
          purchasedAt: new Date().toISOString()
        });
      }
      
      if (changed) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(items));
      }
      return items;
    } catch (error) {
      console.error('Error getting inventory:', error);
      return [];
    }
  }

  // Get inventory items by type
  getInventoryByType(type: InventoryItem['type']): InventoryItem[] {
    const items = this.getInventory().filter(item => item.type === type);
    
    // For all types, only return items with quantity > 0
    return items.filter(item => item.quantity > 0);
  }

  // Enhanced method to get organized power-ups (limited to 5 types)
  getOrganizedPowerUps(): InventoryItem[] {
    const inventory = this.getInventory();
    const powerUps = inventory.filter(item => item.type === 'powerup' && item.quantity > 0);
    
    // Sort by quantity (highest first) and then by most recent purchase
    const sortedPowerUps = powerUps.sort((a, b) => {
      // First sort by quantity (descending)
      if (b.quantity !== a.quantity) {
        return b.quantity - a.quantity;
      }
      // Then sort by purchase date (most recent first)
      return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
    });
    
    // Return only the top 5 power-ups
    return sortedPowerUps.slice(0, 5);
  }

  // Get total quantity for a specific power-up type
  getPowerUpTotalQuantity(powerUpId: string): number {
    const inventory = this.getInventory();
    const powerUp = inventory.find(item => item.id === powerUpId && item.type === 'powerup');
    return powerUp ? powerUp.quantity : 0;
  }

  // Get all power-up types (for reference)
  getAllPowerUpTypes(): string[] {
    const inventory = this.getInventory();
    const powerUps = inventory.filter(item => item.type === 'powerup' && item.quantity > 0);
    return powerUps.map(item => item.id);
  }

  // Get power-up summary (all power-ups with quantities)
  getPowerUpSummary(): { id: string; name: string; quantity: number; isInTop5: boolean }[] {
    const inventory = this.getInventory();
    const allPowerUps = inventory.filter(item => item.type === 'powerup' && item.quantity > 0);
    const top5PowerUps = this.getOrganizedPowerUps();
    const top5Ids = top5PowerUps.map(item => item.id);
    
    return allPowerUps.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      isInTop5: top5Ids.includes(item.id)
    }));
  }

  // Get total power-up count
  getTotalPowerUpCount(): number {
    const inventory = this.getInventory();
    const powerUps = inventory.filter(item => item.type === 'powerup' && item.quantity > 0);
    return powerUps.reduce((total, item) => total + item.quantity, 0);
  }

  // Check if user owns an item
  ownsItem(itemId: string, type: InventoryItem['type']): boolean {
    const inventory = this.getInventory();
    const item = inventory.find(item => item.id === itemId && item.type === type);
    
    // For power-ups, check if quantity > 0
    if (type === 'powerup') {
      return !!item && item.quantity > 0;
    }
    
    return !!item;
  }

  // Get item quantity
  getItemQuantity(itemId: string, type: InventoryItem['type']): number {
    const inventory = this.getInventory();
    const item = inventory.find(i => i.id === itemId && i.type === type);
    return item ? item.quantity : 0;
  }

  // Use/consume an item
  useItem(itemId: string, type: InventoryItem['type'], quantity: number = 1): boolean {
    try {
      const inventory = this.getInventory();
      const itemIndex = inventory.findIndex(i => i.id === itemId && i.type === type);
      
      if (itemIndex === -1 || inventory[itemIndex].quantity < quantity) {
        return false;
      }
      
      inventory[itemIndex].quantity -= quantity;
      
      if (inventory[itemIndex].quantity <= 0) {
        inventory.splice(itemIndex, 1);
      }
      
      localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
      
      // Dispatch event to notify components of inventory change
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { itemId, type, action: 'used', quantity } 
      }));
      
      console.log(`✅ Used ${quantity}x ${itemId} (${type})`);
      return true;
    } catch (error) {
      console.error('Error using item:', error);
      return false;
    }
  }

  // Equip an item (for skins, only one can be equipped at a time)
  equipItem(itemId: string, type: InventoryItem['type']): boolean {
    try {
      // Normalize Fire Phoenix ID to ensure consistency (use underscore version)
      let normalizedItemId = itemId;
      if (type === 'skin' && (itemId === 'inferno_phoenix' || itemId === 'inferno-phoenix')) {
        normalizedItemId = 'inferno_phoenix';
        console.log('🔥 [Fire Phoenix] Normalized Fire Phoenix ID for equipping:', normalizedItemId);
      }

      console.log(`🔧 Attempting to equip ${type}: ${normalizedItemId}`);
      const inventory = this.getInventory();
      const item = inventory.find(i => i.id === normalizedItemId && i.type === type);

      if (!item || item.quantity <= 0) {
        console.log(`❌ Cannot equip ${normalizedItemId}: item not found or quantity 0`);
        return false;
      }

      if (type === 'skin') {
        // Unequip all other skins first
        inventory.forEach(i => {
          if (i.type === 'skin') {
            i.equipped = false;
          }
        });
        console.log(`🔄 Unequipped all other skins`);
        // If Fire Phoenix, set selected_bird_skin in profile
        if (normalizedItemId === 'inferno_phoenix') {
          type ProfileType = { selected_bird_skin?: string; [key: string]: any };
          let profile: ProfileType = {};
          const savedProfile = localStorage.getItem('flappypi-profile');
          if (savedProfile) {
            try {
              profile = JSON.parse(savedProfile);
            } catch {}
          }
          profile.selected_bird_skin = 'inferno_phoenix';
          localStorage.setItem('flappypi-profile', JSON.stringify(profile));
          window.dispatchEvent(new CustomEvent('profile-updated', { detail: { selected_bird_skin: 'inferno_phoenix' } }));
        }
      }

      // Equip the selected item
      item.equipped = true;

      // Save updated inventory
      localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));

      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { itemId: normalizedItemId, type, action: 'equipped' } 
      }));

      console.log(`✅ Successfully equipped ${type}: ${normalizedItemId}`);
      console.log(`📦 Current inventory:`, inventory.filter(i => i.type === 'skin'));
      return true;
    } catch (error) {
      console.error('Error equipping item:', error);
      return false;
    }
  }

  // Unequip an item
  unequipItem(itemId: string, type: InventoryItem['type']): boolean {
    try {
      console.log(`🔧 Attempting to unequip ${type}: ${itemId}`);
      const inventory = this.getInventory();
      const item = inventory.find(i => i.id === itemId && i.type === type);
      
      if (!item) {
        console.log(`❌ Cannot unequip ${itemId}: item not found`);
        return false;
      }

      // Unequip the item
      item.equipped = false;
      
      // Save updated inventory
      localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { itemId, type, action: 'unequipped' } 
      }));
      
      console.log(`✅ Successfully unequipped ${type}: ${itemId}`);
      return true;
    } catch (error) {
      console.error('Error unequipping item:', error);
      return false;
    }
  }

  // Refresh and fix inventory image paths
  refreshInventoryImagePaths(): void {
    try {
      const inventory = this.getInventory();
      let changed = false;
      
      const getBirdImageSrc = (skinId: string) => {
        const birdImages = {
          'bird-0': '/flappy pi gif/flappy-2.gif.gif',
          'bird-1': '/birds2/bird_1.gif',
          'bird-2': '/birds2/bird_2.gif',
          'bird-3': '/birds2/bird_3.gif',
          'bird-4': '/birds2/bird_4.gif',
          'bird-5': '/birds2/bird_5.gif',
          'bird-6': '/birds2/bird_6.gif',
          'bird-7': '/birds2/bird_7.gif',
          'bird-8': '/birds2/bird_8.gif',
          'bird-9': '/birds2/bird_9.gif',
          'bird-10': '/birds2/bird_10.gif',
          'bird-11': '/birds2/bird_11.gif',
          'bird-12': '/birds2/bird_12.gif'
        };
        return birdImages[skinId as keyof typeof birdImages] || '/flappy pi gif/flappy-2.gif.gif';
      };
      
      const updatedInventory = inventory.map(item => {
        if (item.type === 'skin') {
          const correctImage = getBirdImageSrc(item.id);
          if (correctImage !== item.image) {
            changed = true;
            console.log(`🔄 Fixing image path for ${item.id}: ${item.image} -> ${correctImage}`);
            return { ...item, image: correctImage };
          }
        }
        return item;
      });
      
      if (changed) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(updatedInventory));
        console.log('✅ Inventory image paths refreshed');
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { action: 'image-paths-refreshed' } 
        }));
      }
    } catch (error) {
      console.error('Error refreshing inventory image paths:', error);
    }
  }

  // Get equipped skin
  getEquippedSkin(): string | null {
    return localStorage.getItem('flappypi-selected-skin');
  }

  // Get equipped items for all game modes
  getEquippedItems(): {
    birdSkin: string | null;
    powerUps: { [key: string]: number };
    activeEffects: { [key: string]: { expiresAt: number; effect: any } };
  } {
    try {
      const inventory = this.getInventory();
      const equippedSkin = inventory.find(item => item.type === 'skin' && item.equipped);
      const powerUpItems = inventory.filter(item => item.type === 'powerup' && item.quantity > 0);
      
      const powerUps: { [key: string]: number } = {};
      powerUpItems.forEach(item => {
        powerUps[item.id] = item.quantity;
      });

      // Get active effects from localStorage
      const activeEffectsData = localStorage.getItem('flappypi-active-effects');
      const activeEffects = activeEffectsData ? JSON.parse(activeEffectsData) : {};

      return {
        birdSkin: equippedSkin?.id || null,
        powerUps,
        activeEffects
      };
    } catch (error) {
      console.error('Error getting equipped items:', error);
      return {
        birdSkin: null,
        powerUps: {},
        activeEffects: {}
      };
    }
  }

  // Activate a powerup effect
  activatePowerUp(powerUpId: string, duration: number = 10000): boolean {
    try {
      const inventory = this.getInventory();
      const powerUp = inventory.find(item => item.id === powerUpId && item.type === 'powerup');
      
      if (!powerUp || powerUp.quantity <= 0) {
        return false;
      }

      // Use the powerup
      const success = this.useItem(powerUpId, 'powerup', 1);
      if (!success) return false;

      // Add active effect
      const activeEffectsData = localStorage.getItem('flappypi-active-effects');
      const activeEffects = activeEffectsData ? JSON.parse(activeEffectsData) : {};
      
      activeEffects[powerUpId] = {
        expiresAt: Date.now() + duration,
        effect: this.getPowerUpEffect(powerUpId)
      };

      localStorage.setItem('flappypi-active-effects', JSON.stringify(activeEffects));
      
      console.log(`⚡ Powerup activated: ${powerUpId} for ${duration}ms`);
      return true;
    } catch (error) {
      console.error('Error activating powerup:', error);
      return false;
    }
  }

  // Get powerup effect configuration
  getPowerUpEffect(powerUpId: string): any {
    const effects: { [key: string]: any } = {
      shield: { 
        type: 'protection', 
        description: 'Protects from one collision',
        duration: 10000,
        visualEffect: 'shield'
      },
      magnet: { 
        type: 'coin_magnet', 
        description: 'Attracts coins from a distance',
        duration: 8000,
        range: 100,
        visualEffect: 'magnet'
      },
      extra_life: { 
        type: 'revive', 
        description: 'Automatically revives on death',
        duration: 0, // Permanent until used
        visualEffect: 'heart'
      },
      turbo_start: { 
        type: 'speed_boost', 
        description: 'Increases game speed temporarily',
        duration: 5000,
        speedMultiplier: 1.5,
        visualEffect: 'speed'
      },
      coin_multiplier: { 
        type: 'coin_multiplier', 
        description: 'Doubles coin earnings',
        duration: 10000,
        multiplier: 2,
        visualEffect: 'coins'
      }
    };
    
    return effects[powerUpId] || {};
  }

  // Get powerup effect description as string (for UI display)
  getPowerUpEffectDescription(powerUpId: string): string {
    const effects: { [key: string]: string } = {
      shield: 'Protects from one collision',
      magnet: 'Attracts coins from a distance',
      extra_life: 'Automatically revives on death',
      turbo_start: 'Increases game speed temporarily',
      coin_multiplier: 'Doubles coin earnings'
    };
    
    return effects[powerUpId] || 'Provides a special effect';
  }

  // Check if a powerup effect is active
  isPowerUpActive(powerUpId: string): boolean {
    try {
      const activeEffectsData = localStorage.getItem('flappypi-active-effects');
      const activeEffects = activeEffectsData ? JSON.parse(activeEffectsData) : {};
      
      const effect = activeEffects[powerUpId];
      if (!effect) return false;
      
      // Check if effect has expired
      if (effect.expiresAt && Date.now() > effect.expiresAt) {
        // Remove expired effect
        delete activeEffects[powerUpId];
        localStorage.setItem('flappypi-active-effects', JSON.stringify(activeEffects));
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking powerup status:', error);
      return false;
    }
  }

  // Get all active powerup effects
  getActivePowerUpEffects(): { [key: string]: any } {
    try {
      const activeEffectsData = localStorage.getItem('flappypi-active-effects');
      const activeEffects = activeEffectsData ? JSON.parse(activeEffectsData) : {};
      
      const currentTime = Date.now();
      const validEffects: { [key: string]: any } = {};
      
      Object.entries(activeEffects).forEach(([powerUpId, effect]: [string, any]) => {
        if (!effect.expiresAt || currentTime <= effect.expiresAt) {
          validEffects[powerUpId] = effect;
        }
      });
      
      // Update localStorage with only valid effects
      if (Object.keys(validEffects).length !== Object.keys(activeEffects).length) {
        localStorage.setItem('flappypi-active-effects', JSON.stringify(validEffects));
      }
      
      return validEffects;
    } catch (error) {
      console.error('Error getting active powerup effects:', error);
      return {};
    }
  }

  // Clear all active effects (useful for game restart)
  clearActiveEffects(): void {
    try {
      localStorage.removeItem('flappypi-active-effects');
      console.log('Active effects cleared');
    } catch (error) {
      console.error('Error clearing active effects:', error);
    }
  }

  // Get bird skin image path by ID
  getBirdSkinImage(skinId: string): string {
    // Try to get the image from the inventory item first
    const inventory = this.getInventory();
    const skinItem = inventory.find(i => i.id === skinId && i.type === 'skin');
    if (skinItem && skinItem.image) return skinItem.image;
    
    // Fallback to hardcoded map with correct bird IDs
    const skinMap: { [key: string]: string } = {
      'bird-0': "/birds2/bird_0.gif",
      'bird-1': "/birds2/bird_1.gif",
      'bird-2': "/birds2/bird_2.gif",
      'bird-3': "/birds2/bird_3.gif",
      'bird-4': "/birds2/bird_4.gif",
      'bird-5': "/birds2/bird_5.gif",
      'bird-6': "/birds2/bird_6.gif",
      'bird-7': "/birds2/bird_7.gif",
      'bird-8': "/birds2/bird_8.gif",
      'bird-9': "/birds2/bird_9.gif",
      'bird-10': "/birds2/bird_10.gif",
      'bird-11': "/birds2/bird_11.gif",
      'inferno-phoenix': "/birds2/bird_12.gif",
      'inferno_phoenix': "/birds2/bird_12.gif",
      // Legacy support
      classic: "/birds2/bird_0.gif",
      red: "/birds2/bird_1.gif",
      blue: "/birds2/bird_2.gif",
      yellow: "/birds2/bird_3.gif",
      green: "/birds2/bird_4.gif",
      purple: "/birds2/bird_5.gif",
      pink: "/birds2/bird_6.gif",
      orange: "/birds2/bird_7.gif",
      cyan: "/birds2/bird_8.gif",
      magenta: "/birds2/bird_9.gif",
      dragon: "/birds2/bird_10.gif",
      gold: "/birds2/bird_11.gif",
    };
    return skinMap[skinId] || "/birds2/bird_0.gif";
  }

  // Add to purchase history
  addToPurchaseHistory(purchase: PurchaseHistory): void {
    try {
      const history = this.getPurchaseHistory();
      history.unshift(purchase); // Add to beginning
      
      // Keep only last 200 purchases (increased for better history)
      if (history.length > 200) {
        history.splice(200);
      }
      
      localStorage.setItem('flappypi-purchase-history', JSON.stringify(history));
      
      // Dispatch event to notify components about new purchase
      window.dispatchEvent(new CustomEvent('purchase-history-updated', { 
        detail: { purchase, action: 'added' } 
      }));
      
      console.log(`📝 Purchase recorded: ${purchase.itemName} (${purchase.currency} ${purchase.price})`);
    } catch (error) {
      console.error('Error adding to purchase history:', error);
    }
  }

  // Comprehensive transaction logging method
  logTransaction(
    itemId: string,
    itemName: string,
    itemType: string,
    quantity: number,
    price: number,
    currency: 'pi' | 'coins',
    paymentMethod: PurchaseHistory['paymentMethod'],
    status: 'completed' | 'pending' | 'failed' = 'completed',
    metadata?: PurchaseHistory['metadata']
  ): void {
    const transaction: PurchaseHistory = {
      id: `${itemId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      itemName,
      itemType,
      quantity,
      price,
      currency,
      purchasedAt: new Date().toISOString(),
      transactionId: `${paymentMethod}-${Date.now()}`,
      status,
      paymentMethod,
      metadata
    };

    this.addToPurchaseHistory(transaction);
  }

  // Get purchase history
  getPurchaseHistory(): PurchaseHistory[] {
    try {
      const history = localStorage.getItem('flappypi-purchase-history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return [];
    }
  }

  // Get purchase history by type
  getPurchaseHistoryByType(type: string): PurchaseHistory[] {
    return this.getPurchaseHistory().filter(purchase => purchase.itemType === type);
  }

  // Log subscription purchase
  logSubscriptionPurchase(
    subscriptionId: string,
    subscriptionName: string,
    price: number,
    currency: 'pi' | 'coins',
    duration: string,
    status: 'completed' | 'pending' | 'failed' = 'completed'
  ): void {
    this.logTransaction(
      subscriptionId,
      subscriptionName,
      'subscription',
      1,
      price,
      currency,
      'subscription',
      status,
      {
        subscriptionType: subscriptionName,
        subscriptionDuration: duration
      }
    );
  }

  // Log mystery box purchase
  logMysteryBoxPurchase(
    boxType: string,
    boxName: string,
    price: number,
    currency: 'pi' | 'coins',
    status: 'completed' | 'pending' | 'failed' = 'completed'
  ): void {
    this.logTransaction(
      boxType,
      boxName,
      'mystery-box',
      1,
      price,
      currency,
      'mystery_box',
      status,
      {
        mysteryBoxType: boxType
      }
    );
  }

  // Log bundle purchase
  logBundlePurchase(
    bundleId: string,
    bundleName: string,
    price: number,
    currency: 'pi' | 'coins',
    bundleContents: string[],
    status: 'completed' | 'pending' | 'failed' = 'completed'
  ): void {
    this.logTransaction(
      bundleId,
      bundleName,
      'bundle',
      1,
      price,
      currency,
      'bundle',
      status,
      {
        bundleContents
      }
    );
  }

  // Log daily reward
  logDailyReward(
    rewardId: string,
    rewardName: string,
    rewardType: string,
    quantity: number
  ): void {
    this.logTransaction(
      rewardId,
      rewardName,
      rewardType,
      quantity,
      0, // Free reward
      'coins', // Default currency for free items
      'daily_reward',
      'completed',
      {
        rewardType
      }
    );
  }

  // Log ad reward
  logAdReward(
    rewardId: string,
    rewardName: string,
    rewardType: string,
    quantity: number,
    adProvider: string
  ): void {
    this.logTransaction(
      rewardId,
      rewardName,
      rewardType,
      quantity,
      0, // Free reward
      'coins', // Default currency for free items
      'ad_reward',
      'completed',
      {
        adProvider,
        rewardType
      }
    );
  }

  // Get purchase statistics
  getPurchaseStatistics(): {
    totalPurchases: number;
    totalSpent: { pi: number; coins: number };
    purchaseByType: { [key: string]: number };
    purchaseByCurrency: { pi: number; coins: number };
    recentPurchases: PurchaseHistory[];
  } {
    const history = this.getPurchaseHistory();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalSpent = { pi: 0, coins: 0 };
    const purchaseByType: { [key: string]: number } = {};
    const purchaseByCurrency = { pi: 0, coins: 0 };
    const recentPurchases = history.filter(purchase => 
      new Date(purchase.purchasedAt) >= thirtyDaysAgo
    );

    history.forEach(purchase => {
      if (purchase.status === 'completed') {
        if (purchase.currency === 'pi') {
          totalSpent.pi += purchase.price;
          purchaseByCurrency.pi++;
        } else {
          totalSpent.coins += purchase.price;
          purchaseByCurrency.coins++;
        }

        purchaseByType[purchase.itemType] = (purchaseByType[purchase.itemType] || 0) + 1;
      }
    });

    return {
      totalPurchases: history.length,
      totalSpent,
      purchaseByType,
      purchaseByCurrency,
      recentPurchases
    };
  }

  // Clear expired subscriptions
  clearExpiredSubscriptions(): void {
    try {
      const inventory = this.getInventory();
      const now = new Date();
      let hasExpiredSubscriptions = false;
      
      const validItems = inventory.filter(item => {
        if (item.type === 'subscription' && item.expiresAt) {
          const expirationDate = new Date(item.expiresAt);
          if (expirationDate <= now) {
            console.log(`⏰ Subscription expired: ${item.name} (${item.id}) - Expired at ${expirationDate.toISOString()}`);
            hasExpiredSubscriptions = true;
            return false; // Remove expired subscription
          }
        }
        return true;
      });
      
      if (hasExpiredSubscriptions || validItems.length !== inventory.length) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(validItems));
        console.log('🗑️ Expired subscriptions cleared from inventory');
        
        // Dispatch event to notify all components about subscription expiration
        window.dispatchEvent(new CustomEvent('subscription-expired', { 
          detail: { 
            action: 'expired',
            timestamp: now.toISOString(),
            remainingSubscriptions: validItems.filter(item => item.type === 'subscription').length
          } 
        }));
        
        // Also dispatch inventory update event
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { 
            action: 'subscriptions-expired',
            timestamp: now.toISOString()
          } 
        }));
      }
    } catch (error) {
      console.error('Error clearing expired subscriptions:', error);
    }
  }

  // Real-time subscription status check - call this frequently
  checkSubscriptionExpiration(): boolean {
    try {
      const inventory = this.getInventory();
      const now = new Date();
      let hasActiveSubscription = false;
      
      for (const item of inventory) {
        if (item.type === 'subscription' && item.expiresAt) {
          const expirationDate = new Date(item.expiresAt);
          if (expirationDate > now) {
            hasActiveSubscription = true;
            break;
          }
        }
      }
      
      // If no active subscriptions found, clear expired ones
      if (!hasActiveSubscription) {
        this.clearExpiredSubscriptions();
      }
      
      return hasActiveSubscription;
    } catch (error) {
      console.error('Error checking subscription expiration:', error);
      return false;
    }
  }

  // Remove a specific subscription
  removeSubscription(subscriptionId: string): boolean {
    try {
      const inventory = this.getInventory();
      const subscriptionIndex = inventory.findIndex(item => 
        item.id === subscriptionId && item.type === 'subscription'
      );
      
      if (subscriptionIndex === -1) {
        console.log(`❌ Subscription ${subscriptionId} not found`);
        return false;
      }
      
      const removedSubscription = inventory[subscriptionIndex];
      inventory.splice(subscriptionIndex, 1);
      localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
      
      console.log(`🗑️ Removed subscription: ${removedSubscription.name} (${subscriptionId})`);
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { itemId: subscriptionId, type: 'subscription', action: 'removed' } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error removing subscription:', error);
      return false;
    }
  }

  // Check subscription status - now supports multiple active subscriptions
  getSubscriptionStatus(): {
    hasActiveSubscription: boolean;
    subscriptionType: string | null;
    expiresAt: string | null;
    daysRemaining: number;
    activeSubscriptions: Array<{
      id: string;
      name: string;
      expiresAt: string;
      daysRemaining: number;
    }>;
  } {
    try {
      const inventory = this.getInventory();
      const now = new Date();
      const activeSubscriptions = inventory
        .filter(item => 
          item.type === 'subscription' && 
          item.expiresAt && 
          new Date(item.expiresAt) > now
        )
        .map(subscription => {
          const expiresAt = new Date(subscription.expiresAt!);
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: subscription.id,
            name: subscription.name,
            expiresAt: subscription.expiresAt!,
            daysRemaining
          };
        })
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()); // Sort by expiration date
      
      if (activeSubscriptions.length > 0) {
        // Return the subscription with the longest remaining time (most recent)
        const longestSubscription = activeSubscriptions[activeSubscriptions.length - 1];
        
        return {
          hasActiveSubscription: true,
          subscriptionType: longestSubscription.name,
          expiresAt: longestSubscription.expiresAt,
          daysRemaining: longestSubscription.daysRemaining,
          activeSubscriptions
        };
      }
      
      return {
        hasActiveSubscription: false,
        subscriptionType: null,
        expiresAt: null,
        daysRemaining: 0,
        activeSubscriptions: []
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        hasActiveSubscription: false,
        subscriptionType: null,
        expiresAt: null,
        daysRemaining: 0,
        activeSubscriptions: []
      };
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Process mock payment and save to inventory
  processMockPayment(
    item: {
      id: string;
      name: string;
      type: InventoryItem['type'];
      quantity?: number;
      price: number;
      currency: 'pi' | 'coins';
      rarity?: InventoryItem['rarity'];
      image?: string;
      description?: string;
      expiresAt?: string;
    }
  ): void {
    try {
      // Always use correct id/image for Fire Phoenix
      if (item.type === 'skin' && (item.id === 'inferno_phoenix' || item.name?.toLowerCase().includes('inferno'))) {
        item.id = 'inferno_phoenix';
        item.image = '/birds2/bird_12.gif';
      }
      
      // Save to inventory
      this.saveToInventory({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity || 1,
        rarity: item.rarity,
        image: item.image,
        description: item.description,
        expiresAt: item.expiresAt
      });

      // Log transaction with comprehensive details
      const paymentMethod = item.currency === 'pi' ? 'pi_payment' : 'coins_payment';
      const metadata = item.type === 'subscription' ? {
        subscriptionType: item.name,
        subscriptionDuration: item.expiresAt ? '30 days' : 'unknown'
      } : undefined;

      this.logTransaction(
        item.id,
        item.name,
        item.type,
        item.quantity || 1,
        item.price,
        item.currency,
        paymentMethod,
        'completed',
        metadata
      );

      console.log('Mock payment processed and logged:', item);
    } catch (error) {
      console.error('Error processing mock payment:', error);
    }
  }

  // Debug inventory function
  debugInventory(): void {
    console.log('🐛 === INVENTORY DEBUG INFO ===');
    try {
      const rawData = localStorage.getItem('flappypi-inventory');
      console.log('📦 Raw localStorage data:', rawData);
      
      if (!rawData) {
        console.log('📦 No inventory data found');
        return;
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
        console.log('📦 Parsed data:', parsedData);
        console.log('📦 Is Array:', Array.isArray(parsedData));
        console.log('📦 Length:', parsedData?.length);
      } catch (error) {
        console.error('❌ Parse error:', error);
        return;
      }
      
      if (Array.isArray(parsedData)) {
        console.log('📦 Items by type:');
        const byType = {};
        parsedData.forEach((item, index) => {
          console.log(`  [${index}]`, item);
          if (item?.type) {
            byType[item.type] = (byType[item.type] || 0) + 1;
          }
        });
        console.log('📦 Summary:', byType);
      }
      
      // Test getInventory method
      const inventory = this.getInventory();
      console.log('📦 getInventory() returns:', inventory.length, 'items');
      
      const powerUps = inventory.filter(item => item.type === 'powerup');
      console.log('⚡ Power-ups in inventory:', powerUps);
      
      const skins = inventory.filter(item => item.type === 'skin');
      console.log('🎨 Skins in inventory:', skins);
      
      const equippedSkin = inventory.find(item => item.type === 'skin' && item.equipped);
      console.log('🎯 Currently equipped skin:', equippedSkin);
      
    } catch (error) {
      console.error('❌ Debug failed:', error);
    }
    console.log('🐛 === END DEBUG ===');
  }

  // Clear all inventory (for debugging/reset)
  clearInventory(): void {
    try {
      // Backup current inventory before clearing
      const currentInventory = localStorage.getItem('flappypi-inventory');
      if (currentInventory) {
        localStorage.setItem('flappypi-inventory-backup', currentInventory);
        console.log('📦 Inventory backed up before clearing');
      }
      
      localStorage.removeItem('flappypi-inventory');
      console.log('🗑️ Inventory cleared');
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { action: 'cleared' } 
      }));
    } catch (error) {
      console.error('❌ Failed to clear inventory:', error);
    }
  }

  // Repair inventory method to fix common issues
  repairInventory(): boolean {
    try {
      console.log('🔧 Starting inventory repair...');
      
      const rawData = localStorage.getItem('flappypi-inventory');
      if (!rawData) {
        console.log('✅ No inventory to repair');
        return true;
      }
      
      let items;
      try {
        items = JSON.parse(rawData);
      } catch (parseError) {
        console.error('❌ Corrupted JSON, resetting inventory');
        localStorage.removeItem('flappypi-inventory');
        return false;
      }
      
      if (!Array.isArray(items)) {
        console.error('❌ Invalid format, resetting inventory');
        localStorage.removeItem('flappypi-inventory');
        return false;
      }
      
      let repaired = false;
      const validItems = [];
      
      for (const item of items) {
        if (!item || typeof item !== 'object') {
          console.log('🔧 Removing invalid item:', item);
          repaired = true;
          continue;
        }

        // Ensure required fields
        if (!item.id || !item.name || !item.type) {
          console.log('🔧 Removing item with missing fields:', item);
          repaired = true;
          continue;
        }

        // Fix quantity
        if (typeof item.quantity !== 'number' || item.quantity < 0) {
          item.quantity = 1;
          repaired = true;
        }

        // Fix purchasedAt
        if (!item.purchasedAt) {
          item.purchasedAt = new Date().toISOString();
          repaired = true;
        }

        // Fix description
        if (typeof item.description !== 'string') {
          item.description = item.name || 'Item';
          repaired = true;
        }

        // --- Fire Phoenix Skin auto-fix ---
        if (
          item.type === 'skin' && (
            item.id === 'inferno_phoenix' ||
            item.id === 'inferno-phoenix' ||
            (item.name && item.name.toLowerCase().includes('phoenix')) ||
            (item.image && item.image.includes('bird_12.gif'))
          )
        ) {
          if (item.id !== 'inferno_phoenix') {
            item.id = 'inferno_phoenix';
            repaired = true;
          }
          if (item.image !== '/birds2/bird_12.gif') {
            item.image = '/birds2/bird_12.gif';
            repaired = true;
          }
          if (item.rarity !== 'Special') {
            item.rarity = 'Special';
            repaired = true;
          }
          if (item.name !== 'Fire Phoenix Skin') {
            item.name = 'Fire Phoenix Skin';
            repaired = true;
          }
        }

        validItems.push(item);
      }
      
      if (repaired) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(validItems));
        console.log('🔧 Inventory repaired:', validItems.length, 'items');
        
        // Notify components
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { action: 'repaired' } 
        }));
      }
      
      return true;
    } catch (error) {
      console.error('❌ Inventory repair failed:', error);
      return false;
    }
  }

  // Fix power-up types (migrate old data)
  fixPowerUpTypes(): void {
    const inventory = this.getInventory();
    let hasChanges = false;
    
    const fixedInventory = inventory.map(item => {
      // Fix power-ups that were saved as skins
      if (item.type === 'skin' && ['shield', 'magnet', 'extra_life', 'coin_multiplier', 'turbo_start'].includes(item.id)) {
        hasChanges = true;
        console.log(`🔧 Fixing power-up type: ${item.id} from 'skin' to 'powerup'`);
        return { ...item, type: 'powerup' as const };
      }
      return item;
    });
    
    if (hasChanges) {
      localStorage.setItem('flappypi-inventory', JSON.stringify(fixedInventory));
      console.log('✅ Fixed power-up types in inventory');
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { action: 'fixed' } 
      }));
    } else {
      console.log('✅ No power-up type fixes needed');
    }
  }

  // Clean up expired or zero-quantity power-ups (debounced)
  cleanupPowerUps(): void {
    // Clear existing timeout
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
    }
    
    // Set new timeout to debounce cleanup calls
    this.cleanupTimeout = setTimeout(() => {
      try {
        const inventoryData = localStorage.getItem('flappypi-inventory');
        const inventory: InventoryItem[] = inventoryData ? JSON.parse(inventoryData) : [];
        let hasChanges = false;
        
        const cleanedInventory = inventory.filter(item => {
          // Remove power-ups with zero quantity
          if (item.type === 'powerup' && item.quantity <= 0) {
            hasChanges = true;
            return false;
          }
          return true;
        });
        
        if (hasChanges) {
          localStorage.setItem('flappypi-inventory', JSON.stringify(cleanedInventory));
          
          // Dispatch event to notify components
          window.dispatchEvent(new CustomEvent('inventory-updated', { 
            detail: { action: 'cleaned' } 
          }));
        }
      } catch (error) {
        console.error('Error cleaning up power-ups:', error);
      }
    }, 500); // 500ms debounce delay
  }

  // Manual cleanup trigger (for immediate cleanup when needed)
  forceCleanupPowerUps(): void {
    try {
      const inventoryData = localStorage.getItem('flappypi-inventory');
      const inventory: InventoryItem[] = inventoryData ? JSON.parse(inventoryData) : [];
      let hasChanges = false;
      
      const cleanedInventory = inventory.filter(item => {
        // Remove power-ups with zero quantity
        if (item.type === 'powerup' && item.quantity <= 0) {
          hasChanges = true;
          console.log(`🗑️ Removing expired power-up: ${item.id} (quantity: ${item.quantity})`);
          return false;
        }
        return true;
      });
      
      if (hasChanges) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(cleanedInventory));
        console.log('✅ Cleaned up expired power-ups from inventory');
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { action: 'cleaned' } 
        }));
      }
    } catch (error) {
      console.error('Error cleaning up power-ups:', error);
    }
  }

  // Sync inventory with profile's owned_power_ups
  syncWithProfilePowerUps(profilePowerUps: { [key: string]: number }): void {
    try {
      const inventoryData = localStorage.getItem('flappypi-inventory');
      const inventory: InventoryItem[] = inventoryData ? JSON.parse(inventoryData) : [];
      let hasChanges = false;
      
      // FIXED: Improved sync logic to ensure all profile power-ups are properly added
      const updatedInventory = inventory.filter(item => {
        if (item.type === 'powerup') {
          const profileQuantity = profilePowerUps[item.id] || 0;
          if (profileQuantity === 0) {
            hasChanges = true;
            return false; // Remove power-ups that are not in profile
          } else if (item.quantity !== profileQuantity) {
            hasChanges = true;
            item.quantity = profileQuantity; // Update quantity to match profile
          }
        }
        return true;
      });
      
      // Add power-ups from profile that are not in inventory
      Object.entries(profilePowerUps).forEach(([powerUpId, quantity]) => {
        if (quantity > 0) {
          const existingItem = updatedInventory.find(item => item.id === powerUpId && item.type === 'powerup');
          if (!existingItem) {
            hasChanges = true;
            updatedInventory.push({
              id: powerUpId,
              name: this.getPowerUpName(powerUpId),
              type: 'powerup',
              quantity: quantity,
              purchasedAt: new Date().toISOString(),
              description: this.getPowerUpEffectDescription(powerUpId),
              image: this.getPowerUpIcon(powerUpId)
            });
          } else if (existingItem.quantity !== quantity) {
            // Update quantity if it doesn't match
            hasChanges = true;
            existingItem.quantity = quantity;
          }
        }
      });
      
      if (hasChanges) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(updatedInventory));
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { action: 'synced', powerUps: profilePowerUps } 
        }));
        
        console.log('🔄 Inventory synced with profile power-ups:', {
          profilePowerUps,
          updatedInventory: updatedInventory.filter(item => item.type === 'powerup').map(item => `${item.name} (${item.quantity})`)
        });
      } else {
        // Even if no changes, dispatch event to ensure components refresh
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { action: 'checked', powerUps: profilePowerUps } 
        }));
        console.log('✅ Inventory already in sync with profile power-ups');
      }
    } catch (error) {
      console.error('Error syncing with profile power-ups:', error);
    }
  }

  // Helper method to get power-up name
  private getPowerUpName(powerUpId: string): string {
    const names = {
      'shield': 'Shield',
      'magnet': 'Coin Magnet',
      'extra_life': 'Extra Life',
      'coin_multiplier': '2x Coin Multiplier',
      'turbo_start': 'Turbo Start'
    };
    return names[powerUpId as keyof typeof names] || powerUpId.replace('_', ' ');
  }

  // Helper method to get power-up icon
  private getPowerUpIcon(powerUpId: string): string {
    const icons = {
      'shield': '/powerups/shield.png',
      'magnet': '/powerups/coin-magnet.png',
      'extra_life': '/powerups/extra-life.png',
      'coin_multiplier': '/powerups/2x-coin-multiplier.png',
      'turbo_start': '/powerups/turbo-start.png'
    };
    return icons[powerUpId as keyof typeof icons] || `/powerups/${powerUpId.replace('_', '-')}.png`;
  }

  // Add test skins to inventory for testing
  addTestSkins(): void {
    try {
      const testSkins = [
        { id: 'dragon', name: 'Dragon Skin', type: 'skin' as const, quantity: 1, rarity: 'Legendary' as const },
        { id: 'gold', name: 'Gold Skin', type: 'skin' as const, quantity: 1, rarity: 'Epic' as const },
        { id: 'red', name: 'Red Skin', type: 'skin' as const, quantity: 1, rarity: 'Common' as const },
        { id: 'blue', name: 'Blue Skin', type: 'skin' as const, quantity: 1, rarity: 'Common' as const }
      ];

      testSkins.forEach(skin => {
        this.saveToInventory(skin);
      });

      console.log('🧪 Test skins added to inventory');
    } catch (error) {
      console.error('Error adding test skins:', error);
    }
  }

  // Open mystery box and generate rewards
  openMysteryBox(boxType: 'basic' | 'rare' | 'epic' | 'legendary'): {
    rewards: any[];
    success: boolean;
  } {
    try {
      const inventory = this.getInventory();
      const mysteryBox = inventory.find(item => item.id === boxType && item.type === 'mystery-box');
      
      if (!mysteryBox || mysteryBox.quantity <= 0) {
        return { rewards: [], success: false };
      }

      // Use the mystery box
      const success = this.useItem(boxType, 'mystery-box', 1);
      if (!success) {
        return { rewards: [], success: false };
      }

      // Generate rewards based on box type
      let rewards = this.generateMysteryBoxRewards(boxType);
      // Filter out any mystery boxes from rewards
      rewards = rewards.filter(r => r.type !== 'mystery-box');
      // Add rewards to inventory
      rewards.forEach(reward => {
        this.saveToInventory(reward);
      });
      // Log the mystery box opening as a transaction
      this.logTransaction(
        boxType,
        `${boxType.charAt(0).toUpperCase() + boxType.slice(1)} Mystery Box`,
        'mystery-box',
        1,
        0, // Already paid for when purchased
        'coins', // Default currency
        'mystery_box',
        'completed',
        {
          mysteryBoxType: boxType,
          rewardType: 'mystery_box_opening'
        }
      );
      console.log(`🎁 Opened ${boxType} mystery box, got ${rewards.length} rewards`);
      return { rewards, success: true };
    } catch (error) {
      console.error('Error opening mystery box:', error);
      return { rewards: [], success: false };
    }
  }

  // Generate rewards for mystery box with exact images
  private generateMysteryBoxRewards(boxType: string): any[] {
    // --- Enhanced reward logic with exact images ---
    const rewards: any[] = [];
    
    // 1. Always add random coins with exact image
    const coinAmount = 500 + Math.floor(Math.random() * 1501); // 500-2000
    rewards.push({ 
      id: 'flappy_coins', 
      name: 'Flappy Coins', 
      type: 'coins', 
      quantity: coinAmount, 
      image: '/flappycoins.png',
      rarity: 'Common'
    });

    // 2. Add 1-3 random powerups with exact images
    const powerupTypes = [
      { id: 'shield', name: 'Shield', image: '/powerups/shield.png', rarity: 'Common' },
      { id: 'magnet', name: 'Coin Magnet', image: '/powerups/coin-magnet.png', rarity: 'Common' },
      { id: 'extra_life', name: 'Extra Life', image: '/powerups/extra-life.png', rarity: 'Common' },
      { id: 'coin_multiplier', name: '2x Coin Multiplier', image: '/powerups/2x-coin-multiplier.png', rarity: 'Common' },
      { id: 'turbo_start', name: 'Turbo Start', image: '/powerups/turbo-start.png', rarity: 'Common' }
    ];
    const numPowerups = 1 + Math.floor(Math.random() * 3); // 1-3
    const shuffledPowerups = powerupTypes.sort(() => 0.5 - Math.random());
    for (let i = 0; i < numPowerups; i++) {
      const p = shuffledPowerups[i];
      const randomQty = 1 + Math.floor(Math.random() * 10); // 1-10
      rewards.push({
        id: p.id,
        name: p.name,
        type: 'powerup',
        quantity: randomQty,
        image: p.image,
        rarity: p.rarity
      });
    }

    // 3. Bundle chance based on box type
    const bundleChance = boxType === 'legendary' ? 0.25 : boxType === 'rare' ? 0.15 : 0.05;
    if (Math.random() < bundleChance) {
      const bundles = [
        { id: 'starter_pack', name: 'Starter Pack', type: 'bundle', quantity: 1, image: '/boxes/basic-box.png', rarity: 'Common' },
        { id: 'powerup_pack', name: 'Powerup Pack', type: 'bundle', quantity: 1, image: '/boxes/rare-box.png', rarity: 'Rare' },
        { id: 'premium_pack', name: 'Premium Pack', type: 'bundle', quantity: 1, image: '/boxes/legendary-box.png', rarity: 'Legendary' },
        { id: 'skin_pack', name: 'Skin Pack', type: 'bundle', quantity: 1, image: '/boxes/rare-box.png', rarity: 'Epic' },
        { id: 'mega_pack', name: 'Mega Pack', type: 'bundle', quantity: 1, image: '/boxes/legendary-box.png', rarity: 'Legendary' }
      ];
      const bundle = bundles[Math.floor(Math.random() * bundles.length)];
      rewards.push(bundle);
    }

    // 4. Skin chance based on box type with exact images
    const skinChance = boxType === 'legendary' ? 0.20 : boxType === 'rare' ? 0.15 : boxType === 'epic' ? 0.10 : 0.05;
    if (Math.random() < skinChance) {
      const skins = [
        { id: 'bird-1', name: 'Red Bird', type: 'skin', quantity: 1, rarity: 'Common', image: '/birds2/bird_1.gif' },
        { id: 'bird-2', name: 'Green Bird', type: 'skin', quantity: 1, rarity: 'Common', image: '/birds2/bird_2.gif' },
        { id: 'bird-3', name: 'Blue Bird', type: 'skin', quantity: 1, rarity: 'Rare', image: '/birds2/bird_3.gif' },
        { id: 'bird-4', name: 'Yellow Bird', type: 'skin', quantity: 1, rarity: 'Rare', image: '/birds2/bird_4.gif' },
        { id: 'bird-5', name: 'Purple Bird', type: 'skin', quantity: 1, rarity: 'Epic', image: '/birds2/bird_5.gif' },
        { id: 'bird-6', name: 'Phoenix Bird', type: 'skin', quantity: 1, rarity: 'Legendary', image: '/birds2/bird_6.gif' },
        { id: 'bird-7', name: 'Golden Bird', type: 'skin', quantity: 1, rarity: 'Legendary', image: '/birds2/bird_7.gif' },
        { id: 'bird-8', name: 'Rainbow Bird', type: 'skin', quantity: 1, rarity: 'Epic', image: '/birds2/bird_8.gif' },
        { id: 'bird-9', name: 'Crystal Bird', type: 'skin', quantity: 1, rarity: 'Legendary', image: '/birds2/bird_9.gif' },
        { id: 'bird-10', name: 'Dragon Bird', type: 'skin', quantity: 1, rarity: 'Legendary', image: '/birds2/bird_10.gif' },
        { id: 'bird-11', name: 'Shadow Bird', type: 'skin', quantity: 1, rarity: 'Epic', image: '/birds2/bird_11.gif' },
        { id: 'bird-12', name: 'Fire Phoenix', type: 'skin', quantity: 1, rarity: 'Special', image: '/birds2/bird_12.gif' }
      ];
      let allowedRarity: string;
      if (boxType === 'basic') allowedRarity = 'Common';
      else if (boxType === 'rare') allowedRarity = 'Rare';
      else if (boxType === 'epic') allowedRarity = 'Epic';
      else if (boxType === 'legendary') allowedRarity = 'Legendary';
      else allowedRarity = 'Common';
      const filteredSkins = skins.filter(s => s.rarity === allowedRarity);
      if (filteredSkins.length > 0) {
        const skin = filteredSkins[Math.floor(Math.random() * filteredSkins.length)];
        rewards.push({ ...skin, name: getSkinNameById(skin.id), quantity: 1 });
      }
    }

    // Shuffle rewards for variety
    for (let i = rewards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rewards[i], rewards[j]] = [rewards[j], rewards[i]];
    }
    return rewards;
  }

  // Use bundle and get all items
  useBundle(bundleId: string): {
    items: any[];
    success: boolean;
  } {
    try {
      const inventory = this.getInventory();
      const bundleIndex = inventory.findIndex(item => item.id === bundleId && item.type === 'bundle');
      if (bundleIndex === -1) {
        return { items: [], success: false };
      }
      const bundle = inventory[bundleIndex];
      if (bundle.quantity <= 0) {
        return { items: [], success: false };
      }
      // Decrement or remove the bundle
      if (bundle.quantity === 1) {
        inventory.splice(bundleIndex, 1);
      } else {
        bundle.quantity -= 1;
      }
      localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
      // Get bundle contents
      const items = this.getBundleContents(bundleId);
      // Actually add the items to inventory
      items.forEach(item => {
        this.saveToInventory(item);
      });
      // Log the bundle usage as a transaction
      this.logTransaction(
        bundleId,
        bundle.name || `${bundleId.charAt(0).toUpperCase() + bundleId.slice(1)} Bundle`,
        'bundle',
        1,
        0, // Already paid for when purchased
        'coins', // Default currency
        'bundle',
        'completed',
        {
          bundleContents: items.map(item => item.name || item.id)
        }
      );
      // Dispatch inventory update event
      window.dispatchEvent(new CustomEvent('inventory-updated', { detail: { itemId: bundleId, type: 'bundle', action: 'used' } }));
      console.log(`📦 Used ${bundleId} bundle, got ${items.length} items`);
      return { items, success: true };
    } catch (error) {
      console.error('Error using bundle:', error);
      return { items: [], success: false };
    }
  }

  // Get bundle contents with exact images
  private getBundleContents(bundleId: string): any[] {
    // Always include 15 of each power-up in every bundle
    let allPowerUps = powerUpItems.map(p => ({
      id: p.id,
      name: p.name,
      type: 'powerup',
      quantity: 15,
      rarity: 'Common',
      image: p.image,
      equipped: true // Bundle powerups should be equipped by default
    }));
    // Fallback: if allPowerUps is empty, add a default power-up
    if (allPowerUps.length === 0) {
      allPowerUps = [{
        id: 'shield',
        name: 'Shield',
        type: 'powerup',
        quantity: 15,
        rarity: 'Common',
        image: '/powerups/shield.png',
        equipped: true // Bundle powerups should be equipped by default
      }];
    }
    // Single power-up bundles (e.g., 'extra-life', 'coin-magnet', etc.)
    const singlePowerUpBundles: { [key: string]: string } = {
      'extra-life': 'Extra Life',
      'coin-magnet': 'Coin Magnet',
      '2x-coin-multiplier': '2x Coin Multiplier',
      'shield': 'Shield',
      'turbo-start': 'Turbo Start'
    };
    if (singlePowerUpBundles[bundleId]) {
      // Find the matching power-up in powerUpItems
      const powerUp = powerUpItems.find(p => p.name === singlePowerUpBundles[bundleId]);
      if (powerUp) {
        return [{
          id: powerUp.id,
          name: powerUp.name,
          type: 'powerup',
          quantity: 15,
          rarity: 'Common',
          image: powerUp.image,
          equipped: true // Bundle powerups should be equipped by default
        }];
      } else {
        // Fallback if not found
        return [{
          id: bundleId,
          name: singlePowerUpBundles[bundleId],
          type: 'powerup',
          quantity: 15,
          rarity: 'Common',
          image: `/powerups/${singlePowerUpBundles[bundleId].replace(/ /g, '')}.png`,
          equipped: true // Bundle powerups should be equipped by default
        }];
      }
    }
    const bundleContents = {
      'starter_pack': [
        { id: 'bird-1', name: 'Red Bird Skin', type: 'skin', quantity: 1, rarity: 'Common', image: '/birds2/bird_1.gif' },
        ...allPowerUps,
        { id: 'flappy_coins', name: 'Flappy Coins', type: 'coins', quantity: 1000, rarity: 'Common', image: '/flappycoins.png' }
      ],
      'premium_pack': [
        { id: 'bird-10', name: 'Dragon Skin', type: 'skin', quantity: 1, rarity: 'Legendary', image: '/birds2/bird_10.gif' },
        ...allPowerUps,
        { id: 'flappy_coins', name: 'Flappy Coins', type: 'coins', quantity: 5000, rarity: 'Rare', image: '/flappycoins.png' }
      ],
      'powerup_pack': [
        ...allPowerUps,
        { id: 'flappy_coins', name: 'Flappy Coins', type: 'coins', quantity: 2000, rarity: 'Common', image: '/flappycoins.png' }
      ],
      'skin_pack': [
        { id: 'bird-3', name: 'Blue Bird Skin', type: 'skin', quantity: 1, rarity: 'Rare', image: '/birds2/bird_3.gif' },
        { id: 'bird-4', name: 'Yellow Bird Skin', type: 'skin', quantity: 1, rarity: 'Rare', image: '/birds2/bird_4.gif' },
        { id: 'bird-5', name: 'Purple Bird Skin', type: 'skin', quantity: 1, rarity: 'Epic', image: '/birds2/bird_5.gif' },
        ...allPowerUps,
        { id: 'flappy_coins', name: 'Flappy Coins', type: 'coins', quantity: 1500, rarity: 'Common', image: '/flappycoins.png' }
      ],
      'mega_pack': [
        { id: 'bird-6', name: 'Phoenix Bird Skin', type: 'skin', quantity: 1, rarity: 'Legendary', image: '/birds2/bird_6.gif' },
        { id: 'bird-10', name: 'Dragon Skin', type: 'skin', quantity: 1, rarity: 'Legendary', image: '/birds2/bird_10.gif' },
        ...allPowerUps,
        { id: 'flappy_coins', name: 'Flappy Coins', type: 'coins', quantity: 10000, rarity: 'Legendary', image: '/flappycoins.png' }
      ],
      'ultimate_pack': [
        { id: 'bird-12', name: 'Fire Phoenix', type: 'skin', quantity: 1, rarity: 'Special', image: '/birds2/bird_12.gif' },
        ...allPowerUps,
        { id: 'flappy_coins', name: 'Flappy Coins', type: 'coins', quantity: 25000, rarity: 'Special', image: '/flappycoins.png' }
      ]
    };
    return bundleContents[bundleId as keyof typeof bundleContents] || [];
  }

  // Test mystery box and bundle system
  testMysteryBoxAndBundleSystem(): void {
    console.log('🧪 Testing Mystery Box and Bundle System...');
    
    // Add test mystery boxes
    this.saveToInventory({
      id: 'basic',
      name: 'Basic Mystery Box',
      type: 'mystery-box',
      quantity: 3,
      rarity: 'Common',
      image: '/boxes/basic-box.png',
      description: 'Contains random rewards including coins, power-ups, and possibly skins.'
    });
    
    this.saveToInventory({
      id: 'rare',
      name: 'Rare Mystery Box',
      type: 'mystery-box',
      quantity: 2,
      rarity: 'Rare',
      image: '/boxes/rare-box.png',
      description: 'Contains better rewards with higher chances of rare items.'
    });
    
    this.saveToInventory({
      id: 'legendary',
      name: 'Legendary Mystery Box',
      type: 'mystery-box',
      quantity: 1,
      rarity: 'Legendary',
      image: '/boxes/legendary-box.png',
      description: 'Contains the best rewards with guaranteed rare items.'
    });
    
    // Add test bundles
    this.saveToInventory({
      id: 'starter_pack',
      name: 'Starter Pack Bundle',
      type: 'bundle',
      quantity: 2,
      rarity: 'Common',
      image: '/boxes/basic-box.png',
      description: 'Perfect for new players with basic items and coins.'
    });
    
    this.saveToInventory({
      id: 'powerup_pack',
      name: 'Powerup Pack Bundle',
      type: 'bundle',
      quantity: 1,
      rarity: 'Rare',
      image: '/boxes/rare-box.png',
      description: 'Contains various power-ups to boost your gameplay.'
    });
    
    this.saveToInventory({
      id: 'mega_pack',
      name: 'Mega Pack Bundle',
      type: 'bundle',
      quantity: 1,
      rarity: 'Legendary',
      image: '/boxes/legendary-box.png',
      description: 'Ultimate bundle with legendary items and massive coin rewards.'
    });
    
    console.log('✅ Test mystery boxes and bundles added to inventory!');
    console.log('📦 Mystery Boxes: Basic (3), Rare (2), Legendary (1)');
    console.log('🎁 Bundles: Starter Pack (2), Powerup Pack (1), Mega Pack (1)');
    console.log('💡 Use the inventory page to open mystery boxes and use bundles!');
  }

  // Utility function to manually expire a subscription for testing
  expireSubscriptionForTesting(subscriptionId: string): boolean {
    try {
      const inventory = this.getInventory();
      const subscriptionIndex = inventory.findIndex(item => 
        item.id === subscriptionId && item.type === 'subscription'
      );
      
      if (subscriptionIndex === -1) {
        console.log(`❌ Subscription ${subscriptionId} not found for testing expiration`);
        return false;
      }
      
      // Set expiration to 1 second ago
      const expiredDate = new Date();
      expiredDate.setSeconds(expiredDate.getSeconds() - 1);
      inventory[subscriptionIndex].expiresAt = expiredDate.toISOString();
      
      localStorage.setItem('flappypi-inventory', JSON.stringify(inventory));
      
      console.log(`🧪 Manually expired subscription for testing: ${inventory[subscriptionIndex].name} (${subscriptionId})`);
      
      // Trigger expiration check immediately
      this.checkSubscriptionExpiration();
      
      return true;
    } catch (error) {
      console.error('Error manually expiring subscription for testing:', error);
      return false;
    }
  }

  // Utility function to create a test subscription that expires in X seconds
  createTestSubscription(planName: string, expiresInSeconds: number = 60): string {
    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);
      
      const testSubscription = {
        id: `test-${planName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: planName,
        type: 'subscription' as const,
        quantity: 1,
        rarity: 'Special' as const,
        description: `Test subscription that expires in ${expiresInSeconds} seconds`,
        expiresAt: expiresAt.toISOString()
      };
      
      this.saveToInventory(testSubscription);
      
      console.log(`🧪 Created test subscription: ${planName} - expires in ${expiresInSeconds} seconds`);
      
      return testSubscription.id;
    } catch (error) {
      console.error('Error creating test subscription:', error);
      return '';
    }
  }

  // Save unclaimed subscription rewards
  saveUnclaimedSubscriptionRewards(planId: string, planName: string, rewards: SubscriptionReward[], expiresAt?: string): void {
    try {
      const unclaimedRewards = this.getUnclaimedSubscriptionRewards();
      
      // Remove any existing unclaimed rewards for this plan
      const filteredRewards = unclaimedRewards.filter(r => r.planId !== planId);
      
      // Add new unclaimed rewards
      const newUnclaimedReward: UnclaimedSubscriptionReward = {
        id: `${planId}-${Date.now()}`,
        planId,
        planName,
        rewards,
        purchasedAt: new Date().toISOString(),
        expiresAt
      };
      
      filteredRewards.push(newUnclaimedReward);
      
      localStorage.setItem('flappypi-unclaimed-subscription-rewards', JSON.stringify(filteredRewards));
      
      console.log(`📦 Saved unclaimed rewards for ${planName}:`, rewards.length, 'items');
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('unclaimed-rewards-updated', { 
        detail: { planId, planName, rewardCount: rewards.length } 
      }));
    } catch (error) {
      console.error('Error saving unclaimed subscription rewards:', error);
    }
  }

  // Get all unclaimed subscription rewards
  getUnclaimedSubscriptionRewards(): UnclaimedSubscriptionReward[] {
    try {
      const unclaimed = localStorage.getItem('flappypi-unclaimed-subscription-rewards');
      return unclaimed ? JSON.parse(unclaimed) : [];
    } catch (error) {
      console.error('Error getting unclaimed subscription rewards:', error);
      return [];
    }
  }

  // Check if user has any unclaimed subscription rewards
  hasUnclaimedSubscriptionRewards(): boolean {
    const unclaimed = this.getUnclaimedSubscriptionRewards();
    return unclaimed.length > 0;
  }

  // Get unclaimed rewards for a specific plan
  getUnclaimedRewardsForPlan(planId: string): UnclaimedSubscriptionReward | null {
    const unclaimed = this.getUnclaimedSubscriptionRewards();
    return unclaimed.find(r => r.planId === planId) || null;
  }

  // Check if a specific plan's rewards have been claimed
  hasClaimedPlanRewards(planId: string): boolean {
    try {
      const purchaseHistory = this.getPurchaseHistory();
      const unclaimedRewards = this.getUnclaimedSubscriptionRewards();
      const planReward = unclaimedRewards.find(r => r.planId === planId);
      
      if (!planReward) {
        // If no unclaimed rewards exist, check if they were already claimed
        return purchaseHistory.some(transaction => 
          transaction.metadata?.rewardType === 'subscription_reward' && 
          transaction.itemName.includes(planId)
        );
      }
      
      return false; // Has unclaimed rewards, so not claimed yet
    } catch (error) {
      console.error('Error checking if plan rewards claimed:', error);
      return false;
    }
  }

  // Claim subscription rewards for a specific plan
  claimSubscriptionRewards(planId: string): SubscriptionReward[] | null {
    try {
      const unclaimedRewards = this.getUnclaimedSubscriptionRewards();
      const planRewards = unclaimedRewards.find(r => r.planId === planId);
      
      if (!planRewards) {
        console.log('No unclaimed rewards found for plan:', planId);
        return null;
      }

      // Check if rewards have already been claimed by looking for transaction history
      const purchaseHistory = this.getPurchaseHistory();
      const alreadyClaimed = purchaseHistory.some(transaction => 
        transaction.metadata?.rewardType === 'subscription_reward' && 
        transaction.itemName.includes(planRewards.planName)
      );

      if (alreadyClaimed) {
        console.log('Rewards already claimed for plan:', planId);
        return null;
      }

      // Import wallet utilities
      const { loadWalletBalance, saveWalletBalance } = require('@/utils/walletUtils');
      let totalCoinsAwarded = 0;

      // Save rewards to inventory
      planRewards.rewards.forEach(reward => {
        // CRITICAL FIX: Handle coins separately - add to wallet balance, not inventory
        if (reward.type === 'coins') {
          const savedUsername = localStorage.getItem('flappypi-username');
          const currentBalance = loadWalletBalance(savedUsername);
          const newBalance = currentBalance + reward.quantity;
          saveWalletBalance(newBalance, savedUsername);
          totalCoinsAwarded += reward.quantity;
          console.log(`💰 Added ${reward.quantity} coins to wallet. New balance: ${newBalance}`);
          
          // Log coin reward transaction
          this.logDailyReward(
            reward.id,
            reward.name,
            reward.type,
            reward.quantity
          );

          // Dispatch wallet update event so UI updates immediately
          window.dispatchEvent(new CustomEvent('wallet-balance-updated', { 
            detail: { balance: newBalance, added: reward.quantity } 
          }));
        } else {
          // For non-coin rewards (items, skins, powerups), save to inventory
          const inventoryItem = {
            id: reward.id,
            name: reward.name,
            type: reward.type as any,
            quantity: reward.quantity,
            rarity: reward.rarity,
            image: reward.image,
            description: reward.description,
            // Auto-equip Fire Phoenix skin when claimed
            ...(reward.type === 'skin' && (reward.id === 'inferno_phoenix' || reward.id === 'inferno-phoenix') ? { equipped: true } : {}),
            // Auto-equip powerups by default
            ...(reward.type === 'powerup' ? { equipped: true } : {})
          };
          
          // Log Fire Phoenix specifically
          if (reward.id === 'inferno_phoenix' || reward.id === 'inferno-phoenix') {
            console.log('🔥 [Fire Phoenix] Claiming Fire Phoenix skin:', {
              id: inventoryItem.id,
              name: inventoryItem.name,
              image: inventoryItem.image,
              equipped: inventoryItem.equipped,
              type: inventoryItem.type
            });
          }
          
          this.saveToInventory(inventoryItem);
          console.log(`📦 Added ${reward.quantity}x ${reward.name} to inventory`);
          
          // Log item reward transaction
          this.logTransaction(
            reward.id,
            reward.name,
            reward.type,
            reward.quantity,
            0, // Free reward
            'coins',
            'subscription',
            'completed',
            { rewardType: 'subscription_reward' }
          );
        }
      });

      // Remove from unclaimed rewards
      const remainingUnclaimed = unclaimedRewards.filter(r => r.planId !== planId);
      localStorage.setItem('flappypi-unclaimed-subscription-rewards', JSON.stringify(remainingUnclaimed));
      
      console.log(`🎉 Claimed rewards for ${planRewards.planName}:`, planRewards.rewards.length, 'items');
      if (totalCoinsAwarded > 0) {
        console.log(`💰 Total coins awarded: ${totalCoinsAwarded}`);
      }
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('unclaimed-rewards-updated', { 
        detail: { planId, planName: planRewards.planName, action: 'claimed', coinsAwarded: totalCoinsAwarded } 
      }));
      
      return planRewards.rewards;
    } catch (error) {
      console.error('Error claiming subscription rewards:', error);
      return null;
    }
  }

  // Claim all unclaimed subscription rewards
  claimAllSubscriptionRewards(): { planId: string; planName: string; rewards: SubscriptionReward[] }[] {
    try {
      const unclaimedRewards = this.getUnclaimedSubscriptionRewards();
      const claimedResults: { planId: string; planName: string; rewards: SubscriptionReward[] }[] = [];
      
      unclaimedRewards.forEach(planRewards => {
        const claimed = this.claimSubscriptionRewards(planRewards.planId);
        if (claimed) {
          claimedResults.push({
            planId: planRewards.planId,
            planName: planRewards.planName,
            rewards: claimed
          });
        }
      });
      
      return claimedResults;
    } catch (error) {
      console.error('Error claiming all subscription rewards:', error);
      return [];
    }
  }

  // Clear expired unclaimed rewards (older than 30 days)
  clearExpiredUnclaimedRewards(): void {
    try {
      const unclaimedRewards = this.getUnclaimedSubscriptionRewards();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const validRewards = unclaimedRewards.filter(reward => {
        const purchasedAt = new Date(reward.purchasedAt);
        return purchasedAt > thirtyDaysAgo;
      });
      
      if (validRewards.length !== unclaimedRewards.length) {
        localStorage.setItem('flappypi-unclaimed-subscription-rewards', JSON.stringify(validRewards));
        console.log('🧹 Cleared expired unclaimed rewards');
      }
    } catch (error) {
      console.error('Error clearing expired unclaimed rewards:', error);
    }
  }

  // ========================================
  // CLOUD SYNC METHODS
  // ========================================

  /**
   * Sync all inventory to Supabase cloud
   * @param piUserId - Pi Network user ID
   * @returns Promise<boolean> - Success status
   */
  async syncInventoryToCloud(piUserId: string): Promise<boolean> {
    if (!piUserId) {
      console.warn('⚠️ Cannot sync inventory: No Pi user ID provided');
      return false;
    }

    try {
      const inventory = this.getInventory();
      const { loadWalletBalance } = require('@/utils/walletUtils');
      const walletBalance = loadWalletBalance();
      
      console.log('🔄 Syncing inventory + wallet to cloud:', inventory.length, 'items,', walletBalance, 'coins for user:', piUserId);
      
      const { data, error } = await supabase
        .from('user_inventory_sync')
        .upsert({
          pi_user_id: piUserId,
          items: inventory,
          wallet_balance: walletBalance,
          last_sync_time: new Date().toISOString(),
          sync_status: 'completed'
        }, { 
          onConflict: 'pi_user_id' 
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Inventory sync failed:', error);
        toast({
          title: 'Cloud Sync Failed',
          description: 'Could not sync inventory to cloud. Your data is safe locally.',
          variant: 'destructive',
        });
        return false;
      }
      
      console.log('✅ Inventory + wallet synced to Supabase:', inventory.length, 'items,', walletBalance, 'coins');
      toast({
        title: 'Cloud Sync Success',
        description: 'Inventory and wallet successfully synced to cloud.',
        variant: 'default',
      });
      return true;
    } catch (error) {
      console.error('❌ Error syncing inventory to cloud:', error);
      return false;
    }
  }

  /**
   * Sync wallet balance to Supabase cloud
   * @param piUserId - Pi Network user ID
   * @param balance - Wallet balance to sync
   * @returns Promise<boolean> - Success status
   */
  async syncWalletToCloud(piUserId: string, balance: number): Promise<boolean> {
    if (!piUserId) {
      console.warn('⚠️ Cannot sync wallet: No Pi user ID provided');
      return false;
    }

    try {
      console.log('💰 Syncing wallet balance to cloud:', balance, 'coins for user:', piUserId);
      
      const { data, error } = await supabase
        .from('user_inventory_sync')
        .upsert({
          pi_user_id: piUserId,
          wallet_balance: balance,
          last_sync_time: new Date().toISOString()
        }, {
          onConflict: 'pi_user_id'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Wallet sync failed:', error);
        toast({
          title: 'Wallet Sync Failed',
          description: 'Could not sync wallet balance to cloud. Your balance is safe locally.',
          variant: 'destructive',
        });
        return false;
      }
      
      console.log('✅ Wallet balance synced to cloud:', balance, 'coins');
      toast({
        title: 'Wallet Sync Success',
        description: 'Wallet balance successfully synced to cloud.',
        variant: 'default',
      });
      return true;
    } catch (error) {
      console.error('❌ Error syncing wallet to cloud:', error);
      return false;
    }
  }

  /**
   * Save inventory to Supabase cloud without wallet
   * @param piUserId - Pi Network user ID
   * @param inventory - Inventory items to save
   * @returns Promise<boolean> - Success status
   */
  async saveInventoryToCloud(piUserId: string, inventory: InventoryItem[]): Promise<boolean> {
    if (!piUserId) {
      console.warn('⚠️ Cannot save inventory: No Pi user ID provided');
      return false;
    }

    try {
      console.log('📦 Saving inventory to cloud:', inventory.length, 'items for user:', piUserId);
      
      const { data, error } = await supabase
        .from('user_inventory_sync')
        .upsert({
          pi_user_id: piUserId,
          items: inventory,
          last_sync_time: new Date().toISOString()
        }, {
          onConflict: 'pi_user_id'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Inventory save failed:', error);
        return false;
      }
      
      console.log('✅ Inventory saved to cloud:', inventory.length, 'items');
      return true;
    } catch (error) {
      console.error('❌ Error saving inventory to cloud:', error);
      return false;
    }
  }

  /**
   * Load inventory from Supabase cloud for Pi user
   * @param piUserId - Pi Network user ID
   * @returns Promise<InventoryItem[]> - Cloud inventory items
   */
  async loadInventoryFromCloud(piUserId: string): Promise<InventoryItem[]> {
    if (!piUserId) {
      console.warn('⚠️ Cannot load inventory: No Pi user ID provided');
      return [];
    }

    try {
      console.log('📥 Loading inventory + wallet from cloud for user:', piUserId);
      
      const { data, error } = await supabase
        .from('user_inventory_sync')
        .select('items, wallet_balance, last_sync_time')
        .eq('pi_user_id', piUserId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No inventory found in cloud (new user)
          console.log('ℹ️ No cloud inventory found for user (new user):', piUserId);
          return [];
        }
        console.error('❌ Error loading inventory from cloud:', error);
        return [];
      }
      
      if (!data?.items) {
        console.warn('⚠️ No inventory data in cloud for user:', piUserId);
        return [];
      }
      
      // Restore wallet balance from cloud if available
      if (data.wallet_balance !== undefined && data.wallet_balance !== null) {
        const { saveWalletBalance } = require('@/utils/walletUtils');
        const savedUsername = localStorage.getItem('flappypi-username');
        saveWalletBalance(data.wallet_balance, savedUsername);
        console.log('💰 Restored wallet balance from cloud:', data.wallet_balance, 'coins');
        
        // Dispatch event to update UI
        window.dispatchEvent(new CustomEvent('wallet-balance-updated', { 
          detail: { balance: data.wallet_balance, restored: true } 
        }));
      }
      
      const cloudItems = data.items as InventoryItem[];
      console.log('✅ Loaded', cloudItems.length, 'items from cloud (last sync:', data.last_sync_time, ')');
      
      return cloudItems;
    } catch (error) {
      console.error('❌ Error loading inventory from cloud:', error);
      return [];
    }
  }

  /**
   * Merge local and cloud inventory data
   * Priority: Cloud data takes precedence for logged-in Pi users
   * @param localItems - Items from localStorage
   * @param cloudItems - Items from Supabase
   * @returns InventoryItem[] - Merged inventory
   */
  mergeInventoryData(localItems: InventoryItem[], cloudItems: InventoryItem[]): InventoryItem[] {
    try {
      console.log('🔀 Merging inventory data:', {
        localCount: localItems.length,
        cloudCount: cloudItems.length
      });

      // If no cloud items, use local
      if (cloudItems.length === 0) {
        console.log('📦 No cloud items, using local inventory');
        return localItems;
      }

      // If no local items, use cloud
      if (localItems.length === 0) {
        console.log('☁️ No local items, using cloud inventory');
        return cloudItems;
      }

      // Merge logic: Use Map for deduplication
      const merged = new Map<string, InventoryItem>();
      
      // Start with cloud items (cloud has priority)
      cloudItems.forEach(item => {
        const key = `${item.type}-${item.id}`;
        merged.set(key, item);
      });
      
      // Merge local items
      localItems.forEach(item => {
        const key = `${item.type}-${item.id}`;
        const existing = merged.get(key);
        
        if (!existing) {
          // New item only in local, add it
          merged.set(key, item);
        } else {
          // Item exists in both, merge based on type
          if (item.type === 'powerup') {
            // For power-ups: sum quantities (take the higher one to avoid duplicates)
            existing.quantity = Math.max(existing.quantity, item.quantity);
          } else if (item.type === 'subscription') {
            // For subscriptions: keep the one with latest expiry
            if (item.expiresAt && existing.expiresAt) {
              if (new Date(item.expiresAt) > new Date(existing.expiresAt)) {
                merged.set(key, item);
              }
            } else if (item.expiresAt && !existing.expiresAt) {
              merged.set(key, item);
            }
          }
          // For skins and other items: cloud version already in map (priority)
        }
      });
      
      const mergedArray = Array.from(merged.values());
      console.log('✅ Merge complete:', mergedArray.length, 'unique items');
      
      return mergedArray;
    } catch (error) {
      console.error('❌ Error merging inventory data:', error);
      // On error, prefer cloud data if available
      return cloudItems.length > 0 ? cloudItems : localItems;
    }
  }

  /**
   * Full cloud sync workflow: Load from cloud, merge with local, save back
   * This is the main method to call on user login
   * @param piUserId - Pi Network user ID
   * @returns Promise<boolean> - Success status
   */
  async performFullCloudSync(piUserId: string): Promise<boolean> {
    if (!piUserId) {
      console.warn('⚠️ Cannot perform full sync: No Pi user ID provided');
      return false;
    }

    try {
      console.log('🔄 Starting full cloud sync for user:', piUserId);
      
      // 1. Get current local inventory
      const localInventory = this.getInventory();
      console.log('📦 Local inventory:', localInventory.length, 'items');
      
      // 2. Load cloud inventory
      const cloudInventory = await this.loadInventoryFromCloud(piUserId);
      console.log('☁️ Cloud inventory:', cloudInventory.length, 'items');
      
      // 3. Merge inventories
      const mergedInventory = this.mergeInventoryData(localInventory, cloudInventory);
      console.log('🔀 Merged inventory:', mergedInventory.length, 'items');
      
      // 4. Save merged inventory to localStorage
      localStorage.setItem('flappypi-inventory', JSON.stringify(mergedInventory));
      console.log('💾 Saved merged inventory to localStorage');
      
      // 5. Sync merged inventory back to cloud
      const syncSuccess = await this.syncInventoryToCloud(piUserId);
      
      if (syncSuccess) {
        console.log('✅ Full cloud sync completed successfully');
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('inventory-synced', { 
          detail: { 
            piUserId, 
            itemCount: mergedInventory.length,
            syncedAt: new Date().toISOString()
          } 
        }));
        
        return true;
      } else {
        console.warn('⚠️ Cloud sync completed with warnings (local data saved)');
        return false;
      }
    } catch (error) {
      console.error('❌ Error performing full cloud sync:', error);
      return false;
    }
  }

  /**
   * Get cloud sync status for a user
   * @param piUserId - Pi Network user ID
   * @returns Promise with sync status details
   */
  async getCloudSyncStatus(piUserId: string): Promise<{
    hasSyncedData: boolean;
    lastSyncTime: string | null;
    itemCount: number;
    syncStatus: string;
  }> {
    if (!piUserId) {
      return {
        hasSyncedData: false,
        lastSyncTime: null,
        itemCount: 0,
        syncStatus: 'no_user_id'
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_inventory_sync')
        .select('items, last_sync_time, sync_status')
        .eq('pi_user_id', piUserId)
        .single();
      
      if (error || !data) {
        return {
          hasSyncedData: false,
          lastSyncTime: null,
          itemCount: 0,
          syncStatus: 'no_data'
        };
      }
      
      return {
        hasSyncedData: true,
        lastSyncTime: data.last_sync_time,
        itemCount: (data.items as InventoryItem[])?.length || 0,
        syncStatus: data.sync_status
      };
    } catch (error) {
      console.error('❌ Error getting cloud sync status:', error);
      return {
        hasSyncedData: false,
        lastSyncTime: null,
        itemCount: 0,
        syncStatus: 'error'
      };
    }
  }

  /**
   * Migrate existing skins to add serial codes (NFT future support)
   * Assigns unique serial codes to all skins that don't have them
   * @returns Number of skins updated
   */
  migrateSkinsWithSerialCodes(): number {
    try {
      const inventory = this.getInventory();
      let updatedCount = 0;
      
      const updatedInventory = inventory.map((item) => {
        // Only process skins without serial codes
        if (item.type === 'skin' && !item.serialCode) {
          const rarity = (item.rarity as SkinRarity) || 'Common';
          const serialMetadata = generateSkinSerialCode(item.id, rarity);
          
          updatedCount++;
          console.log(`🎫 Migrated ${item.name} with serial code: ${serialMetadata.serialCode}`);
          
          return {
            ...item,
            serialCode: serialMetadata.serialCode,
            rarity: rarity, // Ensure rarity is set
          };
        }
        return item;
      });
      
      if (updatedCount > 0) {
        localStorage.setItem('flappypi-inventory', JSON.stringify(updatedInventory));
        console.log(`✅ Migration complete: ${updatedCount} skins updated with serial codes`);
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('inventory-migrated', { 
          detail: { count: updatedCount, timestamp: new Date().toISOString() } 
        }));
      } else {
        console.log('ℹ️ No skins to migrate - all skins already have serial codes');
      }
      
      return updatedCount;
    } catch (error) {
      console.error('❌ Failed to migrate skins with serial codes:', error);
      return 0;
    }
  }

  /**
   * Get all skins with their serial codes
   * @returns Array of skins with serial code metadata
   */
  getSkinsWithSerialCodes(): Array<{
    id: string;
    name: string;
    serialCode: string;
    rarity: string;
    purchasedAt: string;
    equipped: boolean;
  }> {
    try {
      const inventory = this.getInventory();
      return inventory
        .filter((item) => item.type === 'skin' && item.serialCode)
        .map((item) => ({
          id: item.id,
          name: item.name,
          serialCode: item.serialCode!,
          rarity: item.rarity || 'Common',
          purchasedAt: item.purchasedAt,
          equipped: item.equipped || false,
        }));
    } catch (error) {
      console.error('❌ Failed to get skins with serial codes:', error);
      return [];
    }
  }
}

export const inventoryService = InventoryService.getInstance();
export default inventoryService; 