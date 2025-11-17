import React from 'react';
import { CoinIcon } from './CoinIcon'; // Assuming you have a coin icon

interface ShareScoreTemplateProps {
  score: number;
  level: number;
  coins: number;
  bestScore: number;
  username: string;
  birdSkinUrl: string;
  backgroundColor: string;
  templateRef: React.RefObject<HTMLDivElement>;
  piUserId?: string;
  gameMode?: string;
}

const ShareScoreTemplate: React.FC<ShareScoreTemplateProps> = ({
  score,
  level,
  coins,
  bestScore,
  username,
  birdSkinUrl,
  backgroundColor,
  templateRef,
  piUserId,
  gameMode,
}) => {
  // Format game mode name for display
  const formatGameMode = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case 'classic':
        return 'Classic';
      case 'endless':
        return 'Endless';
      case 'challenge':
        return 'Challenge';
      case 'precision':
        return 'Precision';
      case 'screampi':
      case 'scream pi':
        return 'Scream Pi';
      case 'smooth':
        return 'Smooth';
      case 'goldrush':
        return 'Gold Rush';
      case 'timebomb':
        return 'Time Bomb';
      case 'gravityflip':
        return 'Gravity Flip';
      case 'windstorm':
        return 'Wind Storm';
      case 'nightflight':
        return 'Night Flight';
      case 'speedrush':
        return 'Speed Rush';
      case 'reverse':
        return 'Reverse Control';
      case 'iceslide':
        return 'Ice Slide';
      case 'lavaescape':
        return 'Lava Escape';
      case 'shieldrun':
        return 'Shield Run';
      case 'mystery':
        return 'Mystery Mode';
      default:
        return mode?.charAt(0).toUpperCase() + mode?.slice(1) || 'Classic';
    }
  };

  return (
    <div
      ref={templateRef}
      className="w-[400px] h-[700px] text-white p-8 flex flex-col items-center justify-between"
      style={{ backgroundColor }}
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Flappy Pi</h1>
        {gameMode && (
          <div className="mb-4 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-xl p-4 border-2 border-white/60 shadow-lg">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🎮</span>
              <p className="text-xl font-bold text-white">{formatGameMode(gameMode)} Mode</p>
            </div>
            <div className="mt-1 text-center">
              <p className="text-xs text-white/80">Game Mode</p>
            </div>
          </div>
        )}
        <img 
          src={birdSkinUrl} 
          alt="Your Bird" 
          className="w-24 h-24 mx-auto rounded-full border-4 border-white" 
          onError={(e) => {
            // Fallback to default bird if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/birds/bird_0.png';
          }}
        />
        <div className="mt-4">
          <p className="text-2xl font-bold text-white">@{username.charAt(0).toUpperCase() + username.slice(1)}</p>
          {piUserId && (
            <p className="text-sm text-white/80 mt-1">Pi ID: {piUserId}</p>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white bg-opacity-30 rounded-lg p-4 mb-4 text-center">
          <p className="text-lg">Your Score</p>
          <p className="text-6xl font-bold">{score}</p>
        </div>
        <div className="bg-white bg-opacity-30 rounded-lg p-4 mb-4 text-center">
          <p className="text-lg">Level Reached</p>
          <p className="text-4xl font-bold">{level}</p>
        </div>
        <div className="bg-white bg-opacity-30 rounded-lg p-4 mb-4 text-center">
          <p className="text-lg">Best Score</p>
          <p className="text-4xl font-bold">{bestScore}</p>
        </div>
        <div className="bg-white bg-opacity-30 rounded-lg p-4 flex items-center justify-center text-center">
          <p className="text-lg mr-2">Flappy Coins</p>
          <div className="flex items-center">
            <CoinIcon className="w-8 h-8" />
            <p className="text-4xl font-bold ml-2">{coins}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl">Join the Pi Network gaming revolution!</p>
        <p className="text-sm">Powered by the Mrwain Organization</p>
      </div>
    </div>
  );
};

export default ShareScoreTemplate; 