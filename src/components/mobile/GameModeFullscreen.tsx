import React from 'react';
import { useEdgeToEdgeFullscreen } from '../../hooks/useEdgeToEdgeFullscreen';

interface GameModeFullscreenProps {
  children: React.ReactNode;
  isGameActive: boolean;
  gameMode: 'classic' | 'endless' | 'challenge';
}

const GameModeFullscreen: React.FC<GameModeFullscreenProps> = ({ 
  children, 
  isGameActive, 
  gameMode 
}) => {
  // Apply edge-to-edge fullscreen
  useEdgeToEdgeFullscreen({ 
    isGameActive, 
    gameMode, 
    autoApply: true 
  });

  return (
    <div className={`game-mode-fullscreen ${gameMode} ${isGameActive ? 'active' : ''}`}>
      {children}
    </div>
  );
};

export default GameModeFullscreen;
