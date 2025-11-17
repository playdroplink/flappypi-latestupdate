
import { useCallback } from 'react';
import { useAudioLoader } from './useAudioLoader';

interface UseAudioPlaybackProps {
  audioUnlocked: boolean;
}

export const useAudioPlayback = ({ audioUnlocked }: UseAudioPlaybackProps) => {
  const { getAudioFile } = useAudioLoader();

  // Play sound effect with improved error handling
  const playSound = useCallback((key: string, volume = 0.6) => {
    if (!audioUnlocked) {
      console.log('Audio not unlocked yet - user interaction required');
      return;
    }

    const audioFile = getAudioFile(key);
    if (!audioFile || !audioFile.loaded) {
      console.warn(`Audio not loaded: ${key}`);
      return;
    }

    try {
      // Clone the audio for overlapping sounds
      const audio = audioFile.audio.cloneNode() as HTMLAudioElement;
      audio.volume = volume;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log(`Failed to play sound: ${key}`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound ${key}:`, error);
    }
  }, [audioUnlocked, getAudioFile]);

  return {
    playSound,
    playWingFlap: () => playSound('wing', 0.4),
    playPoint: () => playSound('point', 0.7),
    playHit: () => playSound('hit', 0.8),
    playDie: () => playSound('die', 0.7),
    playSwoosh: () => playSound('swoosh', 0.5),
    playHeartPickup: () => playSound('heart', 0.6)
  };
};
