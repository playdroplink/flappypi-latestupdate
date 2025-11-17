import React, { useState, useEffect } from 'react';
import { useDuelsSocket } from '../hooks/useDuelsSocket';
import { useButtonSound } from '../hooks/useButtonSound';
import { DuelsLobby } from '../components/duels/DuelsLobby';
import { DuelsGameRoom } from '../components/duels/DuelsGameRoom';
import { RealTimeDuelsGame } from '../components/duels/RealTimeDuelsGame';
import { DuelsServerFallback } from '../components/duels/DuelsServerFallback';

type DuelsPageState = 'lobby' | 'room' | 'game' | 'loading' | 'fallback';

export const DuelsPage: React.FC = () => {
  const [currentState, setCurrentState] = useState<DuelsPageState>('loading');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);

  const {
    isConnected,
    currentRoom,
    gameState,
    connect,
    checkServerHealth,
    error
  } = useDuelsSocket({ autoConnect: false });
  
  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();

  // Initialize connection and check server health
  useEffect(() => {
    const initializeDuels = async () => {
      try {
        const isHealthy = await checkServerHealth();
        if (isHealthy) {
          const connected = await connect();
          if (connected) {
            setCurrentState('lobby');
          } else {
            setCurrentState('fallback'); // Show fallback if connection fails
          }
        } else {
          setCurrentState('fallback'); // Show fallback if server is not healthy
        }
      } catch (error) {
        console.error('Failed to initialize duels:', error);
        setCurrentState('fallback');
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
      setCurrentState('room');
    } catch (error) {
      playErrorSound();
      console.error('Failed to join room:', error);
    }
  };

  // Handle game start
  const handleStartGame = () => {
    playSuccessSound();
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
    setCurrentState('lobby');
  };

  // Handle back to lobby
  const handleBackToLobby = () => {
    setCurrentState('lobby');
  };

  // Handle retry connection
  const handleRetryConnection = async () => {
    setCurrentState('loading');
    try {
      const isHealthy = await checkServerHealth();
      if (isHealthy) {
        const connected = await connect();
        if (connected) {
          setCurrentState('lobby');
        } else {
          setCurrentState('fallback');
        }
      } else {
        setCurrentState('fallback');
      }
    } catch (error) {
      console.error('Failed to retry connection:', error);
      setCurrentState('fallback');
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    // This will be handled by the parent component
    window.history.back();
  };

  // Show name input if no player name
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚔️</div>
            <h1 className="text-3xl font-bold text-white dark:text-gray-100 mb-2">Enter Duels</h1>
            <p className="text-gray-300 dark:text-gray-400">Enter your name to start playing multiplayer duels</p>
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
              Enter Duels
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
          <h2 className="text-2xl font-bold text-white mb-2">Loading Duels...</h2>
          <p className="text-gray-300">Please wait while we set up the multiplayer system</p>
        </div>
      </div>
    );
  }

  // Show lobby
  if (currentState === 'lobby') {
    return (
      <DuelsLobby
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
        onBack={handleBackToLobby}
      />
    );
  }

  // Show game room
  if (currentState === 'room') {
    return (
      <DuelsGameRoom
        onLeaveRoom={handleLeaveRoom}
        onStartGame={handleStartGame}
      />
    );
  }

  // Show real-time game
  if (currentState === 'game') {
    return (
      <RealTimeDuelsGame
        onGameEnd={handleGameEnd}
        onLeaveGame={handleLeaveGame}
      />
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
