import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface NightFlightModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NightFlightModePage: React.FC<NightFlightModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'nightflight',
    name: 'Night Flight Mode',
    description: 'Limited visibility. Use sound and glows to survive.',
    icon: '🌑',
    difficulty: 'Medium',
    reward: 'Mini Badge',
    rules: {
      night: true,
      lightRadius: 120
    },
    mechanics: {
      pipeGap: 160,       // Larger gap for difficulty (160px as specified)
      pipeSpeed: 2.0,     // Normal speed
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 80,  // Normal frequency
      specialEffects: ['night_vision', 'glow_effects', 'sound_indicators']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 20
    },
    background: 'bg-gradient-to-b from-indigo-900 to-purple-900',
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

export default NightFlightModePage;
