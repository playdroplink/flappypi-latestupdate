import React, { useEffect, useState, useRef } from 'react';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useLanguage } from '../context/LanguageContext';

// Prehistoric elements animation data
const prehistoricElements = [
  { type: 'volcano', style: { top: '5%', left: '10%', animationDuration: '25s', width: 80 }, delay: '0s' },
  { type: 'mountain', style: { top: '15%', left: '70%', animationDuration: '30s', width: 100 }, delay: '3s' },
  { type: 'tree', style: { top: '60%', left: '20%', animationDuration: '20s', width: 60 }, delay: '1s' },
  { type: 'rock', style: { top: '75%', left: '80%', animationDuration: '28s', width: 50 }, delay: '2s' },
  { type: 'cave', style: { top: '40%', left: '60%', animationDuration: '32s', width: 70 }, delay: '4s' },
];

// Prehistoric loading messages
const getLoadingMessages = (t: any) => [
  'Preparing your prehistoric adventure...',
  'Loading ancient assets...',
  'Summoning volcanoes...',
  'Warming up the dinosaur...',
  'Getting ready to roar...',
  'Almost there...'
];

const SPLASH_DURATION = 8000; // 8 seconds

const DinoPiSplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  
  // Use global music system for splash screen
  const { playMusic, stopMusic } = useGlobalMusic(true);
  const { t } = useLanguage();
  const loadingMessages = getLoadingMessages(t);

  // Emit splash state change events
  useEffect(() => {
    // Emit splash started event
    window.dispatchEvent(new CustomEvent('dino-splash-state-change', { 
      detail: { isActive: true } 
    }));
    
    // Set data attribute for detection
    document.body.setAttribute('data-dino-splash-active', 'true');
    
    return () => {
      // Emit splash ended event
      window.dispatchEvent(new CustomEvent('dino-splash-state-change', { 
        detail: { isActive: false } 
      }));
      
      // Remove data attribute
      document.body.removeAttribute('data-dino-splash-active');
    };
  }, []);

  // Enhanced splash music handling
  useEffect(() => {
    let played = false;
    let musicTimeout: NodeJS.Timeout;

    function tryPlaySplashMusic() {
      if (!played) {
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

  // Stop splash music after SPLASH_DURATION
  useEffect(() => {
    const stopAudio = setTimeout(() => {
      stopMusic();
    }, SPLASH_DURATION);
    return () => {
      clearTimeout(stopAudio);
      stopMusic();
    };
  }, [stopMusic]);

  // Progress bar and splash duration
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
          onFinish();
        }, 700);
      }
    }
    animationFrameRef.current = requestAnimationFrame(animateProgress);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [onFinish]);

  // Cycle loading messages every 1.5s
  useEffect(() => {
    if (progress >= 100) return;
    const msgTimer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(msgTimer);
  }, [progress]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-300 via-orange-200 to-red-200 transition-opacity duration-700 fixed inset-0 z-[9999] px-4 py-2 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Music status indicator removed */}
      
      {/* Animated prehistoric elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden w-full h-full">
        {prehistoricElements.map((element, i) => (
          <div
            key={i}
            className="absolute animate-cloud-move"
            style={{
              ...element.style,
              animationDelay: element.delay,
              zIndex: 0,
            }}
          >
            {element.type === 'volcano' && (
              <div className="text-6xl">🌋</div>
            )}
            {element.type === 'mountain' && (
              <div className="text-6xl">⛰️</div>
            )}
            {element.type === 'tree' && (
              <div className="text-6xl">🌲</div>
            )}
            {element.type === 'rock' && (
              <div className="text-6xl">🪨</div>
            )}
            {element.type === 'cave' && (
              <div className="text-6xl">🕳️</div>
            )}
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-24 h-24 sm:w-40 sm:h-40 mb-4 sm:mb-6 drop-shadow-2xl animate-bounce z-10" />
      <h1 className="text-3xl sm:text-5xl font-extrabold text-orange-900 mb-2 drop-shadow-lg tracking-wide text-center z-10">Dino Pi</h1>
      
      <div className="flex items-center gap-2 mb-4 sm:mb-6 mt-2 z-10">
        <span className="text-base sm:text-2xl font-bold text-orange-900 animate-pulse text-center">{loadingMessages[messageIndex]}</span>
      </div>
      
      <div className="flex flex-col items-center w-full max-w-xs mb-4 sm:mb-6 z-10">
        <div className="mb-2 text-orange-900 font-bold text-base sm:text-lg">{progress}%</div>
        <div className="w-full h-3 sm:h-4 bg-orange-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-300 transition-all duration-100"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-orange-700 text-sm font-semibold">Loading...</div>
      </div>
      
      <p className="text-base sm:text-lg text-orange-800 font-semibold mb-2 z-10 text-center">by Mrwain Organization</p>
      <p className="text-sm sm:text-base text-orange-700 mb-6 sm:mb-8 z-10 text-center">Need help? <a href="mailto:support@flappypi.fun" className="underline text-orange-900">contact support@flappypi.fun</a></p>
    </div>
  );
};

export default DinoPiSplashScreen; 