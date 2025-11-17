import React from 'react';
import { useEdgeToEdgeFullscreen } from '../../hooks/useEdgeToEdgeFullscreen';

interface AllGameModesFullscreenProps {
  children: React.ReactNode;
  isGameActive: boolean;
  gameMode: 'classic' | 'endless' | 'challenge';
  className?: string;
}

const AllGameModesFullscreen: React.FC<AllGameModesFullscreenProps> = ({ 
  children, 
  isGameActive, 
  gameMode,
  className = '' 
}) => {
  // Apply edge-to-edge fullscreen for all game modes
  useEdgeToEdgeFullscreen({ 
    isGameActive, 
    gameMode, 
    autoApply: true 
  });

  return (
    <div className={`all-game-modes-fullscreen ${gameMode} ${isGameActive ? 'active' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default AllGameModesFullscreen;
