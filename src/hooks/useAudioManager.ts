import { useRef, useEffect, useCallback, useState } from 'react';

interface UseAudioManagerProps {
  musicEnabled: boolean;
  gameState: 'menu' | 'playing' | 'gameOver' | 'paused';
}

export const useAudioManager = ({ musicEnabled, gameState }: UseAudioManagerProps) => {
  // REMOVED: backgroundMusic ref - Background music is now handled by useGlobalMusic hook only
  // const backgroundMusic = useRef<HTMLAudioElement | null>(null);
  const soundEffects = useRef<{ [key: string]: HTMLAudioElement | HTMLAudioElement[] }>({});
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [audioLoadingErrors, setAudioLoadingErrors] = useState<string[]>([]);

  // Initialize all audio files with fallbacks (SFX ONLY - NO BACKGROUND MUSIC)
  const initializeAudio = useCallback(() => {
    // Clear previous audio elements to prevent accumulation
    // Background music is now handled by useGlobalMusic hook only
    // if (backgroundMusic.current) {
    //   backgroundMusic.current.pause();
    //   backgroundMusic.current = null;
    // }
    Object.values(soundEffects.current).forEach(audio => {
      if (Array.isArray(audio)) {
        audio.forEach(clone => clone.pause());
      } else if (audio) {
        audio.pause();
      }
    });
    soundEffects.current = {};

    // Initialize sound effects with multiple fallback paths and silent fallbacks
    const soundFiles = {
      wing: [
        '/assets/audio/sfx_wing.wav',
        '/sounds/sfx/wing_flap.mp3',
        '/sounds/sfx/jump.wav'
      ],
      point: [
        '/assets/audio/sfx_point.wav',
        '/sounds/sfx/score.mp3',
        '/sounds/sfx/point.wav'
      ],
      hit: [
        '/assets/audio/sfx_hit.wav',
        '/sounds/sfx/collision.mp3',
        '/sounds/sfx/hit.wav'
      ],
      die: [
        '/assets/audio/sfx_die.wav',
        '/sounds/sfx/game_over.mp3',
        '/sounds/sfx/die.wav'
      ],
      swoosh: [
        '/assets/audio/sfx_swooshing.wav',
        '/sounds/sfx/swoosh.mp3',
        '/sounds/sfx/swipe.wav'
      ],
      coin: [
        '/sounds/sfx/coin_collect.mp3',
        '/sounds/sfx/pickup.wav',
        '/assets/audio/sfx_point.wav' // Use point sound as fallback
      ],
      powerup: [
        '/sounds/sfx/powerup.mp3',
        '/sounds/sfx/bonus.wav',
        '/assets/audio/sfx_swooshing.wav' // Use swoosh as fallback
      ]
    };

    Object.entries(soundFiles).forEach(([key, paths]) => {
      // Only initialize if not already present, to avoid re-initializing during hot reloads
      if (!soundEffects.current[key] || (Array.isArray(soundEffects.current[key]) && (soundEffects.current[key] as HTMLAudioElement[]).length === 0)) {
        let audioLoaded = false;
        
        const tryLoadAudio = (pathIndex: number) => {
          if (pathIndex >= paths.length) {
            console.log(`🔇 Using silent fallback for: ${key}`);
            const silentAudio = new Audio();
            silentAudio.volume = 0;
            soundEffects.current[key] = silentAudio;
            return;
          }
          
          const audio = new Audio();
          audio.preload = 'auto';
          audio.volume = 0.6;
          
          audio.addEventListener('canplaythrough', () => {
            if (!audioLoaded) {
              soundEffects.current[key] = audio;
              audioLoaded = true;
              console.log(`✅ Audio loaded: ${key} from ${paths[pathIndex]}`);
            }
          });
          
          audio.addEventListener('error', () => {
            console.debug(`⚠️ Failed to load ${key} from ${paths[pathIndex]}, trying next...`);
            if (!audioLoaded) {
              tryLoadAudio(pathIndex + 1);
            }
          });
          
          audio.src = paths[pathIndex];
        };
        
        tryLoadAudio(0);
      }
    });
  }, []);

  // Enhanced audio unlock with better error handling
  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;

    const unlockTests = [
      () => {
        const testAudio = new Audio();
        testAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        testAudio.volume = 0.01;
        return testAudio.play();
      }
    ];

    const attemptUnlock = async () => {
      for (const test of unlockTests) {
        try {
          await test();
          setAudioUnlocked(true);
          console.log('🔊 Audio unlocked successfully');
          return;
        } catch (error) {
          console.log('Audio unlock method failed:', error);
        }
      }
      console.warn('⚠️ All audio unlock methods failed');
    };

    attemptUnlock();
  }, [audioUnlocked]);

  // Enhanced sound playing with better error handling and spam prevention
  const playSound = useCallback((soundKey: string, volume = 0.6, retries = 2) => {
    if (!audioUnlocked) {
      console.debug(`🔇 Audio not unlocked, skipping ${soundKey}`);
      return;
    }
    
    const audio = soundEffects.current[soundKey];
    if (!audio || Array.isArray(audio)) {
      console.debug(`🔇 Sound not available or is a clone array: ${soundKey}`);
      return;
    }

    try {
      // Stop any existing instance of the original sound to prevent overlap
      if (audio.currentTime > 0) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      let activeClones = (soundEffects.current[`${soundKey}_clones`] || []) as HTMLAudioElement[];
      
      if (activeClones.length >= 3) {
        const oldestClone = activeClones.shift();
        if (oldestClone) {
          oldestClone.pause();
          oldestClone.remove();
        }
      }
      
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.volume = Math.min(volume, 1.0);
      audioClone.currentTime = 0;
      
      activeClones.push(audioClone);
      soundEffects.current[`${soundKey}_clones`] = activeClones;
      
      const playPromise = audioClone.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioClone.addEventListener('ended', () => {
              const index = activeClones.indexOf(audioClone);
              if (index > -1) {
                activeClones.splice(index, 1);
              }
              audioClone.remove();
            });
          })
          .catch((error) => {
            console.debug(`🔇 Sound play failed: ${soundKey}`, error.message);
            
            const index = activeClones.indexOf(audioClone);
            if (index > -1) {
              activeClones.splice(index, 1);
            }
          });
      }
    } catch (error) {
      console.error(`Fatal error playing sound ${soundKey}:`, error);
      if (retries > 0) {
        console.log(`Retrying ${soundKey} (${retries} left)...`);
        setTimeout(() => playSound(soundKey, volume, retries - 1), 50);
      } else {
        setAudioLoadingErrors(prev => [...new Set([...prev, `Failed to play ${soundKey}: ${error.message}`])]);
      }
    }
  }, [audioUnlocked, soundEffects]);

  const stopAllSounds = useCallback(() => {
    console.log('🔇 Stopping all sounds (SFX only)...');
    // Background music is now handled by useGlobalMusic hook only
    // if (backgroundMusic.current) {
    //   backgroundMusic.current.pause();
    //   backgroundMusic.current.currentTime = 0;
    // }
    Object.values(soundEffects.current).forEach(audio => {
      if (Array.isArray(audio)) {
        audio.forEach(clone => {
          clone.pause();
          clone.currentTime = 0;
        });
      } else if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);

  useEffect(() => {
    initializeAudio();
    
    // Attempt to unlock audio on first user interaction (or immediately if safe)
    const handleInteraction = () => {
      unlockAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [initializeAudio, unlockAudio]);

  // Cleanup on unmount or when game state is not playing/paused/game over
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up audio resources (SFX only)...');
      // Background music is now handled by useGlobalMusic hook only
      // if (backgroundMusic.current) {
      //   backgroundMusic.current.pause();
      //   backgroundMusic.current.currentTime = 0;
      // }
      Object.values(soundEffects.current).forEach(audio => {
        if (Array.isArray(audio)) {
          audio.forEach(clone => {
            clone.pause();
            clone.currentTime = 0;
            clone.src = '';
            clone.load();
            clone.remove(); // Ensure element is removed from DOM
          });
        } else if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.src = '';
          audio.load();
        }
      });
      soundEffects.current = {};
      setAudioUnlocked(false);
    };
  }, []);

  // Background music is now handled by useGlobalMusic hook only
  // Pause music if not enabled or game state is not playing
  // useEffect(() => {
  //   if (backgroundMusic.current) {
  //     if (musicEnabled && (gameState === 'playing' || gameState === 'menu')) {
  //       if (backgroundMusic.current.paused) {
  //         backgroundMusic.current.play().catch(e => console.error('Error playing background music:', e));
  //       }
  //     } else {
  //       backgroundMusic.current.pause();
  //     }
  //   }
  // }, [musicEnabled, gameState]);

  return {
    playWingFlap: () => playSound('wing', 0.5),
    playPoint: () => playSound('point', 0.7),
    playHit: () => playSound('hit', 0.8),
    playDie: () => playSound('die', 0.8),
    playSwoosh: () => playSound('swoosh', 0.5),
    playCoin: () => playSound('coin', 0.7),
    playPowerUp: () => playSound('powerup', 0.7),
    audioUnlocked,
    audioLoadingErrors,
    stopAllSounds,
    reinitializeAudio: () => {
      setAudioLoadingErrors([]);
      setAudioUnlocked(false);
      initializeAudio();
      unlockAudio();
    },
  };
};
