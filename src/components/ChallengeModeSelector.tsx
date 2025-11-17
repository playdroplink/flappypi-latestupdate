import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap, Shield, Star, Lock, Play, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  reward: string | number;
  rules: Record<string, any>;
  unlocked: boolean;
  bestScore?: number;
  completionRate?: number;
  route: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'precision',
    name: 'Precision Mode',
    description: 'Pipes are closer together and Flappy Pi\'s jump is weaker. Tap with precision!',
    icon: '🎯',
    difficulty: 'Medium',
    reward: 100,
    rules: { pipeGap: 90, flapStrength: -6, coinBonus: 2 },
    unlocked: true,
    route: ROUTES.CHALLENGE_PRECISION
  },
  {
    id: 'timebomb',
    name: 'Time Bomb Mode',
    description: 'Pass enough pipes before the bomb explodes! Timer extends per pipe.',
    icon: '💣',
    difficulty: 'Hard',
    reward: 500,
    rules: { timer: 15, timerPerPipe: 3, pipesToPass: 10, bigReward: 500 },
    unlocked: true,
    route: ROUTES.CHALLENGE_TIMEBOMB
  },
  {
    id: 'gravityflip',
    name: 'Gravity Flip Mode',
    description: 'Gravity reverses every 10 seconds. Pipes flip too!',
    icon: '🌀',
    difficulty: 'Hard',
    reward: 200,
    rules: { gravityFlipInterval: 10 },
    unlocked: true,
    route: ROUTES.CHALLENGE_GRAVITY_FLIP
  },
  {
    id: 'windstorm',
    name: 'Wind Storm Mode',
    description: 'Random wind gusts push you! Survive for a rare skin.',
    icon: '🌪️',
    difficulty: 'Extreme',
    reward: 'Rare Skin',
    rules: { wind: true, surviveSeconds: 30 },
    unlocked: true,
    route: ROUTES.CHALLENGE_WIND_STORM
  },
  {
    id: 'nightflight',
    name: 'Night Flight Mode',
    description: 'Limited visibility. Use sound and glows to survive.',
    icon: '🌑',
    difficulty: 'Medium',
    reward: 'Mini Badge',
    rules: { night: true, lightRadius: 120 },
    unlocked: true,
    route: ROUTES.CHALLENGE_NIGHT_FLIGHT
  },
  {
    id: 'speedrush',
    name: 'Speed Rush Mode',
    description: 'Pipes speed up over time. Can you keep up?',
    icon: '⚡',
    difficulty: 'Hard',
    reward: 'XP Boost',
    rules: { speedUp: true },
    unlocked: true,
    route: ROUTES.CHALLENGE_SPEED_RUSH
  },
  {
    id: 'reverse',
    name: 'Reverse Control Mode',
    description: 'Tap to fall, not rise. Brain-bending challenge!',
    icon: '💫',
    difficulty: 'Extreme',
    reward: 'Mirror Skin',
    rules: { reverseControl: true },
    unlocked: true,
    route: ROUTES.CHALLENGE_REVERSE
  },
  {
    id: 'iceslide',
    name: 'Ice Slide Mode',
    description: 'Slippery ground and sliding pipes. Watch your step!',
    icon: '🧊',
    difficulty: 'Medium',
    reward: 'Winter Coins',
    rules: { ice: true, slippery: true },
    unlocked: true,
    route: ROUTES.CHALLENGE_ICE_SLIDE
  },
  {
    id: 'lavaescape',
    name: 'Lava Escape Mode',
    description: 'Lava rises! Climb fast or get burned.',
    icon: '🔥',
    difficulty: 'Extreme',
    reward: 'Tiered Rewards',
    rules: { lava: true, risingLava: true },
    unlocked: true,
    route: ROUTES.CHALLENGE_LAVA_ESCAPE
  },
  {
    id: 'shieldrun',
    name: 'Shield Run Mode',
    description: 'Start with a shield. Pipes get harder. Bonus for no shield use!',
    icon: '🛡️',
    difficulty: 'Hard',
    reward: 'Bonus Coins',
    rules: { shield: true, harderPipes: true },
    unlocked: true,
    route: ROUTES.CHALLENGE_SHIELD_RUN
  },
  {
    id: 'mystery',
    name: 'Mystery Mode',
    description: 'Random effects every 15 seconds. Expect the unexpected!',
    icon: '❓',
    difficulty: 'Extreme',
    reward: 'Mystery Box',
    rules: { mystery: true, randomEffects: true },
    unlocked: true,
    route: ROUTES.CHALLENGE_MYSTERY
  },
  {
    id: 'screampi',
    name: 'Scream Pi Challenge',
    description: 'Use your voice to control the game! Scream to score points and complete the challenge.',
    icon: '🎤',
    difficulty: 'Medium',
    reward: 'Voice Control Badge',
    rules: { voiceControl: true, screamScoring: true, timeLimit: 60 },
    unlocked: true,
    route: ROUTES.CHALLENGE_SCREAM_PI
  }
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

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return '🟢';
    case 'Medium': return '🟡';
    case 'Hard': return '🟠';
    case 'Extreme': return '🔴';
    default: return '⚪';
  }
};

