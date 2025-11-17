import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePiAuth } from '../context/PiAuthContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { User, LogIn, Shield, CheckCircle } from 'lucide-react';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';

interface AuthenticationUIProps {
  variant?: 'header' | 'page' | 'modal';
  showUserInfo?: boolean;
  className?: string;
}

const AuthenticationUI: React.FC<AuthenticationUIProps> = ({ 
  variant = 'header', 
  showUserInfo = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, piUser, loginWithPi, logout } = useAuth();
  const { user: piAuthUser, login, isLoading } = usePiAuth();
  const { isPiBrowser } = usePiBrowserDetection();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Enhanced username extraction logic
  const getDisplayUsername = () => {
    const extractUsername = (user: any) => {
      if (!user) return 'Player';
      
      if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
        return user.username.trim();
      }
      
      if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
        return user.name.trim();
      }
      
      if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
        return user.displayName.trim();
      }
      
      return 'Player';
    };

    // Check localStorage first
    const storedUser = localStorage.getItem('flappypi-pi-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const username = extractUsername(parsedUser);
        if (username !== 'Player') {
          return username;
        }
      } catch (error) {
        console.error('Error parsing stored Pi user:', error);
      }
    }
    
    // Check Pi SDK localStorage
    const piSDKUser = localStorage.getItem('pi_user');
    if (piSDKUser) {
      try {
        const parsedPiSDKUser = JSON.parse(piSDKUser);
        const username = extractUsername(parsedPiSDKUser);
        if (username !== 'Player') {
          return username;
        }
      } catch (error) {
        console.error('Error parsing Pi SDK user:', error);
      }
    }
    
    // Fallback to context user
    if (piUser) {
      const username = extractUsername(piUser);
      if (username !== 'Player') {
        return username;
      }
    }
    
    return 'Player';
  };

  const handlePiSignIn = () => {
    navigate('/signin');
  };

  // Sign out functionality removed

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {!isAuthenticated ? (
          <div className="relative group">
            {/* Notification indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full opacity-80"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
              {isPiBrowser 
                ? 'Sign in with your Pi Network account to save progress and earn rewards!' 
                : 'Sign in to save your progress and unlock features!'
              }
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
            </div>
            
            <Button 
              onClick={handlePiSignIn} 
              disabled={isLoading || isSigningIn}
              className={`font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3 hover:scale-102 hover:shadow-xl transform hover:-translate-y-0.5 ${
                isPiBrowser 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-2 border-emerald-400 shadow-emerald-500/30' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-2 border-indigo-400 shadow-indigo-500/30'
              } relative overflow-hidden group`}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {isLoading || isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="relative z-10 font-semibold text-white">Signing in...</span>
                </>
              ) : (
                <>
                  <div className="relative z-10 flex items-center gap-2">
                    <img src="/pi-logo.png" alt="Pi" className="w-5 h-5 drop-shadow-sm" />
                    <span className="font-semibold text-white drop-shadow-sm">
                      {isPiBrowser ? 'Sign in with Pi' : 'Sign in'}
                    </span>
                  </div>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* User Profile Display */}
            {showUserInfo && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 shadow-sm">
                <img src="/pi-logo.png" alt="Pi" className="w-5 h-5" />
                <span className="text-sm font-semibold text-green-800">
                  {getDisplayUsername()}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
            
            {/* Sign out functionality removed */}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardContent className="p-6">
          {!isAuthenticated ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="w-8 h-8 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-800">Sign In Required</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                {isPiBrowser 
                  ? 'Sign in with your Pi Network account to access all features and save your progress.'
                  : 'Sign in to access all features and save your progress.'
                }
              </p>
              
              <Button
                onClick={handlePiSignIn}
                disabled={isLoading || isSigningIn}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                {isLoading || isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <img src="/pi-logo.png" alt="Pi" className="w-5 h-5" />
                    <span>{isPiBrowser ? 'Sign in with Pi Network' : 'Sign in'}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <img src="/pi-logo.png" alt="Pi" className="w-6 h-6" />
                  <div>
                    <p className="font-semibold text-green-800">{getDisplayUsername()}</p>
                    <p className="text-sm text-green-600">Pi Network Authenticated</p>
                  </div>
                </div>
              </div>
              
              {/* Sign out functionality removed */}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={`bg-white rounded-xl shadow-xl p-6 max-w-sm mx-auto ${className}`}>
        {!isAuthenticated ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img 
                src="/flappy pi gif/flappy-2.gif.gif" 
                alt="Flappy Pi" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  console.warn('❌ Flappy Pi GIF failed to load in AuthenticationUI, using fallback');
                  e.currentTarget.src = '/flappy-logo.png';
                }}
              />
              <h3 className="text-lg font-bold text-gray-800">Sign In</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {isPiBrowser 
                ? 'Sign in with your Pi Network account to continue.'
                : 'Sign in to continue.'
              }
            </p>
            
            <Button
              onClick={handlePiSignIn}
              disabled={isLoading || isSigningIn}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading || isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <img src="/pi-logo.png" alt="Pi" className="w-4 h-4" />
                  <span>{isPiBrowser ? 'Sign in with Pi' : 'Sign in'}</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-bold text-gray-800">Signed In</h3>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <img src="/pi-logo.png" alt="Pi" className="w-5 h-5" />
                <span className="font-semibold text-green-800">{getDisplayUsername()}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Authenticated
                </Badge>
              </div>
            </div>
            
            {/* Sign out functionality removed */}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AuthenticationUI;
