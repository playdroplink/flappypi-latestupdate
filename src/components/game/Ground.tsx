import React, { useEffect } from 'react';

interface GroundProps {
  x: number;
  scene?: 'grass' | 'rock' | 'lava' | 'dessert' | 'ice' | 'land';
}

const GROUND_HEIGHT = 64;
const SAND_HEIGHT = 32; // Sand layer height

const AnimatedButterfly = ({ x, y, delay = 0 }) => (
  <svg style={{ position: 'absolute', left: x, top: y, animation: `butterfly-fly 4s ${delay}s infinite linear` }} width="24" height="24" viewBox="0 0 24 24">
    <g>
      <ellipse cx="12" cy="12" rx="4" ry="8" fill="#fbbf24" />
      <ellipse cx="8" cy="12" rx="4" ry="8" fill="#f472b6" />
      <ellipse cx="16" cy="12" rx="4" ry="8" fill="#60a5fa" />
      <circle cx="12" cy="16" r="2" fill="#222" />
    </g>
  </svg>
);

const AnimatedFlower = ({ x, y, color = '#f43f5e', delay = 0 }) => (
  <svg style={{ position: 'absolute', left: x, top: y, animation: `flower-sway 2s ${delay}s infinite alternate ease-in-out` }} width="18" height="24" viewBox="0 0 18 24">
    <g>
      <ellipse cx="9" cy="20" rx="2" ry="4" fill="#22c55e" />
      <circle cx="9" cy="10" r="5" fill={color} />
      <circle cx="9" cy="10" r="2" fill="#fffde4" />
    </g>
  </svg>
);

const AnimatedSnowflake = ({ x, y, delay = 0 }) => (
  <svg style={{ position: 'absolute', left: x, top: y, animation: `snowflake-fall 3s ${delay}s infinite linear` }} width="16" height="16" viewBox="0 0 16 16">
    <g>
      <circle cx="8" cy="8" r="3" fill="#fff" opacity="0.8" />
      <line x1="8" y1="2" x2="8" y2="14" stroke="#fff" strokeWidth="1" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="#fff" strokeWidth="1" />
      <line x1="4" y1="4" x2="12" y2="12" stroke="#fff" strokeWidth="1" />
      <line x1="12" y1="4" x2="4" y2="12" stroke="#fff" strokeWidth="1" />
    </g>
  </svg>
);

const AnimatedLavaBubble = ({ x, delay = 0 }) => (
  <svg style={{ position: 'absolute', left: x, bottom: 8, animation: `lava-bubble 2s ${delay}s infinite ease-in` }} width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" fill="#ffd700" opacity="0.7" />
  </svg>
);

