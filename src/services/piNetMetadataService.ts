// PiNet Metadata Service
// Implements PiNet metadata support according to official documentation
// Supports both frontend and backend metadata flows

// Core PiNet Metadata Types
export type PiNetMetadataDTO = {
  title?: string;
  description?: string;
  authors?: null | Author | Array<Author>;
  keywords?: null | string | Array<string>;
  creator?: null | string;
  publisher?: null | string;
  formatDetection?: null | FormatDetection;
  abstract?: null | string;
  archives?: null | string | Array<string>;
  category?: null | string;
  classification?: null | string;
  openGraph?: null | OGMetadata;
  twitter?: null | TwitterMetadata;
  icons?: null | string | Array<Icon> | Icons;
};

// Default HTML Meta Tags Types
export type Author = {
  url?: string;
  name?: string;
};

export type FormatDetection = {
  telephone?: boolean;
  date?: boolean;
  address?: boolean;
  email?: boolean;
  url?: boolean;
};

export type IconDescriptor = {
  url: string;
  type?: string;
  sizes?: string;
  color?: string;
  rel?: string;
  media?: string;
  fetchPriority?: "high" | "low" | "auto";
};

export type Icon = string | IconDescriptor;

export type Icons = {
  icon?: Icon | Array<Icon>;
  shortcut?: Icon | Array<Icon>;
  apple?: Icon | Array<Icon>;
  other?: IconDescriptor | Array<IconDescriptor>;
};

// OpenGraph Types
export type OGMetadata =
  | OGMetadataWebsite
  | OGMetadataArticle
  | OGMetadataBook
  | OGMetadataProfile
  | OGMetadataMusicSong
  | OGMetadataMusicAlbum
  | OGMetadataMusicPlaylist
  | OGMetadataMusicRadioStation
  | OGMetadataVideoMovie
  | OGMetadataVideoEpisode
  | OGMetadataVideoTVShow
  | OGMetadataVideoOther;

export type OGMetadataBase = {
  title?: string;
  description?: string;
  emails?: Array<string>;
  phoneNumbers?: Array<string>;
  faxNumbers?: Array<string>;
  locale?: string;
  alternateLocale?: Array<string>;
  images?: OGImage | Array<OGImage>;
  audio?: Array<OGAudio>;
  videos?: Array<OGVideo>;
  countryName?: string;
};

export type OGMetadataWebsite = OGMetadataBase & {
  type: "website";
};

export type OGMetadataArticle = OGMetadataBase & {
  type: "article";
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;
  authors?: null | string | Array<string>;
  section?: null | string;
  tags?: null | string | Array<string>;
};

export type OGMetadataBook = OGMetadataBase & {
  type: "book";
  isbn?: null | string;
  releaseDate?: null | string;
  authors?: null | string | Array<string>;
};

export type OGMetadataProfile = OGMetadataBase & {
  type: "profile";
  firstName?: null | string;
  lastName?: null | string;
  username?: null | string;
  gender?: null | string;
};

export type OGMetadataMusicSong = OGMetadataBase & {
  type: "music.song";
  duration?: null | number;
  albums?: null | string | OGAlbum | Array<OGAlbum>;
  musicians?: null | string | Array<string>;
};

export type OGMetadataMusicAlbum = OGMetadataBase & {
  type: "music.album";
  songs?: null | string | OGSong | Array<string | OGSong>;
  musicians?: null | string | Array<string>;
  releaseDate?: null | string;
};

export type OGMetadataMusicPlaylist = OGMetadataBase & {
  type: "music.playlist";
  songs?: null | string | OGSong | Array<string | OGSong>;
  creators?: null | string | Array<string>;
};

export type OGMetadataMusicRadioStation = OGMetadataBase & {
  type: "music.radio_station";
  creators?: null | string | Array<string>;
};

export type OGMetadataVideoMovie = OGMetadataBase & {
  type: "video.movie";
  actors?: null | string | OGActor | Array<OGActor>;
  directors?: null | string | Array<string>;
  writers?: null | string | Array<string>;
  duration?: null | number;
  releaseDate?: null | string;
  tags?: null | string | Array<string>;
};

export type OGMetadataVideoEpisode = OGMetadataBase & {
  type: "video.episode";
  actors?: null | string | OGActor | Array<OGActor>;
  directors?: null | string | Array<string>;
  writers?: null | string | Array<string>;
  duration?: null | number;
  releaseDate?: null | string;
  tags?: null | string | Array<string>;
  series?: null | string;
};

export type OGMetadataVideoTVShow = OGMetadataBase & {
  type: "video.tv_show";
};

export type OGMetadataVideoOther = OGMetadataBase & {
  type: "video.other";
};

