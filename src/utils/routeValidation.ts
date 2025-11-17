import { ROUTES } from '../constants/routes';

// Route validation utility
export const validateRoutes = () => {
  const routePaths = Object.values(ROUTES);
  const issues: string[] = [];

  // Check for duplicate routes
  const duplicates = routePaths.filter((item, index) => routePaths.indexOf(item) !== index);
  if (duplicates.length > 0) {
    issues.push(`Duplicate routes found: ${duplicates.join(', ')}`);
  }

  // Check for routes that start with invalid characters
  const invalidRoutes = routePaths.filter(route => !route.startsWith('/') && route !== '*');
  if (invalidRoutes.length > 0) {
    issues.push(`Invalid routes (must start with /): ${invalidRoutes.join(', ')}`);
  }

  // Check for routes with invalid characters
  const invalidCharRoutes = routePaths.filter(route => /[^a-zA-Z0-9\/\-_:*]/.test(route));
  if (invalidCharRoutes.length > 0) {
    issues.push(`Routes with invalid characters: ${invalidCharRoutes.join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    totalRoutes: routePaths.length
  };
};

// Route testing utility
export const testRouteNavigation = (navigate: any, route: string) => {
  try {
    console.log(`🧪 Testing navigation to: ${route}`);
    navigate(route);
    console.log(`✅ Navigation to ${route} successful`);
    return true;
  } catch (error) {
    console.error(`❌ Navigation to ${route} failed:`, error);
    return false;
  }
};

// Get all available routes
export const getAllRoutes = () => {
  return Object.entries(ROUTES).map(([name, path]) => ({
    name,
    path,
    category: getRouteCategory(path)
  }));
};

// Categorize routes
const getRouteCategory = (path: string) => {
  if (path.startsWith('/challenge/')) return 'challenge';
  if (path.startsWith('/pvp-')) return 'pvp';
  if (path.startsWith('/admin')) return 'admin';
  if (['/profile', '/account', '/wallet', '/inventory'].includes(path)) return 'user';
  if (['/shop', '/blog', '/wiki'].some(prefix => path.startsWith(prefix))) return 'content';
  if (['/privacy', '/terms', '/contact', '/about'].includes(path)) return 'legal';
  return 'core';
};
