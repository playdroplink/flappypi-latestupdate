import React, { useState, useEffect, useRef } from 'react';
import { performanceOptimizer } from '@/utils/performanceOptimizer';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ParticleSystemProps {
  x: number;
  y: number;
  type: 'coin' | 'powerup' | 'explosion' | 'sparkle';
  onComplete?: () => void;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ x, y, type, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef(0);

  // Get particle configuration based on type and performance
  const getParticleConfig = () => {
    const settings = performanceOptimizer.getOptimizedSettings();
    const recommendedCount = performanceOptimizer.getRecommendedParticleCount();
    
    if (settings.reduceParticleEffects || recommendedCount === 0) {
      return { count: 0, size: 0, speed: 0 };
    }

    const baseConfig = {
      coin: { count: 8, size: 2, speed: 3 },
      powerup: { count: 12, size: 3, speed: 4 },
      explosion: { count: 15, size: 4, speed: 5 },
      sparkle: { count: 6, size: 1.5, speed: 2 }
    };

    const config = baseConfig[type];
    
    // Reduce particle count based on performance
    if (recommendedCount < 10) {
      config.count = Math.floor(config.count * 0.5);
    } else if (recommendedCount < 20) {
      config.count = Math.floor(config.count * 0.75);
    }

    return config;
  };

  // Initialize particles
  useEffect(() => {
    const config = getParticleConfig();
    
    if (config.count === 0) {
      setIsActive(false);
      onComplete?.();
      return;
    }

    const newParticles: Particle[] = [];
    const colors = {
      coin: ['#FFD700', '#FFA500', '#FFFF00'],
      powerup: ['#00FF00', '#00FFFF', '#FF00FF'],
      explosion: ['#FF4500', '#FF6347', '#FF8C00'],
      sparkle: ['#FFFFFF', '#FFFFE0', '#F0F8FF']
    };

    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 * i) / config.count;
      const speed = config.speed + Math.random() * 2;
      
      newParticles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: config.size + Math.random() * 2,
        opacity: 1,
        life: 0,
        maxLife: 60 + Math.random() * 30, // 1-1.5 seconds at 60fps
        color: colors[type][Math.floor(Math.random() * colors[type].length)]
      });
    }

    setParticles(newParticles);
  }, [x, y, type, onComplete]);

  // Animate particles
  useEffect(() => {
    if (!isActive || particles.length === 0) return;

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

      setParticles(prevParticles => {
        const updatedParticles = prevParticles.map(particle => {
          // Update position
          const newX = particle.x + particle.vx;
          const newY = particle.y + particle.vy;
          
          // Update life
          const newLife = particle.life + 1;
          
          // Update opacity based on life
          const newOpacity = 1 - (newLife / particle.maxLife);
          
          // Add gravity effect
          const newVy = particle.vy + 0.1;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            vy: newVy,
            life: newLife,
            opacity: Math.max(0, newOpacity)
          };
        });

        // Remove dead particles
        const aliveParticles = updatedParticles.filter(p => p.life < p.maxLife);
        
        if (aliveParticles.length === 0) {
          setIsActive(false);
          onComplete?.();
        }

        return aliveParticles;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, isActive, onComplete]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <svg width="100%" height="100%" className="w-full h-full">
        {particles.map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            opacity={particle.opacity}
            className="transition-opacity duration-100"
          />
        ))}
      </svg>
    </div>
  );
};

export default ParticleSystem; 