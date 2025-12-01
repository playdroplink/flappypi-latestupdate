export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'thunder' | 'rain' | 'fog' | 'storm' | 'christmas' | 'newyear' | 'halloween';

export interface SeasonConfig {
  id: Season;
  name: string;
  emoji: string;
  background: string;
  particles: string;
  effects: string[];
  duration: number; // in hours
}

export const SEASON_CONFIGS: Record<Season, SeasonConfig> = {
  spring: {
    id: 'spring',
    name: 'Spring',
    emoji: '🌸',
    background: 'bg-gradient-to-b from-green-100 via-pink-100 to-blue-200',
    particles: 'spring-particles',
    effects: ['flowers', 'gentle-rain', 'butterflies'],
    duration: 24
  },
  summer: {
    id: 'summer',
    name: 'Summer',
    emoji: '☀️',
    background: 'bg-gradient-to-b from-yellow-100 via-orange-100 to-red-200',
    particles: 'summer-particles',
    effects: ['sunshine', 'heat-waves', 'bees'],
    duration: 24
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn',
    emoji: '🍂',
    background: 'bg-gradient-to-b from-orange-100 via-red-100 to-brown-200',
    particles: 'autumn-particles',
    effects: ['falling-leaves', 'wind', 'acorns'],
    duration: 24
  },
  winter: {
    id: 'winter',
    name: 'Winter',
    emoji: '❄️',
    background: 'bg-gradient-to-b from-blue-100 via-cyan-100 to-white',
    particles: 'winter-particles',
    effects: ['snow', 'ice-crystals', 'northern-lights'],
    duration: 24
  },
  thunder: {
    id: 'thunder',
    name: 'Thunder Storm',
    emoji: '⚡',
    background: 'bg-gradient-to-b from-gray-800 via-purple-900 to-black',
    particles: 'thunder-particles',
    effects: ['lightning', 'thunder', 'dark-clouds'],
    duration: 12
  },
  rain: {
    id: 'rain',
    name: 'Rainy Day',
    emoji: '🌧️',
    background: 'bg-gradient-to-b from-gray-300 via-blue-400 to-gray-600',
    particles: 'rain-particles',
    effects: ['heavy-rain', 'puddles', 'umbrellas'],
    duration: 12
  },
  fog: {
    id: 'fog',
    name: 'Foggy Morning',
    emoji: '🌫️',
    background: 'bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400',
    particles: 'fog-particles',
    effects: ['mist', 'fog', 'low-visibility'],
    duration: 12
  },
  storm: {
    id: 'storm',
    name: 'Stormy Weather',
    emoji: '🌪️',
    background: 'bg-gradient-to-b from-gray-600 via-gray-800 to-black',
    particles: 'storm-particles',
    effects: ['tornado', 'debris', 'strong-winds'],
    duration: 12
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    emoji: '🎄',
    background: 'bg-gradient-to-b from-red-100 via-green-100 to-red-200',
    particles: 'christmas-particles',
    effects: ['snowflakes', 'gifts', 'reindeer'],
    duration: 48
  },
  newyear: {
    id: 'newyear',
    name: 'New Year',
    emoji: '🎆',
    background: 'bg-gradient-to-b from-purple-900 via-blue-900 to-black',
    particles: 'newyear-particles',
    effects: ['fireworks', 'confetti', 'sparkles'],
    duration: 48
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween',
    emoji: '🎃',
    background: 'bg-gradient-to-b from-orange-800 via-purple-900 to-black',
    particles: 'halloween-particles',
    effects: ['bats', 'ghosts', 'spiders'],
    duration: 48
  }
};

export class SeasonManager {
  private static instance: SeasonManager;
  private currentSeason: Season = 'spring';
  private lastSeasonChange: number = Date.now();
  private seasonOrder: Season[] = [
    'spring', 'summer', 'autumn', 'winter', 
    'thunder', 'rain', 'fog', 'storm',
    'christmas', 'newyear', 'halloween'
  ];
  private currentIndex: number = 0;

  private constructor() {
    this.loadSeasonState();
  }

  public static getInstance(): SeasonManager {
    if (!SeasonManager.instance) {
      SeasonManager.instance = new SeasonManager();
    }
    return SeasonManager.instance;
  }