// OpenGraph Supporting Types
export type OGImageDescriptor = {
  url: string;
  secureUrl?: string;
  alt?: string;
  type?: string;
  width?: string | number;
  height?: string | number;
};

export type OGImage = string | OGImageDescriptor;

export type OGVideoDescriptor = {
  url: string;
  secureUrl?: string;
  alt?: string;
  type?: string;
  width?: string | number;
  height?: string | number;
};

export type OGVideo = string | OGVideoDescriptor;

export type OGAudioDescriptor = {
  url: string;
  secureUrl?: string;
  alt?: string;
};

export type OGAudio = string | OGAudioDescriptor;

export type OGActor = {
  url: string;
  role?: string;
};

export type OGSong = {
  url: string;
  disc?: number;
  track?: number;
};

export type OGAlbum = {
  url: string;
  disc?: number;
  track?: number;
};

// Twitter Types
export type TwitterMetadata =
  | TwitterMetadataBase
  | TwitterMetadataCardSummary
  | TwitterMetadataCardSummaryLargeImage
  | TwitterMetadataCardPlayer
  | TwitterMetadataCardApp;

export type TwitterMetadataBase = {
  title?: string;
  description?: string;
  creator?: string;
  creatorId?: string;
  images?: TwitterImage | Array<TwitterImage>;
};

export type TwitterMetadataCardSummary = TwitterMetadataBase & {
  card: "summary";
};

export type TwitterMetadataCardSummaryLargeImage = TwitterMetadataBase & {
  card: "summary_large_image";
};

export type TwitterMetadataCardPlayer = TwitterMetadataBase & {
  card: "player";
  players: TwitterPlayerDescriptor | Array<TwitterPlayerDescriptor>;
};

export type TwitterMetadataCardApp = TwitterMetadataBase & {
  card: "app";
};

// Twitter Supporting Types
export type TwitterImageDescriptor = {
  url: string;
  secureUrl?: string;
  alt?: string;
  type?: string;
  width?: string | number;
  height?: string | number;
};

export type TwitterImage = string | TwitterImageDescriptor;

export type TwitterPlayerDescriptor = {
  url: string;
  width: number;
  height: number;
};

// Flappy Pi Specific Metadata
export interface FlappyPiMetadata {
  page: string;
  title: string;
  description: string;
  image?: string;
  url?: string;
}

class PiNetMetadataService {
  private baseUrl: string;
  private appName: string;
  private appDescription: string;
  private defaultImage: string;

  constructor() {
    this.baseUrl = 'https://flappypi2807.pinet.com';
    this.appName = 'Flappy Pi';
    this.appDescription = 'Soar through the skies with Flappy Pi - the ultimate Pi Network gaming experience!';
    this.defaultImage = `${this.baseUrl}/public/assets/img/flappy-pi-gameplay.png`;
  }

  /**
   * Generate metadata for a specific page
   */
  generateMetadata(page: string, customData?: Partial<FlappyPiMetadata>): PiNetMetadataDTO {
    const baseMetadata = this.getBaseMetadata();
    const pageMetadata = this.getPageMetadata(page, customData);

    return {
      ...baseMetadata,
      ...pageMetadata,
    };
  }

