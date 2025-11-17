import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ArrowLeft, Play, Lock, Star, Target, Clock, Wind, Moon, Shield, Zap, Mic } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { checkSocialChallengeCompletion } from '../../utils/socialChallengeUtils';

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
  color: string;
  gradient: string;
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
    unlocked: true, // Always unlocked - no social challenge required
    route: ROUTES.CHALLENGE_PRECISION,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'from-blue-50 to-cyan-50'
  },
  {
    id: 'timebomb',
    name: 'Time Bomb Mode',
    description: 'Pass enough pipes before the bomb explodes! Timer extends per pipe.',
    icon: '💣',
    difficulty: 'Hard',
    reward: 500,
    rules: { timer: 15, timerPerPipe: 3, pipesToPass: 10, bigReward: 500 },
    unlocked: true, // Always unlocked - no social challenge required
    route: ROUTES.CHALLENGE_TIMEBOMB,
    color: 'from-red-500 to-orange-500',
    gradient: 'from-red-50 to-orange-50'
  },
  {
    id: 'gravityflip',
    name: 'Gravity Flip Mode',
    description: 'Gravity reverses every 10 seconds. Pipes flip too!',
    icon: '🌀',
    difficulty: 'Hard',
    reward: 200,
    rules: { gravityFlipInterval: 10 },
    unlocked: true, // Always unlocked - no social challenge required
    route: ROUTES.CHALLENGE_GRAVITY_FLIP,
    color: 'from-purple-500 to-pink-500',
    gradient: 'from-purple-50 to-pink-50'
  },
  {
    id: 'windstorm',
    name: 'Wind Storm Mode',
    description: 'Random wind gusts push you! Survive for a rare skin.',
    icon: '🌪️',
    difficulty: 'Extreme',
    reward: 'Rare Skin',
    rules: { wind: true, surviveSeconds: 30 },
    unlocked: true, // Always unlocked - no social challenge required
    route: ROUTES.CHALLENGE_WIND_STORM,
    color: 'from-gray-500 to-blue-500',
    gradient: 'from-gray-50 to-blue-50'
  },
  {
    id: 'nightflight',
    name: 'Night Flight Mode',
    description: 'Limited visibility. Use sound and glows to survive.',
    icon: '🌑',
    difficulty: 'Medium',
    reward: 'Mini Badge',
    rules: { night: true, lightRadius: 120 },
    unlocked: true, // Always unlocked - no social challenge required
    route: ROUTES.CHALLENGE_NIGHT_FLIGHT,
    color: 'from-gray-700 to-gray-900',
    gradient: 'from-gray-50 to-gray-100'
  },
  {
    id: 'speedrush',
    name: 'Speed Rush Mode',
    description: 'Pipes speed up over time. Can you keep up?',
    icon: '⚡',
    difficulty: 'Hard',
    reward: 'XP Boost',
    rules: { speedUp: true },
    unlocked: true, // Always unlocked - no social challenge required
    route: ROUTES.CHALLENGE_SPEED_RUSH,
    color: 'from-yellow-500 to-orange-500',
    gradient: 'from-yellow-50 to-orange-50'
  },
  {
    id: 'reverse',
    name: 'Reverse Control Mode',
    description: 'Tap to fall, not rise. Brain-bending challenge!',
    icon: '💫',
    difficulty: 'Extreme',
    reward: 'Mirror Skin',
    rules: { reverseControl: true },
    unlocked: true, // Unlocked
    route: ROUTES.CHALLENGE_REVERSE,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'from-indigo-50 to-purple-50'
  },
  {
    id: 'iceslide',
    name: 'Ice Slide Mode',
    description: 'Slippery ground and sliding pipes. Watch your step!',
    icon: '🧊',
    difficulty: 'Medium',
    reward: 'Winter Coins',
    rules: { ice: true, slippery: true },
    unlocked: true, // Unlocked
    route: ROUTES.CHALLENGE_ICE_SLIDE,
    color: 'from-cyan-500 to-blue-500',
    gradient: 'from-cyan-50 to-blue-50'
  },
  {
    id: 'lavaescape',
    name: 'Lava Escape Mode',
    description: 'Lava rises! Climb fast or get burned.',
    icon: '🔥',
    difficulty: 'Extreme',
    reward: 'Tiered Rewards',
    rules: { lava: true, risingLava: true },
    unlocked: true, // Unlocked
    route: ROUTES.CHALLENGE_LAVA_ESCAPE,
    color: 'from-red-600 to-orange-600',
    gradient: 'from-red-50 to-orange-50'
  },
  {
    id: 'shieldrun',
    name: 'Shield Run Mode',
    description: 'You have a shield but pipes are harder. Balance is key!',
    icon: '🛡️',
    difficulty: 'Medium',
    reward: 'Bonus Coins',
    rules: { shield: true, harderPipes: true },
    unlocked: true, // Unlocked
    route: ROUTES.CHALLENGE_SHIELD_RUN,
    color: 'from-green-500 to-emerald-500',
    gradient: 'from-green-50 to-emerald-50'
  },
  {
    id: 'mystery',
    name: 'Mystery Mode',
    description: 'Random effects every 15 seconds. Expect the unexpected!',
    icon: '❓',
    difficulty: 'Extreme',
    reward: 'Mystery Box',
    rules: { mystery: true, randomEffects: true },
    unlocked: true, // Unlocked
    route: ROUTES.CHALLENGE_MYSTERY,
    color: 'from-pink-500 to-purple-500',
    gradient: 'from-pink-50 to-purple-50'
  },
  {
    id: 'screampi',
    name: 'Scream Pi Challenge',
    description: 'Use your voice to control the game! Scream to score points and complete the challenge.',
    icon: '🎤',
    difficulty: 'Medium',
    reward: 'Voice Control Badge',
    rules: { voiceControl: true, screamScoring: true, timeLimit: 60 },
    unlocked: true, // Unlocked - Available
    route: ROUTES.CHALLENGE_SCREAM_PI,
    color: 'from-purple-500 to-pink-500',
    gradient: 'from-purple-50 to-pink-50'
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

const getChallengeIcon = (icon: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    '🎯': <Target className="w-6 h-6" />,
    '💣': <Clock className="w-6 h-6" />,
    '🌀': <Wind className="w-6 h-6" />,
    '🌪️': <Wind className="w-6 h-6" />,
    '🌑': <Moon className="w-6 h-6" />,
    '⚡': <Zap className="w-6 h-6" />,
    '💫': <Star className="w-6 h-6" />,
    '🎤': <Mic className="w-6 h-6" />,
    '🧊': <Star className="w-6 h-6" />,
    '🔥': <Zap className="w-6 h-6" />,
    '🛡️': <Shield className="w-6 h-6" />,
    '❓': <Star className="w-6 h-6" />
  };
  return iconMap[icon] || <Trophy className="w-6 h-6" />;
};

const ChallengeIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'difficulty' | 'name' | 'reward'>('difficulty');
  // Removed lock modal state - all modes unlocked except duels

  // Unlock all game modes except duels
  useEffect(() => {
    const unlockAllModesExceptDuels = () => {
      // Unlock all challenges except duels
      CHALLENGES.forEach(challenge => {
        // Keep duels locked, unlock everything else
        if (challenge.id.includes('duel') || challenge.name.toLowerCase().includes('duel')) {
          challenge.unlocked = false; // Keep duels locked
        } else {
          challenge.unlocked = true; // Unlock all other modes
        }
      });
    };

    unlockAllModesExceptDuels();
  }, []);

  const filteredChallenges = CHALLENGES.filter(challenge => 
    selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty
  );

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    switch (sortBy) {
      case 'difficulty':
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Extreme': 4 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'name':
        return a.name.localeCompare(b.name);
      case 'reward':
        const aReward = typeof a.reward === 'number' ? a.reward : 0;
        const bReward = typeof b.reward === 'number' ? b.reward : 0;
        return bReward - aReward;
      default:
        return 0;
    }
  });

  const handleChallengeSelect = (challenge: Challenge) => {
    if (!challenge.unlocked) {
      // Only duels are locked - show message
      console.log('Duels are coming soon!');
      return;
    }
    navigate(challenge.route);
  };

  // Removed lock modal functions - all modes unlocked except duels

  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  const stats = {
    total: CHALLENGES.length,
    unlocked: CHALLENGES.filter(c => c.unlocked).length,
    completed: CHALLENGES.filter(c => c.bestScore && c.bestScore > 0).length,
    totalRewards: CHALLENGES.reduce((sum, c) => {
      const reward = typeof c.reward === 'number' ? c.reward : 0;
      return sum + reward;
    }, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏆 Challenge Mode</h1>
            <p className="text-gray-600">Test your skills with unique challenges</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Challenges</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.unlocked}</div>
              <div className="text-sm text-gray-600">Unlocked</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalRewards}</div>
              <div className="text-sm text-gray-600">Total Rewards</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Difficulty:</span>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Extreme">Extreme</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              <option value="difficulty">Difficulty</option>
              <option value="name">Name</option>
              <option value="reward">Reward</option>
            </select>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChallenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                !challenge.unlocked ? 'opacity-50' : ''
              }`}
              onClick={() => handleChallengeSelect(challenge)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className={`p-3 rounded-full text-white bg-gradient-to-r ${challenge.color}`}>
                    <span className="text-2xl">{challenge.icon}</span>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">{challenge.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{challenge.description}</CardDescription>
                
                {/* Pi Browser Mobile Note for Scream Pi Challenge */}
                {challenge.id === 'screampi' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-600 text-sm">📱</span>
                      <div className="text-left">
                        <div className="font-bold text-yellow-800 text-xs">Pi Browser Mobile Note:</div>
                        <div className="text-yellow-700 text-xs">Voice commands will be available soon when Pi Browser mobile allows microphone access. For now, use tap screen controls.</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                    {getDifficultyIcon(challenge.difficulty)} {challenge.difficulty}
                  </Badge>
                  {!challenge.unlocked && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                
                <div className="text-center mb-3">
                  <div className="text-sm text-gray-600 mb-1">Reward</div>
                  <div className="font-semibold text-purple-600">
                    {typeof challenge.reward === 'number' ? `${challenge.reward} Coins` : challenge.reward}
                  </div>
                </div>

                {challenge.bestScore && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Best Score</span>
                      <span>{challenge.bestScore}</span>
                    </div>
                    {challenge.completionRate && (
                      <Progress value={challenge.completionRate} className="h-1" />
                    )}
                  </div>
                )}

                <Button
                  className={`w-full bg-gradient-to-r ${challenge.color} hover:opacity-90 text-white font-bold`}
                  disabled={!challenge.unlocked}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {challenge.unlocked ? 'Play Challenge' : 'Locked'}
                </Button>
                {!challenge.unlocked && (
                  <div className="mt-2 text-center text-xs text-red-500 font-semibold">
                    Locked - Duels Coming Soon
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🏆 Challenge Mode Tips</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Each challenge has unique mechanics and rewards</p>
              <p>• Complete challenges to unlock special skins and badges</p>
              <p>• Your best scores are tracked for each challenge</p>
              <p>• Some challenges require specific achievements to unlock</p>
              <p>• Try different strategies for each challenge type</p>
            </div>
          </div>
        </div>
      </div>

      {/* Removed lock modal - all modes unlocked except duels */}
    </div>
  );
};

export default ChallengeIndexPage; 