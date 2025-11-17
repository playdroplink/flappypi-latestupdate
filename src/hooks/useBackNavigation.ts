import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to handle browser back button navigation
 * Provides fallback behavior when there's no history
 */
export const useBackNavigation = (fallbackPath: string = '/home') => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Smart back navigation that checks history length
   * If no history, navigates to fallback path
   */
  const navigateBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  /**
   * Handle browser back button events
   */
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Browser back button was pressed
      // This event fires after the navigation has already occurred
      console.log('Browser back button pressed');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  /**
   * Force navigation to a specific path
   * Useful for "Return to Home" buttons
   */
  const forceNavigateTo = (path: string) => {
    navigate(path, { replace: true });
  };

  /**
   * Navigate with fallback support
   * First tries to go back, then falls back to specified path
   */
  const safeBack = (customFallback?: string) => {
    const finalFallback = customFallback || fallbackPath;
    
    // Check if we can go back safely
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(finalFallback);
    }
  };

  return {
    navigateBack,
    forceNavigateTo,
    safeBack,
    canGoBack: window.history.length > 1,
    currentPath: location.pathname
  };
};
