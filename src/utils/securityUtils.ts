// Security utilities for client-side validation and sanitization

export const SecurityUtils = {
  // Validate game score
  isValidScore: (score: number): boolean => {
    return Number.isInteger(score) && score >= 0 && score <= 1000;
  },

  // Validate level
  isValidLevel: (level: number): boolean => {
    return Number.isInteger(level) && level >= 1 && level <= 200;
  },

  // Validate coins amount
  isValidCoinsAmount: (coins: number): boolean => {
    return Number.isInteger(coins) && coins >= 0 && coins <= 1000000;
  },

  // Validate session duration (in seconds)
  isValidSessionDuration: (duration: number): boolean => {
    return Number.isInteger(duration) && duration >= 1 && duration <= 7200; // Max 2 hours
  },

  // Sanitize string input
  sanitizeString: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>\"'&]/g, '').trim().substring(0, 100);
  },

  // Validate purchase amount
  isValidPurchaseAmount: (amount: number): boolean => {
    return Number.isInteger(amount) && amount >= 1 && amount <= 10000;
  },

  // Rate limiting for client-side actions
  rateLimiter: (() => {
    const limits = new Map<string, { count: number; resetTime: number }>();
    
    return {
      checkLimit: (action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean => {
        const now = Date.now();
        const key = action;
        const record = limits.get(key);
        
        if (!record || now > record.resetTime) {
          limits.set(key, { count: 1, resetTime: now + windowMs });
          return true;
        }
        
        if (record.count >= maxAttempts) {
          return false;
        }
        
        record.count++;
        return true;
      }
    };
  })(),

  // Environment-based logging
  secureLog: (message: string, data?: any): void => {
    // if (import.meta.env.MODE === 'development') {
    //   console.log(`[SECURE LOG] ${message}`, data);
    // }
  },

  // Secure error logging (no sensitive data)
  logError: (error: Error, context?: string): void => {
    // if (import.meta.env.MODE === 'development') {
    //   console.error(`[ERROR] ${context || 'Unknown'}: ${error.message}`);
    // }
  }
};
