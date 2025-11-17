import { useCallback, useRef } from 'react';
import { gameModes, getLevelForScore } from '../constants/gameModes';
// import {
//   getPipeParams,
//   getPhysicsParams,
//   getThemeByLevel,
//   isDifficultyMilestone,
//   getMilestoneMessage,
//   generateRandomGap
// } from '../utils/difficultySystem';
import { GameLevel } from '../config/gameLevels'; // Import GameLevel

interface UseGamePhysicsProps {
  gameStateRef: React.MutableRefObject<any>;
  onScoreUpdate: (score: number) => void;
  onCoinEarned: (coins: number) => void;
  checkCollisions: (canvas: HTMLCanvasElement) => boolean;
  onCollision: () => void;
  gameMode: 'classic' | 'endless' | 'challenge';
  currentLevelConfig: GameLevel; // Add currentLevelConfig
}

export const useGamePhysics = ({
  gameStateRef,
  onScoreUpdate,
  onCoinEarned,
  checkCollisions,
  onCollision,
  gameMode,
  currentLevelConfig // Destructure currentLevelConfig
}: UseGamePhysicsProps) => {
  const lastPipeSpawn = useRef(0);
  const pipeIdCounter = useRef(0);
  const performanceMonitor = useRef({ lastFrameTime: 0, frameCount: 0, avgFPS: 60 });

  // Dynamic pipe generation based on current level difficulty - FIXED FOR FLAPPY BIRD GAMEPLAY
  const generatePipe = useCallback((canvas: HTMLCanvasElement, level: number) => {
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    
    // Get dynamic difficulty parameters based on level
    // const pipeParams = getPipeParams(level); // To be removed
    const pipeWidth = 52; // Keep classic pipe width
    
    // FLAPPY BIRD FIX: Ensure gap is always large enough for bird to pass through easily
    const minGapSize = 120; // Minimum gap for easy passage
    const maxGapSize = 180; // Maximum gap for challenge
    const gapSize = Math.max(minGapSize, Math.min(maxGapSize, currentLevelConfig.pipeGapMultiplier * (canvasHeight / 4))); // Use currentLevelConfig.pipeGapMultiplier
    
    // FLAPPY BIRD FIX: Safe pipe positioning
    const minPipeHeight = 80; // Minimum pipe height from top
    const maxPipeHeight = canvasHeight - gapSize - 80; // Maximum pipe height (leave space for bottom pipe)
    
    // Ensure we have valid range for pipe generation
    if (maxPipeHeight <= minPipeHeight) {
      console.warn('⚠️ Using fallback pipe generation due to canvas size');
      // Fallback to guaranteed safe values
      const safeGapSize = Math.floor(canvasHeight * 0.35); // 35% of screen height
      const safeTopHeight = Math.floor(canvasHeight * 0.2) + Math.random() * Math.floor(canvasHeight * 0.3);
      const safeBottomY = safeTopHeight + safeGapSize;
      
      return {
        id: ++pipeIdCounter.current,
        x: canvasWidth + 10,
        topHeight: safeTopHeight,
        bottomY: safeBottomY,
        width: pipeWidth,
        passed: false,
        scored: false,
        gapSize: safeGapSize,
        level: level
      };
    }
    
    // FLAPPY BIRD FIX: Center the gap in the middle third of the screen for fair gameplay
    const screenMiddle = canvasHeight / 2;
    const gapCenter = screenMiddle + (Math.random() - 0.5) * (canvasHeight * 0.3); // Allow 30% variance from center
    
    // Calculate pipe heights based on gap center
    const topHeight = Math.max(minPipeHeight, Math.min(gapCenter - gapSize / 2, maxPipeHeight));
    const bottomY = topHeight + gapSize;
    
    // Final safety check - ensure bottom pipe doesn't go off screen
    const finalBottomY = Math.min(bottomY, canvasHeight - 30);
    const finalTopHeight = finalBottomY - gapSize;
    
    // If adjustment made the top pipe too small, adjust the gap instead
    let adjustedGapSize = gapSize;
    let adjustedTopHeight = finalTopHeight;
    
    if (finalTopHeight < minPipeHeight) {
      adjustedTopHeight = minPipeHeight;
      adjustedGapSize = finalBottomY - adjustedTopHeight;
    }
    
    const pipe = {
      id: ++pipeIdCounter.current,
      x: canvasWidth + 10, // Spawn just off-screen
      topHeight: adjustedTopHeight,
      bottomY: adjustedTopHeight + adjustedGapSize,
      width: pipeWidth,
      passed: false,
      scored: false,
      gapSize: adjustedGapSize,
      level: level // Track level for this pipe
    };
    
    console.log('🔧 FLAPPY BIRD pipe generated for level', level, ':', {
      id: pipe.id,
      topHeight: Math.round(adjustedTopHeight),
      bottomY: Math.round(pipe.bottomY),
      gap: Math.round(adjustedGapSize),
      gapCenter: Math.round((pipe.topHeight + pipe.bottomY) / 2),
      screenMiddle: Math.round(screenMiddle),
      canvasHeight: canvasHeight,
      difficulty: level <= 4 ? 'Easy' : level <= 29 ? 'Medium' : level <= 49 ? 'Hard' : 'Extreme'
    });
    
    return pipe;
  }, [onScoreUpdate, onCoinEarned, currentLevelConfig]); // Add currentLevelConfig to useCallback dependencies

  // Enhanced collision detection with optimized performance - FIXED FOR FLAPPY BIRD GAMEPLAY
  const checkAdvancedCollisions = useCallback((canvas: HTMLCanvasElement) => {
    const state = gameStateRef.current;
    if (!state || state.gameOver) return false;

    const bird = state.bird;
    // FLAPPY BIRD FIX: Reduce bird collision radius for more forgiving gameplay
    const birdRadius = (bird.size / 2) * 0.7; // 70% of visual size for more forgiving collision

    // FLAPPY BIRD FIX: Ground and ceiling collision that matches classic Flappy Bird
    const groundLevel = canvas.height - 30; // Match classic ground level
    const ceilingLevel = 0; // Classic ceiling collision
    
    if (bird.y + birdRadius >= groundLevel || bird.y - birdRadius <= ceilingLevel) {
      console.log(`🔥 FLAPPY BIRD boundary collision - Bird Y: ${Math.round(bird.y)}, Ground: ${groundLevel}, Ceiling: ${ceilingLevel}`);
      state.gameOver = true;
      return true;
    }

    // FLAPPY BIRD FIX: More forgiving pipe collision detection
    if (state.pipes && state.pipes.length > 0) {
      for (const pipe of state.pipes) {
        // Only check collision for pipes that overlap with bird horizontally
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + pipe.width;
      const birdLeft = bird.x - birdRadius;
      const birdRight = bird.x + birdRadius;
        
        // FLAPPY BIRD FIX: Check horizontal overlap with small buffer
        const horizontalBuffer = 5; // Small buffer for more forgiving collision
        if (birdRight > pipeLeft + horizontalBuffer && birdLeft < pipeRight - horizontalBuffer) {
          // Bird is horizontally aligned with pipe - check vertical collision
      const birdTop = bird.y - birdRadius;
      const birdBottom = bird.y + birdRadius;

          // FLAPPY BIRD FIX: More precise gap checking
          const gapTop = pipe.topHeight;
          const gapBottom = pipe.bottomY;
          
          // Check if bird is in the gap (safe zone)
          const inGap = birdTop >= gapTop && birdBottom <= gapBottom;
          
          if (!inGap) {
            // Bird hit pipe - check which part
            const hitTopPipe = birdTop < gapTop;
            const hitBottomPipe = birdBottom > gapBottom;
            
            console.log(`💥 FLAPPY BIRD pipe collision detected:`, {
              birdY: Math.round(bird.y),
              birdTop: Math.round(birdTop),
              birdBottom: Math.round(birdBottom),
              gapTop: Math.round(gapTop),
              gapBottom: Math.round(gapBottom),
              gapSize: Math.round(gapBottom - gapTop),
              hitTopPipe,
              hitBottomPipe,
              pipeId: pipe.id
            });

            // Apply damage if in Lava World
            if (currentLevelConfig.damageOnContact) {
              console.log("🔥 Lava World: Bird took minor burn damage on pipe contact!");
              // Implement actual damage logic here, e.g., decrease lives or health.
              // For now, if damageOnContact is true, it still results in game over for simplicity
              // (as standard Flappy Bird collision means game over anyway).
            }
            
            state.gameOver = true;
          return true;
        }
        
          // FLAPPY BIRD FIX: Score when bird passes the CENTER of the pipe (classic scoring)
          if (!pipe.scored && bird.x > pipe.x + pipe.width / 2) {
            pipe.scored = true;
            state.score++;
            onScoreUpdate(state.score);

            // Award coins (enhanced feature)
            const coinsEarned = 1;
            onCoinEarned(coinsEarned);

            // Bonus coins for milestones (every 10 points like classic)
            if (state.score % 10 === 0) {
              const bonusCoins = 5;
              onCoinEarned(bonusCoins);
            }

            console.log(`🎯 FLAPPY BIRD score! Score: ${state.score}, Pipe ID: ${pipe.id}`);
          }
        }
      }
    }

    return false;
  }, [onScoreUpdate, onCoinEarned, currentLevelConfig]); // Add currentLevelConfig to useCallback dependencies

  // Enhanced game update with classic Flappy Bird physics and timing
  const updateGame = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas || !gameStateRef.current?.gameStarted) return;

    const state = gameStateRef.current;
    const currentTime = performance.now();

    // Performance monitoring
    const monitor = performanceMonitor.current;
    if (monitor.lastFrameTime > 0) {
      const deltaTime = currentTime - monitor.lastFrameTime;
      monitor.frameCount++;
      if (monitor.frameCount % 60 === 0) {
        monitor.avgFPS = Math.round(1000 / (deltaTime));
        if (monitor.avgFPS < 50) {
          console.log('⚠️ Performance warning - FPS:', monitor.avgFPS);
        }
      }
    }
    monitor.lastFrameTime = currentTime;

    // Get current game mode configuration
    // const currentGameMode = gameModes.find(mode => mode.id === gameMode); // To be removed/simplified
    // if (!currentGameMode) return;

    // Get current level based on score and game mode
    // const currentLevel = getLevelForScore(currentGameMode, state.score); // To be removed/simplified
    
    // Update frame count
    state.frameCount++;

    // Dynamic physics based on current level
    // const levelNumber = currentLevel?.level || state.level || 1; // To be removed
    // const physicsParams = getPhysicsParams(levelNumber); // To be removed
    // const pipeParams = getPipeParams(levelNumber); // To be removed
    
    const GRAVITY = currentLevelConfig.gravity;
    const JUMP_STRENGTH = currentLevelConfig.jumpStrength;
    const TERMINAL_VELOCITY = currentLevelConfig.terminalVelocity;
    const PIPE_SPEED = currentLevelConfig.pipeSpeedMultiplier * 100; // Adjust multiplier as needed, e.g., 100 pixels per second
    const PIPE_SPACING = currentLevelConfig.pipeSpacing;
    const MIN_PIPES_ON_SCREEN = 3;

    // Apply flap delay for Ice World
    if (currentLevelConfig.slipperyMotion) {
        // This needs to be handled at the input handling level (useGameInputHandlers) to delay the actual flap.
        // For now, we'll just log this.
        console.log("❄️ Ice World: Slippery motion (flap delay) active.");
    }

    // Apply wind push for Desert World
    if (currentLevelConfig.windPush) {
        // Random horizontal push
        state.bird.x += (Math.random() - 0.5) * 2; // Small random horizontal shift
        console.log("🏜️ Desert World: Wind push active.");
    }

    // Apply random vertical shift for Floating Rock World
    if (currentLevelConfig.randomVerticalShift) {
        state.bird.y += (Math.random() - 0.5) * 2; // Small random vertical shift
        console.log("🌄 Floating Rock World: Random vertical shift active.");
    }

    // Adjust bird's vertical velocity due to gravity
    state.bird.velocityY += GRAVITY;
    state.bird.velocityY = Math.min(state.bird.velocityY, TERMINAL_VELOCITY);
    state.bird.y += state.bird.velocityY;

    // Ensure bird stays within canvas bounds (simplified for now, full collision check handles this)
    if (state.bird.y < 0) state.bird.y = 0;
    if (state.bird.y > canvas.height - state.bird.size) state.bird.y = canvas.height - state.bird.size; // Prevent falling off bottom

    // Pipe movement and generation
    const pipesToRemove = [];
    if (state.pipes && state.pipes.length > 0) {
      for (let i = state.pipes.length - 1; i >= 0; i--) {
        const pipe = state.pipes[i];
        pipe.x -= PIPE_SPEED * ( (currentTime - monitor.lastFrameTime) / 1000 ); // Move pipes left based on time
        if (pipe.x + pipe.width < 0) {
          pipesToRemove.push(i);
        }
      }
    }

    pipesToRemove.forEach(index => state.pipes.splice(index, 1));

    // Pipe spawning logic
    // Spawns a new pipe only if there's enough space and the last pipe has moved a certain distance
    if (currentTime - lastPipeSpawn.current > PIPE_SPACING / PIPE_SPEED * 1000) { // Calculate interval based on pipe speed and spacing
      if (state.pipes.length < MIN_PIPES_ON_SCREEN) {
        state.pipes.push(generatePipe(canvas, state.level));
        lastPipeSpawn.current = currentTime;
      }
    }

    // Collision check
    if (checkAdvancedCollisions(canvas)) {
      onCollision();
    }
  }, [onScoreUpdate, onCoinEarned, checkCollisions, onCollision, gameMode, currentLevelConfig]); // Add currentLevelConfig to useCallback dependencies

  return {
    generatePipe,
    checkAdvancedCollisions,
    updateGame,
  };
}
