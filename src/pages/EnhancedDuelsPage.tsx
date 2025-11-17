import React, { useState, useEffect } from 'react';
import { useDuelsSocket } from '../hooks/useDuelsSocket';
import { useButtonSound } from '../hooks/useButtonSound';
import { DuelsLobby } from '../components/duels/DuelsLobby';
import { DuelsGameRoom } from '../components/duels/DuelsGameRoom';
import { RealTimeDuelsGame } from '../components/duels/RealTimeDuelsGame';
import { DuelsServerFallback } from '../components/duels/DuelsServerFallback';
import ServerStatusIndicator from '../components/multiplayer/ServerStatusIndicator';

type EnhancedDuelsPageState = 'lobby' | 'room' | 'game' | 'loading' | 'fallback';

export const EnhancedDuelsPage: React.FC = () => {
  const [currentState, setCurrentState] = useState<EnhancedDuelsPageState>('loading');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [serverStatus, setServerStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');

  const {
    isConnected,
    currentRoom,
    gameState,
    connect,
    checkServerHealth,
    error,
    availableRooms,
    isHost,
    canStartGame,
    gameData,
    winner,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    setPlayerReady
  } = useDuelsSocket({ autoConnect: false });
  
  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();

  // Initialize connection and check server health
  useEffect(() => {
    const initializeDuels = async () => {
      try {
        setServerStatus('checking');
        const isHealthy = await checkServerHealth();
        
        if (isHealthy) {
          setServerStatus('healthy');
          const connected = await connect();
          if (connected) {
            setCurrentState('lobby');
          } else {
            setCurrentState('fallback');
            setServerStatus('unhealthy');
          }
        } else {
          setCurrentState('fallback');
          setServerStatus('unhealthy');
        }
      } catch (error) {
        console.error('Failed to initialize duels:', error);
        setCurrentState('fallback');
        setServerStatus('unhealthy');
      }
    };

    initializeDuels();
  }, [connect, checkServerHealth]);

  // Handle player name input
  const handleNameSubmit = (name: string) => {
    playSuccessSound();
    setPlayerName(name);
    setShowNameInput(false);
  };

  // Handle room creation
  const handleCreateRoom = async (data: { roomName: string; gameMode: string; difficulty: string }) => {
    try {
      playSuccessSound();
      // Use the actual createRoom function from the hook
      await createRoom(data);
      setCurrentState('room');
    } catch (error) {
      playErrorSound();
      console.error('Failed to create room:', error);
    }
  };

  // Handle room joining
  const handleJoinRoom = async (roomId: string) => {
    try {
      playSuccessSound();
      // Use the actual joinRoom function from the hook
      await joinRoom(roomId);
      setCurrentState('room');
    } catch (error) {
      playErrorSound();
      console.error('Failed to join room:', error);
    }
  };

  // Handle game start
  const handleStartGame = () => {
    playSuccessSound();
    startGame();
    setCurrentState('game');
  };

  // Handle game end
  const handleGameEnd = () => {
    setCurrentState('room');
  };

  // Handle leaving game
  const handleLeaveGame = () => {
    setCurrentState('lobby');
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    leaveRoom();
    setCurrentState('lobby');
  };

  // Handle back to lobby
  const handleBackToLobby = () => {
    setCurrentState('lobby');
  };

  // Handle retry connection
  const handleRetryConnection = async () => {
    setCurrentState('loading');
    setServerStatus('checking');
    try {
      const isHealthy = await checkServerHealth();
      if (isHealthy) {
        setServerStatus('healthy');
        const connected = await connect();
        if (connected) {
          setCurrentState('lobby');
        } else {
          setCurrentState('fallback');
          setServerStatus('unhealthy');
        }
      } else {
        setCurrentState('fallback');
        setServerStatus('unhealthy');
      }
    } catch (error) {
      console.error('Failed to retry connection:', error);
      setCurrentState('fallback');
      setServerStatus('unhealthy');
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    window.history.back();
  };

  // Show name input if no player name
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚔️</div>
            <h1 className="text-3xl font-bold text-white dark:text-gray-100 mb-2">PvP Duels</h1>
            <p className="text-gray-300 dark:text-gray-400">Enter your name to start playing real-time multiplayer duels</p>
            
            {/* Server Status Indicator */}
            <div className="mt-4">
              <ServerStatusIndicator 
                status={serverStatus}
                onRetry={handleRetryConnection}
              />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = (e.target as HTMLFormElement).playerName.value.trim();
              if (name) {
                handleNameSubmit(name);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-400 mb-2">Player Name</label>
              <input
                type="text"
                name="playerName"
                required
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-white/20 dark:bg-gray-700/50 border border-white/30 dark:border-gray-600/50 rounded-lg text-white dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Enter PvP Duels
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (currentState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading PvP Duels...</h2>
          <p className="text-gray-300">Setting up real-time multiplayer with Socket.IO v4</p>
          
          {/* Server Status */}
          <div className="mt-4">
            <ServerStatusIndicator 
              status={serverStatus}
              onRetry={handleRetryConnection}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show lobby
  if (currentState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Server Status Header */}
        <div className="absolute top-4 right-4 z-10">
          <ServerStatusIndicator 
            status={serverStatus}
            onRetry={handleRetryConnection}
          />
        </div>
        
        <DuelsLobby
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onBack={handleBackToLobby}
        />
      </div>
    );
  }

  // Show game room
  if (currentState === 'room') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Server Status Header */}
        <div className="absolute top-4 right-4 z-10">
          <ServerStatusIndicator 
            status={serverStatus}
            onRetry={handleRetryConnection}
          />
        </div>
        
        <DuelsGameRoom
          onLeaveRoom={handleLeaveRoom}
          onStartGame={handleStartGame}
        />
      </div>
    );
  }

  // Show real-time game
  if (currentState === 'game') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Server Status Header */}
        <div className="absolute top-4 right-4 z-10">
          <ServerStatusIndicator 
            status={serverStatus}
            onRetry={handleRetryConnection}
          />
        </div>
        
        <RealTimeDuelsGame
          onGameEnd={handleGameEnd}
          onLeaveGame={handleLeaveGame}
        />
      </div>
    );
  }

  // Show fallback when server is not available
  if (currentState === 'fallback') {
    return (
      <DuelsServerFallback
        onRetry={handleRetryConnection}
        onBack={handleBackToHome}
      />
    );
  }

  return null;
};
