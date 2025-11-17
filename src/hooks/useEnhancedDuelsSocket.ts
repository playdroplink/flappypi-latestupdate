import { useState, useEffect, useCallback, useRef } from 'react';
import { enhancedDuelsSocketService, GameRoom, RoomState, GameData, DuelsPlayer } from '../services/enhancedDuelsSocketService';

export interface EnhancedDuelsSocketState {
  // Connection state
  isConnected: boolean;
  socketId: string | null;
  isConnecting: boolean;
  
  // Lobby state
  availableRooms: GameRoom[];
  playerName: string;
  
  // Room state
  currentRoom: RoomState | null;
  isInRoom: boolean;
  isHost: boolean;
  canStartGame: boolean;
  
  // Game state
  gameData: GameData | null;
  gameState: 'waiting' | 'playing' | 'finished';
  winner: string | null;
  
  // Error handling
  error: string | null;
  isSubmitting: boolean;
  
  // Server status
  serverHealth: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export interface EnhancedDuelsSocketActions {
  // Connection actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  checkServerHealth: () => Promise<boolean>;
  testConnection: () => Promise<{ health: boolean; socket: boolean }>;
  
  // Lobby actions
  joinLobby: (playerName: string) => void;
  refreshRooms: () => Promise<void>;
  
  // Room actions
  createRoom: (data: { roomName: string; gameMode: string; difficulty: string }) => Promise<any>;
  joinRoom: (roomId: string) => Promise<any>;
  leaveRoom: () => void;
  
  // Game actions
  setPlayerReady: (ready: boolean) => void;
  startGame: () => void;
  sendGameAction: (action: string, data?: any) => void;
  
  // Utility actions
  clearError: () => void;
  getServerStats: () => Promise<any>;
}

export function useEnhancedDuelsSocket(options: {
  autoConnect?: boolean;
  playerName?: string;
} = {}): EnhancedDuelsSocketState & EnhancedDuelsSocketActions {
  const [state, setState] = useState<EnhancedDuelsSocketState>({
    isConnected: false,
    socketId: null,
    isConnecting: false,
    availableRooms: [],
    playerName: options.playerName || '',
    currentRoom: null,
    isInRoom: false,
    isHost: false,
    canStartGame: false,
    gameData: null,
    gameState: 'waiting',
    winner: null,
    error: null,
    isSubmitting: false,
    serverHealth: false,
    connectionQuality: 'disconnected'
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionQualityRef = useRef<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');

  // Connection management with enhanced features
  const connect = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      const connected = await enhancedDuelsSocketService.connect();
      setState(prev => ({ 
        ...prev, 
        isConnected: connected,
        isConnecting: false,
        socketId: enhancedDuelsSocketService.getSocketId(),
        connectionQuality: connected ? 'excellent' : 'disconnected'
      }));
      return connected;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        connectionQuality: 'disconnected'
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    enhancedDuelsSocketService.disconnect();
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      socketId: null,
      currentRoom: null,
      isInRoom: false,
      isHost: false,
      gameData: null,
      gameState: 'waiting',
      connectionQuality: 'disconnected'
    }));
  }, []);

  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      const isHealthy = await enhancedDuelsSocketService.checkServerHealth();
      setState(prev => ({ 
        ...prev, 
        serverHealth: isHealthy,
        error: isHealthy ? null : 'Server is not available'
      }));
      return isHealthy;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        serverHealth: false,
        error: 'Server health check failed'
      }));
      return false;
    }
  }, []);

  const testConnection = useCallback(async (): Promise<{ health: boolean; socket: boolean }> => {
    try {
      const result = await enhancedDuelsSocketService.testConnection();
      setState(prev => ({ 
        ...prev, 
        serverHealth: result.health,
        isConnected: result.socket,
        connectionQuality: result.socket ? 'excellent' : 'disconnected'
      }));
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        serverHealth: false,
        isConnected: false,
        connectionQuality: 'disconnected'
      }));
      return { health: false, socket: false };
    }
  }, []);

  // Lobby actions
  const joinLobby = useCallback((playerName: string) => {
    setState(prev => ({ ...prev, playerName }));
    enhancedDuelsSocketService.joinLobby(playerName);
  }, []);

  const refreshRooms = useCallback(async () => {
    try {
      const rooms = await enhancedDuelsSocketService.getAvailableRooms();
      setState(prev => ({ ...prev, availableRooms: rooms }));
    } catch (error) {
      console.error('Failed to refresh rooms:', error);
    }
  }, []);

  // Room actions
  const createRoom = useCallback(async (data: { roomName: string; gameMode: string; difficulty: string }) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const result = await enhancedDuelsSocketService.createRoom(data);
      setState(prev => ({ 
        ...prev, 
        currentRoom: result.room,
        isInRoom: true,
        isHost: true,
        isSubmitting: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create room',
        isSubmitting: false
      }));
      throw error;
    }
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const result = await enhancedDuelsSocketService.joinRoom(roomId);
      setState(prev => ({ 
        ...prev, 
        currentRoom: result.room,
        isInRoom: true,
        isHost: false,
        isSubmitting: false
      }));
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to join room',
        isSubmitting: false
      }));
      throw error;
    }
  }, []);

  const leaveRoom = useCallback(() => {
    enhancedDuelsSocketService.leaveRoom();
    setState(prev => ({ 
      ...prev, 
      currentRoom: null,
      isInRoom: false,
      isHost: false,
      canStartGame: false,
      gameData: null,
      gameState: 'waiting'
    }));
  }, []);

  // Game actions
  const setPlayerReady = useCallback((ready: boolean) => {
    enhancedDuelsSocketService.setPlayerReady(ready);
  }, []);

  const startGame = useCallback(() => {
    enhancedDuelsSocketService.startGame();
  }, []);

  const sendGameAction = useCallback((action: string, data?: any) => {
    enhancedDuelsSocketService.sendGameAction(action, data);
  }, []);

  // Utility actions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getServerStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3009/api/stats');
      const stats = await response.json();
      return stats;
    } catch (error) {
      console.error('Failed to get server stats:', error);
      return null;
    }
  }, []);

  // Enhanced event listeners with better error handling
  useEffect(() => {
    const handleConnected = () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: true,
        isConnecting: false,
        socketId: enhancedDuelsSocketService.getSocketId(),
        error: null,
        connectionQuality: 'excellent'
      }));
    };

    const handleDisconnected = (data: { reason: string }) => {
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        socketId: null,
        connectionQuality: 'disconnected'
      }));
      
      // Auto-reconnect for certain disconnect reasons
      if (data.reason === 'io server disconnect') {
        setTimeout(() => {
          connect();
        }, 2000);
      }
    };

    const handleLobbyJoined = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        availableRooms: data.availableRooms || []
      }));
    };

    const handleRoomCreated = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        availableRooms: [...prev.availableRooms, data]
      }));
    };

    const handleRoomDeleted = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        availableRooms: prev.availableRooms.filter(room => room.id !== data.roomId)
      }));
    };

    const handlePlayerJoined = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        currentRoom: data.room,
        canStartGame: data.room.players.every((p: DuelsPlayer) => p.ready)
      }));
    };

    const handlePlayerLeft = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        currentRoom: data.room,
        canStartGame: data.room.players.every((p: DuelsPlayer) => p.ready)
      }));
    };

    const handlePlayerDisconnected = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        currentRoom: data.room,
        canStartGame: data.room.players.every((p: DuelsPlayer) => p.ready)
      }));
    };

    const handlePlayerReadyChanged = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        canStartGame: data.canStart
      }));
    };

    const handleGameStarted = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        gameState: 'playing',
        gameData: data.room.gameData
      }));
    };

    const handleGameStateUpdate = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        gameData: data.gameData,
        gameState: data.gameState
      }));
    };

    const handleGameEnded = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        gameState: 'finished',
        winner: data.winner
      }));
    };

    const handleError = (data: any) => {
      setState(prev => ({ 
        ...prev, 
        error: data.message
      }));
    };

    // Register enhanced event listeners
    enhancedDuelsSocketService.on('connected', handleConnected);
    enhancedDuelsSocketService.on('disconnected', handleDisconnected);
    enhancedDuelsSocketService.on('lobby_joined', handleLobbyJoined);
    enhancedDuelsSocketService.on('room_created', handleRoomCreated);
    enhancedDuelsSocketService.on('room_deleted', handleRoomDeleted);
    enhancedDuelsSocketService.on('player_joined', handlePlayerJoined);
    enhancedDuelsSocketService.on('player_left', handlePlayerLeft);
    enhancedDuelsSocketService.on('player_disconnected', handlePlayerDisconnected);
    enhancedDuelsSocketService.on('player_ready_changed', handlePlayerReadyChanged);
    enhancedDuelsSocketService.on('game_started', handleGameStarted);
    enhancedDuelsSocketService.on('game_state_update', handleGameStateUpdate);
    enhancedDuelsSocketService.on('game_ended', handleGameEnded);
    enhancedDuelsSocketService.on('error', handleError);

    // Auto-connect if enabled
    if (options.autoConnect) {
      connect();
    }

    // Cleanup
    return () => {
      enhancedDuelsSocketService.off('connected', handleConnected);
      enhancedDuelsSocketService.off('disconnected', handleDisconnected);
      enhancedDuelsSocketService.off('lobby_joined', handleLobbyJoined);
      enhancedDuelsSocketService.off('room_created', handleRoomCreated);
      enhancedDuelsSocketService.off('room_deleted', handleRoomDeleted);
      enhancedDuelsSocketService.off('player_joined', handlePlayerJoined);
      enhancedDuelsSocketService.off('player_left', handlePlayerLeft);
      enhancedDuelsSocketService.off('player_disconnected', handlePlayerDisconnected);
      enhancedDuelsSocketService.off('player_ready_changed', handlePlayerReadyChanged);
      enhancedDuelsSocketService.off('game_started', handleGameStarted);
      enhancedDuelsSocketService.off('game_state_update', handleGameStateUpdate);
      enhancedDuelsSocketService.off('game_ended', handleGameEnded);
      enhancedDuelsSocketService.off('error', handleError);
    };
  }, [options.autoConnect, connect]);

  // Auto-refresh rooms with connection quality monitoring
  useEffect(() => {
    if (state.isConnected && !state.isInRoom) {
      const interval = setInterval(async () => {
        await refreshRooms();
        
        // Monitor connection quality
        const testResult = await testConnection();
        if (testResult.socket && testResult.health) {
          connectionQualityRef.current = 'excellent';
        } else if (testResult.socket) {
          connectionQualityRef.current = 'good';
        } else {
          connectionQualityRef.current = 'poor';
        }
        
        setState(prev => ({ 
          ...prev, 
          connectionQuality: connectionQualityRef.current 
        }));
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [state.isConnected, state.isInRoom, refreshRooms, testConnection]);

  return {
    ...state,
    connect,
    disconnect,
    checkServerHealth,
    testConnection,
    joinLobby,
    refreshRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    setPlayerReady,
    startGame,
    sendGameAction,
    clearError,
    getServerStats
  };
}
