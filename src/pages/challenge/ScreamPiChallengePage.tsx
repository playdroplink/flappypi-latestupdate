import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { Button } from '@/components/ui/button';

interface ScreamPiChallengePageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ScreamPiChallengePage: React.FC<ScreamPiChallengePageProps> = ({ 
  musicEnabled, 
  setMusicEnabled, 
  soundEnabled, 
  setSoundEnabled 
}) => {
  const navigate = useNavigate();

  // Scream Pi is locked in challenge mode
  React.useEffect(() => {
    // Don't allow access to Scream Pi in challenge mode
    console.warn('🔒 Scream Pi is locked in challenge mode');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-500 to-purple-600">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-bold mb-2">Scream Pi - Locked</h1>
        <p className="text-lg mb-4">Scream Pi is not available in Challenge Mode.</p>
        <p className="text-md mb-6 max-w-xs mx-auto">Play Scream Pi in normal game mode to unlock your voice power!</p>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl"
          onClick={() => navigate(ROUTES.CHALLENGE)}
        >
          Back to Challenges
        </Button>
      </div>
    </div>
  );
};

export default ScreamPiChallengePage;
