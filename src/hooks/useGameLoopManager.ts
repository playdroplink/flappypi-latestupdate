import { useEffect, useRef, useCallback } from 'react';
// import { usePerformance } from '../context/PerformanceContext'; // Disabled to prevent performance issues
// import { performanceOptimizer } from '../utils/performanceOptimizer'; // Disabled to prevent performance issues

interface UseGameLoopManagerProps {
  gameState: 'menu' | 'playing' | 'gameOver' | 'paused';
  gameStateRef: React.MutableRefObject<any>;
  updateGame: () => void;
  updateGameState: () => void;
  draw: () => void;
  resetGame: (canvasHeight: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  resetVisuals?: () => void;
}

export const useGameLoopManager = ({
  gameState,
  gameStateRef,
  updateGame,
  updateGameState,
  draw,
  resetGame,
  canvasRef,
  resetVisuals
}: UseGameLoopManagerProps) => {
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const frameCounter = useRef<number>(0);
  const performanceStats = useRef({
    fps: 0,
    frameTime: 0,
    lastFpsUpdate: 0,
    frameHistory: [] as number[]
  });
  // const { lowQualityMode, setLowQualityMode, autoLowQuality, setAutoLowQuality, setFps } = usePerformance(); // Disabled
  const lowFpsCounter = useRef(0);

  // Enhanced game loop with performance optimizer integration
  const gameLoop = useCallback((currentTime: number) => {
    // Update performance optimizer - disabled to prevent issues
    // performanceOptimizer.updateFrameTime();
    
    const deltaTime = currentTime - lastFrameTime.current;
    // const settings = performanceOptimizer.getOptimizedSettings(); // Disabled
    const targetFPS = 60; // Fixed target FPS
    const targetFrameTime = 1000 / targetFPS;
    const maxFrameTime = 1000 / 25; // Minimum 25fps fallback
    
    // Check if frame should be skipped for performance - disabled
    // if (performanceOptimizer.shouldSkipFrame()) {
    //   gameLoopRef.current = requestAnimationFrame(gameLoop);
    //   return;
    // }

    // Cap delta time to prevent lag spikes
    const cappedDeltaTime = Math.min(deltaTime, maxFrameTime);
    lastFrameTime.current = currentTime;
    frameCounter.current++;

    // Performance monitoring and optimization - simplified
    const stats = performanceStats.current;
    stats.frameTime = cappedDeltaTime;
    stats.frameHistory.push(cappedDeltaTime);
    
    // Keep only last 60 frames for FPS calculation
    if (stats.frameHistory.length > 60) {
      stats.frameHistory.shift();
    }

    try {
      if (gameState === 'playing' && gameStateRef.current?.gameStarted) {
        // Update game physics every frame for smooth movement
        updateGame();
        
        // Adaptive game state updates based on performance
        const updateFrequency = stats.fps > targetFPS * 0.8 ? 1 : 2; // More frequent updates on high-performance devices
        if (frameCounter.current % updateFrequency === 0) {
          updateGameState();
        }
      }

      // Always draw the current state for smooth visuals
      draw();
      
    } catch (error) {
      console.error('❌ Error in enhanced game loop:', error);
      // Continue the loop even if there's an error to prevent game freeze
    }

    // Continue the loop with optimized scheduling
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updateGame, updateGameState, draw, gameStateRef, setFps, setLowQualityMode, autoLowQuality, setAutoLowQuality]);

  // Enhanced game loop management
  useEffect(() => {
    if (gameState === 'playing') {
      console.log('🚀 Starting enhanced game loop with performance optimization...');
      lastFrameTime.current = performance.now();
      frameCounter.current = 0;
      performanceStats.current = {
        fps: 0,
        frameTime: 0,
        lastFpsUpdate: 0,
        frameHistory: []
      };
      
      // Start the loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        const metrics = performanceOptimizer.getPerformanceMetrics();
        console.log('⏸️ Stopping game loop - Performance stats:', {
          avgFPS: performanceStats.current.fps,
          totalFrames: frameCounter.current,
          deviceScore: metrics.deviceScore,
          deviceTier: performanceOptimizer.getDeviceTier()
        });
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, gameLoop]);

  // Enhanced game reset with optimized canvas setup
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const deviceCapabilities = performanceOptimizer.getDeviceCapabilities();
      const renderQuality = performanceOptimizer.getRenderQuality();
      
      // Optimize canvas for performance based on device capabilities
      const pixelRatio = renderQuality === 'low' ? 1 : Math.min(deviceCapabilities.pixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      
      // Set display size
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // Set actual size in memory (scaled for performance)
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      
      // Scale the drawing context to match device pixel ratio
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
        
        // Optimize rendering settings based on quality
        ctx.imageSmoothingEnabled = renderQuality !== 'low';
        ctx.imageSmoothingQuality = renderQuality === 'high' ? 'high' : 'medium';
      }
      
      // Reset game state for smooth start
      if (!gameStateRef.current?.gameStarted) {
        console.log('🔄 Resetting game with optimized canvas setup...');
        resetGame(canvas.height / pixelRatio); // Use logical height
        if (resetVisuals) {
          resetVisuals();
        }
      }
      
      console.log('📐 Canvas optimized:', {
        displaySize: `${rect.width}x${rect.height}`,
        actualSize: `${canvas.width}x${canvas.height}`,
        pixelRatio: pixelRatio,
        renderQuality: renderQuality,
        deviceTier: performanceOptimizer.getDeviceTier()
      });
    }
  }, [gameState, resetGame, resetVisuals, canvasRef, gameStateRef]);

  // Optimized window resize handler with debouncing
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const renderQuality = performanceOptimizer.getRenderQuality();
          const pixelRatio = renderQuality === 'low' ? 1 : Math.min(window.devicePixelRatio || 1, 2);
          
          // Update canvas size
          canvas.style.width = rect.width + 'px';
          canvas.style.height = rect.height + 'px';
          canvas.width = rect.width * pixelRatio;
          canvas.height = rect.height * pixelRatio;
          
          // Update context scale
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(pixelRatio, pixelRatio);
            ctx.imageSmoothingEnabled = renderQuality !== 'low';
            ctx.imageSmoothingQuality = renderQuality === 'high' ? 'high' : 'medium';
          }
          
          console.log('📱 Canvas resized for performance:', {
            newSize: `${rect.width}x${rect.height}`,
            renderQuality: renderQuality,
            pixelRatio: pixelRatio
          });
        }
      }, 100); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [canvasRef]);

  // Enhanced visibility change handler for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause game loop when tab is not visible to save resources
        if (gameLoopRef.current) {
          console.log('⏸️ Pausing game loop - Tab not visible');
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
        }
      } else {
        // Resume game loop when tab becomes visible
        if (gameState === 'playing' && !gameLoopRef.current) {
          console.log('▶️ Resuming game loop - Tab visible');
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameState, gameLoop]);

  return {
    gameLoopRef,
    performanceStats: performanceStats.current,
    deviceCapabilities: performanceOptimizer.getDeviceCapabilities(),
    performanceMetrics: performanceOptimizer.getPerformanceMetrics(),
    optimizedSettings: performanceOptimizer.getOptimizedSettings(),
    deviceTier: performanceOptimizer.getDeviceTier(),
    shouldSkipFrame: performanceOptimizer.shouldSkipFrame(),
    getRecommendedParticleCount: performanceOptimizer.getRecommendedParticleCount(),
    getRecommendedStarCount: performanceOptimizer.getRecommendedStarCount(),
    shouldReduceAnimations: performanceOptimizer.shouldReduceAnimations(),
    getCollisionDetectionLevel: performanceOptimizer.getCollisionDetectionLevel(),
    getRenderQuality: performanceOptimizer.getRenderQuality(),
    shouldUseLowQualityAssets: performanceOptimizer.shouldUseLowQualityAssets(),
    getPerformanceRecommendations: performanceOptimizer.getPerformanceRecommendations()
  };
};
