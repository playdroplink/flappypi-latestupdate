
import { useCallback, useRef } from 'react';

interface Heart {
  x: number;
  y: number;
  id: number;
  collected: boolean;
  pulsePhase: number;
  spawnTime: number;
}

interface UseHeartSystemProps {
  level: number;
  onHeartCollected: () => void;
}

export const useHeartSystem = ({ level, onHeartCollected }: UseHeartSystemProps) => {
  const heartsRef = useRef<Heart[]>([]);
  const heartIdCounter = useRef(0);
  const lastLevelSpawn = useRef<number[]>([]);

  const shouldSpawnHeart = useCallback((currentLevel: number) => {
    // Spawn hearts at levels 5, 10, and 15 only
    const heartLevels = [5, 10, 15];
    return heartLevels.includes(currentLevel) && !lastLevelSpawn.current.includes(currentLevel);
  }, []);

  const spawnHeartForLevel = useCallback((currentLevel: number, canvasWidth: number, canvasHeight: number) => {
    if (!shouldSpawnHeart(currentLevel)) return;

    console.log(`Spawning heart for level ${currentLevel}!`);
    lastLevelSpawn.current.push(currentLevel);

    const newHeart: Heart = {
      x: canvasWidth + 100,
      y: Math.random() * (canvasHeight * 0.5) + (canvasHeight * 0.25), // Middle zone
      id: heartIdCounter.current++,
      collected: false,
      pulsePhase: 0,
      spawnTime: Date.now()
    };

    heartsRef.current.push(newHeart);
  }, [shouldSpawnHeart]);

  const updateHearts = useCallback((bird: any, gameStarted: boolean) => {
    if (!gameStarted) return;

    const HEART_SIZE = 20;
    const BIRD_SIZE = 16;
    
    heartsRef.current = heartsRef.current.filter(heart => {
      if (heart.collected) return false;

      // Move heart left
      heart.x -= 2;
      heart.pulsePhase += 0.08;

      // Remove if off screen
      if (heart.x < -50) return false;

      // Check collision with bird
      const distance = Math.sqrt(
        Math.pow(heart.x - bird.x, 2) + Math.pow(heart.y - bird.y, 2)
      );

      if (distance < (HEART_SIZE + BIRD_SIZE) / 2) {
        heart.collected = true;
        onHeartCollected();
        console.log('❤️ Heart collected!');
        return false;
      }

      return true;
    });
  }, [onHeartCollected]);

  const renderHearts = useCallback((ctx: CanvasRenderingContext2D) => {
    heartsRef.current.forEach(heart => {
      if (heart.collected) return;

      const floatOffset = Math.sin(heart.pulsePhase) * 6;
      const pulseScale = 0.9 + Math.sin(heart.pulsePhase * 2) * 0.3;
      const renderY = heart.y + floatOffset;

      ctx.save();
      ctx.translate(heart.x, renderY);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-heart.x, -renderY);

      // Enhanced heart with magical glow
      ctx.fillStyle = '#ff1744';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 20;

      // Draw heart shape
      const size = 12;
      ctx.beginPath();
      ctx.moveTo(heart.x, renderY + size * 0.3);
      ctx.bezierCurveTo(heart.x, renderY - size * 0.2, heart.x - size * 0.8, renderY - size * 0.2, heart.x - size * 0.4, renderY + size * 0.1);
      ctx.bezierCurveTo(heart.x - size * 0.1, renderY - size * 0.1, heart.x + size * 0.1, renderY - size * 0.1, heart.x + size * 0.4, renderY + size * 0.1);
      ctx.bezierCurveTo(heart.x + size * 0.8, renderY - size * 0.2, heart.x, renderY - size * 0.2, heart.x, renderY + size * 0.3);
      ctx.fill();
      ctx.stroke();

      // Add sparkle effects
      for (let i = 0; i < 4; i++) {
        const sparkleX = heart.x + (Math.sin(heart.pulsePhase + i * 1.5) * 25);
        const sparkleY = renderY + (Math.cos(heart.pulsePhase + i * 1.5) * 25);
        const sparkleAlpha = (Math.sin(heart.pulsePhase * 4 + i) + 1) * 0.4;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }, []);

  const resetHearts = useCallback(() => {
    console.log('Resetting heart system');
    heartsRef.current = [];
    lastLevelSpawn.current = [];
    heartIdCounter.current = 0;
  }, []);

  return {
    spawnHeartForLevel,
    updateHearts,
    renderHearts,
    resetHearts,
    getActiveHearts: () => heartsRef.current.length
  };
};
