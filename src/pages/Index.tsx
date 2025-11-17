import React, { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import GameUI from '../components/GameUI';
import GameModals from '../components/GameModals';
import GameContinueOverlay from '../components/GameContinueOverlay';
import MandatoryAdModal from '../components/MandatoryAdModal';
import AdFreeSubscriptionModal from '../components/AdFreeSubscriptionModal';
import RevivePrompt from '../components/RevivePrompt';
import { useGameState } from '../hooks/useGameState';
import { useGameEvents } from '../hooks/useGameEvents';
import { useModals } from '../hooks/useModals';
import { useAnalytics } from '../hooks/useAnalytics';
// import { Analytics } from '@/services/analyticsService';
import ClassicGamePage from './ClassicGamePage';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../hooks/useAuth';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '../components/SplashScreen';
import { MessageCircle } from 'lucide-react';
import MerchPage from './MerchPage';
import { Route, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
// import TutorialModal from '../components/TutorialModal';
import ClassicMode from '../components/game/ClassicMode';
import EndlessMode from '../components/game/EndlessMode';

const ChatbotModal = ({ open, onClose }) => {
  const { t } = useLanguage();
  
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
        <h2 className="text-2xl font-extrabold text-purple-700 mb-2 text-center">{t('flappyPiChatbot')}</h2>
        <div className="text-gray-700 text-sm mb-4 text-center">
          {t('chatbotDescription')}
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-3 overflow-y-auto min-h-[120px]">{t('chatbotComingSoon')}</div>
        <input className="w-full border rounded-lg px-3 py-2 mb-2" placeholder={t('chatbotPlaceholder')} disabled />
        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-lg" disabled>{t('chatbotSend')}</button>
      </div>
    </div>
  );
};

const Index = () => {
  const gameState = useGameState();
  const modals = useModals();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const { signIn, signOut, isAuthenticated, profile } = useUserProfile();
  const { logout: authLogout } = useAuth();
  const { playSwoosh, soundEnabled, setSoundEnabled } = useSoundEffects();
  const { isPlaying, currentTrack, playMusic, stopMusic } = useGlobalMusic();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Initialize analytics tracking
  useAnalytics();

  // Dev Mode: Toggle dev console with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press Ctrl + Shift + D to toggle dev console in development
      if (e.ctrlKey && e.shiftKey && e.key === 'D' && import.meta.env.MODE === 'development') {
        setShowDevConsole(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Create a ref to store the continue game function
  const continueGameRef = React.useRef<(() => void) | null>(null);
  
  const gameEvents = useGameEvents({
    score: gameState.score,
    coins: gameState.coins,
    highScore: gameState.highScore,
    level: gameState.level,
    setGameState: gameState.setGameState,
    setScore: gameState.setScore,
    setLives: gameState.setLives,
    setLevel: gameState.setLevel,
    setHighScore: gameState.setHighScore,
    setCoins: gameState.setCoins,
    continueGame: () => {
      if (continueGameRef.current) {
        continueGameRef.current();
      }
    }
  });

  // Track game events and stop home music when game starts
  useEffect(() => {
    if (gameState.gameState === 'playing') {
      // Analytics.gameStarted(gameState.gameMode);
      console.log('Game started:', gameState.gameMode);
      // Stop home background music when entering game mode to prevent conflicts
      stopMusic();
    }
  }, [gameState.gameState, gameState.gameMode, stopMusic]);

  // Track game completion - fix the function signature
  const handleGameOver = (finalScore: number) => {
    // Calculate session duration (you might want to track this more precisely)
    const sessionDuration = 60; // Default to 60 seconds for now
    // Analytics.gameCompleted(finalScore, gameState.level, gameState.gameMode, sessionDuration);
    console.log('Game completed:', { finalScore, level: gameState.level, gameMode: gameState.gameMode, sessionDuration });
    gameEvents.handleGameOver(finalScore);
  };

  const handleSubscribe = () => {
    // Logic for handling subscription to remove ads
    gameEvents.setShowAdFreeModal(true);
  };

  const handleLogout = async () => {
    await signOut();
    authLogout(); // Use AuthContext logout to prevent auto-redirect
    // Navigation is handled by the footer component
  };

  if (gameState.showSplash) {
    return <SplashScreen onFinish={() => {}} />;
  }

  if (gameState.showWelcome) {
    return (
      <>
        <WelcomeScreen
          onStartGame={(mode) => {
            gameState.startGame(mode);
          }}
          onOpenShop={() => {
            // Analytics.track('shop_button_clicked');
            console.log('Shop button clicked');
            modals.setShowShop(true);
          }}
          onOpenLeaderboard={() => {
            // Analytics.track('leaderboard_button_clicked');
            console.log('Leaderboard button clicked');
            modals.setShowLeaderboard(true);
          }}
          onOpenPrivacy={() => modals.setShowPrivacy(true)}
          onOpenTerms={() => modals.setShowTerms(true)}
          onOpenContact={() => modals.setShowContact(true)}
          onOpenHelp={() => modals.setShowHelp(true)}
          onOpenTutorial={() => {
            // Analytics.track('tutorial_opened');
            console.log('Tutorial opened');
            setShowTutorial(true);
          }}
          coins={gameState.coins}
          musicEnabled={musicEnabled}
          onToggleMusic={setMusicEnabled}
          username={profile?.username}
          onLogin={() => {
            // Handle login - this would typically trigger Pi authentication
            console.log('Login requested');
          }}
          piUser={isAuthenticated ? profile : undefined}
        />

        <GameModals
          showShop={modals.showShop}
          showLeaderboard={modals.showLeaderboard}
          showAdPopup={modals.showAdPopup}
          showShareScore={modals.showShareScore}
          showPrivacy={modals.showPrivacy}
          showTerms={modals.showTerms}
          showContact={modals.showContact}
          showHelp={modals.showHelp}
          showMandatoryAd={gameEvents.showMandatoryAd}
          adType={modals.adType}
          coins={gameState.coins}
          score={gameState.score}
          level={gameState.level}
          highScore={gameState.highScore}
          selectedBirdSkin={gameState.selectedBirdSkin}
          gameState={gameState.gameState}
          gameMode={gameState.gameMode}
          setShowShop={modals.setShowShop}
          setShowLeaderboard={modals.setShowLeaderboard}
          setShowAdPopup={modals.setShowAdPopup}
          setShowShareScore={modals.setShowShareScore}
          setShowPrivacy={modals.setShowPrivacy}
          setShowTerms={modals.setShowTerms}
          setShowContact={modals.setShowContact}
          setShowHelp={modals.setShowHelp}
          setShowMandatoryAd={gameEvents.setShowMandatoryAd}
          setCoins={gameState.setCoins}
          setSelectedBirdSkin={() => {}}
          onWatchAd={gameEvents.handleAdWatch}
          onMandatoryAdWatch={gameEvents.handleMandatoryAdWatch}
          musicEnabled={gameState.musicEnabled}
        />

        {/* {showTutorial && (
          <TutorialModal
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
          />
        )} */}
      </>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Custom CSS for cloud animations */}
      <style>{`
        @keyframes cloudFloat {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes cloudFloatSlow {
          0% { transform: translateX(-50px); }
          100% { transform: translateX(calc(100vw + 50px)); }
        }
        @keyframes cloudFloatReverse {
          0% { transform: translateX(calc(100vw + 100px)); }
          100% { transform: translateX(-100px); }
        }
        .cloud-float-1 { animation: cloudFloat 60s linear infinite; }
        .cloud-float-2 { animation: cloudFloatSlow 80s linear infinite; }
        .cloud-float-3 { animation: cloudFloatReverse 70s linear infinite; }
        .cloud-float-4 { animation: cloudFloat 90s linear infinite; }
        .cloud-float-5 { animation: cloudFloatSlow 100s linear infinite; }
        .cloud-float-6 { animation: cloudFloatReverse 75s linear infinite; }
      `}</style>
      
      {/* Morning Sky Background with Clouds */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100">
        {/* Cloud 1 */}
        <div className="absolute top-10 w-32 h-16 bg-white/80 rounded-full opacity-90 cloud-float-1">
          <div className="absolute -top-4 left-4 w-12 h-12 bg-white/80 rounded-full"></div>
          <div className="absolute -top-2 right-4 w-16 h-16 bg-white/80 rounded-full"></div>
          <div className="absolute top-2 left-8 w-20 h-12 bg-white/80 rounded-full"></div>
        </div>
        
        {/* Cloud 2 */}
        <div className="absolute top-20 w-40 h-20 bg-white/70 rounded-full opacity-85 cloud-float-2">
          <div className="absolute -top-6 left-6 w-16 h-16 bg-white/70 rounded-full"></div>
          <div className="absolute -top-4 right-6 w-20 h-20 bg-white/70 rounded-full"></div>
          <div className="absolute top-2 left-10 w-24 h-16 bg-white/70 rounded-full"></div>
          <div className="absolute top-4 right-10 w-16 h-12 bg-white/70 rounded-full"></div>
        </div>
        
        {/* Cloud 3 */}
        <div className="absolute top-32 w-36 h-18 bg-white/75 rounded-full opacity-80 cloud-float-3">
          <div className="absolute -top-5 left-5 w-14 h-14 bg-white/75 rounded-full"></div>
          <div className="absolute -top-3 right-5 w-18 h-18 bg-white/75 rounded-full"></div>
          <div className="absolute top-1 left-8 w-22 h-14 bg-white/75 rounded-full"></div>
        </div>
        
        {/* Cloud 4 */}
        <div className="absolute top-16 w-28 h-14 bg-white/85 rounded-full opacity-90 cloud-float-4">
          <div className="absolute -top-3 left-3 w-10 h-10 bg-white/85 rounded-full"></div>
          <div className="absolute -top-2 right-3 w-14 h-14 bg-white/85 rounded-full"></div>
          <div className="absolute top-1 left-6 w-18 h-10 bg-white/85 rounded-full"></div>
        </div>
        
        {/* Cloud 5 - Smaller cloud */}
        <div className="absolute top-40 w-24 h-12 bg-white/80 rounded-full opacity-75 cloud-float-5">
          <div className="absolute -top-3 left-3 w-8 h-8 bg-white/80 rounded-full"></div>
          <div className="absolute -top-2 right-3 w-12 h-12 bg-white/80 rounded-full"></div>
          <div className="absolute top-1 left-5 w-16 h-8 bg-white/80 rounded-full"></div>
        </div>
        
        {/* Cloud 6 - Far right */}
        <div className="absolute top-24 w-32 h-16 bg-white/70 rounded-full opacity-80 cloud-float-6">
          <div className="absolute -top-4 left-4 w-12 h-12 bg-white/70 rounded-full"></div>
          <div className="absolute -top-2 right-4 w-16 h-16 bg-white/70 rounded-full"></div>
          <div className="absolute top-2 left-8 w-20 h-12 bg-white/70 rounded-full"></div>
        </div>
        
        {/* Additional smaller clouds for depth */}
        <div className="absolute top-8 w-20 h-10 bg-white/60 rounded-full opacity-70 cloud-float-1" style={{ animationDelay: '10s' }}>
          <div className="absolute -top-2 left-2 w-6 h-6 bg-white/60 rounded-full"></div>
          <div className="absolute -top-1 right-2 w-8 h-8 bg-white/60 rounded-full"></div>
          <div className="absolute top-1 left-4 w-12 h-6 bg-white/60 rounded-full"></div>
        </div>
        
        <div className="absolute top-36 w-22 h-11 bg-white/65 rounded-full opacity-75 cloud-float-2" style={{ animationDelay: '15s' }}>
          <div className="absolute -top-2 left-2 w-7 h-7 bg-white/65 rounded-full"></div>
          <div className="absolute -top-1 right-2 w-9 h-9 bg-white/65 rounded-full"></div>
          <div className="absolute top-1 left-4 w-14 h-7 bg-white/65 rounded-full"></div>
        </div>
      </div>
      <GameUI 
        gameState={gameState.gameState} // Pass the correct type
        score={gameState.score}
        level={gameState.level}
        lives={gameState.lives}
        highScore={gameState.highScore}
        coins={gameState.coins}
        gameMode={gameState.gameMode}
        birdSkin={gameState.selectedBirdSkin} // Add missing prop
        onStartGame={() => {
          // When restarting the game, ensure we properly reset through gameState
          gameState.setGameState('menu'); // First set to menu to trigger proper reset
          setTimeout(() => {
            gameState.startGame(gameState.gameMode); // Then start game with current mode
          }, 100); // Short delay to ensure reset is processed
        }}
        onBackToMenu={gameState.backToMenu}
        onOpenShop={() => modals.setShowShop(true)}
        onOpenLeaderboard={() => modals.setShowLeaderboard(true)}
        onShowAd={() => modals.handleShowAd('continue')}
        onShareScore={modals.handleShareScore}
        isPausedForRevive={gameEvents.isPausedForRevive}
      />

      {/* Render the appropriate game component based on game mode */}
      {gameState.gameState === 'playing' && (
        <>
          {gameState.gameMode === 'classic' && (
            <ClassicMode 
              mode="classic" 
              musicEnabled={musicEnabled}
              setMusicEnabled={setMusicEnabled}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              continueGameRef={continueGameRef}
              onGameOver={handleGameOver}
              onCollision={gameEvents.handleCollision}
            />
          )}
          {gameState.gameMode === 'endless' && (
            <EndlessMode 
              mode="endless"
              musicEnabled={musicEnabled}
              setMusicEnabled={setMusicEnabled}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              continueGameRef={continueGameRef}
              onGameOver={handleGameOver}
              onCollision={gameEvents.handleCollision}
            />
          )}
          {gameState.gameMode === 'challenge' && (
            <ClassicMode 
              mode="challenge" 
              musicEnabled={musicEnabled}
              setMusicEnabled={setMusicEnabled}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              continueGameRef={continueGameRef}
              onGameOver={handleGameOver}
              onCollision={gameEvents.handleCollision}
            />
          )}
        </>
      )}

      <RevivePrompt
        isVisible={gameEvents.showRevivePrompt}
        onWatchAd={() => gameEvents.handleReviveAdWatch()}
        onDecline={() => gameEvents.handleReviveDecline()}
        score={gameState.score}
      />

      <GameContinueOverlay
        showContinueButton={gameEvents.showContinueButton}
        onContinue={gameEvents.handleContinueClick}
      />

      <MandatoryAdModal
        isOpen={gameEvents.showMandatoryAd}
        onWatchAd={gameEvents.handleMandatoryAdWatch}
        onUpgradeToPremium={() => gameEvents.setShowAdFreeModal(true)}
        canUpgrade={true}
      />

      <AdFreeSubscriptionModal
        isOpen={gameEvents.showAdFreeModal}
        onClose={() => gameEvents.setShowAdFreeModal(false)}
        onPurchase={async () => {
          console.log('Purchase clicked');
          return true;
        }}
        isAdFree={false}
        adFreeTimeRemaining={{ days: 0, hours: 0 }}
      />

      <GameModals
        showShop={modals.showShop}
        showLeaderboard={modals.showLeaderboard}
        showAdPopup={modals.showAdPopup}
        showShareScore={modals.showShareScore}
        showPrivacy={modals.showPrivacy}
        showTerms={modals.showTerms}
        showContact={modals.showContact}
        showHelp={modals.showHelp}
        showMandatoryAd={gameEvents.showMandatoryAd}
        adType={modals.adType}
        coins={gameState.coins}
        score={gameState.score}
        level={gameState.level}
        highScore={gameState.highScore}
        selectedBirdSkin={gameState.selectedBirdSkin}
        gameState={gameState.gameState}
        gameMode={gameState.gameMode}
        setShowShop={modals.setShowShop}
        setShowLeaderboard={modals.setShowLeaderboard}
        setShowAdPopup={modals.setShowAdPopup}
        setShowShareScore={modals.setShowShareScore}
        setShowPrivacy={modals.setShowPrivacy}
        setShowTerms={modals.setShowTerms}
        setShowContact={modals.setShowContact}
        setShowHelp={modals.setShowHelp}
        setShowMandatoryAd={gameEvents.setShowMandatoryAd}
        setCoins={gameState.setCoins}
        setSelectedBirdSkin={() => {}}
        onWatchAd={gameEvents.handleAdWatch}
        onMandatoryAdWatch={gameEvents.handleMandatoryAdWatch}
        musicEnabled={musicEnabled}
      />

      {/* 🎮 DEV CONSOLE - Only in Development Mode */}
      {import.meta.env.MODE === 'development' && showDevConsole && (
        <div className="fixed top-4 right-4 bg-purple-900 bg-opacity-95 text-white p-4 rounded-lg shadow-2xl z-50 min-w-[300px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-purple-200">🚀 DEV CONSOLE</h3>
            <button 
              onClick={() => setShowDevConsole(false)}
              className="text-purple-300 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="bg-purple-800 p-2 rounded">
              <p className="text-purple-200">Current Coins: <span className="text-yellow-300 font-bold">{gameState.coins.toLocaleString()}</span></p>
              <p className="text-purple-200">Game Mode: <span className="text-green-300 font-bold">{gameState.gameMode}</span></p>
              <p className="text-purple-200">Level: <span className="text-blue-300 font-bold">{gameState.level}</span></p>
            </div>
            
            <div className="space-y-1">
              <button 
                onClick={() => gameState.addDevCoins && gameState.addDevCoins(100000)}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded font-bold transition-colors"
              >
                💰 Add 100,000 Coins
              </button>
              
              <button 
                onClick={() => gameState.addDevCoins && gameState.addDevCoins(10000)}
                className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded transition-colors"
              >
                💵 Add 10,000 Coins
              </button>
              
              <button 
                onClick={() => gameState.resetDevCoins && gameState.resetDevCoins()}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded transition-colors"
              >
                🔄 Reset Coins to 0
              </button>
              
              <button 
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`w-full px-3 py-2 rounded transition-colors ${
                  musicEnabled 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                {musicEnabled ? '🎵 Music: ON' : '🔇 Music: OFF'}
              </button>
              
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-full px-3 py-2 rounded transition-colors ${
                  soundEnabled 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                }`}
              >
                {soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
              </button>
            </div>
            
            <div className="bg-purple-800 p-2 rounded text-xs text-purple-300">
              <p>Press <kbd className="bg-purple-700 px-1 rounded">Ctrl+Shift+D</kbd> to toggle</p>
              <p>⚠️ Development mode only</p>
            </div>
          </div>
        </div>
      )}

      {/* DEV MODE: Quick admin coins button */}
      {import.meta.env.MODE === 'development' && gameState.coins < 50000 && (
        <button 
          onClick={() => gameState.addDevCoins && gameState.addDevCoins(100000)}
          className="fixed top-4 left-4 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-40 transition-colors font-bold"
          title="Quick Admin: Add 100,000 Coins"
        >
          💰 Admin: +100K Coins
        </button>
      )}


      {/* DEV MODE: Floating toggle button */}
      {import.meta.env.MODE === 'development' && !showDevConsole && (
        <button 
          onClick={() => setShowDevConsole(true)}
          className="fixed top-16 right-4 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full shadow-lg z-40 transition-colors"
          title="Open Dev Console (Ctrl+Shift+D)"
        >
          🎮
        </button>
      )}
    </div>
  );
};

export default ClassicGamePage;
