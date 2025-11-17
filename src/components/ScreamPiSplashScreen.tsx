import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

// Horror elements animation data
const horrorElements = [
  { type: 'moon', style: { top: '5%', left: '10%', animationDuration: '25s', width: 80 }, delay: '0s' },
  { type: 'cloud', style: { top: '15%', left: '70%', animationDuration: '30s', width: 100 }, delay: '3s' },
  { type: 'tree', style: { top: '60%', left: '20%', animationDuration: '20s', width: 60 }, delay: '1s' },
  { type: 'shadow', style: { top: '75%', left: '80%', animationDuration: '28s', width: 50 }, delay: '2s' },
  { type: 'house', style: { top: '40%', left: '60%', animationDuration: '32s', width: 70 }, delay: '4s' },
  { type: 'fog', style: { top: '30%', left: '40%', animationDuration: '35s', width: 90 }, delay: '1.5s' },
  { type: 'bat', style: { top: '25%', left: '15%', animationDuration: '22s', width: 40 }, delay: '2.5s' },
  { type: 'spider', style: { top: '50%', left: '85%', animationDuration: '26s', width: 45 }, delay: '3.5s' }
];

// Horror-themed loading messages
const getLoadingMessages = (t: any) => [
  "Preparing the scream...",
  "Loading horror elements...",
  "Setting up the nightmare...",
  "Initializing fear...",
  "Loading spooky sounds...",
  "Preparing the scare...",
  "Loading dark atmosphere...",
  "Initializing terror..."
];

const SPLASH_DURATION = 8000; // 8 seconds

// NPC Characters for Scream Pi splash
const npcCharacters = [
  {
    name: "Nicolas",
    image: "/npc/nicolas.png",
    description: "The mysterious guide"
  },
  {
    name: "Chengdiao",
    image: "/npc/chengdiao.png", 
    description: "The wise mentor"
  },
  {
    name: "Character",
    image: "/npc gif/npc-7.gif.gif",
    description: "The main protagonist"
  }
];

interface ScreamPiSplashScreenProps {
  onFinish: () => void;
}

const ScreamPiSplashScreen: React.FC<ScreamPiSplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [currentNPC, setCurrentNPC] = useState(0);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  
  // Use global music system for splash screen
  const { playMusic, stopMusic } = useGlobalMusic(true);
  const { t } = useLanguage();
  const loadingMessages = getLoadingMessages(t);

  // Emit splash state change events
  useEffect(() => {
    // Emit splash started event
    window.dispatchEvent(new CustomEvent('scream-splash-state-change', { 
      detail: { isActive: true } 
    }));
    
    // Set data attribute for detection
    document.body.setAttribute('data-scream-splash-active', 'true');
    
    return () => {
      // Emit splash ended event
      window.dispatchEvent(new CustomEvent('scream-splash-state-change', { 
        detail: { isActive: false } 
      }));
      
      // Remove data attribute
      document.body.removeAttribute('data-scream-splash-active');
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

  // Cycle NPC characters every 2s
  useEffect(() => {
    if (progress >= 100) return;
    const npcTimer = setInterval(() => {
      setCurrentNPC((i) => (i + 1) % npcCharacters.length);
    }, 2000);
    return () => clearInterval(npcTimer);
  }, [progress]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black transition-opacity duration-700 fixed inset-0 z-[9999] px-4 py-2 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Music status indicator removed */}
      {/* Animated horror background elements */}
      {horrorElements.map((element, index) => (
        <div
          key={index}
          className="absolute opacity-20"
          style={{
            ...element.style,
            animationDelay: element.delay,
            animationDuration: element.style.animationDuration,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            animationName: 'float'
          }}
        >
          {element.type === 'moon' && <span className="text-6xl">🌙</span>}
          {element.type === 'cloud' && <span className="text-5xl">☁️</span>}
          {element.type === 'tree' && <span className="text-4xl">🌳</span>}
          {element.type === 'shadow' && <span className="text-4xl">👻</span>}
          {element.type === 'house' && <span className="text-5xl">🏚️</span>}
          {element.type === 'fog' && <span className="text-6xl">🌫️</span>}
          {element.type === 'bat' && <span className="text-3xl">🦇</span>}
          {element.type === 'spider' && <span className="text-3xl">🕷️</span>}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Alternating NPC Characters */}
        <div className="mb-8">
          <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4 sm:mb-6">
            {npcCharacters.map((npc, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentNPC 
                    ? 'opacity-100 scale-100 z-10' 
                    : 'opacity-0 scale-90 z-0'
                }`}
              >
                <img 
                  src={npc.image} 
                  alt={`${npc.name} - ${npc.description}`} 
                  className="w-full h-full object-contain drop-shadow-2xl animate-bounce"
                />
              </div>
            ))}
          </div>
          
          {/* NPC Name and Description */}
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {npcCharacters[currentNPC].name}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 font-medium">
              {npcCharacters[currentNPC].description}
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-8 drop-shadow-lg">
          Scream Pi
        </h1>

        {/* Progress bar */}
        <div className="w-64 sm:w-80 mx-auto mb-4">
          <div className="bg-gray-800 rounded-full h-3 sm:h-4 overflow-hidden">
            <div
              ref={progressRef}
              className="bg-gradient-to-r from-red-500 via-purple-500 to-red-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Progress percentage */}
        <div className="text-white text-lg sm:text-xl font-bold mb-2">
          {progress}%
        </div>

        <div className="flex items-center gap-2 mb-4 sm:mb-6 mt-2 z-10">
          <span className="text-base sm:text-2xl font-bold text-gray-300 animate-pulse text-center">{loadingMessages[messageIndex]}</span>
        </div>
        
        {/* Company and Support Information */}
        <p className="text-base sm:text-lg text-gray-300 font-semibold mb-2 z-10 text-center">by Mrwain Organization</p>
        <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 z-10 text-center">Need help? <a href="mailto:support@flappypi.fun" className="underline text-gray-200 hover:text-white">contact support@flappypi.fun</a></p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          50% { transform: translateY(0px) rotate(0deg); }
          75% { transform: translateY(10px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default ScreamPiSplashScreen; 