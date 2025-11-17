import { SecurityService } from './securityService';
import { SessionService } from './sessionService';
import { ScoreService } from './scoreService';
import { PiPaymentService } from './piPayment';
import { logger } from '../utils/logger';

export class GameInitService {
  private static instance: GameInitService;
  private readonly security: SecurityService;
  private readonly session: SessionService;
  private readonly score: ScoreService;
  private readonly payment: PiPaymentService;
  
  private constructor() {
    this.security = SecurityService.getInstance();
    this.session = SessionService.getInstance();
    this.score = ScoreService.getInstance();
    this.payment = PiPaymentService.getInstance();
  }
  
  public static getInstance(): GameInitService {
    if (!GameInitService.instance) {
      GameInitService.instance = new GameInitService();
    }
    return GameInitService.instance;
  }

  async initializeGame(): Promise<boolean> {
    try {
      // Perform security checks
      if (!this.security.performSecurityChecks()) {
        logger.warn('Security checks failed');
        return false;
      }

      // Initialize session
      const session = this.session.initSession();
      if (!session) {
        logger.error('Failed to initialize session');
        return false;
      }

      // Set up game event listeners
      this.setupEventListeners();

      logger.info('Game initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing game', { error });
      return false;
    }
  }

  private setupEventListeners(): void {
    // Update session on activity
    window.addEventListener('click', () => {
      this.session.updateSession();
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.session.updateSession();
      }
    });

    // Handle before unload
    window.addEventListener('beforeunload', () => {
      this.session.updateSession();
    });
  }

  async submitScore(score: number): Promise<boolean> {
    try {
      // Verify security and session
      if (!this.security.performSecurityChecks()) {
        return false;
      }

      // Submit score
      return await this.score.submitScore(score);
    } catch (error) {
      logger.error('Error submitting score', { error });
      return false;
    }
  }

  async processPayment(amount: number, memo: string): Promise<any> {
    try {
      // Verify security and session
      if (!this.security.performSecurityChecks()) {
        throw new Error('Security check failed');
      }

      // Process payment
      return await this.payment.createPayment(amount, memo);
    } catch (error) {
      logger.error('Error processing payment', { error });
      throw error;
    }
  }

  getHighScores(): any[] {
    try {
      return this.score.getHighScores();
    } catch (error) {
      logger.error('Error getting high scores', { error });
      return [];
    }
  }

  cleanup(): void {
    try {
      this.session.endSession();
      this.security.clearViolations();
      this.score.clearScores();
    } catch (error) {
      logger.error('Error during cleanup', { error });
    }
  }
} 