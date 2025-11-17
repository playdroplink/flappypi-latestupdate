import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useOptimizedGameLoop } from '../../hooks/useOptimizedGameLoop';
import { OptimizedGameRenderer } from './OptimizedGameRenderer';
import { performanceOptimizer } from '../../utils/gamePerformanceOptimizer';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useWallet } from '../../context/WalletContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useInventory } from '../../hooks/useInventory';
import { useGameEquipment } from '../../hooks/useGameEquipment';
import { useSettings } from '../../hooks/useSettings';
import { useGameState } from '../../hooks/useGameState';
import { getBirdImageSrc } from '../../utils/getBirdImageSrc';
import { isMobile } from '../../utils/browserDetection';

// Game constants
const BIRD_WIDTH = 64;
const BIRD_HEIGHT = 64;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = BIRD_WIDTH;
const PIPE_GAP = 200;
const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;
const COIN_SIZE = 48;

interface OptimizedClassicModeProps {
  mode?: 'classic' | 'endless' | 'challenge';
  challenge?: any;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  continueGameRef: React.RefObject<() => void>;
  onGameOver: (score: number, coins: number) => void;
  onCollision: () => void;
}

export const OptimizedClassicMode: React.FC<OptimizedClassicModeProps> = ({
  mode = 'classic',
  challenge,
  musicEnabled,
  setMusicEnabled,
  soundEnabled,
  setSoundEnabled,
  continueGameRef,
  onGameOver,
  onCollision
}) => {
  // Hooks
  const { balance, addCoins } = useWallet();
  const { user } = useUserProfile();
  const { equippedSkin } = useInventory();
  const { getActiveEffects, activatePowerUp, validatePowerUpUsage } = useGameEquipment();
  const { theme } = useSettings();
  const gameState = useGameState();
  const { playWingFlap, playPoint, playHit, playDie, playSwoosh, soundEnabled: soundEffectsEnabled, initializeGameSounds } = useSoundEffects(soundEnabled);

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVel, setBirdVel] = useState(0);
  const [pipes, setPipes] = useState<Array<{ x: number; gapY: number }>>([
    { x: GAME_WIDTH + 100, gapY: GAME_HEIGHT / 2 }
  ]);
  const [coinPos, setCoinPos] = useState({ x: GAME_WIDTH + 300, y: 200, phase: 0 });

  // Performance state
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Refs for optimized state management
  const gameStateRef = useRef({
    birdY,
    birdVel,
    pipes,
    coins,
    score,
    gameStarted,
    gameOver
  });

  // Update refs when state changes
  useEffect(() => {
    gameStateRef.current = {
      birdY,
      birdVel,
      pipes,
      coins,
      score,
      gameStarted,
      gameOver
    };
  }, [birdY, birdVel, pipes, coins, score, gameStarted, gameOver]);

  // Initialize sound effects
  useEffect(() => {
    initializeGameSounds();
  }, [initializeGameSounds]);

  // Get active effects
  const activeEffects = useMemo(() => {
    try {
      return getActiveEffects();
    } catch (error) {
      console.error('Error in getActiveEffects:', error);
      return {
        hasShield: false,
        hasMagnet: false,
        hasExtraLife: false,
        hasCoinMultiplier: false,
        hasTurbo: false,
        coinMultiplier: 1,
        gameSpeed: 1
      };
    }
  }, [getActiveEffects]);

  // Get bird image
  const birdImg = useMemo(() => getBirdImageSrc(equippedSkin), [equippedSkin]);

  // Optimized game update function
  const updateGame = useCallback((deltaTime: number) => {
    if (!gameStateRef.current.gameStarted || gameStateRef.current.gameOver) return;

    const state = gameStateRef.current;
    const settings = performanceOptimizer.getOptimizedSettings();

    // Update bird physics
    const newBirdY = state.birdY + state.birdVel * deltaTime;
    const newBirdVel = state.birdVel + GRAVITY * deltaTime;

    // Boundary checks
    const clampedBirdY = Math.max(0, Math.min(GAME_HEIGHT - BIRD_HEIGHT, newBirdY));

    // Update pipes
    const newPipes = state.pipes
      .map(pipe => ({ ...pipe, x: pipe.x - 100 * deltaTime }))
      .filter(pipe => pipe.x > -PIPE_WIDTH);

    // Add new pipe if needed
    if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 300) {
      newPipes.push({
        x: GAME_WIDTH,
        gapY: Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50
      });
    }

    // Update coin
    const newCoinPos = {
      ...state.coinPos,
      x: state.coinPos.x - 100 * deltaTime,
      phase: state.coinPos.phase + deltaTime * 2
    };

    // Check scoring
    let newScore = state.score;
    if (newPipes.length > 0 && newPipes[0].x < 50 && state.pipes.length > newPipes.length) {
      newScore++;
      if (soundEffectsEnabled) {
        playPoint();
        playSwoosh();
      }
    }

    // Check collisions (optimized frequency)
    if (performanceOptimizer.shouldCheckCollisions(Math.floor(Date.now() / 16))) {
      const birdRect = {
        x: 100,
        y: clampedBirdY,
        width: BIRD_WIDTH,
        height: BIRD_HEIGHT
      };

      // Check pipe collisions
      const collision = newPipes.some(pipe => {
        const topPipe = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapY };
        const bottomPipe = { 
          x: pipe.x, 
          y: pipe.gapY + PIPE_GAP, 
          width: PIPE_WIDTH, 
          height: GAME_HEIGHT - pipe.gapY - PIPE_GAP 
        };

        return (
          birdRect.x < topPipe.x + topPipe.width &&
          birdRect.x + birdRect.width > topPipe.x &&
          birdRect.y < topPipe.y + topPipe.height &&
          birdRect.y + birdRect.height > topPipe.y
        ) || (
          birdRect.x < bottomPipe.x + bottomPipe.width &&
          birdRect.x + birdRect.width > bottomPipe.x &&
          birdRect.y < bottomPipe.y + bottomPipe.height &&
          birdRect.y + birdRect.height > bottomPipe.y
        );
      });

      if (collision && !activeEffects.hasShield) {
        handleGameOver();
        return;
      }
    }

    // Check coin collection
    const coinRect = {
      x: newCoinPos.x,
      y: newCoinPos.y,
      width: COIN_SIZE,
      height: COIN_SIZE
    };

    const birdRect = {
      x: 100,
      y: clampedBirdY,
      width: BIRD_WIDTH,
      height: BIRD_HEIGHT
    };

    if (
      birdRect.x < coinRect.x + coinRect.width &&
      birdRect.x + birdRect.width > coinRect.x &&
      birdRect.y < coinRect.y + coinRect.height &&
      birdRect.y + birdRect.height > coinRect.y
    ) {
      const coinValue = activeEffects.coinMultiplier || 1;
      setCoins(prev => prev + coinValue);
      setCoinPos({ x: GAME_WIDTH + 300, y: Math.random() * (GAME_HEIGHT - 200) + 100, phase: 0 });
    }

    // Update state
    setBirdY(clampedBirdY);
    setBirdVel(newBirdVel);
    setPipes(newPipes);
    setScore(newScore);
    setCoinPos(newCoinPos);
  }, [activeEffects, soundEffectsEnabled, playPoint, playSwoosh]);

  // Optimized render function
  const renderGame = useCallback(() => {
    const settings = performanceOptimizer.getOptimizedSettings();
    
    // This will be handled by the OptimizedGameRenderer
    // The actual rendering is done through the renderer context
  }, []);

  // Game loop hook
  const { getPerformanceMetrics, getOptimizedSettings } = useOptimizedGameLoop({
    isPlaying: gameStarted && !gameOver,
    isPaused: false,
    updateGame,
    renderGame,
    targetFPS: 60,
    onPerformanceWarning: (metrics) => {
      setShowPerformanceWarning(true);
      setPerformanceMetrics(metrics);
      console.warn('⚠️ Performance warning triggered:', metrics);
    }
  });

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setGameStarted(false);
    if (soundEffectsEnabled) {
      playDie();
    }
    onGameOver(score, coins);
    onCollision();
  }, [score, coins, soundEffectsEnabled, playDie, onGameOver, onCollision]);

  // Handle flap
  const handleFlap = useCallback(() => {
    if (gameOver) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    setBirdVel(FLAP_STRENGTH);
    if (soundEffectsEnabled) {
      playWingFlap();
    }
  }, [gameOver, gameStarted, soundEffectsEnabled, playWingFlap]);

  // Expose continue game function
  useEffect(() => {
    if (continueGameRef.current) {
      continueGameRef.current = () => {
        setGameOver(false);
        setGameStarted(false);
        setScore(0);
        setCoins(0);
        setBirdY(GAME_HEIGHT / 2);
        setBirdVel(0);
        setPipes([{ x: GAME_WIDTH + 100, gapY: GAME_HEIGHT / 2 }]);
        setCoinPos({ x: GAME_WIDTH + 300, y: 200, phase: 0 });
        performanceOptimizer.reset();
      };
    }
  }, [continueGameRef]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = getPerformanceMetrics();
      const settings = getOptimizedSettings();
      
      if (metrics.currentFPS < 30) {
        setShowPerformanceWarning(true);
        setPerformanceMetrics(metrics);
      } else if (metrics.currentFPS >= 45) {
        setShowPerformanceWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getPerformanceMetrics, getOptimizedSettings]);

  return (
    <div 
      className="game-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme === 'night' ? '#1a1a1a' : '#87CEEB'
      }}
      onClick={handleFlap}
    >
      {/* Performance Warning */}
      {showPerformanceWarning && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000
          }}
        >
          ⚠️ Low Performance: {performanceMetrics?.currentFPS || 0} FPS
        </div>
      )}

      {/* Optimized Game Renderer */}
      <OptimizedGameRenderer
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '480px',
          maxHeight: '800px',
          margin: '0 auto'
        }}
        onCanvasReady={(canvas, ctx) => {
          console.log('🎮 Optimized game canvas ready');
        }}
      >
        {({ renderer }) => {
          // Render game elements using the optimized renderer
          useEffect(() => {
            if (!renderer) return;

            const renderFrame = () => {
              const settings = performanceOptimizer.getOptimizedSettings();

              // Clear canvas
              renderer.draw.rect(0, 0, GAME_WIDTH, GAME_HEIGHT, theme === 'night' ? '#1a1a1a' : '#87CEEB');

              // Draw pipes
              pipes.forEach(pipe => {
                // Top pipe
                renderer.draw.rect(pipe.x, 0, PIPE_WIDTH, pipe.gapY, '#228B22');
                // Bottom pipe
                renderer.draw.rect(
                  pipe.x, 
                  pipe.gapY + PIPE_GAP, 
                  PIPE_WIDTH, 
                  GAME_HEIGHT - pipe.gapY - PIPE_GAP, 
                  '#228B22'
                );
              });

              // Draw bird
              renderer.draw.rect(100, birdY, BIRD_WIDTH, BIRD_HEIGHT, '#FFD700');

              // Draw coin
              const coinY = coinPos.y + Math.sin(coinPos.phase) * 10;
              renderer.draw.circle(coinPos.x + COIN_SIZE/2, coinY + COIN_SIZE/2, COIN_SIZE/2, '#FFD700');

              // Draw score
              renderer.draw.text(
                `Score: ${score}`, 
                10, 
                30, 
                '24px Arial', 
                theme === 'night' ? '#ffffff' : '#000000'
              );

              // Draw coins
              renderer.draw.text(
                `Coins: ${coins}`, 
                10, 
                60, 
                '20px Arial', 
                theme === 'night' ? '#ffffff' : '#000000'
              );

              // Draw FPS in development
              if (process.env.NODE_ENV === 'development') {
                const metrics = performanceOptimizer.getPerformanceMetrics();
                renderer.draw.text(
                  `FPS: ${metrics.currentFPS}`, 
                  GAME_WIDTH - 100, 
                  30, 
                  '16px Arial', 
                  metrics.currentFPS < 30 ? '#ff0000' : '#00ff00'
                );
              }
            };

            // Queue the render
            renderer.queueRender(renderFrame);
          }, [renderer, pipes, birdY, coinPos, score, coins, theme]);

          return null;
        }}
      </OptimizedGameRenderer>

      {/* Game Over Overlay */}
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '24px'
          }}
        >
          <div>Game Over!</div>
          <div>Score: {score}</div>
          <div>Coins: {coins}</div>
          <button
            onClick={() => {
              setGameOver(false);
              setGameStarted(false);
              setScore(0);
              setCoins(0);
              setBirdY(GAME_HEIGHT / 2);
              setBirdVel(0);
              setPipes([{ x: GAME_WIDTH + 100, gapY: GAME_HEIGHT / 2 }]);
              setCoinPos({ x: GAME_WIDTH + 300, y: 200, phase: 0 });
              performanceOptimizer.reset();
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Tap to Start */}
      {!gameStarted && !gameOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: theme === 'night' ? '#ffffff' : '#000000',
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          Tap to Start
        </div>
      )}
    </div>
  );
};
