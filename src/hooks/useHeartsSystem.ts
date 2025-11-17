
import { useCallback, useRef } from 'react';

interface Heart {
  x: number;
  y: number;
  id: number;
  collected: boolean;
  pulsePhase: number;
}

interface UseHeartsSystemProps {
  level: number;
  onHeartCollected: () => void;
}

export const useHeartsSystem = ({ level, onHeartCollected }: UseHeartsSystemProps) => {
  const heartsRef = useRef<Heart[]>([]);
  const heartIdCounter = useRef(0);
  const lastHeartSpawn = useRef(0);
  const lastScoreCheck = useRef(0);

  const spawnHeartOnScore = useCallback((score: number, canvasWidth: number, canvasHeight: number) => {
    // Spawn heart every 10 points starting from level 3
    if (level < 3) return;
    
    const scoreThreshold = Math.floor(score / 10) * 10;
    if (scoreThreshold > lastScoreCheck.current && scoreThreshold > 0) {
      lastScoreCheck.current = scoreThreshold;
      
      const newHeart: Heart = {
        x: canvasWidth + 50,
        y: Math.random() * (canvasHeight * 0.6) + (canvasHeight * 0.2), // Safe zone
        id: heartIdCounter.current++,
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      };
      
      heartsRef.current.push(newHeart);
      console.log('Heart spawned for reaching score:', scoreThreshold);
    }
  }, [level]);

  const spawnHeart = useCallback((canvasWidth: number, canvasHeight: number, frameCount: number) => {
    // Regular heart spawning (less frequent)
    if (level < 5 || frameCount - lastHeartSpawn.current < 800) return;
    
    // Random chance to spawn heart (lower chance for rarity)
    if (Math.random() > 0.999) {
      const newHeart: Heart = {
        x: canvasWidth + 50,
        y: Math.random() * (canvasHeight * 0.6) + (canvasHeight * 0.2), // Safe zone
        id: heartIdCounter.current++,
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2
      };
      
      heartsRef.current.push(newHeart);
      lastHeartSpawn.current = frameCount;
      console.log('Random heart spawned at level', level);
    }
  }, [level]);

  const updateHearts = useCallback((bird: any, maxHearts: number, currentHearts: number) => {
    const HEART_SIZE = 24;
    const BIRD_SIZE = 16;
    
    heartsRef.current = heartsRef.current.filter(heart => {
      if (heart.collected) return false;
      
      // Move heart left
      heart.x -= 2;
      
      // Update pulse phase for animation
      heart.pulsePhase += 0.1;
      
      // Remove if off screen
      if (heart.x < -50) return false;
      
      // Check collision with bird (only if not at max hearts)
      if (currentHearts < maxHearts) {
        const distance = Math.sqrt(
          Math.pow(heart.x - bird.x, 2) + Math.pow(heart.y - bird.y, 2)
        );
        
        if (distance < (HEART_SIZE + BIRD_SIZE) / 2) {
          heart.collected = true;
          onHeartCollected();
          console.log('Heart collected! Hearts:', currentHearts + 1);
          return false;
        }
      }
      
      return true;
    });
  }, [onHeartCollected]);

  const renderHearts = useCallback((ctx: CanvasRenderingContext2D) => {
    heartsRef.current.forEach(heart => {
      if (heart.collected) return;
      
      // Enhanced floating animation with pulsing
      const floatOffset = Math.sin(heart.pulsePhase) * 4;
      const pulseScale = 0.8 + Math.sin(heart.pulsePhase * 2) * 0.2;
      const renderY = heart.y + floatOffset;
      
      ctx.save();
      
      // Apply scale transformation
      ctx.translate(heart.x, renderY);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-heart.x, -renderY);
      
      // Enhanced heart with glow effect
      ctx.fillStyle = '#ff1744';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 15;
      
      // Heart shape (larger and more detailed)
      const size = 14;
      ctx.beginPath();
      ctx.moveTo(heart.x, renderY + size * 0.3);
      ctx.bezierCurveTo(heart.x, renderY - size * 0.2, heart.x - size * 0.8, renderY - size * 0.2, heart.x - size * 0.4, renderY + size * 0.1);
      ctx.bezierCurveTo(heart.x - size * 0.1, renderY - size * 0.1, heart.x + size * 0.1, renderY - size * 0.1, heart.x + size * 0.4, renderY + size * 0.1);
      ctx.bezierCurveTo(heart.x + size * 0.8, renderY - size * 0.2, heart.x, renderY - size * 0.2, heart.x, renderY + size * 0.3);
      ctx.fill();
      ctx.stroke();
      
      // Add sparkle effect
      for (let i = 0; i < 3; i++) {
        const sparkleX = heart.x + (Math.sin(heart.pulsePhase + i * 2) * 20);
        const sparkleY = renderY + (Math.cos(heart.pulsePhase + i * 2) * 20);
        const sparkleAlpha = (Math.sin(heart.pulsePhase * 3 + i) + 1) * 0.3;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
        ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
      }
      
      ctx.restore();
    });
  }, []);

  const resetHearts = useCallback(() => {
    heartsRef.current = [];
    lastHeartSpawn.current = 0;
    lastScoreCheck.current = 0;
    heartIdCounter.current = 0;
  }, []);

  return {
    spawnHeart,
    spawnHeartOnScore,
    updateHearts,
    renderHearts,
    resetHearts
  };
};
