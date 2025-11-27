require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// Import routes
const piRoutes = require('./routes/pi.cjs');
const paymentRoutes = require('./routes/payments.cjs');
const cloudStorageRoutes = require('./routes/cloudStorageSimple.cjs');
const inventoryRoutes = require('./routes/inventory.cjs');
const userRoutes = require('./routes/user.cjs');

// Import leaderboard functions (not router)
const leaderboardAPI = require('./leaderboard-api.cjs');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Performance middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:5173', 'http://localhost:3000', 'https://flappypi.fun'];
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Check for Pi Network domains
    if (origin.includes('.pinet.com') || origin.includes('.minepi.com')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-pi-app-id', 'x-pi-user-id']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/pi', piRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cloud', cloudStorageRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/user', userRoutes);

// Leaderboard endpoints (individual route handlers)
app.post('/api/leaderboard/submit', leaderboardAPI.submitScore);
app.get('/api/leaderboard', leaderboardAPI.getLeaderboard);
app.get('/api/leaderboard/user/:userId', leaderboardAPI.getUserStats);
app.get('/api/leaderboard/daily', leaderboardAPI.getDailyLeaderboard);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Flappy Pi Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      pi: 'active',
      payments: 'active',
      leaderboard: 'active',
      cloudStorage: 'active'
    }
  });
});

// Enhanced health check for cloud storage
app.get('/api/health/cloud', async (req, res) => {
  try {
    // Import cloud storage service dynamically
    const { default: cloudStorageService } = await import('./services/cloudStorageService.js');
    const healthResult = await cloudStorageService.healthCheck();
    
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthResult);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      message: 'Access denied from this origin'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      '/api/health',
      '/api/pi/*',
      '/api/payments/*',
      '/api/leaderboard/*',
      '/api/cloud/*'
    ]
  });
});

const PORT = process.env.PORT || 3001;

// Initialize cloud storage service on startup
app.listen(PORT, async () => {
  console.log(`🚀 Flappy Pi Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💳 Payment endpoints: http://localhost:${PORT}/api/payments`);
  console.log(`🏆 Leaderboard endpoints: http://localhost:${PORT}/api/leaderboard`);
  console.log(`☁️  Cloud Storage endpoints: http://localhost:${PORT}/api/cloud`);
  
  // Test cloud storage connection
  try {
    const { testConnection, initializeDatabase } = await import('./services/supabaseClient.js');
    
    console.log('🔄 Testing Supabase connection...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Supabase connection established');
      await initializeDatabase();
      console.log('✅ Database schema verified');
    } else {
      console.error('❌ Failed to connect to Supabase');
    }
  } catch (error) {
    console.error('❌ Cloud storage initialization failed:', error.message);
  }
}); 