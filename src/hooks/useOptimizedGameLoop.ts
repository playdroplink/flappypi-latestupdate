import { useCallback, useRef, useEffect, useMemo } from 'react';
import { performanceOptimizer } from '../utils/gamePerformanceOptimizer';

interface UseOptimizedGameLoopProps {
  isPlaying: boolean;
  isPaused: boolean;
  updateGame: (deltaTime: number) => void;
  renderGame: () => void;
  targetFPS?: number;
  onPerformanceWarning?: (metrics: any) => void;
}

export const useOptimizedGameLoop = ({
  isPlaying,
  isPaused,
  updateGame,
  renderGame,
  targetFPS = 60,
  onPerformanceWarning
}: UseOptimizedGameLoopProps) => {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const performanceWarningShownRef = useRef<boolean>(false);

  // Memoize the game loop function to prevent unnecessary re-creations
  const gameLoop = useMemo(() => {
    return (timestamp: number) => {
      if (!isPlaying || isPaused) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Update performance optimizer
      performanceOptimizer.updateFrameTime();

      // Get optimized settings
      const settings = performanceOptimizer.getOptimizedSettings();
      const metrics = performanceOptimizer.getPerformanceMetrics();

      // Check if frame should be skipped for performance
      if (performanceOptimizer.shouldSkipFrame()) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Calculate delta time with capping to prevent lag spikes
      const deltaTime = Math.min(timestamp - lastTimeRef.current, 50); // Cap at 50ms
      lastTimeRef.current = timestamp;
      frameCountRef.current++;

      // Update game logic with optimized collision detection
      if (performanceOptimizer.shouldCheckCollisions(frameCountRef.current)) {
        updateGame(deltaTime);
      }

      // Always render for smooth visuals
      renderGame();

      // Performance monitoring and warnings
      if (metrics.currentFPS < 30 && !performanceWarningShownRef.current) {
        performanceWarningShownRef.current = true;
        onPerformanceWarning?.(metrics);
        console.warn('⚠️ Performance warning - Low FPS detected:', metrics.currentFPS);
      } else if (metrics.currentFPS >= 45) {
        performanceWarningShownRef.current = false;
      }

      // Continue the loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
  }, [isPlaying, isPaused, updateGame, renderGame, onPerformanceWarning]);

  // Start/stop game loop based on playing state
  useEffect(() => {
    if (isPlaying && !isPaused) {
      lastTimeRef.current = performance.now();
      frameCountRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, isPaused, gameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Return performance metrics and optimization methods
  const getPerformanceMetrics = useCallback(() => {
    return performanceOptimizer.getPerformanceMetrics();
  }, []);

  const getOptimizedSettings = useCallback(() => {
    return performanceOptimizer.getOptimizedSettings();
  }, []);

  const resetPerformance = useCallback(() => {
    performanceOptimizer.reset();
  }, []);

  return {
    getPerformanceMetrics,
    getOptimizedSettings,
    resetPerformance,
    frameCount: frameCountRef.current
  };
};
