import { useCallback } from 'react';
import { useSoundEffects } from './useSoundEffects';

/**
 * Custom hook for playing button click sounds
 * Provides a simple interface for adding click sounds to buttons
 */
export const useButtonClickSound = () => {
  const { playSound, soundEnabled } = useSoundEffects();

  /**
   * Play button click sound
   * @param volume - Volume level (0.0 to 1.0), defaults to 0.4 for button clicks
   */
  const playButtonClick = useCallback((volume = 0.4) => {
    if (soundEnabled) {
      playSound('buttonClick', volume);
    }
  }, [playSound, soundEnabled]);

  /**
   * Enhanced button click handler that plays sound and executes the original onClick
   * @param originalOnClick - The original onClick function to execute
   * @param volume - Volume level for the click sound
   * @returns A new onClick handler that plays sound and executes the original function
   */
  const createClickHandler = useCallback((
    originalOnClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    volume = 0.4
  ) => {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      // Play button click sound
      playButtonClick(volume);
      
      // Execute the original onClick if provided
      if (originalOnClick) {
        originalOnClick(event);
      }
    };
  }, [playButtonClick]);

  return {
    playButtonClick,
    createClickHandler,
    soundEnabled
  };
};
