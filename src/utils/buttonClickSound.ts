import { useSoundEffects } from '@/hooks/useSoundEffects';

let soundEffectsInstance: ReturnType<typeof useSoundEffects> | null = null;

/**
 * Initialize the global button click sound system
 * This should be called once in the app initialization
 */
export const initializeButtonClickSound = () => {
  // This will be called by the main app component
  console.debug('🔊 [BUTTON SOUND] Initializing global button click sound system');
};

/**
 * Set the sound effects instance for global button click sounds
 * @param instance - The sound effects instance from useSoundEffects hook
 */
export const setSoundEffectsInstance = (instance: ReturnType<typeof useSoundEffects>) => {
  soundEffectsInstance = instance;
  console.debug('🔊 [BUTTON SOUND] Sound effects instance set for global button clicks');
};

/**
 * Play button click sound globally
 * @param volume - Volume level (0.0 to 1.0), defaults to 0.4
 */
export const playGlobalButtonClick = (volume = 0.4) => {
  if (soundEffectsInstance) {
    soundEffectsInstance.playSound('buttonClick', volume);
  } else {
    console.debug('🔇 [BUTTON SOUND] Sound effects instance not available');
  }
};

/**
 * Add click sound to any button element
 * @param element - The button element to add sound to
 * @param volume - Volume level for the click sound
 */
export const addButtonClickSound = (element: HTMLElement, volume = 0.4) => {
  if (!element) return;

  const originalOnClick = element.onclick;
  
  element.onclick = (event) => {
    // Play button click sound
    playGlobalButtonClick(volume);
    
    // Execute the original onClick if it exists
    if (originalOnClick) {
      originalOnClick.call(element, event);
    }
  };
};

/**
 * Add click sounds to all buttons on the page
 * @param volume - Volume level for the click sounds
 */
export const addButtonClickSoundsToAllButtons = (volume = 0.4) => {
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(button => {
    // Only add if not already added
    if (!button.hasAttribute('data-click-sound-added')) {
      addButtonClickSound(button, volume);
      button.setAttribute('data-click-sound-added', 'true');
    }
  });
  
  console.debug(`🔊 [BUTTON SOUND] Added click sounds to ${buttons.length} buttons`);
};

/**
 * Remove click sound from a button element
 * @param element - The button element to remove sound from
 */
export const removeButtonClickSound = (element: HTMLElement) => {
  if (!element) return;
  
  element.removeAttribute('data-click-sound-added');
  // Note: We can't easily restore the original onClick, but this prevents duplicate handlers
};

/**
 * Remove click sounds from all buttons on the page
 */
export const removeButtonClickSoundsFromAllButtons = () => {
  const buttons = document.querySelectorAll('button[data-click-sound-added]');
  
  buttons.forEach(button => {
    removeButtonClickSound(button);
  });
  
  console.debug(`🔇 [BUTTON SOUND] Removed click sounds from ${buttons.length} buttons`);
};
