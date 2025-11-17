import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-yellow-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">{t('helpTitle')}</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            {t('helpDescription')}
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 mb-2">
            <HelpCircle className="w-4 h-4 mr-1" /> Game Guide
          </Badge>
        </DialogHeader>

        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">{t('helpHowToPlay')}</h3>
              <ul className="text-blue-700 space-y-1 list-disc pl-4">
                <li><strong>{t('helpTapToFlap')}</strong></li>
                <li><strong>{t('helpNavigatePipes')}</strong></li>
                <li><strong>{t('helpCollectCoins')}</strong> <img src="/flappycoins.png" alt="Coin" className="inline w-4 h-4 align-middle mx-1" /> for bonus points and rewards</li>
                <li><strong>{t('helpPipePoints')}</strong></li>
                <li><strong>{t('helpPracticeTiming')}</strong></li>
                <li><strong>{t('helpStayCalm')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-800 mb-2">{t('helpGameModes')}</h3>
              <ul className="text-green-700 space-y-1 list-disc pl-4">
                <li><strong>{t('helpClassicMode')}</strong></li>
                <li><strong>{t('helpEndlessMode')}</strong></li>
                <li><strong>{t('helpChallengeMode')}</strong></li>
                <li><strong>{t('helpPowerups')}</strong></li>
                <li><strong>{t('helpBirdSkins')}</strong></li>
                <li><strong>{t('helpDailyRewards')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-purple-800 mb-2">{t('helpPiIntegration')}</h3>
              <ul className="text-purple-700 space-y-1 list-disc pl-4">
                <li><strong>{t('helpPiPayments')}</strong></li>
                <li><strong>{t('helpTestnetMode')}</strong></li>
                <li><strong>{t('helpMainnetMode')}</strong></li>
                <li><strong>{t('helpPiWallet')}</strong></li>
                <li><strong>{t('helpEarnPi')}</strong></li>
                <li><strong>{t('helpPiCommunity')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">{t('helpLeaderboards')}</h3>
              <ul className="text-yellow-700 space-y-1 list-disc pl-4">
                <li><strong>{t('helpWeeklyCompetitions')}</strong></li>
                <li><strong>{t('helpFirstPlace')}</strong></li>
                <li><strong>{t('helpSecondPlace')}</strong></li>
                <li><strong>{t('helpThirdPlace')}</strong></li>
                <li><strong>{t('helpSpecialRewards')}</strong></li>
                <li><strong>{t('helpMonthlyPiRewards')}</strong></li>
                <li><strong>{t('helpClaimRewards')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('helpProTips')}</h3>
              <ul className="text-gray-700 space-y-1 list-disc pl-4">
                <li><strong>{t('helpFindRhythm')}</strong></li>
                <li><strong>{t('helpLookAhead')}</strong></li>
                <li><strong>{t('helpStayCentered')}</strong></li>
                <li><strong>{t('helpUsePowerups')}</strong></li>
                <li><strong>{t('helpPracticeDaily')}</strong></li>
                <li><strong>{t('helpTakeBreaks')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('helpTroubleshooting')}</h3>
              <ul className="text-gray-700 space-y-1 list-disc pl-4">
                <li><strong>{t('helpGameLaggy')}</strong></li>
                <li><strong>{t('helpPaymentIssues')}</strong></li>
                <li><strong>{t('helpGameWontLoad')}</strong></li>
                <li><strong>{t('helpLostProgress')}</strong></li>
                <li><strong>{t('helpSoundIssues')}</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('helpSupportContact')}</h3>
              <ul className="text-gray-700 space-y-1 list-disc pl-4">
                <li><strong>{t('helpEmailSupport')}</strong> <a href="mailto:support@flappypi.fun" className="text-blue-600">support@flappypi.fun</a></li>
                <li><strong>{t('helpAlternativeEmail')}</strong> <a href="mailto:flappypi.fun@gmail.com" className="text-blue-600">flappypi.fun@gmail.com</a></li>
                <li><strong>{t('helpResponseTime')}</strong></li>
                <li><strong>{t('helpBugReports')}</strong></li>
              </ul>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-2 px-8 pb-6">
          <Button variant="default" size="lg" onClick={onClose} className="w-full text-lg">{t('close')}</Button>
        </DialogFooter>
        <div className="text-center text-xs text-gray-400 pb-4">Powered by Pi Network</div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
