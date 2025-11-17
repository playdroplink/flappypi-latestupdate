/**
 * Image Validation and Error Prevention Utilities
 * Ensures no broken images appear in the Flappy Pi application
 */

// List of all critical images that must be available
export const CRITICAL_IMAGES = [
  // Bird images (GIF versions - PRIMARY - from birds2 folder)
  '/birds2/bird_0.gif',
  '/birds2/bird_1.gif',
  '/birds2/bird_2.gif',
  '/birds2/bird_3.gif',
  '/birds2/bird_4.gif',
  '/birds2/bird_5.gif',
  '/birds2/bird_6.gif',
  '/birds2/bird_7.gif',
  '/birds2/bird_8.gif',
  '/birds2/bird_9.gif',
  '/birds2/bird_10.gif',
  '/birds2/bird_11.gif',
  '/birds2/bird_12.gif',
  
  // NPC images
  '/npc gif/npc-0.gif.gif',
  '/npc gif/npc-1.gif.gif',
  '/npc gif/npc-2.gif.gif',
  '/npc gif/npc-3.gif.gif',
  '/npc gif/npc-4.gif.gif',
  '/npc gif/npc-5.gif.gif',
  '/npc gif/npc-6.gif.gif',
  '/npc gif/npc-7.gif.gif',
  '/npc gif/npc-8.gif.gif',
  '/npc gif/npc-9.gif.gif',
  '/npc gif/npc-10.gif.gif',
  '/npc gif/npc-11.gif.gif',
  '/npc gif/npc-12.gif.gif',
  
  // Powerup images
  '/powerups/Shield.png',
  '/powerups/Coin Magnet.png',
  '/powerups/Extra life.png',
  '/powerups/turbo-start.png',
  '/powerups/2x Coin Multiplier.png',
  
  // Box images
  '/boxes/basic-box.png',
  '/boxes/rare-box.png',
  '/boxes/legendary-box.png',
  
  // UI images
  '/flappy-logo.png',
  '/flappycoins.png',
  '/pi-logo.png',
  '/placeholder.svg',
  
  // Flappy Pi GIFs
  '/flappy pi gif/flappy-2.gif.gif',
  
  // Ad Free and Bob Man GIFs
  '/flappy pi gif 2/adfree.gif',
  '/flappy pi gif 2/bobman.gif',
  
  // Subscription images
  '/npc gif/subscriptionplanbutton.gif.gif',
  '/npc gif/watchads.gif.gif',
  '/npc gif/adfree.gif.gif',
];

// Fallback mapping for common image types
export const FALLBACK_MAPPING: Record<string, string> = {
  // Bird fallbacks (primary: birds2 GIF, fallback: birds PNG)
  'bird': '/birds2/bird_0.gif',
  'bird_0': '/birds2/bird_0.gif',
  'bird_1': '/birds2/bird_1.gif',
  'bird_2': '/birds2/bird_2.gif',
  'bird_3': '/birds2/bird_3.gif',
  'bird_4': '/birds2/bird_4.gif',
  'bird_5': '/birds2/bird_5.gif',
  'bird_6': '/birds2/bird_6.gif',
  'bird_7': '/birds2/bird_7.gif',
  'bird_8': '/birds2/bird_8.gif',
  'bird_9': '/birds2/bird_9.gif',
  'bird_10': '/birds2/bird_10.gif',
  'bird_11': '/birds2/bird_11.gif',
  'bird_12': '/birds2/bird_12.gif',
  
  // NPC fallbacks
  'npc': '/flappy pi gif/flappy-2.gif.gif',
  'npc-0': '/flappy pi gif/flappy-2.gif.gif',
  'npc-1': '/flappy pi gif/flappy-2.gif.gif',
  'npc-2': '/flappy pi gif/flappy-2.gif.gif',
  'npc-3': '/flappy pi gif/flappy-2.gif.gif',
  'npc-4': '/flappy pi gif/flappy-2.gif.gif',
  'npc-5': '/flappy pi gif/flappy-2.gif.gif',
  'npc-6': '/flappy pi gif/flappy-2.gif.gif',
  'npc-7': '/flappy pi gif/flappy-2.gif.gif',
  'npc-8': '/flappy pi gif/flappy-2.gif.gif',
  'npc-9': '/flappy pi gif/flappy-2.gif.gif',
  'npc-10': '/flappy pi gif/flappy-2.gif.gif',
  'npc-11': '/flappy pi gif/flappy-2.gif.gif',
  'npc-12': '/flappy pi gif/flappy-2.gif.gif',
  
  // Powerup fallbacks
  'shield': '/powerups/Shield.png',
  'coin_magnet': '/powerups/Coin Magnet.png',
  'extra_life': '/powerups/Extra life.png',
  'turbo_start': '/powerups/turbo-start.png',
  'coin_multiplier': '/powerups/2x Coin Multiplier.png',
  
  // Box fallbacks
  'basic-box': '/boxes/basic-box.png',
  'rare-box': '/boxes/rare-box.png',
  'legendary-box': '/boxes/legendary-box.png',
  
  // Default fallbacks
  'default': '/placeholder.svg',
  'logo': '/flappy pi gif/flappy-2.gif.gif',
  'coin': '/flappycoins.png',
  'pi': '/pi-logo.png',
  'bird-0': '/flappy pi gif/flappy-2.gif.gif',
  
  // Ad Free and Bob Man fallbacks
  'adfree': '/flappy pi gif 2/adfree.gif',
  'bobman': '/flappy pi gif 2/bobman.gif',
};

