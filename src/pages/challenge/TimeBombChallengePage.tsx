import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowLeft, Play, Trophy, Info, Zap } from 'lucide-react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';
import { ROUTES } from '../../constants/routes';

const TimeBombChallengePage: React.FC<{
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}> = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);

  const challenge = {
    id: 'timebomb',
    name: 'Time Bomb Mode',
    description: 'Pass enough pipes before the bomb explodes! Timer extends per pipe.',
    icon: '💣',
    difficulty: 'Hard',
    reward: 500,
    rules: { 
      timer: 15, 
      timerPerPipe: 3, 
      pipesToPass: 10, 
      bigReward: 500
    },
    mechanics: {
      pipeGap: 120,
      pipeSpeed: 2.0,
      gravity: 0.5,
      flapStrength: -8,
      pipeFrequency: 80,
      specialEffects: ['timer_indicators', 'bomb_effects']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 10
    },
    background: 'bg-gradient-to-b from-red-500 to-orange-500',
    obstacles: [],
    powerUps: []
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleBack = () => {
    navigate(ROUTES.CHALLENGE);
  };

  if (gameStarted) {
    return (
      <ChallengeModeWrapper
        challenge={challenge}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">💣 Time Bomb Mode</h1>
            <p className="text-gray-600">Race against the clock!</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💣</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Time Bomb Challenge</h2>
          <Badge className="bg-orange-500 text-white mb-4">🟠 Hard Difficulty</Badge>
          <p className="text-gray-600 mb-6">
            You have 15 seconds to pass pipes! Each pipe gives you +3 seconds. Can you survive?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Challenge Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Initial Timer:</span>
                <span className="font-semibold">15 seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Time per Pipe:</span>
                <span className="font-semibold">+3 seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Target Pipes:</span>
                <span className="font-semibold">10 pipes</span>
              </div>
              <div className="flex justify-between">
                <span>Pipe Speed:</span>
                <span className="font-semibold">2.0x (Fast)</span>
              </div>
              <div className="flex justify-between">
                <span>Pipe Gap:</span>
                <span className="font-semibold">120px (Wide)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">500 Coins</div>
                <div className="text-sm text-gray-600">+ Time Master Badge</div>
                <div className="text-sm text-gray-600">+ Speed Achievement</div>
                <div className="text-sm text-gray-600">+ Bonus for fast completion</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Tips for Success
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• Don't waste time - every second counts!</p>
            <p>• Focus on passing pipes quickly</p>
            <p>• The timer is your biggest enemy</p>
            <p>• Practice speed in Endless Mode first</p>
            <p>• Stay focused and don't panic</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Pro Tips
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• The wider pipe gap helps with speed</p>
            <p>• Each pipe passed extends your time</p>
            <p>• Aim for 10 pipes to get the big reward</p>
            <p>• Don't collect coins if it slows you down</p>
            <p>• Speed is more important than precision here</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
          >
            Back to Challenges
          </Button>
          <Button
            onClick={handleStartGame}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Time Bomb Challenge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimeBombChallengePage; 