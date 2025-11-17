// Pi Network Metadata Service
// Handles user metadata, game data, and Pi Network integration for mainnet

import { PI_CONFIG } from '../config/piConfig';

declare global {
  interface Window {
    Pi: any;
  }
}

export interface PiUserMetadata {
  uid: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  email?: string;
  phone?: string;
  country?: string;
  language?: string;
  timezone?: string;
  createdAt: string;
  lastLoginAt: string;
  isVerified: boolean;
  features: string[];
  preferences: {
    theme: 'light' | 'dark' | 'night';
    language: string;
    notifications: boolean;
    soundEnabled: boolean;
    musicEnabled: boolean;
  };
  gameData: {
    totalCoins: number;
    highScore: number;
    gamesPlayed: number;
    achievements: string[];
    unlockedBirds: string[];
    powerUps: string[];
    level: number;
    experience: number;
  };
  piNetworkData: {
    walletAddress?: string;
    balance?: number;
    transactions: any[];
    referrals: number;
    kycStatus: 'none' | 'pending' | 'verified';
  };
}

export interface GameSessionMetadata {
  sessionId: string;
  userId: string;
  gameMode: string;
  startTime: string;
  endTime?: string;
  score: number;
  coinsEarned: number;
  powerUpsUsed: string[];
  achievements: string[];
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    isMobile: boolean;
  };
  networkInfo: {
    connectionType: string;
    isPiBrowser: boolean;
    piNetworkVersion: string;
  };
}

class PiMetadataService {
  private static instance: PiMetadataService;
  private currentUser: PiUserMetadata | null = null;
  private currentSession: GameSessionMetadata | null = null;

  private constructor() {}

  static getInstance(): PiMetadataService {
    if (!PiMetadataService.instance) {
      PiMetadataService.instance = new PiMetadataService();
    }
    return PiMetadataService.instance;
  }

  /**
   * Initialize metadata service with Pi Network user data
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Initializing Pi Metadata Service...');

      if (!window.Pi) {
        console.warn('⚠️ Pi SDK not available');
        return false;
      }

      // Get current user from Pi SDK
      const piUser = await this.getPiUser();
      if (piUser) {
        await this.loadUserMetadata(piUser);
        console.log('✅ Pi Metadata Service initialized successfully');
        return true;
      }

      console.warn('⚠️ No Pi user found');
      return false;
    } catch (error) {
      console.error('❌ Failed to initialize Pi Metadata Service:', error);
      return false;
    }
  }

  /**
   * Get current Pi user from SDK
   */
  private async getPiUser(): Promise<any> {
    try {
      if (window.Pi.currentUser) {
        return await window.Pi.currentUser();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting Pi user:', error);
      return null;
    }
  }

  /**
   * Load user metadata from Pi Network and local storage
   */
  async loadUserMetadata(piUser: any): Promise<void> {
    try {
      console.log('📊 Loading user metadata for:', piUser.username);

      // Get stored metadata
      const storedMetadata = this.getStoredUserMetadata(piUser.uid);
      
      // Create or update user metadata
      this.currentUser = {
        uid: piUser.uid,
        username: piUser.username,
        displayName: piUser.displayName || piUser.username,
        profilePicture: piUser.profilePicture,
        email: piUser.email,
        phone: piUser.phone,
        country: piUser.country,
        language: piUser.language || 'en',
        timezone: piUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: piUser.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isVerified: piUser.isVerified || false,
        features: piUser.features || [],
        preferences: {
          theme: storedMetadata?.preferences?.theme || 'light',
          language: storedMetadata?.preferences?.language || 'en',
          notifications: storedMetadata?.preferences?.notifications ?? true,
          soundEnabled: storedMetadata?.preferences?.soundEnabled ?? true,
          musicEnabled: storedMetadata?.preferences?.musicEnabled ?? true,
        },
        gameData: {
          totalCoins: storedMetadata?.gameData?.totalCoins || 0,
          highScore: storedMetadata?.gameData?.highScore || 0,
          gamesPlayed: storedMetadata?.gameData?.gamesPlayed || 0,
          achievements: storedMetadata?.gameData?.achievements || [],
          unlockedBirds: storedMetadata?.gameData?.unlockedBirds || ['bird_0'],
          powerUps: storedMetadata?.gameData?.powerUps || [],
          level: storedMetadata?.gameData?.level || 1,
          experience: storedMetadata?.gameData?.experience || 0,
        },
        piNetworkData: {
          walletAddress: piUser.walletAddress,
          balance: piUser.balance || 0,
          transactions: piUser.transactions || [],
          referrals: piUser.referrals || 0,
          kycStatus: piUser.kycStatus || 'none',
        }
      };

      // Save updated metadata
      this.saveUserMetadata(this.currentUser);
      
      console.log('✅ User metadata loaded successfully');
    } catch (error) {
      console.error('❌ Error loading user metadata:', error);
    }
  }

  /**
   * Get stored user metadata from localStorage
   */
  private getStoredUserMetadata(uid: string): PiUserMetadata | null {
    try {
      const stored = localStorage.getItem(`flappypi-user-metadata-${uid}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('❌ Error getting stored user metadata:', error);
      return null;
    }
  }

  /**
   * Save user metadata to localStorage
   */
  private saveUserMetadata(metadata: PiUserMetadata): void {
    try {
      localStorage.setItem(`flappypi-user-metadata-${metadata.uid}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('❌ Error saving user metadata:', error);
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: Partial<PiUserMetadata['preferences']>): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
    this.saveUserMetadata(this.currentUser);
    
    console.log('✅ User preferences updated:', preferences);
  }

  /**
   * Update game data
   */
  async updateGameData(gameData: Partial<PiUserMetadata['gameData']>): Promise<void> {
    if (!this.currentUser) return;

    this.currentUser.gameData = { ...this.currentUser.gameData, ...gameData };
    this.saveUserMetadata(this.currentUser);
    
    console.log('✅ Game data updated:', gameData);
  }

  /**
   * Start a new game session
   */
  startGameSession(gameMode: string): GameSessionMetadata {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      sessionId,
      userId: this.currentUser?.uid || 'anonymous',
      gameMode,
      startTime: new Date().toISOString(),
      score: 0,
      coinsEarned: 0,
      powerUpsUsed: [],
      achievements: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      networkInfo: {
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        isPiBrowser: this.isPiBrowser(),
        piNetworkVersion: window.Pi?.version || 'unknown'
      }
    };

    console.log('🎮 Game session started:', this.currentSession.sessionId);
    return this.currentSession;
  }

  /**
   * End current game session
   */
  endGameSession(score: number, coinsEarned: number, achievements: string[] = []): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.score = score;
    this.currentSession.coinsEarned = coinsEarned;
    this.currentSession.achievements = achievements;

    // Update user game data
    if (this.currentUser) {
      this.updateGameData({
        totalCoins: this.currentUser.gameData.totalCoins + coinsEarned,
        highScore: Math.max(this.currentUser.gameData.highScore, score),
        gamesPlayed: this.currentUser.gameData.gamesPlayed + 1,
        achievements: [...new Set([...this.currentUser.gameData.achievements, ...achievements])],
        experience: this.currentUser.gameData.experience + Math.floor(score / 10)
      });
    }

    // Send session data to backend
    this.sendSessionData(this.currentSession);

    console.log('🎮 Game session ended:', {
      sessionId: this.currentSession.sessionId,
      score,
      coinsEarned,
      achievements
    });

    this.currentSession = null;
  }

