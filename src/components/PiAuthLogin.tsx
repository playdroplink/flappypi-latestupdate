import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { detectPiBrowser } from '../utils/piBrowserDetection';
import { ROUTES } from '../constants/routes';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Pi, Download, RefreshCw, AlertCircle, CheckCircle, Globe } from 'lucide-react';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import LicenseModal from './LicenseModal';
import LanguageSelector from './LanguageSelector';

const PiAuthLogin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false); // Start with loading false for manual sign-in
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [autoAuthAttempted, setAutoAuthAttempted] = useState(false);
  const { loginWithPi, isAuthenticated, isPiAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect message from location state
  const redirectMessage = location.state?.message;

  // App version
  const APP_VERSION = 'v3.0.0';

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setAnimateIn(true), 100);
    
    // Remove automatic authentication - require manual sign-in
    // Check browser environment and SDK status only
    if (typeof window !== 'undefined' && window.Pi && typeof window.Pi.authenticate === 'function') {
      const info = detectPiBrowser();
      setBrowserInfo(info);
      setSdkReady(true);
      setIsLoading(false); // Stop loading since we won't auto-authenticate
    }
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated && isPiAuth) {
      const homePath = ROUTES.HOME || '/home';
      
      // Only redirect if not already on home page
      if (window.location.pathname !== homePath) {
        setTimeout(() => {
          navigate(homePath, { replace: true });
        }, 100);
      }
      return;
    }

    // Check browser environment
    const info = detectPiBrowser();
    setBrowserInfo(info);

    // Check if Pi SDK is available
    const checkSDK = () => {
      if (window.Pi && typeof window.Pi.authenticate === 'function') {
        setSdkReady(true);
        setError(null);
        setIsLoading(false); // Stop loading - manual sign-in required
      } else {
        setSdkReady(false);
        setIsLoading(false); // Stop loading even if SDK not ready
        if (info.isPiBrowser) {
          setError('Pi SDK not loaded. Please refresh the page and try again.');
        }
      }
    };

    // Check immediately
    checkSDK();

    // Listen for SDK ready event
    const handleSdkReady = () => {
      setSdkReady(true);
      setError(null);
      setIsLoading(false); // Stop loading - manual sign-in required
    };
    
    window.addEventListener('pi-sdk-ready', handleSdkReady);

    // Set up interval to check SDK availability
    const interval = setInterval(checkSDK, 1000);

    return () => {
      window.removeEventListener('pi-sdk-ready', handleSdkReady);
      clearInterval(interval);
    };
  }, [isAuthenticated, isPiAuth, navigate]);

  const handlePiLogin = async () => {
    // Only allow Pi Browser or mainnet domains for authentication
    const isPiNet = window.location.hostname.includes('.pinet.com');
    if (!browserInfo?.isPiBrowser && !isPiNet) {
      setError('Pi Browser and SDK are required for authentication.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Initialize Pi SDK if needed
      if (!window.Pi) {
        throw new Error('Pi SDK not found. Please ensure you are using Pi Browser.');
      }

      // Try to initialize Pi SDK if not ready
      if (!sdkReady) {
        console.log('🔄 Attempting to initialize Pi SDK...');
        try {
          await window.Pi.init({ version: '2.0' });
          setSdkReady(true);
          console.log('✅ Pi SDK initialized during login');
        } catch (initError) {
          console.warn('⚠️ Pi SDK init failed during login, but continuing...', initError);
        }
      }

      // Authenticate with Pi SDK
      console.log('🔐 Starting Pi authentication...');
      const authResult = await window.Pi.authenticate(['payments', 'username'], (incompletePayment: any) => {
        console.log('💰 Incomplete payment found:', incompletePayment);
      });

      if (authResult && authResult.user) {
        console.log('✅ Pi authentication successful:', authResult.user.username);
        
        // Ensure user has required fields
        const userData = {
          uid: authResult.user.uid || authResult.user.id || 'pi-user-' + Date.now(),
          username: authResult.user.username || authResult.user.name || 'Pi User',
          avatar: authResult.user.avatar || 'flappy-logo.png',
          accessToken: authResult.accessToken,
          isPiAuth: true,
          ...authResult.user
        };
        
        // Pass the user data to loginWithPi
        const loginSuccess = await loginWithPi(userData);
        
        if (loginSuccess) {
          setIsSuccess(true);
          
          // Redirect to intended destination or home after successful login
          setTimeout(() => {
            const redirectPath = localStorage.getItem('flappypi-redirect-after-login');
            if (redirectPath && redirectPath !== '/pi-auth' && redirectPath !== '/') {
              localStorage.removeItem('flappypi-redirect-after-login');
              navigate(redirectPath, { replace: true });
            } else {
              navigate(ROUTES.HOME || '/home', { replace: true });
            }
          }, 1500);
        } else {
          throw new Error('Login process failed. Please try again.');
        }
      } else {
        throw new Error('Authentication failed - no user data received');
      }
    } catch (error) {
      console.error('❌ Pi login error:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to sign in with Pi Network.';
      
      if (error.message?.includes('User denied')) {
        errorMessage = 'Authentication was cancelled. Please try again.';
      } else if (error.message?.includes('SDK not found')) {
        errorMessage = 'Pi SDK not available. Please ensure you are using Pi Browser.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Authentication timed out. Please try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPiBrowser = () => {
    window.open('https://minepi.com/download', '_blank');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 transition-all duration-1000 ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-glow"></div>
      </div>

      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector 
          variant="outline" 
          size="sm"
          className="bg-white/90 backdrop-blur-md shadow-lg"
        />
      </div>

      {/* App Version - Top Left */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-gray-200/50">
          <span className="text-sm font-semibold text-gray-700">
            {APP_VERSION}
          </span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden animate-glow">
          <CardHeader className="text-center pb-6 pt-8 px-8 relative">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/flappy-logo.png" 
                  alt="Flappy Pi Logo" 
                  className="w-20 h-20 object-contain drop-shadow-2xl animate-pulse"
                  onError={(e) => {
                    // Fallback to Pi icon if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const piIcon = document.createElement('div');
                      piIcon.innerHTML = '<svg class="w-20 h-20 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                      parent.appendChild(piIcon);
                    }
                  }}
                />
                {/* Subtle glow effect behind logo */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse -z-10"></div>
              </div>
            </div>
            
            <CardTitle className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
              Welcome to Flappy Pi
            </CardTitle>
            <p className="text-gray-600 mt-3 text-xl font-medium leading-relaxed">
              Sign in with Pi Network to start playing
            </p>
            <div className="mt-4 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            {/* Enhanced Environment Status */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Environment:
                </span>
                <div className="flex items-center gap-2">
                  {browserInfo?.isPiBrowser ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Pi Browser</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">Regular Browser</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  SDK Status:
                </span>
                <div className="flex items-center gap-2">
                  {sdkReady ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">Ready</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
                      <span className="text-sm font-medium text-orange-600">Loading...</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}

                         {/* Pi Browser Required Message */}
             {!browserInfo?.isPiBrowser && (
               <Alert className="border-orange-200 bg-orange-50">
                 <Download className="h-5 w-5" />
                 <AlertDescription className="font-medium">
                   {redirectMessage || 'Pi Browser is required to play Flappy Pi. Please download and install Pi Browser to continue.'}
                 </AlertDescription>
               </Alert>
             )}

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              {browserInfo?.isPiBrowser && sdkReady ? (
                <Button
                  onClick={handlePiLogin}
                  disabled={isLoading || isSuccess}
                  className={`w-full font-bold py-6 text-xl shadow-2xl transform transition-all duration-300 rounded-2xl border-0 ${
                    isSuccess 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:from-blue-600 hover:via-purple-700 hover:to-pink-600 text-white hover:scale-105 hover:shadow-3xl'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle className="w-7 h-7 mr-3" />
                      Welcome to Flappy Pi!
                    </>
                  ) : isLoading ? (
                    <>
                      <RefreshCw className="w-7 h-7 mr-3 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Pi className="w-7 h-7 mr-3" />
                      Sign in with Pi Network
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleDownloadPiBrowser}
                  className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold py-6 text-xl shadow-2xl transform hover:scale-105 hover:shadow-3xl transition-all duration-300 rounded-2xl border-0"
                >
                  <Download className="w-7 h-7 mr-3" />
                  Download Pi Browser
                </Button>
              )}

              {browserInfo?.isPiBrowser && !sdkReady && (
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="w-full py-5 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 rounded-2xl shadow-lg"
                >
                  <RefreshCw className="w-6 h-6 mr-2" />
                  Refresh Page
                </Button>
              )}
            </div>

            {/* Enhanced Additional Info with Terms, Privacy, and License Links */}
            <div className="text-center text-sm text-gray-600 mt-6 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 shadow-sm">
              <p className="mb-3 text-base">
                By signing in, you agree to our{' '}
                <button
                  onClick={() => setShowTerms(true)}
                  className="underline text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 hover:scale-105"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="underline text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 hover:scale-105"
                >
                  Privacy Policy
                </button>
                .
              </p>
              <p className="mb-2 text-sm">
                View our{' '}
                <button
                  onClick={() => setShowLicense(true)}
                  className="underline text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200 hover:scale-105"
                >
                  PiOS License
                </button>{' '}
                for development and usage rights.
              </p>
              <p className="text-gray-500 text-sm font-medium">Flappy Pi requires Pi Browser for the best experience.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms, Privacy, and License Modals */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <LicenseModal isOpen={showLicense} onClose={() => setShowLicense(false)} />
      
      {/* Custom CSS for enhanced animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.8); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default PiAuthLogin;
