import React, { useEffect, useState, useCallback } from 'react';

interface DesktopGameWrapperProps {
  children: React.ReactNode;
  gameState: string;
  onPause?: () => void;
  onRestart?: () => void;
  onResume?: () => void;
}

const DesktopGameWrapper: React.FC<DesktopGameWrapperProps> = ({ 
  children, 
  gameState, 
  onPause, 
  onRestart, 
  onResume 
}) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [showDesktopUI, setShowDesktopUI] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isDesktopDevice = window.innerWidth >= 1024 && !('ontouchstart' in window);
      setIsDesktop(isDesktopDevice);
      setShowDesktopUI(isDesktopDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Desktop-specific keyboard handlers
  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game controls
      if (['Space', 'ArrowUp', 'KeyW', 'KeyP', 'KeyR', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          // Jump/Flap - handled by game
          break;
          
        case 'KeyP':
          if (gameState === 'playing') {
            onPause?.();
          } else if (gameState === 'paused') {
            onResume?.();
          }
          break;
          
        case 'KeyR':
          onRestart?.();
          break;
          
        case 'Escape':
          // Back to menu or close modals
          if (gameState === 'paused') {
            onResume?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, gameState, onPause, onRestart, onResume]);

  // Desktop-specific performance optimizations
  useEffect(() => {
    if (!isDesktop) return;

    // Enable hardware acceleration for desktop
    const enableHardwareAcceleration = () => {
      const style = document.createElement('style');
      style.textContent = `
        .desktop-game-container {
          transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .desktop-game-container * {
          transform: translateZ(0);
        }
      `;
      document.head.appendChild(style);
    };

    enableHardwareAcceleration();
  }, [isDesktop]);

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="desktop-game-container">
      {children}
      
      {/* Desktop-specific UI elements */}
      {showDesktopUI && (
        <>
          {/* Desktop status bar */}
          <div className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-sm text-white text-xs p-2 z-40">
            <div className="flex justify-between items-center max-w-6xl mx-auto">
              <div className="flex items-center space-x-4">
                <span>Desktop Mode</span>
                <span>•</span>
                <span>Press F1 for controls</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>FPS: 60</span>
                <span>•</span>
                <span>Hardware Accelerated</span>
              </div>
            </div>
          </div>
          
          {/* Desktop game controls overlay */}
          <div className="fixed bottom-4 right-4 z-30">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onPause}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs"
                >
                  Pause (P)
                </button>
                <button 
                  onClick={onRestart}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs"
                >
                  Restart (R)
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Desktop-specific styles */}
      <style>{`
        .desktop-game-container {
          /* Desktop-specific optimizations */
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }
        
        /* Enhanced desktop animations */
        @media (min-width: 1024px) {
          .desktop-game-container {
            /* Smoother transitions for desktop */
            transition: all 0.1s ease-out;
          }
          
          /* Desktop-specific hover effects */
          .desktop-game-container button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
        }
        
        /* Desktop performance optimizations */
        @media (min-width: 1024px) and (min-resolution: 2dppx) {
          .desktop-game-container {
            /* High DPI optimizations */
            image-rendering: -webkit-optimize-contrast;
          }
        }
      `}</style>
    </div>
  );
};

export default DesktopGameWrapper;
