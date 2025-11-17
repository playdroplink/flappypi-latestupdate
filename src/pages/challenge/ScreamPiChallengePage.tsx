import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

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

  // Redirect to the actual Scream Pi game
  React.useEffect(() => {
    navigate(ROUTES.SCREAM_PI);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-500 to-purple-600">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold mb-2">Scream Pi Challenge</h1>
        <p className="text-lg mb-4">Redirecting to Scream Pi game...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
};

export default ScreamPiChallengePage;
