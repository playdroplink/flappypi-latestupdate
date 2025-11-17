import React from 'react';
import { useButtonSound } from '../../hooks/useButtonSound';

interface WithButtonSoundOptions {
  soundType?: 'click' | 'hover' | 'success' | 'error' | 'none';
  enableHoverSound?: boolean;
}

export function withButtonSound<P extends object>(
  Component: React.ComponentType<P>,
  options: WithButtonSoundOptions = {}
) {
  const { soundType = 'click', enableHoverSound = false } = options;

  return React.forwardRef<any, P>((props, ref) => {
    const { playClickSound, playHoverSound, playSuccessSound, playErrorSound } = useButtonSound();

    const handleClick = (e: any) => {
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
      if (props.onClick) {
        props.onClick(e);
      }
    };

    const handleMouseEnter = (e: any) => {
      // Play hover sound if enabled
      if (enableHoverSound) {
        playHoverSound();
      }

      // Call original onMouseEnter handler
      if (props.onMouseEnter) {
        props.onMouseEnter(e);
      }
    };

    return (
      <Component
        {...props}
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      />
    );
  });
}
