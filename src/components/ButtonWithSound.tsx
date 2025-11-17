import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useButtonClickSound } from '@/hooks/useButtonClickSound';

interface ButtonWithSoundProps extends ButtonProps {
  soundVolume?: number;
  disableSound?: boolean;
}

/**
 * Button component with automatic click sound
 * Wraps the existing Button component and adds sound effects
 */
const ButtonWithSound: React.FC<ButtonWithSoundProps> = ({
  onClick,
  soundVolume = 0.4,
  disableSound = false,
  children,
  ...props
}) => {
  const { createClickHandler } = useButtonClickSound();

  const handleClick = createClickHandler(onClick, soundVolume);

  return (
    <Button
      {...props}
      onClick={disableSound ? onClick : handleClick}
    >
      {children}
    </Button>
  );
};

export default ButtonWithSound;
