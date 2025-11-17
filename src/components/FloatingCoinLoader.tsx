import React, { useState, useEffect } from 'react';

interface FloatingCoinLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
}

const FloatingCoinLoader: React.FC<FloatingCoinLoaderProps> = ({ 
  isVisible, 
  onComplete, 
  duration = 2000 
}) => {
  const [showLoader, setShowLoader] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setShowLoader(true);
      setProgress(0);
      
      // Animate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setShowLoader(false);
              onComplete?.();
            }, 300);
            return 100;
          }
          return prev + 2;
        });
      }, duration / 50);

      return () => clearInterval(progressInterval);
    }
  }, [isVisible, duration, onComplete]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating coins */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-yellow-500 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-yellow-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-yellow-600 rounded-full opacity-35 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-yellow-500 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }}></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-yellow-300 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.8s' }}></div>
        <div className="absolute top-2/3 right-1/6 w-4 h-4 bg-yellow-400 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.3s' }}></div>
      </div>

      {/* Main loading content */}
      <div className="flex flex-col items-center justify-center relative z-10">
        {/* Flappy Pi Logo with floating animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl flex items-center justify-center animate-bounce" style={{ animationDuration: '1.5s' }}>
            <img 
              src="/flappycoins.png" 
              alt="Flappy Pi Coin" 
              className="w-16 h-16 animate-pulse"
            />
          </div>
          {/* Wing effect */}
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-8 h-4 bg-white rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-8 h-4 bg-white rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-gray-800 mb-4 drop-shadow-lg animate-pulse" style={{ textShadow: '2px 4px 0 #fbbf24' }}>
          Flappy Pi
        </h1>

        {/* Loading text */}
        <p className="text-xl font-bold text-gray-700 mb-6 animate-pulse">
          Loading...
        </p>

        {/* Progress bar */}
        <div className="w-64 h-3 bg-gray-300 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress percentage */}
        <p className="text-sm font-semibold text-gray-600 mt-2">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Custom styles for enhanced animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        @keyframes coin-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        .animate-coin-spin {
          animation: coin-spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FloatingCoinLoader;
