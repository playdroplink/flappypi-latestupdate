import { useState, useEffect, useCallback, useRef } from 'react';
import { duelsSocketService, GameRoom, RoomState, GameData, DuelsPlayer } from '../services/duelsSocketService';

export interface DuelsSocketState {
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
}

export interface DuelsSocketActions {
  // Connection actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  checkServerHealth: () => Promise<boolean>;
  
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
}

export function useDuelsSocket(options: {
  autoConnect?: boolean;
  playerName?: string;
} = {}): DuelsSocketState & DuelsSocketActions {
  const [state, setState] = useState<DuelsSocketState>({
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
    isSubmitting: false
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connection management
  const connect = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      const connected = await duelsSocketService.connect();
      setState(prev => ({ 
        ...prev, 
        isConnected: connected,
        isConnecting: false,
        socketId: duelsSocketService.getSocketId()
      }));
      return connected;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    duelsSocketService.disconnect();
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      socketId: null,
      currentRoom: null,
      isInRoom: false,
      isHost: false,
      gameData: null,
      gameState: 'waiting'
    }));
  }, []);

  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      const isHealthy = await duelsSocketService.checkServerHealth();
      setState(prev => ({ 
        ...prev, 
        error: isHealthy ? null : 'Server is not available'
      }));
      return isHealthy;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Server health check failed'
      }));
      return false;
    }
  }, []);

  // Lobby actions
  const joinLobby = useCallback((playerName: string) => {
    setState(prev => ({ ...prev, playerName }));
    duelsSocketService.joinLobby(playerName);
  }, []);

  const refreshRooms = useCallback(async () => {
    try {
      const rooms = await duelsSocketService.getAvailableRooms();
      setState(prev => ({ ...prev, availableRooms: rooms }));
    } catch (error) {
      console.error('Failed to refresh rooms:', error);
    }
  }, []);

  // Room actions
  const createRoom = useCallback(async (data: { roomName: string; gameMode: string; difficulty: string }) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    
    try {
      const result = await duelsSocketService.createRoom(data);
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
      const result = await duelsSocketService.joinRoom(roomId);
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
    duelsSocketService.leaveRoom();
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
    duelsSocketService.setPlayerReady(ready);
  }, []);

  const startGame = useCallback(() => {
    duelsSocketService.startGame();
  }, []);

  const sendGameAction = useCallback((action: string, data?: any) => {
    duelsSocketService.sendGameAction(action, data);
  }, []);

  // Utility actions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Event listeners
  useEffect(() => {
    const handleConnected = () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: true,
        isConnecting: false,
        socketId: duelsSocketService.getSocketId(),
        error: null
      }));
    };

    const handleDisconnected = () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        socketId: null
      }));
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

    // Register event listeners
    duelsSocketService.on('connected', handleConnected);
    duelsSocketService.on('disconnected', handleDisconnected);
    duelsSocketService.on('lobby_joined', handleLobbyJoined);
    duelsSocketService.on('room_created', handleRoomCreated);
    duelsSocketService.on('room_deleted', handleRoomDeleted);
    duelsSocketService.on('player_joined', handlePlayerJoined);
    duelsSocketService.on('player_left', handlePlayerLeft);
    duelsSocketService.on('player_ready_changed', handlePlayerReadyChanged);
    duelsSocketService.on('game_started', handleGameStarted);
    duelsSocketService.on('game_state_update', handleGameStateUpdate);
    duelsSocketService.on('game_ended', handleGameEnded);
    duelsSocketService.on('error', handleError);

    // Auto-connect if enabled
    if (options.autoConnect) {
      connect();
    }

    // Cleanup
    return () => {
      duelsSocketService.off('connected', handleConnected);
      duelsSocketService.off('disconnected', handleDisconnected);
      duelsSocketService.off('lobby_joined', handleLobbyJoined);
      duelsSocketService.off('room_created', handleRoomCreated);
      duelsSocketService.off('room_deleted', handleRoomDeleted);
      duelsSocketService.off('player_joined', handlePlayerJoined);
      duelsSocketService.off('player_left', handlePlayerLeft);
      duelsSocketService.off('player_ready_changed', handlePlayerReadyChanged);
      duelsSocketService.off('game_started', handleGameStarted);
      duelsSocketService.off('game_state_update', handleGameStateUpdate);
      duelsSocketService.off('game_ended', handleGameEnded);
      duelsSocketService.off('error', handleError);
    };
  }, [options.autoConnect, connect]);

  // Auto-refresh rooms
  useEffect(() => {
    if (state.isConnected && !state.isInRoom) {
      const interval = setInterval(refreshRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [state.isConnected, state.isInRoom, refreshRooms]);

  return {
    ...state,
    connect,
    disconnect,
    checkServerHealth,
    joinLobby,
    refreshRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    setPlayerReady,
    startGame,
    sendGameAction,
    clearError
  };
}
