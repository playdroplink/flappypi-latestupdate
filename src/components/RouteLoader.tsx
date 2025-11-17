import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface RouteLoaderProps {
  children: React.ReactNode;
  loadingDuration?: number;
}

const RouteLoader: React.FC<RouteLoaderProps> = ({ 
  children, 
  loadingDuration = 0 // Changed from 500 to 0 to fix navigation issue
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 RouteLoader: Location changed to:', location.pathname);
    // Only show loading for actual route changes, not initial load
    if (location.pathname !== '/') {
      console.log('🔄 RouteLoader: Setting loading state for path:', location.pathname);
      setIsLoading(true);
      const timer = setTimeout(() => {
        console.log('🔄 RouteLoader: Loading complete for path:', location.pathname);
        setIsLoading(false);
      }, loadingDuration);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, loadingDuration]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-blue-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-blue-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteLoader; 