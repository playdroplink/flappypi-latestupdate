
import { useRef, useCallback } from 'react';

interface AudioFile {
  src: string;
  audio: HTMLAudioElement;
  loaded: boolean;
}

export const useAudioLoader = () => {
  const audioFiles = useRef<Map<string, AudioFile>>(new Map());

  // Preload audio files with multiple format support
  const preloadAudio = useCallback((key: string, basePath: string) => {
    const audio = new Audio();
    
    // Try multiple formats for better compatibility
    const formats = ['mp3', 'ogg', 'wav'];
    let formatIndex = 0;

    const tryNextFormat = () => {
      if (formatIndex >= formats.length) {
        console.warn(`Failed to load audio: ${key}`);
        return;
      }

      const format = formats[formatIndex];
      audio.src = `${basePath}.${format}`;
      
      audio.addEventListener('loadeddata', () => {
        audioFiles.current.set(key, {
          src: audio.src,
          audio: audio,
          loaded: true
        });
        console.log(`Audio loaded: ${key} (${format})`);
      }, { once: true });

      audio.addEventListener('error', () => {
        formatIndex++;
        tryNextFormat();
      }, { once: true });

      audio.load();
    };

    tryNextFormat();
  }, []);

  const getAudioFile = useCallback((key: string) => {
    return audioFiles.current.get(key);
  }, []);

  return {
    preloadAudio,
    getAudioFile
  };
};
