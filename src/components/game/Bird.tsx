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
        
        /* Simplified power-up effects */
        .enhanced-shield-effect {
          position: absolute;
          left: -8px; top: -8px;
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 2px solid #6366f1;
          background: radial-gradient(circle, #6366f122 0%, transparent 70%);
          box-shadow: 0 0 16px #6366f188;
          z-index: 2;
          pointer-events: none;
          animation: shieldPulse 1.5s infinite ease-in-out;
        }
        
        .enhanced-magnet-effect {
          position: absolute;
          left: -12px; top: -12px;
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 2px dashed #22d3ee;
          background: radial-gradient(circle, #22d3ee22 0%, transparent 70%);
          box-shadow: 0 0 20px #22d3ee88;
          z-index: 1;
          pointer-events: none;
          animation: magnetPulse 1.5s infinite ease-in-out;
        }
        
        .enhanced-turbo-effect {
          position: absolute;
          left: -6px; top: -6px;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: radial-gradient(circle, #a21caf22 0%, transparent 70%);
          box-shadow: 0 0 12px #a21caf88;
          z-index: 0;
          pointer-events: none;
          animation: turboPulse 1s infinite ease-in-out;
        }
        
        .enhanced-multiplier-effect {
          position: absolute;
          left: -4px; top: -4px;
          width: 48px; height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle, #fbbf2433 0%, transparent 70%);
          box-shadow: 0 0 8px #fbbf2488;
          z-index: 0;
          pointer-events: none;
          animation: multiplierPulse 1.2s infinite ease-in-out;
        }
        
        /* Simplified pulse animations */
        @keyframes shieldPulse {
          0%, 100% { 
            box-shadow: 0 0 16px #6366f188; 
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 24px #6366f1cc; 
            transform: scale(1.02);
          }
        }
        
        @keyframes magnetPulse {
          0%, 100% { 
            box-shadow: 0 0 20px #22d3ee88; 
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 28px #22d3eeaa; 
            transform: scale(1.03);
          }
        }
        
        @keyframes turboPulse {
          0%, 100% { 
            box-shadow: 0 0 12px #a21caf88; 
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 18px #a21cafaa; 
            transform: scale(1.05);
          }
        }
        
        @keyframes multiplierPulse {
          0%, 100% { 
            box-shadow: 0 0 8px #fbbf2488; 
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 12px #fbbf24aa; 
            transform: scale(1.03);
          }
        }

        /* Simplified revive glow */
        .bird-revive-glow {
          position: absolute;
          left: -8px; top: -8px;
          width: 64px; height: 64px;
          border-radius: 50%;
          background: radial-gradient(circle, #00e6ff44 0%, transparent 70%);
          box-shadow: 0 0 16px #00e6ff88;
          z-index: 3;
          pointer-events: none;
          animation: reviveGlowPulse 1.5s infinite ease-in-out;
        }
        
        @keyframes reviveGlowPulse {
          0%, 100% { 
            box-shadow: 0 0 16px #00e6ff88; 
            opacity: 0.6; 
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 24px #00e6ffcc; 
            opacity: 0.8; 
            transform: scale(1.05);
          }
        }
        
        /* Power-up icon animations */
        @keyframes powerUpIconFloat {
          0%, 100% { 
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-4px) scale(1.1);
            opacity: 1;
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
          animation: 'reviveGlowPulse 1.5s infinite ease-in-out',
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
          animation: 'reviveGlowPulse 1.5s infinite ease-in-out',
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
            filter: 'drop-shadow(0 0 4px #6366f1)',
            animation: 'powerUpIconFloat 2s ease-in-out infinite'
          }}>🛡️</span>
        )}
        {hasMagnet && (
          <span style={{
            fontSize: 16,
            color: '#22d3ee',
            filter: 'drop-shadow(0 0 4px #22d3ee)',
            animation: 'powerUpIconFloat 2s ease-in-out infinite 0.5s'
          }}>🧲</span>
        )}
        {hasMultiplier && (
          <span style={{
            fontSize: 16,
            color: '#fbbf24',
            filter: 'drop-shadow(0 0 4px #fbbf24)',
            animation: 'powerUpIconFloat 2s ease-in-out infinite 1s'
          }}>💰</span>
        )}
        {hasTurbo && (
          <span style={{
            fontSize: 16,
            color: '#a21caf',
            filter: 'drop-shadow(0 0 4px #a21caf)',
            animation: 'powerUpIconFloat 2s ease-in-out infinite 1.5s'
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