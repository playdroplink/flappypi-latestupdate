import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { detectPiBrowser } from '../utils/piBrowserDetection';
import { ROUTES } from '../constants/routes';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, User, Shield, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LanguageSelector from '../components/LanguageSelector';

const PiBrowserLoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const [autoAuthAttempted, setAutoAuthAttempted] = useState(false);
  const [authStep, setAuthStep] = useState<'checking' | 'authenticating' | 'success' | 'error'>('checking');
  const [userInfo, setUserInfo] = useState<any>(null);
  const { loginWithPi, isAuthenticated, isPiAuth } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated && isPiAuth) {
      const from = location.state?.from?.pathname || ROUTES.HOME;
      navigate(from, { replace: true });
      return;
    }

    // Check browser environment
    const info = detectPiBrowser();
    setBrowserInfo(info);

    // Disabled automatic authentication - require manual sign-in
    // if (info.isPiBrowser && typeof window.Pi !== 'undefined' && !autoAuthAttempted) {
    //   console.log('🔍 Pi Browser detected, attempting auto-authentication...');
    //   setAutoAuthAttempted(true);
    //   handlePiLogin();
    // }
  }, [isAuthenticated, isPiAuth, navigate, location, autoAuthAttempted]);

  const handlePiLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthStep('authenticating');

      console.log('🔐 Starting Pi authentication...');

      // Check if Pi SDK is available
      if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
        throw new Error('Pi SDK not available. Please use Pi Browser.');
      }

      // Show authentication progress
      toast({
        title: "🔐 Pi Authentication",
        description: "Starting Pi Network authentication...",
      });

      // First, authenticate the user with proper scopes for payments and username
      console.log('🔐 Authenticating user for Pi login...');
      const authResult = await window.Pi.authenticate(['payments', 'username'], (incompletePayment) => {
        console.log('💰 Incomplete payment found during authentication:', incompletePayment);
        toast({
          title: "💰 Incomplete Payment",
          description: "Found incomplete payment. Please complete it first.",
          variant: "destructive"
        });
      });

      if (!authResult || !authResult.user) {
        throw new Error('Pi authentication failed');
      }

      console.log('✅ User authenticated for Pi login:', authResult.user.username);

      // Process user data with enhanced extraction
      const extractUsername = (user: any) => {
        if (!user) return 'Pi User';
        
        // Check for username first (most common in Pi Network)
        if (user.username && user.username !== 'Player' && user.username.trim() !== '') {
          return user.username.trim();
        }
        
        // Check for name field
        if (user.name && user.name !== 'Player' && user.name.trim() !== '') {
          return user.name.trim();
        }
        
        // Check for displayName
        if (user.displayName && user.displayName !== 'Player' && user.displayName.trim() !== '') {
          return user.displayName.trim();
        }
        
        // Check for first_name + last_name combination
        if (user.first_name || user.last_name) {
          const firstName = user.first_name || '';
          const lastName = user.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();
          if (fullName && fullName !== 'Player') {
            return fullName;
          }
        }
        
        return 'Pi User';
      };

      const extractedUsername = extractUsername(authResult.user);
      
      const userData = {
        username: extractedUsername,
        uid: authResult.user.uid || authResult.user.id,
        avatar: authResult.user.avatar || 'flappy-logo.png',
        accessToken: authResult.accessToken,
        isPiAuth: true,
        ...authResult.user
      };

      console.log('✅ Processed user data:', userData);

      // Set user info for display
      setUserInfo(userData);
      setAuthStep('success');

      // Show success message
      toast({
        title: "✅ Authentication Successful!",
        description: `Welcome, ${extractedUsername}! Redirecting to home...`,
      });

      // Login with Pi user data
      await loginWithPi(userData);
      
      // Small delay to show success state
      setTimeout(() => {
        // Navigate to the intended destination
        const from = location.state?.from?.pathname || '/home';
        navigate(from, { replace: true });
      }, 1500);

    } catch (err: any) {
      console.error('❌ Pi authentication failed:', err);
      setError(err.message || 'Authentication failed. Please try again.');
      setAuthStep('error');
      
      toast({
        title: "❌ Authentication Failed",
        description: err.message || 'Authentication failed. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPiBrowser = () => {
    window.open('https://minepi.com/Wain2020', '_blank');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // If already authenticated, redirect
  if (isAuthenticated && isPiAuth) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-200 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Clouds */}
        <div className="absolute top-20 left-10 w-24 h-16 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-12 bg-white/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-10 bg-white/25 rounded-full animate-pulse delay-2000"></div>
        
        {/* Flappy Pi Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-9xl font-bold text-blue-600">FP</div>
        </div>
      </div>

      {/* Top Header with Language Selector and Sign In/Out Button */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {/* Language Selector */}
        <div className="relative group">
          <div className={`bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-200`}>
            <LanguageSelector 
              variant="ghost" 
              size="sm" 
              className="min-w-[100px] text-sm font-medium"
            />
          </div>
        </div>
        
        {/* Sign In/Out Button */}
        {!isAuthenticated ? (
          <div className="relative group">
            {/* Subtle notification indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full opacity-80"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
              {browserInfo?.isPiBrowser 
                ? 'Sign in with your Pi Network account to save progress and earn rewards!' 
                : 'Sign in to save your progress and unlock features!'
              }
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
            </div>
            
            <Button 
              onClick={handlePiLogin} 
              disabled={isLoading || !browserInfo?.isPiBrowser}
              className={`font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3 hover:scale-102 hover:shadow-xl transform hover:-translate-y-0.5 ${
                browserInfo?.isPiBrowser 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-2 border-emerald-400 shadow-emerald-500/30' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-2 border-indigo-400 shadow-indigo-500/30'
              } relative overflow-hidden group`}
            >
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="relative z-10 font-semibold text-white">Signing in...</span>
                </>
              ) : (
                <>
                  <div className="relative z-10 flex items-center gap-2">
                    <img src="/pi-logo.png" alt="Pi" className="w-5 h-5 drop-shadow-sm" />
                    <span className="font-semibold text-white drop-shadow-sm">
                      {browserInfo?.isPiBrowser ? 'Sign in with Pi' : 'Sign in'}
                    </span>
                  </div>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* User is authenticated - show user info and sign out button */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-green-700">
                <img src="/pi-logo.png" alt="Pi" className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {userInfo?.username || 'Pi User'}
                </span>
              </div>
            </div>
            
            {/* Sign Out Button */}
            <Button
              onClick={() => {
                // Clear authentication state
                localStorage.removeItem('flappypi-username');
                localStorage.removeItem('flappypi-pi-auth');
                localStorage.removeItem('flappypi-pi-user');
                // Reload page to reset state
                window.location.reload();
              }}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
          {/* Flappy Pi Logo */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">FP</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('flappyPi')}</h1>
            <p className="text-sm text-gray-600">{t('piNetworkGaming')}</p>
          </div>

          {/* Authentication Status */}
          <div className="mb-6">
            {authStep === 'checking' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Checking Pi Environment</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Verifying Pi Browser and SDK availability...
                </p>
              </div>
            )}

            {authStep === 'authenticating' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Authenticating with Pi</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Please complete the Pi Network authentication...
                </p>
              </div>
            )}

            {authStep === 'success' && userInfo && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Welcome, {userInfo.username}!</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Authentication successful! Redirecting to home...
                </p>
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
                    <User className="w-4 h-4" />
                    <span>Pi Network User: {userInfo.username}</span>
                  </div>
                </div>
              </div>
            )}

            {authStep === 'error' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {error || 'Please try again or check your Pi Browser setup.'}
                </p>
              </div>
            )}

            {authStep === 'checking' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{t('piBrowserLogin')}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('piBrowserLoginDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Browser Environment Info */}
          {browserInfo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{t('environmentStatus')}</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('piBrowser')}:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${browserInfo.isPiBrowser ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${browserInfo.isPiBrowser ? 'text-green-600' : 'text-red-600'}`}>
                      {browserInfo.isPiBrowser ? t('detected') : t('notDetected')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('piNet')}:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${browserInfo.isPiNet ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${browserInfo.isPiNet ? 'text-green-600' : 'text-red-600'}`}>
                      {browserInfo.isPiNet ? t('detected') : t('notDetected')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('piSDK')}:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${browserInfo.sdkLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${browserInfo.sdkLoaded ? 'text-green-600' : 'text-red-600'}`}>
                      {browserInfo.sdkLoaded ? t('available') : t('notAvailable')}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('secure')}:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${browserInfo.isSecure ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${browserInfo.isSecure ? 'text-green-600' : 'text-red-600'}`}>
                      {browserInfo.isSecure ? t('yes') : t('no')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Login Options */}
          <div className="space-y-3">
            {browserInfo?.isPiBrowser || browserInfo?.isPiNet ? (
              <button
                onClick={handlePiLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('authenticating')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>{t('signInWithPi')}</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={handleDownloadPiBrowser}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>{t('downloadPiBrowser')}</span>
                </button>
                <button
                  onClick={handleRefresh}
                  className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{t('refreshAfterInstalling')}</span>
                </button>
              </>
            )}
          </div>

          {/* Benefits List */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">{t('whyPiBrowser')}</h3>
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">{t('securePiNetworkAuth')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-gray-700">{t('piCryptocurrencyPayments')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <span className="text-gray-700">{t('rewardedAdsForInGameRewards')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-gray-700">{t('enhancedMobileGamingExperience')}</span>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">{t('flappyPiRequiresPiBrowserAuth')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 text-gray-500 text-xs">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span>Pi Network</span>
          <span>•</span>
          <span>Flappy Pi</span>
        </div>
      </div>
    </div>
  );
};

export default PiBrowserLoginPage;
