import React, { useState, useEffect } from 'react';
import { useButtonSound } from '../hooks/useButtonSound';
import { useDuelsSocket } from '../hooks/useDuelsSocket';

// Demo data for testing
const DEMO_PLAYERS = [
  { id: 'demo1', name: 'FlappyMaster', score: 0, ready: false, isHost: true, y: 250, velocity: 0 },
  { id: 'demo2', name: 'PiGamer', score: 0, ready: false, isHost: false, y: 300, velocity: 0 },
  { id: 'demo3', name: 'TestPlayer', score: 0, ready: false, isHost: false, y: 280, velocity: 0 }
];

const DEMO_ROOMS = [
  {
    id: 'demo-room-1',
    name: 'Epic Duels Room',
    hostName: 'FlappyMaster',
    playerCount: 2,
    maxPlayers: 4,
    gameMode: 'classic',
    difficulty: 'medium',
    gameState: 'waiting'
  },
  {
    id: 'demo-room-2', 
    name: 'Speed Challenge',
    hostName: 'PiGamer',
    playerCount: 1,
    maxPlayers: 2,
    gameMode: 'endless',
    difficulty: 'hard',
    gameState: 'waiting'
  }
];

const DEMO_LEADERBOARD = [
  { rank: 1, name: 'FlappyMaster', score: 1250, gameMode: 'classic' },
  { rank: 2, name: 'PiGamer', score: 1100, gameMode: 'classic' },
  { rank: 3, name: 'TestPlayer', score: 950, gameMode: 'classic' },
  { rank: 4, name: 'DemoUser', score: 800, gameMode: 'classic' },
  { rank: 5, name: 'FlappyPi', score: 750, gameMode: 'classic' }
];

type TestDuelsPageState = 'demo-lobby' | 'demo-room' | 'demo-game' | 'demo-results';

