
import { useCallback, useRef, useEffect } from 'react';

interface BackgroundAsset {
  image: HTMLImageElement;
  loaded: boolean;
  src: string;
  isGradient?: boolean;
}

export const useResponsiveBackground = () => {
  const backgroundAssets = useRef<Map<string, BackgroundAsset>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preload background images with format fallbacks
  const preloadBackgroundImage = useCallback((key: string, basePath: string) => {
    const img = new Image();
    const formats = ['webp', 'png', 'jpg'];
    let formatIndex = 0;

    const tryNextFormat = () => {
      if (formatIndex >= formats.length) {
        console.warn(`Failed to load background image: ${key}, using gradient fallback`);
        // Create a fallback gradient background
        backgroundAssets.current.set(key, {
          image: null,
          loaded: true,
          src: 'gradient-fallback',
          isGradient: true
        });
        return;
      }

      const format = formats[formatIndex];
      const imagePath = `${basePath}.${format}`;
      
      img.crossOrigin = 'anonymous'; // Add CORS support
      img.src = imagePath;
      
      img.addEventListener('load', () => {
        backgroundAssets.current.set(key, {
          image: img,
          loaded: true,
          src: img.src,
          isGradient: false
        });
        console.log(`Background image loaded: ${key} (${format})`);
      }, { once: true });

      img.addEventListener('error', () => {
        formatIndex++;
        tryNextFormat();
      }, { once: true });
    };

    tryNextFormat();
  }, []);

  // Draw responsive background that covers the entire canvas
  const drawResponsiveBackground = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    backgroundKey: string,
    fallbackGradient?: string[]
  ) => {
    const asset = backgroundAssets.current.get(backgroundKey);
    
    if (asset && asset.loaded) {
      if (asset.isGradient) {
        // Fallback to gradient if image not loaded
        if (fallbackGradient && fallbackGradient.length >= 2) {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          fallbackGradient.forEach((color, index) => {
            gradient.addColorStop(index / (fallbackGradient.length - 1), color);
          });
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        // Calculate scaling to cover entire canvas while maintaining aspect ratio
        const imgAspect = asset.image.width / asset.image.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than canvas
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        
        ctx.drawImage(asset.image, offsetX, offsetY, drawWidth, drawHeight);
      }
    } else {
      // Fallback to gradient if image not loaded
      if (fallbackGradient && fallbackGradient.length >= 2) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        fallbackGradient.forEach((color, index) => {
          gradient.addColorStop(index / (fallbackGradient.length - 1), color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Setup responsive canvas sizing
  const setupResponsiveCanvas = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      // Get the actual display size
      const rect = container.getBoundingClientRect();
      
      // Set canvas size to match display size
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Ensure canvas style matches
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      console.log('Responsive canvas resized:', canvas.width, 'x', canvas.height);
    };

    // Initial resize
    resizeCanvas();
    
    // Listen for resize events
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    
    // Use ResizeObserver for more accurate detection
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(canvas.parentElement!);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('orientationchange', resizeCanvas);
        resizeObserver.disconnect();
      };
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, []);

  // Initialize common background assets
  useEffect(() => {
    console.log('Preloading background assets...');
    
    // Preload common game backgrounds
    preloadBackgroundImage('sky_day', '/assets/bg/sky_day');
    preloadBackgroundImage('sky_evening', '/assets/bg/sky_evening');
    preloadBackgroundImage('sky_night', '/assets/bg/sky_night');
    preloadBackgroundImage('clouds', '/assets/bg/clouds');
  }, [preloadBackgroundImage]);

  return {
    preloadBackgroundImage,
    drawResponsiveBackground,
    setupResponsiveCanvas,
    backgroundAssets: backgroundAssets.current
  };
};
