import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle, Wifi, WifiOff } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import SkyBackground from '../components/SkyBackground';
import ImprovedMultiplayerLobby from '../components/multiplayer/ImprovedMultiplayerLobby';
import MultiplayerFallback from '../components/multiplayer/MultiplayerFallback';
import { improvedMultiplayerService, Player, Room } from '../services/improvedMultiplayerService';

const ImprovedMultiplayerPvPPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isAuthenticated, username: authUsername } = useAuth();
  const { playSwoosh, playSound } = useSoundEffects();
  const { isPlaying, currentTrack } = useGlobalMusic();
  
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  
  // Game state
  const [view, setView] = useState<'lobby' | 'room' | 'game'>('lobby');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'gameOver'>('waiting');
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; socketId: string | null; reconnectAttempts: number }>({
    connected: false,
    socketId: null,
    reconnectAttempts: 0
  });
  const [showFallback, setShowFallback] = useState(false);
  
  const username = authUsername || `Guest-${Math.random().toString(36).substring(7)}`;

  // Handle multiplayer events
  const handleMultiplayerEvent = useCallback((event: string, data: any) => {
    console.log(`Event: ${event}`, data);
    setError(null); // Clear previous errors on new event

    switch (event) {
      case 'connection':
        setSocketId(improvedMultiplayerService.getSocketId());
        setConnectionStatus(improvedMultiplayerService.getConnectionStatus());
        break;
      case 'disconnection':
        playSwoosh();
        setView('lobby');
        setCurrentRoom(null);
        setPlayers([]);
        setGameStatus('waiting');
        setConnectionStatus(improvedMultiplayerService.getConnectionStatus());
        break;
      case 'error':
        setError(data.message);
        if (data.message.includes('Room not found') || data.message.includes('Room is full')) {
          setView('lobby');
          setCurrentRoom(null);
          setPlayers([]);
        }
        break;
      case 'room_created':
        setCurrentRoom(data.room);
        setPlayers(data.room.players || []);
        setView('room');
        setGameStatus('waiting');
        playSound('success');
        break;
      case 'room_joined':
        setCurrentRoom(data.room);
        setPlayers(data.room.players || []);
        setView('room');
        setGameStatus('waiting');
        playSound('success');
        break;
      case 'player_joined':
        setPlayers(data.room.players || []);
        playSound('notification');
        break;
      case 'player_left':
        setPlayers(data.room.players || []);
        playSound('notification');
        break;
      case 'player_moved':
        setPlayers(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
        break;
      case 'score_updated':
        setPlayers(prev => prev.map(p => p.id === data.id ? { ...p, score: data.score } : p));
        break;
      case 'game_started':
        setCurrentRoom(data);
        setPlayers(data.players || []);
        setGameStatus('playing');
        setView('game');
        playSound('gameStart');
        break;
      case 'game_ended':
        setCurrentRoom(data);
        setPlayers(data.players || []);
        setGameStatus('gameOver');
        playSound('gameOver');
        break;
      case 'game_state_update':
        setPlayers(data.players || []);
        break;
    }
  }, [playSwoosh, playSound]);

  // Set up event listeners
  useEffect(() => {
    improvedMultiplayerService.on('connection', (data: any) => handleMultiplayerEvent('connection', data));
    improvedMultiplayerService.on('disconnection', (data: any) => handleMultiplayerEvent('disconnection', data));
    improvedMultiplayerService.on('error', (data: any) => handleMultiplayerEvent('error', data));
    improvedMultiplayerService.on('room_created', (data: any) => handleMultiplayerEvent('room_created', data));
    improvedMultiplayerService.on('room_joined', (data: any) => handleMultiplayerEvent('room_joined', data));
    improvedMultiplayerService.on('player_joined', (data: any) => handleMultiplayerEvent('player_joined', data));
    improvedMultiplayerService.on('player_left', (data: any) => handleMultiplayerEvent('player_left', data));
    improvedMultiplayerService.on('player_moved', (data: any) => handleMultiplayerEvent('player_moved', data));
    improvedMultiplayerService.on('score_updated', (data: any) => handleMultiplayerEvent('score_updated', data));
    improvedMultiplayerService.on('game_started', (data: any) => handleMultiplayerEvent('game_started', data));
    improvedMultiplayerService.on('game_ended', (data: any) => handleMultiplayerEvent('game_ended', data));
    improvedMultiplayerService.on('game_state_update', (data: any) => handleMultiplayerEvent('game_state_update', data));

    return () => {
      improvedMultiplayerService.off('connection', (data: any) => handleMultiplayerEvent('connection', data));
      improvedMultiplayerService.off('disconnection', (data: any) => handleMultiplayerEvent('disconnection', data));
      improvedMultiplayerService.off('error', (data: any) => handleMultiplayerEvent('error', data));
      improvedMultiplayerService.off('room_created', (data: any) => handleMultiplayerEvent('room_created', data));
      improvedMultiplayerService.off('room_joined', (data: any) => handleMultiplayerEvent('room_joined', data));
      improvedMultiplayerService.off('player_joined', (data: any) => handleMultiplayerEvent('player_joined', data));
      improvedMultiplayerService.off('player_left', (data: any) => handleMultiplayerEvent('player_left', data));
      improvedMultiplayerService.off('player_moved', (data: any) => handleMultiplayerEvent('player_moved', data));
      improvedMultiplayerService.off('score_updated', (data: any) => handleMultiplayerEvent('score_updated', data));
      improvedMultiplayerService.off('game_started', (data: any) => handleMultiplayerEvent('game_started', data));
      improvedMultiplayerService.off('game_ended', (data: any) => handleMultiplayerEvent('game_ended', data));
      improvedMultiplayerService.off('game_state_update', (data: any) => handleMultiplayerEvent('game_state_update', data));
    };
  }, [handleMultiplayerEvent]);

  // Check server health on mount
  useEffect(() => {
    const checkServer = async () => {
      const isHealthy = await improvedMultiplayerService.checkServerHealth();
      if (!isHealthy) {
        setShowFallback(true);
      }
    };
    checkServer();
  }, []);

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(improvedMultiplayerService.getConnectionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Event handlers
  const handleBack = () => {
    playSwoosh();
    navigate('/');
  };

  const handleCreateRoom = async (data: { name: string; maxPlayers: number; gameMode: string }) => {
    try {
      setError(null);
      await improvedMultiplayerService.createRoom(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      setError(errorMessage);
      if (errorMessage.includes('server is not available')) {
        setShowFallback(true);
      }
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      setError(null);
      await improvedMultiplayerService.joinRoom(roomId, username);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
      setError(errorMessage);
      if (errorMessage.includes('server is not available')) {
        setShowFallback(true);
      }
    }
  };

  const handleStartGame = () => {
    improvedMultiplayerService.startGame();
  };

  const handleLeaveRoom = () => {
    improvedMultiplayerService.leaveRoom();
    setView('lobby');
    setCurrentRoom(null);
    setPlayers([]);
    setGameStatus('waiting');
  };

  const isHost = currentRoom?.hostId === socketId;
  const winner = players.length > 0 ? players.reduce((prev, current) => (prev.score > current.score ? prev : current)) : null;

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen w-full">
        {/* Connection Status */}
        <div className="absolute top-4 right-4 z-50">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
            connectionStatus.connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus.connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {connectionStatus.connected ? 'Connected' : 'Disconnected'}
            {connectionStatus.reconnectAttempts > 0 && (
              <span className="text-xs">({connectionStatus.reconnectAttempts}/5)</span>
            )}
          </div>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="absolute top-16 left-4 right-4 z-50">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        {showFallback ? (
          <MultiplayerFallback
            onBack={handleBack}
            onStartServer={() => {
              setShowFallback(false);
              // Try to reconnect
              improvedMultiplayerService.connect().then(connected => {
                if (!connected) {
                  setShowFallback(true);
                }
              });
            }}
          />
        ) : (
          <>
            {view === 'lobby' && (
              <ImprovedMultiplayerLobby
                onBack={handleBack}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onStartGame={handleStartGame}
                onLeaveRoom={handleLeaveRoom}
                currentRoom={currentRoom}
                players={players}
                gameStatus={gameStatus}
                error={error}
                isHost={isHost}
                socketId={socketId}
              />
            )}
          </>
        )}

        {/* Room View */}
        {view === 'room' && (
          <ImprovedMultiplayerLobby
            onBack={handleBack}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
            currentRoom={currentRoom}
            players={players}
            gameStatus={gameStatus}
            error={error}
            isHost={isHost}
            socketId={socketId}
          />
        )}

        {/* Game View */}
        {view === 'game' && (
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                Multiplayer Game
              </h1>
              <p className="text-white/80">
                Game is in progress...
              </p>
            </div>
            
            {/* Game Canvas Placeholder */}
            <div className="w-full max-w-4xl h-96 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold mb-2">Game Canvas</h2>
                <p className="text-white/80">Game implementation would go here</p>
              </div>
            </div>

            <button
              onClick={handleLeaveRoom}
              className="mt-8 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
            >
              Leave Game
            </button>
          </div>
        )}
      </div>
    </SkyBackground>
  );
};

export default ImprovedMultiplayerPvPPage;
