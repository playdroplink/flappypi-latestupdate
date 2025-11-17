import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { performanceOptimizer } from '../../utils/gamePerformanceOptimizer';

interface OptimizedGameRendererProps {
  width: number;
  height: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onCanvasReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
}

export const OptimizedGameRenderer: React.FC<OptimizedGameRendererProps> = ({
  width,
  height,
  children,
  className,
  style,
  onCanvasReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const renderQueueRef = useRef<Array<() => void>>([]);
  const isRenderingRef = useRef(false);

  // Optimize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Get context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;

    // Apply performance optimizations
    performanceOptimizer.optimizeCanvas(canvas);

    // Notify parent component
    onCanvasReady?.(canvas, ctx);

    console.log('🎨 Optimized canvas initialized:', { width, height });
  }, [width, height, onCanvasReady]);

  // Optimized rendering queue
  const queueRender = useCallback((renderFn: () => void) => {
    renderQueueRef.current.push(renderFn);
    
    if (!isRenderingRef.current) {
      isRenderingRef.current = true;
      requestAnimationFrame(processRenderQueue);
    }
  }, []);

  const processRenderQueue = useCallback(() => {
    if (renderQueueRef.current.length === 0) {
      isRenderingRef.current = false;
      return;
    }

    const ctx = ctxRef.current;
    if (!ctx) return;

    // Get optimized settings
    const settings = performanceOptimizer.getOptimizedSettings();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Process all queued render functions
    while (renderQueueRef.current.length > 0) {
      const renderFn = renderQueueRef.current.shift();
      if (renderFn) {
        try {
          renderFn();
        } catch (error) {
          console.error('❌ Error in render function:', error);
        }
      }
    }

    isRenderingRef.current = false;
  }, [width, height]);

  // Optimized drawing methods
  const drawOptimized = useMemo(() => ({
    // Optimized rectangle drawing
    rect: (x: number, y: number, w: number, h: number, color: string, alpha: number = 1) => {
      queueRender(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
      });
    },

    // Optimized circle drawing
    circle: (x: number, y: number, radius: number, color: string, alpha: number = 1) => {
      queueRender(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    },

    // Optimized image drawing
    image: (img: HTMLImageElement, x: number, y: number, w: number, h: number, alpha: number = 1) => {
      queueRender(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      });
    },

    // Optimized text drawing
    text: (text: string, x: number, y: number, font: string, color: string, alpha: number = 1) => {
      queueRender(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
      });
    },

    // Optimized gradient drawing
    gradient: (x: number, y: number, w: number, h: number, colors: string[], alpha: number = 1) => {
      queueRender(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
        colors.forEach((color, index) => {
          gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
      });
    },

    // Batch multiple draw operations
    batch: (drawOperations: Array<() => void>) => {
      queueRender(() => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.save();
        drawOperations.forEach(op => {
          try {
            op();
          } catch (error) {
            console.error('❌ Error in batch operation:', error);
          }
        });
        ctx.restore();
      });
    }
  }), [queueRender]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    return performanceOptimizer.getPerformanceMetrics();
  }, []);

  const getOptimizedSettings = useCallback(() => {
    return performanceOptimizer.getOptimizedSettings();
  }, []);

  // Expose canvas and context to children
  const contextValue = useMemo(() => ({
    canvas: canvasRef.current,
    ctx: ctxRef.current,
    draw: drawOptimized,
    queueRender,
    getPerformanceMetrics,
    getOptimizedSettings,
    width,
    height
  }), [drawOptimized, queueRender, getPerformanceMetrics, getOptimizedSettings, width, height]);

  return (
    <div className={className} style={style}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          ...style
        }}
      />
      {children && React.cloneElement(children as React.ReactElement, { renderer: contextValue })}
    </div>
  );
};

// Context for sharing renderer
export const GameRendererContext = React.createContext<any>(null);

export const useGameRenderer = () => {
  const context = React.useContext(GameRendererContext);
  if (!context) {
    throw new Error('useGameRenderer must be used within a GameRendererContext.Provider');
  }
  return context;
};
