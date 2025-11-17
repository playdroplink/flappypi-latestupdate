import { useCallback } from 'react';

interface GameAnalyticsData {
  score?: number;
  level?: number;
  coins?: number;
  gameMode?: string;
  theme?: string;
  powerUp?: string;
  sessionTime?: number;
  device?: 'mobile' | 'desktop';
}

// Safe conversion function to prevent toString errors
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  return String(value);
};

const safeNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  const parsed = Number(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const useAnalytics = () => {
  
  // Track game start
  const trackGameStart = useCallback((gameMode: string, device: 'mobile' | 'desktop') => {
    try {
      console.log('📊 Analytics: Game started', { gameMode, device });
    } catch (error) {
      console.error('📊 Analytics error (game_start):', error);
    }
  }, []);

  // Track game over
  const trackGameOver = useCallback((data: GameAnalyticsData) => {
    try {
      console.log('📊 Analytics: Game over', data);
    } catch (error) {
      console.error('📊 Analytics error (game_over):', error);
    }
  }, []);

  // Track level up
  const trackLevelUp = useCallback((level: number, theme: string, device: 'mobile' | 'desktop') => {
    try {
      console.log('📊 Analytics: Level up', { level, theme, device });
    } catch (error) {
      console.error('📊 Analytics error (level_up):', error);
    }
  }, []);

  // Track coin collection
  const trackCoinCollection = useCallback((coinValue: number, totalCoins: number, level: number) => {
    try {
      console.log('📊 Analytics: Coin collected', { coinValue, totalCoins, level });
    } catch (error) {
      console.error('📊 Analytics error (coin_collected):', error);
    }
  }, []);

  // Track power-up collection
  const trackPowerUpCollection = useCallback((powerUpType: string, level: number, device: 'mobile' | 'desktop') => {
    try {
      console.log('📊 Analytics: Power-up collected', { powerUpType, level, device });
    } catch (error) {
      console.error('📊 Analytics error (powerup_collected):', error);
    }
  }, []);

  // Track theme change
  const trackThemeChange = useCallback((fromTheme: string, toTheme: string, level: number) => {
    try {
      console.log('📊 Analytics: Theme changed', { fromTheme, toTheme, level });
    } catch (error) {
      console.error('📊 Analytics error (theme_change):', error);
    }
  }, []);

  // Track purchase attempts
  const trackPurchaseAttempt = useCallback((itemType: string, itemName: string, cost: number, currency: string) => {
    try {
      console.log('📊 Analytics: Purchase attempt', { itemType, itemName, cost, currency });
    } catch (error) {
      console.error('📊 Analytics error (purchase_attempt):', error);
    }
  }, []);

  // Track purchase success
  const trackPurchaseSuccess = useCallback((itemType: string, itemName: string, cost: number, currency: string) => {
    try {
      console.log('📊 Analytics: Purchase success', { itemType, itemName, cost, currency });
    } catch (error) {
      console.error('📊 Analytics error (purchase_success):', error);
    }
  }, []);

  // Track user session
  const trackSessionStart = useCallback((device: 'mobile' | 'desktop', userId?: string) => {
    try {
      console.log('📊 Analytics: Session started', { device, userId });
    } catch (error) {
      console.error('📊 Analytics error (session_start):', error);
    }
  }, []);

  // Track performance metrics
  const trackPerformance = useCallback((fps: number, device: 'mobile' | 'desktop', level: number) => {
    try {
      // Only track performance issues
      if (safeNumber(fps) < 30) {
        console.log('📊 Analytics: Performance issue', { fps, device, level });
      }
    } catch (error) {
      console.error('📊 Analytics error (performance_issue):', error);
    }
  }, []);

  // Track audio unlock (important for mobile)
  const trackAudioUnlock = useCallback((device: 'mobile' | 'desktop', method: string) => {
    try {
      console.log('📊 Analytics: Audio unlocked', { device, method });
    } catch (error) {
      console.error('📊 Analytics error (audio_unlock):', error);
    }
  }, []);

  // Track revive attempts
  const trackReviveAttempt = useCallback((method: 'ad' | 'pi', success: boolean, score: number) => {
    try {
      console.log('📊 Analytics: Revive attempt', { method, success, score });
    } catch (error) {
      console.error('📊 Analytics error (revive_attempt):', error);
    }
  }, []);

  // Track navigation
  const trackNavigation = useCallback((from: string, to: string, device: 'mobile' | 'desktop') => {
    try {
      console.log('📊 Analytics: Navigation', { from, to, device });
    } catch (error) {
      console.error('📊 Analytics error (navigation):', error);
    }
  }, []);

  return {
    trackGameStart,
    trackGameOver,
    trackLevelUp,
    trackCoinCollection,
    trackPowerUpCollection,
    trackThemeChange,
    trackPurchaseAttempt,
    trackPurchaseSuccess,
    trackSessionStart,
    trackPerformance,
    trackAudioUnlock,
    trackReviveAttempt,
    trackNavigation
  };
};
