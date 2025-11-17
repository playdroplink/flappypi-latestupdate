// Game Events Handler for Flappy Pi Duels
// Based on Socket.IO v4 emit cheatsheet patterns

class GameEventsHandler {
  constructor(io, gameRooms, playerSessions, logger) {
    this.io = io;
    this.gameRooms = gameRooms;
    this.playerSessions = playerSessions;
    this.logger = logger;
  }

  // Handle player joining lobby
  handleJoinLobby(socket, data) {
    const { playerName } = data;
    const sanitizedName = this.sanitizeString(playerName);
    
    this.playerSessions.set(socket.id, {
      name: sanitizedName,
      currentRoom: null,
      connected: true,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    });
    
    this.logger.connectionEvent(socket.id, 'lobby_joined', {
      playerName: sanitizedName
    });
    
    // Emit lobby_joined event with available rooms
    socket.emit('lobby_joined', {
      playerId: socket.id,
      playerName: sanitizedName,
      availableRooms: this.getAvailableRooms()
    });
  }

  // Handle room creation
  handleCreateRoom(socket, data, callback) {
    const { roomName, gameMode, difficulty } = data;
    const session = this.playerSessions.get(socket.id);
    
    if (!session) {
      callback({ success: false, error: 'Player not in lobby' });
      return;
    }

    if (session.currentRoom) {
      callback({ success: false, error: 'Player is already in a room' });
      return;
    }

    if (this.gameRooms.size >= 100) { // MAX_ROOMS from config
      callback({ success: false, error: 'Server is at maximum room capacity' });
      return;
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sanitizedRoomName = this.sanitizeString(roomName) || 'Game Room';
    
    const room = {
      id: roomId,
      hostId: socket.id,
      hostName: session.name,
      roomName: sanitizedRoomName,
      players: new Map(),
      gameState: 'waiting',
      gameData: {
        bird1: { x: 100, y: 300, velocity: 0, score: 0, alive: true, username: session.name },
        bird2: { x: 100, y: 300, velocity: 0, score: 0, alive: true, username: 'Waiting...' },
        pipes: [],
        gameTime: 0,
        winner: null
      },
      settings: {
        maxPlayers: 2,
        gameMode: gameMode || 'classic',
        difficulty: difficulty || 'normal',
        timeLimit: 300
      },
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    // Add host to room
    room.players.set(socket.id, {
      id: socket.id,
      name: session.name,
      isHost: true,
      ready: false,
      connected: true,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    });

    this.gameRooms.set(roomId, room);
    socket.join(roomId);
    session.currentRoom = roomId;
    
    this.logger.roomEvent(roomId, 'created', {
      hostName: session.name,
      roomName: sanitizedRoomName,
      gameMode,
      difficulty
    });
    
    callback({
      success: true,
      roomId,
      room: this.getRoomState(room)
    });
    
    // Broadcast room creation to all players in lobby
    socket.broadcast.emit('room_created', {
      id: roomId,
      hostName: session.name,
      roomName: sanitizedRoomName,
      playerCount: 1,
      maxPlayers: room.settings.maxPlayers,
      gameState: room.gameState,
      gameMode: room.settings.gameMode,
      difficulty: room.settings.difficulty
    });
  }

  // Handle joining existing room
  handleJoinRoom(socket, data, callback) {
    const { roomId } = data;
    const session = this.playerSessions.get(socket.id);
    
    if (!session) {
      callback({ success: false, error: 'Player not in lobby' });
      return;
    }

    if (session.currentRoom) {
      callback({ success: false, error: 'Player is already in a room' });
      return;
    }

    const room = this.gameRooms.get(roomId);
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.players.size >= room.settings.maxPlayers) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    if (room.gameState !== 'waiting') {
      callback({ success: false, error: 'Game is already in progress' });
      return;
    }

    // Add player to room
    const player = {
      id: socket.id,
      name: session.name,
      isHost: false,
      ready: false,
      connected: true,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    };

    room.players.set(socket.id, player);
    room.lastActivity = Date.now();
    socket.join(roomId);
    session.currentRoom = roomId;
    
    // Update bird2 username when second player joins
    if (room.players.size === 2) {
      room.gameData.bird2.username = session.name;
    }
    
    this.logger.roomEvent(roomId, 'player_joined', {
      playerName: session.name,
      playerCount: room.players.size
    });
    
    callback({
      success: true,
      room: this.getRoomState(room)
    });
    
    // Notify all players in room
    this.io.to(roomId).emit('player_joined', {
      playerId: socket.id,
      playerName: session.name,
      room: this.getRoomState(room)
    });
  }

  // Handle leaving room
  handleLeaveRoom(socket) {
    const session = this.playerSessions.get(socket.id);
    if (!session?.currentRoom) return;

    const room = this.gameRooms.get(session.currentRoom);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      this.logger.roomEvent(room.id, 'player_left', {
        playerName: player.name,
        playerCount: room.players.size - 1
      });
    }

    room.players.delete(socket.id);
    room.lastActivity = Date.now();
    socket.leave(session.currentRoom);
    
    // Notify other players
    socket.to(session.currentRoom).emit('player_left', {
      playerId: socket.id,
      room: this.getRoomState(room)
    });
    
    // Clean up empty rooms
    if (room.players.size === 0) {
      this.gameRooms.delete(session.currentRoom);
      this.io.emit('room_deleted', { roomId: session.currentRoom });
    }
    
    session.currentRoom = null;
  }

