import { useCallback, useRef } from 'react';

interface SoundOptions {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
}

export const useButtonSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playButtonSound = useCallback((options: SoundOptions = {}) => {
    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio('/audio/play-button.wav.mp3');
        audioRef.current.preload = 'auto';
      }

      const audio = audioRef.current;
      
      // Set audio properties
      audio.volume = options.volume || 0.5;
      audio.playbackRate = options.playbackRate || 1.0;
      audio.loop = options.loop || false;

      // Reset audio to beginning
      audio.currentTime = 0;

      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Button sound playback failed:', error);
        });
      }
    } catch (error) {
      console.warn('Failed to play button sound:', error);
    }
  }, []);

  const playClickSound = useCallback(() => {
    playButtonSound({ volume: 0.3, playbackRate: 1.0 });
  }, [playButtonSound]);

  const playHoverSound = useCallback(() => {
    playButtonSound({ volume: 0.2, playbackRate: 1.2 });
  }, [playButtonSound]);

  const playSuccessSound = useCallback(() => {
    playButtonSound({ volume: 0.4, playbackRate: 1.1 });
  }, [playButtonSound]);

  const playErrorSound = useCallback(() => {
    playButtonSound({ volume: 0.3, playbackRate: 0.8 });
  }, [playButtonSound]);

  return {
    playButtonSound,
    playClickSound,
    playHoverSound,
    playSuccessSound,
    playErrorSound
  };
};
