// Enhanced security service for Pi Network integration
class PiSecurityService {
  private readonly allowedOrigins = [
    'https://3908cb2c-2f7a-42c8-be92-d32fb30ceca5.lovableproject.com',
    '/',
    '/'
  ];

  validateRequest(origin: string): boolean {
    return this.allowedOrigins.includes(origin) || import.meta.env.MODE === 'development';
  }

  sanitizePaymentData(data: any): any {
    // Remove sensitive data and validate structure
    const sanitized = {
      amount: this.validateAmount(data.amount),
      memo: this.sanitizeString(data.memo),
      metadata: this.sanitizeMetadata(data.metadata)
    };
    
    return sanitized;
  }

  private validateAmount(amount: any): number {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000) {
      throw new Error('Invalid payment amount');
    }
    return numAmount;
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') return '';
    return str.slice(0, 200).replace(/[<>]/g, '');
  }

  private sanitizeMetadata(metadata: any): any {
    if (!metadata || typeof metadata !== 'object') return {};
    
    const sanitized: any = {};
    const allowedKeys = ['type', 'itemId', 'app_id', 'user_id', 'timestamp', 'environment'];
    
    for (const key of allowedKeys) {
      if (metadata[key] !== undefined) {
        sanitized[key] = this.sanitizeString(String(metadata[key]));
      }
    }
    
    return sanitized;
  }

  detectTokenExpiry(error: any): boolean {
    if (error?.message?.includes('token') && error?.message?.includes('expired')) {
      return true;
    }
    if (error?.status === 401) {
      return true;
    }
    return false;
  }

  logSecurityEvent(event: string, details: any): void {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      details: this.sanitizeMetadata(details),
      userAgent: navigator?.userAgent || 'unknown'
    };
    
    console.warn('[SECURITY]', logData);
    
    // In production, send to monitoring service
    if (import.meta.env.MODE === 'production') {
      // Send to external logging service
    }
  }
}

export const piSecurityService = new PiSecurityService();
