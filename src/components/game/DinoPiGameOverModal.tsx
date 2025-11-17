import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ShareScore from './ShareScore';
import FiresideForumIntegration from '../FiresideForumIntegration';
import { useLanguage } from '../../context/LanguageContext';
// import { useGlobalMusic } from '../../hooks/useGlobalMusic'; // DISABLED: No background music in game mode
import { useSound } from '../../context/SoundContext';

interface DinoPiGameOverModalProps {
  isVisible: boolean;
  score: number;
  coins: number;
  totalWallet?: number;
  onRestart: () => void;
  onShare: () => void;
  onHome: () => void;
  onRevive: () => void;
  reviveUsed: boolean;
  level: number;
  bestScore?: number;
  extraLives?: number;
  onUseExtraLife?: () => void;
  characterImage?: string;
  characterName?: string;
  leaderboard?: Array<{ username: string; highest_score: number; }>;
  onSubmitScore: () => Promise<boolean>;
  isPiUser?: boolean;
  onSignInWithPi?: () => void;
}

const DinoPiGameOverModal: React.FC<DinoPiGameOverModalProps> = ({ 
  isVisible, 
  score, 
  coins, 
  totalWallet, 
  onRestart, 
  onShare, 
  onHome, 
  onRevive, 
  reviveUsed, 
  level, 
  bestScore = 0, 
  extraLives = 0, 
  onUseExtraLife, 
  characterImage, 
  characterName = 'Baby T-Rex',
  leaderboard, 
  onSubmitScore, 
  isPiUser, 
  onSignInWithPi 
}) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  // DISABLED: No background music in game mode to prevent audio conflicts
  // useGlobalMusic(); // Removed to prevent background music in game
  const { playGameSound } = useSound();
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [showShareTemplate, setShowShareTemplate] = useState(false);
  const [showFiresideForum, setShowFiresideForum] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Play game over sound when modal becomes visible
      playGameSound('die');
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isVisible, playGameSound]);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
          {/* Dino Pi Branding */}
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-2xl font-bold text-orange-700">Dino Pi!</h1>
          </div>

          {/* Character Image */}
          <div className="flex justify-center mb-4">
            <img 
              src={characterImage || '/dino pi/dino_0.png'} 
              alt={`${characterName} Character`} 
              className="w-20 h-20 drop-shadow-lg" 
              onError={(e) => {
                console.log('❌ Character image failed to load:', characterImage);
                e.currentTarget.src = '/dino pi/dino_0.png';
              }}
            />
          </div>

          {/* Game Over Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-red-600 mb-2">Game Over!</h2>
            <p className="text-lg text-gray-600">Your prehistoric adventure has ended!</p>
          </div>

          {/* Score Display */}
          <div className="mb-6 space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{score}</div>
              <div className="text-sm text-gray-500">Final Score</div>
            </div>
            
            {bestScore > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{bestScore}</div>
                <div className="text-sm text-gray-500">Best Score</div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{coins}</div>
              <div className="text-sm text-gray-500">Fossils Collected</div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">Level {level}</div>
              <div className="text-sm text-gray-500">Evolution Stage</div>
            </div>
          </div>

          {/* Revive Options */}
          {!reviveUsed && (
            <div className="mb-6">
              <Button
                onClick={onRevive}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 mb-3"
              >
                <span className="mr-2">🦴</span>
                Revive with Fossils
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={onRestart}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
            >
              <span className="mr-2">🔄</span>
              Play Again
            </Button>
            
            <Button
              onClick={onShare}
              variant="outline"
              className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 py-3"
            >
              <span className="mr-2">📤</span>
              Share Score
            </Button>
            
            <Button
              onClick={onHome}
              variant="outline"
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 py-3"
            >
              <span className="mr-2">🏠</span>
              Back to Menu
            </Button>
          </div>

          {/* Pi Network Integration */}
          {isPiUser && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                🦴 Your fossils have been saved to your Pi wallet!
              </p>
            </div>
          )}

          {/* Leaderboard Preview */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Top Players</h3>
              <div className="space-y-1">
                {leaderboard.slice(0, 3).map((player, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">#{index + 1} {player.username}</span>
                    <span className="font-semibold">{player.highest_score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Score Modal */}
      {showShareConfirm && (
        <ShareScore
          isOpen={showShareConfirm}
          onClose={() => setShowShareConfirm(false)}
          score={score}
          characterName={characterName}
          onShare={onShare}
        />
      )}

      {/* Fireside Forum Integration */}
      {showFiresideForum && (
        <FiresideForumIntegration
          isOpen={showFiresideForum}
          onClose={() => setShowFiresideForum(false)}
          score={score}
          gameMode="Dino Pi"
        />
      )}
    </>
  );
};

export default DinoPiGameOverModal;
