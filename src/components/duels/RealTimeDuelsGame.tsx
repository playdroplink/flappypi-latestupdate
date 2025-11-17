import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDuelsSocket } from '../../hooks/useDuelsSocket';
import { GameData } from '../../services/duelsSocketService';
import { useSoundEffects } from '../../hooks/useSoundEffects';

// Classic game constants (copied from ClassicMode.tsx)
const BIRD_WIDTH = 64;
const BIRD_HEIGHT = 64;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = BIRD_WIDTH;
const PIPE_HEIGHT = 320;
const PIPE_CAP_HEIGHT = 24;
const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;
const GROUND_HEIGHT = 64;

interface RealTimeDuelsGameProps {
  onGameEnd: () => void;
  onLeaveGame: () => void;
}

export const RealTimeDuelsGame: React.FC<RealTimeDuelsGameProps> = ({ onGameEnd, onLeaveGame }) => {
  const {
    currentRoom,
    gameData,
    gameState,
    winner,
    sendGameAction,
    isHost
  } = useDuelsSocket();

  // Classic game state (copied from ClassicMode.tsx)
  const [localScore, setLocalScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  
  // Bird physics state
  const [birdY, setBirdY] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);
  
  // Pipes state
  const [pipes, setPipes] = useState<any[]>([]);
  const [pipesActive, setPipesActive] = useState(false);
  
  // Game loop refs
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Sound effects
  const { playWingFlap, playPoint, playHit, playDie } = useSoundEffects(true);

  // Classic game loop with physics (copied from ClassicMode.tsx)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update bird physics
      setBirdY(prevY => {
        const newY = prevY + birdVelocity;
        return newY;
      });

      setBirdVelocity(prevVel => {
        return prevVel + GRAVITY;
      });

      setBirdRotation(prevRot => {
        const newRot = Math.min(90, Math.max(-90, birdVelocity * 2));
        return newRot;
      });

      // Update pipes
      setPipes(prevPipes => {
        const newPipes = prevPipes.map(pipe => ({
          ...pipe,
          x: pipe.x - 2 // Pipe speed
        })).filter(pipe => pipe.x > -PIPE_WIDTH);

        // Add new pipes
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
          const gap = 150; // Pipe gap
          const topHeight = Math.random() * (GAME_HEIGHT - gap - 100) + 50;
          newPipes.push({
            x: GAME_WIDTH,
            topHeight,
            bottomY: topHeight + gap,
            passed: false
          });
        }

        return newPipes;
      });

      // Update game time
      setGameTime(prev => prev + 1);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, birdVelocity]);

  // Collision detection (copied from ClassicMode.tsx)
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Boundary collision detection
    if (birdY < 0) {
      setBirdY(0);
      handleCollision();
      return;
    }
    if (birdY + BIRD_HEIGHT > GAME_HEIGHT - GROUND_HEIGHT) {
      setBirdY(GAME_HEIGHT - GROUND_HEIGHT - BIRD_HEIGHT);
      handleCollision();
      return;
    }

    // Pipe collision detection
    const birdX = GAME_WIDTH * 0.2; // Bird position
    const birdLeft = birdX;
    const birdRight = birdX + BIRD_WIDTH;
    const birdTop = birdY;
    const birdBottom = birdY + BIRD_HEIGHT;

    pipes.forEach(pipe => {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      // Check if bird is in pipe's x-range
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Check collision with top pipe
        if (birdTop < pipe.topHeight) {
          handleCollision();
          return;
        }
        // Check collision with bottom pipe
        if (birdBottom > pipe.bottomY) {
          handleCollision();
          return;
        }
      }

      // Check for scoring (pipe passed)
      if (!pipe.passed && birdLeft > pipeRight) {
        setLocalScore(prev => prev + 1);
        playPoint();
        pipe.passed = true;
      }
    });
  }, [birdY, pipes, gameState]);

  const handleCollision = () => {
    playDie();
    // Send collision to server
    sendGameAction('collision');
  };

  // Handle jump action with classic physics
  const handleJump = useCallback(() => {
    if (gameState === 'playing' && !isJumping) {
      setIsJumping(true);
      setBirdVelocity(FLAP_STRENGTH); // Classic flap strength
      playWingFlap();
      sendGameAction('jump');
      
      // Reset jump state after animation
      setTimeout(() => setIsJumping(false), 200);
    }
  }, [gameState, isJumping, sendGameAction, playWingFlap]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        handleJump();
      }
    };

    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, handleJump]);

  // Handle touch input for mobile
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    handleJump();
  }, [handleJump]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    handleJump();
  }, [handleJump]);

  if (!gameData || gameState !== 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Preparing Game...</h2>
          <p className="text-gray-300">Please wait while we set up the game</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Player 1 Score */}
            <div className="text-center">
              <div className="text-sm text-blue-400 font-semibold">{gameData?.bird1?.username || 'Player 1'}</div>
              <div className="text-2xl font-bold text-white">{localScore}</div>
              <div className="text-xs text-green-400">Alive</div>
            </div>

            {/* VS Indicator */}
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">VS</div>
              <div className="text-xs text-gray-400">Time: {Math.floor(gameTime / 60)}s</div>
            </div>

            {/* Player 2 Score */}
            <div className="text-center">
              <div className="text-sm text-purple-400 font-semibold">{gameData.bird2.username || 'Player 2'}</div>
              <div className="text-2xl font-bold text-white">{gameData.bird2.score}</div>
              <div className={`text-xs ${gameData.bird2.alive ? 'text-green-400' : 'text-red-400'}`}>
                {gameData.bird2.alive ? 'Alive' : 'Eliminated'}
              </div>
            </div>
          </div>

          <button
            onClick={onLeaveGame}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="w-full h-screen relative cursor-pointer"
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
        onClick={handleJump}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-400">
          {/* Clouds */}
          <div className="absolute top-20 left-10 w-20 h-10 bg-white/80 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-8 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-16 right-1/3 w-12 h-6 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Classic Pipes with proper rendering */}
        {pipes.map((pipe, index) => (
          <div key={index} className="absolute">
            {/* Top Pipe */}
            <div
              className="bg-green-600 border-2 border-green-800"
              style={{
                left: `${pipe.x}px`,
                top: '0px',
                width: `${PIPE_WIDTH}px`,
                height: `${pipe.topHeight}px`,
                zIndex: 2
              }}
            />
            
            {/* Bottom Pipe */}
            <div
              className="bg-green-600 border-2 border-green-800"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.bottomY}px`,
                width: `${PIPE_WIDTH}px`,
                height: `${GAME_HEIGHT - pipe.bottomY - GROUND_HEIGHT}px`,
                zIndex: 2
              }}
            />
          </div>
        ))}

        {/* Player 1 Bird - Main Player with Classic Physics */}
        <div
          className={`absolute bg-yellow-400 rounded-full border-2 border-yellow-600 z-20 transition-transform duration-100 ${
            isJumping ? 'scale-110' : 'scale-100'
          }`}
          style={{
            left: `${GAME_WIDTH * 0.2}px`,
            top: `${birdY}px`,
            width: `${BIRD_WIDTH}px`,
            height: `${BIRD_HEIGHT}px`,
            transform: `rotate(${birdRotation}deg)`
          }}
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full absolute top-1 left-1"></div>
          <div className="w-1 h-1 bg-black rounded-full absolute top-2 right-2"></div>
        </div>

        {/* Player 1 Username */}
        <div
          className="absolute z-30 text-xs font-bold text-yellow-300 bg-black/50 px-2 py-1 rounded-full border border-yellow-400"
          style={{
            left: `${GAME_WIDTH * 0.2 - 20}px`,
            top: `${birdY - 25}px`
          }}
        >
          {gameData?.bird1?.username || 'Player 1'}
        </div>

        {/* Player 2 Bird - Shadow/Ghost with Classic Physics */}
        <div
          className={`absolute bg-purple-400/60 rounded-full border-2 border-purple-600/60 z-10 transition-transform duration-100 ${
            isJumping ? 'scale-110' : 'scale-100'
          }`}
          style={{
            left: `${GAME_WIDTH * 0.2 + 100}px`, // Offset for shadow player
            top: `${gameData?.bird2?.y || 250}px`,
            width: `${BIRD_WIDTH}px`,
            height: `${BIRD_HEIGHT}px`,
            transform: `rotate(${gameData?.bird2?.velocity * 2 || 0}deg)`,
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
            left: `${GAME_WIDTH * 0.2 + 80}px`,
            top: `${(gameData?.bird2?.y || 250) - 25}px`
          }}
        >
          {gameData?.bird2?.username || 'Player 2'}
        </div>

        {/* Ground with Classic Height */}
        <div 
          className="absolute bg-green-600 border-t-4 border-green-800"
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            height: `${GROUND_HEIGHT}px`
          }}
        >
          <div className="absolute inset-0 bg-green-500 opacity-50"></div>
        </div>

        {/* Game Instructions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">🎮 Classic Shadow Duels</h2>
            <p className="text-gray-300 mb-4">Click, tap, or press SPACE to jump!</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>You: Yellow Bird (Solid)</span>
              <span>•</span>
              <span>Opponent: Purple Shadow (Ghost)</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Classic Flappy Pi physics with shadow player visibility!
            </div>
          </div>
        </div>
      </div>

      {/* Game End Overlay */}
      {(gameState as string) === 'finished' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 max-w-md">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-4">Game Finished!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-blue-400 font-semibold">{gameData.bird1.username || 'Player 1'}</span>
                <span className="text-white font-bold text-xl">{gameData.bird1.score}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-purple-400 font-semibold">{gameData.bird2.username || 'Player 2'}</span>
                <span className="text-white font-bold text-xl">{gameData.bird2.score}</span>
              </div>
            </div>

            <div className="text-lg font-semibold text-yellow-400 mb-6">
              {winner ? 'Player Won!' : 'Game Ended'}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onGameEnd}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={onLeaveGame}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
