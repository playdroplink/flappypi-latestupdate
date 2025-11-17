import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Zap, Trophy, X, Target, Clock, Wind, Moon, Shield, Star } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';

interface GameModeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'classic' | 'endless' | 'challenge' | 'scream-pi') => void;
}

// Floating coin component
const FloatingCoin: React.FC<{ 
  x: number; 
  y: number; 
  delay: number; 
  duration: number;
  size: number;
}> = ({ x, y, delay, duration, size }) => {
  return (
    <img
      src="/flappycoins.png"
      alt="Floating Coin"
      className="absolute pointer-events-none animate-bounce-slow"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        zIndex: 1,
        opacity: 0.8,
        filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.6))',
      }}
    />
  );
};

const GameModeModal: React.FC<GameModeModalProps> = ({ open, onClose, onSelectMode }) => {
  const { profile, isAuthenticated } = useUserProfile();
  const navigate = useNavigate();
  const [floatingCoins, setFloatingCoins] = useState<Array<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  // Generate floating coins when modal opens
  useEffect(() => {
    if (open) {
      const coins = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10, // 10% to 90% of width
        y: Math.random() * 60 + 20, // 20% to 80% of height
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2, // 3-5 seconds
        size: 24 + Math.random() * 16, // 24-40px
      }));
      setFloatingCoins(coins);
    }
  }, [open]);

  const gameModes = [
    {
      id: 'classic',
      title: 'Classic Mode',
      description: 'The original Flappy Bird experience. Try to get the highest score!',
      icon: <Play className="w-8 h-8" />,
      color: 'bg-green-500 hover:bg-green-600',
      features: ['Standard gameplay', 'Score tracking', 'Leaderboard'],
      difficulty: 'Easy',
      bestFor: 'Beginners'
    },
    {
      id: 'endless',
      title: 'Endless Mode',
      description: 'Survive as long as possible with increasing difficulty.',
      icon: <Zap className="w-8 h-8" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      features: ['Infinite gameplay', 'Progressive difficulty', 'Survival focus'],
      difficulty: 'Medium',
      bestFor: 'Experienced players'
    },
    {
      id: 'challenge',
      title: 'Challenge Mode',
      description: 'Face unique challenges and special obstacles with 11 different modes!',
      icon: <Trophy className="w-8 h-8" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      features: ['11 unique challenges', 'Special mechanics', 'Achievement system', 'Rare rewards'],
      difficulty: 'Hard',
      bestFor: 'Expert players'
    },
    {
      id: 'scream-pi',
      title: 'Scream Pi Mode',
      description: 'Use your voice to control the game! Scream to score points and complete the challenge.',
      icon: <span className="text-2xl">🎤</span>,
      color: 'bg-red-500 hover:bg-red-600',
      features: ['Voice control', 'Scream scoring', 'Social challenge badge', 'Unique mechanics'],
      difficulty: 'Medium',
      bestFor: 'Voice gamers'
    }
  ];

  const challengeModes = [
    { name: 'Precision Mode', icon: '🎯', difficulty: 'Medium', description: 'Tighter pipes, weaker jumps' },
    { name: 'Time Bomb Mode', icon: '💣', difficulty: 'Hard', description: 'Race against the clock' },
    { name: 'Gravity Flip Mode', icon: '🌀', difficulty: 'Hard', description: 'Gravity reverses every 10s' },
    { name: 'Wind Storm Mode', icon: '🌪️', difficulty: 'Extreme', description: 'Random wind gusts' },
    { name: 'Night Flight Mode', icon: '🌑', difficulty: 'Medium', description: 'Limited visibility' },
    { name: 'Speed Rush Mode', icon: '⚡', difficulty: 'Hard', description: 'Pipes speed up over time' },
    { name: 'Reverse Control Mode', icon: '💫', difficulty: 'Extreme', description: 'Tap to fall, not rise' },
    { name: 'Ice Slide Mode', icon: '🧊', difficulty: 'Medium', description: 'Slippery mechanics' },
    { name: 'Lava Escape Mode', icon: '🔥', difficulty: 'Extreme', description: 'Rising lava challenge' },
    { name: 'Shield Run Mode', icon: '🛡️', difficulty: 'Hard', description: 'Start with shield protection' },
    { name: 'Mystery Mode', icon: '❓', difficulty: 'Extreme', description: 'Random effects every 15s' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-orange-500';
      case 'Extreme': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-white border shadow-lg rounded-lg overflow-hidden p-0 relative">
        {/* Floating coins background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingCoins.map((coin) => (
            <FloatingCoin
              key={coin.id}
              x={coin.x}
              y={coin.y}
              delay={coin.delay}
              duration={coin.duration}
              size={coin.size}
            />
          ))}
        </div>
        <DialogHeader className="p-6 border-b relative z-10 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-800">Select Game Mode</DialogTitle>
            <DialogDescription>
              Choose a game mode to start playing Flappy Pi. Each mode offers a unique challenge!
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="p-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameModes.map((mode) => (
              <Card key={mode.id} className="relative overflow-hidden border-2 hover:border-gray-300 transition-all duration-200 hover:shadow-lg bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full text-white ${mode.color}`}>
                      {mode.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">{mode.title}</CardTitle>
                  <CardDescription className="text-gray-600">{mode.description}</CardDescription>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge className={`${getDifficultyColor(mode.difficulty)} text-white text-xs`}>
                      {mode.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {mode.bestFor}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-6">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                                     <Button
                     className={`w-full text-white font-bold py-3 text-lg ${mode.color}`}
                     onClick={() => {
                       // Navigate to the appropriate game route
                       const gameRoutes = {
                         'classic': '/game',
                         'endless': '/endless',
                         'challenge': '/challenge',
                         'scream-pi': '/scream-pi'
                       };
                       const route = gameRoutes[mode.id as keyof typeof gameRoutes] || '/game';
                       navigate(route);
                       onClose();
                     }}
                   >
                     Play {mode.title}
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Challenge Mode Preview */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Challenge Mode Preview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {challengeModes.map((challenge, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center border border-purple-200">
                  <div className="text-2xl mb-1">{challenge.icon}</div>
                  <div className="text-xs font-semibold text-gray-800 mb-1">{challenge.name}</div>
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white text-xs mb-1`}>
                    {challenge.difficulty}
                  </Badge>
                  <div className="text-xs text-gray-600">{challenge.description}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Select Challenge Mode to explore all 11 unique challenges with special mechanics and rewards!
              </p>
            </div>
          </div>
        </div>
        
        {/* CSS for floating coin animations */}
        <style>{`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-8px) rotate(2deg); }
            50% { transform: translateY(-16px) rotate(0deg); }
            75% { transform: translateY(-8px) rotate(-2deg); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3.5s ease-in-out infinite;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default GameModeModal; 