import React from 'react';
import ChallengeModeWrapper from '../../components/challenge/ChallengeModeWrapper';

interface ShieldRunModePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ShieldRunModePage: React.FC<ShieldRunModePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const challenge = {
    id: 'shieldrun',
    name: 'Shield Run Mode',
    description: 'Start with a shield. Pipes get harder. Bonus for no shield use!',
    icon: '🛡️',
    difficulty: 'Hard',
    reward: 'Bonus Coins',
    rules: {
      shield: true,
      harderPipes: true
    },
    mechanics: {
      pipeGap: 120,       // Smaller gap
      pipeSpeed: 2.0,     // Normal speed
      gravity: 0.5,       // Normal gravity
      flapStrength: -8,   // Normal flap
      pipeFrequency: 80,  // Normal frequency
      specialEffects: ['shield_protection', 'harder_pipes', 'bonus_tracking']
    },
    completionCondition: {
      type: 'pipes' as const,
      value: 20
    },
    background: 'bg-gradient-to-b from-blue-500 to-indigo-600',
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

export default ShieldRunModePage;
