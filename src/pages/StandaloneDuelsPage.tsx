import React, { useState, useEffect } from 'react';
import { useDuelsSocket } from '../hooks/useDuelsSocket';
import { useButtonSound } from '../hooks/useButtonSound';
import { DuelsLobby } from '../components/duels/DuelsLobby';
import { DuelsGameRoom } from '../components/duels/DuelsGameRoom';
import { RealTimeDuelsGame } from '../components/duels/RealTimeDuelsGame';
import { DuelsServerFallback } from '../components/duels/DuelsServerFallback';
import ServerStatusIndicator from '../components/multiplayer/ServerStatusIndicator';
import { useNavigate } from 'react-router-dom';

type StandaloneDuelsPageState = 'loading' | 'lobby' | 'room' | 'game' | 'fallback';

export const StandaloneDuelsPage: React.FC = () => {
  const [currentState, setCurrentState] = useState<StandaloneDuelsPageState>('loading');
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [serverStatus, setServerStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');

  const navigate = useNavigate();

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
      await createRoom(data);
      setCurrentState('room');
    } catch (error) {
      playErrorSound();
      console.error('Failed to create room:', error);
    }
  };

  // Handle joining room
  const handleJoinRoom = async (roomId: string) => {
    try {
      playSuccessSound();
      await joinRoom(roomId);
      setCurrentState('room');
    } catch (error) {
      playErrorSound();
      console.error('Failed to join room:', error);
    }
  };

  // Handle starting game
  const handleStartGame = () => {
    playSuccessSound();
    startGame();
    setCurrentState('game');
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    leaveRoom();
    setCurrentState('lobby');
  };

  // Handle game end
  const handleGameEnd = () => {
    setCurrentState('room');
  };

  // Handle leaving game
  const handleLeaveGame = () => {
    leaveRoom();
    setCurrentState('lobby');
  };

  // Handle retry connection
  const handleRetryConnection = async () => {
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
      console.error('Failed to retry connection:', error);
      setCurrentState('fallback');
      setServerStatus('unhealthy');
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    playClickSound();
    navigate('/');
  };

  // Show loading state
  if (currentState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Duels...</h2>
          <p className="text-gray-300">Connecting to server</p>
        </div>
      </div>
    );
  }

  // Show name input
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">🎮 Enhanced PvP Duels</h1>
            <p className="text-white/80">Enter your name to start playing</p>
          </div>

          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Player Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleNameSubmit(playerName)}
              disabled={!playerName.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Enter Duels
            </button>
            <button
              onClick={handleBackToHome}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show lobby
  if (currentState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-white">Enhanced PvP Duels</h1>
            </div>
            <ServerStatusIndicator 
              status={serverStatus}
              onRetry={handleRetryConnection}
            />
          </div>
        </div>

        <DuelsLobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </div>
    );
  }

  // Show room
  if (currentState === 'room') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-white">Game Room</h1>
            </div>
            <ServerStatusIndicator 
              status={serverStatus}
              onRetry={handleRetryConnection}
            />
          </div>
        </div>

        <DuelsGameRoom
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    );
  }

  // Show game
  if (currentState === 'game') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-white">Classic Shadow Duels</h1>
            </div>
            <ServerStatusIndicator 
              status={serverStatus}
              onRetry={handleRetryConnection}
            />
          </div>
        </div>

        <RealTimeDuelsGame
          onGameEnd={handleGameEnd}
          onLeaveGame={handleLeaveGame}
        />
      </div>
    );
  }

  // Show fallback
  if (currentState === 'fallback') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-white">Duels Server Offline</h1>
            </div>
            <ServerStatusIndicator 
              status={serverStatus}
              onRetry={handleRetryConnection}
            />
          </div>
        </div>

        <DuelsServerFallback
          onRetry={handleRetryConnection}
          onBack={handleBackToHome}
        />
      </div>
    );
  }

  return null;
};
