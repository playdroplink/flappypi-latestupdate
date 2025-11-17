import { useState, useEffect, useRef, useCallback } from 'react';
import { registerAudioClone, unregisterAudioClone, cleanupAudioInstance } from '../utils/audioCleanup';
import { pauseMusicForAd, resumeMusicAfterAd } from './useGlobalMusic';

export const useSoundEffects = (externalSoundEnabled?: boolean) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (externalSoundEnabled !== undefined) return externalSoundEnabled;
    return localStorage.getItem('flappy-sound-enabled') !== 'false';
  });

  // Add debouncing for rapid sounds like wing flaps
  const lastPlayTime = useRef<{ [key: string]: number }>({});
  const DEBOUNCE_DELAY = 50; // 50ms debounce for rapid sounds

  // Initialize sound effects with mobile support
  const initializeSound = (key: string, basePath: string) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    
    // Try different audio formats for better mobile compatibility
    const tryNextFormat = () => {
      const formats = ['mp3', 'wav', 'ogg'];
      let currentFormatIndex = 0;
      
      const tryFormat = () => {
        if (currentFormatIndex >= formats.length) {
          // Only log in development mode and when debug is enabled
          const debug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') &&
            (typeof window !== 'undefined' && (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappySoundDebug') === 'true'));
          
          if (debug) console.warn(`🔇 [SOUND DEBUG] Failed to load sound: ${key}`);
          return;
        }
        
        const format = formats[currentFormatIndex];
        const url = `${basePath}.${format}`;
        
        audio.src = url;
        audio.load();
        
        audio.onerror = () => {
          currentFormatIndex++;
          tryFormat();
        };
        
        audio.oncanplaythrough = () => {
          audioRefs.current[key] = audio;
          // Only log in development mode and when debug is enabled
          const debug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') &&
            (typeof window !== 'undefined' && (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappySoundDebug') === 'true'));
          
          if (debug) console.debug(`🔊 [SOUND DEBUG] Sound loaded successfully: ${key}`);
        };
      };
      
      tryFormat();
    };

    tryNextFormat();
  };

  // Initialize all sound effects
  useEffect(() => {
    const sounds = {
      swoosh: '/audio/sfx_swooshing', // Use swooshing sound for swoosh
      wing: '/audio/sfx_wing', // Add wing sound for wing flap
      point: '/audio/sfx_point',
      hit: '/audio/sfx_hit',
      die: '/audio/sfx_die',
      coin: '/audio/flappycoins.wav.mp3', // Use the actual flappycoins file with full extension
      powerup: '/audio/sfx_point',
      buttonClick: '/audio/play-button.wav.mp3' // Button click sound effect
    };

    Object.entries(sounds).forEach(([key, path]) => {
      initializeSound(key, path);
    });
  }, []);

  // Enhanced play sound function with mobile support and debouncing
  const playSound = useCallback((key: string, volume = 0.6) => {
    // Only log in development mode and when debug is enabled
    const debug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') &&
      (typeof window !== 'undefined' && (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappySoundDebug') === 'true'));
    
    if (!soundEnabled) {
      if (debug) console.debug(`🔇 [SOUND DEBUG] Sound ${key} skipped - sound disabled`);
      return;
    }
    
    // Check for user gesture requirement on mobile
    if (typeof window !== 'undefined' && !window.__musicUserGesture) {
      if (debug) console.debug(`🔇 [SOUND DEBUG] Sound ${key} skipped - waiting for user gesture on mobile`);
      return;
    }
    
    // Debounce rapid sounds (especially wing flaps) to prevent lag
    const now = Date.now();
    const lastPlay = lastPlayTime.current[key] || 0;
    if (now - lastPlay < DEBOUNCE_DELAY) {
      if (debug) console.debug(`🔇 [SOUND DEBUG] Sound ${key} debounced - too soon after last play`);
      return;
    }
    lastPlayTime.current[key] = now;
    
    // Pause background music during sound effects
    pauseMusicForAd();
    
    const audio = audioRefs.current[key];
    if (audio) {
      try {
        if (debug) console.debug(`🔊 [SOUND DEBUG] Playing sound: ${key} (volume: ${volume})`);
        
        // For rapid sounds like wing flaps, reuse the same audio instance instead of cloning
        if (key === 'wing') {
          // Reset and reuse the same audio instance for wing flaps
          audio.currentTime = 0;
          audio.volume = volume;
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              if (debug) console.debug(`✅ [SOUND DEBUG] Sound ${key} started playing successfully (reused instance)`);
            }).catch((error) => {
              // Enhanced error handling for mobile devices
              if (debug) console.debug(`❌ [SOUND DEBUG] Sound play failed for ${key}:`, error.message);
              
              // Resume background music if sound fails
              setTimeout(() => {
                resumeMusicAfterAd();
              }, 100);
            });
          }
        } else {
          // For other sounds, use cloning as before
          const audioClone = audio.cloneNode() as HTMLAudioElement;
          audioClone.volume = volume;
          audioClone.currentTime = 0;
          
          // Track the clone for cleanup
          registerAudioClone(audioClone);
          
          const playPromise = audioClone.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              if (debug) console.debug(`✅ [SOUND DEBUG] Sound ${key} started playing successfully`);
            }).catch((error) => {
              // Enhanced error handling for mobile devices
              if (debug) console.debug(`❌ [SOUND DEBUG] Sound play failed for ${key}:`, error.message);
              unregisterAudioClone(audioClone);
              cleanupAudioInstance(audioClone);
              
              // Resume background music if sound fails
              setTimeout(() => {
                resumeMusicAfterAd();
              }, 100);
            });
          }

          // Clean up clone when it ends
          audioClone.addEventListener('ended', () => {
            if (debug) console.debug(`🔚 [SOUND DEBUG] Sound ${key} finished playing`);
            unregisterAudioClone(audioClone);
            cleanupAudioInstance(audioClone);
            
            // Resume background music after sound effect
            setTimeout(() => {
              resumeMusicAfterAd();
            }, 500);
          }, { once: true });
        }
      } catch (error) {
        // Enhanced error handling for mobile devices
        if (debug) console.debug(`❌ [SOUND DEBUG] Sound error for ${key}:`, error);
        resumeMusicAfterAd();
      }
    } else {
      if (debug) console.debug(`❌ [SOUND DEBUG] Sound ${key} not found`);
      resumeMusicAfterAd();
    }
  }, [soundEnabled]);

  // Update sound enabled state
  const updateSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('flappy-sound-enabled', enabled.toString());
  }, []);

  // Initialize game sounds function
  const initializeGameSounds = useCallback(() => {
    // Only log in development mode and when debug is enabled
    const debug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') &&
      (typeof window !== 'undefined' && (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappySoundDebug') === 'true'));
    
    if (debug) console.debug('🔊 [SOUND DEBUG] Initializing game sounds');
    
    // Initialize specific game sounds if needed
    const gameSounds = {
      wing: '/audio/sfx_wing',
      point: '/audio/sfx_point',
      hit: '/audio/sfx_hit',
      die: '/audio/sfx_die'
    };

    Object.entries(gameSounds).forEach(([key, path]) => {
      if (!audioRefs.current[key]) {
        initializeSound(key, path);
      }
    });
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Only log in development mode and when debug is enabled
    const debug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') &&
      (typeof window !== 'undefined' && (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappySoundDebug') === 'true'));
    
    if (debug) console.debug('🔇 [SOUND DEBUG] Cleaning up sound effects');
    Object.values(audioRefs.current).forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
      } catch (error) {
        if (debug) console.debug('Sound cleanup error:', error);
      }
    });
    audioRefs.current = {};
    // Reset debounce timers
    lastPlayTime.current = {};
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Individual sound effect functions for convenience
  const playWingFlap = useCallback(() => playSound('wing', 0.4), [playSound]);
  const playPoint = useCallback(() => playSound('point', 0.5), [playSound]);
  const playHit = useCallback(() => playSound('hit', 0.6), [playSound]);
  const playDie = useCallback(() => playSound('die', 0.7), [playSound]);
  const playSwoosh = useCallback(() => playSound('swoosh', 0.3), [playSound]);
  const playCoin = useCallback(() => playSound('coin', 0.5), [playSound]);
  const playPowerup = useCallback(() => playSound('powerup', 0.5), [playSound]);
  const playButtonClick = useCallback(() => playSound('buttonClick', 0.4), [playSound]);

  return {
    playSound,
    playWingFlap,
    playPoint,
    playHit,
    playDie,
    playSwoosh,
    playCoin,
    playPowerup,
    playButtonClick,
    soundEnabled,
    setSoundEnabled: updateSoundEnabled,
    initializeGameSounds,
    cleanup
  };
};
