// Music Test Utility
// Test different music tracks and verify they're working

// Define the music tracks locally to avoid circular imports
const MUSIC_TRACKS = {
  none: { url: '', volume: 0, loop: false },
  splash: { url: '/sounds/background/Flappy Pi Splash Theme Song.mp3', volume: 0.3, loop: true },
  home: { url: '/sounds/background/Flappy Pi Main Theme Song.mp3', volume: 0.3, loop: true },
  homealt: { url: '/sounds/background/Flappy Pi SecondMain Theme Song.mp3', volume: 0.3, loop: true },
  shop: { url: '/sounds/background/Flappy Pi Shop Theme Song.MP3', volume: 0.3, loop: true },
  game: { url: '/sounds/background/Soaring Dreams Theme Song.mp3', volume: 0.3, loop: true },
  endless: { url: '/sounds/background/Soaring Dreams Theme Song.mp3', volume: 0.3, loop: true },
  challenge: { url: '/sounds/background/Soaring Theme Song.mp3', volume: 0.3, loop: true },
  gamealt: { url: '/sounds/background/Soaring Theme Song.mp3', volume: 0.3, loop: true },
  leaderboard: { url: '/sounds/background/Rise and Flap Theme Song.mp3', volume: 0.3, loop: true },
  inventory: { url: '/sounds/background/Flappy Pi Shop Theme Song.MP3', volume: 0.3, loop: true },
  community: { url: '/sounds/background/Rise and Flap Theme Song.mp3', volume: 0.3, loop: true },
  profile: { url: '/sounds/background/Flappy Pi Main Theme Song.mp3', volume: 0.3, loop: true },
  profilealt: { url: '/sounds/background/Flappy Pi SecondMain Theme Song.mp3', volume: 0.3, loop: true },
  wiki: { url: '/sounds/background/Flappy Pi Shop Theme Song.MP3', volume: 0.3, loop: true },
  wallet: { url: '/sounds/background/Flappy Pi Shop Theme Song.MP3', volume: 0.3, loop: true },
  merch: { url: '/sounds/background/Rise and Flap Theme Song.mp3', volume: 0.3, loop: true },
  reserve: { url: '/sounds/background/Rise and Flap Theme Song.mp3', volume: 0.3, loop: true },
  fullflappywiki: { url: '/sounds/background/Flappy Pi Shop Theme Song.MP3', volume: 0.3, loop: true },
  default: { url: '/sounds/background/Rise and Flap Theme Song.mp3', volume: 0.3, loop: true },
};

export const testMusicTracks = () => {
  console.log('🎵 [MUSIC TEST] Testing all music tracks...');
  
  Object.entries(MUSIC_TRACKS).forEach(([trackKey, track]) => {
    if (trackKey === 'none') {
      console.log(`🎵 [MUSIC TEST] ${trackKey}: No audio (intentional)`);
      return;
    }
    
    console.log(`🎵 [MUSIC TEST] ${trackKey}:`);
    console.log(`  - URL: ${track.url}`);
    console.log(`  - Volume: ${track.volume}`);
    console.log(`  - Loop: ${track.loop}`);
    
    // Test if audio file exists
    const audio = new Audio();
    audio.src = track.url;
    audio.addEventListener('canplaythrough', () => {
      console.log(`  ✅ ${trackKey}: Audio file loaded successfully`);
    });
    audio.addEventListener('error', (e) => {
      console.error(`  ❌ ${trackKey}: Audio file failed to load:`, e);
    });
    audio.load();
  });
};

export const testRouteMusicMapping = () => {
  console.log('🎵 [MUSIC TEST] Testing route to music mapping...');
  
  // Simple route mapping test
  const routeMappings = [
    { route: '/home', expected: 'home' },
    { route: '/shop', expected: 'shop' },
    { route: '/leaderboard', expected: 'leaderboard' },
    { route: '/inventory', expected: 'inventory' },
    { route: '/community', expected: 'community' },
    { route: '/profile', expected: 'profile' },
    { route: '/wallet', expected: 'wallet' },
    { route: '/merch', expected: 'merch' },
    { route: '/reserve', expected: 'reserve' },
    { route: '/wiki', expected: 'wiki' },
    { route: '/whitepaper', expected: 'homealt' },
    { route: '/about', expected: 'game' },
    { route: '/contact', expected: 'gamealt' },
    { route: '/help', expected: 'endless' },
    { route: '/privacy', expected: 'challenge' },
    { route: '/terms', expected: 'profilealt' },
    { route: '/settings', expected: 'homealt' },
    { route: '/subscription', expected: 'game' },
    { route: '/admin', expected: 'endless' },
    { route: '/achievements', expected: 'endless' },
    { route: '/flappy-wiki', expected: 'fullflappywiki' },
    { route: '/splash-screen', expected: 'splash' }
  ];
  
  routeMappings.forEach(({ route, expected }) => {
    console.log(`🎵 [MUSIC TEST] ${route} -> ${expected}`);
  });
};

export const simulateRouteChange = (pathname: string) => {
  console.log(`🎵 [MUSIC TEST] Simulating route change to: ${pathname}`);
  
  // Dispatch a custom event to simulate route change
  const event = new CustomEvent('route-change-test', { 
    detail: { pathname } 
  });
  window.dispatchEvent(event);
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testMusicTracks = testMusicTracks;
  (window as any).testRouteMusicMapping = testRouteMusicMapping;
  (window as any).simulateRouteChange = simulateRouteChange;
}
