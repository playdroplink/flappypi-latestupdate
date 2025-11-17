import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface WindStormModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const WindStormModePage: React.FC<WindStormModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'windstorm',
    name: 'Wind Storm Mode',
    description: 'Random wind gusts push you! Survive for a rare skin.',
    icon: '🌪️',
    difficulty: 'Extreme',
    reward: 'Rare Skin',
    rules: {
      wind: true,
      surviveSeconds: 30
    },
    mechanics: {
      pipeGap: 140,       // Slightly smaller gap
      pipeSpeed: 2.3,     // Faster pipes
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 90,  // Normal frequency
      specialEffects: ['wind_gusts', 'wind_indicators', 'storm_effects']
    },
    completionCondition: {
      type: 'survival' as const,
      value: 30
    },
    background: 'bg-gradient-to-b from-gray-600 to-gray-800',
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

export default WindStormModePage;
