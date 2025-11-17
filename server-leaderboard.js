const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://sandbox.minepi.com", "https://minepi.com"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://sandbox.minepi.com", "https://minepi.com"],
  credentials: true
}));
app.use(express.json());

// In-memory storage for leaderboard data
let leaderboardData = {
  classic: [],
  endless: [],
  challenge: [],
  'all-time': []
};

// Leaderboard update queue to prevent spam
const updateQueue = new Map();
const UPDATE_DEBOUNCE = 1000; // 1 second

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

  // Sort by highest_score descending
  leaderboardData[gameMode].sort((a, b) => b.highest_score - a.highest_score);

  // Keep only top 100 entries
  leaderboardData[gameMode] = leaderboardData[gameMode].slice(0, 100);
}

// Debounced update function
function debouncedUpdate(gameMode, entry) {
  const key = `${gameMode}-${entry.pi_user_id}`;
  
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
  io.to(`leaderboard_${gameMode}`).emit('leaderboard_update', data);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Leaderboard client connected: ${socket.id}`);

  // Join leaderboard room for specific game mode
  socket.on('join_leaderboard', (gameMode) => {
    socket.join(`leaderboard_${gameMode}`);
    console.log(`Client ${socket.id} joined leaderboard room: ${gameMode}`);
    
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
    console.log(`Client ${socket.id} left leaderboard room: ${gameMode}`);
  });

  // Handle score submission
  socket.on('submit_score', (scoreData) => {
    try {
      const { pi_user_id, username, score, game_mode, challenge_type } = scoreData;
      
      // Validate score data
      if (!pi_user_id || !username || typeof score !== 'number' || !game_mode) {
        socket.emit('score_submission_error', {
          message: 'Invalid score data provided'
        });
        return;
      }

      const entry = {
        pi_user_id,
        username,
        highest_score: score,
        game_mode,
        challenge_type,
        total_games: 1 // This would be calculated properly in a real implementation
      };

      // Update leaderboard for the specific game mode
      debouncedUpdate(game_mode, entry);

      // Also update all-time leaderboard
      debouncedUpdate('all-time', entry);

      // Send confirmation to the submitting client
      socket.emit('score_submitted', {
        success: true,
        gameMode: game_mode,
        score,
        timestamp: new Date().toISOString()
      });

      console.log(`Score submitted: ${username} - ${score} (${game_mode})`);

    } catch (error) {
      console.error('Error processing score submission:', error);
      socket.emit('score_submission_error', {
        message: 'Failed to process score submission'
      });
    }
  });

  // Handle leaderboard refresh request
  socket.on('refresh_leaderboard', (gameMode) => {
    const data = {
      gameMode,
      leaderboard: leaderboardData[gameMode] || [],
      timestamp: new Date().toISOString()
    };
    socket.emit('leaderboard_data', data);
  });

  // Handle user rank request
  socket.on('get_user_rank', ({ pi_user_id, game_mode }) => {
    const leaderboard = leaderboardData[game_mode] || [];
    const rank = leaderboard.findIndex(entry => entry.pi_user_id === pi_user_id) + 1;
    
    socket.emit('user_rank', {
      pi_user_id,
      game_mode,
      rank: rank || null,
      total_players: leaderboard.length
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Leaderboard client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
    leaderboardStats: {
      classic: leaderboardData.classic.length,
      endless: leaderboardData.endless.length,
      challenge: leaderboardData.challenge.length,
      'all-time': leaderboardData['all-time'].length
    }
  });
});

// Get leaderboard data endpoint
app.get('/api/leaderboard/:gameMode', (req, res) => {
  const { gameMode } = req.params;
  const { limit = 100 } = req.query;
  
  const leaderboard = leaderboardData[gameMode] || [];
  const limitedLeaderboard = leaderboard.slice(0, parseInt(limit));
  
  res.json({
    gameMode,
    leaderboard: limitedLeaderboard,
    total: leaderboard.length,
    timestamp: new Date().toISOString()
  });
});

// Submit score endpoint (for non-Socket.IO clients)
app.post('/api/score', (req, res) => {
  try {
    const { pi_user_id, username, score, game_mode, challenge_type } = req.body;
    
    if (!pi_user_id || !username || typeof score !== 'number' || !game_mode) {
      return res.status(400).json({ error: 'Invalid score data' });
    }

    const entry = {
      pi_user_id,
      username,
      highest_score: score,
      game_mode,
      challenge_type,
      total_games: 1
    };

    debouncedUpdate(game_mode, entry);
    debouncedUpdate('all-time', entry);

    res.json({ 
      success: true, 
      message: 'Score submitted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 Leaderboard server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 API endpoint: http://localhost:${PORT}/api/leaderboard/:gameMode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
