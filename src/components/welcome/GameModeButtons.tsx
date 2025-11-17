import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Infinity, Trophy, Play, Zap, Star, Crown, Sparkles } from 'lucide-react';

type GameMode = 'classic' | 'endless' | 'challenge' | 'scream-pi';

interface GameModeButtonsProps {
  onGameModeSelect: (mode: GameMode) => void;
}

const GameModeButtons: React.FC<GameModeButtonsProps> = ({
  onGameModeSelect
}) => {
  return (
    <>
      {/* Enhanced Game Modes */}
      <div className="w-full space-y-4 mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-2xl sm:text-3xl mb-2 drop-shadow-lg">
            🎮 Choose Your Adventure
          </h3>
          <p className="text-white/80 text-sm sm:text-base drop-shadow-md">
            Select your preferred game mode and start flapping!
          </p>
        </div>
        
        {/* Main Play Button - Prominent */}
        <Button 
          onClick={() => onGameModeSelect('classic')}
          className="w-full h-20 sm:h-24 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg sm:text-xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center justify-center w-full relative z-10">
            <Play className="mr-3 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
            <div className="text-center">
              <div className="text-lg sm:text-xl font-black">🚀 PLAY NOW</div>
              <div className="text-xs sm:text-sm opacity-90 font-medium">Classic Mode</div>
            </div>
          </div>
        </Button>
        
        {/* Game Mode Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Classic Mode */}
          <Button 
            onClick={() => onGameModeSelect('classic')}
            className="h-16 sm:h-20 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white font-bold text-sm sm:text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 to-green-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <Target className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold">🎯 Classic</div>
                <div className="text-xs opacity-90 hidden sm:block">Original Experience</div>
              </div>
            </div>
          </Button>
          
          {/* Endless Mode */}
          <Button 
            onClick={() => onGameModeSelect('endless')}
            className="h-16 sm:h-20 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-bold text-sm sm:text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <Infinity className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold">♾️ Endless</div>
                <div className="text-xs opacity-90 hidden sm:block">Never-ending Adventure</div>
              </div>
            </div>
          </Button>
          
          {/* Challenge Mode */}
          <Button 
            onClick={() => onGameModeSelect('challenge')}
            className="h-16 sm:h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold text-sm sm:text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-pink-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <Trophy className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold">🏆 Challenge</div>
                <div className="text-xs opacity-90 hidden sm:block">11 Unique Modes</div>
              </div>
            </div>
          </Button>
          
          {/* Scream Pi Button */}
          <Button 
            onClick={() => onGameModeSelect('scream-pi')}
            className="h-16 sm:h-20 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 text-white font-bold text-sm sm:text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-300/20 to-pink-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <Zap className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold">🎤 Scream Pi</div>
                <div className="text-xs opacity-90 hidden sm:block">Voice Control</div>
              </div>
            </div>
          </Button>
          
          {/* Special Features Button */}
          <Button 
            onClick={() => onGameModeSelect('classic')}
            className="h-16 sm:h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold text-sm sm:text-lg shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <Sparkles className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold">⭐ Premium</div>
                <div className="text-xs opacity-90 hidden sm:block">Ad-Free Experience</div>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </>
  );
};

export default GameModeButtons;
