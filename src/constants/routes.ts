// Route constants for Flappy Pi app
export const ROUTES = {
  // Core App Routes
  ROOT: '/',
  HOME: '/home',
  
  // Game Routes
  PLAY: '/play',
  ENDLESS: '/endless',
  CHALLENGE: '/challenge',
  CLASSIC: '/classic',
  DINO_PI: '/dino-pi',
  DINO_PI_GAME: '/dino-pi-game',
  DINO_PI_CLASSIC: '/dino-pi/classic',
  DINO_PI_ENDLESS: '/dino-pi/endless',
  DINO_PI_CHALLENGE: '/dino-pi/challenge',
  SCREAM_PI: '/scream-pi',
  
  // Challenge Mode Specific Routes
  CHALLENGE_PRECISION: '/challenge/precision',
  CHALLENGE_TIMEBOMB: '/challenge/timebomb',
  CHALLENGE_GRAVITY_FLIP: '/challenge/gravity-flip',
  CHALLENGE_WIND_STORM: '/challenge/wind-storm',
  CHALLENGE_NIGHT_FLIGHT: '/challenge/night-flight',
  CHALLENGE_SPEED_RUSH: '/challenge/speed-rush',
  CHALLENGE_REVERSE: '/challenge/reverse',
  CHALLENGE_ICE_SLIDE: '/challenge/ice-slide',
  CHALLENGE_LAVA_ESCAPE: '/challenge/lava-escape',
  CHALLENGE_SHIELD_RUN: '/challenge/shield-run',
  CHALLENGE_MYSTERY: '/challenge/mystery',
  CHALLENGE_SCREAM_PI: '/challenge/scream-pi',
  
  // PvP Duel Routes
  PVP_DUELS: '/pvp-duels',
  PVP_DUEL_CREATE: '/pvp-duels/create',
  PVP_DUEL_ACCEPT: '/pvp-duels/accept',
  PVP_DUEL_PLAY: '/pvp-duels/play',
  PVP_DUEL_HISTORY: '/pvp-duels/history',
  PVP_TOURNAMENTS: '/pvp-tournaments',
  PVP_TOURNAMENT_DETAILS: '/pvp-tournaments',
  PVP_LEADERBOARD: '/pvp-leaderboard',
  
  // User Account Routes
  PROFILE: '/profile',
  ACCOUNT: '/account',
  WALLET: '/wallet',
  INVENTORY: '/inventory',
  GAME_HISTORY: '/game-history',
  PAYMENT_HISTORY: '/payment-history',
  PURCHASE_HISTORY: '/purchase-history',
  SUBSCRIPTION: '/subscription',
  SUBSCRIPTION_PLANS: '/subscription-plans',
  INVITE_FRIENDS: '/invite-friends',
  DAILY_REWARDS: '/daily-rewards',
  
  // Community & Social Routes
  COMMUNITY: '/community',
  SOCIAL_CHALLENGE: '/social-challenge',
  FIRESIDE_FORUM: '/fireside-forum',
  LEADERBOARD: '/leaderboard',
  
  // Content & Information Routes
  SHOP: '/shop',
  BLOG: '/blog',
  FLAPPY_PI_BLOG: '/flappy-pi-blog',
  DINO_PI_BLOG: '/dino-pi-blog',
  LANGUAGE_SHOWCASE: '/languages',
  PARTNERSHIP: '/partnership',
  STATUS: '/status',
  FAQ: '/faq',
  ACHIEVEMENTS: '/achievements',
  SETTINGS: '/settings',
  PRESS: '/press',
  REVIEWS: '/reviews',
  WHITEPAPER: '/whitepaper',
  DOWNLOAD: '/download',
  VIDEO: '/video',
  RESERVE: '/reserve',
  MERCH: '/merch',
  FLAPPY_PI_WEBSITE: '/flappy-pi-website',
  FLAPPY_PI_OFFICIAL: '/flappypiofficial',
  FULL_FLAPPY_WIKI: '/full-flappy-wiki',
  FLAPPY_WIKI: '/flappy-wiki',
  WIKI: '/wiki',
  
  // Pi Network Integration Routes
  PI_LOGIN: '/pi-login',
  PI_TEST: '/pi-test',
  PI_AUTH_TEST: '/pi-auth-test',
  PI_AUTH_DEBUG: '/pi-auth-debug',
  PI_SDK_TEST: '/pi-sdk-test',
  PI_USERNAME_TEST: '/pi-username-test',
  BROWSER_DETECTION: '/browser-detection',
  PERFORMANCE_MONITOR: '/performance-monitor',
  
  // Legal & Privacy Routes
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CONTACT: '/contact',
  ABOUT: '/about',
  
  // Admin Routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ANALYTICS: '/analytics',
  
  // Error Routes
  NOT_FOUND: '*',
  NOT_IN_PI_BROWSER: '/not-in-pi-browser'
} as const;

