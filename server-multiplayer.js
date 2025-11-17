const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "https://flappypi.pinet.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Game state storage
const rooms = new Map();
const players = new Map();

// Game room class
class GameRoom {
  constructor(id, name, maxPlayers, gameMode, hostId) {
    this.id = id;
    this.name = name;
    this.maxPlayers = maxPlayers;
    this.gameMode = gameMode;
    this.hostId = hostId;
    this.players = new Map();
    this.gameState = 'waiting'; // waiting, playing, finished
    this.settings = {
      obstacles: true,
      powerUps: true,
      timeLimit: 300, // 5 minutes
    };
    this.createdAt = new Date();
    this.gameStartTime = null;
    this.gameEndTime = null;
  }

  addPlayer(player) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Room is full');
    }
    if (this.gameState !== 'waiting') {
      throw new Error('Game has already started');
    }
    this.players.set(player.id, player);
    return player;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    if (this.players.size === 0) {
      return true; // Room should be deleted
    }
    // If host left, assign new host
    if (this.hostId === playerId && this.players.size > 0) {
      this.hostId = this.players.keys().next().value;
    }
    return false;
  }

  startGame() {
    if (this.players.size < 2) {
      throw new Error('Need at least 2 players to start');
    }
    this.gameState = 'playing';
    this.gameStartTime = new Date();
    
    // Initialize player positions
    this.players.forEach((player, index) => {
      player.position = { x: 100 + (index * 150), y: 300 };
      player.isAlive = true;
      player.score = 0;
    });
  }

  endGame(winner) {
    this.gameState = 'finished';
    this.gameEndTime = new Date();
  }

  getRoomData() {
    return {
      id: this.id,
      name: this.name,
      players: Array.from(this.players.values()),
      maxPlayers: this.maxPlayers,
      gameState: this.gameState,
      gameMode: this.gameMode,
      settings: this.settings,
      createdAt: this.createdAt,
      hostId: this.hostId
    };
  }
}

// Player class
class Player {
  constructor(id, username, avatar, color, socketId) {
    this.id = id;
    this.username = username;
    this.avatar = avatar;
    this.color = color;
    this.socketId = socketId;
    this.position = { x: 100, y: 300 };
    this.score = 0;
    this.isAlive = true;
    this.isReady = false;
    this.roomId = null;
  }

  updatePosition(x, y) {
    this.position = { x, y };
  }

  updateScore(score) {
    this.score = score;
  }

  die() {
    this.isAlive = false;
  }

  getPlayerData() {
    return {
      id: this.id,
      username: this.username,
      avatar: this.avatar,
      color: this.color,
      position: this.position,
      score: this.score,
      isAlive: this.isAlive,
      isReady: this.isReady
    };
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create room
  socket.on('create_room', (data, callback) => {
    try {
      const roomId = uuidv4();
      const room = new GameRoom(
        roomId,
        data.name || `Room ${Date.now()}`,
        data.maxPlayers || 4,
        data.gameMode || 'classic',
        socket.id
      );
      
      rooms.set(roomId, room);
      
      const response = {
        success: true,
        room: room.getRoomData()
      };
      
      callback(response);
      console.log(`Room created: ${roomId}`);
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Join room
  socket.on('join_room', (data, callback) => {
    try {
      const room = rooms.get(data.roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const player = new Player(
        socket.id,
        data.username,
        data.avatar || 'default',
        data.color || '#FF6B6B',
        socket.id
      );

      room.addPlayer(player);
      players.set(socket.id, player);
      player.roomId = room.id;

      socket.join(room.id);

      // Notify room about new player
      io.to(room.id).emit('player_joined', {
        player: player.getPlayerData(),
        room: room.getRoomData()
      });

      const response = {
        success: true,
        room: room.getRoomData(),
        player: player.getPlayerData()
      };

      callback(response);
      console.log(`Player ${data.username} joined room ${data.roomId}`);
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Leave room
  socket.on('leave_room', () => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        const shouldDeleteRoom = room.removePlayer(socket.id);
        
        if (shouldDeleteRoom) {
          rooms.delete(room.id);
          console.log(`Room ${room.id} deleted`);
        } else {
          // Notify remaining players
          io.to(room.id).emit('player_left', {
            playerId: socket.id,
            room: room.getRoomData()
          });
        }
      }
      
      players.delete(socket.id);
      socket.leave(player.roomId);
      console.log(`Player left room: ${socket.id}`);
    }
  });

  // Start game
  socket.on('start_game', () => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room && room.hostId === socket.id) {
        try {
          room.startGame();
          io.to(room.id).emit('game_started', {
            room: room.getRoomData()
          });
          console.log(`Game started in room ${room.id}`);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      }
    }
  });

  // Player movement
  socket.on('player_move', (data) => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      player.updatePosition(data.x, data.y);
      const room = rooms.get(player.roomId);
      if (room) {
        io.to(room.id).emit('player_moved', {
          playerId: socket.id,
          position: data
        });
      }
    }
  });

  // Score update
  socket.on('score_update', (data) => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      player.updateScore(data.score);
      const room = rooms.get(player.roomId);
      if (room) {
        io.to(room.id).emit('score_updated', {
          playerId: socket.id,
          score: data.score
        });
      }
    }
  });

  // Player died
  socket.on('player_die', (data) => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      player.die();
      player.updateScore(data.score);
      
      const room = rooms.get(player.roomId);
      if (room) {
        io.to(room.id).emit('player_died', {
          playerId: socket.id,
          score: data.score
        });

        // Check if game should end
        const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
        if (alivePlayers.length <= 1) {
          const winner = alivePlayers.length === 1 ? alivePlayers[0] : 
                       Array.from(room.players.values()).reduce((prev, current) => 
                         (prev.score > current.score) ? prev : current);
          
          room.endGame(winner);
          io.to(room.id).emit('game_ended', {
            room: room.getRoomData(),
            winner: winner.getPlayerData()
          });
        }
      }
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        const shouldDeleteRoom = room.removePlayer(socket.id);
        
        if (shouldDeleteRoom) {
          rooms.delete(room.id);
          console.log(`Room ${room.id} deleted due to disconnect`);
        } else {
          // Notify remaining players
          io.to(room.id).emit('player_left', {
            playerId: socket.id,
            room: room.getRoomData()
          });
        }
      }
      
      players.delete(socket.id);
      console.log(`Player disconnected: ${socket.id}`);
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    rooms: rooms.size,
    players: players.size,
    timestamp: new Date().toISOString()
  });
});

// Get active rooms
app.get('/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    gameState: room.gameState,
    gameMode: room.gameMode
  }));
  
  res.json(roomList);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Multiplayer server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🏠 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Active rooms: http://localhost:${PORT}/rooms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };
