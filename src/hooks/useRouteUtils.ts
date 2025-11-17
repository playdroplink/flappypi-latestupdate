import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, PROTECTED_ROUTES, HIDE_MENU_ROUTES, PUBLIC_ROUTES } from '../constants/routes';

export const useRouteUtils = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current route is protected
  const isProtectedRoute = (path: string = location.pathname) => {
    return PROTECTED_ROUTES.includes(path as any);
  };

  // Check if current route should hide menu
  const shouldHideMenu = (path: string = location.pathname) => {
    return HIDE_MENU_ROUTES.includes(path as any);
  };

  // Check if current route is a public standalone page
  const isPublicRoute = (path: string = location.pathname) => {
    return PUBLIC_ROUTES.includes(path as any);
  };

  // Check if current route is a game route
  const isGameRoute = (path: string = location.pathname) => {
    return [ROUTES.PLAY, ROUTES.ENDLESS, ROUTES.CHALLENGE, ROUTES.CLASSIC].includes(path as any);
  };

  // Navigate to a route with optional state
  const navigateTo = (path: string, state?: any) => {
    navigate(path, { state });
  };

  // Navigate back with fallback
  const navigateBack = (fallbackPath: string = ROUTES.HOME) => {
    // More robust check for navigation history
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  // Get route category
  const getRouteCategory = (path: string = location.pathname) => {
    if ([ROUTES.PLAY, ROUTES.ENDLESS, ROUTES.CHALLENGE, ROUTES.CLASSIC].includes(path as any)) {
      return 'game';
    }
    if ([ROUTES.PROFILE, ROUTES.ACCOUNT, ROUTES.WALLET, ROUTES.INVENTORY].includes(path as any)) {
      return 'user';
    }
    if ([ROUTES.COMMUNITY, ROUTES.SOCIAL_CHALLENGE, ROUTES.FIRESIDE_FORUM, ROUTES.LEADERBOARD].includes(path as any)) {
      return 'community';
    }
    if ([ROUTES.SHOP, ROUTES.BLOG, ROUTES.FLAPPY_PI_BLOG].includes(path as any)) {
      return 'content';
    }
    if ([ROUTES.PI_LOGIN, ROUTES.PI_TEST, ROUTES.PI_SDK_TEST].includes(path as any)) {
      return 'pi-network';
    }
    if ([ROUTES.ADMIN, ROUTES.ANALYTICS].includes(path as any)) {
      return 'admin';
    }
    return 'core';
  };

  return {
    location,
    navigate,
    isProtectedRoute,
    shouldHideMenu,
    isPublicRoute,
    isGameRoute,
    navigateTo,
    navigateBack,
    getRouteCategory,
    ROUTES
  };
}; 