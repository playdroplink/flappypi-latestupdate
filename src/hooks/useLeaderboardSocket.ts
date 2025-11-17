import { useState, useEffect, useCallback, useRef } from 'react';
// Import leaderboard socket service conditionally
let leaderboardSocketService: any = null;
let LeaderboardEntry: any = null;
let LeaderboardUpdate: any = null;
let ScoreSubmission: any = null;
let UserRank: any = null;

try {
  const leaderboardServiceModule = require('@/services/leaderboardSocketService');
  leaderboardSocketService = leaderboardServiceModule.leaderboardSocketService;
  LeaderboardEntry = leaderboardServiceModule.LeaderboardEntry;
  LeaderboardUpdate = leaderboardServiceModule.LeaderboardUpdate;
  ScoreSubmission = leaderboardServiceModule.ScoreSubmission;
  UserRank = leaderboardServiceModule.UserRank;
} catch (error) {
  console.warn('Leaderboard socket service not available:', error);
}

export interface UseLeaderboardSocketOptions {
  gameMode: string;
  autoConnect?: boolean;
  autoJoin?: boolean;
}

export interface LeaderboardSocketState {
  isConnected: boolean;
  socketId: string | null;
  leaderboard: any[];
  userRank: number | null;
  totalPlayers: number;
  lastUpdate: string | null;
  error: string | null;
  isSubmitting: boolean;
}

export const useLeaderboardSocket = (options: UseLeaderboardSocketOptions) => {
  const { gameMode, autoConnect = true, autoJoin = true } = options;
  
  const [state, setState] = useState<LeaderboardSocketState>({
    isConnected: false,
    socketId: null,
    leaderboard: [],
    userRank: null,
    totalPlayers: 0,
    lastUpdate: null,
    error: leaderboardSocketService ? null : 'Socket.IO not available',
    isSubmitting: false
  });

  // If leaderboard service is not available, return default state
  if (!leaderboardSocketService) {
    return {
      ...state,
      submitScore: () => {},
      refreshLeaderboard: () => {},
      getUserRank: () => {},
      clearError: () => {}
    };
  }

  const previousGameMode = useRef<string>(gameMode);
  const isSubmittingRef = useRef<boolean>(false);

  // Update state helper
  const updateState = useCallback((updates: Partial<LeaderboardSocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle connection events
  const handleConnection = useCallback((data: { socketId: string }) => {
    updateState({
      isConnected: true,
      socketId: data.socketId,
      error: null
    });
  }, [updateState]);

  const handleDisconnection = useCallback((data: { reason: string }) => {
    updateState({
      isConnected: false,
      socketId: null,
      error: `Disconnected: ${data.reason}`
    });
  }, [updateState]);

  const handleError = useCallback((data: { message: string; error?: string; type?: string }) => {
    updateState({
      error: data.message,
      isConnected: false
    });
  }, [updateState]);

  // Handle leaderboard data
  const handleLeaderboardData = useCallback((data: any) => {
    if (data.gameMode === gameMode) {
      updateState({
        leaderboard: data.leaderboard,
        totalPlayers: data.leaderboard.length,
        lastUpdate: data.timestamp,
        error: null
      });
    }
  }, [gameMode, updateState]);

  const handleLeaderboardUpdate = useCallback((data: any) => {
    if (data.gameMode === gameMode) {
      updateState({
        leaderboard: data.leaderboard,
        totalPlayers: data.leaderboard.length,
        lastUpdate: data.timestamp,
        error: null
      });
    }
  }, [gameMode, updateState]);

  // Handle score submission
  const handleScoreSubmitted = useCallback((data: any) => {
    isSubmittingRef.current = false;
    updateState({
      isSubmitting: false,
      error: null
    });
  }, [updateState]);

  const handleScoreSubmissionError = useCallback((data: { message: string }) => {
    isSubmittingRef.current = false;
    updateState({
      isSubmitting: false,
      error: data.message
    });
  }, [updateState]);

  // Handle user rank
  const handleUserRank = useCallback((data: any) => {
    if (data.game_mode === gameMode) {
      updateState({
        userRank: data.rank,
        totalPlayers: data.total_players
      });
    }
  }, [gameMode, updateState]);

  // Initialize socket connection
  useEffect(() => {
    if (autoConnect) {
      // Set up event listeners
      leaderboardSocketService.on('connection', handleConnection);
      leaderboardSocketService.on('disconnection', handleDisconnection);
      leaderboardSocketService.on('error', handleError);
      leaderboardSocketService.on('leaderboard_data', handleLeaderboardData);
      leaderboardSocketService.on('leaderboard_update', handleLeaderboardUpdate);
      leaderboardSocketService.on('score_submitted', handleScoreSubmitted);
      leaderboardSocketService.on('score_submission_error', handleScoreSubmissionError);
      leaderboardSocketService.on('user_rank', handleUserRank);

      // Update connection status
      const status = leaderboardSocketService.getConnectionStatus();
      updateState({
        isConnected: status.connected,
        socketId: status.socketId
      });
    }

    return () => {
      // Clean up event listeners
      leaderboardSocketService.off('connection', handleConnection);
      leaderboardSocketService.off('disconnection', handleDisconnection);
      leaderboardSocketService.off('error', handleError);
      leaderboardSocketService.off('leaderboard_data', handleLeaderboardData);
      leaderboardSocketService.off('leaderboard_update', handleLeaderboardUpdate);
      leaderboardSocketService.off('score_submitted', handleScoreSubmitted);
      leaderboardSocketService.off('score_submission_error', handleScoreSubmissionError);
      leaderboardSocketService.off('user_rank', handleUserRank);
    };
  }, [autoConnect, handleConnection, handleDisconnection, handleError, handleLeaderboardData, handleLeaderboardUpdate, handleScoreSubmitted, handleScoreSubmissionError, handleUserRank, updateState]);

  // Handle game mode changes
  useEffect(() => {
    if (previousGameMode.current !== gameMode) {
      // Leave previous game mode room
      if (previousGameMode.current) {
        leaderboardSocketService.leaveLeaderboard(previousGameMode.current);
      }
      
      // Join new game mode room
      if (autoJoin && leaderboardSocketService.isSocketConnected()) {
        leaderboardSocketService.joinLeaderboard(gameMode);
      }
      
      previousGameMode.current = gameMode;
    }
  }, [gameMode, autoJoin]);

  // Auto-join when connected
  useEffect(() => {
    if (autoJoin && state.isConnected) {
      leaderboardSocketService.joinLeaderboard(gameMode);
    }
  }, [state.isConnected, gameMode, autoJoin]);

  // Methods
  const submitScore = useCallback((scoreData: any) => {
    if (isSubmittingRef.current) {
      console.warn('Score submission already in progress');
      return;
    }

    isSubmittingRef.current = true;
    updateState({ isSubmitting: true, error: null });
    
    leaderboardSocketService.submitScore(scoreData);
  }, [updateState]);

  const refreshLeaderboard = useCallback(() => {
    leaderboardSocketService.refreshLeaderboard(gameMode);
  }, [gameMode]);

  const getUserRank = useCallback((piUserId: string) => {
    leaderboardSocketService.getUserRank(piUserId, gameMode);
  }, [gameMode]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    ...state,
    submitScore,
    refreshLeaderboard,
    getUserRank,
    clearError
  };
};

export default useLeaderboardSocket;
