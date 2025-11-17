import React from 'react';
import { X, Play, Info, Target, Clock, Shield, Wind, Moon, Zap, RotateCcw, Flame, Snowflake, HelpCircle, Mic } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ChallengeMechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  challenge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: string;
    reward: string | number;
    rules: Record<string, any>;
    mechanics: {
      pipeGap: number;
      pipeSpeed: number;
      gravity: number;
      flapStrength: number;
      pipeFrequency: number;
      specialEffects: string[];
    };
    completionCondition: {
      type: 'pipes' | 'time' | 'survival';
      value: number;
    };
    background: string;
    obstacles: any[];
    powerUps: any[];
  };
}

const ChallengeMechanicsModal: React.FC<ChallengeMechanicsModalProps> = ({
  isOpen,
  onClose,
  onStart,
  challenge
}) => {
  if (!isOpen) return null;

  const getChallengeIcon = (challengeId: string) => {
    const iconMap = {
      'precision': <Target className="w-6 h-6" />,
      'timebomb': <Clock className="w-6 h-6" />,
      'gravityflip': <RotateCcw className="w-6 h-6" />,
      'windstorm': <Wind className="w-6 h-6" />,
      'nightflight': <Moon className="w-6 h-6" />,
      'speedrush': <Zap className="w-6 h-6" />,
      'reverse': <RotateCcw className="w-6 h-6" />,
      'shieldrun': <Shield className="w-6 h-6" />,
      'lavaescape': <Flame className="w-6 h-6" />,
      'iceslide': <Snowflake className="w-6 h-6" />,
      'mystery': <HelpCircle className="w-6 h-6" />,
      'screampi': <Mic className="w-6 h-6" />
    };
    return iconMap[challengeId] || <Target className="w-6 h-6" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Hard': 'bg-orange-100 text-orange-800 border-orange-200',
      'Extreme': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMechanicsDescription = (challengeId: string) => {
    const descriptions = {
      'precision': {
        title: 'Precision Mechanics',
        description: 'Tighter pipes and weaker jumps require perfect timing',
        mechanics: [
          'Pipe Gap: 90px (Tighter than normal)',
          'Flap Strength: -6 (Weaker than normal)',
          'Pipe Speed: 2.2x (Faster movement)',
          'Pipe Frequency: 120 (More frequent pipes)'
        ]
      },
      'timebomb': {
        title: 'Time Bomb Mechanics',
        description: 'Race against time before the bomb explodes!',
        mechanics: [
          'Timer: 15 seconds (Extends per pipe)',
          'Timer Extension: +3 seconds per pipe passed',
          'Pipe Speed: 2.5x (Faster than normal)',
          'Explosion: Game over if timer reaches zero'
        ]
      },
      'gravityflip': {
        title: 'Gravity Flip Mechanics',
        description: 'Gravity reverses every 10 seconds - adapt quickly!',
        mechanics: [
          'Gravity Flip: Every 10 seconds',
          'Pipe Rotation: Pipes flip with gravity',
          'Normal Gap: 150px (Standard difficulty)',
          'Visual Indicators: Gravity direction shown'
        ]
      },
      'windstorm': {
        title: 'Wind Storm Mechanics',
        description: 'Random wind gusts push you around - survive the storm!',
        mechanics: [
          'Wind Force: Random gusts every second',
          'Wind Direction: Changes unpredictably',
          'Survival Time: 30 seconds minimum',
          'Wind Resistance: Affects bird movement'
        ]
      },
      'nightflight': {
        title: 'Night Flight Mechanics',
        description: 'Limited visibility - use sound and glows to survive',
        mechanics: [
          'Visibility: Limited to 120px radius',
          'Light Source: Glowing effects around bird',
          'Sound Cues: Audio indicators for obstacles',
          'Pipe Gap: 160px (Larger for difficulty)'
        ]
      },
      'speedrush': {
        title: 'Speed Rush Mechanics',
        description: 'Pipes speed up over time - can you keep up?',
        mechanics: [
          'Speed Increase: Gradual over time',
          'Base Speed: 2.0x (Starts fast)',
          'Maximum Speed: 4.0x (Gets faster)',
          'Adaptation: Requires quick reflexes'
        ]
      },
      'reverse': {
        title: 'Reverse Control Mechanics',
        description: 'Controls are reversed - tap to go down!',
        mechanics: [
          'Control Inversion: Tap to go down',
          'Flap Direction: Opposite of normal',
          'Visual Cues: Clear direction indicators',
          'Adaptation: Requires mental adjustment'
        ]
      },
      'shieldrun': {
        title: 'Shield Run Mechanics',
        description: 'You have a shield but pipes are harder - balance is key!',
        mechanics: [
          'Shield Protection: Blocks one collision',
          'Harder Pipes: Increased difficulty',
          'Shield Recharge: Limited uses',
          'Balance: Risk vs. reward strategy'
        ]
      },
      'lavaescape': {
        title: 'Lava Escape Mechanics',
        description: 'Lava rises! Climb fast or get burned',
        mechanics: [
          'Rising Lava: Moves up continuously',
          'Escape Speed: Must outrun lava',
          'Heat Effects: Visual and audio cues',
          'Survival: Stay above the lava line'
        ]
      },
      'iceslide': {
        title: 'Ice Slide Mechanics',
        description: 'Slippery ice affects movement - control your slide!',
        mechanics: [
          'Ice Physics: Slippery movement',
          'Slide Control: Manage momentum',
          'Ice Effects: Visual slippery surfaces',
          'Balance: Control vs. speed'
        ]
      },
      'mystery': {
        title: 'Mystery Mode Mechanics',
        description: 'Random effects every 15 seconds - expect the unexpected!',
        mechanics: [
          'Random Effects: Changes every 15 seconds',
          'Effect Types: Wind, gravity, speed, etc.',
          'Unpredictable: No pattern to follow',
          'Adaptation: Quick response required'
        ]
      },
      'screampi': {
        title: 'Scream Pi Mechanics',
        description: 'Use your voice to control the game! Scream to score points',
        mechanics: [
          'Voice Control: Use microphone input',
          'Scream Detection: Voice intensity matters',
          'Audio Visualizer: Visual feedback',
          'Voice Scoring: Points based on voice commands'
        ]
      }
    };
    return descriptions[challengeId] || {
      title: 'Challenge Mechanics',
      description: 'Special game mechanics for this challenge',
      mechanics: ['Custom mechanics apply']
    };
  };

  const mechanicsInfo = getMechanicsDescription(challenge.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-200 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative flex items-center justify-between p-10 border-b border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-32 h-32 bg-blue-400 rounded-full"></div>
            <div className="absolute top-8 right-8 w-24 h-24 bg-purple-400 rounded-full"></div>
            <div className="absolute bottom-4 left-1/3 w-16 h-16 bg-pink-400 rounded-full"></div>
          </div>
          
          <div className="relative flex items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              {getChallengeIcon(challenge.id)}
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{challenge.name}</h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-md">{challenge.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="relative text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-3 transition-all duration-200 hover:scale-110"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-10">
          {/* Challenge Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="group border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-orange-500 text-white rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  Difficulty Level
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge className={`${getDifficultyColor(challenge.difficulty)} text-base font-bold px-4 py-2 rounded-full shadow-md`}>
                  {challenge.difficulty}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">Challenge intensity rating</p>
              </CardContent>
            </Card>

            <Card className="group border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-purple-500 text-white rounded-lg">
                    <Play className="w-5 h-5" />
                  </div>
                  Reward
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {typeof challenge.reward === 'number' ? `${challenge.reward} Coins` : challenge.reward}
                </div>
                <p className="text-sm text-gray-600">Complete to earn this reward</p>
              </CardContent>
            </Card>
          </div>

          {/* Mechanics Description */}
          <Card className="group border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold text-gray-900">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <div>{mechanicsInfo.title}</div>
                  <div className="text-sm font-normal text-gray-600 mt-1">{mechanicsInfo.description}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {mechanicsInfo.mechanics.map((mechanic, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mt-1 flex-shrink-0 shadow-sm"></div>
                    <span className="text-base text-gray-800 leading-relaxed font-medium">{mechanic}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion Condition */}
          <Card className="group border-2 border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold text-gray-900">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl shadow-lg">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div>Completion Goal</div>
                  <div className="text-sm font-normal text-gray-600 mt-1">What you need to achieve</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center p-6 bg-white rounded-2xl border-2 border-green-200 shadow-inner">
                {challenge.completionCondition.type === 'pipes' && (
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      Pass {challenge.completionCondition.value} Pipes
                    </div>
                    <div className="text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-full inline-block">
                      Navigate through {challenge.completionCondition.value} pipe obstacles
                    </div>
                  </div>
                )}
                {challenge.completionCondition.type === 'time' && (
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      Survive {challenge.completionCondition.value} Seconds
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-full inline-block">
                      Stay alive for {challenge.completionCondition.value} seconds
                    </div>
                  </div>
                )}
                {challenge.completionCondition.type === 'survival' && (
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      Survive {challenge.completionCondition.value} Seconds
                    </div>
                    <div className="text-sm text-gray-600 bg-purple-50 px-4 py-2 rounded-full inline-block">
                      Endure for {challenge.completionCondition.value} seconds
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Effects */}
          {challenge.mechanics.specialEffects.length > 0 && (
            <Card className="group border-2 border-yellow-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold text-gray-900">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl shadow-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div>Special Effects</div>
                    <div className="text-sm font-normal text-gray-600 mt-1">Unique game mechanics</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-3">
                  {challenge.mechanics.specialEffects.map((effect, index) => (
                    <Badge key={index} variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 text-sm font-bold px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                      {effect.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-6 p-10 border-t border-gray-200 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-14 text-lg font-bold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105"
          >
            Cancel
          </Button>
          <Button
            onClick={onStart}
            className="flex-1 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:scale-105 transform"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Challenge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeMechanicsModal;