// Route categories for organization
export const ROUTE_CATEGORIES = {
  CORE: [ROUTES.ROOT, ROUTES.HOME],
  GAME: [ROUTES.PLAY, ROUTES.ENDLESS, ROUTES.CHALLENGE, ROUTES.CLASSIC],
  CHALLENGE_MODES: [
    ROUTES.CHALLENGE_PRECISION,
    ROUTES.CHALLENGE_TIMEBOMB,
    ROUTES.CHALLENGE_GRAVITY_FLIP,
    ROUTES.CHALLENGE_WIND_STORM,
    ROUTES.CHALLENGE_NIGHT_FLIGHT,
    ROUTES.CHALLENGE_SPEED_RUSH,
    ROUTES.CHALLENGE_REVERSE,
    ROUTES.CHALLENGE_ICE_SLIDE,
    ROUTES.CHALLENGE_LAVA_ESCAPE,
    ROUTES.CHALLENGE_SHIELD_RUN,
    ROUTES.CHALLENGE_MYSTERY,
    ROUTES.CHALLENGE_SCREAM_PI
  ],
  PVP_DUELS: [
    ROUTES.PVP_DUELS,
    ROUTES.PVP_DUEL_CREATE,
    ROUTES.PVP_DUEL_ACCEPT,
    ROUTES.PVP_DUEL_PLAY,
    ROUTES.PVP_DUEL_HISTORY,
    ROUTES.PVP_TOURNAMENTS,
    ROUTES.PVP_TOURNAMENT_DETAILS,
    ROUTES.PVP_LEADERBOARD
  ],
  USER: [ROUTES.PROFILE, ROUTES.ACCOUNT, ROUTES.WALLET, ROUTES.INVENTORY, ROUTES.PAYMENT_HISTORY, ROUTES.PURCHASE_HISTORY, ROUTES.SUBSCRIPTION, ROUTES.SUBSCRIPTION_PLANS, ROUTES.INVITE_FRIENDS, ROUTES.DAILY_REWARDS],
  COMMUNITY: [ROUTES.COMMUNITY, ROUTES.SOCIAL_CHALLENGE, ROUTES.FIRESIDE_FORUM, ROUTES.LEADERBOARD],
  CONTENT: [ROUTES.SHOP, ROUTES.BLOG, ROUTES.FLAPPY_PI_BLOG, ROUTES.LANGUAGE_SHOWCASE, ROUTES.PARTNERSHIP, ROUTES.STATUS, ROUTES.FAQ, ROUTES.ACHIEVEMENTS, ROUTES.SETTINGS, ROUTES.PRESS, ROUTES.REVIEWS, ROUTES.WHITEPAPER, ROUTES.DOWNLOAD, ROUTES.VIDEO, ROUTES.RESERVE, ROUTES.MERCH, ROUTES.FLAPPY_PI_WEBSITE, ROUTES.FULL_FLAPPY_WIKI, ROUTES.FLAPPY_WIKI, ROUTES.NOT_IN_PI_BROWSER],
  PI_NETWORK: [ROUTES.PI_LOGIN, ROUTES.PI_TEST, ROUTES.PI_SDK_TEST, ROUTES.BROWSER_DETECTION],
  LEGAL: [ROUTES.PRIVACY, ROUTES.TERMS, ROUTES.CONTACT, ROUTES.ABOUT],
  ADMIN: [ROUTES.ADMIN, ROUTES.ADMIN_DASHBOARD, ROUTES.ANALYTICS, ROUTES.PERFORMANCE_MONITOR]
} as const;

// Routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.PROFILE,
  ROUTES.ACCOUNT,
  ROUTES.WALLET,
  ROUTES.INVENTORY,
  ROUTES.GAME_HISTORY,
  ROUTES.PAYMENT_HISTORY,
  ROUTES.PURCHASE_HISTORY,
  ROUTES.SUBSCRIPTION,
  ROUTES.SUBSCRIPTION_PLANS,
  ROUTES.INVITE_FRIENDS,
  ROUTES.DAILY_REWARDS,
  ROUTES.ADMIN,
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ANALYTICS,
  ROUTES.PVP_DUEL_PLAY
] as const;

// Routes that should hide the menu
export const HIDE_MENU_ROUTES = [
  ROUTES.PLAY,
  ROUTES.ENDLESS,
  ROUTES.CHALLENGE,
  ROUTES.CLASSIC,
  ROUTES.CHALLENGE_PRECISION,
  ROUTES.CHALLENGE_TIMEBOMB,
  ROUTES.CHALLENGE_SCREAM_PI,
  ROUTES.PVP_DUEL_PLAY
] as const;

// Public standalone pages that don't require authentication
export const PUBLIC_ROUTES = [
  ROUTES.PRIVACY,
  ROUTES.TERMS,
  ROUTES.CONTACT,
  ROUTES.FAQ,
  ROUTES.ABOUT,
  ROUTES.NOT_IN_PI_BROWSER,
  ROUTES.BROWSER_DETECTION,
  // Add Pi authentication test routes as public
  ROUTES.PI_AUTH_TEST,
  ROUTES.PI_AUTH_DEBUG,
  ROUTES.PI_SDK_TEST,
  ROUTES.PI_USERNAME_TEST,
  ROUTES.PI_TEST,
  ROUTES.PERFORMANCE_MONITOR,
  // Add other test and debug routes
  '/pi-auth-test',
  '/pi-auth-debug',
  '/pi-sdk-test',
  '/pi-username-test',
  '/pi-test',
  '/performance-monitor'
] as const; 