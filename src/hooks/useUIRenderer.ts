
import { useCallback } from 'react';

export const useUIRenderer = () => {
  const renderTapToStart = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    gameStarted: boolean,
    initialized: boolean,
    frameCount: number,
    difficulty: any
  ) => {
    if (gameStarted || !initialized) return;

    // Create a semi-transparent overlay with improved visibility
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Responsive font sizes based on canvas size
    const isMobile = canvas.width <= 768;
    const titleSize = isMobile ? Math.max(20, canvas.width * 0.06) : 30;
    const subtitleSize = isMobile ? Math.max(14, canvas.width * 0.04) : 20;
    const smallTextSize = isMobile ? Math.max(12, canvas.width * 0.035) : 16;
    
    // Main title with enhanced visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('Tap to Start!', canvas.width / 2, canvas.height / 2);
    
    // Subtitle with instructions
    ctx.shadowBlur = 5;
    ctx.font = `${subtitleSize}px Arial`;
    const instructionText = isMobile ? 'Touch to fly' : 'Touch the screen or press space to begin flying';
    ctx.fillText(instructionText, canvas.width / 2, canvas.height / 2 + 40);
    
    // Theme indicator
    ctx.font = `${smallTextSize}px Arial`;
    const themeText = `${difficulty.backgroundTheme.charAt(0).toUpperCase() + difficulty.backgroundTheme.slice(1)} Theme`;
    ctx.fillText(themeText, canvas.width / 2, canvas.height / 2 + 70);
    
    // Animated "Get Ready" pulse effect with improved visibility
    const pulseAlpha = 0.5 + Math.sin(frameCount * 0.1) * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    ctx.font = `bold ${smallTextSize}px Arial`;
    ctx.fillText('Get Ready!', canvas.width / 2, canvas.height / 2 + 100);
    
    // Draw a hint arrow to indicate tap action
    ctx.save();
    const arrowY = canvas.height / 2 + 140;
    ctx.translate(canvas.width / 2, arrowY);
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    
    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(0, -15);  
    ctx.lineTo(10, 0);   
    ctx.lineTo(-10, 0);  
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Remove shadow effect for subsequent renders
    ctx.shadowBlur = 0;
  }, []);

  return { renderTapToStart };
};
