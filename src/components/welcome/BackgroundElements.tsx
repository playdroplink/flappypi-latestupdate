
import React from 'react';

const BackgroundElements: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Floating clouds */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/10 rounded-full animate-pulse"
          style={{
            width: `${40 + i * 10}px`,
            height: `${20 + i * 5}px`,
            left: `${10 + i * 20}%`,
            top: `${20 + i * 15}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: '4s'
          }}
        />
      ))}
      
      {/* Geometric shapes */}
      <div className="absolute top-20 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-8 w-12 h-12 bg-white/10 rotate-45 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
    </div>
  );
};

export default BackgroundElements;
