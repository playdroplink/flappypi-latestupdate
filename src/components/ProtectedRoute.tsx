import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/pi-browser-login' 
}) => {
  const { isAuthenticated } = useAuth();
  
  // ENABLED: Authentication is now required - redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute; 