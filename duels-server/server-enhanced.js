// Enhanced Flappy Pi Duels Server
// Based on Socket.IO v4 documentation and best practices
// Following the official emit cheatsheet patterns

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config.js';
import Logger from './utils/logger.js';
import RateLimiter from './utils/rateLimiter.js';
import Validators from './utils/validators.js';
import GameEventsHandler from './events/gameEvents.js';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = new Logger(config);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO server configuration following official docs
const io = new Server(server, {
  cors: config.cors,
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

// Initialize game events handler
const gameEvents = new GameEventsHandler(io, gameRooms, playerSessions, logger);

// Middleware
app.use(cors(config.cors));
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

// Socket.IO connection handling following official patterns
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

  // Socket.IO event handlers following official emit cheatsheet
  socket.on('join_lobby', (data) => {
    if (!checkRateLimit('join_lobby') || !validateInput('join_lobby', data)) {
      return;
    }
    gameEvents.handleJoinLobby(socket, data);
  });

  socket.on('create_room', (data, callback) => {
    if (!checkRateLimit('create_room') || !validateInput('create_room', data)) {
      callback({ success: false, error: 'Invalid input or rate limit exceeded' });
      return;
    }
    gameEvents.handleCreateRoom(socket, data, callback);
  });

  socket.on('join_room', (data, callback) => {
    if (!checkRateLimit('join_room') || !validateInput('join_room', data)) {
      callback({ success: false, error: 'Invalid input or rate limit exceeded' });
      return;
    }
    gameEvents.handleJoinRoom(socket, data, callback);
  });

  socket.on('leave_room', () => {
    if (!checkRateLimit('leave_room')) return;
    gameEvents.handleLeaveRoom(socket);
  });

  socket.on('player_ready', (data) => {
    if (!checkRateLimit('player_ready') || !validateInput('player_ready', data)) {
      return;
    }
    gameEvents.handlePlayerReady(socket, data);
  });

  socket.on('start_game', () => {
    if (!checkRateLimit('start_game')) return;
    gameEvents.handleStartGame(socket);
  });

  socket.on('game_action', (data) => {
    if (!checkRateLimit('game_action') || !validateInput('game_action', data)) {
      return;
    }
    gameEvents.handleGameAction(socket, data);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.connectionEvent(socket.id, 'disconnected', { reason });
    
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

  // Handle connection errors
  socket.on('connect_error', (error) => {
    logger.error(`Connection error for socket ${socket.id}:`, error);
  });
});

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    activeRooms: gameRooms.size,
    connectedPlayers: playerSessions.size,
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

// Enhanced rooms endpoint
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
  logger.info(`🎮 Flappy Pi Duels Server running on ${HOST}:${PORT}`);
  logger.info(`📡 Socket.IO server ready for real-time multiplayer`);
  logger.info(`🏥 Health check: http://${HOST}:${PORT}/health`);
  logger.info(`📋 Available rooms: http://${HOST}:${PORT}/api/rooms`);
  logger.info(`📊 Server stats: http://${HOST}:${PORT}/api/stats`);
  logger.info(`🔧 Configuration:`, {
    maxRooms: config.game.maxRooms,
    maxPlayersPerRoom: config.game.maxPlayersPerRoom,
    tickRate: config.game.tickRate,
    rateLimiting: config.security.enableRateLimiting
  });
});
