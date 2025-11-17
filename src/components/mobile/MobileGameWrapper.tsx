import React, { useEffect, useState } from 'react';
import { useMobileFullscreen } from '../../hooks/useMobileFullscreen';

interface MobileGameWrapperProps {
  children: React.ReactNode;
  isGameActive: boolean;
  className?: string;
}

const MobileGameWrapper: React.FC<MobileGameWrapperProps> = ({ 
  children, 
  isGameActive, 
  className = '' 
}) => {
  const { isFullscreen, isMobile, enterFullscreen, exitFullscreen } = useMobileFullscreen();
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  // Update fullscreen state
  useEffect(() => {
    setIsFullscreenActive(isFullscreen);
    
    // Add/remove CSS class for styling
    if (isMobile) {
      if (isFullscreen) {
        document.body.classList.add('mobile-fullscreen-active');
      } else {
        document.body.classList.remove('mobile-fullscreen-active');
      }
    }
  }, [isFullscreen, isMobile]);

  // Auto-enter fullscreen when game starts on mobile
  useEffect(() => {
    if (isMobile && isGameActive && !isFullscreen) {
      // Small delay to ensure game is ready
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isGameActive, isFullscreen, enterFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('mobile-fullscreen-active');
    };
  }, []);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`mobile-game-wrapper ${isFullscreenActive ? 'fullscreen-active' : ''} ${className}`}>
      {/* Fullscreen toggle button */}
      {!isFullscreen && isGameActive && (
        <button
          className="mobile-fullscreen-btn"
          onClick={enterFullscreen}
        >
          📱 Fullscreen
        </button>
      )}

      {/* Exit fullscreen button */}
      {isFullscreen && (
        <button
          className="mobile-fullscreen-btn exit"
          onClick={exitFullscreen}
        >
          ✕ Exit
        </button>
      )}

      {/* Game content */}
      <div className={`game-container ${isFullscreenActive ? 'fullscreen-container' : ''}`}>
        {children}
      </div>

      {/* Mobile-specific styles */}
      <style>{`
        .mobile-game-wrapper {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
        }

        .mobile-game-wrapper.fullscreen-active {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          z-index: 9999;
          background: #000;
        }

        .game-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .game-container.fullscreen-container {
          background: #000;
          overflow: hidden;
          min-height: 100vh;
          min-height: 100dvh;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .mobile-game-wrapper {
            margin: 0;
            padding: 0;
          }

          .game-container {
            min-height: 100vh;
            min-height: 100dvh;
          }

          .mobile-game-wrapper.fullscreen-active {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
        }

        /* Landscape orientation optimizations */
        @media (max-width: 768px) and (orientation: landscape) {
          .mobile-game-wrapper.fullscreen-active {
            height: 100vh;
            height: 100dvh;
          }
        }

        /* Prevent text selection during gameplay */
        .mobile-game-wrapper.fullscreen-active * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        /* Smooth transitions */
        .mobile-game-wrapper {
          transition: all 0.3s ease-in-out;
        }

        .game-container {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MobileGameWrapper;