  /**
   * Get base metadata for the app
   */
  private getBaseMetadata(): PiNetMetadataDTO {
    return {
      title: this.appName,
      description: this.appDescription,
      creator: '@Wain2020',
      publisher: 'Flappy Pi Team',
      category: 'Game',
      classification: 'Arcade',
      keywords: ['flappy pi', 'pi network', 'game', 'arcade', 'mobile', 'cryptocurrency'],
      formatDetection: {
        telephone: false,
        date: false,
        address: false,
        email: false,
        url: true,
      },
      icons: {
        icon: [
          {
            url: `${this.baseUrl}/public/icons/icon-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            url: `${this.baseUrl}/public/icons/icon-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        apple: [
          {
            url: `${this.baseUrl}/public/icons/apple-touch-icon.png`,
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      openGraph: {
        type: 'website',
        title: this.appName,
        description: this.appDescription,
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi - Pi Network Game',
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: this.appName,
        description: this.appDescription,
        creator: '@Wain2020',
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi - Pi Network Game',
          },
        ],
      },
    };
  }

  /**
   * Get page-specific metadata
   */
  private getPageMetadata(page: string, customData?: Partial<FlappyPiMetadata>): PiNetMetadataDTO {
    const pageData: FlappyPiMetadata = {
      page,
      title: customData?.title || this.appName,
      description: customData?.description || this.appDescription,
      image: customData?.image || this.defaultImage,
      url: customData?.url || `${this.baseUrl}${page}`,
    };

    switch (page) {
      case '/':
        return this.getHomePageMetadata(pageData);
      case '/game':
        return this.getGamePageMetadata(pageData);
      case '/shop':
        return this.getShopPageMetadata(pageData);
      case '/leaderboard':
        return this.getLeaderboardPageMetadata(pageData);
      case '/about':
        return this.getAboutPageMetadata(pageData);
      default:
        return this.getDefaultPageMetadata(pageData);
    }
  }

  /**
   * Home page metadata
   */
  private getHomePageMetadata(data: FlappyPiMetadata): PiNetMetadataDTO {
    return {
      title: `${this.appName} - Soar with Pi Network!`,
      description: 'Experience the thrill of Flappy Pi, the ultimate Pi Network arcade game. Play, earn, and compete with players worldwide!',
      openGraph: {
        type: 'website',
        title: `${this.appName} - Soar with Pi Network!`,
        description: 'Experience the thrill of Flappy Pi, the ultimate Pi Network arcade game. Play, earn, and compete with players worldwide!',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi - Pi Network Arcade Game',
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${this.appName} - Soar with Pi Network!`,
        description: 'Experience the thrill of Flappy Pi, the ultimate Pi Network arcade game. Play, earn, and compete with players worldwide!',
        creator: '@Wain2020',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi - Pi Network Arcade Game',
          },
        ],
      },
    };
  }

  /**
   * Game page metadata
   */
  private getGamePageMetadata(data: FlappyPiMetadata): PiNetMetadataDTO {
    return {
      title: `Play ${this.appName} - Pi Network Arcade Game`,
      description: 'Jump into the action! Play Flappy Pi and test your skills in this addictive Pi Network arcade game. Can you beat your high score?',
      openGraph: {
        type: 'website',
        title: `Play ${this.appName} - Pi Network Arcade Game`,
        description: 'Jump into the action! Play Flappy Pi and test your skills in this addictive Pi Network arcade game. Can you beat your high score?',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Play Flappy Pi - Pi Network Game',
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Play ${this.appName} - Pi Network Arcade Game`,
        description: 'Jump into the action! Play Flappy Pi and test your skills in this addictive Pi Network arcade game. Can you beat your high score?',
        creator: '@Wain2020',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Play Flappy Pi - Pi Network Game',
          },
        ],
      },
    };
  }

  /**
   * Shop page metadata
   */
  private getShopPageMetadata(data: FlappyPiMetadata): PiNetMetadataDTO {
    return {
      title: `${this.appName} Shop - Unlock Premium Features`,
      description: 'Discover exclusive skins, power-ups, and premium features in the Flappy Pi shop. Enhance your gaming experience with Pi cryptocurrency!',
      openGraph: {
        type: 'website',
        title: `${this.appName} Shop - Unlock Premium Features`,
        description: 'Discover exclusive skins, power-ups, and premium features in the Flappy Pi shop. Enhance your gaming experience with Pi cryptocurrency!',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi Shop - Premium Features',
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${this.appName} Shop - Unlock Premium Features`,
        description: 'Discover exclusive skins, power-ups, and premium features in the Flappy Pi shop. Enhance your gaming experience with Pi cryptocurrency!',
        creator: '@Wain2020',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi Shop - Premium Features',
          },
        ],
      },
    };
  }

  /**
   * Leaderboard page metadata
   */
  private getLeaderboardPageMetadata(data: FlappyPiMetadata): PiNetMetadataDTO {
    return {
      title: `${this.appName} Leaderboard - Top Players`,
      description: 'Check out the top players on the Flappy Pi leaderboard! Compete with the best and see if you can reach the top of the rankings.',
      openGraph: {
        type: 'website',
        title: `${this.appName} Leaderboard - Top Players`,
        description: 'Check out the top players on the Flappy Pi leaderboard! Compete with the best and see if you can reach the top of the rankings.',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi Leaderboard - Top Players',
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${this.appName} Leaderboard - Top Players`,
        description: 'Check out the top players on the Flappy Pi leaderboard! Compete with the best and see if you can reach the top of the rankings.',
        creator: '@Wain2020',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'Flappy Pi Leaderboard - Top Players',
          },
        ],
      },
    };
  }

  /**
   * About page metadata
   */
  private getAboutPageMetadata(data: FlappyPiMetadata): PiNetMetadataDTO {
    return {
      title: `About ${this.appName} - Pi Network Gaming`,
      description: 'Learn more about Flappy Pi, the revolutionary Pi Network arcade game. Discover our mission to bring blockchain gaming to everyone.',
      openGraph: {
        type: 'website',
        title: `About ${this.appName} - Pi Network Gaming`,
        description: 'Learn more about Flappy Pi, the revolutionary Pi Network arcade game. Discover our mission to bring blockchain gaming to everyone.',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'About Flappy Pi - Pi Network Gaming',
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: `About ${this.appName} - Pi Network Gaming`,
        description: 'Learn more about Flappy Pi, the revolutionary Pi Network arcade game. Discover our mission to bring blockchain gaming to everyone.',
        creator: '@Wain2020',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: 'About Flappy Pi - Pi Network Gaming',
          },
        ],
      },
    };
  }

  /**
   * Default page metadata
   */
  private getDefaultPageMetadata(data: FlappyPiMetadata): PiNetMetadataDTO {
    return {
      title: data.title,
      description: data.description,
      openGraph: {
        type: 'website',
        title: data.title,
        description: data.description,
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: data.title,
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title,
        description: data.description,
        creator: '@Wain2020',
        images: [
          {
            url: data.image!,
            width: 1200,
            height: 630,
            alt: data.title,
          },
        ],
      },
    };
  }

  /**
   * Generate metadata for backend endpoint
   * This would be used in your backend API at /pinet/meta
   */
  generateBackendMetadata(pathname: string): PiNetMetadataDTO {
    // Decode the pathname from URL encoding
    const decodedPathname = decodeURIComponent(pathname);
    
    // Generate metadata for the specific path
    return this.generateMetadata(decodedPathname);
  }

  /**
   * Validate metadata DTO
   */
  validateMetadata(metadata: PiNetMetadataDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (metadata.title && metadata.title.length > 60) {
      errors.push('Title should be less than 60 characters');
    }

    if (metadata.description && metadata.description.length > 160) {
      errors.push('Description should be less than 160 characters');
    }

    // OpenGraph validation
    if (metadata.openGraph) {
      if (metadata.openGraph.images) {
        const images = Array.isArray(metadata.openGraph.images) 
          ? metadata.openGraph.images 
          : [metadata.openGraph.images];
        
        images.forEach((image, index) => {
          if (typeof image === 'object' && !image.url) {
            errors.push(`OpenGraph image ${index} must have a URL`);
          }
        });
      }
    }

    // Twitter validation
    if (metadata.twitter) {
      if (metadata.twitter.images) {
        const images = Array.isArray(metadata.twitter.images) 
          ? metadata.twitter.images 
          : [metadata.twitter.images];
        
        images.forEach((image, index) => {
          if (typeof image === 'object' && !image.url) {
            errors.push(`Twitter image ${index} must have a URL`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get metadata for specific game events
   */
  generateGameEventMetadata(event: string, score?: number): PiNetMetadataDTO {
    const eventTitles = {
      'new_high_score': `New High Score: ${score} in ${this.appName}!`,
      'game_over': `Game Over - Try Again in ${this.appName}!`,
      'achievement': `Achievement Unlocked in ${this.appName}!`,
      'level_complete': `Level Complete in ${this.appName}!`,
    };

    const eventDescriptions = {
      'new_high_score': `Amazing! You achieved a new high score of ${score} in Flappy Pi! Can you beat it?`,
      'game_over': `Game over! Your score was ${score}. Try again and beat your record in Flappy Pi!`,
      'achievement': `Congratulations! You unlocked an achievement in Flappy Pi! Keep playing to unlock more!`,
      'level_complete': `Excellent! You completed the level in Flappy Pi! Ready for the next challenge?`,
    };

    return {
      title: eventTitles[event as keyof typeof eventTitles] || `${this.appName} - ${event}`,
      description: eventDescriptions[event as keyof typeof eventDescriptions] || `Check out this ${event} in ${this.appName}!`,
      openGraph: {
        type: 'website',
        title: eventTitles[event as keyof typeof eventTitles] || `${this.appName} - ${event}`,
        description: eventDescriptions[event as keyof typeof eventDescriptions] || `Check out this ${event} in ${this.appName}!`,
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: `${event} in ${this.appName}`,
          },
        ],
        locale: 'en_US',
        countryName: 'United States',
      },
      twitter: {
        card: 'summary_large_image',
        title: eventTitles[event as keyof typeof eventTitles] || `${this.appName} - ${event}`,
        description: eventDescriptions[event as keyof typeof eventDescriptions] || `Check out this ${event} in ${this.appName}!`,
        creator: '@Wain2020',
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: `${event} in ${this.appName}`,
          },
        ],
      },
    };
  }

  /**
   * Get service status
   */
  getStatus(): {
    baseUrl: string;
    appName: string;
    defaultImage: string;
    supportedPages: string[];
  } {
    return {
      baseUrl: this.baseUrl,
      appName: this.appName,
      defaultImage: this.defaultImage,
      supportedPages: ['/', '/game', '/shop', '/leaderboard', '/about'],
    };
  }
}

// Export singleton instance
export const piNetMetadataService = new PiNetMetadataService();
export default piNetMetadataService; 