import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface PiAutoSignInProps {
  onSignInSuccess?: (user: any) => void;
  onSignInError?: (error: any) => void;
  autoAttempt?: boolean;
  delay?: number;
}

const PiAutoSignIn: React.FC<PiAutoSignInProps> = ({ 
  onSignInSuccess, 
  onSignInError, 
  autoAttempt = true,
  delay = 1000 
}) => {
  const { autoSignIn, isAuthenticated, piUser } = useAuth();
  const [isAttempting, setIsAttempting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    if (isAuthenticated || hasAttempted) {
      return;
    }

    const attemptSignIn = async () => {
      try {
        setIsAttempting(true);
        setHasAttempted(true);
        
        console.log('🔄 PiAutoSignIn - Starting auto sign-in...');
        const success = await autoSignIn();
        
        if (success) {
          console.log('✅ PiAutoSignIn - Auto sign-in successful');
          onSignInSuccess?.(piUser);
        } else {
          console.log('❌ PiAutoSignIn - Auto sign-in failed');
          onSignInError?.(new Error('Auto sign-in failed'));
        }
      } catch (error) {
        console.error('❌ PiAutoSignIn - Auto sign-in error:', error);
        onSignInError?.(error);
      } finally {
        setIsAttempting(false);
      }
    };

    const timer = setTimeout(attemptSignIn, delay);
    return () => clearTimeout(timer);
  }, [isAuthenticated, hasAttempted, autoSignIn, onSignInSuccess, onSignInError, piUser, delay]);

  // Manual sign-in function
  const handleManualSignIn = async () => {
    try {
      setIsAttempting(true);
      setHasAttempted(true);
      
      console.log('🔄 PiAutoSignIn - Manual sign-in attempt...');
      const success = await autoSignIn();
      
      if (success) {
        console.log('✅ PiAutoSignIn - Manual sign-in successful');
        onSignInSuccess?.(piUser);
      } else {
        console.log('❌ PiAutoSignIn - Manual sign-in failed');
        onSignInError?.(new Error('Manual sign-in failed'));
      }
    } catch (error) {
      console.error('❌ PiAutoSignIn - Manual sign-in error:', error);
      onSignInError?.(error);
    } finally {
      setIsAttempting(false);
    }
  };

  // Don't render anything by default - this is a utility component
  return null;
};

export default PiAutoSignIn;
