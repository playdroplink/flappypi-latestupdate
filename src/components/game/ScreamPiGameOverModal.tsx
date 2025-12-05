import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ShareScore from './ShareScore';
import FiresideForumIntegration from '../FiresideForumIntegration';
import { useLanguage } from '../../context/LanguageContext';
// import { useGlobalMusic } from '../../hooks/useGlobalMusic'; // DISABLED: No background music in game mode
import { useSound } from '../../context/SoundContext';

interface ScreamPiGameOverModalProps {
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
  isPiUser: boolean;
  onSignInWithPi?: () => void;
}

const ScreamPiGameOverModal: React.FC<ScreamPiGameOverModalProps> = ({ 
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
  characterName = 'NPC',
  leaderboard, 
  onSubmitScore, 
  isPiUser, 
  onSignInWithPi 
}) => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  // Ensure background music continues playing when modal is shown
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
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-200 to-red-300/80 backdrop-blur-sm transition-opacity duration-400 p-4 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <div className={`relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-md text-center flex flex-col items-center border border-purple-200 transform transition-all duration-400 ${visible ? 'scale-100' : 'scale-90'}`}>
          {/* Scream Pi Branding */}
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">🎤</span>
            <h1 className="text-lg font-bold text-purple-700">Scream Pi!</h1>
          </div>
          
          {/* Character Image */}
          {characterImage && (
            <img 
              src={characterImage} 
              alt={`${characterName.replace('Nicolas', 'Nic').replace('Chengdiao', 'Che')} Character`} 
              className="w-16 h-16 sm:w-20 sm:h-20 mb-2 drop-shadow-lg animate-bounce" 
              onError={(e) => {
                console.log('❌ Character image failed to load:', characterImage);
                e.currentTarget.src = characterImage && characterImage.includes('chengdiao') ? '/npc/che.png' : '/npc/nic.png';
              }}
            />
          )}
          
          {/* Header */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-purple-700 mb-1 tracking-tight">{t('gameOver')}</h2>
          <span className="text-4xl sm:text-6xl mb-3 sm:mb-4">💀</span>
          
          {/* Score Box */}
          <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-xl sm:rounded-2xl shadow-lg px-4 sm:px-8 py-3 sm:py-4 mb-3 sm:mb-4 flex flex-col items-center border-2 sm:border-4 border-yellow-200">
            <span className="text-sm sm:text-lg font-semibold text-gray-700">{t('score')}</span>
            <span className="text-2xl sm:text-4xl font-black text-yellow-800 drop-shadow">{score}</span>
          </div>
          
          {/* Level Box */}
          <div className="bg-gradient-to-r from-purple-200 to-purple-400 rounded-xl sm:rounded-2xl shadow-lg px-4 sm:px-8 py-2 sm:py-3 mb-3 sm:mb-4 flex flex-col items-center border-2 sm:border-4 border-purple-100">
            <span className="text-sm sm:text-lg font-semibold text-purple-700">{t('level')}</span>
            <span className="text-xl sm:text-3xl font-black text-purple-800 drop-shadow">{level}</span>
          </div>

          {/* Coins Box */}
          <div className="bg-gradient-to-r from-green-200 to-green-400 rounded-xl sm:rounded-2xl shadow-lg px-4 sm:px-8 py-2 sm:py-3 mb-3 sm:mb-4 flex flex-col items-center border-2 sm:border-4 border-green-100">
            <span className="text-sm sm:text-lg font-semibold text-green-700">Flappy Coins</span>
            <span className="text-xl sm:text-3xl font-black text-green-800 drop-shadow">{coins}</span>
          </div>

          {/* Leaderboard Section */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="w-full bg-white/70 rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 mb-3 sm:mb-4 border border-purple-100">
              <div className="text-sm sm:text-lg font-bold text-purple-700 mb-2">{t('topPlayers')} ({leaderboard.length})</div>
              <div className="flex flex-col gap-1">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.username + idx} className="flex items-center justify-between px-2 py-1 rounded-lg">
                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">{idx + 1}. {entry.username}</span>
                    <span className="font-bold text-purple-800 text-xs sm:text-sm">Score: {entry.highest_score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col gap-2 sm:gap-3 w-full mt-2">
            <button onClick={onRestart} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 font-bold text-base sm:text-lg shadow hover:from-purple-600 hover:to-pink-600 transition">{t('playAgain')}</button>
            
            {extraLives > 0 && onUseExtraLife && (
              <button onClick={onUseExtraLife} className="bg-red-500 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 font-bold text-base sm:text-lg shadow flex items-center justify-center hover:bg-red-600 transition">
                <span>❤️ {t('useExtraLife')} ({extraLives})</span>
              </button>
            )}
            
            {!reviveUsed && extraLives === 0 && (
              <button onClick={onRevive} className="bg-green-500 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 font-bold text-base sm:text-lg shadow flex items-center justify-center hover:bg-green-600 transition">
                <span>{t('revive')}</span>
              </button>
            )}
            
            <button
              onClick={async () => {
                const success = await onSubmitScore();
                setScoreSubmitted(success);
                setSubmitMessage(success ? 'Score submitted!' : 'Failed to submit score.');
              }}
              className={`bg-purple-500 text-white rounded-lg sm:rounded-xl py-2 sm:py-3 font-bold text-base sm:text-lg shadow hover:bg-purple-600 transition ${scoreSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={scoreSubmitted}
            >
              {scoreSubmitted ? t('scoreSubmitted') : t('submitScore')}
            </button>
            
            {!isPiUser && (
              <>
                <div className="text-xs text-red-600 mt-1">{t('signInWithPiMessage')}</div>
                {onSignInWithPi && (
                  <button
                    onClick={onSignInWithPi}
                    className="bg-yellow-400 text-purple-900 font-bold rounded-lg sm:rounded-xl py-2 px-4 sm:px-6 mt-2 shadow hover:bg-yellow-500 transition text-sm sm:text-base flex items-center gap-2"
                  >
                    <img src="/pi-logo.png" alt="Pi" className="w-5 h-5 mr-1" />
                    {t('signInWithPi')}
                  </button>
                )}
              </>
            )}
            
            {submitMessage && (
              <div className="text-xs text-green-600 mt-1">{submitMessage}</div>
            )}
            
            <div className="flex gap-2 justify-center mt-2">
              <button onClick={() => setShowShareConfirm(true)} className="bg-yellow-400 text-white rounded-lg sm:rounded-xl py-2 px-4 sm:px-6 font-bold shadow hover:bg-yellow-500 transition text-sm sm:text-base">{t('share' as any)}</button>
              <button onClick={() => setShowFiresideForum(true)} className="bg-orange-500 text-white rounded-lg sm:rounded-xl py-2 px-4 sm:px-6 font-bold shadow hover:bg-orange-600 transition text-sm sm:text-base">{t('firesideForum' as any)}</button>
              <button onClick={onHome} className="bg-gray-200 text-gray-800 rounded-lg sm:rounded-xl py-2 px-4 sm:px-6 font-bold shadow hover:bg-gray-300 transition text-sm sm:text-base">{t('home' as any)}</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Confirmation Modal */}
      <Dialog open={showShareConfirm} onOpenChange={setShowShareConfirm}>
        <DialogContent className="max-w-md mx-auto flex flex-col items-center justify-center p-6">
          <DialogTitle className="text-lg sm:text-xl text-center">{t('shareYourScore')}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-center">
            {t('shareScoreMessage')}
          </DialogDescription>
          <div className="flex gap-3 sm:gap-4 justify-center mt-4">
            <button
              className="bg-blue-500 text-white rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 font-bold shadow hover:bg-blue-600 transition text-sm sm:text-base"
              onClick={() => { setShowShareConfirm(false); setShowShareTemplate(true); }}
            >
              {t('yes')}
            </button>
            <button
              className="bg-gray-300 text-gray-800 rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 font-bold shadow hover:bg-gray-400 transition text-sm sm:text-base"
              onClick={() => setShowShareConfirm(false)}
            >
              {t('no')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Share Score Template Modal */}
      <Dialog open={showShareTemplate} onOpenChange={setShowShareTemplate}>
        <DialogContent className="max-w-md mx-auto flex flex-col items-center justify-center p-6">
          <ShareScore 
            score={score} 
            level={level} 
            bestScore={bestScore} 
            birdSkin={characterImage} 
            gameMode="Scream Pi"
            characterName={characterName}
          />
          <div className="flex justify-center mt-4">
            <button
              className="bg-blue-500 text-white rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 font-bold shadow hover:bg-blue-600 transition text-sm sm:text-base"
              onClick={() => setShowShareTemplate(false)}
            >
              {t('close')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Fireside Forum Integration Modal */}
      <Dialog open={showFiresideForum} onOpenChange={setShowFiresideForum}>
        <DialogContent className="max-w-6xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-[80vh] sm:min-h-0">
          <div className="w-full max-w-2xl">
            <FiresideForumIntegration 
              score={score}
              level={level}
              bestScore={bestScore}
              coins={coins}
              isNewHighScore={score > (bestScore || 0)}
              gameMode="Scream Pi"
              birdSkin={characterImage}
            />
          </div>
          <div className="flex justify-center mt-4 w-full">
            <button
              className="bg-orange-500 text-white rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 font-bold shadow hover:bg-orange-600 transition text-sm sm:text-base"
              onClick={() => setShowFiresideForum(false)}
            >
              {t('close')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScreamPiGameOverModal; 