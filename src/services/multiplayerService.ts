// Socket.IO client will be loaded dynamically
declare global {
  interface Window {
    io: any;
  }
}

export interface Player {
  id: string;
  username: string;
  score: number;
  x: number;
  y: number;
  velocity: number;
  isAlive: boolean;
  character: string;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameMode: 'classic' | 'endless' | 'race';
  status: 'waiting' | 'playing' | 'gameOver';
  obstacles: any[];
  gameStartTime: number | null;
}

interface GameState {
  isConnected: boolean;
  currentRoom: Room | null;
  players: Player[];
  obstacles: any[];
  gameStatus: 'waiting' | 'playing' | 'gameOver';
  error: string | null;
}

class MultiplayerService {
  private socket: any | null = null;
  private gameState: GameState = {
    isConnected: false,
    currentRoom: null,
    players: [],
    obstacles: [],
    gameStatus: 'waiting',
    error: null,
  };
  private listeners: { [event: string]: Function[] } = {};

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // Check if we're in a development environment and skip WebSocket if server is not available
    const isDevelopment = import.meta.env.DEV;
    const skipWebSocket = isDevelopment && !import.meta.env.VITE_WEBSOCKET_URL;
    
    if (skipWebSocket) {
      console.log('🔧 [MULTIPLAYER] Skipping WebSocket connection in development mode');
      return;
    }
    
    // Load Socket.IO client dynamically
    if (typeof window !== 'undefined' && window.io) {
      // Connect to WebSocket server
      this.socket = window.io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3009', {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 5000, // 5 second timeout
        reconnection: false, // Disable auto-reconnection to prevent spam
      });
    } else {
      console.warn('Socket.IO client not loaded. Please include socket.io-client in your HTML.');
      return;
    }

    this.socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      this.gameState.isConnected = true;
      this.emit('connection', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
      this.gameState.isConnected = false;
      this.gameState.currentRoom = null;
      this.gameState.players = [];
      this.gameState.gameStatus = 'waiting';
      this.emit('disconnection', { disconnected: true });
    });

    this.socket.on('error', (message: string) => {
      console.error('Multiplayer error:', message);
      this.gameState.error = message;
      this.emit('error', { message });
    });

    this.socket.on('connect_error', (error: any) => {
      console.warn('🔧 [MULTIPLAYER] Connection failed (this is normal in development):', error.message);
      // Don't treat connection errors as fatal in development
      if (!import.meta.env.DEV) {
        this.gameState.error = 'Failed to connect to multiplayer server';
        this.emit('error', { message: 'Connection failed' });
      }
    });

    this.socket.on('room_created', (room: Room) => {
      console.log('Room created:', room);
      this.gameState.currentRoom = room;
      this.gameState.players = room.players;
      this.gameState.gameStatus = room.status;
      this.emit('room_created', room);
    });

    this.socket.on('room_joined', (room: Room) => {
      console.log('Room joined:', room);
      this.gameState.currentRoom = room;
      this.gameState.players = room.players;
      this.gameState.gameStatus = room.status;
      this.emit('room_joined', room);
    });

    this.socket.on('room_updated', (room: Room) => {
      console.log('Room updated:', room);
      this.gameState.currentRoom = room;
      this.gameState.players = room.players;
      this.gameState.gameStatus = room.status;
      this.emit('room_updated', room);
    });

    this.socket.on('player_joined', (player: Player) => {
      console.log('Player joined:', player);
      this.gameState.players = [...this.gameState.players, player];
      this.emit('player_joined', player);
    });

    this.socket.on('player_left', (playerId: string) => {
      console.log('Player left:', playerId);
      this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
      this.emit('player_left', playerId);
    });

    this.socket.on('player_moved', (player: Player) => {
      this.gameState.players = this.gameState.players.map(p => p.id === player.id ? player : p);
      this.emit('player_moved', player);
    });

    this.socket.on('score_updated', (player: Player) => {
      this.gameState.players = this.gameState.players.map(p => p.id === player.id ? player : p);
      this.emit('score_updated', player);
    });

    this.socket.on('game_started', (room: Room) => {
      console.log('Game started:', room);
      this.gameState.currentRoom = room;
      this.gameState.gameStatus = 'playing';
      this.gameState.obstacles = room.obstacles;
      this.emit('game_started', room);
    });

    this.socket.on('game_ended', (room: Room) => {
      console.log('Game ended:', room);
      this.gameState.currentRoom = room;
      this.gameState.gameStatus = 'gameOver';
      this.emit('game_ended', room);
    });

    this.socket.on('game_state_update', (state: { players: Player[], obstacles: any[] }) => {
      this.gameState.players = state.players;
      this.gameState.obstacles = state.obstacles;
      this.emit('game_state_update', state);
    });
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }

  // Room management
  public getSocketId(): string | null {
    return this.socket?.id || null;
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public createRoom(roomName: string, username: string, maxPlayers: number, gameMode: 'classic' | 'endless' | 'race') {
    if (this.socket) {
      this.socket.emit('create_room', { roomName, username, maxPlayers, gameMode });
    }
  }

  public joinRoom(roomId: string, username: string) {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, username });
    }
  }

  public leaveRoom() {
    if (this.socket && this.gameState.currentRoom) {
      this.socket.emit('leave_room', this.gameState.currentRoom.id);
      this.gameState.currentRoom = null;
      this.gameState.players = [];
      this.gameState.gameStatus = 'waiting';
      this.emit('room_left', {});
    }
  }

  // Game actions
  public startGame() {
    if (this.socket && this.gameState.currentRoom) {
      this.socket.emit('start_game', this.gameState.currentRoom.id);
    }
  }

  public sendPlayerMove(x: number, y: number, velocity: number, isAlive: boolean) {
    if (this.socket && this.gameState.currentRoom) {
      this.socket.emit('player_move', { roomId: this.gameState.currentRoom.id, x, y, velocity, isAlive });
    }
  }

  public sendScoreUpdate(score: number) {
    if (this.socket && this.gameState.currentRoom) {
      this.socket.emit('score_update', { roomId: this.gameState.currentRoom.id, score });
    }
  }

  // Cleanup
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.gameState.isConnected = false;
    this.listeners = {};
  }
}

// Singleton instance
export const multiplayerService = new MultiplayerService();
export default multiplayerService;
