import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface MysteryModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const MysteryModePage: React.FC<MysteryModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'mystery',
    name: 'Mystery Mode',
    description: 'Random effects every 15 seconds. Expect the unexpected!',
    icon: '❓',
    difficulty: 'Extreme',
    reward: 'Mystery Box',
    rules: {
      mystery: true,
      randomEffects: true
    },
    mechanics: {
      pipeGap: 150,       // Normal gap
      pipeSpeed: 2.0,     // Normal speed
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 80,  // Normal frequency
      specialEffects: ['random_effects', 'mystery_indicators', 'chaos_effects']
    },
    completionCondition: {
      type: 'time',
      value: 45
    },
    background: 'bg-gradient-to-b from-purple-600 to-pink-500',
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

export default MysteryModePage;
