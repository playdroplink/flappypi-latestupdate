// =============================================
// FLAPPY PI - COMPREHENSIVE BACKEND API
// =============================================
// Complete backend service with all endpoints for the Flappy Pi application
// Includes user management, payments, inventory, leaderboards, and analytics

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================
// MIDDLEWARE SETUP
// =============================================

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:1113',
    'https://flappypi.fun',
    'https://flappypi2807.pinet.com',
    'https://ecosystem.pinet.com',
    /\.vercel\.app$/,
    /\.pinet\.com$/,
    /\.minepi\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please slow down.' }
});

app.use('/api/', generalLimiter);

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validate Pi User ID
const validatePiUserId = (piUserId) => {
  return piUserId && typeof piUserId === 'string' && piUserId.length > 0;
};

// Set user context for RLS
const setUserContext = async (piUserId) => {
  if (piUserId) {
    await supabase.rpc('set_config', {
      parameter: 'app.current_user_id',
      value: piUserId
    });
  }
};

// =============================================
// USER PROFILE ENDPOINTS
// =============================================

// Get user profile
app.get('/api/user/profile/:piUserId', asyncHandler(async (req, res) => {
  const { piUserId } = req.params;
  
  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('pi_user_id', piUserId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ success: true, profile: data });
}));

// Create or update user profile
app.post('/api/user/profile', asyncHandler(async (req, res) => {
  const { piUserId, username, ...profileData } = req.body;
  
  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      pi_user_id: piUserId,
      username,
      ...profileData,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'pi_user_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    return res.status(500).json({ error: 'Failed to save user profile' });
  }

  res.json({ success: true, profile: data });
}));

// Update user stats
app.patch('/api/user/stats/:piUserId', asyncHandler(async (req, res) => {
  const { piUserId } = req.params;
  const { totalCoins, highScore, gamesPlayed, coinsEarned } = req.body;
  
  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      total_coins: totalCoins,
      high_score: highScore,
      games_played: gamesPlayed,
      coins_earned: coinsEarned,
      last_login: new Date().toISOString()
    })
    .eq('pi_user_id', piUserId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user stats:', error);
    return res.status(500).json({ error: 'Failed to update user stats' });
  }

  res.json({ success: true, profile: data });
}));

// =============================================
// USER INVENTORY ENDPOINTS
// =============================================

// Get user inventory
app.get('/api/inventory/:piUserId', asyncHandler(async (req, res) => {
  const { piUserId } = req.params;
  
  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('user_inventory')
    .select('*')
    .eq('pi_user_id', piUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory' });
  }

  res.json({ success: true, inventory: data || [] });
}));

// Add item to inventory
app.post('/api/inventory/add', asyncHandler(async (req, res) => {
  const {
    piUserId,
    itemType,
    itemId,
    itemName,
    quantity = 1,
    purchasePrice,
    purchaseCurrency,
    expiresAt,
    metadata = {}
  } = req.body;
  
  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('user_inventory')
    .select('*')
    .eq('pi_user_id', piUserId)
    .eq('item_id', itemId)
    .eq('item_type', itemType)
    .single();

  let result;
  
  if (existingItem) {
    // Update quantity if item exists
    const { data, error } = await supabase
      .from('user_inventory')
      .update({
        quantity: existingItem.quantity + quantity,
        last_sync_time: new Date().toISOString()
      })
      .eq('id', existingItem.id)
      .select()
      .single();
      
    result = { data, error };
  } else {
    // Create new inventory item
    const { data, error } = await supabase
      .from('user_inventory')
      .insert([{
        pi_user_id: piUserId,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        quantity,
        purchase_price: purchasePrice,
        purchase_currency: purchaseCurrency,
        expires_at: expiresAt,
        metadata,
        sync_status: 'synced'
      }])
      .select()
      .single();
      
    result = { data, error };
  }

  if (result.error) {
    console.error('Error adding to inventory:', result.error);
    return res.status(500).json({ error: 'Failed to add item to inventory' });
  }

  res.json({ success: true, item: result.data });
}));

