
import { useCallback } from 'react';

export const usePipesRenderer = () => {
  const renderPipes = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    pipes: any[],
    difficulty: any,
    gameStarted: boolean
  ) => {
    if (!gameStarted) return;

    const isMobile = window.innerWidth <= 768;

    pipes.forEach((pipe: any) => {
      const pipeWidth = pipe.width || (isMobile ? Math.max(60, canvas.width * 0.15) : 80);
      
      // Use the actual pipe position without adjustment
      const pipeX = pipe.x;
      
      // Pipe colors based on time of day with better mobile visibility
      let pipeGradient = ctx.createLinearGradient(pipeX, 0, pipeX + pipeWidth, 0);
      
      if (difficulty.timeOfDay === 'evening') {
        pipeGradient.addColorStop(0, '#4CAF50');
        pipeGradient.addColorStop(1, '#388E3C');
      } else if (difficulty.timeOfDay === 'night') {
        pipeGradient.addColorStop(0, '#2E7D32');
        pipeGradient.addColorStop(1, '#1B5E20');
      } else {
        pipeGradient.addColorStop(0, '#4CAF50');
        pipeGradient.addColorStop(1, '#388E3C');
      }

      // Enhanced shadows for better mobile visibility
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      const shadowOffset = isMobile ? 3 : 2;
      ctx.fillRect(pipeX + shadowOffset, shadowOffset, pipeWidth, pipe.topHeight);
      ctx.fillRect(pipeX + shadowOffset, pipe.bottomY + shadowOffset, pipeWidth, canvas.height - pipe.bottomY);

      // Add glow effect for moving pipes
      if (pipe.isMoving) {
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = isMobile ? 12 : 8;
      }

      // Top pipe
      ctx.fillStyle = pipeGradient;
      ctx.fillRect(pipeX, 0, pipeWidth, pipe.topHeight);

      // Bottom pipe
      ctx.fillRect(pipeX, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

      // Pipe caps with responsive sizing
      const capGradient = ctx.createLinearGradient(pipeX, 0, pipeX + pipeWidth, 0);
      capGradient.addColorStop(0, '#66BB6A');
      capGradient.addColorStop(1, '#4CAF50');
      
      ctx.fillStyle = capGradient;
      const capHeight = isMobile ? 24 : 20;
      const capOverhang = isMobile ? 6 : 4;
      
      ctx.fillRect(pipeX - capOverhang, pipe.topHeight - capHeight, pipeWidth + (capOverhang * 2), capHeight);
      ctx.fillRect(pipeX - capOverhang, pipe.bottomY, pipeWidth + (capOverhang * 2), capHeight);

      // Debug visualization for mobile (uncomment to debug pipe gaps)
      if (isMobile && pipe.gapSize) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(pipeX, pipe.topHeight, pipeWidth, pipe.gapSize);
        ctx.restore();
      }

      // Reset shadow
      ctx.shadowBlur = 0;
    });
  }, []);

  return { renderPipes };
};
