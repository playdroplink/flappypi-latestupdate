import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePiBrowserDetection } from './usePiBrowserDetection';

/**
 * Custom hook for smart navigation that allows all navigation without authentication restrictions
 */
export const useSmartNavigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isPiBrowser } = usePiBrowserDetection();

  /**
   * Smart navigation that allows all navigation without authentication checks
   * @param targetPath - The path to navigate to
   * @param requireAuth - Ignored, all routes are now public
   */
  const smartNavigate = (targetPath: string, requireAuth: boolean = false) => {
    // All routes are now public - navigate directly
    navigate(targetPath);
  };

  /**
   * Navigate to a protected route (now public)
   */
  const navigateToProtected = (path: string) => {
    navigate(path);
  };

  /**
   * Navigate to a public route (no authentication required)
   */
  const navigateToPublic = (path: string) => {
    navigate(path);
  };

  /**
   * Navigate to home (always public)
   */
  const navigateToHome = () => {
    navigate('/home');
  };

  /**
   * Navigate to login page
   */
  const navigateToLogin = () => {
    navigate('/pi-auth');
  };

  return {
    smartNavigate,
    navigateToProtected,
    navigateToPublic,
    navigateToHome,
    navigateToLogin,
    isAuthenticated,
    isPiBrowser
  };
};
