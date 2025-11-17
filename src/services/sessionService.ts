import { logger } from '../utils/logger';

interface GameSession {
  sessionId: string;
  startTime: number;
  lastActive: number;
  gameVersion: string;
}

export class SessionService {
  private static instance: SessionService;
  private readonly SESSION_KEY = 'flappy_pi_session';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly GAME_VERSION = '1.0.0';
  
  private constructor() {
    // Start session cleanup interval
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }
  
  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // Generate a secure session ID
  private generateSessionId(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Create or resume session
  initSession(): GameSession {
    try {
      let session = this.getCurrentSession();
      
      if (!session || this.isSessionExpired(session)) {
        session = {
          sessionId: this.generateSessionId(),
          startTime: Date.now(),
          lastActive: Date.now(),
          gameVersion: this.GAME_VERSION
        };
        this.saveSession(session);
        logger.info('New session created', { sessionId: session.sessionId });
      } else {
        session.lastActive = Date.now();
        this.saveSession(session);
        logger.info('Session resumed', { sessionId: session.sessionId });
      }
      
      return session;
    } catch (error) {
      logger.error('Error initializing session', { error });
      throw new Error('Unable to initialize game session');
    }
  }

  // Update session activity
  updateSession(): void {
    const session = this.getCurrentSession();
    if (session && !this.isSessionExpired(session)) {
      session.lastActive = Date.now();
      this.saveSession(session);
    }
  }

  // Check if session is expired
  private isSessionExpired(session: GameSession): boolean {
    return Date.now() - session.lastActive > this.SESSION_TIMEOUT;
  }

  // Get current session
  private getCurrentSession(): GameSession | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      logger.error('Error reading session', { error });
      return null;
    }
  }

  // Save session
  private saveSession(session: GameSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      logger.error('Error saving session', { error });
      throw new Error('Unable to save game session');
    }
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(): void {
    const session = this.getCurrentSession();
    if (session && this.isSessionExpired(session)) {
      localStorage.removeItem(this.SESSION_KEY);
      logger.info('Expired session cleaned up', { sessionId: session.sessionId });
    }
  }

  // End session
  endSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    logger.info('Session ended');
  }
} 