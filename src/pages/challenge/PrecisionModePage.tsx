import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface PrecisionModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const PrecisionModePage: React.FC<PrecisionModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'precision',
    name: 'Precision Mode',
    description: 'Pipes are closer together and Flappy Pi\'s jump is weaker. Tap with precision!',
    icon: '🎯',
    difficulty: 'Medium',
    reward: 100,
    rules: {
      pipeGap: 90,
      flapStrength: -6,
      coinBonus: 2
    },
    mechanics: {
      pipeGap: 90,        // Closer pipes
      pipeSpeed: 2.2,     // Slightly faster
      gravity: 0.6,       // Normal gravity
      flapStrength: -6,   // Weaker flap
      pipeFrequency: 120, // More frequent pipes
      specialEffects: ['precision_indicators']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 15
    },
    background: 'bg-gradient-to-b from-blue-400 to-cyan-400',
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

export default PrecisionModePage;
