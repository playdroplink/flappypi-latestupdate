import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface IceSlideModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const IceSlideModePage: React.FC<IceSlideModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'iceslide',
    name: 'Ice Slide Mode',
    description: 'Slippery ground and sliding pipes. Watch your step!',
    icon: '🧊',
    difficulty: 'Medium',
    reward: 'Winter Coins',
    rules: {
      ice: true,
      slippery: true,
      slidePhysics: true
    },
    mechanics: {
      pipeGap: 120,       // Smaller gap for ice challenge
      pipeSpeed: 2.0,     // Normal speed
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 80,  // Normal frequency
      specialEffects: ['ice_sliding', 'slippery_pipes', 'winter_effects']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 18
    },
    background: 'bg-gradient-to-b from-cyan-400 to-blue-500',
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

export default IceSlideModePage;
