import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import config from './config.js';
import Logger from './utils/logger.js';
import RateLimiter from './utils/rateLimiter.js';
import Validators from './utils/validators.js';

// Initialize logger
const logger = new Logger(config);

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO server configuration
const io = new Server(server, {
  cors: config.cors,
  ...config.socketIO
});

// Initialize utilities
const rateLimiter = new RateLimiter(config);
const validators = new Validators(config);

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

// Game state management
const gameRooms = new Map();
const playerSessions = new Map();

// Enhanced Game Room class with better state management
class GameRoom {
  constructor(id, hostId, hostName, roomName = 'Game Room') {
    this.id = id;
    this.hostId = hostId;
    this.hostName = hostName;
    this.roomName = roomName;
    this.players = new Map();
    this.gameState = 'waiting'; // waiting, playing, finished
    this.gameData = {
      bird1: { x: 100, y: 300, velocity: 0, score: 0, alive: true },
      bird2: { x: 100, y: 300, velocity: 0, score: 0, alive: true },
      pipes: [],
      gameTime: 0,
      winner: null
    };
    this.settings = {
      maxPlayers: config.game.maxPlayersPerRoom,
      gameMode: 'classic',
      difficulty: 'normal',
      timeLimit: config.game.gameTimeout / 1000 // Convert to seconds
    };
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.gameLoop = null;
    
    logger.roomEvent(this.id, 'created', {
      hostName,
      roomName,
      settings: this.settings
    });
  }

  addPlayer(socketId, playerName, isHost = false) {
    if (this.players.size >= this.settings.maxPlayers) {
      logger.warn(`Room ${this.id}: Cannot add player ${playerName} - room is full`);
      return false;
    }
    
    const player = {
      id: socketId,
      name: validators.sanitizeString(playerName),
      isHost,
      ready: false,
      connected: true,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    };
    
    this.players.set(socketId, player);
    this.lastActivity = Date.now();
    
    logger.roomEvent(this.id, 'player_joined', {
      playerName: player.name,
      playerCount: this.players.size,
      isHost
    });
    
    return true;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      logger.roomEvent(this.id, 'player_left', {
        playerName: player.name,
        playerCount: this.players.size - 1
      });
    }
    this.players.delete(socketId);
    this.lastActivity = Date.now();
  }

  setPlayerReady(socketId, ready) {
    const player = this.players.get(socketId);
    if (player) {
      player.ready = ready;
      player.lastSeen = Date.now();
      this.lastActivity = Date.now();
      
      logger.roomEvent(this.id, 'player_ready_changed', {
        playerName: player.name,
        ready,
        canStart: this.canStartGame()
      });
    }
  }

  canStartGame() {
    return this.players.size === 2 && 
           Array.from(this.players.values()).every(p => p.ready);
  }

  startGame() {
    this.gameState = 'playing';
    this.gameData = {
      bird1: { x: 100, y: 300, velocity: 0, score: 0, alive: true },
      bird2: { x: 100, y: 300, velocity: 0, score: 0, alive: true },
      pipes: [],
      gameTime: 0,
      winner: null
    };
    this.lastActivity = Date.now();
    
    logger.gameEvent('game_started', {
      roomId: this.id,
      playerCount: this.players.size,
      gameMode: this.settings.gameMode,
      difficulty: this.settings.difficulty
    });
  }

  stopGame() {
    this.gameState = 'finished';
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    
    logger.gameEvent('game_ended', {
      roomId: this.id,
      winner: this.gameData.winner,
      finalScores: {
        bird1: this.gameData.bird1.score,
        bird2: this.gameData.bird2.score
      }
    });
  }

  updateGameState(playerId, action, data) {
    if (this.gameState !== 'playing') return;

    const player = this.players.get(playerId);
    if (!player) return;

    switch (action) {
      case 'jump':
        if (playerId === Array.from(this.players.keys())[0]) {
          this.gameData.bird1.velocity = -8;
        } else {
          this.gameData.bird2.velocity = -8;
        }
        break;
      
      case 'collision':
        if (playerId === Array.from(this.players.keys())[0]) {
          this.gameData.bird1.alive = false;
        } else {
          this.gameData.bird2.alive = false;
        }
        this.checkGameEnd();
        break;
      
      case 'score':
        if (playerId === Array.from(this.players.keys())[0]) {
          this.gameData.bird1.score++;
        } else {
          this.gameData.bird2.score++;
        }
        break;
      
      case 'pipe_update':
        this.gameData.pipes = data.pipes;
        break;
    }
  }

  checkGameEnd() {
    const players = Array.from(this.players.values());
    const alivePlayers = players.filter(p => {
      const playerIndex = Array.from(this.players.keys()).indexOf(p.id);
      return playerIndex === 0 ? this.gameData.bird1.alive : this.gameData.bird2.alive;
    });

    if (alivePlayers.length <= 1) {
      this.gameState = 'finished';
      this.gameData.winner = alivePlayers[0]?.id || null;
    }
  }

  getGameState() {
    return {
      roomId: this.id,
      gameState: this.gameState,
      players: Array.from(this.players.values()),
      gameData: this.gameData,
      settings: this.settings
    };
  }
}

