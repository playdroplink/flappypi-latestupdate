import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  velocity: number;
  score: number;
  isAlive: boolean;
  isReady: boolean;
  character?: string;
  color?: string;
}

export interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  gameMode: string;
  hostId: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'finished';
  settings: {
    obstacles: boolean;
    powerUps: boolean;
    timeLimit: number;
  };
  createdAt: Date;
  gameStartTime?: Date;
  gameEndTime?: Date;
}

class ImprovedMultiplayerService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      // Try to connect to the multiplayer server
      this.socket = io('ws://localhost:3009', {
        transports: ['websocket', 'polling'],
        timeout: 3000, // Reduced timeout
        reconnection: false, // Disable auto-reconnection to prevent console errors
        reconnectionAttempts: 0,
        reconnectionDelay: 1000,
        forceNew: true,
        autoConnect: false, // Don't connect automatically
        upgrade: true,
        rememberUpgrade: false,
      });

      this.socket.on('connect', () => {
        console.log('Connected to multiplayer server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { socketId: this.socket?.id });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from multiplayer server:', reason);
        this.isConnected = false;
        this.emit('disconnection', { reason });
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Multiplayer server connection failed - this is normal if the server is not running');
        this.reconnectAttempts++;
        this.emit('error', { 
          message: 'Multiplayer server is not available. Please start the server to use multiplayer features.', 
          error: error.message,
          type: 'connection_failed'
        });
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { socketId: this.socket?.id });
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
        this.emit('error', { 
          message: 'Failed to reconnect to multiplayer server', 
          error: error.message 
        });
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Reconnection failed after maximum attempts');
        this.emit('error', { 
          message: 'Unable to connect to multiplayer server. Please check your connection and try again.' 
        });
      });

      // Game events
      this.socket.on('room_created', (data) => {
        this.emit('room_created', data);
      });

      this.socket.on('room_joined', (data) => {
        this.emit('room_joined', data);
      });

      this.socket.on('player_joined', (data) => {
        this.emit('player_joined', data);
      });

      this.socket.on('player_left', (data) => {
        this.emit('player_left', data);
      });

      this.socket.on('player_moved', (data) => {
        this.emit('player_moved', data);
      });

      this.socket.on('score_updated', (data) => {
        this.emit('score_updated', data);
      });

      this.socket.on('game_started', (data) => {
        this.emit('game_started', data);
      });

      this.socket.on('game_ended', (data) => {
        this.emit('game_ended', data);
      });

      this.socket.on('game_state_update', (data) => {
        this.emit('game_state_update', data);
      });

      this.socket.on('error', (data) => {
        this.emit('error', data);
      });

    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.emit('error', { 
        message: 'Failed to initialize multiplayer connection', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Connection methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Manual connection method
  async connect(): Promise<boolean> {
    if (!this.socket) {
      this.initializeSocket();
    }
    
    if (this.socket && !this.socket.connected) {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          resolve(true);
        });

        this.socket!.on('connect_error', () => {
          clearTimeout(timeout);
          resolve(false);
        });

        this.socket!.connect();
      });
    }
    
    return this.socket?.connected || false;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // Room management
  createRoom(data: { name: string; maxPlayers: number; gameMode: string }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.isSocketConnected()) {
        // Try to connect first
        const connected = await this.connect();
        if (!connected) {
          reject(new Error('Multiplayer server is not available. Please start the server or try again later.'));
          return;
        }
      }

      this.socket!.emit('create_room', data, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  }

  joinRoom(roomId: string, username: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.isSocketConnected()) {
        // Try to connect first
        const connected = await this.connect();
        if (!connected) {
          reject(new Error('Multiplayer server is not available. Please start the server or try again later.'));
          return;
        }
      }

      this.socket!.emit('join_room', { roomId, username }, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  leaveRoom(): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('leave_room');
    }
  }

  // Game actions
  startGame(): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('start_game');
    }
  }

  sendPlayerMove(x: number, y: number, velocity: number, isAlive: boolean): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('player_move', { x, y, velocity, isAlive });
    }
  }

  sendScoreUpdate(score: number): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('score_update', { score });
    }
  }

  // Utility methods
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }

  // Health check
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3009/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; socketId: string | null; reconnectAttempts: number } {
    return {
      connected: this.isSocketConnected(),
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
export const improvedMultiplayerService = new ImprovedMultiplayerService();
export default improvedMultiplayerService;
