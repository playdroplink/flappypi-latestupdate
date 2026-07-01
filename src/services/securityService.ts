import { logger } from '../utils/logger';
import { generalRateLimiter } from '../utils/rateLimiter';

interface SecurityViolation {
  type: string;
  timestamp: number;
  details: string;
}

export class SecurityService {
  private static instance: SecurityService;
  private readonly VIOLATION_KEY = 'security_violations';
  private readonly MAX_VIOLATIONS = 5;
  private readonly VIOLATION_WINDOW = 60 * 60 * 1000; // 1 hour
  
  private constructor() {
    // Clean up old violations periodically
    setInterval(() => this.cleanupViolations(), 15 * 60 * 1000);
  }
  
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Check if the current origin is allowed
  checkOrigin(): boolean {
    const allowedOrigins = [
      'https://www.flappypi.xyz',
      'https://flappypi.xyz',
      '/',
      'https://localhost:5173'
    ];
    
    return allowedOrigins.includes(window.location.origin);
  }

  // Detect suspicious behavior
  detectSuspiciousActivity(): boolean {
    const violations = this.getViolations();
    return violations.length >= this.MAX_VIOLATIONS;
  }

  // Record a security violation
  recordViolation(type: string, details: string): void {
    if (generalRateLimiter.isRateLimited('record-violation')) {
      return; // Prevent violation log spam
    }

    const violation: SecurityViolation = {
      type,
      timestamp: Date.now(),
      details
    };

    const violations = this.getViolations();
    violations.push(violation);
    
    try {
      localStorage.setItem(this.VIOLATION_KEY, JSON.stringify(violations));
      logger.warn('Security violation recorded', { type, details });
    } catch (error) {
      logger.error('Error recording violation', { error });
    }
  }

  // Get recent violations
  private getViolations(): SecurityViolation[] {
    try {
      const stored = localStorage.getItem(this.VIOLATION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Error reading violations', { error });
      return [];
    }
  }

  // Clean up old violations
  private cleanupViolations(): void {
    const violations = this.getViolations();
    const now = Date.now();
    
    const recentViolations = violations.filter(
      v => now - v.timestamp < this.VIOLATION_WINDOW
    );
    
    if (recentViolations.length !== violations.length) {
      localStorage.setItem(this.VIOLATION_KEY, JSON.stringify(recentViolations));
      logger.info('Old violations cleaned up');
    }
  }

  // Implement security checks
  performSecurityChecks(): boolean {
    // Check origin
    if (!this.checkOrigin()) {
      this.recordViolation('invalid_origin', window.location.origin);
      return false;
    }

    // Check for suspicious activity
    if (this.detectSuspiciousActivity()) {
      logger.warn('Account restricted due to suspicious activity');
      return false;
    }

    // Check for DevTools (basic protection)
    if (window.outerWidth - window.innerWidth > 160) {
      this.recordViolation('devtools_open', 'Unusual window dimensions detected');
      return false;
    }

    return true;
  }

  // Clear security violations
  clearViolations(): void {
    localStorage.removeItem(this.VIOLATION_KEY);
    logger.info('Security violations cleared');
  }
} 