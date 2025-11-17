
import React from 'react';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="text-center mb-8 animate-fade-in">
      <div className="mb-6 relative">
        <div className="w-32 h-32 mx-auto mb-4 relative">
          <img 
            src="/lovable-uploads/8d2aed26-e6ed-4f65-9613-6ec708c96c50.png" 
            alt="Flappy Pi Character" 
            className="w-full h-full object-contain animate-bounce drop-shadow-2xl"
          />
        </div>
      </div>
      
      <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
        Flappy Pi
      </h1>
      <p className="text-xl text-white/90 font-medium drop-shadow-md">
        Soar with Pi Network! 🚀
      </p>
    </div>
  );
};

export default WelcomeHeader;
