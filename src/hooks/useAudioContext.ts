
import { useRef, useCallback, useState, useEffect } from 'react';

// Shared audio context to prevent multiple instances
let sharedAudioContext: AudioContext | null = null;

export const useAudioContext = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Initialize Web Audio API for better compatibility
  const initializeAudioContext = useCallback(() => {
    if (!audioContext.current) {
      try {
        // Use shared audio context if available, otherwise create new one
        if (sharedAudioContext) {
          audioContext.current = sharedAudioContext;
          console.log('Using shared audio context');
        } else {
          sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContext.current = sharedAudioContext;
          console.log('Audio context initialized');
        }
      } catch (error) {
        console.warn('Web Audio API not supported, falling back to HTML5 audio');
      }
    }
  }, []);

  // Unlock audio on first user interaction - FIXED for autoplay restrictions
  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;

    // Create a silent audio to test and unlock
    const testAudio = new Audio();
    testAudio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAABOW';
    testAudio.volume = 0.01; // Very quiet
    
    const playPromise = testAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        testAudio.pause();
        testAudio.currentTime = 0;
        setAudioUnlocked(true);
        console.log('Audio unlocked successfully');
        
        // Initialize and resume audio context after unlock
        initializeAudioContext();
        if (audioContext.current?.state === 'suspended') {
          audioContext.current.resume().then(() => {
            console.log('Audio context resumed');
          });
        }
      }).catch((error) => {
        console.log('Audio unlock failed, will try again on next interaction:', error);
      });
    }
  }, [audioUnlocked, initializeAudioContext]);

  // Add interaction listeners for audio unlock
  useEffect(() => {
    const handleInteraction = () => {
      unlockAudio();
    };

    // Listen for various user interactions
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('pointerdown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('pointerdown', handleInteraction);
    };
  }, [unlockAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't close shared audio context here, let it be managed globally
      audioContext.current = null;
    };
  }, []);

  return {
    audioContext: audioContext.current,
    audioUnlocked,
    initializeAudioContext,
    unlockAudio
  };
};
