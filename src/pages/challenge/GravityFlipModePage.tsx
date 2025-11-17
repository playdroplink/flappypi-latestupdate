import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface GravityFlipModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const GravityFlipModePage: React.FC<GravityFlipModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'gravityflip',
    name: 'Gravity Flip Mode',
    description: 'Gravity reverses every 10 seconds. Pipes flip too!',
    icon: '🌀',
    difficulty: 'Hard',
    reward: 200,
    rules: {
      gravityFlipInterval: 10
    },
    mechanics: {
      pipeGap: 150,       // Normal gap
      pipeSpeed: 2.0,     // Normal speed
      gravity: 0.5,       // Base gravity (will flip)
      flapStrength: -8,   // Normal flap
      pipeFrequency: 80,  // Normal frequency
      specialEffects: ['gravity_flip', 'pipe_rotation', 'gravity_indicator']
    },
    completionCondition: {
      type: 'time',
      value: 60
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

export default GravityFlipModePage;
