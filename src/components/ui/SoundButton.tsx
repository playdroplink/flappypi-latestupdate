import React, { forwardRef } from 'react';
import { useButtonSound } from '../../hooks/useButtonSound';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  soundType?: 'click' | 'hover' | 'success' | 'error' | 'none';
  enableHoverSound?: boolean;
  children: React.ReactNode;
}

export const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ soundType = 'click', enableHoverSound = false, onClick, onMouseEnter, children, ...props }, ref) => {
    const { playClickSound, playHoverSound, playSuccessSound, playErrorSound } = useButtonSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play appropriate sound based on type
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
        case 'none':
          // No sound
          break;
        default:
          playClickSound();
      }

      // Call original onClick handler
      if (onClick) {
        onClick(e);
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play hover sound if enabled
      if (enableHoverSound) {
        playHoverSound();
      }

      // Call original onMouseEnter handler
      if (onMouseEnter) {
        onMouseEnter(e);
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SoundButton.displayName = 'SoundButton';
