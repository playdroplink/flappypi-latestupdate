import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  registerAudioContext, 
  registerGlobalMusic, 
  cleanupAudioInstance,
  registerAudioClone,
  unregisterAudioClone,
  registerAudioInstance
} from '../utils/audioCleanup';
import { testMobileAudio } from '../utils/mobileAudioTest';

// Extend Window interface to include custom properties
declare global {
  interface Window {
    __musicUserGesture?: boolean;
    __flappyGlobalMusic?: HTMLAudioElement;
    __globalMusicInstance?: HTMLAudioElement;
    __musicInstanceId?: string;
    __audioContextResumed?: boolean;
    __musicEnabled?: boolean;
    __audioContext?: AudioContext;
  }
}

interface MusicTrack {
  url: string;
  volume: number;
  loop: boolean;
}

const MUSIC_TRACKS: { [key: string]: MusicTrack } = {
  none: {
    url: '', // No audio file for game modes
    volume: 0,
    loop: false,
  },
  splash: {
    url: '/sounds/background/Flappy Pi Splash Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Main Theme Song - ONLY for home and profile pages
  home: {
    url: '/sounds/background/Flappy Pi Main Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Alternative Main Theme Song - for variety
  homealt: {
    url: '/sounds/background/Flappy Pi SecondMain Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  shop: {
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
    volume: 0.3,
    loop: true,
  },
  game: {
    url: '/sounds/background/Soaring Dreams Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  endless: {
    url: '/sounds/background/Soaring Dreams Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  challenge: {
    url: '/sounds/background/Soaring Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  gamealt: {
    url: '/sounds/background/Soaring Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  leaderboard: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  inventory: {
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
    volume: 0.3,
    loop: true,
  },
  community: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Main Theme Song - ONLY for home and profile pages
  profile: {
    url: '/sounds/background/Flappy Pi Main Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Alternative Main Theme Song for profile
  profilealt: {
    url: '/sounds/background/Flappy Pi SecondMain Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  wiki: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  wallet: {
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
    volume: 0.3,
    loop: true,
  },
  merch: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  reserve: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  fullflappywiki: {
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
    volume: 0.3,
    loop: true,
  },
  subscription: {
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
    volume: 0.3,
    loop: true,
  },
  sponsor: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  invite: {
    url: '/sounds/background/Flappy Pi Main Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  history: {
    url: '/sounds/background/Flappy Pi Main Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  purchase: {
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
    volume: 0.3,
    loop: true,
  },
  // NEW: Rise and Flap Theme Song - for special pages (replaced Flap to the Sky)
  sky: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Alternative soaring theme
  soaring: {
    url: '/sounds/background/Soaring Dreams Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Alternative soaring theme 2
  soaring2: {
    url: '/sounds/background/Soaring Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Alternative main theme
  mainalt: {
    url: '/sounds/background/Flappy Pi SecondMain Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  // Alternative shop theme
  shopalt: {
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
    volume: 0.3,
    loop: true,
  },
  // Alternative rise theme
  risealt: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  },
  default: {
    url: '/sounds/background/Rise and Flap Theme Song.mp3',
    volume: 0.3,
    loop: true,
  }
};

// Global audio context for better mobile support
let globalAudioContext: AudioContext | null = null;

// Global music instance to prevent duplicates - SINGLETON PATTERN
let globalMusicInstance: HTMLAudioElement | null = null;
let isGlobalMusicInitialized = false;
let currentInstanceId = '';
let isAdPlaying = false; // Track if ad is playing
let musicRetryCount = 0;
const MAX_RETRY_COUNT = 3;

// Enhanced cleanup function
const cleanupGlobalMusic = () => {
  if (globalMusicInstance) {
    try {
      globalMusicInstance.pause();
      globalMusicInstance.currentTime = 0;
      globalMusicInstance.src = '';
      globalMusicInstance.load();
      globalMusicInstance = null;
    } catch (error) {
      // Silent error handling for production
    }
  }
  currentInstanceId = '';
  isGlobalMusicInitialized = false;
  musicRetryCount = 0;
};

// Function to force stop all background music
export const forceStopAllMusic = () => {
  cleanupGlobalMusic();
};

// Function to force reset music system for page transitions
export const forceResetMusicSystem = () => {
  // Clean up current music instance
  cleanupGlobalMusic();
  
  // Reset global state
  currentInstanceId = '';
  isGlobalMusicInitialized = false;
  
  // Clear any window references
  if (typeof window !== 'undefined') {
    if (window.__flappyGlobalMusic) {
      try {
        window.__flappyGlobalMusic.pause();
        window.__flappyGlobalMusic.currentTime = 0;
        window.__flappyGlobalMusic = undefined;
      } catch (error) {
        // Silent error handling for production
      }
    }
    if (window.__globalMusicInstance) {
      try {
        window.__globalMusicInstance.pause();
        window.__globalMusicInstance.currentTime = 0;
        window.__globalMusicInstance = undefined;
      } catch (error) {
        // Silent error handling for production
      }
    }
  }
};

// Function to pause music for ads
export const pauseMusicForAd = () => {
  isAdPlaying = true;
  if (globalMusicInstance && !globalMusicInstance.paused) {
    try {
      globalMusicInstance.pause();
    } catch (error) {
      // Silent error handling for production
    }
  }
};

// Function to resume music after ads
export const resumeMusicAfterAd = () => {
  isAdPlaying = false;
  if (globalMusicInstance && globalMusicInstance.paused) {
    try {
      globalMusicInstance.play().catch(() => {});
    } catch (error) {
      // Silent error handling for production
    }
  }
};

// Get global music instance
const getGlobalMusicInstance = () => {
  return globalMusicInstance || null;
};

// Enhanced audio context management for mobile
const getAudioContext = () => {
  if (!globalAudioContext) {
    try {
      // Use WebKit AudioContext for better mobile support
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        globalAudioContext = new AudioContextClass();
        if (globalAudioContext) {
          registerAudioContext(globalAudioContext);
        }
      }
    } catch (error) {
      // Silent error handling for production
    }
  }
  return globalAudioContext || null;
};

// Enhanced audio context resume for mobile
const resumeAudioContext = async () => {
  try {
    const context = getAudioContext();
    if (!context) return;

    if (context && context.state === 'suspended') {
      await context.resume();
      if (typeof window !== 'undefined') {
        window.__audioContextResumed = true;
      }
    }
  } catch (error) {
    // Silent error handling for production
  }
};

// Enhanced user gesture detection for mobile devices
const initializeUserGestureDetection = () => {
  if (typeof window !== 'undefined' && !window.__musicUserGesture) {
    if (typeof window !== 'undefined') {
      window.__musicUserGesture = false;
    }
    
    const setMusicUserGesture = () => {
      if (typeof window !== 'undefined') {
        window.__musicUserGesture = true;
      }
      
      // Resume audio context when user gesture is detected
      resumeAudioContext();
      
      // Force unlock mobile audio
      forceMobileAudioUnlock();
    };

    // Listen for various user interactions - enhanced for mobile
    const events = ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown', 'touchend'];
    events.forEach(event => {
      if (document) {
        document.addEventListener(event, setMusicUserGesture, { once: true, passive: true });
      }
    });
    
    // Also listen for window focus events (useful for mobile)
    if (window) {
      window.addEventListener('focus', setMusicUserGesture, { once: true });
    }
  }
};

// Force unlock mobile audio function
const forceMobileAudioUnlock = () => {
  try {
    // Create a silent audio to unlock audio context
    const silentAudio = new Audio();
    silentAudio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAABOW';
    silentAudio.volume = 0.01;
    
    const playPromise = silentAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        silentAudio.pause();
        silentAudio.currentTime = 0;
        
        // Resume global music if available
        if (globalMusicInstance && globalMusicInstance.paused) {
          globalMusicInstance.play().catch(() => {});
        }
      }).catch(() => {
        // Silent error handling for production
      });
    }
  } catch (error) {
    // Silent error handling for production
  }
};

// Enhanced audio loading with retry mechanism for mobile
const loadAudioWithRetry = async (url: string, maxRetries: number = 3): Promise<HTMLAudioElement | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Register for cleanup
      if (audio) {
        registerAudioInstance(audio);
      }
      
      // Set up event listeners
      if (audio) {
        audio.addEventListener('error', (e) => {
          // Suppress music playback errors to prevent console spam
          if (process.env.NODE_ENV === 'development') {
            console.debug('Music playback error (suppressed):', e);
          }
        });
      }
      
      // Load the audio
      if (audio) {
        audio.src = url;
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', reject, { once: true });
          audio.load();
        });
      }
      
      
      return audio;
    } catch (error) {
      // Silent error handling for production
      if (attempt === maxRetries) {
        console.error(`🎵 [MUSIC DEBUG] All audio load attempts failed for:`, url);
        return null;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
};

// Enhanced route-based track selection with comprehensive page coverage
export const getTrackForRoute = (pathname: string): string => {
  console.log(`🎵 [ROUTE DEBUG] Getting track for pathname: ${pathname}`);
  
  // ===== PRIORITY: GAME MODES - ABSOLUTELY NO BACKGROUND MUSIC =====
  // Check ALL game-related patterns first before any other logic
  
  // ANY route with game/play/mode keywords - NO MUSIC
  if (pathname.includes('/game') || 
      pathname.includes('/play') || 
      pathname.includes('-game') ||
      pathname.includes('game-')) {
    console.log(`🎵 [ROUTE DEBUG] Game route detected (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // Endless mode - NO BACKGROUND MUSIC
  if (pathname.includes('/endless') || pathname.includes('endless')) {
    console.log(`🎵 [ROUTE DEBUG] Endless mode detected (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // Classic mode - NO BACKGROUND MUSIC
  if (pathname.includes('/classic') || pathname.includes('classic')) {
    console.log(`🎵 [ROUTE DEBUG] Classic mode detected (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // Challenge mode - NO BACKGROUND MUSIC
  if (pathname.includes('/challenge') || pathname.includes('challenge')) {
    console.log(`🎵 [ROUTE DEBUG] Challenge mode detected (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // Dino Pi game routes - NO BACKGROUND MUSIC
  if (pathname.includes('dino-pi')) {
    console.log(`🎵 [ROUTE DEBUG] Dino Pi detected (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // Scream Pi game routes - NO BACKGROUND MUSIC
  if (pathname.includes('scream-pi')) {
    console.log(`🎵 [ROUTE DEBUG] Scream Pi detected (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // PvP and tournament routes - NO BACKGROUND MUSIC
  if (pathname.includes('pvp') || 
      pathname.includes('duel') || 
      pathname.includes('tournament')) {
    console.log(`🎵 [ROUTE DEBUG] PvP/Duel detected (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // Any test/debug game routes - NO BACKGROUND MUSIC
  if ((pathname.includes('test') || pathname.includes('debug')) && 
      (pathname.includes('game') || pathname.includes('play'))) {
    console.log(`🎵 [ROUTE DEBUG] Test/debug game route (${pathname}), returning 'none' (NO MUSIC)`);
    return 'none';
  }
  
  // ===== HOME PAGE - MAIN THEME (STRICT MATCH ONLY) =====
  if (pathname === '/home' || pathname === '/') {
    console.log(`🎵 [ROUTE DEBUG] Home page (exact match: ${pathname}), returning 'home' (Main Theme)`);
    return 'home'; // Flappy Pi Main Theme Song - ONLY on home
  }
  
  // ===== OTHER NON-GAME PAGES - BACKGROUND MUSIC ALLOWED =====
  
  if (pathname === '/profile') {
    console.log(`🎵 [ROUTE DEBUG] Profile route detected, returning 'profile'`);
    return 'profile'; // Flappy Pi Main Theme Song
  }
  
  // SHOP & COMMERCE PAGES - Shop Theme Song
  if (pathname === '/shop' || pathname.includes('/shop')) {
    console.log(`🎵 [ROUTE DEBUG] Shop route detected, returning 'shop'`);
    return 'shop'; // Flappy Pi Shop Theme Song
  }
  if (pathname === '/wallet') {
    console.log(`🎵 [ROUTE DEBUG] Wallet route detected, returning 'wallet'`);
    return 'wallet'; // Flappy Pi Shop Theme Song
  }
  if (pathname === '/inventory') {
    console.log(`🎵 [ROUTE DEBUG] Inventory route detected, returning 'inventory'`);
    return 'inventory'; // Flappy Pi Shop Theme Song
  }
  if (pathname === '/subscription' || pathname.includes('/subscription')) {
    return 'subscription'; // Flappy Pi Shop Theme Song
  }
  if (pathname === '/full-flappy-wiki') {
    return 'fullflappywiki'; // Flappy Pi Shop Theme Song
  }
  if (pathname === '/purchase') {
    return 'purchase'; // Flappy Pi Shop Theme Song
  }
  
  // COMMUNITY & SOCIAL PAGES - Rise and Flap Theme Song
  if (pathname === '/community') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/leaderboard') {
    return 'leaderboard'; // Rise and Flap Theme Song
  }
  if (pathname === '/merch') {
    return 'merch'; // Rise and Flap Theme Song
  }
  if (pathname === '/reserve') {
    return 'reserve'; // Rise and Flap Theme Song
  }
  if (pathname === '/sponsor') {
    return 'sponsor'; // Rise and Flap Theme Song
  }
  if (pathname === '/wiki') {
    return 'wiki'; // Rise and Flap Theme Song
  }
  
  // SPECIAL PAGES - Rise and Flap Theme Song (replaced Flap to the Sky)
  if (pathname === '/invite-friends') {
    return 'sky'; // Rise and Flap Theme Song
  }
  if (pathname === '/game-history') {
    return 'sky'; // Rise and Flap Theme Song
  }
  
  // ALTERNATIVE THEMES FOR VARIETY
  // Soaring themes for special occasions
  if (pathname.includes('/special') || pathname.includes('/premium')) {
    return 'soaring'; // Soaring Dreams Theme Song
  }
  
  // Alternative main theme for variety
  if (pathname.includes('/alt-home') || pathname.includes('/alt-profile')) {
    return 'homealt'; // Flappy Pi SecondMain Theme Song
  }
  if (pathname === '/purchase-history') {
    return 'purchase';
  }
  if (pathname === '/mrwain-organization') {
    return 'challenge';
  }
  if (pathname === '/pi-auth-debug') {
    return 'profilealt';
  }
  if (pathname === '/auth-debug') {
    return 'homealt';
  }
  if (pathname === '/pi-browser-login') {
    return 'game';
  }
  if (pathname === '/pi-auth') {
    return 'gamealt';
  }
  
  // ADDITIONAL PAGES - Add missing routes
  if (pathname === '/blog' || pathname === '/flappy-pi-blog') {
    return 'sky'; // Rise and Flap Theme Song
  }
  if (pathname === '/dino-pi-blog') {
    return 'sky'; // Rise and Flap Theme Song
  }
  if (pathname === '/languages') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/partnership') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/status') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/press') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/reviews') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/video') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/flappy-pi-website' || pathname === '/flappypiofficial') {
    return 'sky'; // Rise and Flap Theme Song
  }
  if (pathname === '/multiplayer' || pathname === '/pvp') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/fireside-forum') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/pi-login') {
    return 'profile'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/pi-test' || pathname === '/pi-auth-test' || pathname === '/pi-sdk-test') {
    return 'profile'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/pi-consent-info') {
    return 'profile'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/pi-username-test') {
    return 'profile'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/performance-monitor') {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/admin' || pathname.includes('/admin')) {
    return 'community'; // Rise and Flap Theme Song
  }
  if (pathname === '/about') {
    return 'home'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/contact') {
    return 'home'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/faq') {
    return 'home'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/privacy') {
    return 'home'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/terms') {
    return 'home'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/not-in-pi-browser') {
    return 'home'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/unlock-test') {
    return 'profile'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/whitepaper') {
    return 'mainalt'; // Flappy Pi SecondMain Theme Song
  }
  if (pathname === '/flappy-pi-defi' || pathname === '/defi') {
    return 'mainalt'; // Flappy Pi SecondMain Theme Song
  }
  if (pathname === '/dino-pi') {
    return 'sky'; // Rise and Flap Theme Song
  }
  if (pathname === '/scream-pi') {
    return 'sky'; // Rise and Flap Theme Song
  }
  if (pathname === '/account') {
    return 'profile'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/game-history') {
    return 'history'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/payment-history') {
    return 'history'; // Flappy Pi Main Theme Song
  }
  if (pathname === '/invite-friends') {
    return 'invite'; // Flappy Pi Main Theme Song
  }
  
  // Default fallback - use default music for unknown routes (safety first)
  console.log(`🎵 [ROUTE DEBUG] No specific route match for ${pathname}, returning 'default'`);
  return 'default';
};

export const useGlobalMusic = (musicEnabled: boolean = true) => {
  const location = useLocation();
  const [currentTrack, setCurrentTrack] = useState<string>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [isSplashActive, setIsSplashActive] = useState(false);
  
  // Enhanced music state management
  const [musicState, setMusicState] = useState({
    isInitialized: false,
    lastRoute: '',
    retryCount: 0,
    maxRetries: 3
  });

  // Generate unique instance ID for this component
  const instanceId = useMemo(() => `music-${Math.random().toString(36).substr(2, 9)}`, []);

  // Initialize user gesture detection
  useEffect(() => {
    initializeUserGestureDetection();
  }, []);

  // Stop music function without fade out
  const stopMusic = useCallback(() => {
    if (!globalMusicInstance) {
      setIsPlaying(false);
      return;
    }

    // Idempotent stop: if already paused, avoid toggling state that can retrigger play/pause loops
    if (globalMusicInstance.paused) {
      setIsPlaying(false);
      return;
    }

    try {
      globalMusicInstance.pause();
      // Do not reset currentTime here to avoid audible restarts on rapid toggles
      setIsPlaying(false);
    } catch (error) {
      setIsPlaying(false);
    }
  }, []);

  // Enhanced play music function with mobile support and retry mechanism
  const playMusic = useCallback(async (trackKey: string) => {
    console.log(`🎵 [MUSIC DEBUG] playMusic called with trackKey: ${trackKey}, musicEnabled: ${musicEnabled}, isAdPlaying: ${isAdPlaying}`);
    console.log(`🎵 [MUSIC DEBUG] Current pathname: ${location.pathname}`);
    
    // CRITICAL: Double-check current route for game modes - NEVER play music in game
    const currentPath = location.pathname;
    if (currentPath.includes('/game') || 
        currentPath.includes('/play') || 
        currentPath.includes('/classic') || 
        currentPath.includes('/endless') || 
        currentPath.includes('/challenge') ||
        currentPath.includes('game-') ||
        currentPath.includes('-game') ||
        currentPath.includes('dino-pi') ||
        currentPath.includes('scream-pi') ||
        currentPath.includes('pvp') ||
        currentPath.includes('duel')) {
      console.log(`🎵 [MUSIC DEBUG] Game route detected in playMusic guard (${currentPath}), stopping music`);
      stopMusic();
      return;
    }
    
    if (!musicEnabled || trackKey === 'none' || isAdPlaying) {
      console.log(`🎵 [MUSIC DEBUG] Music conditions not met, stopping music`);
      stopMusic();
      return;
    }

    const track = MUSIC_TRACKS[trackKey];
    console.log(`🎵 [MUSIC DEBUG] Looking up track: ${trackKey}`, track);
    if (!track || !track.url) {
      console.log(`🎵 [MUSIC DEBUG] Track not found or no URL, stopping music`);
      console.log(`🎵 [MUSIC DEBUG] Available tracks:`, Object.keys(MUSIC_TRACKS));
      stopMusic();
      return;
    }

    // If this is not the current global instance, don't play
    if (currentInstanceId !== instanceId) {
      console.log(`🎵 [MUSIC DEBUG] Not current instance, skipping play`);
      return;
    }

    // Check if we need to change tracks (improved comparison)
    const currentTrackUrl = globalMusicInstance?.src || '';
    const newTrackUrl = track.url;
    const isSameTrack = currentTrackUrl.includes(newTrackUrl) && isPlaying;
    
    console.log(`🎵 [MUSIC DEBUG] Track comparison - Current: ${currentTrackUrl}, New: ${newTrackUrl}, Same: ${isSameTrack}`);
    
    // If same track is already playing, don't restart
    if (isSameTrack) {
      console.log(`🎵 [MUSIC DEBUG] Same track already playing, skipping`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Stop current music immediately without fade
      if (globalMusicInstance && currentTrackUrl !== newTrackUrl && isPlaying) {
        globalMusicInstance.pause();
        globalMusicInstance.currentTime = 0;
      }

      // Clean up existing instance if different track
      if (globalMusicInstance && currentTrackUrl !== newTrackUrl) {
        cleanupGlobalMusic();
      }

      // Create new instance if needed
      if (!globalMusicInstance) {
        globalMusicInstance = new Audio();
        globalMusicInstance.loop = track.loop;
        globalMusicInstance.volume = track.volume * volume;
        globalMusicInstance.preload = 'auto';
        
        // Set up event listeners
        globalMusicInstance.addEventListener('ended', () => {
          if (!track.loop) {
            setIsPlaying(false);
          }
        });

        globalMusicInstance.addEventListener('error', (e) => {
          setError('Failed to load music track');
          setIsPlaying(false);
        });

        globalMusicInstance.addEventListener('canplaythrough', () => {
          setIsLoading(false);
        });
      }

      // Set the new track
      globalMusicInstance.src = track.url;
      globalMusicInstance.load();

      // Resume audio context if needed for mobile
      await resumeAudioContext();

      // Check for user gesture requirement on mobile
      if (typeof window !== 'undefined' && !window.__musicUserGesture) {
        // Try to force unlock mobile audio
        forceMobileAudioUnlock();
        
        // Don't auto-play without user gesture - just prepare the audio
        console.log('🎵 [MUSIC DEBUG] Audio prepared but waiting for user gesture');
        setIsLoading(false);
        setError('Click anywhere to start music');
        return;
      }

      // Play the music without fade in - with null check
      if (!globalMusicInstance) {
        setError('Music instance not available');
        setIsPlaying(false);
        return;
      }

      const playPromise = globalMusicInstance.play();
      if (playPromise !== undefined) {
        await playPromise;
        
        // Set volume immediately without fade
        const targetVolume = track.volume * volume;
        if (globalMusicInstance) {
          globalMusicInstance.volume = targetVolume;
        }
        
        setIsPlaying(true);
        setCurrentTrack(trackKey);
        setError(null);
        musicRetryCount = 0; // Reset retry count on success
      }
    } catch (error: any) {
      setError(error.message || 'Failed to play music');
      setIsPlaying(false);
      
      // Retry mechanism with exponential backoff
      if (musicRetryCount < MAX_RETRY_COUNT) {
        musicRetryCount++;
        const retryDelay = Math.pow(2, musicRetryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
        
        setTimeout(async () => {
          if (globalMusicInstance && !isPlaying && window.__musicUserGesture) {
            try {
              if (!globalMusicInstance) {
                return;
              }
              await globalMusicInstance.play();
              setIsPlaying(true);
              setCurrentTrack(trackKey);
              setError(null);
              musicRetryCount = 0; // Reset retry count on success
            } catch (retryError) {
              setError(`Retry failed: ${retryError}`);
            }
          }
        }, retryDelay);
      } else {
        musicRetryCount = 0; // Reset for next attempt
      }
    } finally {
      setIsLoading(false);
    }
  }, [musicEnabled, volume, instanceId, stopMusic, currentTrack, location.pathname]);

  // Update volume
  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (globalMusicInstance) {
      const track = MUSIC_TRACKS[currentTrack];
      if (track) {
        try {
          globalMusicInstance.volume = track.volume * newVolume;
        } catch (error) {
          // Silent error handling for production
        }
      }
    }
  }, [currentTrack]);

  // Enhanced route change handling with better reliability
  useEffect(() => {
    const trackKey = getTrackForRoute(location.pathname);
    const currentPath = location.pathname;
    
    console.log(`🎵 [MUSIC DEBUG] Route changed to: ${currentPath}, Track: ${trackKey}, Music Enabled: ${musicEnabled}`);
    
    // Only change tracks if music is enabled globally
    if (!musicEnabled) {
      console.log(`🎵 [MUSIC DEBUG] Music disabled, stopping music`);
      setCurrentTrack('none');
      stopMusic();
      return;
    }
    
    // Check if this is a new route or track change
    const isNewRoute = musicState.lastRoute !== currentPath;
    const isTrackChange = trackKey !== currentTrack;
    
    if (isNewRoute || isTrackChange) {
      console.log(`🎵 [MUSIC DEBUG] Route/track change detected. New route: ${isNewRoute}, Track change: ${isTrackChange}`);
      
      // Update music state
      setMusicState(prev => ({
        ...prev,
        lastRoute: currentPath,
        isInitialized: true
      }));
      
      setCurrentTrack(trackKey);
      
      if (trackKey === 'none') {
        console.log(`🎵 [MUSIC DEBUG] No music for this route, stopping`);
        stopMusic();
      } else {
        console.log(`🎵 [MUSIC DEBUG] Playing music for track: ${trackKey}`);
        // Play music immediately without delay
        if (musicEnabled && !isAdPlaying) {
          playMusic(trackKey);
        }
      }
    }
  }, [location.pathname, currentTrack, playMusic, stopMusic, musicEnabled, musicState.lastRoute]);

  // Handle music enabled/disabled
  useEffect(() => {
    if (!musicEnabled) {
      stopMusic();
    } else if (currentTrack !== 'none' && !isPlaying) {
      playMusic(currentTrack);
    }
  }, [musicEnabled, currentTrack, isPlaying, playMusic, stopMusic]);

  // Handle splash screen state
  useEffect(() => {
    const handleSplashComplete = () => {
      setIsSplashActive(false);
    };

    const handleSplashStart = () => {
      setIsSplashActive(true);
    };

    window.addEventListener('splash-complete', handleSplashComplete);
    window.addEventListener('splash-start', handleSplashStart);

    return () => {
      window.removeEventListener('splash-complete', handleSplashComplete);
      window.removeEventListener('splash-start', handleSplashStart);
    };
  }, []);

  // Set this as the current global instance
  useEffect(() => {
    currentInstanceId = instanceId;
    isGlobalMusicInitialized = true;
    
    console.log(`🎵 [MUSIC DEBUG] Instance ${instanceId} initialized`);

    return () => {
      // Clean up if this is the current instance
      if (currentInstanceId === instanceId) {
        console.log(`🎵 [MUSIC DEBUG] Instance ${instanceId} cleaning up`);
        cleanupGlobalMusic();
      }
    };
  }, [instanceId]);
  
  // Enhanced music initialization on component mount
  useEffect(() => {
    const initializeMusic = async () => {
      console.log(`🎵 [MUSIC DEBUG] Initializing music for route: ${location.pathname}`);
      
      const trackKey = getTrackForRoute(location.pathname);
      console.log(`🎵 [MUSIC DEBUG] Track key for ${location.pathname}: ${trackKey}`);
      
      if (musicEnabled && trackKey !== 'none' && !isAdPlaying) {
        console.log(`🎵 [MUSIC DEBUG] Auto-playing music for track: ${trackKey}`);
        // Small delay to ensure component is fully mounted
        setTimeout(() => {
          playMusic(trackKey);
        }, 200);
      }
    };
    
    // Only initialize if this is the current instance
    if (currentInstanceId === instanceId) {
      initializeMusic();
    }
  }, [musicEnabled, location.pathname, instanceId, playMusic]);

  // Handle visibility changes (pause when app goes to background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If music is intentionally disabled (e.g., game routes) or track is none, never auto-resume
      const shouldStaySilent = !musicEnabled || currentTrack === 'none';

      if (document.hidden) {
        if (globalMusicInstance && !globalMusicInstance.paused) {
          globalMusicInstance.pause();
        }
      } else {
        if (globalMusicInstance && globalMusicInstance.paused && !shouldStaySilent && !isAdPlaying) {
          globalMusicInstance.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [musicEnabled, currentTrack]);

  return {
    currentTrack,
    isPlaying,
    isLoading,
    error,
    volume,
    playMusic,
    stopMusic,
    updateVolume,
    pauseMusicForAd,
    resumeMusicAfterAd,
    forceResetMusicSystem
  };
}; 