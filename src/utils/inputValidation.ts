
// Enhanced input validation utilities with security focus
export const InputValidation = {
  // Validate and sanitize user input
  sanitizeString: (input: string, maxLength: number = 100): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
      .trim()
      .substring(0, maxLength);
  },

  // Validate game session data
  validateGameSession: (data: {
    score: number;
    level: number;
    coins: number;
    duration?: number;
  }): boolean => {
    const { score, level, coins, duration } = data;
    
    // Basic range validation
    if (score < 0 || score > 1000) return false;
    if (level < 1 || level > 200) return false;
    if (coins < 0 || coins > 100) return false;
    
    // Duration-based validation
    if (duration && duration > 0) {
      // Max 2 points per second
      if (score > duration * 2) return false;
      // Max 10 coins per minute
      if (coins > (duration / 60) * 10) return false;
    }
    
    // Level should correlate with score
    if (level > Math.floor(score / 5) + 1) return false;
    
    return true;
  },

  // Validate payment data
  validatePaymentAmount: (amount: number, itemType: string): boolean => {
    const validAmounts: Record<string, number[]> = {
      'subscription': [15, 20],
      'skin': [2],
      'no-ads': [10],
      'all-skins': [15]
    };
    
    return validAmounts[itemType]?.includes(amount) || false;
  },

  // Validate user input for XSS prevention
  isValidUserInput: (input: string): boolean => {
    // Check for script tags and common XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    return !xssPatterns.some(pattern => pattern.test(input));
  },

  // Rate limiting validation
  checkRateLimit: (action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean => {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }
    
    const data = JSON.parse(stored);
    if (now > data.resetTime) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }
    
    if (data.count >= maxAttempts) {
      return false;
    }
    
    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }
};
