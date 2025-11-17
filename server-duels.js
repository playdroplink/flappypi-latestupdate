const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Socket.IO server configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "https://flappypi.pinet.com"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Middleware
app.use(cors());
app.use(express.json());

// Game state management
const gameRooms = new Map();
const playerSessions = new Map();

// Game room class
class GameRoom {
  constructor(id, hostId, hostName) {
    this.id = id;
    this.hostId = hostId;
    this.hostName = hostName;
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
      maxPlayers: 2,
      gameMode: 'classic',
      difficulty: 'normal',
      timeLimit: 300 // 5 minutes
    };
    this.createdAt = Date.now();
  }

  addPlayer(socketId, playerName, isHost = false) {
    if (this.players.size >= this.settings.maxPlayers) {
      return false;
    }
    
    this.players.set(socketId, {
      id: socketId,
      name: playerName,
      isHost,
      ready: false,
      connected: true,
      joinedAt: Date.now()
    });
    
    return true;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  setPlayerReady(socketId, ready) {
    const player = this.players.get(socketId);
    if (player) {
      player.ready = ready;
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins lobby
  socket.on('join_lobby', (data) => {
    const { playerName } = data;
    playerSessions.set(socket.id, {
      name: playerName,
      currentRoom: null,
      connected: true
    });
    
    socket.emit('lobby_joined', {
      playerId: socket.id,
      playerName,
      availableRooms: Array.from(gameRooms.values()).map(room => ({
        id: room.id,
        hostName: room.hostName,
        playerCount: room.players.size,
        maxPlayers: room.settings.maxPlayers,
        gameState: room.gameState
      }))
    });
  });

  // Create new game room
  socket.on('create_room', (data, callback) => {
    const { roomName, gameMode, difficulty } = data;
    const playerName = playerSessions.get(socket.id)?.name || 'Unknown';
    
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room = new GameRoom(roomId, socket.id, playerName);
    
    room.settings.gameMode = gameMode || 'classic';
    room.settings.difficulty = difficulty || 'normal';
    
    room.addPlayer(socket.id, playerName, true);
    gameRooms.set(roomId, room);
    
    socket.join(roomId);
    playerSessions.get(socket.id).currentRoom = roomId;
    
    callback({
      success: true,
      roomId,
      room: room.getGameState()
    });
    
    // Notify lobby about new room
    socket.broadcast.emit('room_created', {
      id: roomId,
      hostName: playerName,
      playerCount: 1,
      maxPlayers: room.settings.maxPlayers,
      gameState: room.gameState
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

// Game loop for each room
function startGameLoop(room) {
  const gameInterval = setInterval(() => {
    if (room.gameState !== 'playing') {
      clearInterval(gameInterval);
      return;
    }
    
    // Update game time
    room.gameData.gameTime++;
    
    // Generate pipes periodically
    if (room.gameData.gameTime % 100 === 0) {
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
      pipe.x -= 2;
    });
    
    // Remove off-screen pipes
    room.gameData.pipes = room.gameData.pipes.filter(pipe => pipe.x > -50);
    
    // Broadcast updated game state
    io.to(room.id).emit('game_state_update', {
      gameData: room.gameData,
      gameState: room.gameState
    });
    
    // Check for game end conditions
    if (room.gameData.gameTime >= room.settings.timeLimit * 60) {
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
      
      clearInterval(gameInterval);
    }
  }, 16); // ~60 FPS
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeRooms: gameRooms.size,
    connectedPlayers: playerSessions.size
  });
});

// Get available rooms
app.get('/api/rooms', (req, res) => {
  const rooms = Array.from(gameRooms.values()).map(room => ({
    id: room.id,
    hostName: room.hostName,
    playerCount: room.players.size,
    maxPlayers: room.settings.maxPlayers,
    gameState: room.gameState,
    gameMode: room.settings.gameMode,
    difficulty: room.settings.difficulty
  }));
  
  res.json({ rooms });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Duels Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time multiplayer`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Available rooms: http://localhost:${PORT}/api/rooms`);
});
