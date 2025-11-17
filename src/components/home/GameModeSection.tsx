
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

type GameMode = 'classic' | 'endless' | 'challenge';

interface GameModeSectionProps {
  onSelectGameMode: (mode: GameMode) => void;
}

const GameModeSection: React.FC<GameModeSectionProps> = ({ onSelectGameMode }) => {
  return (
    <div className="w-full space-y-3 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <h3 className="text-white font-bold text-xl text-center mb-4 drop-shadow-md">
        Choose Your Adventure
      </h3>
      
      <Button 
        onClick={() => onSelectGameMode('classic')}
        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-xl"
      >
        <Play className="mr-3 h-6 w-6" />
        Classic Mode
      </Button>
      
      <Button 
        onClick={() => onSelectGameMode('endless')}
        className="w-full h-14 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-xl"
      >
        <Play className="mr-3 h-6 w-6" />
        Endless Mode
      </Button>
      
      <Button 
        onClick={() => onSelectGameMode('challenge')}
        className="w-full h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-xl"
      >
        <Play className="mr-3 h-6 w-6" />
        Challenge Mode
      </Button>
    </div>
  );
};

export default GameModeSection;
