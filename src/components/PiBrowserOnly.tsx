import React, { useState, useEffect } from 'react';
import { detectPiBrowser } from '../utils/piBrowserDetection';
import { shouldRequirePiBrowser, validatePiBrowser, logAuth } from '../config/authConfig';

interface PiBrowserOnlyProps {
  children: React.ReactNode;
}

const PiBrowserOnly: React.FC<PiBrowserOnlyProps> = ({ children }) => {
  const [isPiBrowser, setIsPiBrowser] = useState<boolean | null>(null);
  const [browserInfo, setBrowserInfo] = useState<any>(null);

  useEffect(() => {
    const checkBrowser = () => {
      const info = detectPiBrowser();
      setBrowserInfo(info);
      
      // Use configuration to determine if Pi Browser is required
      const isValidBrowser = validatePiBrowser(info);
      setIsPiBrowser(isValidBrowser);
      
      logAuth('Browser check completed', {
        info,
        isValidBrowser,
        requirePiBrowser: shouldRequirePiBrowser()
      });
    };

    checkBrowser();
    
    // Re-check on window focus (in case user switched to Pi Browser)
    const handleFocus = () => {
      setTimeout(checkBrowser, 1000);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Show loading while checking
  if (isPiBrowser === null) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 via-blue-100 via-purple-50 to-indigo-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Checking Browser Environment...</h2>
          <p className="text-gray-600">Please wait while we verify your browser.</p>
        </div>
      </div>
    );
  }

  // If Pi Browser is required but not detected, show restriction page
  if (shouldRequirePiBrowser() && !isPiBrowser) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-200 via-blue-100 via-purple-50 to-indigo-200 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto text-center px-6">
          {/* Flappy Pi Logo */}
          <div className="mb-8">
            <img 
              src="/public/img/flappy-logo.png" 
              alt="Flappy Pi" 
              className="w-24 h-24 mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Flappy Pi</h1>
            <p className="text-gray-600">The Official Pi Network Game</p>
          </div>

          {/* Pi Browser Required Message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-6">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pi Browser Required</h2>
              <p className="text-gray-600 mb-4">
                Flappy Pi is designed exclusively for the Pi Network ecosystem. 
                Please use the official Pi Browser to access this game.
              </p>
            </div>

            {/* Browser Detection Info */}
            {browserInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Current Environment:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Browser: {browserInfo.userAgent.substring(0, 50)}...</div>
                  <div>Domain: {browserInfo.hostname}</div>
                  <div>Pi SDK: {browserInfo.sdkLoaded ? 'Available' : 'Not Available'}</div>
                  <div>Environment: {browserInfo.isPiNet ? 'PiNet' : 'Regular Browser'}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => window.open('https://minepi.com/Wain2020', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Download Pi Browser</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Refresh Page</span>
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="font-semibold text-gray-800 mb-3">Why Pi Browser?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Access to Pi cryptocurrency payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Earn Pi coins while playing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Pi Network authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Exclusive Pi Network features</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Flappy Pi - Official Pi Network Game
          </p>
        </div>
      </div>
    );
  }

  // If in Pi Browser, render children
  return <>{children}</>;
};

export default PiBrowserOnly;
