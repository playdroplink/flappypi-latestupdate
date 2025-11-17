import React, { useEffect, useRef } from 'react';
import ClassicMode from './ClassicMode';

const EndlessMode: React.FC<{ 
  mode: string;
  musicEnabled: boolean, 
  setMusicEnabled: (enabled: boolean) => void, 
  soundEnabled: boolean, 
  setSoundEnabled: (enabled: boolean) => void;
  continueGameRef?: React.MutableRefObject<(() => void) | null>;
  onGameOver?: (score: number) => void;
  onCollision?: () => void;
}> = ({ mode, musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled, continueGameRef, onGameOver, onCollision }) => {
  const performanceRef = useRef({
    fps: 60,
    frameTime: 16.67,
    lastUpdate: performance.now()
  });

  // Performance monitoring for endless mode
  useEffect(() => {
    const monitorPerformance = () => {
      const now = performance.now();
      const deltaTime = now - performanceRef.current.lastUpdate;
      performanceRef.current.lastUpdate = now;
      
      if (deltaTime > 0) {
        performanceRef.current.fps = Math.round(1000 / deltaTime);
        performanceRef.current.frameTime = deltaTime;
        
        // Log performance warnings
        if (performanceRef.current.fps < 45) {
          console.warn(`⚠️ Endless Mode - Low FPS: ${performanceRef.current.fps}`);
        }
      }
    };

    const interval = setInterval(monitorPerformance, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ClassicMode 
        mode="endless" 
        musicEnabled={musicEnabled} 
        setMusicEnabled={setMusicEnabled} 
        soundEnabled={soundEnabled} 
        setSoundEnabled={setSoundEnabled}
        continueGameRef={continueGameRef}
        onGameOver={onGameOver}
        onCollision={onCollision}
      />
    </>
  );
};

export default EndlessMode; 