export const TestDuelsPage: React.FC = () => {
  const [currentState, setCurrentState] = useState<TestDuelsPageState>('demo-lobby');
  const [playerName, setPlayerName] = useState('DemoPlayer');
  const [showNameInput, setShowNameInput] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [demoPlayers, setDemoPlayers] = useState(DEMO_PLAYERS);
  const [demoRooms, setDemoRooms] = useState(DEMO_ROOMS);
  const [leaderboard, setLeaderboard] = useState(DEMO_LEADERBOARD);
  const [gameTime, setGameTime] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);

  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();

  // Classic game physics simulation
  useEffect(() => {
    let gameLoop: number;
    
    if (gameRunning && currentState === 'demo-game') {
      const gameLoopFunction = (currentTime: number) => {
        setGameTime(prev => {
          const newTime = prev + 0.016; // ~60 FPS
          
          // Update bird physics for both players
          setDemoPlayers(prev => prev.map((player, index) => {
            const gravity = 0.5;
            const flapStrength = -8;
            
            // Simulate bird physics
            let newVelocity = player.velocity + gravity;
            let newY = player.y + newVelocity;
            
            // Simulate random flap inputs
            if (Math.random() < 0.1) { // 10% chance to flap each frame
              newVelocity = flapStrength;
            }
            
            // Keep bird in bounds
            if (newY < 0) newY = 0;
            if (newY > 600) newY = 600;
            
            // Simulate score increase based on time
            let newScore = player.score;
            if (newTime > 2) {
              newScore = Math.floor(newTime * (index === 0 ? 15 : 12));
            }
            
            return {
              ...player,
              y: newY,
              velocity: newVelocity,
              score: newScore
            };
          }));
          
          // End game after 15 seconds
          if (newTime >= 15) {
            setGameRunning(false);
            setCurrentState('demo-results');
            return newTime;
          }
          
          return newTime;
        });
        
        gameLoop = requestAnimationFrame(gameLoopFunction);
      };
      
      gameLoop = requestAnimationFrame(gameLoopFunction);
    }
    
    return () => {
      if (gameLoop) cancelAnimationFrame(gameLoop);
    };
  }, [gameRunning, currentState]);

  const handleEnterDemo = () => {
    playSuccessSound();
    setShowNameInput(false);
    setCurrentState('demo-lobby');
  };

  const handleCreateRoom = () => {
    playSuccessSound();
    const newRoom = {
      id: 'demo-room-new',
      name: `${playerName}'s Room`,
      hostName: playerName,
      playerCount: 1,
      maxPlayers: 4,
      gameMode: 'classic',
      difficulty: 'medium',
      gameState: 'waiting'
    };
    setDemoRooms(prev => [newRoom, ...prev]);
    setCurrentRoom(newRoom);
    setCurrentState('demo-room');
  };

  const handleJoinRoom = (room: any) => {
    playSuccessSound();
    setCurrentRoom(room);
    setCurrentState('demo-room');
  };

  const handleStartGame = () => {
    playSuccessSound();
    setGameRunning(true);
    setGameTime(0);
    setCurrentState('demo-game');
    
    // Simulate game data
    setGameData({
      roomId: currentRoom.id,
      players: demoPlayers,
      gameMode: currentRoom.gameMode,
      difficulty: currentRoom.difficulty,
      startTime: Date.now()
    });
  };

  const handleBackToLobby = () => {
    playClickSound();
    setCurrentState('demo-lobby');
    setCurrentRoom(null);
    setGameData(null);
    setGameTime(0);
    setGameRunning(false);
  };

  const handleBackToHome = () => {
    playClickSound();
    // This would navigate back to home page
    console.log('Navigate back to home');
  };

  const renderDemoLobby = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎮 Demo Duels Lobby</h1>
          <p className="text-white/80 text-lg">Test the enhanced PvP duels system</p>
        </div>

        {/* Demo Leaderboard */}
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🏆 Demo Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 font-bold">#{entry.rank}</span>
                  <span className="text-white font-medium">{entry.name}</span>
                </div>
                <span className="text-green-400 font-bold">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Rooms */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🏠 Available Rooms</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {demoRooms.map((room) => (
              <div key={room.id} className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-semibold">{room.name}</h4>
                  <span className="text-green-400 text-sm">{room.playerCount}/{room.maxPlayers} players</span>
                </div>
                <div className="text-white/70 text-sm mb-3">
                  <p>Host: {room.hostName}</p>
                  <p>Mode: {room.gameMode} • Difficulty: {room.difficulty}</p>
                </div>
                <button
                  onClick={() => handleJoinRoom(room)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create Room Button */}
        <div className="text-center">
          <button
            onClick={handleCreateRoom}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors text-lg"
          >
            🎯 Create New Room
          </button>
        </div>
      </div>
    </div>
  );

  const renderDemoRoom = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{currentRoom?.name}</h1>
          <p className="text-white/80">Room ID: {currentRoom?.id}</p>
        </div>

        {/* Room Settings */}
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">⚙️ Room Settings</h3>
          <div className="grid grid-cols-2 gap-4 text-white/80">
            <div>
              <span className="font-medium">Game Mode:</span> {currentRoom?.gameMode}
            </div>
            <div>
              <span className="font-medium">Difficulty:</span> {currentRoom?.difficulty}
            </div>
            <div>
              <span className="font-medium">Max Players:</span> {currentRoom?.maxPlayers}
            </div>
            <div>
              <span className="font-medium">Status:</span> {currentRoom?.gameState}
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">👥 Players ({demoPlayers.length})</h3>
          <div className="space-y-3">
            {demoPlayers.map((player) => (
              <div key={player.id} className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 font-bold">
                    {player.isHost ? '👑' : '👤'}
                  </span>
                  <span className="text-white font-medium">{player.name}</span>
                  {player.ready && <span className="text-green-400">✓ Ready</span>}
                </div>
                <span className="text-yellow-400 font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleStartGame}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            🚀 Start Game
          </button>
          <button
            onClick={handleBackToLobby}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            ← Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );

  const renderDemoGame = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Player 1 Score */}
            <div className="text-center">
              <div className="text-sm text-blue-400 font-semibold">{playerName}</div>
              <div className="text-2xl font-bold text-white">{demoPlayers[0]?.score || 0}</div>
              <div className="text-xs text-green-400">Alive</div>
            </div>

            {/* VS Indicator */}
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">VS</div>
              <div className="text-xs text-gray-400">Time: {Math.floor(gameTime)}s</div>
            </div>

            {/* Player 2 Score */}
            <div className="text-center">
              <div className="text-sm text-purple-400 font-semibold">ShadowPlayer</div>
              <div className="text-2xl font-bold text-white">{demoPlayers[1]?.score || 0}</div>
              <div className="text-xs text-green-400">Alive</div>
            </div>
          </div>

          <button
            onClick={handleBackToLobby}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="w-full h-screen relative cursor-pointer">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-400">
          {/* Clouds */}
          <div className="absolute top-20 left-10 w-20 h-10 bg-white/80 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-8 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-16 right-1/3 w-12 h-6 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Demo Pipes */}
        <div className="absolute">
          {/* Top Pipe */}
          <div
            className="bg-green-600 border-2 border-green-800"
            style={{
              left: '300px',
              top: '0px',
              width: '50px',
              height: '200px',
              zIndex: 2
            }}
          />
          
          {/* Bottom Pipe */}
          <div
            className="bg-green-600 border-2 border-green-800"
            style={{
              left: '300px',
              top: '350px',
              width: '50px',
              height: '250px',
              zIndex: 2
            }}
          />
        </div>

        {/* Player 1 Bird - Main Player (You) */}
        <div
          className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 z-20 transition-transform duration-100 scale-100"
          style={{
            left: '150px',
            top: `${250 + Math.sin(gameTime * 0.1) * 50}px`,
            transform: `rotate(${Math.sin(gameTime * 0.2) * 10}deg)`
          }}
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full absolute top-1 left-1"></div>
          <div className="w-1 h-1 bg-black rounded-full absolute top-2 right-2"></div>
        </div>

        {/* Player 1 Username */}
        <div
          className="absolute z-30 text-xs font-bold text-yellow-300 bg-black/50 px-2 py-1 rounded-full border border-yellow-400"
          style={{
            left: '130px',
            top: `${225 + Math.sin(gameTime * 0.1) * 50}px`
          }}
        >
          {playerName}
        </div>

        {/* Player 2 Bird - Shadow/Ghost */}
        <div
          className="absolute w-8 h-8 bg-purple-400/60 rounded-full border-2 border-purple-600/60 z-10 transition-transform duration-100 scale-100"
          style={{
            left: '200px',
            top: `${300 + Math.sin(gameTime * 0.15) * 40}px`,
            transform: `rotate(${Math.sin(gameTime * 0.25) * 8}deg)`,
            filter: 'blur(1px)',
            opacity: 0.8
          }}
        >
          <div className="w-2 h-2 bg-pink-500/60 rounded-full absolute top-1 left-1"></div>
          <div className="w-1 h-1 bg-black/60 rounded-full absolute top-2 right-2"></div>
        </div>

        {/* Player 2 Username */}
        <div
          className="absolute z-30 text-xs font-bold text-purple-300 bg-black/50 px-2 py-1 rounded-full border border-purple-400"
          style={{
            left: '180px',
            top: `${275 + Math.sin(gameTime * 0.15) * 40}px`
          }}
        >
          ShadowPlayer
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-green-600 border-t-4 border-green-800">
          <div className="absolute inset-0 bg-green-500 opacity-50"></div>
        </div>

        {/* Game Instructions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">🎮 Shadow Duels Demo</h2>
            <p className="text-gray-300 mb-4">This is how the shadow duels work!</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>You: Yellow Bird (Solid)</span>
              <span>•</span>
              <span>Opponent: Purple Shadow (Ghost)</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Both players see each other as shadows with usernames!
            </div>
          </div>
        </div>
      </div>

      {/* Game End Overlay */}
      {!gameRunning && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 max-w-md">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-4">Demo Finished!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-blue-400 font-semibold">{playerName}</span>
                <span className="text-white font-bold text-xl">{demoPlayers[0]?.score || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-purple-400 font-semibold">ShadowPlayer</span>
                <span className="text-white font-bold text-xl">{demoPlayers[1]?.score || 0}</span>
              </div>
            </div>

            <div className="text-lg font-semibold text-yellow-400 mb-6">
              Demo Game Completed!
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleBackToLobby}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={handleBackToHome}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDemoResults = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Demo Game Results</h1>
          <p className="text-white/80">Final scores and rankings</p>
        </div>

        {/* Final Scores */}
        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Final Scores</h3>
          <div className="space-y-3">
            {demoPlayers
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div key={player.id} className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400 font-bold">#{index + 1}</span>
                    <span className="text-white font-medium">{player.name}</span>
                  </div>
                  <span className="text-green-400 font-bold text-xl">{player.score}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBackToLobby}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            🎮 Play Again
          </button>
          <button
            onClick={handleBackToHome}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">🎮 Test Enhanced Duels</h1>
            <p className="text-white/80">Enter your name to start the demo</p>
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
              onClick={handleEnterDemo}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              🚀 Enter Demo
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

  switch (currentState) {
    case 'demo-lobby':
      return renderDemoLobby();
    case 'demo-room':
      return renderDemoRoom();
    case 'demo-game':
      return renderDemoGame();
    case 'demo-results':
      return renderDemoResults();
    default:
      return renderDemoLobby();
  }
};
