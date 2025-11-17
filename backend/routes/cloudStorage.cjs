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
(async () => {
  try {
    const { default: service } = await import('../services/cloudStorageService.js');
    cloudStorageService = service;
  } catch (error) {
    console.error('Failed to load cloud storage service:', error);
  }
})();

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
router.put('/user/:piUserId/profile', validatePiUserId, async (req, res) => {
  try {
    const userData = req.body;
    const result = await cloudStorageService.upsertUserProfile(req.piUserId, userData);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      profile: result.data
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

/**
 * PUT /api/cloud/user/:piUserId/stats
 * Update user game statistics
 */
router.put('/user/:piUserId/stats', validatePiUserId, async (req, res) => {
  try {
    const stats = req.body;
    const result = await cloudStorageService.updateUserStats(req.piUserId, stats);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      stats: result.data
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user stats'
    });
  }
});

// ===========================================
// INVENTORY ENDPOINTS
// ===========================================

/**
 * GET /api/cloud/user/:piUserId/inventory
 * Load user inventory from cloud
 */
router.get('/user/:piUserId/inventory', validatePiUserId, async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error loading inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load inventory'
    });
  }
});

/**
 * POST /api/cloud/user/:piUserId/inventory/sync
 * Sync entire inventory to cloud
 */
router.post('/user/:piUserId/inventory/sync', validatePiUserId, async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error syncing inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync inventory'
    });
  }
});

/**
 * POST /api/cloud/user/:piUserId/inventory/item
 * Add single item to inventory
 */
router.post('/user/:piUserId/inventory/item', validatePiUserId, async (req, res) => {
  try {
    const item = req.body;
    
    if (!item || !item.id || !item.type) {
      return res.status(400).json({
        success: false,
        error: 'Item must have id and type'
      });
    }

    const result = await cloudStorageService.addItemToInventory(req.piUserId, item);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: 'Item added to inventory'
    });
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to inventory'
    });
  }
});

// ===========================================
// PAYMENT ENDPOINTS
// ===========================================

/**
 * POST /api/cloud/payments/record
 * Record a payment transaction
 */
router.post('/payments/record', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record payment'
    });
  }
});

/**
 * PUT /api/cloud/payments/:paymentId/status
 * Update payment status
 */
router.put('/payments/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, transaction_id } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status is required'
      });
    }

    const result = await cloudStorageService.updatePaymentStatus(paymentId, status, transaction_id);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      payment: result.data
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status'
    });
  }
});

/**
 * GET /api/cloud/user/:piUserId/payments
 * Get payment history for user
 */
router.get('/user/:piUserId/payments', validatePiUserId, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await cloudStorageService.getPaymentHistory(req.piUserId, limit);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      payments: result.payments
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history'
    });
  }
});

// ===========================================
// GAME SESSION ENDPOINTS
// ===========================================

/**
 * POST /api/cloud/user/:piUserId/session
 * Record a game session
 */
router.post('/user/:piUserId/session', validatePiUserId, async (req, res) => {
  try {
    const sessionData = req.body;
    
    if (!sessionData.score) {
      return res.status(400).json({
        success: false,
        error: 'score is required'
      });
    }

    const result = await cloudStorageService.recordGameSession(req.piUserId, sessionData);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      session: result.data
    });
  } catch (error) {
    console.error('Error recording game session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record game session'
    });
  }
});

// ===========================================
// LEADERBOARD ENDPOINTS
// ===========================================

/**
 * GET /api/cloud/leaderboard
 * Get global leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await cloudStorageService.getLeaderboard(limit);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      leaderboard: result.leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard'
    });
  }
});

/**
 * PUT /api/cloud/user/:piUserId/leaderboard
 * Update user's leaderboard entry
 */
router.put('/user/:piUserId/leaderboard', validatePiUserId, async (req, res) => {
  try {
    const { score, username } = req.body;
    
    if (!score) {
      return res.status(400).json({
        success: false,
        error: 'score is required'
      });
    }

    const result = await cloudStorageService.updateLeaderboard(req.piUserId, score, username);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      leaderboard: result.data
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update leaderboard'
    });
  }
});

// ===========================================
// SUBSCRIPTION & REWARDS ENDPOINTS
// ===========================================

/**
 * POST /api/cloud/user/:piUserId/rewards
 * Record claimed rewards
 */
router.post('/user/:piUserId/rewards', validatePiUserId, async (req, res) => {
  try {
    const { plan_id, transaction_id, rewards } = req.body;
    
    if (!plan_id || !transaction_id || !Array.isArray(rewards)) {
      return res.status(400).json({
        success: false,
        error: 'plan_id, transaction_id, and rewards array are required'
      });
    }

    const result = await cloudStorageService.recordClaimedRewards(
      req.piUserId, 
      plan_id, 
      transaction_id, 
      rewards
    );
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      rewards: result.data
    });
  } catch (error) {
    console.error('Error recording claimed rewards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record claimed rewards'
    });
  }
});

/**
 * GET /api/cloud/user/:piUserId/subscription/status
 * Check subscription expiry status
 */
router.get('/user/:piUserId/subscription/status', validatePiUserId, async (req, res) => {
  try {
    const result = await cloudStorageService.checkExpiringSubscriptions(req.piUserId);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check subscription status'
    });
  }
});

// ===========================================
// BULK OPERATIONS ENDPOINTS
// ===========================================

/**
 * POST /api/cloud/user/:piUserId/sync
 * Perform full user data sync
 */
router.post('/user/:piUserId/sync', validatePiUserId, async (req, res) => {
  try {
    const userData = req.body;
    const result = await cloudStorageService.syncAllUserData(req.piUserId, userData);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      results: result.results
    });
  } catch (error) {
    console.error('Error in full user data sync:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync user data'
    });
  }
});

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

module.exports = router;