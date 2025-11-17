import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading Flappy Pi...", 
  timeout = 10000,
  onTimeout 
}) => {
  const [dots, setDots] = useState('');
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Animate loading dots
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Set timeout for loading
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      if (onTimeout) onTimeout();
    }, timeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [timeout, onTimeout]);

  if (timeoutReached) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Loading is taking longer than expected
          </h1>
          <p className="text-gray-600 mb-6">
            The app is still initializing. This might be due to network issues or Pi Browser compatibility.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Reload App
            </button>
            
            <button
              onClick={() => window.location.href = '/home'}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 font-medium"
            >
              Go to Home
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p className="mb-2">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure you're using Pi Browser mobile app</li>
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Clear browser cache and cookies</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🎮</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Flappy Pi
          </h1>
        </div>

        {/* Loading Message */}
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            {message}
            <span className="inline-block w-4 text-left">{dots}</span>
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Initializing app...</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Loading Pi Network SDK...</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>Preparing game assets...</span>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> For the best experience, use Pi Browser mobile app
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 