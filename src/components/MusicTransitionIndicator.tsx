import React, { useState, useEffect } from 'react';
import { isMusicTransitioning, getTransitionProgress } from '../utils/musicTransitionManager';

interface MusicTransitionIndicatorProps {
  show?: boolean;
}

const MusicTransitionIndicator: React.FC<MusicTransitionIndicatorProps> = ({ show = true }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;

    const checkTransition = () => {
      const transitioning = isMusicTransitioning();
      setIsTransitioning(transitioning);
      
      if (transitioning) {
        const currentProgress = getTransitionProgress();
        setProgress(currentProgress);
      } else {
        setProgress(0);
      }
    };

    // Check immediately
    checkTransition();

    // Check every 50ms for smooth updates
    const interval = setInterval(checkTransition, 50);

    return () => clearInterval(interval);
  }, [show]);

  if (!show || !isTransitioning) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4">
          <div className="w-full h-full border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <span>🎵 Transitioning...</span>
        <div className="w-16 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-100 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicTransitionIndicator;
