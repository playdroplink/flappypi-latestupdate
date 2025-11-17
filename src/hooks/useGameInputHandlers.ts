import { useEffect, useRef } from 'react';

interface UseGameInputHandlersProps {
  gameState: 'menu' | 'playing' | 'gameOver' | 'paused';
  jump: () => void;
  playWingFlap: () => void;
  flapDelay: number;
}

export const useGameInputHandlers = ({ gameState, jump, playWingFlap, flapDelay }: UseGameInputHandlersProps) => {
  const lastInputTime = useRef(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleInput = (e: Event) => {
      // Only allow input processing if the game is in 'playing' state
      if (gameState !== 'playing') {
        // console.log('Input prevented, not in playing state');
        return;
      }

      // Prevent spam inputs (max 10 inputs per second)
      const now = Date.now();
      const minInputInterval = 100 + (flapDelay * 1000);
      if (now - lastInputTime.current < minInputInterval) {
        console.log('Input spam/delay prevented');
        return;
      }
      lastInputTime.current = now;

      e.preventDefault();
      e.stopPropagation();
      console.log('Input detected, calling jump');
      
      try {
        playWingFlap();
        jump();
      } catch (error) {
        console.warn('Error during input handling:', error);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gameState !== 'playing') return;

      if (e.touches.length > 0) {
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
      handleInput(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== 'playing') return;

      if (touchStartPos.current && e.changedTouches.length > 0) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = Math.abs(endX - touchStartPos.current.x);
        const deltaY = Math.abs(endY - touchStartPos.current.y);
        
        if (deltaX > 20 || deltaY > 20) {
          console.log('Touch movement detected, ignoring as swipe');
          return;
        }
      }
      touchStartPos.current = null;
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        console.log('Keyboard input detected:', e.code);
        handleInput(e);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (gameState !== 'playing') return;

      if (touchStartPos.current) {
        console.log('Click prevented - touch event in progress');
        return;
      }
      handleInput(e);
    };

    const eventOptions = { passive: false, capture: true };
    
    document.addEventListener('click', handleClick, eventOptions);
    document.addEventListener('touchstart', handleTouchStart, eventOptions);
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeydown, eventOptions);
    
    document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    console.log('Enhanced mobile input handlers attached for gameState:', gameState);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
      document.removeEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      });
      console.log('Enhanced input handlers removed');
    };
  }, [jump, gameState, playWingFlap, flapDelay]);
};
