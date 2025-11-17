import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Users, Crown, Trophy, Medal, Star, Play, Settings, Wifi, WifiOff, Clock, Target, Loader2, XCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import SkyBackground from '../components/SkyBackground';
import EnhancedFooter from '../components/EnhancedFooter';
import { multiplayerService, Player, Room } from '../services/multiplayerService';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 34; // Original Flappy Bird size
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const OBSTACLE_WIDTH = 50;
const OBSTACLE_GAP = 150;
const OBSTACLE_SPEED = 2;
const PIPE_INTERVAL = 150; // Frames between new pipes

const MultiplayerPvPPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isAuthenticated, username: authUsername } = useAuth();
  const { playSwoosh, playSound } = useSoundEffects();
  const { isPlaying, currentTrack } = useGlobalMusic();
  
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  
  // Game state
  const [view, setView] = useState<'lobby' | 'room' | 'game'>('lobby');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [gameMode, setGameMode] = useState<'classic' | 'endless' | 'race'>('classic');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [localPlayerState, setLocalPlayerState] = useState<Player | null>(null);
  const [obstacles, setObstacles] = useState<any[]>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'gameOver'>('waiting');
  const [gameFrame, setGameFrame] = useState(0);
  const [lastPipeFrame, setLastPipeFrame] = useState(0);
  
  // Game canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const username = authUsername || `Guest-${Math.random().toString(36).substring(7)}`;
  
  const playerImages = useRef<{ [key: string]: HTMLImageElement }>({});
  const pipeImage = useRef<HTMLImageElement | null>(null);
  
  useEffect(() => {
    // Preload images
    const birdCharacters = ['bird-yellow', 'bird-blue', 'bird-red', 'bird-green']; // Example characters
    birdCharacters.forEach(char => {
      const img = new Image();
      img.src = getBirdImageSrc(char);
      playerImages.current[char] = img;
    });

    const pipeImg = new Image();
    pipeImg.src = '/pipe.png'; // Assuming you have a pipe image
    pipeImage.current = pipeImg;
  }, []);

  const handleMultiplayerEvent = useCallback((event: string, data: any) => {
    console.log(`Event: ${event}`, data);
    setError(null); // Clear previous errors on new event

    switch (event) {
      case 'connection':
        setSocketId(multiplayerService.getSocketId());
        break;
      case 'disconnection':
        playSwoosh();
        setView('lobby');
        setCurrentRoom(null);
        setPlayers([]);
        setLocalPlayerState(null);
        setObstacles([]);
        setGameStatus('waiting');
        break;
      case 'error':
        setError(data.message);
        if (data.message.includes('Room not found') || data.message.includes('Room is full')) {
          setView('lobby');
          setCurrentRoom(null);
          setPlayers([]);
          setLocalPlayerState(null);
          setObstacles([]);
          setGameStatus('waiting');
        }
        break;
      case 'room_created':
      case 'room_joined':
      case 'room_updated':
        setCurrentRoom(data);
        setPlayers(data.players);
        setGameStatus(data.status);
        setView('room');
        if (data.status === 'playing') {
          setView('game');
          setObstacles(data.obstacles || []);
          setGameFrame(0);
          setLastPipeFrame(0);
        }
        // Initialize local player state if not already set
        if (!localPlayerState || localPlayerState.id !== multiplayerService.getSocketId()) {
          const selfPlayer = data.players.find((p: Player) => p.id === multiplayerService.getSocketId());
          if (selfPlayer) {
            setLocalPlayerState(selfPlayer);
          }
        }
        break;
      case 'player_joined':
        setPlayers(prev => {
          if (!prev.some(p => p.id === data.id)) {
            return [...prev, data];
          }
          return prev;
        });
        playSound('click');
        break;
      case 'player_left':
        setPlayers(prev => prev.filter(p => p.id !== data));
        break;
      case 'player_moved':
        setPlayers(prev => prev.map(p => p.id === data.id ? { ...p, x: data.x, y: data.y, velocity: data.velocity, isAlive: data.isAlive } : p));
        if (localPlayerState && localPlayerState.id === data.id) {
          setLocalPlayerState(prev => prev ? { ...prev, x: data.x, y: data.y, velocity: data.velocity, isAlive: data.isAlive } : null);
        }
        break;
      case 'score_updated':
        setPlayers(prev => prev.map(p => p.id === data.id ? { ...p, score: data.score } : p));
        if (localPlayerState && localPlayerState.id === data.id) {
          setLocalPlayerState(prev => prev ? { ...prev, score: data.score } : null);
        }
        break;
      case 'game_started':
        setCurrentRoom(data);
        setPlayers(data.players);
        setGameStatus('playing');
        setObstacles(data.obstacles || []);
        setView('game');
        setGameFrame(0);
        setLastPipeFrame(0);
        playSwoosh();
        break;
      case 'game_ended':
        setCurrentRoom(data);
        setPlayers(data.players);
        setGameStatus('gameOver');
        setView('room'); // Go back to room to see results
        playSwoosh();
        break;
      case 'game_state_update':
        setPlayers(data.players);
        setObstacles(data.obstacles);
        break;
      default:
        break;
    }
  }, [localPlayerState, playSwoosh, playSound]);

  useEffect(() => {
    multiplayerService.on('connection', (data: any) => handleMultiplayerEvent('connection', data));
    multiplayerService.on('disconnection', (data: any) => handleMultiplayerEvent('disconnection', data));
    multiplayerService.on('error', (data: any) => handleMultiplayerEvent('error', data));
    multiplayerService.on('room_created', (data: Room) => handleMultiplayerEvent('room_created', data));
    multiplayerService.on('room_joined', (data: Room) => handleMultiplayerEvent('room_joined', data));
    multiplayerService.on('room_updated', (data: Room) => handleMultiplayerEvent('room_updated', data));
    multiplayerService.on('player_joined', (data: Player) => handleMultiplayerEvent('player_joined', data));
    multiplayerService.on('player_left', (data: string) => handleMultiplayerEvent('player_left', data));
    multiplayerService.on('player_moved', (data: Player) => handleMultiplayerEvent('player_moved', data));
    multiplayerService.on('score_updated', (data: Player) => handleMultiplayerEvent('score_updated', data));
    multiplayerService.on('game_started', (data: Room) => handleMultiplayerEvent('game_started', data));
    multiplayerService.on('game_ended', (data: Room) => handleMultiplayerEvent('game_ended', data));
    multiplayerService.on('game_state_update', (data: { players: Player[], obstacles: any[] }) => handleMultiplayerEvent('game_state_update', data));

    return () => {
      multiplayerService.off('connection', (data: any) => handleMultiplayerEvent('connection', data));
      multiplayerService.off('disconnection', (data: any) => handleMultiplayerEvent('disconnection', data));
      multiplayerService.off('error', (data: any) => handleMultiplayerEvent('error', data));
      multiplayerService.off('room_created', (data: Room) => handleMultiplayerEvent('room_created', data));
      multiplayerService.off('room_joined', (data: Room) => handleMultiplayerEvent('room_joined', data));
      multiplayerService.off('room_updated', (data: Room) => handleMultiplayerEvent('room_updated', data));
      multiplayerService.off('player_joined', (data: Player) => handleMultiplayerEvent('player_joined', data));
      multiplayerService.off('player_left', (data: string) => handleMultiplayerEvent('player_left', data));
      multiplayerService.off('player_moved', (data: Player) => handleMultiplayerEvent('player_moved', data));
      multiplayerService.off('score_updated', (data: Player) => handleMultiplayerEvent('score_updated', data));
      multiplayerService.off('game_started', (data: Room) => handleMultiplayerEvent('game_started', data));
      multiplayerService.off('game_ended', (data: Room) => handleMultiplayerEvent('game_ended', data));
      multiplayerService.off('game_state_update', (data: { players: Player[], obstacles: any[] }) => handleMultiplayerEvent('game_state_update', data));
    };
  }, [handleMultiplayerEvent]);

  // Game loop
  useEffect(() => {
    if (view === 'game' && gameStatus === 'playing' && canvasRef.current && localPlayerState) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const gameLoop = () => {
        setGameFrame(prev => prev + 1);

        // Update local player state for rendering
        setLocalPlayerState(prev => {
          if (!prev) return null;

          let newY = prev.y + prev.velocity;
          let newVelocity = prev.velocity + GRAVITY;

          // Boundary checks
          if (newY < 0) newY = 0;
          if (newY + BIRD_SIZE > CANVAS_HEIGHT) {
            newY = CANVAS_HEIGHT - BIRD_SIZE;
            newVelocity = 0;
            if (prev.isAlive) {
              multiplayerService.sendPlayerMove(prev.x, newY, newVelocity, false);
              multiplayerService.sendScoreUpdate(prev.score); // Send final score
            }
          }

          // Collision with obstacles (simplified for client-side prediction/rendering)
          let collided = false;
          for (const obs of obstacles) {
            if (
              prev.x < obs.x + OBSTACLE_WIDTH &&
              prev.x + BIRD_SIZE > obs.x &&
              (newY < obs.gapY || newY + BIRD_SIZE > obs.gapY + OBSTACLE_GAP)
            ) {
              collided = true;
              break;
            }
          }

          if (collided && prev.isAlive) {
            multiplayerService.sendPlayerMove(prev.x, newY, newVelocity, false);
            multiplayerService.sendScoreUpdate(prev.score); // Send final score
          }

          // Update score if passed obstacle
          let newScore = prev.score;
          for (const obs of obstacles) {
            if (obs.x + OBSTACLE_WIDTH < prev.x && !obs.passed && prev.isAlive) {
              obs.passed = true; // Mark as passed locally
              newScore += 1;
              multiplayerService.sendScoreUpdate(newScore);
            }
          }

          // Send updated local player state to server
          multiplayerService.sendPlayerMove(prev.x, newY, newVelocity, prev.isAlive && !collided);

          return { ...prev, y: newY, velocity: newVelocity, score: newScore, isAlive: prev.isAlive && !collided };
        });

        // Drawing
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw obstacles
        obstacles.forEach(obs => {
          if (pipeImage.current) {
            // Top pipe
            ctx.drawImage(pipeImage.current, obs.x, 0, OBSTACLE_WIDTH, obs.gapY);
            // Bottom pipe
            ctx.drawImage(pipeImage.current, obs.x, obs.gapY + OBSTACLE_GAP, OBSTACLE_WIDTH, CANVAS_HEIGHT - (obs.gapY + OBSTACLE_GAP));
          } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(obs.x, 0, OBSTACLE_WIDTH, obs.gapY);
            ctx.fillRect(obs.x, obs.gapY + OBSTACLE_GAP, OBSTACLE_WIDTH, CANVAS_HEIGHT - (obs.gapY + OBSTACLE_GAP));
          }
        });

        // Draw players
        players.forEach(player => {
          const charImg = playerImages.current[player.character || 'bird-yellow'];
          if (charImg) {
            ctx.drawImage(charImg, player.x, player.y, BIRD_SIZE, BIRD_SIZE);
          } else {
            ctx.fillStyle = player.isAlive ? 'yellow' : 'red';
            ctx.fillRect(player.x, player.y, BIRD_SIZE, BIRD_SIZE);
          }
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(`${player.username} (${player.score})`, player.x, player.y - 5);
        });

        animationFrameId.current = requestAnimationFrame(gameLoop);
      };

      animationFrameId.current = requestAnimationFrame(gameLoop);

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [view, gameStatus, localPlayerState, players, obstacles]); // Removed gameFrame from dependencies to prevent re-render loop

  const handleJump = useCallback(() => {
    if (localPlayerState && localPlayerState.isAlive && gameStatus === 'playing') {
      setLocalPlayerState(prev => prev ? { ...prev, velocity: JUMP_STRENGTH } : null);
    }
  }, [localPlayerState, gameStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  const handleCreateRoom = () => {
    if (!roomName || !username) {
      return;
    }
    multiplayerService.createRoom(roomName, username, maxPlayers, gameMode);
  };

  const handleJoinRoom = () => {
    if (!roomId || !username) {
      return;
    }
    multiplayerService.joinRoom(roomId, username);
  };

  const handleLeaveRoom = () => {
    multiplayerService.leaveRoom();
    setView('lobby');
    setCurrentRoom(null);
    setPlayers([]);
    setLocalPlayerState(null);
    setObstacles([]);
    setGameStatus('waiting');
  };

  const handleStartGame = () => {
    if (currentRoom && currentRoom.hostId === socketId) {
      multiplayerService.startGame();
    }
  };

  const getWinner = () => {
    if (gameStatus !== 'gameOver' || players.length === 0) return null;
    const alivePlayers = players.filter(p => p.isAlive);
    if (alivePlayers.length > 0) {
      return alivePlayers.reduce((prev, current) => (prev.score > current.score ? prev : current));
    }
    return players.reduce((prev, current) => (prev.score > current.score ? prev : current));
  };

  const winner = getWinner();

  const handleBack = () => {
    playSwoosh();
    navigate('/home');
  };

  const renderLobby = () => (
    <Card className="w-full max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-3xl p-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-4">Multiplayer Lobby</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <p>{error}</p>
          </Alert>
        )}
        <div className="space-y-4">
          <Label htmlFor="username">Your Username</Label>
          <Input id="username" value={username} disabled />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Create Room</h3>
          <Label htmlFor="roomName">Room Name</Label>
          <Input id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="My Flappy Room" />
          <Label htmlFor="maxPlayers">Max Players</Label>
          <Select value={String(maxPlayers)} onValueChange={(value) => setMaxPlayers(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select max players" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Players</SelectItem>
              <SelectItem value="3">3 Players</SelectItem>
              <SelectItem value="4">4 Players</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="gameMode">Game Mode</Label>
          <Select value={gameMode} onValueChange={(value: 'classic' | 'endless' | 'race') => setGameMode(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select game mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="endless">Endless</SelectItem>
              <SelectItem value="race">Race</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateRoom} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
            <Crown className="mr-2" /> Create Room
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Join Room</h3>
          <Label htmlFor="roomId">Room ID</Label>
          <Input id="roomId" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter Room ID" />
          <Button onClick={handleJoinRoom} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">
            <Users className="mr-2" /> Join Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderRoom = () => (
    <Card className="w-full max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-3xl p-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-4">Room: {currentRoom?.name}</CardTitle>
        <p className="text-center text-gray-600 dark:text-gray-300">ID: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{currentRoom?.id}</span></p>
        <p className="text-center text-gray-600 dark:text-gray-300">Game Mode: <span className="font-semibold">{currentRoom?.gameMode}</span></p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <p>{error}</p>
          </Alert>
        )}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Users className="h-5 w-5" /> Players ({players.length}/{currentRoom?.maxPlayers})
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {players.map(player => (
              <li key={player.id} className="text-gray-700 dark:text-gray-300 flex items-center">
                {player.id === currentRoom?.hostId && <Crown className="h-4 w-4 mr-2 text-yellow-500" />}
                {player.username} {player.id === socketId && "(You)"}
                {gameStatus === 'gameOver' && <span className="ml-auto font-bold text-blue-600 dark:text-blue-300">Score: {player.score}</span>}
              </li>
            ))}
          </ul>
        </div>

        {gameStatus === 'gameOver' && winner && (
          <Alert className="bg-green-100 border-green-400 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200">
            <Play className="h-4 w-4" />
            <p className="font-bold text-lg">Winner: {winner.username} with score {winner.score}!</p>
          </Alert>
        )}

        {currentRoom?.hostId === socketId && gameStatus === 'waiting' && (
          <Button onClick={handleStartGame} disabled={players.length < 2} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl">
            <Play className="mr-2" /> Start Game ({players.length < 2 ? `Need ${2 - players.length} more` : 'Ready!'})
          </Button>
        )}
        {currentRoom?.hostId !== socketId && gameStatus === 'waiting' && (
          <Button disabled className="w-full bg-gray-400 text-white font-bold py-3 rounded-xl">
            <Loader2 className="mr-2 animate-spin" /> Waiting for host to start...
          </Button>
        )}
        {gameStatus === 'gameOver' && (
          <Button onClick={handleStartGame} disabled={players.length < 2} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl">
            <Play className="mr-2" /> Play Again
          </Button>
        )}

        <Button onClick={handleLeaveRoom} variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold py-3 rounded-xl">
          <Users className="mr-2" /> Leave Room
        </Button>
      </CardContent>
    </Card>
  );

  const renderGame = () => (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <h2 className="text-4xl font-black text-white drop-shadow-lg mb-4">Multiplayer PvP</h2>
      {error && (
        <Alert variant="destructive" className="mb-4 w-full max-w-md">
          <XCircle className="h-4 w-4" />
          <p>{error}</p>
        </Alert>
      )}
      <Card className="w-full bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-3xl p-4 mb-4">
        <CardContent className="flex flex-wrap justify-around gap-4">
          {players.map(player => (
            <div key={player.id} className={`flex items-center gap-2 p-2 rounded-lg ${player.isAlive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700 opacity-70'}`}>
              <img src={getBirdImageSrc(player.character || 'bird-yellow')} alt="bird" className="w-8 h-8" />
              <span className={`font-bold ${player.isAlive ? 'text-blue-800 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                {player.username} ({player.score}) {player.id === socketId && "(You)"}
              </span>
              {!player.isAlive && <span className="text-red-500 ml-2">💀</span>}
            </div>
          ))}
        </CardContent>
      </Card>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-sky-300 dark:bg-sky-700 border-4 border-blue-700 dark:border-blue-400 rounded-xl shadow-2xl cursor-pointer"
        onClick={handleJump}
      ></canvas>
      <Button onClick={handleLeaveRoom} variant="outline" className="mt-4 w-full max-w-xs border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold py-3 rounded-xl">
        <Users className="mr-2" /> Leave Game
      </Button>
    </div>
  );

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {view === 'lobby' && renderLobby()}
        {view === 'room' && renderRoom()}
        {view === 'game' && renderGame()}
      </div>
    </SkyBackground>
  );
};

export default MultiplayerPvPPage;