  /**
   * Send session data to backend
   */
  private async sendSessionData(session: GameSessionMetadata): Promise<void> {
    try {
      const response = await fetch('/api/pi/game-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session,
          network: PI_CONFIG.getNetworkMode(),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Session data sent to backend successfully');
      } else {
        console.warn('⚠️ Failed to send session data to backend');
      }
    } catch (error) {
      console.warn('⚠️ Error sending session data to backend:', error);
    }
  }

  /**
   * Get current user metadata
   */
  getCurrentUser(): PiUserMetadata | null {
    return this.currentUser;
  }

  /**
   * Get current game session
   */
  getCurrentSession(): GameSessionMetadata | null {
    return this.currentSession;
  }

  /**
   * Check if we're in Pi Browser
   */
  private isPiBrowser(): boolean {
    const userAgent = navigator.userAgent;
    const hostname = window.location.hostname;
    
    return userAgent.includes('Pi Browser') || 
           userAgent.includes('PiNetwork') ||
           userAgent.includes('PiBrowser') ||
           hostname.includes('.pinet.com') ||
           hostname.includes('.minepi.com');
  }

  /**
   * Sync user data with Pi Network
   */
  async syncWithPiNetwork(): Promise<void> {
    try {
      if (!this.currentUser || !window.Pi) return;

      console.log('🔄 Syncing user data with Pi Network...');

      // Update last login time
      this.currentUser.lastLoginAt = new Date().toISOString();
      this.saveUserMetadata(this.currentUser);

      // Send user data to Pi Network (if supported)
      if (window.Pi.updateUserData) {
        await window.Pi.updateUserData({
          gameData: this.currentUser.gameData,
          preferences: this.currentUser.preferences
        });
      }

      console.log('✅ User data synced with Pi Network');
    } catch (error) {
      console.error('❌ Error syncing with Pi Network:', error);
    }
  }

  /**
   * Get user statistics
   */
  getUserStats(): any {
    if (!this.currentUser) return null;

    return {
      username: this.currentUser.username,
      level: this.currentUser.gameData.level,
      experience: this.currentUser.gameData.experience,
      totalCoins: this.currentUser.gameData.totalCoins,
      highScore: this.currentUser.gameData.highScore,
      gamesPlayed: this.currentUser.gameData.gamesPlayed,
      achievements: this.currentUser.gameData.achievements.length,
      unlockedBirds: this.currentUser.gameData.unlockedBirds.length,
      referrals: this.currentUser.piNetworkData.referrals,
      kycStatus: this.currentUser.piNetworkData.kycStatus,
      isVerified: this.currentUser.isVerified
    };
  }

  /**
   * Export user data (for GDPR compliance)
   */
  exportUserData(): string {
    if (!this.currentUser) return '';

    return JSON.stringify({
      user: this.currentUser,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Clear user data (for GDPR compliance)
   */
  clearUserData(): void {
    if (!this.currentUser) return;

    localStorage.removeItem(`flappypi-user-metadata-${this.currentUser.uid}`);
    this.currentUser = null;
    this.currentSession = null;
    
    console.log('🗑️ User data cleared');
  }
}

// Export singleton instance
export const piMetadataService = PiMetadataService.getInstance();
export default piMetadataService;