  // Handle player ready state
  handlePlayerReady(socket, data) {
    const session = this.playerSessions.get(socket.id);
    if (!session?.currentRoom) return;

    const room = this.gameRooms.get(session.currentRoom);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.ready = data.ready;
      player.lastSeen = Date.now();
      room.lastActivity = Date.now();
      
      this.logger.roomEvent(room.id, 'player_ready_changed', {
        playerName: player.name,
        ready: data.ready,
        canStart: this.canStartGame(room)
      });
      
      this.io.to(room.id).emit('player_ready_changed', {
        playerId: socket.id,
        ready: data.ready,
        canStart: this.canStartGame(room)
      });
    }
  }

  // Handle starting game
  handleStartGame(socket) {
    const session = this.playerSessions.get(socket.id);
    if (!session?.currentRoom) return;

    const room = this.gameRooms.get(session.currentRoom);
    if (!room) return;

    // Only host can start game
    if (room.hostId !== socket.id) return;

    if (!this.canStartGame(room)) return;

    room.gameState = 'playing';
    room.gameData = {
      bird1: { x: 100, y: 300, velocity: 0, score: 0, alive: true },
      bird2: { x: 100, y: 300, velocity: 0, score: 0, alive: true },
      pipes: [],
      gameTime: 0,
      winner: null
    };
    room.lastActivity = Date.now();
    
    this.logger.gameEvent('game_started', {
      roomId: room.id,
      playerCount: room.players.size,
      gameMode: room.settings.gameMode,
      difficulty: room.settings.difficulty
    });
    
    this.io.to(room.id).emit('game_started', {
      room: this.getRoomState(room)
    });
    
    // Start game loop
    this.startGameLoop(room);
  }

  // Handle game actions
  handleGameAction(socket, data) {
    const session = this.playerSessions.get(socket.id);
    if (!session?.currentRoom) return;

    const room = this.gameRooms.get(session.currentRoom);
    if (!room || room.gameState !== 'playing') return;

    const { action, data: actionData } = data;
    
    // Update game state based on action
    this.updateGameState(room, socket.id, action, actionData);
    
    // Broadcast updated game state
    this.io.to(room.id).emit('game_state_update', {
      gameData: room.gameData,
      gameState: room.gameState
    });
  }

  // Update game state based on player action
  updateGameState(room, playerId, action, data) {
    const players = Array.from(room.players.keys());
    const playerIndex = players.indexOf(playerId);
    
    if (playerIndex === -1) return;

    switch (action) {
      case 'jump':
        if (playerIndex === 0) {
          room.gameData.bird1.velocity = -8;
        } else {
          room.gameData.bird2.velocity = -8;
        }
        break;
      
      case 'collision':
        if (playerIndex === 0) {
          room.gameData.bird1.alive = false;
        } else {
          room.gameData.bird2.alive = false;
        }
        this.checkGameEnd(room);
        break;
      
      case 'score':
        if (playerIndex === 0) {
          room.gameData.bird1.score++;
        } else {
          room.gameData.bird2.score++;
        }
        break;
      
      case 'pipe_update':
        if (data && data.pipes) {
          room.gameData.pipes = data.pipes;
        }
        break;
    }
  }

  // Check if game should end
  checkGameEnd(room) {
    const players = Array.from(room.players.values());
    const alivePlayers = players.filter((p, index) => {
      return index === 0 ? room.gameData.bird1.alive : room.gameData.bird2.alive;
    });

    if (alivePlayers.length <= 1) {
      room.gameState = 'finished';
      room.gameData.winner = alivePlayers[0]?.id || null;
      
      this.io.to(room.id).emit('game_ended', {
        winner: room.gameData.winner,
        finalScores: {
          bird1: room.gameData.bird1.score,
          bird2: room.gameData.bird2.score
        }
      });
    }
  }

  // Start game loop for a room
  startGameLoop(room) {
    if (room.gameLoop) {
      clearInterval(room.gameLoop);
    }

    const tickRate = 1000 / 60; // 60 FPS
    
    room.gameLoop = setInterval(() => {
      if (room.gameState !== 'playing') {
        clearInterval(room.gameLoop);
        room.gameLoop = null;
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
      
      // Update bird physics
      room.gameData.bird1.velocity += 0.5; // Gravity
      room.gameData.bird1.y += room.gameData.bird1.velocity;
      
      room.gameData.bird2.velocity += 0.5; // Gravity
      room.gameData.bird2.y += room.gameData.bird2.velocity;
      
      // Check for game end conditions
      const timeLimitReached = room.gameData.gameTime >= room.settings.timeLimit * 60;
      const allPlayersDead = !room.gameData.bird1.alive && !room.gameData.bird2.alive;
      
      if (timeLimitReached || allPlayersDead) {
        room.gameState = 'finished';
        room.gameData.winner = room.gameData.bird1.score > room.gameData.bird2.score ? 
          Array.from(room.players.keys())[0] : Array.from(room.players.keys())[1];
        
        this.io.to(room.id).emit('game_ended', {
          winner: room.gameData.winner,
          finalScores: {
            bird1: room.gameData.bird1.score,
            bird2: room.gameData.bird2.score
          }
        });
        
        clearInterval(room.gameLoop);
        room.gameLoop = null;
        return;
      }
      
      // Broadcast updated game state
      this.io.to(room.id).emit('game_state_update', {
        gameData: room.gameData,
        gameState: room.gameState
      });
      
    }, tickRate);
  }

  // Utility methods
  canStartGame(room) {
    return room.players.size === 2 && 
           Array.from(room.players.values()).every(p => p.ready);
  }

  getRoomState(room) {
    return {
      roomId: room.id,
      gameState: room.gameState,
      players: Array.from(room.players.values()),
      gameData: room.gameData,
      settings: room.settings
    };
  }

  getAvailableRooms() {
    return Array.from(this.gameRooms.values()).map(room => ({
      id: room.id,
      hostName: room.hostName,
      roomName: room.roomName,
      playerCount: room.players.size,
      maxPlayers: room.settings.maxPlayers,
      gameState: room.gameState,
      gameMode: room.settings.gameMode,
      difficulty: room.settings.difficulty
    }));
  }

  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  }
}

export default GameEventsHandler;
