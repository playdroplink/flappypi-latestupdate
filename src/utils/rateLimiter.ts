interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry>;
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 100, timeWindowInSeconds: number = 60) {
    this.limits = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowInSeconds * 1000;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, { count: 1, firstRequest: now });
      return false;
    }

    if (now - entry.firstRequest > this.timeWindow) {
      // Reset if time window has passed
      this.limits.set(key, { count: 1, firstRequest: now });
      return false;
    }

    if (entry.count >= this.maxRequests) {
      return true;
    }

    entry.count++;
    return false;
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.firstRequest > this.timeWindow) {
        this.limits.delete(key);
      }
    }
  }
}

// Create rate limiter instances for different actions
export const paymentRateLimiter = new RateLimiter(10, 60); // 10 requests per minute
export const scoreSubmissionLimiter = new RateLimiter(30, 60); // 30 requests per minute
export const generalRateLimiter = new RateLimiter(100, 60); // 100 requests per minute

// Clean up old entries every 5 minutes
setInterval(() => {
  paymentRateLimiter.cleanup();
  scoreSubmissionLimiter.cleanup();
  generalRateLimiter.cleanup();
}, 5 * 60 * 1000); 