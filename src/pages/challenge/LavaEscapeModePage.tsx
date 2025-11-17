import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface LavaEscapeModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const LavaEscapeModePage: React.FC<LavaEscapeModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'lavaescape',
    name: 'Lava Escape Mode',
    description: 'Lava rises! Climb fast or get burned.',
    icon: '🔥',
    difficulty: 'Extreme',
    reward: 'Tiered Rewards',
    rules: {
      lava: true,
      risingLava: true
    },
    mechanics: {
      pipeGap: 160,       // Larger gap for difficulty
      pipeSpeed: 2.2,     // Faster pipes
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 90,  // Normal frequency
      specialEffects: ['rising_lava', 'lava_effects', 'heat_waves']
    },
    completionCondition: {
      type: 'pipes',
      value: 15
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

export default LavaEscapeModePage;