// Sync entire inventory
app.post('/api/inventory/sync', asyncHandler(async (req, res) => {
  const { piUserId, inventoryItems } = req.body;
  
  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  // Clear existing inventory for this user
  await supabase
    .from('user_inventory')
    .delete()
    .eq('pi_user_id', piUserId);

  // Insert new inventory items
  if (inventoryItems && inventoryItems.length > 0) {
    const itemsToInsert = inventoryItems.map(item => ({
      pi_user_id: piUserId,
      item_type: item.type || item.itemType,
      item_id: item.id || item.itemId,
      item_name: item.name || item.itemName,
      quantity: item.quantity || 1,
      purchase_price: item.purchasePrice,
      purchase_currency: item.purchaseCurrency,
      expires_at: item.expiresAt,
      metadata: item.metadata || {},
      sync_status: 'synced'
    }));

    const { data, error } = await supabase
      .from('user_inventory')
      .insert(itemsToInsert)
      .select();

    if (error) {
      console.error('Error syncing inventory:', error);
      return res.status(500).json({ error: 'Failed to sync inventory' });
    }

    res.json({ success: true, syncedItems: data.length });
  } else {
    res.json({ success: true, syncedItems: 0 });
  }
}));

// =============================================
// PAYMENT ENDPOINTS
// =============================================

