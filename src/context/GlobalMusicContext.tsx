import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

interface GlobalMusicContextType {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  isPlaying: boolean;
  currentTrack: string;
  volume: number;
  setVolume: (volume: number) => void;
  playMusic: (trackKey: string) => void;
  stopMusic: () => void;
  pauseMusicForAd: () => void;
  resumeMusicAfterAd: () => void;
  forceResetMusicSystem: () => void;
}

const GlobalMusicContext = createContext<GlobalMusicContextType | undefined>(undefined);

interface GlobalMusicProviderProps {
  children: ReactNode;
}

export const GlobalMusicProvider: React.FC<GlobalMusicProviderProps> = ({ children }) => {
  const [musicEnabled, setMusicEnabled] = useState(() => {
    // Load from localStorage or default to true
    const saved = localStorage.getItem('flappypi-music-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const location = useLocation();
  const {
    isPlaying,
    currentTrack,
    volume,
    playMusic,
    stopMusic,
    updateVolume,
    pauseMusicForAd,
    resumeMusicAfterAd,
    forceResetMusicSystem
  } = useGlobalMusic(musicEnabled);

  // Save music preference to localStorage
  useEffect(() => {
    localStorage.setItem('flappypi-music-enabled', JSON.stringify(musicEnabled));
  }, [musicEnabled]);

  // Enhanced volume management
  const setVolume = (newVolume: number) => {
    updateVolume(newVolume);
  };

  // Enhanced music control
  const handlePlayMusic = (trackKey: string) => {
    if (musicEnabled) {
      playMusic(trackKey);
    }
  };

  const handleStopMusic = () => {
    stopMusic();
  };

  const contextValue: GlobalMusicContextType = {
    musicEnabled,
    setMusicEnabled,
    isPlaying,
    currentTrack,
    volume,
    setVolume,
    playMusic: handlePlayMusic,
    stopMusic: handleStopMusic,
    pauseMusicForAd,
    resumeMusicAfterAd,
    forceResetMusicSystem
  };

  return (
    <GlobalMusicContext.Provider value={contextValue}>
      {children}
    </GlobalMusicContext.Provider>
  );
};

export const useGlobalMusicContext = (): GlobalMusicContextType => {
  const context = useContext(GlobalMusicContext);
  if (context === undefined) {
    throw new Error('useGlobalMusicContext must be used within a GlobalMusicProvider');
  }
  return context;
};

export default GlobalMusicContext;
