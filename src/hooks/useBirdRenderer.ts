import { useCallback, useRef, useEffect } from 'react';

interface UseBirdRendererProps {
  birdSkin: string;
}

export const useBirdRenderer = ({ birdSkin }: UseBirdRendererProps) => {
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const loadedImages = useRef<Set<string>>(new Set());

  const birdImages = {
    'default': '/birds2/bird_0.gif',
    'bird-0': '/birds2/bird_0.gif',
    'bird-1': '/birds2/bird_1.gif',
    'bird-2': '/birds2/bird_2.gif',
    'bird-3': '/birds2/bird_3.gif',
    'bird-4': '/birds2/bird_4.gif',
    'bird-5': '/birds2/bird_5.gif',
    'bird-6': '/birds2/bird_6.gif',
    'bird-7': '/birds2/bird_7.gif',
    'bird-8': '/birds2/bird_8.gif',
    'bird-9': '/birds2/bird_9.gif',
    'bird-10': '/birds2/bird_10.gif',
    'bird-11': '/birds2/bird_11.gif',
    'bird-12': '/birds2/bird_12.gif',
    // Legacy support
    'green': '/birds2/bird_2.gif', 
    'red': '/birds2/bird_1.gif',
    'elite-violet': '/birds2/bird_3.gif',
    'elite-eagle': '/birds2/bird_5.gif',
    'elite-royal': '/birds2/bird_6.gif',
  };

  // Preload images with improved error handling
  useEffect(() => {
    const preloadImage = (src: string, key: string) => {
      if (!imageCache.current[key] && !loadedImages.current.has(key)) {
        console.log(`Preloading bird image: ${key} from ${src}`);
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Help with CORS issues
        img.onload = () => {
          loadedImages.current.add(key);
          console.log(`✓ Bird image loaded successfully: ${key}`);
        };
        img.onerror = (error) => {
          console.error(`✗ Failed to load bird image: ${src} for key: ${key}`, error);
          console.error('Available bird images:', Object.keys(birdImages));
          // Try fallback to default immediately
          if (key !== 'default' && birdImages['default']) {
            console.log(`→ Using fallback image: ${birdImages['default']} for key: ${key}`);
            const fallbackImg = new Image();
            fallbackImg.crossOrigin = 'anonymous';
            fallbackImg.onload = () => {
              console.log(`✓ Fallback image loaded for: ${key}`);
              loadedImages.current.add(key);
            };
            fallbackImg.onerror = () => {
              console.error(`✗ Even fallback failed for: ${key}`);
            };
            fallbackImg.src = birdImages['default'];
            imageCache.current[key] = fallbackImg;
          }
        };
        img.src = src;
        imageCache.current[key] = img;
      }
    };

    // Preload default image first to ensure it's available as fallback
    preloadImage(birdImages['default'], 'default');
    
    // Then preload all other bird images
    Object.entries(birdImages).forEach(([key, src]) => {
      if (key !== 'default') {
        setTimeout(() => preloadImage(src, key), 100); // Small delay to let default load first
      }
    });
  }, []);

  // Preload the current bird skin if it changes
  useEffect(() => {
    const src = birdImages[birdSkin] || birdImages['default'];
    const key = birdSkin || 'default';
    
    if (!imageCache.current[key]) {
      const img = new Image();
      img.onload = () => {
        loadedImages.current.add(key);
        console.log(`Current bird skin loaded: ${key}`);
      };
      img.onerror = () => {
        console.error(`Failed to load current bird skin: ${src}`);
      };
      img.src = src;
      imageCache.current[key] = img;
    }
  }, [birdSkin]);

  const getBirdImage = useCallback(() => {
    const key = birdSkin || 'default';
    const image = imageCache.current[key] || imageCache.current['default'];
    
    if (!image) {
      console.warn(`No image found for bird skin: ${key}, birdSkin: ${birdSkin}`);
      console.warn('Available cached images:', Object.keys(imageCache.current));
    }
    
    return image;
  }, [birdSkin]);

  const renderBird = useCallback((
    ctx: CanvasRenderingContext2D,
    bird: any,
    frameCount: number,
    gameStarted: boolean,
    difficulty: any
  ) => {
    // Safety check for bird object
    if (!bird) {
      console.warn('Bird object is null or undefined');
      return;
    }
    
    const BIRD_SIZE = 32;
    const birdImage = getBirdImage();
    
    // Enhanced animation based on game state
    let flapOffset = 0;
    if (gameStarted) {
      flapOffset = Math.sin(frameCount * 0.3) * 2; // Flap animation when game started
    } else {
      flapOffset = Math.sin(frameCount * 0.15) * 3; // Slower idle animation
    }
    
    // Ensure bird stays in safe spawn position until game starts - with safety checks
    const birdX = gameStarted ? (bird.x || 80) : 80;
    const birdY = gameStarted ? ((bird.y || 200) + flapOffset) : ((bird.y || 200) + flapOffset);
    
    ctx.save();
    
    // Add special glow effects for special birds - with null check
    if (birdSkin && (birdSkin.startsWith('elite-') || birdSkin === 'bird-10' || birdSkin.includes('golden'))) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (birdSkin && (birdSkin === 'bird-6' || birdSkin === 'bird-11')) {
      // Special effects for Phoenix and Dragon
      ctx.shadowColor = '#FF4500';
      ctx.shadowBlur = 25;
    } else if (difficulty && difficulty.timeOfDay === 'night') {
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 12;
    }
    
    ctx.translate(birdX, birdY);
    ctx.rotate((bird.rotation || 0) * Math.PI / 180);
    
    // Draw the bird image or fallback
    if (birdImage && birdImage.complete && birdImage.naturalHeight !== 0) {
      try {
        ctx.drawImage(birdImage, -BIRD_SIZE/2, -BIRD_SIZE/2, BIRD_SIZE, BIRD_SIZE);
      } catch (error) {
        console.error('Error drawing bird image:', error);
        // Fallback to circle if image drawing fails
        renderBirdFallback(ctx, BIRD_SIZE);
      }
    } else {
      // Render fallback circle until image loads
      renderBirdFallback(ctx, BIRD_SIZE);
    }
    
    ctx.restore();
  }, [getBirdImage, birdSkin]);

  const renderBirdFallback = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Add an eye to make it look more bird-like
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(size / 6, -size / 6, 3, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  return { renderBird };
};