interface ChallengeModeSelectorProps {
  onBack: () => void;
}

const ChallengeModeSelector: React.FC<ChallengeModeSelectorProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const handleChallengeSelect = (challenge: Challenge) => {
    if (!challenge.unlocked) {
      // Show unlock requirement modal or toast
      return;
    }
    setSelectedChallenge(challenge);
  };

  const handleStartChallenge = () => {
    if (selectedChallenge) {
      navigate(selectedChallenge.route);
    }
  };

  const handleBack = () => {
    if (selectedChallenge) {
      setSelectedChallenge(null);
    } else {
      onBack();
    }
  };

  if (selectedChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Challenge Details</h1>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{selectedChallenge.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedChallenge.name}</h2>
            <Badge className={`${getDifficultyColor(selectedChallenge.difficulty)} text-white mb-4`}>
              {getDifficultyIcon(selectedChallenge.difficulty)} {selectedChallenge.difficulty}
            </Badge>
            <p className="text-gray-600 mb-6">{selectedChallenge.description}</p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reward</h3>
              <div className="text-2xl font-bold text-purple-600">
                {typeof selectedChallenge.reward === 'number' ? `${selectedChallenge.reward} Coins` : selectedChallenge.reward}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Challenge Rules</h3>
              <div className="space-y-2 text-left">
                {Object.entries(selectedChallenge.rules).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-semibold text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedChallenge.bestScore && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Best Score</h3>
                <div className="text-2xl font-bold text-green-600">{selectedChallenge.bestScore}</div>
                {selectedChallenge.completionRate && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Completion Rate</span>
                      <span>{selectedChallenge.completionRate}%</span>
                    </div>
                    <Progress value={selectedChallenge.completionRate} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Back to Selection
            </Button>
            <Button
              onClick={handleStartChallenge}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Challenge
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Challenge Mode</h1>
            <p className="text-gray-600">Test your skills with unique challenges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHALLENGES.map((challenge) => (
            <Card
              key={challenge.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                !challenge.unlocked ? 'opacity-50' : ''
              }`}
              onClick={() => handleChallengeSelect(challenge)}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{challenge.icon}</div>
                <CardTitle className="text-lg font-bold text-gray-800">{challenge.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                    {getDifficultyIcon(challenge.difficulty)} {challenge.difficulty}
                  </Badge>
                  {!challenge.unlocked && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Reward</div>
                  <div className="font-semibold text-purple-600">
                    {typeof challenge.reward === 'number' ? `${challenge.reward} Coins` : challenge.reward}
                  </div>
                </div>

                {challenge.bestScore && (
                  <div className="mt-3 text-center">
                    <div className="text-xs text-gray-500">Best Score</div>
                    <div className="font-semibold text-green-600">{challenge.bestScore}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🏆 Challenge Mode Tips</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Each challenge has unique mechanics and rewards</p>
              <p>• Complete challenges to unlock special skins and badges</p>
              <p>• Your best scores are tracked for each challenge</p>
              <p>• Some challenges require specific achievements to unlock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModeSelector; 