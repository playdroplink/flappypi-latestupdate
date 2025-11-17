// PiNet Metadata API
// Based on official PiNet metadata documentation
// https://pinet.com/developer/metadata

// Core PiNet Metadata DTO
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

// Default HTML meta tags types
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

// OpenGraph supporting types
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

// Twitter supporting types
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

// PiNet Metadata Service
export class PiNetMetadataService {
  /**
   * Generate metadata for a specific pathname
   * @param pathname The pathname to generate metadata for
   * @returns PiNetMetadataDTO object
   */
  static generateMetadata(pathname: string): PiNetMetadataDTO {
    // Default metadata for the app
    const baseMetadata: PiNetMetadataDTO = {
      title: "Flappy Pi - Pi Network Game",
      description: "Play the classic Flappy Bird game on Pi Network! Earn Pi coins, compete with friends, and enjoy endless fun in this blockchain-powered gaming experience.",
      keywords: ["flappy bird", "pi network", "blockchain game", "pi coins", "mobile game", "casual game"],
      creator: "Flappy Pi Team",
      publisher: "Flappy Pi",
      category: "Game",
      openGraph: {
        type: "website",
        title: "Flappy Pi - Pi Network Game",
        description: "Play the classic Flappy Bird game on Pi Network! Earn Pi coins, compete with friends, and enjoy endless fun in this blockchain-powered gaming experience.",
                 images: [
           {
             url: "https://www.flappypi.fun/og-image.png",
             width: 1200,
             height: 630,
             alt: "Flappy Pi Game Screenshot"
           }
         ],
        locale: "en_US"
      },
      twitter: {
        card: "summary_large_image",
        title: "Flappy Pi - Pi Network Game",
        description: "Play the classic Flappy Bird game on Pi Network! Earn Pi coins, compete with friends, and enjoy endless fun in this blockchain-powered gaming experience.",
                 images: [
           {
             url: "https://www.flappypi.fun/twitter-image.png",
             width: 1200,
             height: 630,
             alt: "Flappy Pi Game Screenshot"
           }
         ]
      },
      icons: {
                 icon: [
           {
             url: "https://www.flappypi.fun/favicon.ico",
             sizes: "32x32",
             type: "image/x-icon"
           },
           {
             url: "https://www.flappypi.fun/icon-192.png",
             sizes: "192x192",
             type: "image/png"
           },
           {
             url: "https://www.flappypi.fun/icon-512.png",
             sizes: "512x512",
             type: "image/png"
           }
         ],
         apple: [
           {
             url: "https://www.flappypi.fun/apple-touch-icon.png",
             sizes: "180x180",
             type: "image/png"
           }
         ]
      }
    };

    // Path-specific metadata
    switch (pathname) {
      case "/":
        return {
          ...baseMetadata,
          title: "Flappy Pi - Home",
          description: "Welcome to Flappy Pi! Start your journey in the world's first Pi Network-powered Flappy Bird game. Play, earn, and compete with the Pi community."
        };

      case "/game":
        return {
          ...baseMetadata,
          title: "Play Flappy Pi - Game",
          description: "Jump into the action! Play Flappy Pi and navigate through pipes while earning Pi coins. Challenge yourself and beat your high score!",
          openGraph: {
            ...baseMetadata.openGraph,
            title: "Play Flappy Pi - Game",
            description: "Jump into the action! Play Flappy Pi and navigate through pipes while earning Pi coins. Challenge yourself and beat your high score!"
          }
        };

      case "/shop":
        return {
          ...baseMetadata,
          title: "Flappy Pi Shop - Buy Items",
          description: "Visit the Flappy Pi shop to purchase power-ups, skins, and special items with Pi coins. Enhance your gaming experience!",
          openGraph: {
            ...baseMetadata.openGraph,
            title: "Flappy Pi Shop - Buy Items",
            description: "Visit the Flappy Pi shop to purchase power-ups, skins, and special items with Pi coins. Enhance your gaming experience!"
          }
        };

      case "/leaderboard":
        return {
          ...baseMetadata,
          title: "Flappy Pi Leaderboard - Top Players",
          description: "Check out the top players on Flappy Pi leaderboard! See who has the highest scores and compete to reach the top of the rankings.",
          openGraph: {
            ...baseMetadata.openGraph,
            title: "Flappy Pi Leaderboard - Top Players",
            description: "Check out the top players on Flappy Pi leaderboard! See who has the highest scores and compete to reach the top of the rankings."
          }
        };

      case "/profile":
        return {
          ...baseMetadata,
          title: "Flappy Pi Profile - Your Stats",
          description: "View your Flappy Pi profile and statistics. Track your progress, achievements, and Pi coin earnings in your gaming journey.",
          openGraph: {
            ...baseMetadata.openGraph,
            title: "Flappy Pi Profile - Your Stats",
            description: "View your Flappy Pi profile and statistics. Track your progress, achievements, and Pi coin earnings in your gaming journey."
          }
        };

      case "/about":
        return {
          ...baseMetadata,
          title: "About Flappy Pi - Game Information",
          description: "Learn more about Flappy Pi, the world's first Pi Network-powered Flappy Bird game. Discover the features, gameplay, and Pi integration.",
          openGraph: {
            ...baseMetadata.openGraph,
            title: "About Flappy Pi - Game Information",
            description: "Learn more about Flappy Pi, the world's first Pi Network-powered Flappy Bird game. Discover the features, gameplay, and Pi integration."
          }
        };

      default:
        // For unknown paths, return base metadata
        return baseMetadata;
    }
  }

  /**
   * Handle PiNet metadata request
   * @param pathname The pathname from the request
   * @returns PiNetMetadataDTO object
   */
  static handleMetadataRequest(pathname: string): PiNetMetadataDTO {
    try {
      console.log('📄 PiNet metadata request for pathname:', pathname);
      const metadata = this.generateMetadata(pathname);
      console.log('✅ Generated metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('❌ Error generating metadata:', error);
      // Return fallback metadata
      return {
        title: "Flappy Pi - Pi Network Game",
        description: "Play the classic Flappy Bird game on Pi Network!",
        openGraph: {
          type: "website",
          title: "Flappy Pi - Pi Network Game",
          description: "Play the classic Flappy Bird game on Pi Network!"
        }
      };
    }
  }
}

// All types are already exported above
