import { useEffect, useCallback } from 'react';

interface UseEdgeToEdgeFullscreenOptions {
  isGameActive: boolean;
  gameMode?: 'classic' | 'endless' | 'challenge';
  autoApply?: boolean;
}

export const useEdgeToEdgeFullscreen = ({ 
  isGameActive, 
  gameMode = 'classic',
  autoApply = true 
}: UseEdgeToEdgeFullscreenOptions) => {
  
  // Apply edge-to-edge fullscreen
  const applyEdgeToEdgeFullscreen = useCallback(() => {
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
  }, []);

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
  }, []);

  // Auto-apply when game is active
  useEffect(() => {
    if (autoApply && isGameActive) {
      const timer = setTimeout(() => {
        applyEdgeToEdgeFullscreen();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (!isGameActive) {
      restoreNormalLayout();
    }
  }, [autoApply, isGameActive, applyEdgeToEdgeFullscreen, restoreNormalLayout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      restoreNormalLayout();
    };
  }, [restoreNormalLayout]);

  return {
    applyEdgeToEdgeFullscreen,
    restoreNormalLayout
  };
};
