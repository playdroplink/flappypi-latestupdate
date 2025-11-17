import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Enhanced Music Controller that only plays on home page and properly stops for ads/games
class EnhancedMusicController {
  private static instance: EnhancedMusicController;
  private audio: HTMLAudioElement | null = null;
  private isInitialized = false;
  private currentTrack = '';
  private isPlaying = false;
  private isPausedForAd = false;
  private isPausedForGame = false;
  private volume = 0.3;
  private fadeInterval: NodeJS.Timeout | null = null;
  
  // Pages where background music is allowed
  private readonly allowedMusicPages = [
    '/',
    '/home',
    '/profile',
    '/shop',
    '/wallet',
    '/inventory',
    '/leaderboard', 
    '/community',
    '/wiki',
    '/merch',
    '/reserve',
    '/subscription',
    '/sponsor',
    '/invite-friends',
    '/about',
    '/contact',
    '/faq'
  ];

  // Game modes and pages where music should be OFF
  private readonly gamePages = [
    '/game',
    '/play',
    '/classic',
    '/endless',
    '/challenge',
    '/pvp',
    '/duel',
    '/tournament',
    '/scream-pi-test',
    '/dino-pi-game',
    '/precision-challenge',
    '/time-bomb-challenge',
    '/social-challenge'
  ];

  static getInstance(): EnhancedMusicController {
    if (!EnhancedMusicController.instance) {
      EnhancedMusicController.instance = new EnhancedMusicController();
    }
    return EnhancedMusicController.instance;
  }