const groundSvgs: Record<string, JSX.Element> = {
  grass: (
    <div style={{ width: '100%', height: 64, position: 'relative' }}>
      <svg width="100%" height="64" viewBox="0 0 480 64" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="0" y="32" width="480" height="32" fill="#7ed957" />
        {/* Flat top for pipe connection */}
        <rect x="0" y="32" width="480" height="8" fill="#4CAF50" />
        {/* Grass blades and decorations below */}
        {[...Array(24)].map((_, i) => (
          <rect key={i} x={20 * i + 8} y={40 - Math.sin(i) * 6} width={2} height={16 + Math.sin(i) * 8} fill="#43a047" rx={1} />
        ))}
        {/* Flowers, butterflies, etc. */}
      </svg>
      <AnimatedFlower x={40} y={44} color="#f43f5e" delay={0} />
      <AnimatedFlower x={120} y={48} color="#fbbf24" delay={0.5} />
      <AnimatedFlower x={300} y={46} color="#a3e635" delay={1} />
      <AnimatedButterfly x={80} y={20} delay={0} />
      <AnimatedButterfly x={200} y={28} delay={1.2} />
      <AnimatedButterfly x={350} y={18} delay={2.1} />
    </div>
  ),
  ice: (
    <div style={{ width: '100%', height: 64, position: 'relative' }}>
      <svg width="100%" height="64" viewBox="0 0 480 64" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="0" y="36" width="480" height="28" fill="#b6e0fe" />
        <polygon points="0,36 40,48 80,36 120,52 160,36 200,50 240,36 280,54 320,36 360,48 400,36 440,52 480,36 480,64 0,64" fill="#e0f7fa" />
      </svg>
      {/* Animated snowflakes */}
      {[...Array(8)].map((_, i) => (
        <AnimatedSnowflake key={i} x={40 + i * 50} y={36 + (i % 2) * 8} delay={i * 0.4} />
      ))}
    </div>
  ),
  lava: (
    <div style={{ width: '100%', height: 64, position: 'relative' }}>
      <svg width="100%" height="64" viewBox="0 0 480 64" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="0" y="36" width="480" height="28" fill="#ff512f" />
        <path d="M0,36 Q40,50 80,36 T160,36 T240,36 T320,36 T400,36 T480,36 V64 H0 Z" fill="#dd2476" />
      </svg>
      {/* Animated lava bubbles */}
      {[...Array(6)].map((_, i) => (
        <AnimatedLavaBubble key={i} x={30 + i * 70} delay={i * 0.5} />
      ))}
    </div>
  ),
  dessert: (
    <div style={{ width: '100%', height: 64, position: 'relative' }}>
      <svg width="100%" height="64" viewBox="0 0 480 64" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="0" y="36" width="480" height="28" fill="#ffe082" />
        <path d="M0,36 Q40,44 80,36 T160,36 T240,36 T320,36 T400,36 T480,36 V64 H0 Z" fill="#ffd54f" />
        {/* Cacti and rocks */}
        <rect x="60" y="48" width="6" height="12" fill="#43a047" rx={2} />
        <rect x="62" y="44" width="2" height="8" fill="#a3e635" rx={1} />
        <ellipse cx="120" cy="60" rx="8" ry="3" fill="#bdbdbd" />
        <ellipse cx="200" cy="62" rx="6" ry="2" fill="#bdbdbd" />
      </svg>
    </div>
  ),
  rock: (
    <div style={{ width: '100%', height: 64, position: 'relative' }}>
      <svg width="100%" height="64" viewBox="0 0 480 64" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="0" y="40" width="480" height="24" fill="#757575" />
        <polygon points="0,40 40,54 80,40 120,58 160,40 200,56 240,40 280,54 320,40 360,58 400,40 440,54 480,40 480,64 0,64" fill="#bdbdbd" />
        {/* Pebbles and cracks */}
        <ellipse cx="60" cy="60" rx="10" ry="3" fill="#bdbdbd" opacity="0.4" />
        <ellipse cx="300" cy="62" rx="12" ry="4" fill="#bdbdbd" opacity="0.3" />
        <rect x="120" y="54" width="2" height="8" fill="#616161" rx={1} />
        <rect x="350" y="58" width="2" height="6" fill="#616161" rx={1} />
      </svg>
    </div>
  ),
  land: (
    <div style={{ width: '100%', height: 64, position: 'relative' }}>
      <svg width="100%" height="64" viewBox="0 0 480 64" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="0" y="36" width="480" height="28" fill="#a0522d" />
        <path d="M0,36 Q40,44 80,36 T160,36 T240,36 T320,36 T400,36 T480,36 V64 H0 Z" fill="#8d5524" />
        {/* Mushrooms and plants */}
        <ellipse cx="60" cy="60" rx="6" ry="3" fill="#fff" />
        <rect x="58" y="54" width="4" height="8" fill="#22c55e" rx={1} />
        <ellipse cx="120" cy="62" rx="4" ry="2" fill="#a3e635" />
      </svg>
    </div>
  ),
  sand: (
    <div style={{ width: '100%', height: 32, position: 'relative' }}>
      <svg width="100%" height="32" viewBox="0 0 480 32" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x="0" y="0" width="480" height="32" fill="#f4e4bc" />
        <path d="M0,0 Q40,8 80,0 T160,0 T240,0 T320,0 T400,0 T480,0 V32 H0 Z" fill="#e6d3a3" />
        {/* Sand particles and texture */}
        {[...Array(20)].map((_, i) => (
          <circle key={i} cx={24 * i + 12} cy={16 + Math.sin(i) * 4} r={1} fill="#d4c4a8" opacity="0.6" />
        ))}
        {/* Small rocks in sand */}
        <ellipse cx="100" cy="28" rx="3" ry="2" fill="#c4b896" />
        <ellipse cx="200" cy="26" rx="2" ry="1.5" fill="#c4b896" />
        <ellipse cx="350" cy="29" rx="2.5" ry="1.8" fill="#c4b896" />
      </svg>
    </div>
  ),
};

