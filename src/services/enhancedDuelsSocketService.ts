// Enhanced Real-time Duels Socket.IO Service
// Based on Socket.IO v4 Client API documentation
// Following official emit cheatsheet patterns

import { io, Socket } from 'socket.io-client';

export interface DuelsPlayer {
  id: string;
  name: string;
  isHost: boolean;
  ready: boolean;
  connected: boolean;
  joinedAt: number;
}

export interface GameRoom {
  id: string;
  hostName: string;
  roomName: string;
  playerCount: number;
  maxPlayers: number;
  gameState: 'waiting' | 'playing' | 'finished';
  gameMode: string;
  difficulty: string;
}

export interface GameData {
  bird1: { x: number; y: number; velocity: number; score: number; alive: boolean };
  bird2: { x: number; y: number; velocity: number; score: number; alive: boolean };
  pipes: Array<{ x: number; topHeight: number; bottomY: number; passed: boolean }>;
  gameTime: number;
  winner: string | null;
}

export interface RoomState {
  roomId: string;
  gameState: 'waiting' | 'playing' | 'finished';
  players: DuelsPlayer[];
  gameData: GameData;
  settings: {
    maxPlayers: number;
    gameMode: string;
    difficulty: string;
    timeLimit: number;
  };
}

export interface DuelsSocketEvents {
  // Connection events
  'connected': (data: { connected: boolean }) => void;
  'disconnected': (data: { reason: string }) => void;
  
  // Lobby events
  'lobby_joined': (data: { playerId: string; playerName: string; availableRooms: GameRoom[] }) => void;
  'room_created': (data: GameRoom) => void;
  'room_deleted': (data: { roomId: string }) => void;
  
  // Room events
  'player_joined': (data: { playerId: string; playerName: string; room: RoomState }) => void;
  'player_left': (data: { playerId: string; room: RoomState }) => void;
  'player_disconnected': (data: { playerId: string; room: RoomState }) => void;
  'player_ready_changed': (data: { playerId: string; ready: boolean; canStart: boolean }) => void;
  
  // Game events
  'game_started': (data: { room: RoomState }) => void;
  'game_state_update': (data: { gameData: GameData; gameState: string }) => void;
  'game_ended': (data: { winner: string | null; finalScores: { bird1: number; bird2: number } }) => void;
  
  // Error events
  'error': (data: { message: string; type: string }) => void;
}

class EnhancedDuelsSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 3000;
  private eventListeners: Map<string, Function[]> = new Map();
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3009') {
    this.serverUrl = serverUrl;
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      // Connect to duels server with enhanced configuration
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        // Following Socket.IO v4 client API patterns
        auth: {
          clientType: 'flappypi-duels'
        },
        query: {
          version: '1.0.0'
        }
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize Socket.IO client:', error);
      this.emit('error', { 
        message: 'Failed to initialize Socket.IO client', 
        type: 'initialization_error' 
      });
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events following Socket.IO v4 patterns
    this.socket.on('connect', () => {
      console.log('🎮 Connected to Duels Server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Duels Server:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
      
      // Attempt reconnection following official patterns
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectTimeout);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.warn('❌ Duels Server connection failed:', error.message);
      this.emit('error', { 
        message: 'Duels server is not available. Please start the server to use multiplayer features.', 
        type: 'connection_failed' 
      });
    });

    // Game events following emit cheatsheet patterns
    this.socket.on('lobby_joined', (data) => {
      this.emit('lobby_joined', data);
    });

    this.socket.on('room_created', (data) => {
      this.emit('room_created', data);
    });

    this.socket.on('room_deleted', (data) => {
      this.emit('room_deleted', data);
    });

    this.socket.on('player_joined', (data) => {
      this.emit('player_joined', data);
    });

    this.socket.on('player_left', (data) => {
      this.emit('player_left', data);
    });

    this.socket.on('player_disconnected', (data) => {
      this.emit('player_disconnected', data);
    });

    this.socket.on('player_ready_changed', (data) => {
      this.emit('player_ready_changed', data);
    });

    this.socket.on('game_started', (data) => {
      this.emit('game_started', data);
    });

    this.socket.on('game_state_update', (data) => {
      this.emit('game_state_update', data);
    });

    this.socket.on('game_ended', (data) => {
      this.emit('game_ended', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      this.emit('error', data);
    });
  }

  // Connection management following Socket.IO v4 patterns
  async connect(): Promise<boolean> {
    if (!this.socket) {
      this.initializeSocket();
    }
    
    if (this.socket && !this.socket.connected) {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Socket connection timeout');
          resolve(false);
        }, 10000);

        const onConnect = () => {
          clearTimeout(timeout);
          this.socket!.off('connect', onConnect);
          this.socket!.off('connect_error', onError);
          console.log('✅ Connected to duels server');
          resolve(true);
        };

        const onError = (error: any) => {
          clearTimeout(timeout);
          this.socket!.off('connect', onConnect);
          this.socket!.off('connect_error', onError);
          console.warn('❌ Failed to connect to duels server:', error.message);
          resolve(false);
        };

        this.socket!.on('connect', onConnect);
        this.socket!.on('connect_error', onError);

        try {
          this.socket!.connect();
        } catch (error) {
          clearTimeout(timeout);
          console.error('Socket connection error:', error);
          resolve(false);
        }
      });
    }
    
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Event system following Socket.IO v4 patterns
  on<K extends keyof DuelsSocketEvents>(event: K, listener: DuelsSocketEvents[K]) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off<K extends keyof DuelsSocketEvents>(event: K, listener: DuelsSocketEvents[K]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit<K extends keyof DuelsSocketEvents>(event: K, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  // Lobby operations following emit cheatsheet patterns
  joinLobby(playerName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_lobby', { playerName });
    }
  }

  // Room operations with proper error handling
  createRoom(data: { roomName: string; gameMode: string; difficulty: string }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.isSocketConnected()) {
        const connected = await this.connect();
        if (!connected) {
          reject(new Error('Duels server is not available. Please start the server or try again later.'));
          return;
        }
      }

      // Using Socket.IO v4 emit with acknowledgment
      this.socket!.emit('create_room', data, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  }

  joinRoom(roomId: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.isSocketConnected()) {
        const connected = await this.connect();
        if (!connected) {
          reject(new Error('Duels server is not available. Please start the server or try again later.'));
          return;
        }
      }

      // Using Socket.IO v4 emit with acknowledgment
      this.socket!.emit('join_room', { roomId }, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  leaveRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room');
    }
  }

  // Game operations following Socket.IO v4 patterns
  setPlayerReady(ready: boolean) {
    if (this.socket && this.isConnected) {
      this.socket.emit('player_ready', { ready });
    }
  }

  startGame() {
    if (this.socket && this.isConnected) {
      this.socket.emit('start_game');
    }
  }

  sendGameAction(action: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('game_action', { action, data });
    }
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // Health check following Socket.IO v4 patterns
  async checkServerHealth(): Promise<boolean> {
    try {
      console.log('🔍 Checking duels server health...');
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        console.warn('❌ Health check failed: HTTP', response.status);
        return false;
      }
      
      const data = await response.json();
      const isHealthy = data.status === 'healthy';
      console.log(isHealthy ? '✅ Duels server is healthy' : '❌ Duels server is unhealthy');
      return isHealthy;
    } catch (error) {
      console.warn('❌ Duels server health check failed:', error);
      return false;
    }
  }

  // Get available rooms
  async getAvailableRooms(): Promise<GameRoom[]> {
    try {
      const response = await fetch(`${this.serverUrl}/api/rooms`);
      const data = await response.json();
      return data.rooms || [];
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      return [];
    }
  }

  // Test connection following Socket.IO v4 patterns
  async testConnection(): Promise<{ health: boolean; socket: boolean }> {
    console.log('🧪 Testing duels server connection...');
    
    const healthCheck = await this.checkServerHealth();
    const socketConnected = this.isSocketConnected();
    
    console.log(`📊 Health Check: ${healthCheck ? '✅' : '❌'}`);
    console.log(`📡 Socket Connected: ${socketConnected ? '✅' : '❌'}`);
    
    return {
      health: healthCheck,
      socket: socketConnected
    };
  }

  // Advanced Socket.IO v4 features
  useTimeout(timeout: number) {
    if (this.socket) {
      return this.socket.timeout(timeout);
    }
    return null;
  }

  useVolatile() {
    if (this.socket) {
      return this.socket.volatile;
    }
    return null;
  }

  // Catch-all listeners following Socket.IO v4 patterns
  onAny(callback: (event: string, ...args: any[]) => void) {
    if (this.socket) {
      this.socket.onAny(callback);
    }
  }

  onAnyOutgoing(callback: (event: string, ...args: any[]) => void) {
    if (this.socket) {
      this.socket.onAnyOutgoing(callback);
    }
  }
}

// Create singleton instance
export const enhancedDuelsSocketService = new EnhancedDuelsSocketService();

// Export types for use in components
export type { DuelsSocketEvents, GameRoom, RoomState, GameData, DuelsPlayer };
