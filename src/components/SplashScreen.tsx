import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useLanguage } from '../context/LanguageContext';
import { detectPiBrowser } from '../utils/piBrowserDetection';
import { ROUTES } from '../constants/routes';

// Cloud animation data (copied from BackgroundDecoration)
const clouds = [
  { style: { top: '10%', left: '5%', animationDuration: '18s', width: 90 }, delay: '0s' },
  { style: { top: '25%', left: '60%', animationDuration: '22s', width: 120 }, delay: '2s' },
  { style: { top: '50%', left: '20%', animationDuration: '26s', width: 70 }, delay: '4s' },
  { style: { top: '70%', left: '75%', animationDuration: '20s', width: 100 }, delay: '1s' },
  { style: { top: '80%', left: '40%', animationDuration: '24s', width: 110 }, delay: '3s' },
];

const CloudSVG = ({ width = 100 }) => (
  <svg width={width} height={width * 0.5} viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="30" rx="30" ry="20" fill="#fff" fillOpacity="0.7" />
    <ellipse cx="60" cy="25" rx="25" ry="15" fill="#fff" fillOpacity="0.6" />
    <ellipse cx="80" cy="35" rx="15" ry="10" fill="#fff" fillOpacity="0.5" />
  </svg>
);

// Adventure loading messages - will be translated dynamically
const getLoadingMessages = (t: any) => [
  t('preparingAdventure'),
  t('loadingAssets'),
  t('summoningClouds'),
  t('warmingWings'),
  t('gettingReady'),
  t('almostThere')
];

// Optimized splash duration for faster loading
const SPLASH_DURATION = typeof window !== 'undefined' && window.Pi ? 1500 : 2500; // Reduced for faster loading

