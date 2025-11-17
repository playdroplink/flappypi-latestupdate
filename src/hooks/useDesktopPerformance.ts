import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  isHardwareAccelerated: boolean;
}

export const useDesktopPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    isHardwareAccelerated: false
  });
  
  const [isDesktop, setIsDesktop] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Check if device is desktop
  useEffect(() => {
    const checkDevice = () => {
      const isDesktopDevice = window.innerWidth >= 1024 && !('ontouchstart' in window);
      setIsDesktop(isDesktopDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // FPS monitoring
  const measureFPS = useCallback(() => {
    if (!isDesktop) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    const measureFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      frameCount++;
      
      if (frameCount % 60 === 0) {
        fps = Math.round(1000 / (deltaTime / frameCount));
        frameCount = 0;
        lastTime = currentTime;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          frameTime: deltaTime / 60
        }));
      }
      
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }, [isDesktop]);

  // Memory usage monitoring
  const measureMemory = useCallback(() => {
    if (!isDesktop) return;

    const measure = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage
        }));
      }
    };

    measure();
    const interval = setInterval(measure, 1000);
    return () => clearInterval(interval);
  }, [isDesktop]);

  // Hardware acceleration detection
  const detectHardwareAcceleration = useCallback(() => {
    if (!isDesktop) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const isHardwareAccelerated = !!gl;
    
    setMetrics(prev => ({
      ...prev,
      isHardwareAccelerated
    }));
  }, [isDesktop]);

  // Performance optimizations for desktop
  const optimizeForDesktop = useCallback(() => {
    if (!isDesktop) return;

    // Enable hardware acceleration
    const style = document.createElement('style');
    style.textContent = `
      .desktop-optimized {
        transform: translateZ(0);
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      .desktop-optimized * {
        transform: translateZ(0);
      }
      
      /* Desktop-specific performance optimizations */
      @media (min-width: 1024px) {
        .desktop-optimized {
          /* Enable hardware acceleration */
          transform: translate3d(0, 0, 0);
          will-change: transform, opacity;
        }
        
        /* Optimize animations for desktop */
        .desktop-optimized * {
          transform: translate3d(0, 0, 0);
        }
      }
    `;
    document.head.appendChild(style);
  }, [isDesktop]);

  // Initialize performance monitoring
  useEffect(() => {
    if (!isDesktop) return;

    measureFPS();
    const memoryCleanup = measureMemory();
    detectHardwareAcceleration();
    optimizeForDesktop();

    // Toggle metrics with F2
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        setShowMetrics(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (memoryCleanup) memoryCleanup();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDesktop, measureFPS, measureMemory, detectHardwareAcceleration, optimizeForDesktop]);

  return {
    metrics,
    isDesktop,
    showMetrics,
    setShowMetrics
  };
};
