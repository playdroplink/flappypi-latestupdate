import { useButtonSound } from '../hooks/useButtonSound';

// Utility function to create sound-enabled event handlers
export const createSoundHandler = (
  originalHandler: (() => void) | undefined,
  soundType: 'click' | 'success' | 'error' = 'click'
) => {
  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();

  return () => {
    // Play appropriate sound
    switch (soundType) {
      case 'click':
        playClickSound();
        break;
      case 'success':
        playSuccessSound();
        break;
      case 'error':
        playErrorSound();
        break;
    }

    // Call original handler
    if (originalHandler) {
      originalHandler();
    }
  };
};

// Higher-order function to wrap any function with sound
export const withSound = (
  fn: (...args: any[]) => void,
  soundType: 'click' | 'success' | 'error' = 'click'
) => {
  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();

  return (...args: any[]) => {
    // Play appropriate sound
    switch (soundType) {
      case 'click':
        playClickSound();
        break;
      case 'success':
        playSuccessSound();
        break;
      case 'error':
        playErrorSound();
        break;
    }

    // Call original function
    return fn(...args);
  };
};

// React event handler wrapper
export const createSoundEventHandler = (
  originalHandler: ((e: React.MouseEvent) => void) | undefined,
  soundType: 'click' | 'success' | 'error' = 'click'
) => {
  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();

  return (e: React.MouseEvent) => {
    // Play appropriate sound
    switch (soundType) {
      case 'click':
        playClickSound();
        break;
      case 'success':
        playSuccessSound();
        break;
      case 'error':
        playErrorSound();
        break;
    }

    // Call original handler
    if (originalHandler) {
      originalHandler(e);
    }
  };
};
