// Configuration management for Flappy Pi Duels Server
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 3009,
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS configuration
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://flappypi.pinet.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },

  // Socket.IO configuration
  socketIO: {
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: parseInt(process.env.PING_TIMEOUT) || 5000,
    pingInterval: parseInt(process.env.PING_INTERVAL) || 25000,
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT) || 30000,
  },

  // Game configuration
  game: {
    maxRooms: parseInt(process.env.MAX_ROOMS) || 100,
    maxPlayersPerRoom: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 2,
    gameTimeout: parseInt(process.env.GAME_TIMEOUT) || 300000, // 5 minutes
    tickRate: parseInt(process.env.GAME_TICK_RATE) || 60, // 60 FPS
    pipeGenerationInterval: 100, // frames
    pipeSpeed: 2,
    birdJumpVelocity: -8,
  },

  // Security configuration
  security: {
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
    maxPlayerNameLength: 20,
    maxRoomNameLength: 30,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableDebug: process.env.ENABLE_DEBUG_LOGS === 'true',
    enableConsole: true,
    enableFile: false,
  },

  // Performance configuration
  performance: {
    enableCompression: true,
    enableCaching: true,
    maxMemoryUsage: 512 * 1024 * 1024, // 512MB
    cleanupInterval: 300000, // 5 minutes
  },
};

// Validation
const validateConfig = () => {
  const errors = [];

  if (config.server.port < 1024 || config.server.port > 65535) {
    errors.push('Port must be between 1024 and 65535');
  }

  if (config.game.maxRooms < 1 || config.game.maxRooms > 10000) {
    errors.push('Max rooms must be between 1 and 10000');
  }

  if (config.game.maxPlayersPerRoom < 2 || config.game.maxPlayersPerRoom > 10) {
    errors.push('Max players per room must be between 2 and 10');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
};

// Initialize configuration
validateConfig();

export default config;
