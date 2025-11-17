// Real WebSocket Leaderboard Service
// Provides real-time leaderboard updates using native WebSocket connections

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

export interface WebSocketMessage {
  type: 'leaderboard_update' | 'score_submitted' | 'user_rank' | 'connection_status' | 'error' | 'ping' | 'join_leaderboard' | 'leave_leaderboard' | 'submit_score' | 'refresh_leaderboard' | 'get_user_rank';
  data: any;
  timestamp: string;
}

class LeaderboardWebSocketService {
  private static instance: LeaderboardWebSocketService;
  private websocket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private eventListeners: Map<string, Function[]> = new Map();
  private serverUrl: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isReconnecting = false;

  constructor(serverUrl: string = 'wss://flappypi-leaderboard.herokuapp.com') {
    this.serverUrl = serverUrl;
    // Don't auto-connect in sandbox mode to avoid connection errors
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      this.initializeWebSocket();
    } else {
      console.log('🔌 WebSocket auto-connection disabled for local development');
    }
  }

  static getInstance(serverUrl?: string): LeaderboardWebSocketService {
    if (!LeaderboardWebSocketService.instance) {
      LeaderboardWebSocketService.instance = new LeaderboardWebSocketService(serverUrl);
    }
    return LeaderboardWebSocketService.instance;
  }

  private initializeWebSocket() {
    try {
      console.log('🔌 Initializing WebSocket connection to:', this.serverUrl);
      this.websocket = new WebSocket(this.serverUrl);

      this.websocket.onopen = () => {
        console.log('✅ WebSocket connected to leaderboard server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        this.startHeartbeat();
        this.emit('connection', { 
          socketId: this.websocket?.url,
          timestamp: new Date().toISOString()
        });
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnection', { 
          code: event.code, 
          reason: event.reason,
          timestamp: new Date().toISOString()
        });
        
        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && !this.isReconnecting) {
          this.attemptReconnection();
        }
      };

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', { 
          message: 'WebSocket connection error',
          error: error,
          type: 'websocket_error'
        });
      };

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      this.emit('error', { 
        message: 'WebSocket initialization failed',
        error: error,
        type: 'initialization_error'
      });
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('📨 Received WebSocket message:', message.type);
    
    switch (message.type) {
      case 'leaderboard_update':
        this.emit('leaderboard_data', message.data);
        break;
      case 'score_submitted':
        this.emit('score_submitted', message.data);
        break;
      case 'user_rank':
        this.emit('user_rank', message.data);
        break;
      case 'connection_status':
        this.emit('connection_status', message.data);
        break;
      case 'error':
        this.emit('error', message.data);
        break;
      default:
        console.warn('⚠️ Unknown message type:', message.type);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'ping',
          data: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnection() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🛑 Max reconnection attempts reached or already reconnecting');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
    
    setTimeout(() => {
      this.initializeWebSocket();
      this.isReconnecting = false;
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
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
    return this.isConnected && this.websocket?.readyState === WebSocket.OPEN;
  }

  getSocketId(): string | null {
    return this.websocket?.url || null;
  }

  // Leaderboard methods
  joinLeaderboard(gameMode: string): void {
    console.log(`🎮 Joining leaderboard for ${gameMode}`);
    this.sendMessage({
      type: 'join_leaderboard',
      data: { gameMode },
      timestamp: new Date().toISOString()
    });
  }

  leaveLeaderboard(gameMode: string): void {
    console.log(`🎮 Leaving leaderboard for ${gameMode}`);
    this.sendMessage({
      type: 'leave_leaderboard',
      data: { gameMode },
      timestamp: new Date().toISOString()
    });
  }

  submitScore(scoreData: ScoreSubmission): void {
    console.log('📊 Submitting score via WebSocket:', scoreData);
    this.sendMessage({
      type: 'submit_score',
      data: scoreData,
      timestamp: new Date().toISOString()
    });
  }

  refreshLeaderboard(gameMode: string): void {
    console.log(`🔄 Refreshing leaderboard for ${gameMode}`);
    this.sendMessage({
      type: 'refresh_leaderboard',
      data: { gameMode },
      timestamp: new Date().toISOString()
    });
  }

  getUserRank(piUserId: string, gameMode: string): void {
    console.log(`🏆 Getting user rank for ${piUserId} in ${gameMode}`);
    this.sendMessage({
      type: 'get_user_rank',
      data: { piUserId, gameMode },
      timestamp: new Date().toISOString()
    });
  }

  // HTTP API methods (fallback to localStorage when WebSocket fails)
  async getLeaderboardData(gameMode: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      // Try to get from localStorage as fallback
      const stored = localStorage.getItem(`flappypi-leaderboard-${gameMode}`);
      if (stored) {
        return JSON.parse(stored).slice(0, limit);
      }
    } catch (error) {
      console.error('Failed to load leaderboard from localStorage:', error);
    }
    return [];
  }

  async submitScoreHTTP(scoreData: ScoreSubmission): Promise<boolean> {
    try {
      // Store in localStorage as fallback
      const key = `flappypi-leaderboard-${scoreData.game_mode}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      const newEntry: LeaderboardEntry = {
        pi_user_id: scoreData.pi_user_id,
        username: scoreData.username,
        highest_score: scoreData.score,
        game_mode: scoreData.game_mode,
        challenge_type: scoreData.challenge_type,
        total_games: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Update or add entry
      const existingIndex = existing.findIndex((entry: LeaderboardEntry) => 
        entry.pi_user_id === scoreData.pi_user_id
      );

      if (existingIndex >= 0) {
        if (scoreData.score > existing[existingIndex].highest_score) {
          existing[existingIndex] = newEntry;
        }
      } else {
        existing.push(newEntry);
      }

      // Sort by score and save
      existing.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.highest_score - a.highest_score);
      localStorage.setItem(key, JSON.stringify(existing));

      return true;
    } catch (error) {
      console.error('Failed to submit score to localStorage:', error);
      return false;
    }
  }

  async checkServerHealth(): Promise<boolean> {
    return this.isSocketConnected();
  }

  // Utility methods
  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket');
    this.stopHeartbeat();
    if (this.websocket) {
      this.websocket.close(1000, 'Manual disconnect');
      this.websocket = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }

  getConnectionStatus(): { connected: boolean; socketId: string | null; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
export const leaderboardWebSocketService = LeaderboardWebSocketService.getInstance();
export default leaderboardWebSocketService;
