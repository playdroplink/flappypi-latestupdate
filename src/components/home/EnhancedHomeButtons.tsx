import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, Target, Infinity, Trophy, ShoppingCart, Gift, Users, BookOpen, 
  Star, Crown, Heart, Globe, Zap, Sparkles, TrendingUp, Gamepad2,
  Coins, Settings, Home, MessageCircle
} from 'lucide-react';

interface EnhancedHomeButtonsProps {
  onGameModeSelect: (mode: 'classic' | 'endless' | 'challenge') => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutorial?: () => void;
  onOpenCommunity?: () => void;
  onOpenDailyRewards?: () => void;
  onOpenSubscription?: () => void;
  onOpenSettings?: () => void;
  onOpenChatbot?: () => void;
}

const EnhancedHomeButtons: React.FC<EnhancedHomeButtonsProps> = ({
  onGameModeSelect,
  onOpenShop,
  onOpenLeaderboard,
  onOpenTutorial,
  onOpenCommunity,
  onOpenDailyRewards,
  onOpenSubscription,
  onOpenSettings,
  onOpenChatbot
}) => {
  return (
    <div className="w-full space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      
      {/* Hero Section - Main Play Button */}
      <div className="text-center mb-8">
        <h2 className="text-white font-black text-3xl sm:text-4xl mb-3 drop-shadow-lg">
          🚀 FLAPPY PI
        </h2>
        <p className="text-white/90 text-lg sm:text-xl mb-6 drop-shadow-md">
          Ready to flap your way to victory?
        </p>
        
        {/* Main Play Button */}
        <Button 
          onClick={() => onGameModeSelect('classic')}
          className="w-full h-20 sm:h-24 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-black text-xl sm:text-2xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-2xl relative overflow-hidden group mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center justify-center w-full relative z-10">
            <Play className="mr-4 h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black">PLAY NOW</div>
              <div className="text-sm sm:text-base opacity-90 font-medium">Start Your Adventure</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Game Modes Section */}
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-xl sm:text-2xl mb-2 drop-shadow-lg">
            🎮 Game Modes
          </h3>
          <p className="text-white/80 text-sm drop-shadow-md">
            Choose your preferred challenge level
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-xl sm:text-2xl mb-2 drop-shadow-lg">
            ⚡ Quick Actions
          </h3>
          <p className="text-white/80 text-sm drop-shadow-md">
            Access your favorite features instantly
          </p>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            onClick={onOpenShop}
            className="h-14 sm:h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-700 text-white font-bold shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <ShoppingCart className="mr-2 h-5 w-5" />
              <span className="font-bold">Shop</span>
            </div>
          </Button>
          
          <Button 
            onClick={onOpenLeaderboard}
            className="h-14 sm:h-16 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-600 hover:via-violet-600 hover:to-purple-700 text-white font-bold shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-violet-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <Trophy className="mr-2 h-5 w-5" />
              <span className="font-bold">Leaderboard</span>
            </div>
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button 
            onClick={onOpenDailyRewards}
            className="h-12 sm:h-14 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group min-h-[48px] sm:min-h-[56px] touch-manipulation"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex flex-col items-center justify-center w-full relative z-10">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
              <span className="text-xs sm:text-sm font-bold truncate">Rewards</span>
            </div>
          </Button>

          <Button 
            onClick={onOpenTutorial}
            className="h-12 sm:h-14 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group min-h-[48px] sm:min-h-[56px] touch-manipulation"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-300/20 to-emerald-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex flex-col items-center justify-center w-full relative z-10">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
              <span className="text-xs sm:text-sm font-bold truncate">Tutorial</span>
            </div>
          </Button>

          <Button 
            onClick={onOpenCommunity}
            className="h-12 sm:h-14 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group min-h-[48px] sm:min-h-[56px] touch-manipulation"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300/20 to-rose-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex flex-col items-center justify-center w-full relative z-10">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
              <span className="text-xs sm:text-sm font-bold truncate">Community</span>
            </div>
          </Button>
        </div>

        {/* Premium Features */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onOpenSubscription}
            className="h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <Crown className="mr-2 h-4 w-4" />
              <span className="text-sm font-bold">Premium</span>
            </div>
          </Button>

          <Button 
            onClick={onOpenChatbot}
            className="h-12 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-300/20 to-pink-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-center w-full relative z-10">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span className="text-sm font-bold">Chatbot</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Special Features Section */}
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-white font-bold text-lg sm:text-xl mb-2 drop-shadow-lg">
            ⭐ Special Features
          </h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button 
            onClick={onOpenSettings}
            className="h-10 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-gray-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex flex-col items-center justify-center w-full relative z-10">
              <Settings className="h-3 w-3 mb-1" />
              <span className="text-xs font-bold">Settings</span>
            </div>
          </Button>

          <Button 
            onClick={onOpenShop}
            className="h-10 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:via-teal-700 hover:to-teal-800 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-300/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex flex-col items-center justify-center w-full relative z-10">
              <Coins className="h-3 w-3 mb-1" />
              <span className="text-xs font-bold">Coins</span>
            </div>
          </Button>

          <Button 
            onClick={onOpenShop}
            className="h-10 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-300/20 to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex flex-col items-center justify-center w-full relative z-10">
              <TrendingUp className="h-3 w-3 mb-1" />
              <span className="text-xs font-bold">Stats</span>
            </div>
          </Button>

          <Button 
            onClick={onOpenShop}
            className="h-10 bg-gradient-to-r from-lime-500 via-lime-600 to-lime-700 hover:from-lime-600 hover:via-lime-700 hover:to-lime-800 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-0 rounded-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-lime-300/20 to-lime-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex flex-col items-center justify-center w-full relative z-10">
              <Gamepad2 className="h-3 w-3 mb-1" />
              <span className="text-xs font-bold">Games</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHomeButtons; 