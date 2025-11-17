import React from 'react';
import { detectPiBrowser } from '../utils/piBrowserDetection';

interface PiBrowserNoticeProps {
  children?: React.ReactNode;
}

const PiBrowserNotice: React.FC<PiBrowserNoticeProps> = ({ children }) => {
  const browserInfo = detectPiBrowser();
  
  // If running in Pi Browser, render children normally
  if (browserInfo.isPiBrowser || browserInfo.isPiNet || browserInfo.isMainnet) {
    return <>{children}</>;
  }

  // If not in Pi Browser, show professional notice
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Logo/Brand */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flappy Pi</h1>
          <p className="text-gray-600">Pi Network Arcade Game</p>
        </div>

        {/* Pi Browser Notice */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pi Browser Required</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This application is designed specifically for the Pi Network ecosystem and requires the Pi Browser for optimal functionality, security, and user experience.
          </p>
        </div>

        {/* Features List */}
        <div className="mb-8 text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Why Pi Browser?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Secure Pi Authentication</p>
                <p className="text-sm text-gray-600">Direct integration with Pi Network's authentication system</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Pi Payments Integration</p>
                <p className="text-sm text-gray-600">Seamless in-game purchases and transactions</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Enhanced Performance</p>
                <p className="text-sm text-gray-600">Optimized for Pi Browser's rendering engine</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Community Features</p>
                <p className="text-sm text-gray-600">Access to Pi Network's social features and leaderboards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Instructions */}
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Get Pi Browser</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. Download Pi Browser from the official Pi Network app</p>
            <p>2. Open Pi Browser and navigate to this application</p>
            <p>3. Sign in with your Pi Network account</p>
            <p>4. Enjoy the full Flappy Pi experience!</p>
          </div>
        </div>

        {/* Current Environment Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Current Environment:</strong> {browserInfo.isPiBrowser ? 'Pi Browser' : 'Regular Browser'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Pi SDK:</strong> {browserInfo.sdkLoaded ? 'Available' : 'Not Available'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Hostname:</strong> {browserInfo.hostname}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Refresh Page
          </button>
          
          <button
            onClick={() => {
              // Try to open Pi Browser if possible
              const piBrowserUrl = `pinet://${window.location.hostname}${window.location.pathname}`;
              window.location.href = piBrowserUrl;
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Open in Pi Browser
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Flappy Pi is part of the Pi Network ecosystem. For more information, visit{' '}
            <a href="https://minepi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              minepi.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PiBrowserNotice;
