import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-yellow-50 via-white to-orange-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">{t('aboutTitle')}</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            {t('aboutDescription')}
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 mb-2">
            <Info className="w-4 h-4 mr-1" /> About Us
          </Badge>
        </DialogHeader>
        
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-6">
          <div>
            <p className="text-gray-700 mb-4">{t('aboutGameDescription')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-green-800 mb-2">{t('aboutFeatures')}</h3>
            <ul className="text-green-700 space-y-1 list-disc pl-4">
              <li>{t('aboutMultipleModes')}</li>
              <li>{t('aboutPowerUps')}</li>
              <li>{t('aboutBirdSkins')}</li>
              <li>{t('aboutLeaderboards')}</li>
              <li>{t('aboutPiIntegration')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">{t('aboutTeam')}</h3>
            <p className="text-blue-700">{t('aboutTeamDescription')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">{t('aboutTechnology')}</h3>
            <ul className="text-purple-700 space-y-1 list-disc pl-4">
              <li>{t('aboutReact')}</li>
              <li>{t('aboutPiNetwork')}</li>
              <li>{t('aboutResponsive')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">{t('aboutLicenses')}</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">📋 MIT License</h4>
                <p className="text-yellow-700">{t('aboutMITLicense')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">📋 PiOS License</h4>
                <p className="text-yellow-700">{t('aboutPiOSLicense')}</p>
                <a href="/PiOS%20License" className="text-yellow-700 underline font-semibold text-sm" target="_blank" rel="noopener noreferrer">{t('aboutViewPiOSLicense')}</a>
              </div>
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

export default AboutModal; 