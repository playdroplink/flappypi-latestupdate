import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface TimeBombModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const TimeBombModePage: React.FC<TimeBombModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
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
      pipeGap: 120,       // Normal gap
      pipeSpeed: 2.5,     // Faster pipes
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 100, // Normal frequency
      specialEffects: ['bomb_timer', 'explosion_warning']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 10
    },
    background: 'bg-gradient-to-b from-red-600 to-orange-500',
    obstacles: [],
    powerUps: []
  };

  return (
    <ChallengeModeWrapper
      challenge={challenge}
      musicEnabled={musicEnabled}
      setMusicEnabled={setMusicEnabled}
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
    />
  );
};

export default TimeBombModePage;
