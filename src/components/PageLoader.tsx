import React, { useState, useEffect } from 'react';

const PageLoader = () => {
  const [loadingText, setLoadingText] = useState('Loading...');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPopIn, setShowPopIn] = useState(true);

  useEffect(() => {
    // Cycle through loading messages
    const messages = [
      'Loading Flappy Pi...',
      'Preparing your adventure...',
      'Loading game assets...',
      'Almost ready...',
      'Flapping into action...'
    ];
    
    let messageIndex = 0;
    const interval = setInterval(() => {
      setLoadingText(messages[messageIndex]);
      messageIndex = (messageIndex + 1) % messages.length;
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Pop-in effect lasts 0.5s
    const timer = setTimeout(() => setShowPopIn(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle image load error
  const handleImageError = () => {
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400">
      {/* Flappy Pi background text */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
        <span
          className="text-[7vw] sm:text-[5vw] md:text-[4vw] font-extrabold text-yellow-100 opacity-60 drop-shadow-lg tracking-widest"
          style={{
            textShadow: '0 4px 32px #facc15, 0 1px 0 #fff',
            userSelect: 'none',
            zIndex: 1,
          }}
        >
          Flappy Pi
        </span>
      </div>
      <div className="flex flex-col items-center space-y-4 relative z-10">
        {/* Fallback coin if image fails to load */}
        {!imageLoaded && (
          <div className={`w-40 h-40 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl ring-8 ring-yellow-200 animate-bounce ${showPopIn ? 'animate-pop-in' : 'animate-flip-pop'}`}>
            <span className="text-6xl font-bold text-yellow-800 glow">π</span>
          </div>
        )}
        {/* Actual coin image */}
        <img
          src="/flappycoins.png"
          alt="Loading..."
          style={{
            width: '10rem',
            height: '10rem',
            animation: `${showPopIn ? 'flappy-pop-in 0.5s cubic-bezier(0.5,1.8,0.5,1) both' : 'flappy-bounce 1s infinite, flappy-flip-pop 1.2s cubic-bezier(0.4,0.8,0.6,1) infinite'}`,
            filter: 'drop-shadow(0 0 32px #fde047) drop-shadow(0 0 8px #facc15)',
            display: imageLoaded ? 'block' : 'none',
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="text-center">
          <p className="text-lg font-semibold text-yellow-800 mb-2 drop-shadow">{loadingText}</p>
          <div className="w-48 h-2 bg-yellow-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full transition-all duration-300"
              style={{
                width: '60%',
                animation: 'loading-progress 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes flappy-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-32px); }
        }
        @keyframes flappy-flip-pop {
          0% {
            transform: rotateY(0deg) scale(1) rotate(-5deg);
          }
          20% {
            transform: rotateY(72deg) scale(1.08) rotate(0deg);
          }
          40% {
            transform: rotateY(144deg) scale(1.12) rotate(5deg);
          }
          60% {
            transform: rotateY(216deg) scale(1.08) rotate(0deg);
          }
          80% {
            transform: rotateY(288deg) scale(1.04) rotate(-5deg);
          }
          100% {
            transform: rotateY(360deg) scale(1) rotate(-5deg);
          }
        }
        .animate-flip-pop {
          animation: flappy-flip-pop 1.2s cubic-bezier(0.4,0.8,0.6,1) infinite;
        }
        @keyframes loading-progress {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 20%; }
        }
        .glow {
          text-shadow: 0 0 16px #fde047, 0 0 8px #facc15, 0 1px 0 #fff;
        }
        img[alt="Loading..."] {
          will-change: transform;
        }
        @keyframes flappy-pop-in {
          0% {
            opacity: 0;
            transform: scale(0.2);
          }
          60% {
            opacity: 1;
            transform: scale(1.15);
          }
          80% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pop-in {
          animation: flappy-pop-in 0.5s cubic-bezier(0.5,1.8,0.5,1) both;
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
export { PageLoader }; 