import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePiAuth } from '../context/PiAuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Shield, User, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import { getNextNpcInRotation } from '../utils/npcRotation';

interface PiAuthGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const PiAuthGuard: React.FC<PiAuthGuardProps> = ({ 
  children, 
  fallbackPath = '/pi-auth' 
}) => {
  const { isAuthenticated, isPiAuth, piUser, loginWithPi, autoSignIn } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // NPC Dialog state
  const [npcDialogIndex, setNpcDialogIndex] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [authNpcGif, setAuthNpcGif] = useState<string>('');
  
  // NPC Dialogs for authentication page
  const npcDialogs = [
    "Hey there! 👋 I'm your Flappy Pi guide! To start your adventure, you'll need to download Pi Browser and sign in with your Pi Network account. Don't worry, it's completely free and takes just a few minutes!",
    "Welcome to the Pi Network! 🌟 Once you're signed in, you'll be able to play Flappy Pi and earn Pi cryptocurrency while having fun!",
    "Did you know? 🎮 Flappy Pi is the first game that lets you earn Pi coins just by playing! It's like mining cryptocurrency while gaming!",
    "Safety first! 🔒 Your Pi Network account is secure and your data is protected. We use the same technology that powers the Pi cryptocurrency network.",
    "Ready to fly? 🚀 Once you're authenticated, you'll have access to all the amazing features of Flappy Pi, including the shop, leaderboards, and more!",
    "Need help? 💡 I'm here to guide you through the process. Just click on me for more tips and information!"
  ];

  // Initialize random NPC GIF
  useEffect(() => {
    if (!authNpcGif) {
      setAuthNpcGif(getNextNpcInRotation('auth'));
    }
  }, [authNpcGif]);

  // Check if accessing via sandbox URL and warn user
  useEffect(() => {
    const isSandboxUrl = typeof window !== 'undefined' && window.location.hostname.includes('sandbox.minepi.com');
    if (isSandboxUrl) {
      console.warn('⚠️ SANDBOX URL DETECTED - Using mainnet authentication');
      console.warn('⚠️ For best experience, use: https://minepi.com/app/flappy-pi-9cdac3f5c9a42c36');
    }
  }, []);

  // Check authentication status on mount with timeout
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Authentication check timeout - proceeding to sign-in');
        setIsCheckingAuth(false);
      }, 5000); // 5 second timeout
      
      try {
        // If already authenticated with Pi, allow access
        if (isAuthenticated && isPiAuth) {
          clearTimeout(timeoutId);
          setIsCheckingAuth(false);
          return;
        }

        // If not authenticated, try auto sign-in
        if (!isAuthenticated && typeof window !== 'undefined' && window.Pi) {
          try {
            const autoSignInResult = await autoSignIn();
            if (autoSignInResult) {
              clearTimeout(timeoutId);
              setIsCheckingAuth(false);
              return;
            }
          } catch (error) {
            console.log('Auto sign-in failed:', error);
          }
        }

        clearTimeout(timeoutId);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Authentication check error:', error);
        clearTimeout(timeoutId);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, isPiAuth, autoSignIn]);

  // Handle manual Pi authentication
  const handlePiSignIn = async () => {
    if (typeof window === 'undefined' || !window.Pi) {
      toast({
        title: "Pi SDK Not Available",
        description: "Please use Pi Browser to sign in with Pi Network.",
        variant: "destructive"
      });
      return;
    }

    setIsSigningIn(true);

    try {
      // Use Pi SDK to authenticate
      const authResult = await window.Pi.authenticate(['payments', 'username'], (payment) => {
        console.log('Incomplete payment found:', payment);
      });

      if (authResult && authResult.user && authResult.accessToken) {
        // Process user data
        const userData = {
          username: authResult.user.username || authResult.user.name || 'Player',
          uid: authResult.user.uid || authResult.user.id,
          avatar: authResult.user.avatar || 'flappy-logo.png',
          accessToken: authResult.accessToken,
          isPiAuth: true,
          ...authResult.user
        };

        // Login with Pi user data
        const loginResult = await loginWithPi(userData);
        
        if (loginResult) {
          toast({
            title: "Signed in successfully! 🎉",
            description: `Welcome, ${userData.username}!`
          });
        } else {
          throw new Error('Login failed');
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('Pi authentication error:', error);
      toast({
        title: "Sign-in Failed",
        description: error.message || "Failed to sign in with Pi Network. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-blue-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 mb-4">Checking authentication...</p>
            <p className="text-sm text-gray-500 text-center">
              If this takes too long, try refreshing the page or signing in manually.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setIsCheckingAuth(false)}
            >
              Skip Authentication Check
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated with Pi, allow access
  if (isAuthenticated && isPiAuth) {
    return <>{children}</>;
  }

  // If not authenticated, show sign-in page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-200 to-blue-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <img 
              src="/flappy pi gif/flappy-2.gif.gif" 
              alt="Flappy Pi" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                console.warn('❌ Flappy Pi GIF failed to load in PiAuthGuard, using fallback');
                e.currentTarget.src = '/flappy-logo.png';
              }}
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pi Authentication Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please sign in with your Pi Network account to access Flappy Pi
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Sandbox URL Warning */}
          {typeof window !== 'undefined' && window.location.hostname.includes('sandbox.minepi.com') && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Sandbox URL Detected</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    You're accessing via sandbox URL but using mainnet authentication. 
                    For the best experience, use: <br />
                    <strong>https://minepi.com/app/flappy-pi-9cdac3f5c9a42c36</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Info Display */}
          {piUser && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">@{piUser.username}</p>
                  <p className="text-sm text-blue-600">Pi Network User</p>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <Button
            onClick={handlePiSignIn}
            disabled={isSigningIn}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign in with Pi Network
              </>
            )}
          </Button>

          {/* Download Pi Browser Button */}
          <Button
            onClick={() => window.open('https://minepi.com/Wain2020', '_blank')}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Shield className="w-5 h-5 mr-2" />
            Download Pi Browser
          </Button>

          {/* Information */}
          <div className="text-center text-sm text-gray-500">
            <p>You need to be signed in with Pi Network to access this page.</p>
            <p className="mt-2">
              <strong>Current location:</strong> {location.pathname}
            </p>
          </div>

          {/* Pi Browser Notice */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Pi Browser Required</p>
                <p className="text-sm text-yellow-700">
                  This app requires Pi Browser for full functionality. 
                  Please use Pi Browser to sign in with your Pi Network account.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive NPC Dialog Footer */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div 
              className="flex items-start space-x-3 cursor-pointer hover:bg-blue-50 rounded-lg p-2 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if it's a double-click to change NPC
                const now = Date.now();
                const lastClick = (e.currentTarget as any).lastClickTime || 0;
                const timeDiff = now - lastClick;
                
                if (timeDiff < 500) { // Double click within 500ms
                  console.log('🎮 Double click detected! Changing Auth NPC...');
                  setAuthNpcGif(getNextNpcInRotation('auth'));
                } else {
                  // Single click - cycle through dialogs
                  console.log('🎮 Auth NPC clicked! Current index:', npcDialogIndex, 'Total dialogs:', npcDialogs.length);
                  setNpcDialogIndex((prev) => (prev + 1) % npcDialogs.length);
                }
                
                (e.currentTarget as any).lastClickTime = now;
              }}
            >
              <div className="flex-shrink-0">
                <img 
                  src={authNpcGif || "/npc/character.png"} 
                  alt="Auth Guide NPC" 
                  className="w-12 h-12 object-contain rounded-full bg-white p-1 hover:scale-105 transition-transform"
                  onError={(e) => {
                    console.warn('❌ Auth NPC GIF failed to load, using fallback');
                    e.currentTarget.src = '/flappy-logo.png';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                  <p className="text-sm text-gray-700 font-medium mb-1">Flappy Pi Guide:</p>
                  <p className="text-sm text-gray-600">
                    "{npcDialogs[npcDialogIndex]}"
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Click to chat! Double-click to change! 💬✨</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy and Terms Footer */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>
              By signing in, you agree to our{' '}
              <button
                onClick={() => setShowTerms(true)}
                className="underline text-blue-600 hover:text-blue-800 font-semibold"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                onClick={() => setShowPrivacy(true)}
                className="underline text-blue-600 hover:text-blue-800 font-semibold"
              >
                Privacy Policy
              </button>
              .
            </p>
            <p className="mt-1">Flappy Pi requires Pi Browser for the best experience.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Privacy and Terms Modals */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default PiAuthGuard;