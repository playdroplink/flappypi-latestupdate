import React from 'react';
import ClassicMode from './ClassicMode';

interface OptimizedClassicModeProps {
  mode?: 'classic' | 'endless' | 'challenge';
  challenge?: any;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  continueGameRef?: React.RefObject<() => void>;
  onGameOver?: (score: number) => void;
  onCollision?: () => void;
}

/**
 * OptimizedClassicMode is now a simple wrapper around ClassicMode
 * for backward compatibility. ClassicMode itself is already optimized.
 */
export const OptimizedClassicMode: React.FC<OptimizedClassicModeProps> = ({
  mode = 'classic',
  challenge,
  musicEnabled,
  setMusicEnabled,
  soundEnabled,
  setSoundEnabled,
  continueGameRef,
  onGameOver,
  onCollision,
}) => {
  return (
    <ClassicMode
      mode={mode}
      challenge={challenge}
      musicEnabled={musicEnabled}
      setMusicEnabled={setMusicEnabled}
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
      continueGameRef={continueGameRef as any}
      onGameOver={onGameOver}
      onCollision={onCollision}
    />
  );
};

export default OptimizedClassicMode;