  private loadSeasonState(): void {
    try {
      const savedSeason = localStorage.getItem('flappy-pi-current-season');
      const savedLastChange = localStorage.getItem('flappy-pi-last-season-change');
      const savedIndex = localStorage.getItem('flappy-pi-season-index');

      if (savedSeason && savedLastChange && savedIndex) {
        this.currentSeason = savedSeason as Season;
        this.lastSeasonChange = parseInt(savedLastChange);
        this.currentIndex = parseInt(savedIndex);
      } else {
        // Initialize with current season based on real date
        this.currentSeason = this.getRealSeason();
        this.currentIndex = this.seasonOrder.indexOf(this.currentSeason);
        this.saveSeasonState();
      }
    } catch (error) {
      console.error('Error loading season state:', error);
      this.currentSeason = 'spring';
      this.currentIndex = 0;
    }
  }

  private saveSeasonState(): void {
    try {
      localStorage.setItem('flappy-pi-current-season', this.currentSeason);
      localStorage.setItem('flappy-pi-last-season-change', this.lastSeasonChange.toString());
      localStorage.setItem('flappy-pi-season-index', this.currentIndex.toString());
    } catch (error) {
      console.error('Error saving season state:', error);
    }
  }

  private getRealSeason(): Season {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    // December is Christmas, January is New Year, October is Halloween
    if (month === 12) return 'christmas';
    if (month === 1) return 'newyear';
    if (month === 10) return 'halloween';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  public getCurrentSeason(): Season {
    this.checkAndUpdateSeason();
    return this.currentSeason;
  }

  public getSeasonConfig(): SeasonConfig {
    this.checkAndUpdateSeason();
    return SEASON_CONFIGS[this.currentSeason];
  }

  public getNextSeason(): Season {
    const nextIndex = (this.currentIndex + 1) % this.seasonOrder.length;
    return this.seasonOrder[nextIndex];
  }

  public getTimeUntilNextSeason(): number {
    const now = Date.now();
    const timeSinceLastChange = now - this.lastSeasonChange;
    const seasonDurationMs = SEASON_CONFIGS[this.currentSeason].duration * 60 * 60 * 1000;
    const timeUntilNext = seasonDurationMs - timeSinceLastChange;
    return Math.max(0, timeUntilNext);
  }

  public getSeasonProgress(): number {
    const now = Date.now();
    const timeSinceLastChange = now - this.lastSeasonChange;
    const seasonDurationMs = SEASON_CONFIGS[this.currentSeason].duration * 60 * 60 * 1000;
    return Math.min(1, timeSinceLastChange / seasonDurationMs);
  }

  private checkAndUpdateSeason(): void {
    const now = Date.now();
    const timeSinceLastChange = now - this.lastSeasonChange;
    const seasonDurationMs = SEASON_CONFIGS[this.currentSeason].duration * 60 * 60 * 1000;

    if (timeSinceLastChange >= seasonDurationMs) {
      this.advanceToNextSeason();
    }
  }

  private advanceToNextSeason(): void {
    this.currentIndex = (this.currentIndex + 1) % this.seasonOrder.length;
    this.currentSeason = this.seasonOrder[this.currentIndex];
    this.lastSeasonChange = Date.now();
    this.saveSeasonState();
    
    console.log(`🌍 Season changed to: ${this.currentSeason}`);
  }

  public forceSetSeason(season: Season): void {
    this.currentSeason = season;
    this.currentIndex = this.seasonOrder.indexOf(season);
    this.lastSeasonChange = Date.now();
    this.saveSeasonState();
    
    console.log(`🌍 Season manually set to: ${season}`);
  }

  public resetToRealSeason(): void {
    const realSeason = this.getRealSeason();
    this.forceSetSeason(realSeason);
  }

  public getSeasonInfo(): {
    current: Season;
    config: SeasonConfig;
    progress: number;
    timeUntilNext: number;
    nextSeason: Season;
  } {
    this.checkAndUpdateSeason();
    return {
      current: this.currentSeason,
      config: SEASON_CONFIGS[this.currentSeason],
      progress: this.getSeasonProgress(),
      timeUntilNext: this.getTimeUntilNextSeason(),
      nextSeason: this.getNextSeason()
    };
  }

  public formatTimeUntilNext(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Export singleton instance
export const seasonManager = SeasonManager.getInstance();
