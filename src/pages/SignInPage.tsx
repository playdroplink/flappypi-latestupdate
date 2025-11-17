import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Shield, Zap, Gamepad2, Trophy, Coins } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePiAuth } from '@/context/PiAuthContext';
import { useGlobalMusic } from '@/hooks/useGlobalMusic';
import { useButtonSound } from '@/hooks/useButtonSound';
import { usePiBrowserDetection } from '@/hooks/usePiBrowserDetection';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithPi, isAuthenticated, piUser } = useAuth();
  const { login, isLoading, error } = usePiAuth();
  const { playClickSound } = useButtonSound();
  const { isPiBrowser, isPiSDKAvailable } = usePiBrowserDetection();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && piUser) {
      navigate('/');
    }
  }, [isAuthenticated, piUser, navigate]);

  const handlePiSignIn = async () => {
    try {
      setIsSigningIn(true);
      setSignInError(null);
      playClickSound();
      
      if (isPiBrowser && isPiSDKAvailable) {
        await loginWithPi();
        navigate('/');
      } else {
        setSignInError('Please use Pi Browser to sign in with Pi Network.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setSignInError('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleBack = () => {
    playClickSound();
    navigate(-1);
  };

  const features = [
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: "Play Games",
      description: "Access all Flappy Pi game modes and challenges"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Earn Rewards",
      description: "Win Pi coins and unlock achievements"
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Shop & Trade",
      description: "Buy characters, power-ups, and exclusive items"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data is protected with Pi Network security"
    }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Birds */}
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s' }}>
          <div className="w-8 h-8 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-32 right-16 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="w-6 h-6 bg-purple-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="w-7 h-7 bg-green-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
          <div className="w-6 h-6 bg-yellow-400 rounded-full opacity-60"></div>
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

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10">
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
        <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
          {/* Left Side - Welcome Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-4xl lg:text-6xl font-bold text-blue-800 mb-4">
                Welcome to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Flappy Pi
                </span>
              </h1>
              <p className="text-lg text-blue-700 mb-6">
                The ultimate Pi Network gaming experience
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800">{feature.title}</h3>
                      <p className="text-sm text-blue-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Sign In Card */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border border-blue-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-800">
                  Sign In to Flappy Pi
                </CardTitle>
                <p className="text-blue-600 mt-2">
                  Connect with your Pi Network account
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Pi Network Sign In Button */}
                <Button
                  onClick={handlePiSignIn}
                  disabled={isSigningIn || isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isSigningIn || isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Sign In with Pi Network
                    </div>
                  )}
                </Button>

                {/* Error Display */}
                {(error || signInError) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">
                      {error || signInError}
                    </p>
                  </div>
                )}

                {/* Browser Check */}
                {!isPiBrowser && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-700 text-sm">
                      <strong>Note:</strong> For the best experience, please use Pi Browser to access all features.
                    </p>
                  </div>
                )}

                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-800 text-center">Why Sign In?</h4>
                  <ul className="space-y-2 text-sm text-blue-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Save your progress and achievements
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Access exclusive Pi Network features
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Earn and spend Pi coins
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Compete on leaderboards
                    </li>
                  </ul>
                </div>

                {/* Guest Option */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Don't have a Pi Network account?
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Continue as Guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-600 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
