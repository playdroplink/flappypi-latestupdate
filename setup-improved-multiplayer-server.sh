#!/bin/bash

# Improved Multiplayer Server Setup Script for Flappy Pi
# This script sets up the multiplayer server with better error handling and health checks

echo "🎮 Setting up Improved Multiplayer Server for Flappy Pi..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create server directory if it doesn't exist
mkdir -p server

# Create improved server file
cat > server/improved-server.js << 'EOF'
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
    origin: ["http://localhost:3000", "http://localhost:5173", "https://flappypi.pinet.com", "https://sandbox.minepi.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rooms: rooms.size,
    players: players.size
  });
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
    this.gameState = 'waiting';
    this.settings = {
      obstacles: true,
      powerUps: true,
      timeLimit: 300,
    };
    this.createdAt = new Date();
    this.gameStartTime = null;
    this.gameEndTime = null;
  }

  addPlayer(player) {
    if (this.players.size >= this.maxPlayers) {
      throw new Error('Room is full');
    }
    this.players.set(player.id, player);
    player.roomId = this.id;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  getRoomData() {
    return {
      id: this.id,
      name: this.name,
      maxPlayers: this.maxPlayers,
      gameMode: this.gameMode,
      hostId: this.hostId,
      players: Array.from(this.players.values()).map(p => p.getPlayerData()),
      gameState: this.gameState,
      settings: this.settings,
      createdAt: this.createdAt,
      gameStartTime: this.gameStartTime,
      gameEndTime: this.gameEndTime
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
    this.x = 100;
    this.y = 300;
    this.velocity = 0;
    this.score = 0;
    this.isAlive = true;
    this.isReady = false;
    this.roomId = null;
  }

  getPlayerData() {
    return {
      id: this.id,
      username: this.username,
      avatar: this.avatar,
      color: this.color,
      x: this.x,
      y: this.y,
      velocity: this.velocity,
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
        room.removePlayer(socket.id);
        socket.leave(room.id);
        
        // Notify room about player leaving
        io.to(room.id).emit('player_left', {
          playerId: socket.id,
          room: room.getRoomData()
        });

        // If room is empty, delete it
        if (room.players.size === 0) {
          rooms.delete(room.id);
          console.log(`Room ${room.id} deleted (empty)`);
        }
      }
    }
    players.delete(socket.id);
  });

  // Start game
  socket.on('start_game', () => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room && room.hostId === socket.id) {
        room.gameState = 'playing';
        room.gameStartTime = new Date();
        
        io.to(room.id).emit('game_started', room.getRoomData());
        console.log(`Game started in room ${room.id}`);
      }
    }
  });

  // Player movement
  socket.on('player_move', (data) => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      player.x = data.x;
      player.y = data.y;
      player.velocity = data.velocity;
      player.isAlive = data.isAlive;
      
      // Broadcast to room
      socket.to(player.roomId).emit('player_moved', player.getPlayerData());
    }
  });

  // Score update
  socket.on('score_update', (data) => {
    const player = players.get(socket.id);
    if (player && player.roomId) {
      player.score = data.score;
      
      // Broadcast to room
      io.to(player.roomId).emit('score_updated', player.getPlayerData());
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        room.removePlayer(socket.id);
        
        // Notify room about player leaving
        io.to(room.id).emit('player_left', {
          playerId: socket.id,
          room: room.getRoomData()
        });

        // If room is empty, delete it
        if (room.players.size === 0) {
          rooms.delete(room.id);
          console.log(`Room ${room.id} deleted (empty)`);
        }
      }
    }
    players.delete(socket.id);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Multiplayer server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
EOF

# Create package.json for server
cat > server/package.json << 'EOF'
{
  "name": "flappy-pi-multiplayer-server",
  "version": "1.0.0",
  "description": "Multiplayer server for Flappy Pi",
  "main": "improved-server.js",
  "scripts": {
    "start": "node improved-server.js",
    "dev": "nodemon improved-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Install dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed successfully!"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Create start script
cat > start-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Flappy Pi Multiplayer Server..."
cd server
npm start
EOF

chmod +x start-server.sh

# Create development script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Flappy Pi Multiplayer Server (Development Mode)..."
cd server
npm run dev
EOF

chmod +x start-dev.sh

echo ""
echo "✅ Improved Multiplayer Server setup complete!"
echo ""
echo "📋 Available commands:"
echo "  ./start-server.sh    - Start production server"
echo "  ./start-dev.sh       - Start development server with auto-reload"
echo ""
echo "🔗 Server will be available at:"
echo "  http://localhost:3001"
echo "  Health check: http://localhost:3001/health"
echo ""
echo "🎮 To start the server, run:"
echo "  ./start-server.sh"
