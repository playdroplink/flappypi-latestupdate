import React, { useState, useEffect, useRef } from 'react';
import { performanceOptimizer } from '@/utils/performanceOptimizer';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  phase: number;
}

interface StarFieldProps {
  width: number;
  height: number;
  mode?: 'classic' | 'endless' | 'challenge';
}

const StarField: React.FC<StarFieldProps> = ({ width, height, mode = 'classic' }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [shouldRender, setShouldRender] = useState(true);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef(0);

  // Initialize stars based on performance
  useEffect(() => {
    const settings = performanceOptimizer.getOptimizedSettings();
    const recommendedCount = performanceOptimizer.getRecommendedStarCount();
    
    if (settings.limitBackgroundObjects || recommendedCount === 0) {
      setStars([]);
      setShouldRender(false);
      return;
    }

    setShouldRender(true);
    
    // Create stars based on performance recommendations
    const newStars: Star[] = [];
    const count = Math.min(recommendedCount, 25); // Cap at 25 stars max
    
    for (let i = 0; i < count; i++) {
      newStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5, // 0.5 to 2px
        opacity: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
        speed: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
        phase: Math.random() * Math.PI * 2
      });
    }
    
    setStars(newStars);
  }, [width, height, mode]);

  // Animate stars
  useEffect(() => {
    if (!shouldRender || stars.length === 0) return;

    const animate = (currentTime: number) => {
      // Check if we should skip this frame for performance
      if (performanceOptimizer.shouldSkipFrame()) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Throttle updates for better performance
      if (currentTime - lastUpdateRef.current < 16) { // ~60fps
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastUpdateRef.current = currentTime;

      setStars(prevStars => 
        prevStars.map(star => {
          // Move star to the left
          let newX = star.x - star.speed;
          
          // Wrap around if star goes off screen
          if (newX < -10) {
            newX = width + 10;
            star.y = Math.random() * height;
          }
          
          // Add subtle vertical movement
          const newY = star.y + Math.sin(currentTime * 0.001 + star.phase) * 0.5;
          
          return {
            ...star,
            x: newX,
            y: newY
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stars, shouldRender, width, height]);

  // Update star count when performance changes
  useEffect(() => {
    const handlePerformanceChange = () => {
      const settings = performanceOptimizer.getOptimizedSettings();
      const recommendedCount = performanceOptimizer.getRecommendedStarCount();
      
      if (settings.limitBackgroundObjects || recommendedCount === 0) {
        setShouldRender(false);
        setStars([]);
      } else if (!shouldRender) {
        setShouldRender(true);
        // Reinitialize stars
        const newStars: Star[] = [];
        const count = Math.min(recommendedCount, 25);
        
        for (let i = 0; i < count; i++) {
          newStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.8 + 0.2,
            speed: Math.random() * 0.5 + 0.1,
            phase: Math.random() * Math.PI * 2
          });
        }
        
        setStars(newStars);
      }
    };

    // Check for performance changes every 2 seconds
    const interval = setInterval(handlePerformanceChange, 2000);
    return () => clearInterval(interval);
  }, [shouldRender, width, height]);

  if (!shouldRender || stars.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg width={width} height={height} className="w-full h-full">
        <defs>
          <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {stars.map((star, index) => (
          <circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="url(#starGradient)"
            opacity={star.opacity}
            className="transition-opacity duration-300"
          />
        ))}
      </svg>
    </div>
  );
};

export default StarField; 