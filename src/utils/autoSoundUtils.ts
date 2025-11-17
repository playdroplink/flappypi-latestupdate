import React from 'react';

// Utility to automatically add sound to all buttons on the page
export const addSoundToAllButtons = () => {
  const { playButtonSound } = require('../context/SoundContext').useSound();
  
  // Find all buttons on the page
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(button => {
    // Skip if already has sound handler
    if (button.hasAttribute('data-sound-added')) return;
    
    // Add sound to click events
    const originalClick = button.onclick;
    button.onclick = (e) => {
      playButtonSound('click');
      if (originalClick) {
        originalClick.call(button, e);
      }
    };
    
    // Add sound to hover events
    const originalMouseEnter = button.onmouseenter;
    button.onmouseenter = (e) => {
      playButtonSound('hover');
      if (originalMouseEnter) {
        originalMouseEnter.call(button, e);
      }
    };
    
    // Mark as processed
    button.setAttribute('data-sound-added', 'true');
  });
};

// Utility to add sound to specific elements
export const addSoundToElement = (element: HTMLElement, soundType: 'click' | 'success' | 'error' | 'hover' = 'click') => {
  const { playButtonSound } = require('../context/SoundContext').useSound();
  
  if (element.hasAttribute('data-sound-added')) return;
  
  const originalClick = element.onclick;
  element.onclick = (e) => {
    playButtonSound(soundType);
    if (originalClick) {
      originalClick.call(element, e);
    }
  };
  
  element.setAttribute('data-sound-added', 'true');
};

// React hook to automatically add sound to buttons
export const useAutoSound = () => {
  const { playButtonSound } = require('../context/SoundContext').useSound();
  
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        playButtonSound('click');
      }
    };
    
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        playButtonSound('hover');
      }
    };
    
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
    };
  }, [playButtonSound]);
};