// Critical images to preload
const CRITICAL_IMAGES = [
  '/flappy pi gif/flappy-2.gif.gif',
  '/flappycoins.png',
  '/social-challenge-badge.png',
  '/npc gif/npc-8.gif.gif',
  '/npc/chengdiao.png',
  '/npc/nicolas.png'
];

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const navigate = useNavigate();
  
  // Use global music system for splash screen
  const { playMusic, stopMusic } = useGlobalMusic(true);
  const { t } = useLanguage();
  const loadingMessages = getLoadingMessages(t);

  // Preload critical images
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = CRITICAL_IMAGES.length;

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.src = src;
      });
    };

    // Preload all critical images in parallel
    Promise.all(CRITICAL_IMAGES.map(preloadImage)).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  // Emit splash state change events
  useEffect(() => {
    // Emit splash started event
    window.dispatchEvent(new CustomEvent('splash-state-change', { 
      detail: { isActive: true } 
    }));
    
    // Set data attribute for detection
    document.body.setAttribute('data-splash-active', 'true');
    
    // Prevent body scroll during splash
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      // Emit splash ended event
      window.dispatchEvent(new CustomEvent('splash-state-change', { 
        detail: { isActive: false } 
      }));
      
      // Remove data attribute
      document.body.removeAttribute('data-splash-active');
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Enhanced splash music handling with Pi Browser optimization
  useEffect(() => {
    let played = false;
    let musicTimeout: NodeJS.Timeout;

    function tryPlaySplashMusic() {
      if (!played) {
        // Skip music in Pi Browser for faster loading
        if (typeof window !== 'undefined' && window.Pi) {
          console.log('[SplashScreen] Skipping music in Pi Browser for faster loading');
          setMusicStarted(true);
          played = true;
          return;
        }
        
        playMusic('splash');
        setMusicStarted(true);
        played = true;
      }
    }

    // If user gesture already detected, play immediately
    if (typeof window !== 'undefined' && window.__musicUserGesture) {
      tryPlaySplashMusic();
    } else {
      // Otherwise, wait for first user gesture
      const handler = () => {
        tryPlaySplashMusic();
        document.removeEventListener('click', handler);
        document.removeEventListener('touchstart', handler);
        document.removeEventListener('keydown', handler);
      };
      document.addEventListener('click', handler, { once: true });
      document.addEventListener('touchstart', handler, { once: true });
      document.addEventListener('keydown', handler, { once: true });
      
      // Clean up on unmount
      return () => {
        document.removeEventListener('click', handler);
        document.removeEventListener('touchstart', handler);
        document.removeEventListener('keydown', handler);
        if (musicTimeout) clearTimeout(musicTimeout);
      };
    }
  }, [playMusic]);

  // Stop splash music after SPLASH_DURATION and ensure cleanup
  useEffect(() => {
    const stopAudio = setTimeout(() => {
      stopMusic();
      // Force stop any remaining splash music to prevent interference
      if (typeof window !== 'undefined' && window.__flappyGlobalMusic) {
        try {
          window.__flappyGlobalMusic.pause();
          window.__flappyGlobalMusic.currentTime = 0;
        } catch (error) {
          console.debug('[SplashScreen] Error stopping global music:', error);
        }
      }
    }, SPLASH_DURATION);
    
    return () => {
      clearTimeout(stopAudio);
      stopMusic();
      // Ensure splash music is completely stopped on unmount
      if (typeof window !== 'undefined' && window.__flappyGlobalMusic) {
        try {
          window.__flappyGlobalMusic.pause();
          window.__flappyGlobalMusic.currentTime = 0;
        } catch (error) {
          console.debug('[SplashScreen] Error stopping global music on unmount:', error);
        }
      }
    };
  }, [stopMusic]);

  // Progress bar and splash duration with optimized loading
  useEffect(() => {
    let start: number | null = null;
    progressRef.current = 0;
    setProgress(0);
    
    function animateProgress(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const percent = Math.min(100, Math.round((elapsed / SPLASH_DURATION) * 100));
      progressRef.current = percent;
      setProgress(percent);
      
      if (percent < 100) {
        animationFrameRef.current = requestAnimationFrame(animateProgress);
      } else {
        setFadeOut(true);
        setTimeout(() => {
          // Dispatch splash complete event for music gesture detection
          window.dispatchEvent(new CustomEvent('splash-complete'));
          
          // Redirect to home page for manual sign-in (no auto sign-in)
          navigate('/home');
          onFinish();
        }, 200); // Faster transition for better UX
      }
    }
    
    // Start animation immediately
    animationFrameRef.current = requestAnimationFrame(animateProgress);
    
    // Force finish after maximum timeout - much shorter timeout
    const forceFinish = setTimeout(() => {
      if (progressRef.current < 100) {
        console.warn('[SplashScreen] Force finishing splash screen due to timeout');
        setProgress(100);
        setFadeOut(true);
        setTimeout(() => {
          // Dispatch splash complete event for music gesture detection
          window.dispatchEvent(new CustomEvent('splash-complete'));
          
          // Redirect to home page for manual sign-in (no auto sign-in)
          navigate('/home');
          onFinish();
        }, 200); // Faster transition for better UX
      }
    }, SPLASH_DURATION + 500); // Reduced to 500ms extra buffer for faster loading
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(forceFinish);
    };
  }, [onFinish, navigate]);

  // Cycle loading messages faster
  useEffect(() => {
    if (progress >= 100) return;
    const interval = typeof window !== 'undefined' && window.Pi ? 600 : 800; // Faster message cycling
    const msgTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length);
    }, interval);
    return () => clearInterval(msgTimer);
  }, [progress, loadingMessages.length]);

  return (
    <div
                  className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200 transition-all duration-300 ease-in-out ${
        fadeOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 9999
      }}
    >
      {/* Music status indicator removed */}
      
      {/* Animated clouds - original design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ width: '100%', height: '100%' }}>
        {clouds.map((cloud, i) => (
          <div
            key={i}
            className="absolute animate-cloud-move"
            style={{
              ...cloud.style,
              animationDelay: cloud.delay,
              zIndex: 0,
            }}
          >
            <CloudSVG width={cloud.style.width} />
          </div>
        ))}
      </div>
      
      {/* Main content - Always centered */}
      <div 
        className="flex flex-col items-center justify-center z-10 max-w-md mx-auto px-4 py-8"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '400px',
          overflow: 'hidden'
        }}
      >
        {/* Logo and Title with Flappy Coins */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {/* Main Flappy Logo */}
            <img 
              src="/flappy pi gif/flappy-2.gif.gif" 
              alt="Flappy Pi Logo" 
              className="w-24 h-24 sm:w-40 sm:h-40 mb-4 sm:mb-6 drop-shadow-2xl animate-bounce" 
              style={{ maxWidth: '100%', height: 'auto' }}
              loading="eager"
              decoding="async"
              onError={(e) => {
                console.warn('❌ Flappy Pi GIF failed to load in SplashScreen, using fallback');
                e.currentTarget.src = '/flappy-logo.png';
              }}
            />
            
            {/* Animated Flappy Coins around logo */}
            <img 
              src="/flappycoins.png" 
              alt="Flappy Coin" 
              className="absolute -top-2 -right-2 w-8 h-8 sm:w-12 sm:h-12 object-contain animate-bounce"
              style={{ animationDelay: '0s' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <img 
              src="/flappycoins.png" 
              alt="Flappy Coin" 
              className="absolute -bottom-2 -left-3 w-6 h-6 sm:w-10 sm:h-10 object-contain animate-bounce"
              style={{ animationDelay: '0.5s' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <img 
              src="/flappycoins.png" 
              alt="Flappy Coin" 
              className="absolute top-2 -left-4 w-5 h-5 sm:w-8 sm:h-8 object-contain animate-bounce"
              style={{ animationDelay: '1s' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <img 
              src="/flappycoins.png" 
              alt="Flappy Coin" 
              className="absolute -bottom-3 -right-4 w-7 h-7 sm:w-11 sm:h-11 object-contain animate-bounce"
              style={{ animationDelay: '1.5s' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* Additional floating coins for better effect */}
            <img 
              src="/flappycoins.png" 
              alt="Flappy Coin" 
              className="absolute top-8 right-6 w-4 h-4 sm:w-6 sm:h-6 object-contain animate-pulse"
              style={{ animationDelay: '2s' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <img 
              src="/flappycoins.png" 
              alt="Flappy Coin" 
              className="absolute bottom-8 left-6 w-4 h-4 sm:w-6 sm:h-6 object-contain animate-pulse"
              style={{ animationDelay: '2.5s' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* Enhanced glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 rounded-full blur-xl opacity-30 animate-pulse -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse -z-20"></div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-lg tracking-wide text-center leading-tight">
            {t('flappyPi')}
          </h1>
        </div>
        
        {/* Loading Message */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 mt-2 text-center">
          <span className="text-base sm:text-2xl font-bold text-blue-900 animate-pulse">
            {loadingMessages[messageIndex]}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="flex flex-col items-center w-full max-w-xs mb-4 sm:mb-6">
          <div className="mb-2 text-blue-900 font-bold text-base sm:text-lg">{progress}%</div>
          <div className="w-full h-3 sm:h-4 bg-blue-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-green-300 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-blue-700 text-sm font-semibold">{t('loading')}</div>
        </div>
        
        {/* Company and Support Info */}
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-base sm:text-lg text-blue-800 font-semibold">{t('splashByText')}</p>
          
          {/* Help text */}
          <p className="text-sm sm:text-base text-blue-700">
            {t('splashHelpText')} <a href="mailto:support@flappypi.fun" className="underline text-blue-900 hover:text-blue-700 transition-colors">{t('splashContactEmail')}</a>
          </p>
          
          {/* Contact Support Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm">
            <a 
              href="mailto:support@flappypi.fun" 
              className="text-blue-900 underline hover:text-blue-700 transition-colors"
            >
              📧 support@flappypi.fun
            </a>
            <span className="hidden sm:inline text-blue-600">•</span>
            <a 
              href="https://flappypisupport8397.pinet.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-900 underline hover:text-blue-700 transition-colors"
            >
              🤖 Flappy Pi Chatbot
            </a>
          </div>
        </div>
      </div>
      
      {/* Cloud animation keyframes */}
      <style>{`
        @keyframes cloud-move {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        .animate-cloud-move {
          animation-name: cloud-move;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        
        /* Ensure splash screen is always on top and properly sized */
        .splash-screen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          overflow: hidden !important;
        }
        
        /* Prevent any scrollbars during splash */
        body[data-splash-active="true"] {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        /* Ensure root element doesn't cause layout issues */
        #root[data-splash-active="true"] {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen; 