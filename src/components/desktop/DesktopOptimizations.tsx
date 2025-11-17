import React, { useEffect, useState } from 'react';

interface DesktopOptimizationsProps {
  children: React.ReactNode;
}

const DesktopOptimizations: React.FC<DesktopOptimizationsProps> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isDesktopDevice = window.innerWidth >= 1024 && !('ontouchstart' in window);
      setIsDesktop(isDesktopDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // Add desktop-specific keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle controls help with F1
      if (e.key === 'F1') {
        e.preventDefault();
        setShowControls(prev => !prev);
      }
      
      // Quick restart with R
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        // This would trigger game restart - implementation depends on game state
        console.log('Quick restart triggered');
      }
      
      // Pause with P
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        // This would trigger pause - implementation depends on game state
        console.log('Pause triggered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop]);

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="desktop-optimized">
      {children}
      
      {/* Desktop Controls Help */}
      {showControls && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-sm">
          <h3 className="font-bold text-lg mb-2">Desktop Controls</h3>
          <div className="space-y-1 text-sm">
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">↑</kbd> - Jump/Flap</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">P</kbd> - Pause/Resume</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> - Quick Restart</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">F1</kbd> - Toggle Controls</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">Esc</kbd> - Back/Menu</div>
          </div>
          <button 
            onClick={() => setShowControls(false)}
            className="mt-3 text-xs text-gray-300 hover:text-white"
          >
            Click anywhere to close
          </button>
        </div>
      )}
      
      {/* Desktop-specific styles */}
      <style>{`
        .desktop-optimized {
          /* Enhanced cursor for desktop */
          cursor: default;
        }
        
        .desktop-optimized:hover {
          /* Subtle hover effects for desktop */
          transition: all 0.2s ease;
        }
        
        /* Desktop-specific animations */
        @media (min-width: 1024px) {
          .desktop-optimized {
            /* Smoother animations for desktop */
            animation-duration: 0.3s;
          }
        }
        
        /* Desktop keyboard shortcuts styling */
        kbd {
          font-family: 'Courier New', monospace;
          font-size: 0.8em;
          display: inline-block;
          margin: 0 2px;
        }
      `}</style>
    </div>
  );
};

export default DesktopOptimizations;
