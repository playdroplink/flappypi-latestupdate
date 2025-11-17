
import { useCallback, useRef } from 'react';

export const useGroundRenderer = () => {
  const groundOffset = useRef(0);

  const resetGround = useCallback(() => {
    console.log('🌍 Resetting ground renderer');
    groundOffset.current = 0;
    console.log('✅ Ground renderer reset complete');
  }, []);

  const renderGround = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    difficulty: any,
    gameStarted: boolean
  ) => {
    const GROUND_HEIGHT = 40;
    const TILE_WIDTH = 50; // Fixed tile width for seamless looping
    
    // Only update ground offset when game is started
    if (gameStarted) {
      groundOffset.current += 2;
    } else {
      groundOffset.current += 0.5; // Slow movement when not started
    }
    
    // Use Math.floor to avoid floating-point precision issues
    groundOffset.current = Math.floor(groundOffset.current);
    
    // Reset offset when it reaches tile width for seamless looping
    if (groundOffset.current >= TILE_WIDTH) {
      groundOffset.current = 0;
    }
    
    // Calculate exact ground Y position to avoid overlapping
    const groundY = canvas.height - GROUND_HEIGHT;
    
    // Clear any previous ground rendering artifacts
    ctx.clearRect(0, groundY, canvas.width, GROUND_HEIGHT);
    
    // Create gradient for ground
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    if (difficulty.timeOfDay === 'evening') {
      groundGradient.addColorStop(0, '#8B4513');
      groundGradient.addColorStop(1, '#654321');
    } else if (difficulty.timeOfDay === 'night') {
      groundGradient.addColorStop(0, '#2F1B14');
      groundGradient.addColorStop(1, '#1A0F0A');
    } else {
      groundGradient.addColorStop(0, '#8B4513');
      groundGradient.addColorStop(1, '#5D2F0C');
    }
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, canvas.width, GROUND_HEIGHT);
    
    // Add ground texture pattern with seamless tiling
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    
    // Draw texture lines across the entire width with proper offset
    const startX = -groundOffset.current;
    const numTiles = Math.ceil(canvas.width / TILE_WIDTH) + 1; // Extra tile for seamless scrolling
    
    for (let i = 0; i < numTiles; i++) {
      const x = startX + (i * TILE_WIDTH);
      // Only draw if the line is visible on screen
      if (x >= -TILE_WIDTH && x <= canvas.width) {
        ctx.fillRect(Math.floor(x), groundY, 2, GROUND_HEIGHT);
        // Add secondary texture lines for more detail
        ctx.fillRect(Math.floor(x + TILE_WIDTH * 0.3), groundY, 1, GROUND_HEIGHT);
        ctx.fillRect(Math.floor(x + TILE_WIDTH * 0.7), groundY, 1, GROUND_HEIGHT);
      }
    }
  }, []);

  const renderBuildings = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    difficulty: any,
    frameCount: number
  ) => {
    // Only render buildings every other frame to reduce visual noise
    if (frameCount % 2 !== 0) return;
    
    const GROUND_HEIGHT = 40;
    const groundY = canvas.height - GROUND_HEIGHT;
    
    ctx.fillStyle = difficulty.timeOfDay === 'night' ? 'rgba(50,50,50,0.8)' : 'rgba(100,100,100,0.6)';
    
    const numBuildings = 5;
    const buildingWidth = canvas.width / numBuildings;
    
    for (let i = 0; i < numBuildings; i++) {
      const buildingX = buildingWidth * i;
      const buildingHeight = 50 + Math.sin(buildingX * 0.01 + frameCount * 0.001) * 30;
      
      // Ensure building height is an integer to avoid sub-pixel rendering
      const height = Math.floor(buildingHeight);
      const y = Math.floor(groundY - height);
      
      ctx.fillRect(Math.floor(buildingX), y, Math.floor(buildingWidth), height);
    }
  }, []);

  return { renderGround, renderBuildings, resetGround };
};
