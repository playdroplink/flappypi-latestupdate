
import { useEffect, useRef } from 'react';

export const useCanvasSetup = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      console.log('Resizing canvas:', { windowWidth, windowHeight });
      
      // Set canvas to full window size
      canvas.width = windowWidth;
      canvas.height = windowHeight;
      canvas.style.width = `${windowWidth}px`;
      canvas.style.height = `${windowHeight}px`;
      canvas.style.left = '0px';
      canvas.style.top = '0px';
      
      console.log('Canvas setup complete:', {
        width: canvas.width,
        height: canvas.height
      });
    };

    resizeCanvas();
    
    // Add resize listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, []);

  return { canvasRef };
};
