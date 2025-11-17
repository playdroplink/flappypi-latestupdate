import { useCallback, useRef } from 'react';

interface LevelVisual {
  text?: string;
  particles?: 'coins' | 'hearts' | 'stars';
  backgroundEffect?: 'flash' | 'shake' | 'glow';
  duration?: number;
}

const levelVisuals: Record<number, LevelVisual> = {
  1: { text: "Welcome to Flappy Pi!", backgroundEffect: 'glow', duration: 3000 },
  3: { text: "You're improving!", particles: 'coins', duration: 2500 },
  5: { text: "Heart bonus unlocked!", particles: 'hearts', backgroundEffect: 'flash', duration: 3000 },
  7: { text: "Can you beat the legend?", particles: 'stars', duration: 2500 },
  10: { text: "Elite Flyer Mode!", backgroundEffect: 'shake', duration: 3000 },
  15: { text: "Sky City unlocked!", particles: 'stars', backgroundEffect: 'glow', duration: 4000 },
  20: { text: "Master of the Skies!", particles: 'coins', backgroundEffect: 'flash', duration: 3500 },
  25: { text: "Legendary Status!", particles: 'hearts', backgroundEffect: 'shake', duration: 4000 },
};

export const useLevelVisuals = () => {
  const activeEffectsRef = useRef<Set<number>>(new Set());
  const particlesRef = useRef<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'coin' | 'heart' | 'star';
    life: number;
    maxLife: number;
  }>>([]);
  const particleIdCounter = useRef(0);
  const shakeOffsetRef = useRef({ x: 0, y: 0 });
  const flashAlphaRef = useRef(0);
  const glowIntensityRef = useRef(0);

  const triggerLevelVisual = useCallback((level: number, canvas: HTMLCanvasElement) => {
    const visual = levelVisuals[level];
    if (!visual || activeEffectsRef.current.has(level)) return;

    activeEffectsRef.current.add(level);
    console.log(`Triggering level ${level} visual:`, visual.text);

    // Spawn particles if specified
    if (visual.particles) {
      const particleCount = level >= 20 ? 15 : level >= 10 ? 10 : 8;
      for (let i = 0; i < particleCount; i++) {
        let particleType: 'coin' | 'heart' | 'star';
        
        // Explicitly assign the correct type based on visual.particles
        if (visual.particles === 'coins') {
          particleType = 'coin';
        } else if (visual.particles === 'hearts') {
          particleType = 'heart';
        } else {
          particleType = 'star';
        }
        
        const particle = {
          id: particleIdCounter.current++,
          x: Math.random() * canvas.width,
          y: -20,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 2 + 1,
          type: particleType,
          life: 0,
          maxLife: 180 // 3 seconds at 60fps
        };
        particlesRef.current.push(particle);
      }
    }

    // Trigger background effects
    if (visual.backgroundEffect === 'shake') {
      const shakeDuration = visual.duration || 2000;
      const startTime = Date.now();
      const shakeIntensity = 5;
      
      const shakeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= shakeDuration) {
          clearInterval(shakeInterval);
          shakeOffsetRef.current = { x: 0, y: 0 };
          return;
        }
        
        const progress = elapsed / shakeDuration;
        const intensity = shakeIntensity * (1 - progress);
        shakeOffsetRef.current = {
          x: (Math.random() - 0.5) * intensity,
          y: (Math.random() - 0.5) * intensity
        };
      }, 16);
    }

    if (visual.backgroundEffect === 'flash') {
      flashAlphaRef.current = 0.3;
      const flashDuration = 500;
      const startTime = Date.now();
      
      const flashInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= flashDuration) {
          clearInterval(flashInterval);
          flashAlphaRef.current = 0;
          return;
        }
        
        const progress = elapsed / flashDuration;
        flashAlphaRef.current = 0.3 * (1 - progress);
      }, 16);
    }

    if (visual.backgroundEffect === 'glow') {
      glowIntensityRef.current = 0.2;
      const glowDuration = visual.duration || 3000;
      const startTime = Date.now();
      
      const glowInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= glowDuration) {
          clearInterval(glowInterval);
          glowIntensityRef.current = 0;
          return;
        }
        
        const progress = elapsed / glowDuration;
        glowIntensityRef.current = 0.2 * (1 - progress) * (1 + Math.sin(elapsed * 0.01));
      }, 16);
    }

    // Remove from active effects after duration
    setTimeout(() => {
      activeEffectsRef.current.delete(level);
    }, visual.duration || 3000);
  }, []);

  const updateParticles = useCallback(() => {
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.life++;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      
      return particle.life < particle.maxLife && particle.y < window.innerHeight + 50;
    });
  }, []);

  const renderLevelText = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, level: number, frameCount: number) => {
    const visual = levelVisuals[level];
    if (!visual || !visual.text || !activeEffectsRef.current.has(level)) return;

    // Calculate text animation
    const textLife = frameCount % (visual.duration ? Math.floor(visual.duration / 16.67) : 180);
    const fadeInDuration = 30;
    const fadeOutStart = (visual.duration ? Math.floor(visual.duration / 16.67) : 180) - 30;
    
    let alpha = 1;
    if (textLife < fadeInDuration) {
      alpha = textLife / fadeInDuration;
    } else if (textLife > fadeOutStart) {
      alpha = (180 - textLife) / 30;
    }

    // Floating animation
    const floatOffset = Math.sin(textLife * 0.1) * 5;
    const y = canvas.height * 0.2 + floatOffset;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    // Add glow effect
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    
    ctx.strokeText(visual.text, canvas.width / 2, y);
    ctx.fillText(visual.text, canvas.width / 2, y);
    ctx.restore();
  }, []);

  const renderParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(particle => {
      const progress = particle.life / particle.maxLife;
      const alpha = 1 - progress;
      const size = particle.type === 'coin' ? 12 : particle.type === 'heart' ? 10 : 8;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (particle.type === 'coin') {
        // Draw coin
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Add inner detail
        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'heart') {
        // Draw heart
        ctx.fillStyle = '#ff1744';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y + size * 0.3);
        ctx.bezierCurveTo(particle.x, particle.y - size * 0.2, particle.x - size * 0.8, particle.y - size * 0.2, particle.x - size * 0.4, particle.y + size * 0.1);
        ctx.bezierCurveTo(particle.x - size * 0.1, particle.y - size * 0.1, particle.x + size * 0.1, particle.y - size * 0.1, particle.x + size * 0.4, particle.y + size * 0.1);
        ctx.bezierCurveTo(particle.x + size * 0.8, particle.y - size * 0.2, particle.x, particle.y - size * 0.2, particle.x, particle.y + size * 0.3);
        ctx.fill();
        ctx.stroke();
      } else if (particle.type === 'star') {
        // Draw star
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const x = particle.x + Math.cos(angle) * size;
          const y = particle.y + Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          
          const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
          const innerX = particle.x + Math.cos(innerAngle) * size * 0.5;
          const innerY = particle.y + Math.sin(innerAngle) * size * 0.5;
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }, []);

  const applyBackgroundEffects = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Apply shake effect
    if (shakeOffsetRef.current.x !== 0 || shakeOffsetRef.current.y !== 0) {
      ctx.translate(shakeOffsetRef.current.x, shakeOffsetRef.current.y);
    }

    // Apply flash effect
    if (flashAlphaRef.current > 0) {
      ctx.save();
      ctx.globalAlpha = flashAlphaRef.current;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Apply glow effect
    if (glowIntensityRef.current > 0) {
      ctx.save();
      ctx.globalAlpha = glowIntensityRef.current;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, '#ffd700');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, []);

  const resetEffects = useCallback(() => {
    activeEffectsRef.current.clear();
    particlesRef.current = [];
    shakeOffsetRef.current = { x: 0, y: 0 };
    flashAlphaRef.current = 0;
    glowIntensityRef.current = 0;
  }, []);

  return {
    triggerLevelVisual,
    updateParticles,
    renderLevelText,
    renderParticles,
    applyBackgroundEffects,
    resetEffects
  };
};
