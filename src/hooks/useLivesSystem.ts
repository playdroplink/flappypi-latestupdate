
import { useState, useCallback, useRef } from 'react';

export const useLivesSystem = () => {
  const [currentLives, setCurrentLives] = useState(0);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [lastBumpTime, setLastBumpTime] = useState(0);
  const maxLives = 3;
  const bumpEffectRef = useRef<boolean>(false);

  const addLife = useCallback(() => {
    setCurrentLives(prev => Math.min(prev + 1, maxLives));
  }, [maxLives]);

  const useLife = useCallback(() => {
    if (currentLives > 0 && !isInvulnerable) {
      setCurrentLives(prev => prev - 1);
      setLastBumpTime(Date.now());
      bumpEffectRef.current = true;
      
      // Brief invulnerability period
      setIsInvulnerable(true);
      setTimeout(() => {
        setIsInvulnerable(false);
        bumpEffectRef.current = false;
      }, 1500); // Longer invulnerability for better gameplay
      
      return true; // Life was used
    }
    return false; // No lives left or invulnerable
  }, [currentLives, isInvulnerable]);

  const resetLives = useCallback(() => {
    setCurrentLives(0);
    setIsInvulnerable(false);
    setLastBumpTime(0);
    bumpEffectRef.current = false;
  }, []);

  const triggerBumpEffect = useCallback(() => {
    return bumpEffectRef.current;
  }, []);

  const renderLivesUI = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Render heart icons in top-left corner with better styling
    for (let i = 0; i < maxLives; i++) {
      const x = 20 + i * 40;
      const y = 30;
      const size = 12;
      
      ctx.save();
      
      // Determine heart color and add glow effect for active hearts
      if (i < currentLives) {
        ctx.fillStyle = '#ff1744'; // Active heart
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = isInvulnerable ? 15 : 5; // Pulse during invulnerability
      } else {
        ctx.fillStyle = '#333333'; // Empty heart
        ctx.strokeStyle = '#666666';
        ctx.shadowBlur = 0;
      }
      
      ctx.lineWidth = 2;
      
      // Draw heart shape
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      ctx.bezierCurveTo(x, y - size * 0.2, x - size * 0.8, y - size * 0.2, x - size * 0.4, y + size * 0.1);
      ctx.bezierCurveTo(x - size * 0.1, y - size * 0.1, x + size * 0.1, y - size * 0.1, x + size * 0.4, y + size * 0.1);
      ctx.bezierCurveTo(x + size * 0.8, y - size * 0.2, x, y - size * 0.2, x, y + size * 0.3);
      ctx.fill();
      ctx.stroke();
      
      // Add pulsing effect during invulnerability
      if (isInvulnerable && i < currentLives) {
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 1;
        ctx.globalAlpha = pulse;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      ctx.restore();
    }
    
    // Show invulnerability indicator
    if (isInvulnerable) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('PROTECTED', 20, 60);
      ctx.restore();
    }
  }, [currentLives, maxLives, isInvulnerable]);

  return {
    currentLives,
    maxLives,
    isInvulnerable,
    lastBumpTime,
    addLife,
    useLife,
    resetLives,
    renderLivesUI,
    triggerBumpEffect
  };
};