  private constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    // Pause music when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseImmediate();
      } else {
        this.resumeIfAllowed();
      }
    });

    // Listen for ad events
    window.addEventListener('ad-started', this.pauseForAd.bind(this));
    window.addEventListener('ad-ended', this.resumeAfterAd.bind(this));
    
    // Listen for game events
    window.addEventListener('game-started', this.pauseForGame.bind(this));
    window.addEventListener('game-ended', this.resumeAfterGame.bind(this));
  }

  private isGamePage(pathname: string): boolean {
    return this.gamePages.some(page => pathname.includes(page));
  }

  private isMusicAllowedOnPage(pathname: string): boolean {
    // Only allow music on specific pages, not on game pages
    if (this.isGamePage(pathname)) {
      return false;
    }
    
    return this.allowedMusicPages.some(page => 
      pathname === page || 
      (page === '/' && pathname === '/home') ||
      pathname.startsWith(page)
    );
  }

  private createAudioElement(): HTMLAudioElement {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = this.volume;
    audio.preload = 'auto';
    
    audio.addEventListener('error', (e) => {
      console.warn('Music loading error (suppressed):', e);
    });

    audio.addEventListener('ended', () => {
      this.isPlaying = false;
    });

    return audio;
  }

  private async fadeOut(duration = 500): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audio || this.audio.volume === 0) {
        resolve();
        return;
      }

      const startVolume = this.audio.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      this.fadeInterval = setInterval(() => {
        currentStep++;
        if (this.audio) {
          this.audio.volume = Math.max(0, startVolume - (volumeStep * currentStep));
        }

        if (currentStep >= steps || !this.audio || this.audio.volume <= 0) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          if (this.audio) {
            this.audio.pause();
          }
          resolve();
        }
      }, stepDuration);
    });
  }

  private async fadeIn(targetVolume = this.volume, duration = 500): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audio) {
        resolve();
        return;
      }

      this.audio.volume = 0;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = targetVolume / steps;
      let currentStep = 0;

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      this.fadeInterval = setInterval(() => {
        currentStep++;
        if (this.audio) {
          this.audio.volume = Math.min(targetVolume, volumeStep * currentStep);
        }

        if (currentStep >= steps || !this.audio || this.audio.volume >= targetVolume) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          resolve();
        }
      }, stepDuration);
    });
  }

  async playTrack(trackUrl: string, pathname: string): Promise<boolean> {
    console.log(`🎵 [Enhanced Music] playTrack called - URL: ${trackUrl}, Path: ${pathname}`);
    
    // Check if music is allowed on this page
    if (!this.isMusicAllowedOnPage(pathname)) {
      console.log(`🎵 [Enhanced Music] Music not allowed on page: ${pathname}`);
      await this.stop();
      return false;
    }

    // Don't play if paused for ad or game
    if (this.isPausedForAd || this.isPausedForGame) {
      console.log(`🎵 [Enhanced Music] Music paused for ad/game, not playing`);
      return false;
    }

    // If same track is already playing, don't restart
    if (this.audio && this.currentTrack === trackUrl && this.isPlaying && !this.audio.paused) {
      console.log(`🎵 [Enhanced Music] Same track already playing`);
      return true;
    }

    try {
      // Stop current track
      if (this.audio) {
        await this.fadeOut(300);
      }

      // Create new audio element if needed
      if (!this.audio) {
        this.audio = this.createAudioElement();
      }

      // Set new track
      this.audio.src = trackUrl;
      this.currentTrack = trackUrl;
      
      // Load and play
      this.audio.load();
      await this.audio.play();
      
      // Fade in
      await this.fadeIn(this.volume, 500);
      
      this.isPlaying = true;
      console.log(`🎵 [Enhanced Music] Successfully playing: ${trackUrl}`);
      return true;
      
    } catch (error) {
      console.warn('Music play failed:', error);
      this.isPlaying = false;
      return false;
    }
  }

  async stop(): Promise<void> {
    console.log(`🎵 [Enhanced Music] Stopping music`);
    
    if (this.audio) {
      await this.fadeOut(300);
      this.audio.src = '';
      this.audio.load();
    }
    
    this.currentTrack = '';
    this.isPlaying = false;
    this.isPausedForAd = false;
    this.isPausedForGame = false;
  }

  pauseImmediate(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  async pauseForAd(): Promise<void> {
    console.log(`🎵 [Enhanced Music] Pausing for ad`);
    this.isPausedForAd = true;
    
    if (this.audio && !this.audio.paused) {
      await this.fadeOut(200);
    }
  }

  async resumeAfterAd(): Promise<void> {
    console.log(`🎵 [Enhanced Music] Resuming after ad`);
    this.isPausedForAd = false;
    this.resumeIfAllowed();
  }

  async pauseForGame(): Promise<void> {
    console.log(`🎵 [Enhanced Music] Pausing for game`);
    this.isPausedForGame = true;
    
    if (this.audio && !this.audio.paused) {
      await this.fadeOut(200);
    }
  }

  async resumeAfterGame(): Promise<void> {
    console.log(`🎵 [Enhanced Music] Resuming after game`);
    this.isPausedForGame = false;
    this.resumeIfAllowed();
  }

  private async resumeIfAllowed(): Promise<void> {
    if (this.isPausedForAd || this.isPausedForGame) {
      console.log(`🎵 [Enhanced Music] Resume blocked - Ad: ${this.isPausedForAd}, Game: ${this.isPausedForGame}`);
      return;
    }

    if (this.audio && this.audio.paused && this.currentTrack && this.isPlaying) {
      try {
        await this.audio.play();
        await this.fadeIn(this.volume, 300);
        console.log(`🎵 [Enhanced Music] Music resumed`);
      } catch (error) {
        console.warn('Music resume failed:', error);
      }
    }
  }

  setVolume(newVolume: number): void {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  getCurrentTrack(): string {
    return this.currentTrack;
  }

  getIsPlaying(): boolean {
    return this.isPlaying && !this.isPausedForAd && !this.isPausedForGame;
  }

  cleanup(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.isPlaying = false;
    this.isPausedForAd = false;
    this.isPausedForGame = false;
  }
}

// Music tracks - only for non-game pages
const MUSIC_TRACKS = {
  home: '/sounds/background/Flappy Pi Main Theme Song.mp3',
  profile: '/sounds/background/Flappy Pi Main Theme Song.mp3',
  shop: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
  wallet: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
  inventory: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
  leaderboard: '/sounds/background/Rise and Flap Theme Song.mp3',
  community: '/sounds/background/Rise and Flap Theme Song.mp3',
  wiki: '/sounds/background/Rise and Flap Theme Song.mp3',
  merch: '/sounds/background/Rise and Flap Theme Song.mp3',
  reserve: '/sounds/background/Rise and Flap Theme Song.mp3',
  subscription: '/sounds/background/Flappy Pi Shop Theme Song.MP3',
  default: '/sounds/background/Flappy Pi Main Theme Song.mp3'
};

// Get track for current page (simplified - only home page music)
function getTrackForPage(pathname: string): string | null {
  console.log(`🎵 [Enhanced Music] Getting track for page: ${pathname}`);
  
  // Game pages - NO MUSIC
  if (pathname.includes('/game') || 
      pathname.includes('/play') || 
      pathname.includes('/classic') ||
      pathname.includes('/endless') ||
      pathname.includes('/challenge') ||
      pathname.includes('/pvp') ||
      pathname.includes('/duel') ||
      pathname.includes('/tournament') ||
      pathname.includes('/scream-pi-test') ||
      pathname.includes('/dino-pi-game') ||
      pathname.includes('/precision-challenge') ||
      pathname.includes('/time-bomb-challenge') ||
      pathname.includes('/social-challenge')) {
    console.log(`🎵 [Enhanced Music] Game page detected - NO MUSIC`);
    return null;
  }

  // Specific page mappings
  if (pathname === '/' || pathname === '/home') {
    return MUSIC_TRACKS.home;
  }
  if (pathname === '/profile') {
    return MUSIC_TRACKS.profile;
  }
  if (pathname === '/shop' || pathname.includes('/shop')) {
    return MUSIC_TRACKS.shop;
  }
  if (pathname === '/wallet') {
    return MUSIC_TRACKS.wallet;
  }
  if (pathname === '/inventory') {
    return MUSIC_TRACKS.inventory;
  }
  if (pathname === '/leaderboard') {
    return MUSIC_TRACKS.leaderboard;
  }
  if (pathname === '/community') {
    return MUSIC_TRACKS.community;
  }
  if (pathname === '/wiki') {
    return MUSIC_TRACKS.wiki;
  }
  if (pathname === '/merch') {
    return MUSIC_TRACKS.merch;
  }
  if (pathname === '/reserve') {
    return MUSIC_TRACKS.reserve;
  }
  if (pathname === '/subscription' || pathname.includes('/subscription')) {
    return MUSIC_TRACKS.subscription;
  }

  // For other allowed pages, use default home music
  const controller = EnhancedMusicController.getInstance();
  if (controller['isMusicAllowedOnPage'](pathname)) {
    return MUSIC_TRACKS.default;
  }

  // No music for all other pages
  console.log(`🎵 [Enhanced Music] Page not in music list - NO MUSIC`);
  return null;
}

// Enhanced hook for music management
export function useEnhancedMusic(musicEnabled: boolean = true) {
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');
  const [volume, setVolumeState] = useState(0.3);
  const controllerRef = useRef<EnhancedMusicController>();

  // Initialize controller
  useEffect(() => {
    controllerRef.current = EnhancedMusicController.getInstance();
    
    return () => {
      if (controllerRef.current) {
        controllerRef.current.cleanup();
      }
    };
  }, []);

  // Handle route changes
  useEffect(() => {
    if (!controllerRef.current || !musicEnabled) {
      return;
    }

    const trackUrl = getTrackForPage(location.pathname);
    console.log(`🎵 [Enhanced Music Hook] Route change: ${location.pathname}, Track: ${trackUrl}`);

    if (trackUrl) {
      controllerRef.current.playTrack(trackUrl, location.pathname).then((success) => {
        setIsPlaying(success);
        setCurrentTrack(success ? trackUrl : '');
      });
    } else {
      controllerRef.current.stop().then(() => {
        setIsPlaying(false);
        setCurrentTrack('');
      });
    }
  }, [location.pathname, musicEnabled]);

  // Handle music enabled/disabled
  useEffect(() => {
    if (!controllerRef.current) return;

    if (!musicEnabled) {
      controllerRef.current.stop().then(() => {
        setIsPlaying(false);
        setCurrentTrack('');
        console.log(`🎵 [Enhanced Music] Music disabled via settings`);
      });
    } else {
      // Re-enable music and play current track if on allowed page
      const trackUrl = getTrackForPage(location.pathname);
      if (trackUrl) {
        controllerRef.current.playTrack(trackUrl, location.pathname).then((success) => {
          setIsPlaying(success);
          setCurrentTrack(success ? trackUrl : '');
          console.log(`🎵 [Enhanced Music] Music re-enabled via settings`);
        });
      }
    }
  }, [musicEnabled, location.pathname]);

  const setVolume = useCallback((newVolume: number) => {
    if (controllerRef.current) {
      controllerRef.current.setVolume(newVolume);
      setVolumeState(newVolume);
    }
  }, []);

  const stopMusic = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.stop().then(() => {
        setIsPlaying(false);
        setCurrentTrack('');
      });
    }
  }, []);

  const pauseMusicForAd = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.pauseForAd();
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('ad-started'));
    }
  }, []);

  const resumeMusicAfterAd = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.resumeAfterAd();
      // Dispatch event for other components  
      window.dispatchEvent(new CustomEvent('ad-ended'));
    }
  }, []);

  const pauseMusicForGame = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.pauseForGame();
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('game-started'));
    }
  }, []);

  const resumeMusicAfterGame = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.resumeAfterGame();
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('game-ended'));
    }
  }, []);

  return {
    isPlaying,
    currentTrack,
    volume,
    setVolume,
    stopMusic,
    pauseMusicForAd,
    resumeMusicAfterAd,
    pauseMusicForGame,
    resumeMusicAfterGame
  };
}

export default EnhancedMusicController;