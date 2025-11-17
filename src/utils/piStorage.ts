// Pi Storage Utility for User Data Management
export interface PiUserData {
  userId: string;
  username: string;
  piUsername?: string;
  email?: string;
  profile: {
    avatar?: string;
    bio?: string;
    joinDate: string;
    lastActive: string;
  };
  gameData: {
    highScore: number;
    totalGames: number;
    totalCoins: number;
    achievements: string[];
    unlockedSkins: string[];
    currentSkin: string;
    settings: {
      soundEnabled: boolean;
      musicEnabled: boolean;
      vibrationEnabled: boolean;
      difficulty: 'easy' | 'medium' | 'hard';
    };
  };
  wallet: {
    balance: number;
    transactions: Array<{
      id: string;
      type: 'earn' | 'spend' | 'reward';
      amount: number;
      description: string;
      timestamp: string;
    }>;
  };
  social: {
    friends: string[];
    followers: string[];
    following: string[];
    posts: Array<{
      id: string;
      content: string;
      score?: number;
      timestamp: string;
    }>;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      gameUpdates: boolean;
      friendRequests: boolean;
      achievements: boolean;
      rewards: boolean;
    };
  };
}

export interface PiStorageOptions {
  usePiStorage?: boolean;
  fallbackToLocal?: boolean;
  encryptData?: boolean;
  syncWithPi?: boolean;
}

export class PiStorage {
  private static instance: PiStorage;
  private storagePrefix = 'flappypi_';
  private isPiBrowser: boolean;
  private usePiStorage: boolean;

  constructor(options: PiStorageOptions = {}) {
    this.isPiBrowser = this.detectPiBrowser();
    this.usePiStorage = options.usePiStorage ?? this.isPiBrowser;
    
    console.log('[PiStorage] Initialized:', {
      isPiBrowser: this.isPiBrowser,
      usePiStorage: this.usePiStorage,
      options
    });
  }

  static getInstance(options?: PiStorageOptions): PiStorage {
    if (!PiStorage.instance) {
      PiStorage.instance = new PiStorage(options);
    }
    return PiStorage.instance;
  }

  private detectPiBrowser(): boolean {
    return typeof window !== 'undefined' && (
      typeof window.Pi !== 'undefined' ||
      window.location.hostname.includes('.pinet.com') ||
      window.location.hostname.includes('.minepi.com') ||
      navigator.userAgent.toLowerCase().includes('pi browser')
    );
  }

  // Store user data with Pi Browser compatibility
  async storeUserData(userId: string, data: Partial<PiUserData>): Promise<boolean> {
    try {
      const key = `${this.storagePrefix}user_${userId}`;
      const existingData = await this.getUserData(userId);
      const updatedData = { ...existingData, ...data, userId };

      if (this.usePiStorage && typeof window.Pi !== 'undefined') {
        // Use Pi Browser storage if available
        await this.storeInPiStorage(key, updatedData);
        console.log('[PiStorage] Data stored in Pi Browser storage:', key);
      } else {
        // Fallback to localStorage
        this.storeInLocalStorage(key, updatedData);
        console.log('[PiStorage] Data stored in localStorage:', key);
      }

      return true;
    } catch (error) {
      console.error('[PiStorage] Error storing user data:', error);
      return false;
    }
  }

  // Retrieve user data
  async getUserData(userId: string): Promise<PiUserData | null> {
    try {
      const key = `${this.storagePrefix}user_${userId}`;
      
      if (this.usePiStorage && typeof window.Pi !== 'undefined') {
        const data = await this.getFromPiStorage(key);
        if (data) {
          console.log('[PiStorage] Data retrieved from Pi Browser storage:', key);
          return data;
        }
      }

      // Fallback to localStorage
      const data = this.getFromLocalStorage(key);
      if (data) {
        console.log('[PiStorage] Data retrieved from localStorage:', key);
        return data;
      }

      return null;
    } catch (error) {
      console.error('[PiStorage] Error retrieving user data:', error);
      return null;
    }
  }

  // Store game data specifically
  async storeGameData(userId: string, gameData: PiUserData['gameData']): Promise<boolean> {
    const userData = await this.getUserData(userId);
    if (userData) {
      userData.gameData = { ...userData.gameData, ...gameData };
      return await this.storeUserData(userId, userData);
    }
    return false;
  }

  // Store wallet data
  async storeWalletData(userId: string, walletData: PiUserData['wallet']): Promise<boolean> {
    const userData = await this.getUserData(userId);
    if (userData) {
      userData.wallet = { ...userData.wallet, ...walletData };
      return await this.storeUserData(userId, userData);
    }
    return false;
  }

  // Store social data
  async storeSocialData(userId: string, socialData: PiUserData['social']): Promise<boolean> {
    const userData = await this.getUserData(userId);
    if (userData) {
      userData.social = { ...userData.social, ...socialData };
      return await this.storeUserData(userId, userData);
    }
    return false;
  }