// Enhanced Socket.IO connection handling with validation and rate limiting
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

  // Player joins lobby
  socket.on('join_lobby', (data) => {
    if (!checkRateLimit('join_lobby') || !validateInput('join_lobby', data)) {
      return;
    }

    const { playerName } = data;
    const sanitizedName = validators.sanitizeString(playerName);
    
    playerSessions.set(socket.id, {
      name: sanitizedName,
      currentRoom: null,
      connected: true,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    });
    
    logger.connectionEvent(socket.id, 'lobby_joined', {
      playerName: sanitizedName
    });
    
    socket.emit('lobby_joined', {
      playerId: socket.id,
      playerName: sanitizedName,
      availableRooms: Array.from(gameRooms.values()).map(room => ({
        id: room.id,
        hostName: room.hostName,
        roomName: room.roomName,
        playerCount: room.players.size,
        maxPlayers: room.settings.maxPlayers,
        gameState: room.gameState,
        gameMode: room.settings.gameMode,
        difficulty: room.settings.difficulty
      }))
    });
  });

  // Create new game room
  socket.on('create_room', (data, callback) => {
    if (!checkRateLimit('create_room') || !validateInput('create_room', data)) {
      callback({ success: false, error: 'Invalid input or rate limit exceeded' });
      return;
    }

    // Check if player is already in a room
    const session = playerSessions.get(socket.id);
    if (session?.currentRoom) {
      callback({ success: false, error: 'Player is already in a room' });
      return;
    }

    // Check room limit
    if (gameRooms.size >= config.game.maxRooms) {
      callback({ success: false, error: 'Server is at maximum room capacity' });
      return;
    }

    const { roomName, gameMode, difficulty } = data;
    const playerName = session?.name || 'Unknown';
    
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sanitizedRoomName = validators.sanitizeString(roomName) || 'Game Room';
    const room = new GameRoom(roomId, socket.id, playerName, sanitizedRoomName);
    
    room.settings.gameMode = gameMode || 'classic';
    room.settings.difficulty = difficulty || 'normal';
    
    if (!room.addPlayer(socket.id, playerName, true)) {
      callback({ success: false, error: 'Failed to add player to room' });
      return;
    }
    
    gameRooms.set(roomId, room);
    socket.join(roomId);
    session.currentRoom = roomId;
    
    logger.roomEvent(roomId, 'created', {
      hostName: playerName,
      roomName: sanitizedRoomName,
      gameMode,
      difficulty
    });
    
    callback({
      success: true,
      roomId,
      room: room.getGameState()
    });
    
    // Notify lobby about new room
    socket.broadcast.emit('room_created', {
      id: roomId,
      hostName: playerName,
      roomName: sanitizedRoomName,
      playerCount: 1,
      maxPlayers: room.settings.maxPlayers,
      gameState: room.gameState,
      gameMode: room.settings.gameMode,
      difficulty: room.settings.difficulty
    });
  });

  // Join existing room
  socket.on('join_room', (data, callback) => {
    const { roomId } = data;
    const playerName = playerSessions.get(socket.id)?.name || 'Unknown';
    
    const room = gameRooms.get(roomId);
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }
    
    if (!room.addPlayer(socket.id, playerName)) {
      callback({ success: false, error: 'Room is full' });
      return;
    }
    
    socket.join(roomId);
    playerSessions.get(socket.id).currentRoom = roomId;
    
    callback({ success: true, room: room.getGameState() });
    
    // Notify all players in room
    io.to(roomId).emit('player_joined', {
      playerId: socket.id,
      playerName,
      room: room.getGameState()
    });
  });

  // Leave room
  socket.on('leave_room', () => {
    const session = playerSessions.get(socket.id);
    if (session?.currentRoom) {
      const room = gameRooms.get(session.currentRoom);
      if (room) {
        room.removePlayer(socket.id);
        socket.leave(session.currentRoom);
        
        // Notify other players
        socket.to(session.currentRoom).emit('player_left', {
          playerId: socket.id,
          room: room.getGameState()
        });
        
        // Clean up empty rooms
        if (room.players.size === 0) {
          gameRooms.delete(session.currentRoom);
          io.emit('room_deleted', { roomId: session.currentRoom });
        }
      }
      
      session.currentRoom = null;
    }
  });

  // Player ready state
  socket.on('player_ready', (data) => {
    const session = playerSessions.get(socket.id);
    if (session?.currentRoom) {
      const room = gameRooms.get(session.currentRoom);
      if (room) {
        room.setPlayerReady(socket.id, data.ready);
        
        io.to(session.currentRoom).emit('player_ready_changed', {
          playerId: socket.id,
          ready: data.ready,
          canStart: room.canStartGame()
        });
      }
    }
  });

  // Start game
  socket.on('start_game', () => {
    const session = playerSessions.get(socket.id);
    if (session?.currentRoom) {
      const room = gameRooms.get(session.currentRoom);
      if (room && room.hostId === socket.id && room.canStartGame()) {
        room.startGame();
        
        io.to(session.currentRoom).emit('game_started', {
          room: room.getGameState()
        });
        
        // Start game loop
        startGameLoop(room);
      }
    }
  });

  // Game actions
  socket.on('game_action', (data) => {
    const session = playerSessions.get(socket.id);
    if (session?.currentRoom) {
      const room = gameRooms.get(session.currentRoom);
      if (room && room.gameState === 'playing') {
        room.updateGameState(socket.id, data.action, data.data);
        
        // Broadcast game state to all players in room
        io.to(session.currentRoom).emit('game_state_update', {
          gameData: room.gameData,
          gameState: room.gameState
        });
      }
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    const session = playerSessions.get(socket.id);
    if (session?.currentRoom) {
      const room = gameRooms.get(session.currentRoom);
      if (room) {
        room.removePlayer(socket.id);
        
        // Notify other players
        socket.to(session.currentRoom).emit('player_disconnected', {
          playerId: socket.id,
          room: room.getGameState()
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

// Enhanced game loop with better performance and error handling
function startGameLoop(room) {
  if (room.gameLoop) {
    clearInterval(room.gameLoop);
  }

  const tickRate = 1000 / config.game.tickRate; // Convert FPS to milliseconds
  let lastUpdate = Date.now();
  
  room.gameLoop = setInterval(() => {
    try {
      if (room.gameState !== 'playing') {
        room.stopGame();
        return;
      }
      
      const now = Date.now();
      const deltaTime = now - lastUpdate;
      lastUpdate = now;
      
      // Update game time
      room.gameData.gameTime++;
      
      // Generate pipes periodically based on config
      if (room.gameData.gameTime % config.game.pipeGenerationInterval === 0) {
        const newPipe = {
          x: 400,
          topHeight: Math.random() * 200 + 100,
          bottomY: Math.random() * 200 + 300,
          passed: false
        };
        room.gameData.pipes.push(newPipe);
      }
      
      // Update pipe positions
      room.gameData.pipes.forEach(pipe => {
        pipe.x -= config.game.pipeSpeed;
      });
      
      // Remove off-screen pipes
      room.gameData.pipes = room.gameData.pipes.filter(pipe => pipe.x > -50);
      
      // Update bird physics
      room.gameData.bird1.velocity += 0.5; // Gravity
      room.gameData.bird1.y += room.gameData.bird1.velocity;
      
      room.gameData.bird2.velocity += 0.5; // Gravity
      room.gameData.bird2.y += room.gameData.bird2.velocity;
      
      // Check for game end conditions
      const timeLimitReached = room.gameData.gameTime >= room.settings.timeLimit * config.game.tickRate;
      const allPlayersDead = !room.gameData.bird1.alive && !room.gameData.bird2.alive;
      
      if (timeLimitReached || allPlayersDead) {
        room.gameState = 'finished';
        room.gameData.winner = room.gameData.bird1.score > room.gameData.bird2.score ? 
          Array.from(room.players.keys())[0] : Array.from(room.players.keys())[1];
        
        io.to(room.id).emit('game_ended', {
          winner: room.gameData.winner,
          finalScores: {
            bird1: room.gameData.bird1.score,
            bird2: room.gameData.bird2.score
          }
        });
        
        room.stopGame();
        return;
      }
      
      // Broadcast updated game state
      io.to(room.id).emit('game_state_update', {
        gameData: room.gameData,
        gameState: room.gameState
      });
      
    } catch (error) {
      logger.error(`Game loop error in room ${room.id}:`, error);
      room.stopGame();
    }
  }, tickRate);
  
  logger.gameEvent('game_loop_started', {
    roomId: room.id,
    tickRate: config.game.tickRate
  });
}

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
      room.stopGame();
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
    room.stopGame();
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
    room.stopGame();
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
  logger.info(`🎮 Duels Server running on ${HOST}:${PORT}`);
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
