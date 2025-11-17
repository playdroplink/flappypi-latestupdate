import { piBrowserRedirect } from '@/utils/piBrowserRedirect';

interface AnalyticsEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

interface AnalyticsSession {
  id: string;
  startTime: string;
  lastActivity: string;
  events: AnalyticsEvent[];
}

class AnalyticsService {
  private sessionId: string;
  private session: AnalyticsSession;
  private isInitialized: boolean = false;
  private isDevelopment: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    this.session = {
      id: this.sessionId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      events: []
    };

    this.initialize();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // Only initialize Google Analytics in production
      if (!this.isDevelopment && typeof window !== 'undefined' && window.gtag) {
        console.log('📊 Google Analytics initialized');
      } else if (this.isDevelopment) {
        console.log('📊 Google Analytics disabled in development mode');
      }

      // Track session start
      this.trackEvent('session_start', {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      });

      this.isInitialized = true;
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }

  trackEvent(type: string, data: any = {}): void {
    try {
      const event: AnalyticsEvent = {
        type,
        data,
        timestamp: new Date().toISOString(),
        userId: this.getUserId()
      };

      // Add to session
      this.session.events.push(event);
      this.session.lastActivity = new Date().toISOString();

      // Send to Google Analytics (only in production)
      if (!this.isDevelopment) {
        this.sendToGoogleAnalytics(type, data);
      }

      // Log to backend
      this.logToBackend(type, data);

      // Console log in development
      if (this.isDevelopment) {
        console.log('📊 Analytics Event:', { type, data });
      }

    } catch (error) {
      console.warn('Failed to track analytics event:', error);
    }
  }

  private getUserId(): string | undefined {
    try {
      // Try to get user ID from localStorage or auth context
      const savedUser = localStorage.getItem('flappypi-user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.uid || user.id || user.username;
      }
    } catch (error) {
      console.warn('Failed to get user ID for analytics:', error);
    }
    return undefined;
  }

  private sendToGoogleAnalytics(type: string, data: any): void {
    try {
      // Only send to Google Analytics if gtag is available and not in development
      if (typeof window !== 'undefined' && window.gtag && !this.isDevelopment) {
        window.gtag('event', type, {
          event_category: 'flappy_pi',
          event_label: data.label || type,
          value: data.value || 1,
          custom_parameters: data
        });
      }
    } catch (error) {
      // Silently handle Google Analytics errors to prevent CORS issues
      console.debug('Google Analytics event failed (this is normal in development):', error);
    }
  }

  // Log events to backend for custom analytics
  private async logToBackend(eventType: string, data: any): Promise<void> {
    // Skip backend logging in development or if offline
    if (this.isDevelopment || !navigator.onLine) {
      return;
    }

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://fwfefplvruawsbspwpxh.supabase.co/functions/v1/analytics-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          url: window.location.href
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.debug('Analytics backend response not ok:', response.status);
      }
    } catch (error) {
      // Silently handle analytics backend errors to prevent console spam
      if (error.name !== 'AbortError') {
        console.debug('Analytics backend logging failed:', error.message);
      }
    }
  }

  // Track user retention
  trackRetention(): void {
    const lastVisit = localStorage.getItem('flappypi-last-visit');
    const currentTime = new Date().toISOString();
    
    if (lastVisit) {
      const daysSinceLastVisit = Math.floor(
        (new Date(currentTime).getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      this.trackEvent('user_retention', {
        daysSinceLastVisit,
        isReturningUser: true
      });
    } else {
      this.trackEvent('user_retention', {
        isNewUser: true
      });
    }
    
    localStorage.setItem('flappypi-last-visit', currentTime);
  }

  // Track game events
  trackGameEvent(event: string, gameData: any = {}): void {
    this.trackEvent(`game_${event}`, {
      ...gameData,
      gameMode: gameData.gameMode || 'unknown',
      score: gameData.score || 0,
      coins: gameData.coins || 0
    });
  }

  // Track payment events
  trackPaymentEvent(event: string, paymentData: any = {}): void {
    this.trackEvent(`payment_${event}`, {
      ...paymentData,
      amount: paymentData.amount || 0,
      currency: paymentData.currency || 'pi',
      success: paymentData.success || false
    });
  }

  // Track ad events
  trackAdEvent(event: string, adData: any = {}): void {
    this.trackEvent(`ad_${event}`, {
      ...adData,
      adType: adData.adType || 'unknown',
      reward: adData.reward || 0
    });
  }

  // Get analytics summary
  getAnalyticsSummary(): any {
    return {
      sessionId: this.sessionId,
      sessionStart: this.session.startTime,
      lastActivity: this.session.lastActivity,
      totalEvents: this.session.events.length,
      eventTypes: this.session.events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Export session data
  exportSessionData(): AnalyticsSession {
    return { ...this.session };
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).analyticsService = analyticsService;
}
