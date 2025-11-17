import React, { useEffect, useState, useCallback } from 'react';

interface AggressiveFullscreenProps {
  children: React.ReactNode;
  isGameActive: boolean;
}

const AggressiveFullscreen: React.FC<AggressiveFullscreenProps> = ({ 
  children, 
  isGameActive 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth <= 768 || 'ontouchstart' in window;
      setIsMobile(isMobileDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Aggressive header removal
  const removeAllHeaders = useCallback(() => {
    // Remove all possible header elements
    const headerSelectors = [
      '.header',
      '[class*="header"]',
      'nav',
      '[class*="navigation"]',
      '[class*="navbar"]',
      '[class*="top-bar"]',
      '[class*="app-bar"]',
      'header',
      '[role="banner"]',
      '.fixed.top-0',
      '[class*="fixed"][class*="top"]'
    ];

    headerSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        (element as HTMLElement).style.display = 'none';
        (element as HTMLElement).style.visibility = 'hidden';
        (element as HTMLElement).style.height = '0';
        (element as HTMLElement).style.overflow = 'hidden';
      });
    });

    // Remove body padding and margins
    document.body.style.paddingTop = '0';
    document.body.style.marginTop = '0';
    document.body.style.padding = '0';
    document.body.style.margin = '0';

    // Remove html padding and margins
    document.documentElement.style.paddingTop = '0';
    document.documentElement.style.marginTop = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.margin = '0';

    // Hide any fixed positioned elements at the top
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    fixedElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.top < 100) { // If element is near the top
        (element as HTMLElement).style.display = 'none';
      }
    });
  }, []);

  // Restore headers
  const restoreHeaders = useCallback(() => {
    const headerSelectors = [
      '.header',
      '[class*="header"]',
      'nav',
      '[class*="navigation"]',
      '[class*="navbar"]',
      '[class*="top-bar"]',
      '[class*="app-bar"]',
      'header',
      '[role="banner"]',
      '.fixed.top-0',
      '[class*="fixed"][class*="top"]'
    ];

    headerSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        (element as HTMLElement).style.display = '';
        (element as HTMLElement).style.visibility = '';
        (element as HTMLElement).style.height = '';
        (element as HTMLElement).style.overflow = '';
      });
    });

    // Restore body styles
    document.body.style.paddingTop = '';
    document.body.style.marginTop = '';
    document.body.style.padding = '';
    document.body.style.margin = '';

    // Restore html styles
    document.documentElement.style.paddingTop = '';
    document.documentElement.style.marginTop = '';
    document.documentElement.style.padding = '';
    document.documentElement.style.margin = '';
  }, []);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    if (!isMobile) return;

    try {
      // Remove headers first
      removeAllHeaders();

      // Add fullscreen class to body
      document.body.classList.add('aggressive-fullscreen');

      // Try fullscreen API
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }

      setIsFullscreen(true);
    } catch (error) {
      console.log('Fullscreen not supported or denied:', error);
    }
  }, [isMobile, removeAllHeaders]);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      // Restore headers
      restoreHeaders();

      // Remove fullscreen class
      document.body.classList.remove('aggressive-fullscreen');

      // Exit fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }

      setIsFullscreen(false);
    } catch (error) {
      console.log('Error exiting fullscreen:', error);
    }
  }, [restoreHeaders]);

  // Auto-enter fullscreen when game starts
  useEffect(() => {
    if (isMobile && isGameActive && !isFullscreen) {
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isGameActive, isFullscreen, enterFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, exitFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      restoreHeaders();
      document.body.classList.remove('aggressive-fullscreen');
    };
  }, [restoreHeaders]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={`aggressive-fullscreen-container ${isFullscreen ? 'fullscreen-active' : ''}`}>
      {/* Fullscreen toggle button */}
      {!isFullscreen && isGameActive && (
        <button
          className="aggressive-fullscreen-btn"
          onClick={enterFullscreen}
        >
          📱 Fullscreen
        </button>
      )}

      {/* Exit fullscreen button */}
      {isFullscreen && (
        <button
          className="aggressive-fullscreen-btn exit"
          onClick={exitFullscreen}
        >
          ✕ Exit
        </button>
      )}

      {/* Game content */}
      <div className={`game-content ${isFullscreen ? 'fullscreen-content' : ''}`}>
        {children}
      </div>

      {/* Aggressive fullscreen styles */}
      <style>{`
        .aggressive-fullscreen {
          /* Remove all spacing */
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }

        .aggressive-fullscreen * {
          /* Hide any remaining headers */
          padding-top: 0 !important;
          margin-top: 0 !important;
        }

        .aggressive-fullscreen-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
        }

        .aggressive-fullscreen-container.fullscreen-active {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 99999 !important;
          background: #000 !important;
          overflow: hidden !important;
        }

        .game-content {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .game-content.fullscreen-content {
          background: #000;
          overflow: hidden;
          min-height: 100vh;
          min-height: 100dvh;
        }

        .aggressive-fullscreen-btn {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 100000;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .aggressive-fullscreen-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: translateY(-1px);
        }

        .aggressive-fullscreen-btn.exit {
          background: rgba(239, 68, 68, 0.8);
        }

        .aggressive-fullscreen-btn.exit:hover {
          background: rgba(239, 68, 68, 0.9);
        }

        /* Hide fullscreen button when in fullscreen */
        .aggressive-fullscreen-container.fullscreen-active .aggressive-fullscreen-btn:not(.exit) {
          display: none;
        }

        /* Show exit button when in fullscreen */
        .aggressive-fullscreen-container.fullscreen-active .aggressive-fullscreen-btn.exit {
          display: flex;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .aggressive-fullscreen-container {
            margin: 0 !important;
            padding: 0 !important;
          }

          .game-content {
            min-height: 100vh !important;
            min-height: 100dvh !important;
          }

          .aggressive-fullscreen-container.fullscreen-active {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
        }

        /* Landscape orientation optimizations */
        @media (max-width: 768px) and (orientation: landscape) {
          .aggressive-fullscreen-container.fullscreen-active {
            height: 100vh !important;
            height: 100dvh !important;
          }
        }

        /* Prevent text selection during gameplay */
        .aggressive-fullscreen-container.fullscreen-active * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        /* Smooth transitions */
        .aggressive-fullscreen-container {
          transition: all 0.3s ease-in-out;
        }

        .game-content {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AggressiveFullscreen;