/**
 * Get fallback image for a given image path or type
 */
export function getFallbackImage(src: string, type?: string): string {
  // If src is invalid, return default fallback
  if (!src || typeof src !== 'string') {
    return FALLBACK_MAPPING['default'] || '/placeholder.svg';
  }
  
  // If it's a direct path, try to extract the type
  if (src.includes('/birds/') || src.includes('/birds2/')) {
    return FALLBACK_MAPPING['bird'] || '/birds2/bird_0.gif';
  }
  if (src.includes('/npc gif/')) {
    return FALLBACK_MAPPING['npc'] || '/flappy pi gif/flappy-2.gif.gif';
  }
  if (src.includes('/flappy pi gif 2/')) {
    return FALLBACK_MAPPING['adfree'] || '/flappy pi gif 2/adfree.gif';
  }
  if (src.includes('/powerups/')) {
    return FALLBACK_MAPPING['shield'] || '/placeholder.svg';
  }
  if (src.includes('/boxes/')) {
    return FALLBACK_MAPPING['basic-box'] || '/placeholder.svg';
  }
  
  // Use type-based fallback
  if (type && FALLBACK_MAPPING[type]) {
    return FALLBACK_MAPPING[type];
  }
  
  // Default fallback
  return FALLBACK_MAPPING['default'] || '/placeholder.svg';
}

/**
 * Validate if an image path exists and is accessible
 */
export async function validateImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Preload critical images to ensure they're available
 */
export async function preloadCriticalImages(): Promise<void> {
  console.log('🖼️ Preloading critical images...');
  
  const preloadPromises = CRITICAL_IMAGES.map(async (src) => {
    const isValid = await validateImage(src);
    if (!isValid) {
      console.warn(`⚠️ Critical image not found: ${src}`);
    } else {
      console.log(`✅ Critical image loaded: ${src}`);
    }
    return { src, isValid };
  });
  
  const results = await Promise.all(preloadPromises);
  const failedImages = results.filter(r => !r.isValid);
  
  if (failedImages.length > 0) {
    console.error('❌ Failed to load critical images:', failedImages.map(r => r.src));
  } else {
    console.log('✅ All critical images loaded successfully');
  }
}

/**
 * Get safe image source with fallback
 */
export function getSafeImageSrc(src: string, type?: string): string {
  // If src is empty or invalid, return fallback immediately
  if (!src || src === '' || src === 'undefined' || src === 'null') {
    return getFallbackImage(src, type);
  }
  
  // Return the original src (fallback will be handled by ErrorFreeImage component)
  return src;
}

/**
 * Check if an image is a valid format
 */
export function isValidImageFormat(src: string): boolean {
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  return validExtensions.some(ext => src.toLowerCase().endsWith(ext));
}

/**
 * Get image dimensions safely
 */
export function getImageDimensions(src: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
