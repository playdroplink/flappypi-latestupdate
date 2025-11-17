
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useLifeSystem = () => {
  const [currentLives, setCurrentLives] = useState(0);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [showHeartUsedMessage, setShowHeartUsedMessage] = useState(false);
  const maxLives = 3;
  const flashTimerRef = useRef<number>(0);
  const messageTimerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const addLife = useCallback(() => {
    if (currentLives < maxLives) {
      setCurrentLives(prev => prev + 1);
      toast({
        title: "❤️ Life Gained!",
        description: `You now have ${Math.min(currentLives + 1, maxLives)} lives`,
        duration: 2000
      });
    }
  }, [currentLives, maxLives, toast]);

  const useLife = useCallback((onRespawn?: () => void) => {
    if (currentLives > 0 && !isInvulnerable) {
      setCurrentLives(prev => prev - 1);
      setIsInvulnerable(true);
      setShowHeartUsedMessage(true);
      flashTimerRef.current = 30; // Red flash duration

      // Show "Heart Used!" message for 5 seconds
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
      
      messageTimerRef.current = setTimeout(() => {
        setShowHeartUsedMessage(false);
      }, 5000);

      // Respawn player in center if callback provided
      if (onRespawn) {
        onRespawn();
      }

      toast({
        title: "❤️ Heart Used! You're saved!",
        description: `${currentLives - 1} lives remaining`,
        duration: 3000
      });

      // Set invulnerability for 2 seconds
      setTimeout(() => {
        setIsInvulnerable(false);
      }, 2000);

      return true; // Life was used
    }
    return false; // No lives left or invulnerable
  }, [currentLives, isInvulnerable, toast]);

  const resetLives = useCallback(() => {
    setCurrentLives(0);
    setIsInvulnerable(false);
    setShowHeartUsedMessage(false);
    flashTimerRef.current = 0;
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
  }, []);

  const updateFlashTimer = useCallback(() => {
    if (flashTimerRef.current > 0) {
      flashTimerRef.current--;
    }
  }, []);

  const renderLivesUI = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Render heart icons in top-left corner
    for (let i = 0; i < maxLives; i++) {
      const x = 20 + i * 35;
      const y = 25;
      const size = 10;
      
      ctx.save();
      
      if (i < currentLives) {
        ctx.fillStyle = '#ff1744';
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = isInvulnerable ? 10 : 5;
      } else {
        ctx.fillStyle = '#444444';
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
      
      ctx.restore();
    }

    // Show "Heart Used!" message
    if (showHeartUsedMessage) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText("❤️ Heart Used!", canvas.width / 2, canvas.height / 2 - 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText("You're saved!", canvas.width / 2, canvas.height / 2 + 15);
      ctx.restore();
    }
  }, [currentLives, maxLives, isInvulnerable, showHeartUsedMessage]);

  return {
    currentLives,
    maxLives,
    isInvulnerable,
    flashTimer: flashTimerRef.current,
    addLife,
    useLife,
    resetLives,
    updateFlashTimer,
    renderLivesUI
  };
};
