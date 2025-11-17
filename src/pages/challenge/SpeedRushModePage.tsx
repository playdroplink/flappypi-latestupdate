import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface SpeedRushModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SpeedRushModePage: React.FC<SpeedRushModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'speedrush',
    name: 'Speed Rush Mode',
    description: 'Pipes speed up over time. Can you keep up?',
    icon: '⚡',
    difficulty: 'Hard',
    reward: 'XP Boost',
    rules: {
      speedUp: true
    },
    mechanics: {
      pipeGap: 130,       // Normal gap
      pipeSpeed: 2.0,     // Starting speed (will increase)
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 80,  // Normal frequency
      specialEffects: ['speed_boost', 'speed_indicators', 'speed_warning']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 25
    },
    background: 'bg-gradient-to-b from-yellow-400 to-orange-500',
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

export default SpeedRushModePage;
