import React, { useEffect, useState, useCallback } from 'react';

interface EdgeToEdgeFullscreenProps {
  children: React.ReactNode;
  isGameActive: boolean;
  gameMode?: 'classic' | 'endless' | 'challenge';
}

const EdgeToEdgeFullscreen: React.FC<EdgeToEdgeFullscreenProps> = ({ 
  children, 
  isGameActive, 
  gameMode = 'classic' 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEdgeToEdge, setIsEdgeToEdge] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth <= 768 || 'ontouchstart' in window;
      setIsMobile(isMobileDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Apply edge-to-edge fullscreen
  const applyEdgeToEdgeFullscreen = useCallback(() => {
    if (!isMobile) return;

    // Remove ALL possible spacing and margins
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.paddingTop = '0';
    document.body.style.marginTop = '0';
    document.body.style.paddingBottom = '0';
    document.body.style.marginBottom = '0';
    document.body.style.paddingLeft = '0';
    document.body.style.marginLeft = '0';
    document.body.style.paddingRight = '0';
    document.body.style.marginRight = '0';

    // Remove HTML spacing
    document.documentElement.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.paddingTop = '0';
    document.documentElement.style.marginTop = '0';

    // Hide ALL header elements
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
      '[class*="fixed"][class*="top"]',
      '[class*="sticky"][class*="top"]',
      '.navbar',
      '.navigation',
      '.topbar',
      '.appbar'
    ];

    headerSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        (element as HTMLElement).style.display = 'none';
        (element as HTMLElement).style.visibility = 'hidden';
        (element as HTMLElement).style.height = '0';
        (element as HTMLElement).style.overflow = 'hidden';
        (element as HTMLElement).style.position = 'absolute';
        (element as HTMLElement).style.top = '-9999px';
        (element as HTMLElement).style.left = '-9999px';
      });
    });

    // Hide any fixed positioned elements
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    fixedElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.top < 200) { // Hide elements near the top
        (element as HTMLElement).style.display = 'none';
      }
    });

    // Add edge-to-edge class
    document.body.classList.add('edge-to-edge-fullscreen');
    document.documentElement.classList.add('edge-to-edge-fullscreen');

    // Set viewport for fullscreen
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    // Hide browser UI
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.log('Fullscreen not supported');
      });
    }

    setIsEdgeToEdge(true);
  }, [isMobile]);

  // Restore normal layout
  const restoreNormalLayout = useCallback(() => {
    // Restore body styles
    document.body.style.padding = '';
    document.body.style.margin = '';
    document.body.style.paddingTop = '';
    document.body.style.marginTop = '';
    document.body.style.paddingBottom = '';
    document.body.style.marginBottom = '';
    document.body.style.paddingLeft = '';
    document.body.style.marginLeft = '';
    document.body.style.paddingRight = '';
    document.body.style.marginRight = '';

    // Restore HTML styles
    document.documentElement.style.padding = '';
    document.documentElement.style.margin = '';
    document.documentElement.style.paddingTop = '';
    document.documentElement.style.marginTop = '';

    // Show header elements
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
      '[class*="fixed"][class*="top"]',
      '[class*="sticky"][class*="top"]',
      '.navbar',
      '.navigation',
      '.topbar',
      '.appbar'
    ];

    headerSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        (element as HTMLElement).style.display = '';
        (element as HTMLElement).style.visibility = '';
        (element as HTMLElement).style.height = '';
        (element as HTMLElement).style.overflow = '';
        (element as HTMLElement).style.position = '';
        (element as HTMLElement).style.top = '';
        (element as HTMLElement).style.left = '';
      });
    });

    // Remove edge-to-edge class
    document.body.classList.remove('edge-to-edge-fullscreen');
    document.documentElement.classList.remove('edge-to-edge-fullscreen');

    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {
        console.log('Exit fullscreen not supported');
      });
    }

    setIsEdgeToEdge(false);
  }, []);

  // Auto-apply edge-to-edge when game starts
  useEffect(() => {
    if (isMobile && isGameActive && !isEdgeToEdge) {
      const timer = setTimeout(() => {
        applyEdgeToEdgeFullscreen();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (!isGameActive && isEdgeToEdge) {
      restoreNormalLayout();
    }
  }, [isMobile, isGameActive, isEdgeToEdge, applyEdgeToEdgeFullscreen, restoreNormalLayout]);

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
      if (e.key === 'Escape' && isEdgeToEdge) {
        restoreNormalLayout();
      }
    };

    if (isEdgeToEdge) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEdgeToEdge, restoreNormalLayout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      restoreNormalLayout();
    };
  }, [restoreNormalLayout]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={`edge-to-edge-container ${isEdgeToEdge ? 'edge-to-edge-active' : ''} ${gameMode}`}>
      {/* Game content */}
      <div className={`game-content ${isEdgeToEdge ? 'edge-to-edge-content' : ''}`}>
        {children}
      </div>

      {/* Edge-to-edge styles */}
      <style>{`
        .edge-to-edge-fullscreen {
          /* Remove all spacing */
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }

        .edge-to-edge-fullscreen * {
          /* Remove any inherited spacing */
          padding-top: 0 !important;
          margin-top: 0 !important;
        }

        .edge-to-edge-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
        }

        .edge-to-edge-container.edge-to-edge-active {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 99999 !important;
          background: #000 !important;
          overflow: hidden !important;
          /* Remove any borders or outlines */
          border: none !important;
          outline: none !important;
        }

        .game-content {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .game-content.edge-to-edge-content {
          background: #000;
          overflow: hidden;
          min-height: 100vh;
          min-height: 100dvh;
          /* Remove any borders or outlines */
          border: none !important;
          outline: none !important;
        }

        /* Game mode specific styles */
        .edge-to-edge-container.classic .game-content.edge-to-edge-content {
          background: linear-gradient(to bottom, #aeefff, #fffbe0);
        }

        .edge-to-edge-container.endless .game-content.edge-to-edge-content {
          background: linear-gradient(to bottom, #667eea, #764ba2);
        }

        .edge-to-edge-container.challenge .game-content.edge-to-edge-content {
          background: linear-gradient(to bottom, #ff512f, #dd2476);
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .edge-to-edge-container {
            margin: 0 !important;
            padding: 0 !important;
          }

          .game-content {
            min-height: 100vh !important;
            min-height: 100dvh !important;
          }

          .edge-to-edge-container.edge-to-edge-active {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            /* Remove any browser chrome */
            border: none !important;
            outline: none !important;
          }
        }

        /* Landscape orientation optimizations */
        @media (max-width: 768px) and (orientation: landscape) {
          .edge-to-edge-container.edge-to-edge-active {
            height: 100vh !important;
            height: 100dvh !important;
          }
        }

        /* Portrait orientation optimizations */
        @media (max-width: 768px) and (orientation: portrait) {
          .edge-to-edge-container.edge-to-edge-active {
            height: 100vh !important;
            height: 100dvh !important;
          }
        }

        /* Prevent text selection during gameplay */
        .edge-to-edge-container.edge-to-edge-active * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        /* Smooth transitions */
        .edge-to-edge-container {
          transition: all 0.3s ease-in-out;
        }

        .game-content {
          transition: all 0.3s ease-in-out;
        }

        /* Hardware acceleration */
        .edge-to-edge-container.edge-to-edge-active {
          transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .edge-to-edge-container.edge-to-edge-active * {
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
};

export default EdgeToEdgeFullscreen;
