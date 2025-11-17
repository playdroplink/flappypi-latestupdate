// Input validation utilities for Socket.IO events
class Validators {
  constructor(config) {
    this.config = config;
  }

  // Player name validation
  validatePlayerName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Player name is required' };
    }

    if (name.length < 1 || name.length > this.config.security.maxPlayerNameLength) {
      return { 
        valid: false, 
        error: `Player name must be between 1 and ${this.config.security.maxPlayerNameLength} characters` 
      };
    }

    // Check for valid characters (alphanumeric, spaces, and common symbols)
    const validNameRegex = /^[a-zA-Z0-9\s\-_\.]+$/;
    if (!validNameRegex.test(name)) {
      return { 
        valid: false, 
        error: 'Player name contains invalid characters' 
      };
    }

    return { valid: true };
  }

  // Room name validation
  validateRoomName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Room name is required' };
    }

    if (name.length < 1 || name.length > this.config.security.maxRoomNameLength) {
      return { 
        valid: false, 
        error: `Room name must be between 1 and ${this.config.security.maxRoomNameLength} characters` 
      };
    }

    return { valid: true };
  }

  // Game mode validation
  validateGameMode(mode) {
    const validModes = ['classic', 'endless', 'challenge'];
    if (!validModes.includes(mode)) {
      return { 
        valid: false, 
        error: `Invalid game mode. Must be one of: ${validModes.join(', ')}` 
      };
    }
    return { valid: true };
  }

  // Difficulty validation
  validateDifficulty(difficulty) {
    const validDifficulties = ['easy', 'normal', 'hard', 'expert'];
    if (!validDifficulties.includes(difficulty)) {
      return { 
        valid: false, 
        error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` 
      };
    }
    return { valid: true };
  }

  // Game action validation
  validateGameAction(action, data) {
    const validActions = ['jump', 'collision', 'score', 'pipe_update'];
    
    if (!validActions.includes(action)) {
      return { 
        valid: false, 
        error: `Invalid game action. Must be one of: ${validActions.join(', ')}` 
      };
    }

    // Validate action-specific data
    switch (action) {
      case 'jump':
        // No additional data needed for jump
        break;
      
      case 'collision':
        if (!data || typeof data !== 'object') {
          return { valid: false, error: 'Collision data is required' };
        }
        break;
      
      case 'score':
        if (!data || typeof data.score !== 'number' || data.score < 0) {
          return { valid: false, error: 'Valid score data is required' };
        }
        break;
      
      case 'pipe_update':
        if (!data || !Array.isArray(data.pipes)) {
          return { valid: false, error: 'Pipe data array is required' };
        }
        break;
    }

    return { valid: true };
  }

  // Socket ID validation
  validateSocketId(socketId) {
    if (!socketId || typeof socketId !== 'string') {
      return { valid: false, error: 'Invalid socket ID' };
    }
    return { valid: true };
  }

  // Room ID validation
  validateRoomId(roomId) {
    if (!roomId || typeof roomId !== 'string') {
      return { valid: false, error: 'Invalid room ID' };
    }
    
    // Check if room ID follows expected format
    const roomIdRegex = /^room_\d+_[a-zA-Z0-9]+$/;
    if (!roomIdRegex.test(roomId)) {
      return { valid: false, error: 'Invalid room ID format' };
    }
    
    return { valid: true };
  }

  // Sanitize input
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  }

  // Validate event data structure
  validateEventData(event, data) {
    switch (event) {
      case 'join_lobby':
        return this.validatePlayerName(data?.playerName);
      
      case 'create_room':
        return this.validateRoomName(data?.roomName) && 
               this.validateGameMode(data?.gameMode) && 
               this.validateDifficulty(data?.difficulty);
      
      case 'join_room':
        return this.validateRoomId(data?.roomId);
      
      case 'player_ready':
        return typeof data?.ready === 'boolean';
      
      case 'game_action':
        return this.validateGameAction(data?.action, data?.data);
      
      default:
        return { valid: true };
    }
  }
}

export default Validators;
