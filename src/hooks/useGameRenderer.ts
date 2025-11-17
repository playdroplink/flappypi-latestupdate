import { useCallback, useState, useRef, useEffect } from 'react';
import { useBirdRenderer } from './useBirdRenderer';
import { usePipesRenderer } from './usePipesRenderer';
import { usePerformance } from '../context/PerformanceContext';

interface UseGameRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameStateRef: React.MutableRefObject<any>;
  birdSkin: string;
  gameMode: 'classic' | 'endless' | 'challenge';
  userDifficulty?: 'easy' | 'medium' | 'hard';
}

export const useGameRenderer = ({
  canvasRef,
  gameStateRef,
  birdSkin,
  gameMode,
  userDifficulty = 'medium'
}: UseGameRendererProps) => {
  const { renderBird } = useBirdRenderer({ birdSkin });
  const { renderPipes } = usePipesRenderer();
  const { lowQualityMode } = usePerformance();

  // Preload images for better performance
  const [flappyCoinImageLoaded, setFlappyCoinImageLoaded] = useState(false);
  const flappyCoinImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Preload Flappy coin image with better error handling
    const flappyCoinImage = new Image();
    flappyCoinImage.crossOrigin = 'anonymous'; // Add CORS support
    
    flappyCoinImage.onload = () => {
      console.log('✅ Flappy coin image loaded successfully');
      setFlappyCoinImageLoaded(true);
      flappyCoinImageRef.current = flappyCoinImage;
    };
    
    flappyCoinImage.onerror = () => {
      console.warn('❌ Failed to load Flappy coin image, using fallback');
      // Create a fallback canvas-based coin
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw a simple gold coin as fallback
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(24, 24, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#FFA500';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('π', 24, 30);
      }
      // Convert canvas to image
      canvas.toBlob((blob) => {
        if (blob) {
          const fallbackImage = new Image();
          fallbackImage.onload = () => {
            setFlappyCoinImageLoaded(true);
            flappyCoinImageRef.current = fallbackImage;
          };
          fallbackImage.src = URL.createObjectURL(blob);
        }
      });
    };
    
    // Try multiple paths for the coin image
    const coinPaths = [
      '/flappycoins.png',
      '/flappycoins.webp',
      '/assets/flappycoins.png',
      '/images/flappycoins.png'
    ];
    
    let pathIndex = 0;
    const tryNextPath = () => {
      if (pathIndex < coinPaths.length) {
        flappyCoinImage.src = coinPaths[pathIndex];
        pathIndex++;
      } else {
        // If all paths fail, trigger the error handler
        flappyCoinImage.onerror?.();
      }
    };
    
    flappyCoinImage.onerror = tryNextPath;
    tryNextPath();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas not available for drawing');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }

    const state = gameStateRef.current;
    if (!state) {
      console.warn('Game state not available');
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enhanced background with theme support
    const drawBackground = () => {
      // Use consistent background that matches the main game container
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB'); // Light blue sky
      gradient.addColorStop(1, '#98D8E8'); // Light blue sky bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Simple ground that doesn't conflict with main background
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    };
    
    drawBackground();

    // Draw pipes
    if (state.pipes) {
      renderPipes(ctx, canvas, state.pipes, { timeOfDay: 'day' }, state.gameStarted);
    }

    // Draw floating coins using Flappy coin images from public folder
    if (state.floatingCoins && state.floatingCoins.length > 0) {
      state.floatingCoins.forEach((coin: any) => {
        if (!coin.collected) {
          const coinSize = 30;
          // Improved floating animation with smoother sine wave
          const animationOffset = Math.sin(coin.animationFrame * 0.05) * 2;
          const x = coin.x;
          const y = coin.y + animationOffset;
          
          // Use preloaded Flappy coin image
          const flappyCoinImage = flappyCoinImageRef.current;
          
          // Draw glow effect around the coin (only in high quality mode)
          if (!lowQualityMode) {
            ctx.save();
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.globalAlpha = 0.8;
            
            // Draw gold glow circle
            ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(x, y, coinSize + 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw sparkle effect with improved positioning
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 5;
            const sparkleOffset = Math.sin(coin.animationFrame * 0.15) * 4;
            ctx.beginPath();
            ctx.arc(x - 12 + sparkleOffset, y - 12, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 12 - sparkleOffset, y + 12, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y - 18 + sparkleOffset, 1, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
          }
          }
          
          // Draw the Flappy coin image with proper rotation centering
          if (flappyCoinImage && flappyCoinImage.complete && flappyCoinImage.naturalHeight !== 0) {
            ctx.save();
            
            // Translate to coin center FIRST for proper rotation origin
            ctx.translate(x, y);
            
            // Add smooth rotation animation (slower for better visual)
            const rotationAngle = coin.animationFrame * 0.06;
            ctx.rotate(rotationAngle);
            
            // Draw image centered on the transform origin
            ctx.drawImage(flappyCoinImage, -coinSize / 2, -coinSize / 2, coinSize, coinSize);
            
            ctx.restore();
          } else {
            // Fallback: Draw gold coin shape with proper rotation centering
            ctx.save();
            
            // Translate to coin center for proper rotation
            ctx.translate(x, y);
            
            // Add rotation animation
            const rotationAngle = coin.animationFrame * 0.06;
            ctx.rotate(rotationAngle);
            
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 3;
            
            // Draw coin circle centered on origin
            ctx.beginPath();
            ctx.arc(0, 0, coinSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Add Pi symbol centered
            ctx.fillStyle = '#FF8C00';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('π', 0, 0);
            
            ctx.restore();
          }
          
          // Draw coin value indicator (positioned relative to world coordinates)
          if (coin.value > 1) {
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const valueText = `+${coin.value}`;
            ctx.strokeText(valueText, x, y - coinSize - 8);
            ctx.fillText(valueText, x, y - coinSize - 8);
            ctx.restore();
          }
        }
      });
    }

    // Draw power-ups
    if (state.powerUps && state.powerUps.length > 0) {
      state.powerUps.forEach((powerUp: any) => {
        if (!powerUp.collected) {
          const powerUpSize = 25;
          const animationOffset = Math.sin(powerUp.animationFrame * 0.15) * 2;
          
          // Draw power-up glow
          ctx.save();
          ctx.shadowColor = '#FF69B4';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#FF1493';
          ctx.beginPath();
          ctx.arc(powerUp.x, powerUp.y + animationOffset, powerUpSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw power-up symbol
          ctx.restore();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          const symbol = powerUp.type === 'shield' ? '🛡️' : 
                        powerUp.type === 'speed' ? '⚡' :
                        powerUp.type === 'magnet' ? '🧲' : '💖';
          ctx.fillText(symbol, powerUp.x, powerUp.y + animationOffset + 6);
        }
      });
    }

    // Draw bird
    if (state.bird) {
      // Only log once when bird is first rendered
      if (!state.birdLogged) {
        console.log('Bird successfully rendered:', {
          position: { x: state.bird.x, y: state.bird.y },
          gameStarted: state.gameStarted,
          birdSkin: birdSkin
        });
        state.birdLogged = true;
      }
      renderBird(ctx, state.bird, state.frameCount || 0, state.gameStarted, { timeOfDay: 'day' });
    } else {
      console.warn('Bird object is missing from game state');
    }

    // CRITICAL: Draw floating particles for atmosphere (heavily reduced for performance)
    if (state.gameStarted && !lowQualityMode && state.frameCount % 3 === 0) { // Only render every 3rd frame
      const particleCount = 3; // Further reduced particle count
      for (let i = 0; i < particleCount; i++) {
        const x = (state.frameCount * 0.3 + i * 150) % (canvas.width + 50); // Slower movement
        const y = 50 + Math.sin((state.frameCount + i * 100) * 0.005) * 15; // Reduced amplitude
        const alpha = 0.2 + Math.sin((state.frameCount + i * 50) * 0.01) * 0.1; // Reduced alpha
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2); // Smaller particles
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw score with enhanced styling (optimized for performance)
    if (state.gameStarted && typeof state.score === 'number') {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      
      const scoreText = state.score.toString();
      const x = canvas.width / 2;
      const y = 80;
      
      // Add glow effect only if not in low quality mode
      if (!lowQualityMode) {
        ctx.save();
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.strokeText(scoreText, x, y);
        ctx.fillText(scoreText, x, y);
        ctx.restore();
      } else {
        // Simplified rendering for low quality mode
        ctx.strokeText(scoreText, x, y);
        ctx.fillText(scoreText, x, y);
      }
    }

    // Draw start message
    if (!state.gameStarted && !state.gameOver) {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      
      const message = 'Tap to Start';
      const x = canvas.width / 2;
      const y = canvas.height / 2 + 80;
      
      ctx.strokeText(message, x, y);
      ctx.fillText(message, x, y);
    }
  }, [canvasRef, gameStateRef, renderBird, renderPipes, birdSkin, lowQualityMode]);

  const resetVisuals = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  return { draw, resetVisuals };
};
