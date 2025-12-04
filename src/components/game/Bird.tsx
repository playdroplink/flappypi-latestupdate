import React, { useMemo, useEffect, useState } from 'react';

interface BirdProps {
  y: number;
  velocity: number;
  onFlap?: () => void;
  isDead?: boolean;
  skin?: string; // image src for the bird skin
  className?: string;
  style?: React.CSSProperties;
  idle?: boolean; // NEW: if true, show bounce effect
  activePowerUps?: { [key: string]: any }; // NEW: active powerups
  turboActive?: boolean; // NEW: turbo start effect
  multiplierActive?: boolean; // NEW: coin multiplier effect
  isMobile?: boolean; // NEW: if true, adjust bird position for mobile
  showReviveGlow?: boolean; // NEW: show glowing effect after revive
  left?: string | number; // NEW: allow parent to control horizontal position
  nightGlow?: boolean; // NEW: show glowing effect in night mode
  countdownFlap?: boolean; // NEW: if true, show special flapping animation during countdown
}

const FLAP_FRAMES = [
  '/birds2/bird_0.gif',
  '/birds2/bird_1.gif',
  '/birds2/bird_2.gif',
];

const Bird: React.FC<BirdProps> = ({ y, velocity, onFlap, isDead, skin, className = '', style = {}, idle = false, activePowerUps = {}, turboActive = false, multiplierActive = false, isMobile = false, showReviveGlow = false, left, nightGlow, countdownFlap = false }) => {
  // Animate bird sprite based on velocity and isDead
  // Use a frame index based on time for flapping
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    if (isDead) return;
    
    // Use faster animation during countdown for more dynamic effect
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % FLAP_FRAMES.length);
    }, countdownFlap ? 120 : 150); // Slower, more natural flapping (8.3 fps vs 6.7 fps)
    
    return () => clearInterval(interval);
  }, [isDead, countdownFlap]);

  // Smooth rotation based on velocity - more like original Flappy Bird
  const rotation = Math.max(Math.min(velocity * 2.5, 30), -25); // Reduced rotation range for smoother flight

  // Use the provided skin or animated frames
  const birdImg = skin || FLAP_FRAMES[frame];

  // Fade transition on skin change
  const [fade, setFade] = useState(false);
  const [lastSkin, setLastSkin] = useState(birdImg);
  useEffect(() => {
    if (birdImg !== lastSkin) {
      setFade(true);
      const timeout = setTimeout(() => {
        setFade(false);
        setLastSkin(birdImg);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [birdImg]);

  // Enhanced power-up effects
  const hasShield = activePowerUps['shield'];
  const hasMagnet = activePowerUps['magnet'];
  const hasTurbo = turboActive || activePowerUps['turbo_start'];
  const hasMultiplier = multiplierActive || activePowerUps['coin_multiplier'];

  return (
    <div
      className={`absolute z-30 ${className} ${idle ? 'bird-bounce' : ''} ${countdownFlap ? 'countdown-flap' : ''}`}
      style={{ 
        top: y, 
        left: left !== undefined ? left : (isMobile ? '25vw' : '15vw'), // Use left prop if provided
        transform: `rotate(${rotation}deg)`, 
        transition: 'transform 0.1s linear', 
        ...style 
      }}
    >
      <style>{`
        .bird-fade {
          transition: opacity 0.35s;
          opacity: 0.3;
        }
        .bird-fade-in {
          transition: opacity 0.35s;
          opacity: 1;
        }
        
        /* Simplified and improved bird bounce */
        @keyframes bird-bounce {
          0%, 100% { 
            transform: translateY(0) scale(1); 
          }
          50% { 
            transform: translateY(-12px) scale(1.02); 
          }
        }
        .bird-bounce {
          animation: bird-bounce 1.5s infinite ease-in-out;
        }
        
        /* Simplified countdown flapping - more subtle and natural */
        @keyframes countdown-flap {
          0%, 100% { 
            transform: translateY(0) scale(1);
            filter: brightness(1) saturate(1);
          }
          25% { 
            transform: translateY(-4px) scale(1.02);
            filter: brightness(1.05) saturate(1.1);
          }
          50% { 
            transform: translateY(-6px) scale(1.03);
            filter: brightness(1.1) saturate(1.15);
          }
          75% { 
            transform: translateY(-3px) scale(1.01);
            filter: brightness(1.03) saturate(1.05);
          }
        }
        .countdown-flap {
          animation: countdown-flap 1.2s infinite ease-in-out;
        }
        
        /* IMPROVED Power-up Effects - Cleaner and more distinct animations */
        
        /* Shield Effect: Protective aura with gentle pulsing */
        .enhanced-shield-effect {
          position: absolute;
          left: -8px; top: -8px;
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 2px solid #6366f1;
          background: transparent;
          box-shadow: inset 0 0 16px #6366f144, 0 0 12px #6366f1aa;
          z-index: 2;
          pointer-events: none;
          animation: shieldPulse 2s infinite ease-in-out;
        }
        
        /* Magnet Effect: Spiral/swirl motion to show attraction */
        .enhanced-magnet-effect {
          position: absolute;
          left: -12px; top: -12px;
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 3px dashed #22d3ee;
          background: transparent;
          box-shadow: 0 0 16px #22d3ee77;
          z-index: 1;
          pointer-events: none;
          animation: magnetSpin 3s linear infinite;
        }
        
        /* Turbo Effect: Sharp, energetic pulses */
        .enhanced-turbo-effect {
          position: absolute;
          left: -10px; top: -10px;
          width: 68px; height: 68px;
          border-radius: 50%;
          border: 2px solid #a21caf;
          background: linear-gradient(45deg, #a21caf22 0%, transparent 50%);
          box-shadow: 0 0 14px #a21cafcc;
          z-index: 0;
          pointer-events: none;
          animation: turboPulse 1.2s infinite cubic-bezier(0.43, 0.13, 0.23, 0.96);
        }
        
        /* Coin Multiplier Effect: Shimmering/sparkling effect */
        .enhanced-multiplier-effect {
          position: absolute;
          left: -6px; top: -6px;
          width: 60px; height: 60px;
          border-radius: 50%;
          background: conic-gradient(#fbbf24, #f59e0b, #fbbf24);
          box-shadow: 0 0 10px #fbbf24dd;
          z-index: 0;
          pointer-events: none;
          animation: multiplierSpark 1.5s ease-in-out infinite;
        }
        
        /* KEYFRAME ANIMATIONS - Improved for clarity */
        
        /* Shield: Gentle protective pulse */
        @keyframes shieldPulse {
          0% { 
            box-shadow: inset 0 0 16px #6366f144, 0 0 12px #6366f166;
            transform: scale(0.98);
          }
          50% { 
            box-shadow: inset 0 0 20px #6366f166, 0 0 20px #6366f1cc;
            transform: scale(1.04);
          }
          100% { 
            box-shadow: inset 0 0 16px #6366f144, 0 0 12px #6366f166;
            transform: scale(0.98);
          }
        }
        
        /* Magnet: Rotating dashed circle to show spin/attraction */
        @keyframes magnetSpin {
          0% { 
            transform: rotate(0deg) scale(1);
            border-color: #22d3ee;
          }
          50% { 
            transform: rotate(180deg) scale(1.05);
            border-color: #06b6d4;
          }
          100% { 
            transform: rotate(360deg) scale(1);
            border-color: #22d3ee;
          }
        }
        
        /* Turbo: Fast, snappy pulses for energetic feel */
        @keyframes turboPulse {
          0% { 
            box-shadow: 0 0 8px #a21caf66;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 18px #a21cafff;
            transform: scale(1.08);
          }
          100% { 
            box-shadow: 0 0 8px #a21caf66;
            transform: scale(1);
          }
        }
        
        /* Multiplier: Sparkling/shimmering effect */
        @keyframes multiplierSpark {
          0% { 
            box-shadow: 0 0 6px #fbbf2466, 0 2px 0 #f59e0b99;
            transform: scale(0.95);
            opacity: 0.7;
          }
          50% { 
            box-shadow: 0 0 14px #fbbf24ff, 0 -2px 4px #f59e0bff;
            transform: scale(1.05);
            opacity: 1;
          }
          100% { 
            box-shadow: 0 0 6px #fbbf2466, 0 2px 0 #f59e0b99;
            transform: scale(0.95);
            opacity: 0.7;
          }
        }

        /* Simplified revive glow - IMPROVED: Smoother and more subtle */
        .bird-revive-glow {
          position: absolute;
          left: -8px; top: -8px;
          width: 64px; height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle, #00e6ff44 0%, transparent 70%);
          box-shadow: 0 0 16px #00e6ff88;
          z-index: 3;
          pointer-events: none;
          animation: reviveGlowPulse 2s infinite ease-in-out;
        }
        
        @keyframes reviveGlowPulse {
          0% { 
            box-shadow: 0 0 12px #00e6ff66; 
            opacity: 0.5; 
            transform: scale(0.95);
          }
          50% { 
            box-shadow: 0 0 20px #00e6ffaa; 
            opacity: 0.8; 
            transform: scale(1.05);
          }
          100% { 
            box-shadow: 0 0 12px #00e6ff66; 
            opacity: 0.5; 
            transform: scale(0.95);
          }
        }
        
        /* Power-up icon animations - IMPROVED: Distinct animations for each type */
        @keyframes powerUpIconFloat {
          0%, 100% { 
            transform: translateY(-2px) scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-6px) scale(1.08);
            opacity: 1;
          }
        }
        
        /* Shield icon: Gentle bounce */
        @keyframes shieldIconBounce {
          0%, 100% { 
            transform: translateY(-2px) scale(1) rotate(0deg);
            opacity: 0.8;
            text-shadow: 0 0 4px #6366f1;
          }
          50% { 
            transform: translateY(-8px) scale(1.15) rotate(-5deg);
            opacity: 1;
            text-shadow: 0 0 8px #6366f1cc;
          }
        }
        
        /* Magnet icon: Spinning motion */
        @keyframes magnetIconSpin {
          0%, 100% { 
            transform: translateY(-2px) scale(1) rotate(0deg);
            opacity: 0.8;
            text-shadow: 0 0 4px #22d3ee;
          }
          50% { 
            transform: translateY(-6px) scale(1.1) rotate(180deg);
            opacity: 1;
            text-shadow: 0 0 8px #22d3eecc;
          }
        }
        
        /* Coin Multiplier icon: Sparkle/twinkle */
        @keyframes coinIconSparkle {
          0%, 100% { 
            transform: translateY(-2px) scale(1);
            opacity: 0.7;
            text-shadow: 0 0 4px #fbbf24;
          }
          25% { 
            transform: translateY(-5px) scale(1.2) rotate(15deg);
            opacity: 1;
            text-shadow: 0 0 8px #fbbf24ff;
          }
          50% { 
            transform: translateY(-8px) scale(0.9);
            opacity: 0.8;
            text-shadow: 0 0 4px #fbbf24;
          }
          75% { 
            transform: translateY(-5px) scale(1.2) rotate(-15deg);
            opacity: 1;
            text-shadow: 0 0 8px #fbbf24ff;
          }
        }
        
        /* Turbo icon: Rapid pulsing */
        @keyframes turboIconPulse {
          0%, 100% { 
            transform: translateY(-2px) scale(1);
            opacity: 0.8;
            text-shadow: 0 0 4px #a21caf;
          }
          50% { 
            transform: translateY(-6px) scale(1.15);
            opacity: 1;
            text-shadow: 0 0 10px #a21cafff;
          }
        }
        
        @media (max-width: 640px) {
          .bird-bounce {
            animation: bird-bounce 1.5s infinite ease-in-out;
          }
        }
      `}</style>
      
      {/* Simplified Revive Glow Effect */}
      {showReviveGlow && (
        <div style={{
          position: 'absolute',
          left: -8,
          top: -8,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #00e6ff44 0%, transparent 70%)',
          boxShadow: '0 0 16px #00e6ff88',
          zIndex: 3,
          pointerEvents: 'none',
          animation: 'reviveGlowPulse 2s infinite ease-in-out',
        }} />
      )}
      
      {/* Simplified Night Glow */}
      {nightGlow && (
        <div style={{
          position: 'absolute',
          left: -16,
          top: -16,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #00e6ff33 0%, transparent 70%)',
          boxShadow: '0 0 24px #00e6ff88',
          zIndex: 2,
          pointerEvents: 'none',
          filter: 'blur(1px)',
          animation: 'reviveGlowPulse 2s infinite ease-in-out',
        }} />
      )}
      
      {/* Simplified Power-up Effects */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 48, height: 48, zIndex: 0, pointerEvents: 'none' }}>
        {/* Shield Effect */}
        {hasShield && !showReviveGlow && (
          <div className="enhanced-shield-effect" />
        )}
        
        {/* Magnet Effect */}
        {hasMagnet && (
          <div className="enhanced-magnet-effect" />
        )}
        
        {/* Turbo Effect */}
        {hasTurbo && (
          <div className="enhanced-turbo-effect" />
        )}
        
        {/* Coin Multiplier Effect */}
        {hasMultiplier && (
          <div className="enhanced-multiplier-effect" />
        )}
      </div>
      
      {/* Simplified Power-up Icons */}
      <div style={{
        position: 'absolute',
        top: -24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 3,
        zIndex: 4,
        pointerEvents: 'none'
      }}>
        {hasShield && (
          <span style={{
            fontSize: 16,
            color: '#6366f1',
            animation: 'shieldIconBounce 1.5s ease-in-out infinite'
          }}>🛡️</span>
        )}
        {hasMagnet && (
          <span style={{
            fontSize: 16,
            color: '#22d3ee',
            animation: 'magnetIconSpin 2s ease-in-out infinite'
          }}>🧲</span>
        )}
        {hasMultiplier && (
          <span style={{
            fontSize: 16,
            color: '#fbbf24',
            animation: 'coinIconSparkle 1.2s ease-in-out infinite'
          }}>💰</span>
        )}
        {hasTurbo && (
          <span style={{
            fontSize: 16,
            color: '#a21caf',
            animation: 'turboIconPulse 0.8s ease-in-out infinite'
          }}>⚡</span>
        )}
      </div>
      
      {/* Main Bird Image */}
      <img
        src={birdImg}
        alt="Flappy Bird"
        className={`w-16 h-16 sm:w-20 sm:h-20 select-none ${isDead ? 'opacity-60 grayscale' : ''} ${fade ? 'bird-fade' : 'bird-fade-in'}`}
        draggable={false}
        style={{ 
          pointerEvents: 'none', 
          userSelect: 'none', 
          position: 'relative', 
          zIndex: 1,
          filter: hasTurbo ? 'brightness(1.1) saturate(1.2)' : 'none',
          transition: 'filter 0.3s ease'
        }}
      />
    </div>
  );
};

export default Bird; 