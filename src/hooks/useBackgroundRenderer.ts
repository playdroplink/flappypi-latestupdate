
import { useCallback, useRef } from 'react';
import { getDifficultyByUserChoice, getBackgroundGradient } from '../utils/gameDifficulty';

interface UseBackgroundRendererProps {
  gameMode: 'classic' | 'endless' | 'challenge';
  userDifficulty?: 'easy' | 'medium' | 'hard';
}

export const useBackgroundRenderer = ({ 
  gameMode,
  userDifficulty = 'medium'
}: UseBackgroundRendererProps) => {
  const backgroundCache = useRef<{ theme: string; colors: any } | null>(null);
  const starField = useRef<Array<{x: number, y: number, size: number, twinkle: number}>>([]);
  const backgroundOffset = useRef<number>(0);
  const isInitialized = useRef<boolean>(false);

  const getBackgroundColorsOptimized = useCallback((theme: string) => {
    if (backgroundCache.current && backgroundCache.current.theme === theme) {
      return backgroundCache.current.colors;
    }
    
    const colors = getBackgroundGradient(theme);
    backgroundCache.current = { theme, colors };
    return colors;
  }, []);

  const initializeStarField = useCallback((canvas: HTMLCanvasElement) => {
    if (starField.current.length === 0) {
      // CRITICAL: Further reduced star count for maximum performance
      const starCount = 25; // Reduced from 50 to 25
      for (let i = 0; i < starCount; i++) {
        starField.current.push({
          // Position stars further back (more towards the right side of screen)
          x: Math.random() * canvas.width + 300, // Start stars 300px further back
          y: Math.random() * canvas.height * 0.6, // Reduced vertical range
          size: Math.random() * 1.5 + 0.3, // Smaller stars
          twinkle: Math.random() * Math.PI * 2
        });
      }
    }
  }, []);

  const resetBackground = useCallback(() => {
    console.log('🎨 Resetting background renderer');
    backgroundOffset.current = 0;
    starField.current = [];
    isInitialized.current = false;
    backgroundCache.current = null;
    console.log('✅ Background renderer reset complete');
  }, []);

  const renderBackground = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    score: number,
    frameCount: number,
    gameStarted: boolean = false
  ) => {
    const difficulty = getDifficultyByUserChoice(userDifficulty, score, gameMode);
    const backgroundColors = getBackgroundColorsOptimized(difficulty.backgroundTheme);

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, backgroundColors.top);
    gradient.addColorStop(0.7, backgroundColors.middle || backgroundColors.top);
    gradient.addColorStop(1, backgroundColors.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update background offset only when game is started - slower scroll for deeper background
    if (gameStarted) {
      backgroundOffset.current += difficulty.backgroundScrollSpeed * 0.2; // Reduced from 0.3 to 0.2
    }

    // Draw stars for night and space themes
    if (difficulty.hasStars) {
      initializeStarField(canvas);
      ctx.fillStyle = difficulty.backgroundTheme === 'space' ? '#FFFFFF' : '#FFFFCC';
      
      starField.current.forEach((star) => {
        const twinkle = Math.sin(frameCount * 0.02 + star.twinkle) * 0.3 + 0.7;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Only move stars when game is started - slower movement for depth
        if (gameStarted) {
          star.x -= difficulty.backgroundScrollSpeed * 0.05; // Reduced from 0.1 to 0.05
          if (star.x < -10) {
            star.x = canvas.width + 210; // Respawn further back
            star.y = Math.random() * canvas.height * 0.8;
          }
        }
      });
      ctx.globalAlpha = 1;
    }

    // Draw nebula effect for space theme - positioned further back
    if (difficulty.hasNebulaEffect) {
      const nebulaGradient = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.3, 0, // Moved further back (0.7 to 0.8)
        canvas.width * 0.8, canvas.height * 0.3, canvas.width * 0.6
      );
      nebulaGradient.addColorStop(0, 'rgba(138, 43, 226, 0.1)');
      nebulaGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.05)');
      nebulaGradient.addColorStop(1, 'rgba(25, 25, 112, 0.02)');
      
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return difficulty;
  }, [gameMode, userDifficulty, getBackgroundColorsOptimized, initializeStarField]);

  return { renderBackground, resetBackground };
};
