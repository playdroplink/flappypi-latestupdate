/**
 * Anti-Cheat System for Flappy Pi
 * Validates scores, tracks session data, and prevents cheating
 */

export interface SessionData {
  sessionId: string;
  startTime: number;
  lastActionTime: number;
  actionCount: number;
  scoreHistory: number[];
  deviceFingerprint: string;
  piUserId?: string;
}

export interface ScoreValidation {
  isValid: boolean;
  reason?: string;
  suspiciousLevel: 'low' | 'medium' | 'high';
  sessionData: SessionData;
}

class AntiCheatSystem {
  private sessionData: SessionData;
  private maxScore = 1000000; // Maximum possible score
  private maxActionsPerSecond = 20; // Maximum actions per second
  private minSessionTime = 2000; // Minimum session time in ms
  private scoreHistory: number[] = [];
  private actionTimestamps: number[] = [];

  constructor() {
    this.sessionData = this.initializeSession();
    this.startSessionMonitoring();
  }

  /**
   * Initialize new session data
   */
  private initializeSession(): SessionData {
    const sessionId = this.generateSessionId();
    const deviceFingerprint = this.generateDeviceFingerprint();

    return {
      sessionId,
      startTime: Date.now(),
      lastActionTime: Date.now(),
      actionCount: 0,
      scoreHistory: [],
      deviceFingerprint,
      piUserId: undefined
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Flappy Pi Anti-Cheat', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substr(0, 32);
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring() {
    // Monitor for suspicious activity every 5 seconds
    setInterval(() => {
      this.checkForSuspiciousActivity();
    }, 5000);
  }

  /**
   * Record player action
   */
  recordAction(actionType: 'flap' | 'jump' | 'click'): void {
    const now = Date.now();
    
    this.sessionData.actionCount++;
    this.sessionData.lastActionTime = now;
    
    this.actionTimestamps.push(now);
    
    // Keep only last 100 actions for rate limiting
    if (this.actionTimestamps.length > 100) {
      this.actionTimestamps.shift();
    }
  }

  /**
   * Validate score submission
   */
  validateScore(score: number, gameTime: number): ScoreValidation {
    const suspiciousLevel = this.calculateSuspiciousLevel(score, gameTime);
    const isValid = this.performScoreValidation(score, gameTime);
    
    // Add score to history
    this.scoreHistory.push(score);
    this.sessionData.scoreHistory.push(score);
    
    // Keep only last 10 scores
    if (this.scoreHistory.length > 10) {
      this.scoreHistory.shift();
    }
    if (this.sessionData.scoreHistory.length > 10) {
      this.sessionData.scoreHistory.shift();
    }

    return {
      isValid,
      reason: isValid ? undefined : this.getValidationFailureReason(score, gameTime),
      suspiciousLevel,
      sessionData: { ...this.sessionData }
    };
  }

  /**
   * Perform comprehensive score validation
   */
  private performScoreValidation(score: number, gameTime: number): boolean {
    // Basic score range check
    if (score < 0 || score > this.maxScore) {
      return false;
    }

    // Session time validation
    const sessionTime = Date.now() - this.sessionData.startTime;
    if (sessionTime < this.minSessionTime) {
      return false;
    }

    // Rate limiting check
    if (this.isRateLimitExceeded()) {
      return false;
    }

    // Score progression check
    if (!this.isScoreProgressionValid(score)) {
      return false;
    }

    // Game time vs score correlation
    if (!this.isScoreTimeCorrelationValid(score, gameTime)) {
      return false;
    }

    return true;
  }

  /**
   * Check if rate limit is exceeded
   */
  private isRateLimitExceeded(): boolean {
    const now = Date.now();
    const recentActions = this.actionTimestamps.filter(
      timestamp => now - timestamp < 1000
    );
    
    return recentActions.length > this.maxActionsPerSecond;
  }

  /**
   * Validate score progression
   */
  private isScoreProgressionValid(newScore: number): boolean {
    if (this.scoreHistory.length === 0) return true;
    
    const lastScore = this.scoreHistory[this.scoreHistory.length - 1];
    
    // Score should not decrease (unless it's a new game)
    if (newScore < lastScore && newScore > 0) {
      return false;
    }
    
    // Check for unrealistic score jumps
    const scoreJump = newScore - lastScore;
    if (scoreJump > 1000 && newScore > 100) {
      return false;
    }
    
    return true;
  }

  /**
   * Validate score vs game time correlation
   */
  private isScoreTimeCorrelationValid(score: number, gameTime: number): boolean {
    // Basic correlation: higher scores should take more time
    if (score > 100 && gameTime < 5000) {
      return false;
    }
    
    if (score > 1000 && gameTime < 30000) {
      return false;
    }
    
    // Score per second should be reasonable
    const scorePerSecond = score / (gameTime / 1000);
    if (scorePerSecond > 50) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate suspicious level
   */
  private calculateSuspiciousLevel(score: number, gameTime: number): 'low' | 'medium' | 'high' {
    let suspiciousPoints = 0;
    
    // High score in short time
    if (score > 500 && gameTime < 10000) suspiciousPoints += 2;
    if (score > 1000 && gameTime < 30000) suspiciousPoints += 3;
    
    // Unusual score progression
    if (this.scoreHistory.length > 0) {
      const lastScore = this.scoreHistory[this.scoreHistory.length - 1];
      const scoreJump = score - lastScore;
      if (scoreJump > 500) suspiciousPoints += 2;
    }
    
    // High action rate
    const recentActions = this.actionTimestamps.filter(
      timestamp => Date.now() - timestamp < 1000
    );
    if (recentActions.length > 15) suspiciousPoints += 1;
    
    if (suspiciousPoints >= 4) return 'high';
    if (suspiciousPoints >= 2) return 'medium';
    return 'low';
  }

  /**
   * Get validation failure reason
   */
  private getValidationFailureReason(score: number, gameTime: number): string {
    if (score < 0 || score > this.maxScore) {
      return 'Invalid score range';
    }
    
    const sessionTime = Date.now() - this.sessionData.startTime;
    if (sessionTime < this.minSessionTime) {
      return 'Session too short';
    }
    
    if (this.isRateLimitExceeded()) {
      return 'Rate limit exceeded';
    }
    
    if (!this.isScoreProgressionValid(score)) {
      return 'Invalid score progression';
    }
    
    if (!this.isScoreTimeCorrelationValid(score, gameTime)) {
      return 'Score-time correlation invalid';
    }
    
    return 'Unknown validation failure';
  }

  /**
   * Check for suspicious activity
   */
  private checkForSuspiciousActivity(): void {
    const now = Date.now();
    const sessionTime = now - this.sessionData.startTime;
    
    // Check for extremely long sessions
    if (sessionTime > 3600000) { // 1 hour
      console.warn('⚠️ Suspicious: Very long session detected');
    }
    
    // Check for rapid action sequences
    const recentActions = this.actionTimestamps.filter(
      timestamp => now - timestamp < 1000
    );
    if (recentActions.length > 25) {
      console.warn('⚠️ Suspicious: High action rate detected');
    }
  }

  /**
   * Set Pi Network user ID for additional validation
   */
  setPiUserId(userId: string): void {
    this.sessionData.piUserId = userId;
  }

  /**
   * Get session data for server validation
   */
  getSessionData(): SessionData {
    return { ...this.sessionData };
  }

  /**
   * Generate hash for server validation
   */
  generateValidationHash(score: number, gameTime: number): string {
    const data = {
      score,
      gameTime,
      sessionId: this.sessionData.sessionId,
      deviceFingerprint: this.sessionData.deviceFingerprint,
      timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(data));
  }

  /**
   * Reset session (for new game)
   */
  resetSession(): void {
    this.sessionData = this.initializeSession();
    this.scoreHistory = [];
    this.actionTimestamps = [];
  }
}

// Export singleton instance
export const antiCheat = new AntiCheatSystem();
export default antiCheat; 