// Rate limiting utility for Socket.IO connections
class RateLimiter {
  constructor(config) {
    this.config = config;
    this.requests = new Map();
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.security.rateLimitWindow);
  }

  isAllowed(socketId, event = 'general') {
    if (!this.config.security.enableRateLimiting) {
      return true;
    }

    const now = Date.now();
    const key = `${socketId}:${event}`;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const requestTimes = this.requests.get(key);
    
    // Remove old requests outside the window
    const windowStart = now - this.config.security.rateLimitWindow;
    const recentRequests = requestTimes.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.config.security.rateLimitMaxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  getRemainingRequests(socketId, event = 'general') {
    const key = `${socketId}:${event}`;
    const requestTimes = this.requests.get(key) || [];
    const now = Date.now();
    const windowStart = now - this.config.security.rateLimitWindow;
    const recentRequests = requestTimes.filter(time => time > windowStart);
    
    return Math.max(0, this.config.security.rateLimitMaxRequests - recentRequests.length);
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.config.security.rateLimitWindow;
    
    for (const [key, requestTimes] of this.requests.entries()) {
      const recentRequests = requestTimes.filter(time => time > windowStart);
      
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

export default RateLimiter;
