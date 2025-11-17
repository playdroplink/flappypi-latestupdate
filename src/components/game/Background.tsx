import React, { useEffect } from 'react';

interface BackgroundProps {
  mode?: 'classic' | 'endless' | 'challenge';
  scene?: string;
  effect?: string;
}

const Background: React.FC<BackgroundProps> = ({ mode = 'classic', scene = 'morning', effect }) => {
  // Add looping background animation
  useEffect(() => {
    if (typeof window !== 'undefined' && document && !document.getElementById('background-animations')) {
      const style = document.createElement('style');
      style.id = 'background-animations';
      style.innerHTML = `
        @keyframes background-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes cloud-float {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(20px) translateY(-10px); }
          100% { transform: translateX(0) translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Scene-based backgrounds
  switch (scene) {
    case 'morning':
      return (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          {/* Animated background with clouds */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '200%',
            height: '100%',
            background: 'linear-gradient(to bottom, #aeefff, #fffbe0)',
            animation: 'background-move 30s linear infinite',
            zIndex: 1,
          }} />
          {/* Floating clouds */}
          <div style={{
            position: 'absolute',
            left: '10%',
            top: '20%',
            width: '60px',
            height: '30px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50px',
            animation: 'cloud-float 8s ease-in-out infinite',
            zIndex: 2,
          }} />
          <div style={{
            position: 'absolute',
            left: '70%',
            top: '30%',
            width: '80px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50px',
            animation: 'cloud-float 12s ease-in-out infinite',
            zIndex: 2,
          }} />
        </div>
      );
    case 'sunrise':
      return (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '200%',
            height: '100%',
            background: 'linear-gradient(to top, #ffd580 0%, #ffefba 100%)',
            animation: 'background-move 25s linear infinite',
            zIndex: 1,
          }} />
        </div>
      );
    case 'sunlight':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #fffbe0, #ffe082)' }} />;
    case 'beach':
      return (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 w-full h-full" style={{ background: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)' }} />
          <svg className="absolute bottom-0 left-0 w-full h-24" viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="720" cy="96" rx="720" ry="32" fill="#4fc3f7" fillOpacity="0.7" />
            <ellipse cx="720" cy="104" rx="720" ry="24" fill="#81d4fa" fillOpacity="0.5" />
          </svg>
        </div>
      );
    case 'desert':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #f7971e, #ffd200, #ffe082)' }} />;
    case 'snow':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #e0eafc, #cfdef3)' }} />;
    case 'lava':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #ff512f, #dd2476)' }} />;
    case 'rainbow':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8ffae, #43cea2, #185a9d)' }} />;
    case 'storm':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #232526, #414345)' }} />;
    case 'sunny':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #ffd700, #fffbe0)' }} />;
    case 'rainy':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #4fc3f7, #81d4fa)' }} />;
    case 'winter':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #b6c6e5, #e3e3e3)' }} />;
    case 'thunder':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #232526, #0f2027)' }} />;
    case 'garden':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #43cea2, #185a9d)' }} />;
    case 'mars':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #e96443, #904e95)' }} />;
    case 'jupiter':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #f7971e, #ffd200, #43cea2)' }} />;
    case 'space':
      return (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '200%',
            height: '100%',
            background: 'linear-gradient(to bottom, #232526, #414345, #0f2027)',
            animation: 'background-move 40s linear infinite',
            zIndex: 1,
          }} />
          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '2px',
                height: '2px',
                background: 'white',
                borderRadius: '50%',
                animation: `cloud-float ${3 + Math.random() * 4}s ease-in-out infinite`,
                zIndex: 2,
              }}
            />
          ))}
        </div>
      );
    case 'planet':
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #a8edea, #fed6e3)' }} />;
    case 'night':
      return (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 w-full h-full" style={{ background: 'linear-gradient(to bottom, #0f0f23, #1a1a2e, #16213e)' }} />
          {/* Stars */}
          <div className="absolute inset-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          {/* Moon */}
          <div
            className="absolute w-16 h-16 bg-white rounded-full opacity-90"
            style={{
              top: '10%',
              right: '15%',
              boxShadow: '0 0 20px rgba(255,255,255,0.3)'
            }}
          />
        </div>
      );
    default:
      return <div className="absolute inset-0 w-full h-full z-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #aeefff, #fffbe0)' }} />;
  }
};

export default Background; 