  // Update user preferences
  async updatePreferences(userId: string, preferences: PiUserData['preferences']): Promise<boolean> {
    const userData = await this.getUserData(userId);
    if (userData) {
      userData.preferences = { ...userData.preferences, ...preferences };
      return await this.storeUserData(userId, userData);
    }
    return false;
  }

  // Add transaction to wallet
  async addTransaction(userId: string, transaction: PiUserData['wallet']['transactions'][0]): Promise<boolean> {
    const userData = await this.getUserData(userId);
    if (userData) {
      userData.wallet.transactions.push(transaction);
      userData.wallet.balance += transaction.amount;
      return await this.storeUserData(userId, userData);
    }
    return false;
  }

  // Add achievement
  async addAchievement(userId: string, achievement: string): Promise<boolean> {
    const userData = await this.getUserData(userId);
    if (userData && !userData.gameData.achievements.includes(achievement)) {
      userData.gameData.achievements.push(achievement);
      return await this.storeUserData(userId, userData);
    }
    return false;
  }

  // Unlock skin
  async unlockSkin(userId: string, skinId: string): Promise<boolean> {
    const userData = await this.getUserData(userId);
    if (userData && !userData.gameData.unlockedSkins.includes(skinId)) {
      userData.gameData.unlockedSkins.push(skinId);
      return await this.storeUserData(userId, userData);
    }
    return false;
  }

  // Pi Browser storage methods
  private async storeInPiStorage(key: string, data: any): Promise<void> {
    if (typeof window.Pi !== 'undefined' && window.Pi.storage) {
      try {
        await window.Pi.storage.set(key, JSON.stringify(data));
      } catch (error) {
        console.warn('[PiStorage] Pi storage failed, falling back to localStorage:', error);
        this.storeInLocalStorage(key, data);
      }
    } else {
      throw new Error('Pi storage not available');
    }
  }

  private async getFromPiStorage(key: string): Promise<any> {
    if (typeof window.Pi !== 'undefined' && window.Pi.storage) {
      try {
        const data = await window.Pi.storage.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('[PiStorage] Pi storage retrieval failed, falling back to localStorage:', error);
        return this.getFromLocalStorage(key);
      }
    }
    return null;
  }

  // LocalStorage fallback methods
  private storeInLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[PiStorage] localStorage set failed:', error);
    }
  }

  private getFromLocalStorage(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[PiStorage] localStorage get failed:', error);
      return null;
    }
  }

  // Clear user data
  async clearUserData(userId: string): Promise<boolean> {
    try {
      const key = `${this.storagePrefix}user_${userId}`;
      
      if (this.usePiStorage && typeof window.Pi !== 'undefined') {
        await window.Pi.storage.remove(key);
      }
      
      localStorage.removeItem(key);
      console.log('[PiStorage] User data cleared:', userId);
      return true;
    } catch (error) {
      console.error('[PiStorage] Error clearing user data:', error);
      return false;
    }
  }

  // Get storage statistics
  getStorageStats(): { type: string; available: boolean; size?: number } {
    if (this.usePiStorage && typeof window.Pi !== 'undefined') {
      return { type: 'Pi Browser Storage', available: true };
    } else {
      return { 
        type: 'localStorage', 
        available: typeof localStorage !== 'undefined',
        size: typeof localStorage !== 'undefined' ? localStorage.length : 0
      };
    }
  }

  // Sync data between Pi storage and localStorage
  async syncData(userId: string): Promise<boolean> {
    try {
      const piData = await this.getFromPiStorage(`${this.storagePrefix}user_${userId}`);
      const localData = this.getFromLocalStorage(`${this.storagePrefix}user_${userId}`);

      if (piData && localData) {
        // Merge data, preferring Pi storage
        const mergedData = { ...localData, ...piData };
        await this.storeUserData(userId, mergedData);
        console.log('[PiStorage] Data synced between Pi storage and localStorage');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PiStorage] Error syncing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const piStorage = PiStorage.getInstance();

// Export convenience functions
export const storeUserData = (userId: string, data: Partial<PiUserData>) => 
  piStorage.storeUserData(userId, data);

export const getUserData = (userId: string) => 
  piStorage.getUserData(userId);

export const storeGameData = (userId: string, gameData: PiUserData['gameData']) => 
  piStorage.storeGameData(userId, gameData);

export const storeWalletData = (userId: string, walletData: PiUserData['wallet']) => 
  piStorage.storeWalletData(userId, walletData);

export const addTransaction = (userId: string, transaction: PiUserData['wallet']['transactions'][0]) => 
  piStorage.addTransaction(userId, transaction);

export const addAchievement = (userId: string, achievement: string) => 
  piStorage.addAchievement(userId, achievement);

export const unlockSkin = (userId: string, skinId: string) => 
  piStorage.unlockSkin(userId, skinId);

export const clearUserData = (userId: string) => 
  piStorage.clearUserData(userId);

export const getStorageStats = () => 
  piStorage.getStorageStats();

export const syncData = (userId: string) => 
  piStorage.syncData(userId); 