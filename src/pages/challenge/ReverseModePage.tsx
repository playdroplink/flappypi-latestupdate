import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface ReverseModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ReverseModePage: React.FC<ReverseModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'reverse',
    name: 'Reverse Control Mode',
    description: 'Tap to fall, not rise. Brain-bending challenge!',
    icon: '💫',
    difficulty: 'Extreme',
    reward: 'Mirror Skin',
    rules: {
      reverseControl: true
    },
    mechanics: {
      pipeGap: 150,       // Normal gap
      pipeSpeed: 2.0,     // Normal speed
      gravity: 0.5,       // Normal gravity
      flapStrength: 8,    // Positive flap (pushes down)
      pipeFrequency: 80,  // Normal frequency
      specialEffects: ['reverse_indicators', 'mind_bend_effects']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 12
    },
    background: 'bg-gradient-to-b from-pink-500 to-purple-600',
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

export default ReverseModePage;
