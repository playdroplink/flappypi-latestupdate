// Import socket.io-client conditionally
let io: any = null;
let Socket: any = null;

try {
  const socketIOClient = require('socket.io-client');
  io = socketIOClient.io;
  Socket = socketIOClient.Socket;
  console.log('✅ Socket.IO client loaded successfully');
} catch (error) {
  console.warn('⚠️ Socket.IO client not available - leaderboard will work in offline mode');
  // Set to null explicitly to ensure clean fallback
  io = null;
  Socket = null;
}

export interface LeaderboardEntry {
  pi_user_id: string;
  username: string;
  highest_score: number;
  game_mode: string;
  challenge_type?: string;
  total_games: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardUpdate {
  gameMode: string;
  leaderboard: LeaderboardEntry[];
  timestamp: string;
}

export interface ScoreSubmission {
  pi_user_id: string;
  username: string;
  score: number;
  game_mode: string;
  challenge_type?: string;
}

export interface UserRank {
  pi_user_id: string;
  game_mode: string;
  rank: number | null;
  total_players: number;
}

class LeaderboardSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3002') {
    this.serverUrl = serverUrl;
    
    // Only attempt connection if Socket.IO is available and not in development/sandbox mode
    if (io && typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && 
        !window.location.hostname.includes('127.0.0.1') &&
        !window.location.hostname.includes('sandbox')) {
      this.initializeSocket();
    } else {
      if (!io) {
        console.log('🔌 Socket.IO not available, leaderboard will work in offline mode');
      } else {
        console.log('🔌 Socket.IO auto-connection disabled for development/sandbox mode');
      }
    }
  }

  private initializeSocket() {
    if (!io) {
      console.warn('Socket.IO not available, leaderboard will work in offline mode');
      return;
    }

    try {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        forceNew: true,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to leaderboard server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { socketId: this.socket?.id });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from leaderboard server:', reason);
        this.isConnected = false;
        this.emit('disconnection', { reason });
      });

      this.socket.on('connect_error', (error) => {
        console.warn('🔌 Leaderboard server connection failed - this is normal in development/sandbox mode');
        this.reconnectAttempts++;
        this.emit('error', { 
          message: 'Leaderboard server is not available. Real-time updates will be disabled.', 
          error: error.message,
          type: 'connection_failed'
        });
      });

      // Leaderboard events
      this.socket.on('leaderboard_data', (data: LeaderboardUpdate) => {
        this.emit('leaderboard_data', data);
      });

      this.socket.on('leaderboard_update', (data: LeaderboardUpdate) => {
        this.emit('leaderboard_update', data);
      });

      this.socket.on('score_submitted', (data: any) => {
        this.emit('score_submitted', data);
      });

      this.socket.on('score_submission_error', (data: any) => {
        this.emit('score_submission_error', data);
      });

      this.socket.on('user_rank', (data: UserRank) => {
        this.emit('user_rank', data);
      });

      this.socket.on('error', (data: any) => {
        this.emit('error', data);
      });

    } catch (error) {
      console.error('Failed to initialize leaderboard socket:', error);
      this.emit('error', { 
        message: 'Failed to initialize leaderboard connection', 
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

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // Leaderboard methods
  joinLeaderboard(gameMode: string): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('join_leaderboard', gameMode);
    }
  }

  leaveLeaderboard(gameMode: string): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('leave_leaderboard', gameMode);
    }
  }

  submitScore(scoreData: ScoreSubmission): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('submit_score', scoreData);
    } else {
      console.warn('Cannot submit score: not connected to leaderboard server');
      this.emit('score_submission_error', {
        message: 'Not connected to leaderboard server'
      });
    }
  }

  refreshLeaderboard(gameMode: string): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('refresh_leaderboard', gameMode);
    }
  }

  getUserRank(piUserId: string, gameMode: string): void {
    if (this.isSocketConnected()) {
      this.socket!.emit('get_user_rank', { pi_user_id: piUserId, game_mode: gameMode });
    }
  }

  // HTTP API methods (fallback when Socket.IO is not available)
  async getLeaderboardData(gameMode: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      console.log('📊 Fetching leaderboard data via HTTP fallback');
      const response = await fetch(`${this.serverUrl}/api/leaderboard/${gameMode}?limit=${limit}`);
      if (!response.ok) {
        console.warn('⚠️ Leaderboard server not available, returning empty leaderboard');
        return [];
      }
      const data = await response.json();
      return data.leaderboard || [];
    } catch (error) {
      console.warn('⚠️ Failed to fetch leaderboard data (server not available):', error);
      return [];
    }
  }

  async submitScoreHTTP(scoreData: ScoreSubmission): Promise<boolean> {
    try {
      console.log('📊 Submitting score via HTTP fallback');
      const response = await fetch(`${this.serverUrl}/api/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        console.warn('⚠️ Leaderboard server not available, score not submitted');
        return false;
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.warn('⚠️ Failed to submit score via HTTP (server not available):', error);
      return false;
    }
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
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

  getConnectionStatus(): { connected: boolean; socketId: string | null; reconnectAttempts: number } {
    return {
      connected: this.isSocketConnected(),
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance with fallback
let leaderboardSocketService: any;

// Create a minimal fallback service that doesn't require Socket.IO
const createFallbackService = () => ({
  isSocketConnected: () => false,
  getSocketId: () => null,
  joinLeaderboard: () => console.log('🔌 Leaderboard service unavailable (offline mode)'),
  leaveLeaderboard: () => console.log('🔌 Leaderboard service unavailable (offline mode)'),
  submitScore: () => console.log('🔌 Leaderboard service unavailable (offline mode)'),
  refreshLeaderboard: () => console.log('🔌 Leaderboard service unavailable (offline mode)'),
  getUserRank: () => console.log('🔌 Leaderboard service unavailable (offline mode)'),
  getLeaderboardData: async () => {
    console.log('📊 Leaderboard service unavailable, returning empty leaderboard');
    return [];
  },
  submitScoreHTTP: async () => {
    console.log('📊 Leaderboard service unavailable, score not submitted');
    return false;
  },
  checkServerHealth: async () => false,
  disconnect: () => {},
  getConnectionStatus: () => ({ connected: false, socketId: null, reconnectAttempts: 0 }),
  on: () => {},
  off: () => {}
});

try {
  if (io) {
    leaderboardSocketService = new LeaderboardSocketService();
  } else {
    // Use fallback service when socket.io is not available
    leaderboardSocketService = createFallbackService();
    console.log('🔌 Using fallback leaderboard service (Socket.IO not available)');
  }
} catch (error) {
  console.warn('⚠️ Failed to initialize leaderboard service:', error);
  // Use fallback service as last resort
  leaderboardSocketService = createFallbackService();
}

export { leaderboardSocketService };
export default leaderboardSocketService;
