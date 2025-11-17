import { useState, useEffect, useCallback, useRef } from 'react';
import { leaderboardWebSocketService, LeaderboardEntry, ScoreSubmission, UserRank } from '@/services/leaderboardWebSocketService';

export interface UseLeaderboardWebSocketOptions {
  gameMode: string;
  autoConnect?: boolean;
  autoJoin?: boolean;
}

export interface LeaderboardWebSocketState {
  isConnected: boolean;
  socketId: string | null;
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  totalPlayers: number;
  lastUpdate: string | null;
  error: string | null;
  isSubmitting: boolean;
  reconnectAttempts: number;
}

export const useLeaderboardWebSocket = (options: UseLeaderboardWebSocketOptions) => {
  const { gameMode, autoConnect = true, autoJoin = true } = options;
  
  const [state, setState] = useState<LeaderboardWebSocketState>({
    isConnected: false,
    socketId: null,
    leaderboard: [],
    userRank: null,
    totalPlayers: 0,
    lastUpdate: null,
    error: null,
    isSubmitting: false,
    reconnectAttempts: 0
  });

  const isInitialized = useRef(false);
  const currentGameMode = useRef(gameMode);

  // Update game mode when it changes
  useEffect(() => {
    if (currentGameMode.current !== gameMode) {
      console.log(`🎮 Game mode changed from ${currentGameMode.current} to ${gameMode}`);
      
      // Leave previous game mode
      if (currentGameMode.current) {
        leaderboardWebSocketService.leaveLeaderboard(currentGameMode.current);
      }
      
      // Join new game mode
      currentGameMode.current = gameMode;
      if (autoJoin && state.isConnected) {
        leaderboardWebSocketService.joinLeaderboard(gameMode);
      }
    }
  }, [gameMode, autoJoin, state.isConnected]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isInitialized.current && autoConnect) {
      console.log('🔌 Initializing WebSocket leaderboard connection');
      isInitialized.current = true;

      // Connection event handlers
      const handleConnection = (data: any) => {
        console.log('✅ WebSocket connected:', data);
        setState(prev => ({
          ...prev,
          isConnected: true,
          socketId: data.socketId,
          error: null,
          reconnectAttempts: 0
        }));

        // Auto-join game mode if enabled
        if (autoJoin) {
          leaderboardWebSocketService.joinLeaderboard(gameMode);
        }
      };

      const handleDisconnection = (data: any) => {
        console.log('🔌 WebSocket disconnected:', data);
        setState(prev => ({
          ...prev,
          isConnected: false,
          socketId: null,
          error: `Disconnected: ${data.reason || 'Unknown reason'}`
        }));
      };

      const handleError = (data: any) => {
        console.error('❌ WebSocket error:', data);
        setState(prev => ({
          ...prev,
          error: data.message || 'WebSocket connection error',
          isConnected: false
        }));
      };

      // Leaderboard event handlers
      const handleLeaderboardData = (data: any) => {
        console.log('📊 Leaderboard data received:', data);
        setState(prev => ({
          ...prev,
          leaderboard: data.leaderboard || [],
          lastUpdate: data.timestamp || new Date().toISOString(),
          totalPlayers: data.leaderboard?.length || 0
        }));
      };

      const handleScoreSubmitted = (data: any) => {
        console.log('📊 Score submitted:', data);
        setState(prev => ({
          ...prev,
          isSubmitting: false
        }));
      };

      const handleUserRank = (data: UserRank) => {
        console.log('🏆 User rank received:', data);
        setState(prev => ({
          ...prev,
          userRank: data.rank,
          totalPlayers: data.total_players
        }));
      };

      // Register event listeners
      leaderboardWebSocketService.on('connection', handleConnection);
      leaderboardWebSocketService.on('disconnection', handleDisconnection);
      leaderboardWebSocketService.on('error', handleError);
      leaderboardWebSocketService.on('leaderboard_data', handleLeaderboardData);
      leaderboardWebSocketService.on('score_submitted', handleScoreSubmitted);
      leaderboardWebSocketService.on('user_rank', handleUserRank);

      // Check initial connection status
      const connectionStatus = leaderboardWebSocketService.getConnectionStatus();
      setState(prev => ({
        ...prev,
        isConnected: connectionStatus.connected,
        socketId: connectionStatus.socketId,
        reconnectAttempts: connectionStatus.reconnectAttempts
      }));

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up WebSocket leaderboard connection');
        leaderboardWebSocketService.off('connection', handleConnection);
        leaderboardWebSocketService.off('disconnection', handleDisconnection);
        leaderboardWebSocketService.off('error', handleError);
        leaderboardWebSocketService.off('leaderboard_data', handleLeaderboardData);
        leaderboardWebSocketService.off('score_submitted', handleScoreSubmitted);
        leaderboardWebSocketService.off('user_rank', handleUserRank);
        
        if (currentGameMode.current) {
          leaderboardWebSocketService.leaveLeaderboard(currentGameMode.current);
        }
      };
    }
  }, [autoConnect, autoJoin, gameMode]);

  // Submit score
  const submitScore = useCallback(async (scoreData: ScoreSubmission) => {
    if (!state.isConnected) {
      console.warn('⚠️ WebSocket not connected, using HTTP fallback');
      setState(prev => ({ ...prev, isSubmitting: true }));
      
      try {
        const success = await leaderboardWebSocketService.submitScoreHTTP(scoreData);
        if (success) {
          // Refresh leaderboard after successful submission
          leaderboardWebSocketService.refreshLeaderboard(gameMode);
        }
        setState(prev => ({ ...prev, isSubmitting: false }));
        return success;
      } catch (error) {
        console.error('❌ HTTP score submission failed:', error);
        setState(prev => ({ 
          ...prev, 
          isSubmitting: false,
          error: 'Failed to submit score'
        }));
        return false;
      }
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    leaderboardWebSocketService.submitScore(scoreData);
    return true;
  }, [state.isConnected, gameMode]);

  // Refresh leaderboard
  const refreshLeaderboard = useCallback(() => {
    if (state.isConnected) {
      leaderboardWebSocketService.refreshLeaderboard(gameMode);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot refresh leaderboard');
    }
  }, [state.isConnected, gameMode]);

  // Get user rank
  const getUserRank = useCallback((piUserId: string) => {
    if (state.isConnected) {
      leaderboardWebSocketService.getUserRank(piUserId, gameMode);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot get user rank');
    }
  }, [state.isConnected, gameMode]);

  // Join leaderboard
  const joinLeaderboard = useCallback(() => {
    if (state.isConnected) {
      leaderboardWebSocketService.joinLeaderboard(gameMode);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot join leaderboard');
    }
  }, [state.isConnected, gameMode]);

  // Leave leaderboard
  const leaveLeaderboard = useCallback(() => {
    if (state.isConnected) {
      leaderboardWebSocketService.leaveLeaderboard(gameMode);
    }
  }, [state.isConnected, gameMode]);

  // Reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Manually reconnecting WebSocket');
    leaderboardWebSocketService.disconnect();
    setTimeout(() => {
      leaderboardWebSocketService.getConnectionStatus();
    }, 1000);
  }, []);

  return {
    ...state,
    submitScore,
    refreshLeaderboard,
    getUserRank,
    joinLeaderboard,
    leaveLeaderboard,
    reconnect
  };
};

export default useLeaderboardWebSocket;
