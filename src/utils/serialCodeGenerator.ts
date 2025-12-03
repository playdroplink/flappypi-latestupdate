/**
 * Serial Code Generator for Flappy Skins (NFT Future Support)
 * 
 * Generates unique serial codes for each skin purchase based on rarity.
 * Format: [RARITY_PREFIX]-[SKIN_ID]-[TIMESTAMP]-[RANDOM]
 * 
 * Examples:
 * - Common: COM-bird-1-20251203-A3F9
 * - Rare: RAR-bird-7-20251203-B7D2
 * - Epic: EPC-bird-4-20251203-C9E1
 * - Legendary: LEG-bird-3-20251203-F4A8
 * - Special: SPC-inferno-phoenix-20251203-D1B5
 */

export type SkinRarity = 'Common' | 'Rare' | 'Epic' | 'Special' | 'Legendary';

interface SerialCodeMetadata {
  serialCode: string;
  rarity: SkinRarity;
  skinId: string;
  generatedAt: string;
  purchaseTimestamp: number;
}

// Rarity prefixes for serial codes
const RARITY_PREFIXES: Record<SkinRarity, string> = {
  Common: 'COM',
  Rare: 'RAR',
  Epic: 'EPC',
  Special: 'SPC',
  Legendary: 'LEG',
};

// Rarity weights for future reward systems
export const RARITY_WEIGHTS: Record<SkinRarity, number> = {
  Common: 1,
  Rare: 3,
  Epic: 5,
  Special: 8,
  Legendary: 10,
};

/**
 * Generates a random alphanumeric string
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Formats date as YYYYMMDD
 */
function formatDateForSerial(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Generates a unique serial code for a Flappy skin
 * 
 * @param skinId - The unique ID of the skin (e.g., "bird-1", "inferno-phoenix")
 * @param rarity - The rarity tier of the skin
 * @returns Unique serial code and metadata
 */
export function generateSkinSerialCode(
  skinId: string,
  rarity: SkinRarity
): SerialCodeMetadata {
  const now = new Date();
  const timestamp = now.getTime();
  const dateStr = formatDateForSerial(now);
  const randomSuffix = generateRandomString(4);
  const prefix = RARITY_PREFIXES[rarity];
  
  // Format: [RARITY_PREFIX]-[SKIN_ID]-[YYYYMMDD]-[RANDOM]
  const serialCode = `${prefix}-${skinId}-${dateStr}-${randomSuffix}`;
  
  return {
    serialCode,
    rarity,
    skinId,
    generatedAt: now.toISOString(),
    purchaseTimestamp: timestamp,
  };
}

/**
 * Validates a serial code format
 * 
 * @param serialCode - The serial code to validate
 * @returns true if valid, false otherwise
 */
export function validateSerialCode(serialCode: string): boolean {
  // Expected format: XXX-skinid-YYYYMMDD-XXXX
  const pattern = /^(COM|RAR|EPC|SPC|LEG)-[\w-]+-\d{8}-[A-Z0-9]{4}$/;
  return pattern.test(serialCode);
}

/**
 * Extracts metadata from a serial code
 * 
 * @param serialCode - The serial code to parse
 * @returns Parsed metadata or null if invalid
 */
export function parseSerialCode(serialCode: string): {
  prefix: string;
  skinId: string;
  date: string;
  random: string;
  rarity?: SkinRarity;
} | null {
  if (!validateSerialCode(serialCode)) {
    return null;
  }
  
  const parts = serialCode.split('-');
  const prefix = parts[0];
  const random = parts[parts.length - 1];
  const date = parts[parts.length - 2];
  const skinId = parts.slice(1, -2).join('-');
  
  // Map prefix back to rarity
  const rarityMap: Record<string, SkinRarity> = {
    COM: 'Common',
    RAR: 'Rare',
    EPC: 'Epic',
    SPC: 'Special',
    LEG: 'Legendary',
  };
  
  return {
    prefix,
    skinId,
    date,
    random,
    rarity: rarityMap[prefix],
  };
}

/**
 * Gets all serial codes stored in localStorage for a specific user
 * 
 * @param username - Optional username to scope the search
 * @returns Array of serial codes with metadata
 */
export function getAllUserSerialCodes(username?: string): Array<{
  serialCode: string;
  skinId: string;
  skinName: string;
  rarity: SkinRarity;
  purchasedAt: string;
}> {
  try {
    const inventoryData = localStorage.getItem('flappypi-inventory');
    if (!inventoryData) return [];
    
    const inventory = JSON.parse(inventoryData);
    
    return inventory
      .filter((item: any) => item.type === 'skin' && item.serialCode)
      .map((item: any) => ({
        serialCode: item.serialCode,
        skinId: item.id,
        skinName: item.name,
        rarity: item.rarity || 'Common',
        purchasedAt: item.purchasedAt,
      }));
  } catch (error) {
    console.error('Failed to get user serial codes:', error);
    return [];
  }
}

/**
 * Checks if a serial code already exists in inventory
 * (for validation/migration purposes)
 * 
 * @param serialCode - The serial code to check
 * @returns true if exists, false otherwise
 */
export function serialCodeExists(serialCode: string): boolean {
  try {
    const inventoryData = localStorage.getItem('flappypi-inventory');
    if (!inventoryData) return false;
    
    const inventory = JSON.parse(inventoryData);
    return inventory.some((item: any) => item.serialCode === serialCode);
  } catch (error) {
    console.error('Failed to check serial code existence:', error);
    return false;
  }
}

/**
 * Generates a batch of serial codes for migration purposes
 * (Assigns serial codes to existing skins that don't have them)
 * 
 * @returns Number of items updated
 */
export function migrateExistingSkins(): number {
  try {
    const inventoryData = localStorage.getItem('flappypi-inventory');
    if (!inventoryData) return 0;
    
    const inventory = JSON.parse(inventoryData);
    let updatedCount = 0;
    
    const updatedInventory = inventory.map((item: any) => {
      // Only process skins without serial codes
      if (item.type === 'skin' && !item.serialCode) {
        const rarity = (item.rarity as SkinRarity) || 'Common';
        const metadata = generateSkinSerialCode(item.id, rarity);
        
        updatedCount++;
        return {
          ...item,
          serialCode: metadata.serialCode,
          rarity: rarity, // Ensure rarity is set
        };
      }
      return item;
    });
    
    if (updatedCount > 0) {
      localStorage.setItem('flappypi-inventory', JSON.stringify(updatedInventory));
      console.log(`✅ Migrated ${updatedCount} existing skins with serial codes`);
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Failed to migrate existing skins:', error);
    return 0;
  }
}
