import { useCallback, useRef, useEffect } from 'react';
import { useGameState } from './useGameState';

export const useGameLoop = () => {
  const gameStateRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const { gameMode } = useGameState();

  // Cleanup function to prevent memory leaks
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    lastTimeRef.current = 0;
  }, []);

  // Optimized game loop with proper cleanup
  const startGameLoop = useCallback(() => {
    if (!gameStateRef.current) return;

    const loop = (currentTime: number) => {
      if (!gameStateRef.current?.gameStarted) {
        cleanup();
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update game state with delta time for smooth animation
      if (gameStateRef.current.gameStarted && !gameStateRef.current.gameOver) {
        // Update bird position
        gameStateRef.current.bird.y += gameStateRef.current.bird.velocity;
        gameStateRef.current.bird.velocity += gameStateRef.current.gravity;

        // Update pipes
        gameStateRef.current.pipes.forEach((pipe: any) => {
          pipe.x -= gameStateRef.current.gameSpeed;
        });

        // Remove off-screen pipes
        gameStateRef.current.pipes = gameStateRef.current.pipes.filter(
          (pipe: any) => pipe.x > -100
        );

        // Update game speed based on mode and progress
        if (gameMode === 'endless') {
          gameStateRef.current.gameSpeed = Math.min(2.0, 1 + gameStateRef.current.score / 150);
        } else if (gameMode === 'challenge') {
          gameStateRef.current.gameSpeed = Math.min(2.5, 1.3 + gameStateRef.current.score / 80);
        } else {
          gameStateRef.current.gameSpeed = Math.min(1.8, 1 + gameStateRef.current.score / 200);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  }, [gameMode, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const jump = useCallback(() => {
    if (gameStateRef.current?.gameStarted) {
      const jumpStrength = gameMode === 'challenge' ? -6.5 : gameMode === 'endless' ? -6 : -5.5;
      gameStateRef.current.bird.velocity = jumpStrength;
    }
  }, [gameMode]);

  return {
    startGameLoop,
    jump,
    cleanup,
    gameStateRef
  };
};
