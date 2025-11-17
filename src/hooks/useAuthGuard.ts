
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

// Authentication guard hook to protect sensitive routes
export const useAuthGuard = (redirectTo: string = '/') => {
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !profile) {
      navigate(redirectTo);
    }
  }, [profile, loading, navigate, redirectTo]);

  return { isAuthenticated: !!profile, loading };
};
