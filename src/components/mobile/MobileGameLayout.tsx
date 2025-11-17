import React, { useEffect, useState } from 'react';
import { useMobileFullscreen } from '../../hooks/useMobileFullscreen';

interface MobileGameLayoutProps {
  children: React.ReactNode;
  isGameActive: boolean;
}

const MobileGameLayout: React.FC<MobileGameLayoutProps> = ({ 
  children, 
  isGameActive 
}) => {
  const { isFullscreen, isMobile, enterFullscreen, exitFullscreen } = useMobileFullscreen();
  const [headerHidden, setHeaderHidden] = useState(false);

  // Hide header when in fullscreen or game is active on mobile
  useEffect(() => {
    if (isMobile && (isFullscreen || isGameActive)) {
      setHeaderHidden(true);
      
      // Hide header elements
      const header = document.querySelector('.header, [class*="header"], nav, [class*="navigation"]');
      if (header) {
        (header as HTMLElement).style.display = 'none';
      }

      // Hide any fixed headers
      const fixedHeaders = document.querySelectorAll('[class*="fixed"][class*="top"]');
      fixedHeaders.forEach(element => {
        if (element.textContent?.includes('Flappy Pi') || element.className.includes('header')) {
          (element as HTMLElement).style.display = 'none';
        }
      });

      // Remove body padding that might be added by header
      document.body.style.paddingTop = '0';
      document.body.style.marginTop = '0';
    } else {
      setHeaderHidden(false);
      
      // Show header elements
      const header = document.querySelector('.header, [class*="header"], nav, [class*="navigation"]');
      if (header) {
        (header as HTMLElement).style.display = '';
      }

      // Restore body padding
      document.body.style.paddingTop = '';
      document.body.style.marginTop = '';
    }
  }, [isMobile, isFullscreen, isGameActive]);

  // Auto-enter fullscreen when game starts on mobile
  useEffect(() => {
    if (isMobile && isGameActive && !isFullscreen) {
      // Small delay to ensure game is ready
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, isGameActive, isFullscreen, enterFullscreen]);

  // Mobile-specific optimizations
  useEffect(() => {
    if (!isMobile || !isGameActive) return;

    // Prevent zoom and scrolling
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    // Prevent context menu
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
    };

    // Apply mobile optimizations
    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchend', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('contextmenu', preventContextMenu);

    // Set viewport for fullscreen
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchend', preventDefault);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [isMobile, isGameActive]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={`mobile-game-layout ${isFullscreen ? 'fullscreen-mode' : ''} ${headerHidden ? 'header-hidden' : ''}`}>
      {/* Fullscreen toggle button */}
      {!isFullscreen && isGameActive && (
        <button
          onClick={enterFullscreen}
          className="fixed top-4 right-4 z-50 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2"
        >
          📱 Fullscreen
        </button>
      )}

      {/* Exit fullscreen button */}
      {isFullscreen && (
        <button
          onClick={exitFullscreen}
          className="fixed top-4 right-4 z-50 bg-red-500/80 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold"
        >
          ✕ Exit
        </button>
      )}

      {/* Game content */}
      <div className={`game-container ${isFullscreen ? 'fullscreen-container' : ''}`}>
        {children}
      </div>

      {/* Mobile-specific styles */}
      <style>{`
        .mobile-game-layout {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
        }

        .mobile-game-layout.fullscreen-mode {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          z-index: 9999;
          background: #000;
        }

        .mobile-game-layout.header-hidden {
          /* Remove any top spacing when header is hidden */
          padding-top: 0 !important;
          margin-top: 0 !important;
        }

        .game-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .game-container.fullscreen-container {
          /* Fullscreen optimizations */
          background: #000;
          overflow: hidden;
          /* Ensure game takes full screen */
          min-height: 100vh;
          min-height: 100dvh;
        }

        /* Hide header elements in fullscreen */
        .mobile-game-layout.fullscreen-mode .header,
        .mobile-game-layout.fullscreen-mode [class*="header"],
        .mobile-game-layout.fullscreen-mode nav,
        .mobile-game-layout.fullscreen-mode [class*="navigation"] {
          display: none !important;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .mobile-game-layout {
            /* Remove any padding/margins */
            margin: 0;
            padding: 0;
          }

          .game-container {
            /* Ensure game takes full screen */
            min-height: 100vh;
            min-height: 100dvh;
          }

          /* Hide browser UI elements */
          .mobile-game-layout.fullscreen-mode {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
        }

        /* Landscape orientation optimizations */
        @media (max-width: 768px) and (orientation: landscape) {
          .mobile-game-layout.fullscreen-mode {
            height: 100vh;
            height: 100dvh;
          }
        }

        /* Prevent text selection during gameplay */
        .mobile-game-layout.fullscreen-mode * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        /* Smooth transitions */
        .mobile-game-layout {
          transition: all 0.3s ease-in-out;
        }

        .game-container {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MobileGameLayout;
