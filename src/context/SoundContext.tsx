import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

interface SoundContextType {
  playButtonSound: (type?: 'click' | 'success' | 'error' | 'hover') => void;
  playGameSound: (type: 'wing' | 'point' | 'hit' | 'die' | 'swoosh') => void;
  isSoundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

interface SoundProviderProps {
  children: React.ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setIsSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', enabled.toString());
  }, []);

  const getAudio = useCallback((src: string): HTMLAudioElement => {
    if (!audioRefs.current[src]) {
      audioRefs.current[src] = new Audio(src);
      audioRefs.current[src].preload = 'auto';
    }
    return audioRefs.current[src];
  }, []);

  const playButtonSound = useCallback((type: 'click' | 'success' | 'error' | 'hover' = 'click') => {
    if (!isSoundEnabled) return;

    try {
      const audio = getAudio('/audio/play-button.wav.mp3');
      
      // Adjust volume and playback rate based on type
      switch (type) {
        case 'click':
          audio.volume = 0.3;
          audio.playbackRate = 1.0;
          break;
        case 'success':
          audio.volume = 0.4;
          audio.playbackRate = 1.1;
          break;
        case 'error':
          audio.volume = 0.3;
          audio.playbackRate = 0.8;
          break;
        case 'hover':
          audio.volume = 0.2;
          audio.playbackRate = 1.2;
          break;
      }

      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Button sound playback failed:', error);
        });
      }
    } catch (error) {
      console.warn('Failed to play button sound:', error);
    }
  }, [isSoundEnabled, getAudio]);

  const playGameSound = useCallback((type: 'wing' | 'point' | 'hit' | 'die' | 'swoosh') => {
    if (!isSoundEnabled) return;

    try {
      let src: string;
      switch (type) {
        case 'wing':
          src = '/audio/sfx_wing.wav';
          break;
        case 'point':
          src = '/audio/sfx_point.wav';
          break;
        case 'hit':
          src = '/audio/sfx_hit.wav';
          break;
        case 'die':
          src = '/audio/sfx_die.wav';
          break;
        case 'swoosh':
          src = '/audio/sfx_swooshing.wav';
          break;
        default:
          return;
      }

      const audio = getAudio(src);
      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Game sound playback failed:', error);
        });
      }
    } catch (error) {
      console.warn('Failed to play game sound:', error);
    }
  }, [isSoundEnabled, getAudio]);

  // Initialize sound settings from localStorage
  React.useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    if (savedSoundEnabled !== null) {
      setIsSoundEnabled(savedSoundEnabled === 'true');
    }
  }, []);

  const value: SoundContextType = {
    playButtonSound,
    playGameSound,
    isSoundEnabled,
    setSoundEnabled
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};
