import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, User, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePiAuth } from '@/context/PiAuthContext';
import { useButtonSound } from '@/hooks/useButtonSound';
import { getDisplayUsername } from '@/utils/usernameUtils';

const SignOutPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, piUser } = useAuth();
  const { logout: piLogout, isPiAuthenticated } = usePiAuth();
  const { playClickSound } = useButtonSound();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [username, setUsername] = useState<string>('');

  // Get current username
  useEffect(() => {
    const currentUsername = getDisplayUsername();
    setUsername(currentUsername);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isPiAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isPiAuthenticated, navigate]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      playClickSound();
      
      // Sign out from both contexts
      if (isAuthenticated) {
        await logout();
      }
      if (isPiAuthenticated) {
        await piLogout();
      }
      
      // Clear any stored data
      localStorage.removeItem('flappypi-pi-user');
      localStorage.removeItem('pi_user');
      localStorage.removeItem('flappypi-username');
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still navigate to home even if there's an error
      navigate('/');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleBack = () => {
    playClickSound();
    navigate(-1);
  };

  const handleConfirmSignOut = () => {
    setShowConfirmation(true);
    playClickSound();
  };

  const handleCancelSignOut = () => {
    setShowConfirmation(false);
    playClickSound();
  };

  const whatHappensWhenYouSignOut = [
    "Your game progress will be saved locally",
    "You'll lose access to Pi Network features",
    "Leaderboard rankings will be preserved",
    "You can sign back in anytime to restore access"
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s' }}>
          <div className="w-8 h-8 bg-red-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-32 right-16 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="w-6 h-6 bg-orange-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="w-7 h-7 bg-yellow-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <div className="w-6 h-6 bg-pink-400 rounded-full opacity-60"></div>
        </div>
        
        {/* Animated clouds */}
        <div className="absolute top-0 left-0 w-full h-full animate-clouds pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="100" rx="120" ry="40" fill="#fff" opacity="0.7">
              <animate attributeName="cx" values="200;1600" dur="30s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="800" cy="180" rx="180" ry="60" fill="#fff" opacity="0.5">
              <animate attributeName="cx" values="800;-200" dur="40s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="1200" cy="80" rx="100" ry="30" fill="#fff" opacity="0.6">
              <animate attributeName="cx" values="1200;0" dur="35s" repeatCount="indefinite" />
            </ellipse>
          </svg>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2 z-20"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Main Content */}
        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-2xl border border-blue-200">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-800">
              Sign Out of Flappy Pi
            </CardTitle>
            <p className="text-blue-600 mt-2">
              Are you sure you want to sign out?
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Current User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">{username}</h3>
                  <p className="text-sm text-blue-600">
                    {isPiAuthenticated ? 'Pi Network Account' : 'Guest Account'}
                  </p>
                </div>
              </div>
            </div>

            {/* What happens when you sign out */}
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                What happens when you sign out?
              </h4>
              <ul className="space-y-2">
                {whatHappensWhenYouSignOut.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h4 className="font-semibold text-red-800">Confirm Sign Out</h4>
                </div>
                <p className="text-red-700 text-sm mb-4">
                  You're about to sign out of your account. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isSigningOut ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing Out...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Yes, Sign Out
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelSignOut}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmSignOut}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Stay Signed In
                </Button>
              </div>
            )}

            {/* Security Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800 text-sm">Security Note</span>
              </div>
              <p className="text-green-700 text-xs">
                Your data is secure and will be preserved. You can sign back in anytime to continue your Flappy Pi journey.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-blue-600 text-sm">
            Thank you for playing Flappy Pi! 🎮
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignOutPage;
