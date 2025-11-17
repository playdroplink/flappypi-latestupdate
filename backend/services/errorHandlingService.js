/**
 * Error Handling and Fallback Service for Flappy Pi Cloud Storage
 * Provides comprehensive error handling, retry logic, and offline fallbacks
 */

import cloudStorageService from './cloudStorageService.js';

class ErrorHandlingService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.circuitBreakerThreshold = 5; // failures before circuit opens
    this.circuitBreakerTimeout = 30000; // 30 seconds
    this.failureCount = new Map();
    this.circuitBreakers = new Map();
    this.offlineMode = false;
  }

  // ===========================================
  // RETRY MECHANISM
  // ===========================================

  /**
   * Execute operation with retry logic
   */
  async withRetry(operation, options = {}) {
    const {
      maxAttempts = this.retryAttempts,
      delay = this.retryDelay,
      backoff = true,
      onRetry = () => {},
      shouldRetry = this.shouldRetryError.bind(this)
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Reset failure count on success
        if (lastError) {
          this.resetFailureCount(operation.name || 'operation');
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        console.warn(`❌ Attempt ${attempt}/${maxAttempts} failed:`, error.message);
        
        // Check if we should retry
        if (attempt === maxAttempts || !shouldRetry(error)) {
          this.recordFailure(operation.name || 'operation', error);
          throw error;
        }
        
        // Calculate delay with optional backoff
        const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        
        // Call retry callback
        onRetry(error, attempt, currentDelay);
        
        // Wait before retry
        await this.sleep(currentDelay);
      }
    }
    
    throw lastError;
  }

  /**
   * Determine if error is retryable
   */
  shouldRetryError(error) {
    // Network errors - retry
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // HTTP status codes that are retryable
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    if (error.status && retryableStatusCodes.includes(error.status)) {
      return true;
    }
    
    // Supabase specific errors
    if (error.message && error.message.includes('connection')) {
      return true;
    }
    
    // Rate limiting
    if (error.message && error.message.includes('rate limit')) {
      return true;
    }
    
    return false;
  }

  // ===========================================
  // CIRCUIT BREAKER PATTERN
  // ===========================================

  /**
   * Execute operation with circuit breaker
   */
  async withCircuitBreaker(operationName, operation) {
    const breaker = this.getCircuitBreaker(operationName);
    
    // Check if circuit is open
    if (breaker.state === 'open') {
      if (Date.now() - breaker.lastFailureTime < this.circuitBreakerTimeout) {
        throw new Error(`Circuit breaker is open for ${operationName}`);
      } else {
        // Half-open state - try one request
        breaker.state = 'half-open';
      }
    }
    
    try {
      const result = await operation();
      
      // Success - close circuit
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failures = 0;
        console.log(`✅ Circuit breaker closed for ${operationName}`);
      }
      
      return result;
    } catch (error) {
      // Failure - increment counter
      breaker.failures++;
      breaker.lastFailureTime = Date.now();
      
      // Open circuit if threshold reached
      if (breaker.failures >= this.circuitBreakerThreshold) {
        breaker.state = 'open';
        console.warn(`🔴 Circuit breaker opened for ${operationName} after ${breaker.failures} failures`);
      }
      
      throw error;
    }
  }

  /**
   * Get or create circuit breaker for operation
   */
  getCircuitBreaker(operationName) {
    if (!this.circuitBreakers.has(operationName)) {
      this.circuitBreakers.set(operationName, {
        state: 'closed', // closed, open, half-open
        failures: 0,
        lastFailureTime: 0
      });
    }
    return this.circuitBreakers.get(operationName);
  }

  // ===========================================
  // GRACEFUL DEGRADATION
  // ===========================================

  /**
   * Execute operation with fallback to localStorage
   */
  async withLocalStorageFallback(operation, fallbackOperation, operationName) {
    try {
      return await this.withCircuitBreaker(operationName, operation);
    } catch (error) {
      console.warn(`⚠️ ${operationName} failed, falling back to localStorage:`, error.message);
      
      // Set offline mode temporarily
      const wasOffline = this.offlineMode;
      this.offlineMode = true;
      
      try {
        const fallbackResult = await fallbackOperation();
        
        // Queue for sync when online
        this.queueForSync(operationName, fallbackResult);
        
        return {
          ...fallbackResult,
          fromFallback: true,
          offline: true,
          warning: 'Data saved locally, will sync when connection is restored'
        };
      } finally {
        this.offlineMode = wasOffline;
      }
    }
  }

  /**
   * Safe cloud operation with comprehensive error handling
   */
  async safeCloudOperation(operationName, cloudOperation, fallbackOperation = null) {
    const operation = async () => {
      return await this.withRetry(cloudOperation, {
        onRetry: (error, attempt, delay) => {
          console.log(`🔄 Retrying ${operationName} (attempt ${attempt}) in ${delay}ms`);
        }
      });
    };

    if (fallbackOperation) {
      return await this.withLocalStorageFallback(operation, fallbackOperation, operationName);
    } else {
      return await this.withCircuitBreaker(operationName, operation);
    }
  }

  // ===========================================
  // OFFLINE SUPPORT
  // ===========================================

  /**
   * Queue operation for later sync
   */
  queueForSync(operationName, data) {
    try {
      const syncQueue = JSON.parse(localStorage.getItem('flappypi-sync-queue') || '[]');
      
      syncQueue.push({
        operation: operationName,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0
      });

      // Limit queue size
      if (syncQueue.length > 100) {
        syncQueue.splice(0, syncQueue.length - 100);
      }

      localStorage.setItem('flappypi-sync-queue', JSON.stringify(syncQueue));
      console.log(`📋 Queued ${operationName} for sync (queue size: ${syncQueue.length})`);
    } catch (error) {
      console.error('❌ Failed to queue operation for sync:', error);
    }
  }

  /**
   * Process sync queue when online
   */
  async processSyncQueue() {
    try {
      const syncQueue = JSON.parse(localStorage.getItem('flappypi-sync-queue') || '[]');
      
      if (syncQueue.length === 0) {
        return { success: true, processed: 0 };
      }

      console.log(`🔄 Processing sync queue (${syncQueue.length} items)`);
      
      let processed = 0;
      let failed = 0;
      const remainingQueue = [];

      for (const queueItem of syncQueue) {
        try {
          await this.processSyncItem(queueItem);
          processed++;
        } catch (error) {
          queueItem.retryCount++;
          
          // Retry up to 3 times, then discard
          if (queueItem.retryCount < 3) {
            remainingQueue.push(queueItem);
          } else {
            console.warn(`⚠️ Discarding sync item after 3 retries:`, queueItem.operation);
          }
          
          failed++;
        }
      }

      // Update queue with remaining items
      localStorage.setItem('flappypi-sync-queue', JSON.stringify(remainingQueue));

      console.log(`✅ Sync queue processed: ${processed} success, ${failed} failed, ${remainingQueue.length} remaining`);
      
      return { 
        success: true, 
        processed, 
        failed, 
        remaining: remainingQueue.length 
      };

    } catch (error) {
      console.error('❌ Error processing sync queue:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process individual sync queue item
   */
  async processSyncItem(queueItem) {
    const { operation, data } = queueItem;

    switch (operation) {
      case 'syncInventoryToCloud':
        await cloudStorageService.syncInventoryToCloud(data.piUserId, data.items);
        break;
        
      case 'recordGameSession':
        await cloudStorageService.recordGameSession(data.piUserId, data.sessionData);
        break;
        
      case 'updateUserStats':
        await cloudStorageService.updateUserStats(data.piUserId, data.stats);
        break;
        
      case 'recordPayment':
        await cloudStorageService.recordPayment(data.paymentData);
        break;
        
      default:
        console.warn(`⚠️ Unknown sync operation: ${operation}`);
    }
  }

  // ===========================================
  // ERROR TRACKING
  // ===========================================

  /**
   * Record operation failure
   */
  recordFailure(operationName, error) {
    const failures = this.failureCount.get(operationName) || [];
    failures.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });

    // Keep only last 10 failures
    if (failures.length > 10) {
      failures.splice(0, failures.length - 10);
    }

    this.failureCount.set(operationName, failures);
  }

  /**
   * Reset failure count for operation
   */
  resetFailureCount(operationName) {
    this.failureCount.delete(operationName);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalOperations: this.failureCount.size,
      circuitBreakers: {},
      recentFailures: {},
      offlineMode: this.offlineMode,
      syncQueueSize: 0
    };

    // Circuit breaker status
    for (const [name, breaker] of this.circuitBreakers) {
      stats.circuitBreakers[name] = {
        state: breaker.state,
        failures: breaker.failures,
        lastFailure: breaker.lastFailureTime
      };
    }

    // Recent failures
    for (const [operation, failures] of this.failureCount) {
      stats.recentFailures[operation] = failures.length;
    }

    // Sync queue size
    try {
      const syncQueue = JSON.parse(localStorage.getItem('flappypi-sync-queue') || '[]');
      stats.syncQueueSize = syncQueue.length;
    } catch (error) {
      stats.syncQueueSize = -1; // Error reading queue
    }

    return stats;
  }

  // ===========================================
  // NETWORK MONITORING
  // ===========================================

  /**
   * Monitor network connectivity
   */
  startNetworkMonitoring() {
    // Browser API monitoring
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
      
      // Initial state
      this.offlineMode = !navigator.onLine;
    }

    // Periodic connectivity check
    setInterval(() => {
      this.checkConnectivity();
    }, 60000); // Check every minute
  }

  /**
   * Handle coming back online
   */
  async handleOnline() {
    console.log('🌐 Connection restored, processing sync queue...');
    this.offlineMode = false;
    
    try {
      await this.processSyncQueue();
    } catch (error) {
      console.error('❌ Error processing sync queue on reconnect:', error);
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('📴 Connection lost, enabling offline mode');
    this.offlineMode = true;
  }

  /**
   * Check connectivity by pinging cloud service
   */
  async checkConnectivity() {
    try {
      const result = await cloudStorageService.healthCheck();
      
      if (result.status === 'healthy' && this.offlineMode) {
        this.handleOnline();
      } else if (result.status !== 'healthy' && !this.offlineMode) {
        this.handleOffline();
      }
    } catch (error) {
      if (!this.offlineMode) {
        this.handleOffline();
      }
    }
  }

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create safe wrapper for any async function
   */
  makeSafe(fn, operationName, fallbackFn = null) {
    return async (...args) => {
      return this.safeCloudOperation(
        operationName,
        () => fn(...args),
        fallbackFn ? () => fallbackFn(...args) : null
      );
    };
  }

  /**
   * Validate cloud service availability
   */
  async validateCloudService() {
    try {
      const result = await cloudStorageService.healthCheck();
      
      return {
        available: result.status === 'healthy',
        status: result.status,
        timestamp: result.timestamp,
        database: result.database
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get service health report
   */
  async getHealthReport() {
    const cloudHealth = await this.validateCloudService();
    const errorStats = this.getErrorStats();

    return {
      timestamp: new Date().toISOString(),
      cloudService: cloudHealth,
      errorHandling: errorStats,
      offlineSupport: {
        enabled: true,
        currentMode: this.offlineMode ? 'offline' : 'online',
        syncQueueSize: errorStats.syncQueueSize
      },
      circuitBreakers: Object.keys(errorStats.circuitBreakers).length,
      recommendations: this.generateRecommendations(cloudHealth, errorStats)
    };
  }

  /**
   * Generate recommendations based on current state
   */
  generateRecommendations(cloudHealth, errorStats) {
    const recommendations = [];

    if (!cloudHealth.available) {
      recommendations.push('Cloud service is unavailable - operating in offline mode');
    }

    if (errorStats.syncQueueSize > 50) {
      recommendations.push('Large sync queue detected - check network connectivity');
    }

    const openCircuits = Object.values(errorStats.circuitBreakers)
      .filter(cb => cb.state === 'open').length;
    
    if (openCircuits > 0) {
      recommendations.push(`${openCircuits} circuit breaker(s) open - some operations may fail fast`);
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems operating normally');
    }

    return recommendations;
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService();
export default errorHandlingService;