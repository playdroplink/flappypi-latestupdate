/**
 * Cloud Storage API Routes for Flappy Pi Backend
 * RESTful endpoints for all cloud storage operations
 */

const express = require('express');
const router = express.Router();

// Middleware for request validation
const validatePiUserId = (req, res, next) => {
  const piUserId = req.params.piUserId || req.body.pi_user_id;
  if (!piUserId) {
    return res.status(400).json({
      success: false,
      error: 'pi_user_id is required'
    });
  }
  req.piUserId = piUserId;
  next();
};

// Async wrapper to handle async route errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Dynamic import helper for ES modules
let cloudStorageService;

// Initialize cloud storage service
const initializeCloudService = async () => {
  try {
    const { default: service } = await import('../services/cloudStorageService.js');
    cloudStorageService = service;
    console.log('✅ Cloud storage service loaded');
  } catch (error) {
    console.error('❌ Failed to load cloud storage service:', error);
  }
};

// Initialize on module load
initializeCloudService();

// ===========================================
// HEALTH CHECK ENDPOINTS
// ===========================================

/**
 * GET /api/cloud/health
 * Health check for cloud storage service
 */
router.get('/health', asyncHandler(async (req, res) => {
  try {
    if (!cloudStorageService) {
      return res.status(503).json({
        status: 'loading',
        message: 'Cloud storage service initializing',
        timestamp: new Date().toISOString()
      });
    }

    const result = await cloudStorageService.healthCheck();
    
    const statusCode = result.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// ===========================================
// USER PROFILE ENDPOINTS
// ===========================================

/**
 * GET /api/cloud/user/:piUserId/profile
 * Get user profile
 */
router.get('/user/:piUserId/profile', validatePiUserId, asyncHandler(async (req, res) => {
  if (!cloudStorageService) {
    return res.status(503).json({ success: false, error: 'Cloud storage service not available' });
  }

  const result = await cloudStorageService.getUserProfile(req.piUserId);
  
  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    profile: result.data
  });
}));

/**
 * PUT /api/cloud/user/:piUserId/profile
 * Update user profile
 */
router.put('/user/:piUserId/profile', validatePiUserId, asyncHandler(async (req, res) => {
  if (!cloudStorageService) {
    return res.status(503).json({ success: false, error: 'Cloud storage service not available' });
  }

  const userData = req.body;
  const result = await cloudStorageService.upsertUserProfile(req.piUserId, userData);
  
  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    profile: result.data
  });
}));

// ===========================================
// INVENTORY ENDPOINTS
// ===========================================

/**
 * GET /api/cloud/user/:piUserId/inventory
 * Load user inventory from cloud
 */
router.get('/user/:piUserId/inventory', validatePiUserId, asyncHandler(async (req, res) => {
  if (!cloudStorageService) {
    return res.status(503).json({ success: false, error: 'Cloud storage service not available' });
  }

  const result = await cloudStorageService.loadInventoryFromCloud(req.piUserId);
  
  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    inventory: result.items,
    lastSyncTime: result.lastSyncTime,
    isNew: result.isNew
  });
}));

/**
 * POST /api/cloud/user/:piUserId/inventory/sync
 * Sync entire inventory to cloud
 */
router.post('/user/:piUserId/inventory/sync', validatePiUserId, asyncHandler(async (req, res) => {
  if (!cloudStorageService) {
    return res.status(503).json({ success: false, error: 'Cloud storage service not available' });
  }

  const { items } = req.body;
  
  if (!Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      error: 'items must be an array'
    });
  }

  const result = await cloudStorageService.syncInventoryToCloud(req.piUserId, items);
  
  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    itemCount: result.itemCount,
    lastSyncTime: result.data?.last_sync_time
  });
}));

// ===========================================
// PAYMENT ENDPOINTS
// ===========================================

/**
 * POST /api/cloud/payments/record
 * Record a payment transaction
 */
router.post('/payments/record', asyncHandler(async (req, res) => {
  if (!cloudStorageService) {
    return res.status(503).json({ success: false, error: 'Cloud storage service not available' });
  }

  const paymentData = req.body;
  
  if (!paymentData.payment_id || !paymentData.pi_user_id || !paymentData.amount) {
    return res.status(400).json({
      success: false,
      error: 'payment_id, pi_user_id, and amount are required'
    });
  }

  const result = await cloudStorageService.recordPayment(paymentData);
  
  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    payment: result.data
  });
}));

/**
 * GET /api/cloud/user/:piUserId/payments
 * Get payment history for user
 */
router.get('/user/:piUserId/payments', validatePiUserId, asyncHandler(async (req, res) => {
  if (!cloudStorageService) {
    return res.status(503).json({ success: false, error: 'Cloud storage service not available' });
  }

  const limit = parseInt(req.query.limit) || 50;
  const result = await cloudStorageService.getPaymentHistory(req.piUserId, limit);
  
  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    payments: result.payments
  });
}));

// ===========================================
// BASIC ENDPOINTS FOR TESTING
// ===========================================

/**
 * GET /api/cloud/test
 * Simple test endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Cloud storage API is working',
    timestamp: new Date().toISOString(),
    serviceStatus: cloudStorageService ? 'loaded' : 'loading'
  });
});

module.exports = router;