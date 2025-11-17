import React, { memo } from 'react';
import { Trophy, Heart, Star, Play, Home } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';

interface GameUIProps {
  gameState: 'menu' | 'playing' | 'gameOver' | 'paused';
  score: number;
  level: number;
  lives: number;
  highScore: number;
  coins: number;
  gameMode: 'classic' | 'endless' | 'challenge';
  onStartGame: () => void;
  onBackToMenu: () => void;
  onOpenShop?: () => void;
  onOpenLeaderboard?: () => void;
  onShowAd: () => void;
  onShareScore: () => void;
  isPausedForRevive: boolean;
  birdSkin: string;
}

const GameUI: React.FC<GameUIProps> = memo(({
  gameState,
  score,
  level,
  lives,
  highScore,
  coins,
  gameMode,
  onStartGame,
  onBackToMenu,
  onOpenShop,
  onOpenLeaderboard,
  onShowAd,
  onShareScore,
  isPausedForRevive,
  birdSkin
}) => {
  const isMobile = useIsMobile();

  if (gameState === 'playing' && !isPausedForRevive) {
    return (
      <div className="fixed inset-0 pointer-events-none z-10" style={{transition:'all 0.2s cubic-bezier(.4,0,.2,1)'}}>
        
        {/* Top Left - Level and Game Mode */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 pointer-events-auto" style={{transition:'all 0.2s cubic-bezier(.4,0,.2,1)'}}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-white font-bold shadow-lg">
            <div className="text-xs sm:text-sm">🐦 Flappy Pi</div>
            <div className="text-xs opacity-80">Level {level}</div>
            <div className="text-xs uppercase tracking-wide">{gameMode}</div>
          </div>
        </div>

        {/* Top Right - Flappy Coins Wallet */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 pointer-events-auto" style={{transition:'all 0.2s cubic-bezier(.4,0,.2,1)'}}>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-white font-bold shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <img src="/flappycoins.png" alt="Flappy Coin" className="h-5 w-5 inline-block align-middle" />
              <span className="text-xs sm:text-sm font-bold">{coins}</span>
            </div>
            <div className="text-xs opacity-80 hidden sm:block">Flappy Coins</div>
          </div>
        </div>

        {/* Bottom Left - Lives */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 pointer-events-auto" style={{transition:'all 0.2s cubic-bezier(.4,0,.2,1)'}}>
          <div className="flex items-center gap-1 sm:gap-2 bg-red-500/90 rounded-lg px-2 sm:px-3 py-1 sm:py-2 backdrop-blur-sm shadow-lg">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-100" />
            <span className="text-white font-bold text-xs sm:text-sm">{lives}</span>
          </div>
        </div>

        {/* Bottom Right - Copyright */}
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4" style={{transition:'all 0.2s cubic-bezier(.4,0,.2,1)'}}>
          <div className="bg-black/50 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-white text-xs opacity-70">
            © 2025 mrwain organization
          </div>
        </div>

        {/* Center Top - Quick Actions (Shop & Leaderboard) */}
        <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 pointer-events-auto" style={{transition:'all 0.2s cubic-bezier(.4,0,.2,1)'}}>
          {onOpenShop && (
            <Button
              onClick={onOpenShop}
              size={isMobile ? "sm" : "default"}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 p-0 text-sm"
            >
              🛒
            </Button>
          )}
          {onOpenLeaderboard && (
            <Button
              onClick={onOpenLeaderboard}
              size={isMobile ? "sm" : "default"}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg w-8 h-8 sm:w-10 sm:h-10 p-0 text-sm"
            >
              🏆
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-20 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-8 text-center max-w-sm sm:max-w-md w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
          
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm sm:text-base">Final Score:</span>
              <span className="font-bold text-lg sm:text-xl">{score}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm sm:text-base">Level Reached:</span>
              <span className="font-bold">{level}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm sm:text-base">High Score:</span>
              <span className="font-bold text-yellow-600">{highScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm sm:text-base">Flappy Coins Earned:</span>
              <div className="flex items-center gap-1">
                <img src="/flappycoins.png" alt="Flappy Coin" className="h-4 w-4 text-yellow-400" />
                <span className="font-bold">{Math.floor(score / 3) + level * 2}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onStartGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
              size={isMobile ? "default" : "lg"}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Play Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={onShowAd}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 border-0"
                size={isMobile ? "sm" : "default"}
              >
                🔄 Revive
              </Button>
              <Button 
                onClick={onShareScore}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                size={isMobile ? "sm" : "default"}
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Share
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {onOpenLeaderboard && (
                <Button 
                  onClick={onOpenLeaderboard}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 border-0"
                  size={isMobile ? "sm" : "default"}
                >
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Leaderboard
                </Button>
              )}
              {onOpenShop && (
                <Button 
                  onClick={onOpenShop}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 border-0"
                  size={isMobile ? "sm" : "default"}
                >
                  <img src="/menu.png" alt="Menu" style={{ width: '1.5em', height: '1.5em', objectFit: 'contain', display: 'inline-block', marginRight: 8 }} />
                  Shop
                </Button>
              )}
            </div>
            
            <Button 
              onClick={onBackToMenu}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200"
              size={isMobile ? "sm" : "default"}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

export default GameUI;