const Ground: React.FC<GroundProps> = ({ x, scene = 'grass' }) => {
  useEffect(() => {
    // Add keyframes for animation only once
    if (typeof window !== 'undefined' && document && !document.getElementById('ground-animations')) {
      const style = document.createElement('style');
      style.id = 'ground-animations';
      style.innerHTML = `
        @keyframes butterfly-fly {
          0% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-10px) scale(1.1); }
          40% { transform: translateY(-20px) scale(1.05) rotate(-10deg); }
          60% { transform: translateY(-10px) scale(1.1) rotate(10deg); }
          80% { transform: translateY(0) scale(1); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes flower-sway {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(2deg); }
        }
        @keyframes snowflake-fall {
          0% { transform: translateY(0); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(24px); opacity: 0; }
        }
        @keyframes lava-bubble {
          0% { transform: scale(0.7) translateY(0); opacity: 0.7; }
          60% { transform: scale(1.1) translateY(-12px); opacity: 1; }
          100% { transform: scale(0.7) translateY(0); opacity: 0.7; }
        }
        @keyframes ground-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes ground-move-reverse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Ensure we have a valid scene, fallback to grass if not
  const validScene = groundSvgs[scene] ? scene : 'grass';

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      height: GROUND_HEIGHT + SAND_HEIGHT,
      zIndex: 10,
      pointerEvents: 'none',
      overflow: 'hidden',
      // Add mobile-specific bottom padding to account for footer
      paddingBottom: window.innerWidth <= 768 ? '60px' : '0px'
    }}>
      {/* Sand layer at the very bottom */}
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '200%',
        height: SAND_HEIGHT,
        animation: `ground-move ${window.innerWidth >= 768 ? '12s' : '6s'} linear infinite`,
        zIndex: 1,
      }}>
        {/* First sand segment */}
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          bottom: 0, 
          width: '100%', 
          height: SAND_HEIGHT,
          transform: 'translateX(0)'
        }}>
          {groundSvgs['sand']}
        </div>
        {/* Second sand segment - exact duplicate for seamless loop */}
        <div style={{ 
          position: 'absolute', 
          left: '100%', 
          bottom: 0, 
          width: '100%', 
          height: SAND_HEIGHT,
          transform: 'translateX(0)'
        }}>
          {groundSvgs['sand']}
        </div>
      </div>
      
      {/* Grass/Ground layer above sand */}
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: SAND_HEIGHT,
        width: '200%',
        height: GROUND_HEIGHT,
        animation: `ground-move ${window.innerWidth >= 768 ? '12s' : '6s'} linear infinite`,
        zIndex: 2,
      }}>
        {/* First ground segment */}
        <div style={{ 
          position: 'absolute', 
          left: 0, 
          bottom: 0, 
          width: '100%', 
          height: GROUND_HEIGHT,
          transform: 'translateX(0)'
        }}>
          {groundSvgs[validScene]}
        </div>
        {/* Second ground segment - exact duplicate for seamless loop */}
        <div style={{ 
          position: 'absolute', 
          left: '100%', 
          bottom: 0, 
          width: '100%', 
          height: GROUND_HEIGHT,
          transform: 'translateX(0)'
        }}>
          {groundSvgs[validScene]}
        </div>
      </div>
    </div>
  );
};

export default Ground; 