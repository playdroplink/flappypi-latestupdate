import React from 'react';
import ShopModal from './ShopModal';
import LeaderboardModal from './LeaderboardModal';
import AdPopup from './AdPopup';
import ShareScoreModal from './ShareScoreModal';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import ContactModal from './ContactModal';
import HelpModal from './HelpModal';
import MandatoryAdModal from './MandatoryAdModal';
import { usePiPayments } from '@/hooks/usePiPayments';
import { useAdSystem } from '@/hooks/useAdSystem';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';

interface GameModalsProps {
  showShop: boolean;
  showLeaderboard: boolean;
  showAdPopup: boolean;
  showShareScore: boolean;
  showPrivacy: boolean;
  showTerms: boolean;
  showContact: boolean;
  showHelp: boolean;
  showMandatoryAd: boolean;
  adType: 'continue' | 'coins' | 'life';
  coins: number;
  score: number;
  level: number;
  highScore: number;
  selectedBirdSkin: string;
  gameState: 'menu' | 'playing' | 'gameOver' | 'paused';
  gameMode?: string;
  setShowShop: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  setShowAdPopup: (show: boolean) => void;
  setShowShareScore: (show: boolean) => void;
  setShowPrivacy: (show: boolean) => void;
  setShowTerms: (show: boolean) => void;
  setShowContact: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setShowMandatoryAd: (show: boolean) => void;
  setCoins: (coins: number) => void;
  setSelectedBirdSkin: (skin: string) => void;
  onWatchAd: (adType: 'continue' | 'coins' | 'life') => void;
  onMandatoryAdWatch: () => void;
  musicEnabled: boolean;
}

const GameModals: React.FC<GameModalsProps> = ({
  showShop,
  showLeaderboard,
  showAdPopup,
  showShareScore,
  showPrivacy,
  showTerms,
  showContact,
  showHelp,
  showMandatoryAd,
  adType,
  coins,
  score,
  level,
  highScore,
  selectedBirdSkin,
  gameState,
  gameMode,
  setShowShop,
  setShowLeaderboard,
  setShowAdPopup,
  setShowShareScore,
  setShowPrivacy,
  setShowTerms,
  setShowContact,
  setShowHelp,
  setShowMandatoryAd,
  setCoins,
  setSelectedBirdSkin,
  onWatchAd,
  onMandatoryAdWatch,
  musicEnabled
}) => {
  const { purchaseAdFreeWithPi } = useAdSystem();
  const { shareScore } = usePiPayments();

  const handleUpgradeToPremium = async () => {
    const success = await purchaseAdFreeWithPi();
    if (success) {
      setShowMandatoryAd(false);
    }
  };

  return (
    <>
      <ShopModal 
        open={showShop}
        onClose={() => setShowShop(false)}
        musicEnabled={musicEnabled}
      />

      <LeaderboardModal 
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <AdPopup
        isOpen={showAdPopup}
        onClose={() => setShowAdPopup(false)}
        onWatchAd={onWatchAd}
        adType={adType}
      />

      <MandatoryAdModal
        isOpen={showMandatoryAd}
        onWatchAd={onMandatoryAdWatch}
        onUpgradeToPremium={handleUpgradeToPremium}
        canUpgrade={true}
      />

      <ShareScoreModal
        isOpen={showShareScore}
        onClose={() => setShowShareScore(false)}
        score={score}
        level={level}
        birdSkinUrl={getBirdImageSrc(selectedBirdSkin || 'bird-0')}
        gameMode={gameMode}
      />

      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
      />

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
};

export default GameModals;
