import React, { forwardRef } from 'react';
import { useSound } from '../../context/SoundContext';

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  soundType?: 'click' | 'success' | 'error' | 'hover' | 'none';
  enableHoverSound?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AudioButton = forwardRef<HTMLButtonElement, AudioButtonProps>(
  ({ soundType = 'click', enableHoverSound = false, onClick, onMouseEnter, children, className = '', ...props }, ref) => {
    const { playButtonSound } = useSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play appropriate sound based on type
      if (soundType !== 'none') {
        playButtonSound(soundType);
      }

      // Call original onClick handler
      if (onClick) {
        onClick(e);
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play hover sound if enabled
      if (enableHoverSound) {
        playButtonSound('hover');
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
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AudioButton.displayName = 'AudioButton';
