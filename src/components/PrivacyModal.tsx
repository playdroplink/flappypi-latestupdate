import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-green-50 via-white to-blue-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">{t('privacyTitle')}</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            {t('privacyDescription')}
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border-green-200 mb-2">
            <Lock className="w-4 h-4 mr-1" /> Secure & Trusted
          </Badge>
        </DialogHeader>
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-4">
          <p><b>{t('privacySection1')}</b> {t('privacySection1Text')}</p>
          <p><b>{t('privacySection2')}</b> {t('privacySection2Text')}</p>
          <p><b>{t('privacySection3')}</b> {t('privacySection3Text')}</p>
          <p><b>{t('privacySection4')}</b> {t('privacySection4Text')}</p>
          <p><b>{t('privacySection5')}</b> {t('privacySection5Text')}</p>
          <p><b>{t('privacySection6')}</b> {t('privacySection6Text')}</p>
          <p><b>{t('privacySection7')}</b> {t('privacySection7Text')}</p>
          <p><b>{t('privacySection8')}</b> <a href={`mailto:${t('privacyContactEmail')}`} className="text-blue-600 underline">{t('privacyContactEmail')}</a>.</p>
        </div>
        <DialogFooter className="flex flex-col gap-2 px-8 pb-6">
          <Button variant="default" size="lg" onClick={onClose} className="w-full text-lg">{t('close')}</Button>
        </DialogFooter>
        <div className="text-center text-xs text-gray-400 pb-1">Powered by Pi Network</div>
        <div className="text-center text-xs text-gray-500 pb-4">Flappy Pi is a Project of <b>Mrwain Organization</b></div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
