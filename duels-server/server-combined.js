// Combined Socket.IO Server for Duels + Leaderboard
// Handles both multiplayer duels and real-time leaderboard updates

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import config from './config.js';
import Logger from './utils/logger.js';
import RateLimiter from './utils/rateLimiter.js';
import Validators from './utils/validators.js';
import GameEventsHandler from './events/gameEvents.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Initialize logger
const logger = new Logger(config);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO server configuration
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:5173", 
      "https://flappypi.pinet.com",
      "https://sandbox.minepi.com",
      "https://minepi.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: config.socketIO.pingTimeout,
  pingInterval: config.socketIO.pingInterval,
  connectionTimeout: config.socketIO.connectionTimeout
});

// Initialize utilities
const rateLimiter = new RateLimiter(config);
const validators = new Validators(config);

// Game state management
const gameRooms = new Map();
const playerSessions = new Map();

// Leaderboard data storage
let leaderboardData = {
  classic: [],
  endless: [],
  challenge: [],
  'all-time': []
};

// Leaderboard update queue to prevent spam
const updateQueue = new Map();
const UPDATE_DEBOUNCE = 1000; // 1 second

// Initialize game events handler
const gameEvents = new GameEventsHandler(io, gameRooms, playerSessions, logger);

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:5173", 
    "https://flappypi.pinet.com",
    "https://sandbox.minepi.com",
    "https://minepi.com"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`HTTP ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Helper function to update leaderboard
function updateLeaderboard(gameMode, entry) {
  if (!leaderboardData[gameMode]) {
    leaderboardData[gameMode] = [];
  }

  const existingIndex = leaderboardData[gameMode].findIndex(
    item => item.pi_user_id === entry.pi_user_id
  );

  if (existingIndex >= 0) {
    // Update existing entry
    leaderboardData[gameMode][existingIndex] = {
      ...leaderboardData[gameMode][existingIndex],
      ...entry,
      updated_at: new Date().toISOString()
    };
  } else {
    // Add new entry
    leaderboardData[gameMode].push({
      ...entry,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Sort by highest score
  leaderboardData[gameMode].sort((a, b) => b.highest_score - a.highest_score);

  // Keep only top 100 entries
  leaderboardData[gameMode] = leaderboardData[gameMode].slice(0, 100);
}

// Debounced leaderboard update
function debouncedUpdate(gameMode, entry) {
  const key = `${gameMode}_${entry.pi_user_id}`;
  
  if (updateQueue.has(key)) {
    clearTimeout(updateQueue.get(key));
  }

  const timeoutId = setTimeout(() => {
    updateLeaderboard(gameMode, entry);
    broadcastLeaderboardUpdate(gameMode);
    updateQueue.delete(key);
  }, UPDATE_DEBOUNCE);

  updateQueue.set(key, timeoutId);
}

// Broadcast leaderboard updates to all connected clients
function broadcastLeaderboardUpdate(gameMode) {
  const data = {
    gameMode,
    leaderboard: leaderboardData[gameMode] || [],
    timestamp: new Date().toISOString()
  };

  // Broadcast to all clients
  io.emit('leaderboard_update', data);
  
  // Broadcast to specific game mode room
  io.to(`leaderboard_${gameMode}`).emit('leaderboard_data', data);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.connectionEvent(socket.id, 'connected', {
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent']
  });

  // Rate limiting middleware
  const checkRateLimit = (event) => {
    if (!rateLimiter.isAllowed(socket.id, event)) {
      logger.warn(`Rate limit exceeded for socket ${socket.id} on event ${event}`);
      socket.emit('error', {
        message: 'Rate limit exceeded. Please slow down your requests.',
        type: 'rate_limit_exceeded'
      });
      return false;
    }
    return true;
  };

  // Input validation middleware
  const validateInput = (event, data) => {
    const validation = validators.validateEventData(event, data);
    if (!validation.valid) {
      logger.warn(`Invalid input for socket ${socket.id} on event ${event}:`, validation.error);
      socket.emit('error', {
        message: validation.error,
        type: 'validation_error'
      });
      return false;
    }
    return true;
  };

  // ===== DUELS EVENTS =====
  
  // Player joins lobby
  socket.on('join_lobby', (data) => {
    if (!checkRateLimit('join_lobby') || !validateInput('join_lobby', data)) {
      return;
    }
    gameEvents.handleJoinLobby(socket, data);
  });

  // Create room
  socket.on('create_room', (data, callback) => {
    if (!checkRateLimit('create_room') || !validateInput('create_room', data)) {
      callback({ success: false, error: 'Invalid input or rate limit exceeded' });
      return;
    }
    gameEvents.handleCreateRoom(socket, data, callback);
  });

  // Join room
  socket.on('join_room', (data, callback) => {
    if (!checkRateLimit('join_room') || !validateInput('join_room', data)) {
      callback({ success: false, error: 'Invalid input or rate limit exceeded' });
      return;
    }
    gameEvents.handleJoinRoom(socket, data, callback);
  });

  // Leave room
  socket.on('leave_room', () => {
    if (!checkRateLimit('leave_room')) return;
    gameEvents.handleLeaveRoom(socket);
  });

  // Player ready
  socket.on('player_ready', (data) => {
    if (!checkRateLimit('player_ready') || !validateInput('player_ready', data)) {
      return;
    }
    gameEvents.handlePlayerReady(socket, data);
  });

  // Start game
  socket.on('start_game', () => {
    if (!checkRateLimit('start_game')) return;
    gameEvents.handleStartGame(socket);
  });

  // Game actions
  socket.on('game_action', (data) => {
    if (!checkRateLimit('game_action') || !validateInput('game_action', data)) {
      return;
    }
    gameEvents.handleGameAction(socket, data);
  });

  // ===== LEADERBOARD EVENTS =====

  // Join leaderboard room
  socket.on('join_leaderboard', (gameMode) => {
    if (!checkRateLimit('join_leaderboard')) return;
    
    socket.join(`leaderboard_${gameMode}`);
    logger.info(`Client ${socket.id} joined leaderboard room: ${gameMode}`);
    
    // Send current leaderboard data
    const currentData = {
      gameMode,
      leaderboard: leaderboardData[gameMode] || [],
      timestamp: new Date().toISOString()
    };
    socket.emit('leaderboard_data', currentData);
  });

  // Leave leaderboard room
  socket.on('leave_leaderboard', (gameMode) => {
    socket.leave(`leaderboard_${gameMode}`);
    logger.info(`Client ${socket.id} left leaderboard room: ${gameMode}`);
  });

  // Handle score submission
  socket.on('submit_score', (data) => {
    if (!checkRateLimit('submit_score')) return;
    
    try {
      const { pi_user_id, username, score, game_mode, challenge_type } = data;
      
      // Validate score submission
      if (!pi_user_id || !username || typeof score !== 'number' || !game_mode) {
        socket.emit('score_submission_error', {
          message: 'Invalid score submission data'
        });
        return;
      }

      // Update leaderboard
      const entry = {
        pi_user_id,
        username,
        highest_score: score,
        game_mode,
        challenge_type,
        total_games: 1
      };

      debouncedUpdate(game_mode, entry);

      // Send confirmation
      socket.emit('score_submitted', {
        success: true,
        gameMode: game_mode,
        score: score,
        timestamp: new Date().toISOString()
      });

      logger.info(`Score submitted: ${username} - ${score} (${game_mode})`);

    } catch (error) {
      logger.error('Score submission error:', error);
      socket.emit('score_submission_error', {
        message: 'Failed to submit score',
        error: error.message
      });
    }
  });

  // Get user rank
  socket.on('get_user_rank', (data) => {
    if (!checkRateLimit('get_user_rank')) return;
    
    try {
      const { pi_user_id, game_mode } = data;
      const leaderboard = leaderboardData[game_mode] || [];
      const userIndex = leaderboard.findIndex(entry => entry.pi_user_id === pi_user_id);
      
      const rankData = {
        pi_user_id,
        game_mode,
        rank: userIndex >= 0 ? userIndex + 1 : null,
        total_players: leaderboard.length
      };

      socket.emit('user_rank', rankData);
    } catch (error) {
      logger.error('Get user rank error:', error);
      socket.emit('error', {
        message: 'Failed to get user rank',
        error: error.message
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.connectionEvent(socket.id, 'disconnected', { reason });
    
    // Handle duels disconnection
    const session = playerSessions.get(socket.id);
    if (session?.currentRoom) {
      const room = gameRooms.get(session.currentRoom);
      if (room) {
        const player = room.players.get(socket.id);
        if (player) {
          logger.roomEvent(room.id, 'player_disconnected', {
            playerName: player.name,
            playerCount: room.players.size - 1
          });
        }
        
        room.players.delete(socket.id);
        
        // Notify other players
        socket.to(session.currentRoom).emit('player_disconnected', {
          playerId: socket.id,
          room: gameEvents.getRoomState(room)
        });
        
        // Clean up empty rooms
        if (room.players.size === 0) {
          gameRooms.delete(session.currentRoom);
          io.emit('room_deleted', { roomId: session.currentRoom });
        }
      }
    }
    
    playerSessions.delete(socket.id);
  });
});

// ===== API ENDPOINTS =====

// Health check endpoint
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    activeRooms: gameRooms.size,
    connectedPlayers: playerSessions.size,
    leaderboardEntries: Object.values(leaderboardData).reduce((sum, arr) => sum + arr.length, 0),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    config: {
      maxRooms: config.game.maxRooms,
      maxPlayersPerRoom: config.game.maxPlayersPerRoom,
      tickRate: config.game.tickRate
    }
  });
});

// Get available rooms
app.get('/api/rooms', (req, res) => {
  const rooms = Array.from(gameRooms.values()).map(room => ({
    id: room.id,
    hostName: room.hostName,
    roomName: room.roomName,
    playerCount: room.players.size,
    maxPlayers: room.settings.maxPlayers,
    gameState: room.gameState,
    gameMode: room.settings.gameMode,
    difficulty: room.settings.difficulty,
    createdAt: room.createdAt,
    lastActivity: room.lastActivity
  }));
  
  res.json({ 
    rooms,
    total: rooms.length,
    active: rooms.filter(r => r.gameState === 'playing').length,
    waiting: rooms.filter(r => r.gameState === 'waiting').length
  });
});

// Get leaderboard data
app.get('/api/leaderboard/:gameMode', (req, res) => {
  const { gameMode } = req.params;
  const leaderboard = leaderboardData[gameMode] || [];
  
  res.json({
    gameMode,
    leaderboard,
    total: leaderboard.length,
    timestamp: new Date().toISOString()
  });
});

// Server statistics endpoint
app.get('/api/stats', (req, res) => {
  const stats = {
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    game: {
      totalRooms: gameRooms.size,
      activePlayers: playerSessions.size,
      roomsByState: {
        waiting: Array.from(gameRooms.values()).filter(r => r.gameState === 'waiting').length,
        playing: Array.from(gameRooms.values()).filter(r => r.gameState === 'playing').length,
        finished: Array.from(gameRooms.values()).filter(r => r.gameState === 'finished').length
      }
    },
    leaderboard: {
      totalEntries: Object.values(leaderboardData).reduce((sum, arr) => sum + arr.length, 0),
      entriesByMode: Object.keys(leaderboardData).reduce((acc, mode) => {
        acc[mode] = leaderboardData[mode].length;
        return acc;
      }, {})
    }
  };
  
  res.json(stats);
});

// Cleanup function for inactive rooms
function cleanupInactiveRooms() {
  const now = Date.now();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
  
  for (const [roomId, room] of gameRooms.entries()) {
    if (room.players.size === 0 && (now - room.lastActivity) > inactiveThreshold) {
      logger.roomEvent(roomId, 'cleaned_up', { reason: 'inactive' });
      if (room.gameLoop) {
        clearInterval(room.gameLoop);
      }
      gameRooms.delete(roomId);
    }
  }
}

// Periodic cleanup
setInterval(cleanupInactiveRooms, config.performance.cleanupInterval);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  // Stop all game loops
  for (const room of gameRooms.values()) {
    if (room.gameLoop) {
      clearInterval(room.gameLoop);
    }
  }
  
  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  // Stop all game loops
  for (const room of gameRooms.values()) {
    if (room.gameLoop) {
      clearInterval(room.gameLoop);
    }
  }
  
  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

server.listen(PORT, HOST, () => {
  logger.info(`🎮 Combined Duels + Leaderboard Server running on ${HOST}:${PORT}`);
  logger.info(`📡 Socket.IO server ready for real-time multiplayer and leaderboard`);
  logger.info(`🏥 Health check: http://${HOST}:${PORT}/health`);
  logger.info(`📋 Available rooms: http://${HOST}:${PORT}/api/rooms`);
  logger.info(`🏆 Leaderboard: http://${HOST}:${PORT}/api/leaderboard/classic`);
  logger.info(`📊 Server stats: http://${HOST}:${PORT}/api/stats`);
  logger.info(`🔧 Configuration:`, {
    maxRooms: config.game.maxRooms,
    maxPlayersPerRoom: config.game.maxPlayersPerRoom,
    tickRate: config.game.tickRate,
    rateLimiting: config.security.enableRateLimiting
  });
});
