import React, { useEffect, useRef, useState } from 'react';
import ClassicMode from './ClassicMode';

interface FlappyStackModeProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  continueGameRef?: React.MutableRefObject<(() => void) | null>;
  onGameOver?: (score: number, blocksStacked?: number) => void;
  onCollision?: () => void;
}

const FlappyStackMode: React.FC<FlappyStackModeProps> = ({
  musicEnabled,
  setMusicEnabled,
  soundEnabled,
  setSoundEnabled,
  continueGameRef,
  onGameOver,
  onCollision
}) => {
  const [blocksStacked, setBlocksStacked] = useState(0);
  const performanceRef = useRef({
    fps: 60,
    frameTime: 16.67,
    lastUpdate: performance.now()
  });

  // Performance monitoring for Flappy Stack mode
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
          console.warn(`⚠️ Flappy Stack Mode - Low FPS: ${performanceRef.current.fps}`);
        }
      }
    };

    const interval = setInterval(monitorPerformance, 1000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced onGameOver to include blocks stacked
  const handleGameOver = (score: number) => {
    console.log(`🎮 Flappy Stack Game Over - Score: ${score}, Blocks Stacked: ${blocksStacked}`);
    if (onGameOver) {
      onGameOver(score, blocksStacked);
    }
  };

  return (
    <div className="flappy-stack-mode">
      {/* Stack Counter UI */}
      <div className="absolute top-4 left-4 z-50 bg-black/70 text-white px-4 py-2 rounded-lg">
        <div className="text-sm font-bold">🧱 Blocks Stacked</div>
        <div className="text-xl font-bold text-yellow-400">{blocksStacked}</div>
      </div>
      
      <ClassicMode 
        mode="flappy-stack" 
        musicEnabled={musicEnabled} 
        setMusicEnabled={setMusicEnabled} 
        soundEnabled={soundEnabled} 
        setSoundEnabled={setSoundEnabled}
        continueGameRef={continueGameRef}
        onGameOver={handleGameOver}
        onCollision={onCollision}
        // Pass stack-specific props
        customProps={{
          stackMode: true,
          blocksStacked,
          setBlocksStacked
        }}
      />
    </div>
  );
};

export default FlappyStackMode;