// Record payment
app.post('/api/payments/record', strictLimiter, asyncHandler(async (req, res) => {
  const {
    paymentId,
    piUserId,
    amount,
    currency = 'PI',
    memo,
    itemType,
    itemId,
    itemName,
    quantity = 1,
    transactionId,
    fromAddress,
    toAddress,
    metadata = {}
  } = req.body;

  if (!paymentId || !piUserId || !amount) {
    return res.status(400).json({ error: 'Missing required payment fields' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('payment_records')
    .insert([{
      payment_id: paymentId,
      pi_user_id: piUserId,
      amount,
      currency,
      memo,
      status: 'pending',
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      quantity,
      transaction_id: transactionId,
      from_address: fromAddress,
      to_address: toAddress,
      metadata,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }])
    .select()
    .single();

  if (error) {
    console.error('Error recording payment:', error);
    return res.status(500).json({ error: 'Failed to record payment' });
  }

  res.json({ success: true, payment: data });
}));

// Update payment status
app.patch('/api/payments/:paymentId/status', asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { status, transactionId, piUserId } = req.body;

  if (!paymentId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (piUserId) {
    await setUserContext(piUserId);
  }

  const updateData = {
    status,
    transaction_id: transactionId,
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else if (status === 'failed') {
    updateData.failed_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('payment_records')
    .update(updateData)
    .eq('payment_id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ error: 'Failed to update payment status' });
  }

  res.json({ success: true, payment: data });
}));

// Get payment history
app.get('/api/payments/history/:piUserId', asyncHandler(async (req, res) => {
  const { piUserId } = req.params;
  const { limit = 50 } = req.query;

  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .eq('pi_user_id', piUserId)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    console.error('Error fetching payment history:', error);
    return res.status(500).json({ error: 'Failed to fetch payment history' });
  }

  res.json({ success: true, payments: data || [] });
}));

// =============================================
// GAME SESSION ENDPOINTS
// =============================================

// Record game session
app.post('/api/game/session', asyncHandler(async (req, res) => {
  const {
    piUserId,
    gameMode = 'classic',
    finalScore,
    levelReached = 1,
    coinsEarned = 0,
    sessionDuration,
    pipesPassed = 0,
    powerUpsUsed = [],
    gameData = {}
  } = req.body;

  if (!piUserId || finalScore === undefined) {
    return res.status(400).json({ error: 'Missing required session data' });
  }

  await setUserContext(piUserId);

  // Use the stored procedure to complete game session
  const { data, error } = await supabase.rpc('complete_game_session_secure', {
    p_pi_user_id: piUserId,
    p_game_mode: gameMode,
    p_final_score: finalScore,
    p_level_reached: levelReached,
    p_coins_earned: coinsEarned,
    p_session_duration: sessionDuration
  });

  if (error) {
    console.error('Error recording game session:', error);
    return res.status(500).json({ error: 'Failed to record game session' });
  }

  res.json({ success: true, session: data });
}));

// Get user game sessions
app.get('/api/game/sessions/:piUserId', asyncHandler(async (req, res) => {
  const { piUserId } = req.params;
  const { limit = 20, gameMode } = req.query;

  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  await setUserContext(piUserId);

  let query = supabase
    .from('game_sessions')
    .select('*')
    .eq('pi_user_id', piUserId);

  if (gameMode) {
    query = query.eq('game_mode', gameMode);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    console.error('Error fetching game sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch game sessions' });
  }

  res.json({ success: true, sessions: data || [] });
}));

// =============================================
// LEADERBOARD ENDPOINTS
// =============================================

// Get leaderboard
app.get('/api/leaderboard', asyncHandler(async (req, res) => {
  const {
    gameMode = 'classic',
    limit = 50,
    offset = 0,
    timeframe = 'all-time',
    verifiedOnly = false
  } = req.query;

  let query = supabase
    .from('unified_leaderboard_view')
    .select('*')
    .eq('game_mode', gameMode);

  if (verifiedOnly === 'true') {
    query = query.eq('is_verified', true);
  }

  // Apply timeframe filter
  if (timeframe === 'daily') {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('created_at', `${today}T00:00:00.000Z`);
  } else if (timeframe === 'weekly') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', weekAgo);
  } else if (timeframe === 'monthly') {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', monthAgo);
  }

  const { data, error } = await query
    .order('score', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }

  res.json({ success: true, leaderboard: data || [] });
}));

// Submit score to leaderboard
app.post('/api/leaderboard/submit', strictLimiter, asyncHandler(async (req, res) => {
  const {
    piUserId,
    username,
    score,
    gameMode = 'classic',
    characterUsed = 'flappy',
    difficulty = 'normal',
    gameDuration,
    coinsCollected = 0,
    powerUpsUsed = [],
    gameData = {},
    sessionId
  } = req.body;

  if (!piUserId || !username || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .insert([{
      pi_user_id: piUserId,
      username,
      score,
      game_mode: gameMode,
      character_used: characterUsed,
      difficulty,
      game_duration: gameDuration,
      coins_collected: coinsCollected,
      power_ups_used: powerUpsUsed,
      game_data: gameData,
      session_id: sessionId,
      is_verified: true,
      is_pi_user: true,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }])
    .select()
    .single();

  if (error) {
    console.error('Error submitting score:', error);
    return res.status(500).json({ error: 'Failed to submit score' });
  }

  res.json({ success: true, scoreEntry: data });
}));

// Get user rank
app.get('/api/leaderboard/rank/:piUserId', asyncHandler(async (req, res) => {
  const { piUserId } = req.params;
  const { gameMode = 'classic' } = req.query;

  if (!validatePiUserId(piUserId)) {
    return res.status(400).json({ error: 'Invalid Pi User ID' });
  }

  const { data, error } = await supabase
    .from('unified_leaderboard_view')
    .select('rank, score, username')
    .eq('pi_user_id', piUserId)
    .eq('game_mode', gameMode)
    .order('score', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching user rank:', error);
    return res.status(500).json({ error: 'Failed to fetch user rank' });
  }

  res.json({ 
    success: true, 
    rank: data && data.length > 0 ? data[0] : null 
  });
}));

// =============================================
// SHOP ENDPOINTS
// =============================================

// Get shop items
app.get('/api/shop/items', asyncHandler(async (req, res) => {
  const { category, isAvailable = true } = req.query;

  let query = supabase
    .from('shop_items')
    .select('*');

  if (category) {
    query = query.eq('category', category);
  }

  if (isAvailable !== 'false') {
    query = query.eq('is_available', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shop items:', error);
    return res.status(500).json({ error: 'Failed to fetch shop items' });
  }

  res.json({ success: true, items: data || [] });
}));

// =============================================
// REWARDS AND ACHIEVEMENTS ENDPOINTS
// =============================================

// Record daily reward claim
app.post('/api/rewards/daily', asyncHandler(async (req, res) => {
  const {
    piUserId,
    rewardDay,
    rewardType,
    rewardItemId,
    rewardQuantity = 1,
    streakCount = 1
  } = req.body;

  if (!piUserId || !rewardDay || !rewardType) {
    return res.status(400).json({ error: 'Missing required reward fields' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('daily_rewards')
    .insert([{
      pi_user_id: piUserId,
      reward_day: rewardDay,
      reward_type: rewardType,
      reward_item_id: rewardItemId,
      reward_quantity: rewardQuantity,
      streak_count: streakCount
    }])
    .select()
    .single();

  if (error) {
    console.error('Error recording daily reward:', error);
    return res.status(500).json({ error: 'Failed to record daily reward' });
  }

  res.json({ success: true, reward: data });
}));

// Record ad watch
app.post('/api/rewards/ad-watch', asyncHandler(async (req, res) => {
  const {
    piUserId,
    adType,
    adProvider = 'pi_ad_network',
    rewardType,
    rewardAmount = 25,
    watchDuration,
    completed = true
  } = req.body;

  if (!piUserId || !adType) {
    return res.status(400).json({ error: 'Missing required ad watch fields' });
  }

  await setUserContext(piUserId);

  const { data, error } = await supabase
    .from('ad_watches')
    .insert([{
      pi_user_id: piUserId,
      ad_type: adType,
      ad_provider: adProvider,
      reward_type: rewardType,
      reward_amount: rewardAmount,
      watch_duration: watchDuration,
      completed,
      reward_delivered: completed,
      watch_completed_at: completed ? new Date().toISOString() : null,
      reward_delivered_at: completed ? new Date().toISOString() : null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error recording ad watch:', error);
    return res.status(500).json({ error: 'Failed to record ad watch' });
  }

  res.json({ success: true, adWatch: data });
}));

// =============================================
// ANALYTICS ENDPOINTS
// =============================================

// Record analytics event
app.post('/api/analytics/event', asyncHandler(async (req, res) => {
  const {
    piUserId,
    eventName,
    eventCategory,
    eventAction,
    eventLabel,
    eventValue,
    eventProperties = {},
    sessionId
  } = req.body;

  if (!eventName) {
    return res.status(400).json({ error: 'Event name is required' });
  }

  const { data, error } = await supabase
    .from('analytics_events')
    .insert([{
      pi_user_id: piUserId,
      event_name: eventName,
      event_category: eventCategory,
      event_action: eventAction,
      event_label: eventLabel,
      event_value: eventValue,
      event_properties: eventProperties,
      session_id: sessionId,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }])
    .select()
    .single();

  if (error) {
    console.error('Error recording analytics event:', error);
    return res.status(500).json({ error: 'Failed to record analytics event' });
  }

  res.json({ success: true, event: data });
}));

// =============================================
// SYSTEM ENDPOINTS
// =============================================

// Health check
app.get('/api/health', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('count')
    .limit(1);

  if (error) {
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }

  res.json({
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
}));

// Get database stats
app.get('/api/stats', asyncHandler(async (req, res) => {
  try {
    const [users, sessions, payments, inventory] = await Promise.all([
      supabase.from('user_profiles').select('count', { count: 'exact' }),
      supabase.from('game_sessions').select('count', { count: 'exact' }),
      supabase.from('payment_records').select('count', { count: 'exact' }),
      supabase.from('user_inventory').select('count', { count: 'exact' })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers: users.count || 0,
        totalSessions: sessions.count || 0,
        totalPayments: payments.count || 0,
        totalInventoryItems: inventory.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}));

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// =============================================
// SERVER STARTUP
// =============================================

app.listen(PORT, () => {
  console.log('🚀 Flappy Pi Backend API Server Started');
  console.log('=====================================');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Supabase connected: ${supabaseUrl}`);
  console.log(`🔒 CORS enabled for Pi Network domains`);
  console.log(`⚡ Rate limiting enabled`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('  User:        /api/user/profile, /api/user/stats');
  console.log('  Inventory:   /api/inventory, /api/inventory/add, /api/inventory/sync');
  console.log('  Payments:    /api/payments/record, /api/payments/history');
  console.log('  Game:        /api/game/session, /api/game/sessions');
  console.log('  Leaderboard: /api/leaderboard, /api/leaderboard/submit');
  console.log('  Shop:        /api/shop/items');
  console.log('  Rewards:     /api/rewards/daily, /api/rewards/ad-watch');
  console.log('  Analytics:   /api/analytics/event');
  console.log('  System:      /api/health, /api/stats');
  console.log('');
  console.log('✅ Backend ready for production!');
});

module.exports = app;