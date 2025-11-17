import React, { useState, useEffect } from 'react';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedFooter from '../components/EnhancedFooter';
import { useGlobalMusic } from '../hooks/useGlobalMusic';


interface PiLoginPageProps {
  onPiLogin: () => Promise<boolean>;
  piUser: any | null;
  onCountdownComplete: () => void;
}

declare global {
  interface Window {
    __piLoginUserGesture?: boolean;
  }
}

const PiLoginPage: React.FC<PiLoginPageProps> = ({ onPiLogin, piUser, onCountdownComplete }) => {
  // Track user gesture for enabling login button
  const [userGesture, setUserGesture] = React.useState(
    typeof window !== 'undefined' ? window.__piLoginUserGesture : false
  );
  const [countdown, setCountdown] = React.useState(3);
  const { isPiBrowser, browserName, osName, platform } = usePiBrowserDetection();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [showDownloadModal, setShowDownloadModal] = useState<null | 'pi' | 'browser'>(null);

  // Device-specific Pi Browser download link
  let piBrowserLink = 'https://ecosystem.pinet.com/';
  let piBrowserLabel = 'Download Pi Browser';
  if (osName === 'iOS' || platform === 'iOS') {
    piBrowserLink = 'https://apps.apple.com/us/app/pi-browser/id1560911608';
    piBrowserLabel = 'Download Pi Browser (App Store)';
  } else if (osName === 'Android' || platform === 'Android') {
    piBrowserLink = 'https://play.google.com/store/apps/details?id=pi.browser&hl=en&pli=1';
    piBrowserLabel = 'Download Pi Browser (Play Store)';
  }

  React.useEffect(() => {
    const updateGesture = () => setUserGesture(true);
    document.addEventListener('touchstart', updateGesture, { once: true });
    document.addEventListener('mousedown', updateGesture, { once: true });
    document.addEventListener('click', updateGesture, { once: true });
    return () => {
      document.removeEventListener('touchstart', updateGesture);
      document.removeEventListener('mousedown', updateGesture);
      document.removeEventListener('click', updateGesture);
    };
  }, []);

  React.useEffect(() => {
    if (piUser) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            onCountdownComplete();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [piUser, onCountdownComplete]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
      {/* Animated clouds layer */}
      <div className="absolute inset-0 pointer-events-none z-0 animate-clouds">
        <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
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
      <BackgroundDecoration />
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl border border-blue-200 rounded-3xl p-8 w-full max-w-md flex flex-col items-center mx-auto">
        {/* Flappy Pi Logo and Branding */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <ImageWithFallback 
              src="/flappy pi gif/flappy-2.gif.gif" 
              alt="Flappy Pi Logo" 
              className="w-20 h-20 mx-auto animate-fly-logo drop-shadow-lg" 
              fallbackSrc="/flappy-logo.png"
            />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Flappy Pi
          </h1>
          <p className="text-blue-600 font-semibold text-lg">Pi Network Arcade Game</p>
          <p className="text-gray-600 text-sm mt-2">The ultimate gaming experience on Pi Network</p>
        </div>

        {!piUser ? (
          <>
            {/* Main Sign In Button */}
            <div className="w-full mb-6">
              <button
                onClick={onPiLogin}
                disabled={!userGesture}
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-3 transform hover:scale-105 ${!userGesture ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
              >
                <ImageWithFallback
                  src="/pi-logo.png"
                  alt="Pi Logo"
                  className="w-6 h-6"
                  lazy={true}
                />
                <span className="text-lg">Sign In with Pi Network</span>
              </button>
              
              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${userGesture ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {userGesture ? 'Ready to sign in' : 'Tap anywhere to enable sign in'}
                </span>
              </div>
            </div>
            {/* Download Options */}
            <div className="w-full space-y-3">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Don't have Pi Network yet?</p>
              </div>
              
              <button
                onClick={() => setShowDownloadModal('pi')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg"
              >
                <img src="/pi-logo.png" alt="Pi Network" className="w-5 h-5" />
                <span>Download Pi Network</span>
              </button>
              
              <button
                onClick={() => window.open(piBrowserLink, '_blank')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" stroke="#4F46E5" strokeWidth="2" />
                </svg>
                <span>{piBrowserLabel}</span>
              </button>
            </div>

            <Dialog open={!!showDownloadModal} onOpenChange={() => setShowDownloadModal(null)}>
              <DialogContent className="max-w-md w-full bg-white/95 rounded-xl p-6 text-center">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-blue-700">
                    {showDownloadModal === 'pi' ? 'Download Pi Network' : 'Download Pi Browser'}
                  </DialogTitle>
                </DialogHeader>
                <p className="mb-4 text-blue-800">{showDownloadModal === 'pi'
                  ? 'Get the official Pi Network app to create your account and start mining Pi!'
                  : 'Get the official Pi Browser to access Pi apps and the Pi ecosystem.'}
                </p>
                <a
                  href={showDownloadModal === 'pi' ? 'https://minepi.com/Wain2020' : piBrowserLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg border-4 border-yellow-600 transition-all duration-200 mb-2"
                >
                  Go to Download
                </a>
                <button
                  onClick={() => setShowDownloadModal(null)}
                  className="mt-2 px-6 py-2 bg-blue-200 hover:bg-blue-300 rounded-full font-bold text-blue-900"
                >
                  Close
                </button>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Welcome back!</h2>
              <p className="text-lg font-semibold text-blue-700">{piUser.username}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-700">
                Redirecting to Flappy Pi in <span className="font-bold text-green-800">{countdown}</span> seconds...
              </p>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>🔒 Secure</span>
              <span>•</span>
              <span>🌐 Pi Network</span>
              <span>•</span>
              <span>🎮 Gaming</span>
            </div>
          </div>
        </div>
      </div>
      <EnhancedFooter
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={false}
        setSoundEnabled={() => {}}
      />
      {/* Flying logo animation keyframes */}
      <style>{`
        @keyframes fly-logo {
          0% { transform: translateY(0); }
          50% { transform: translateY(-24px) scale(1.08); }
          100% { transform: translateY(0); }
        }
        .animate-fly-logo {
          animation: fly-logo 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PiLoginPage; 