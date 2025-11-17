import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">{t('termsTitle')}</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            {t('termsDescription')}
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-blue-700 bg-blue-100 border-blue-200 mb-2">
            <FileText className="w-4 h-4 mr-1" /> Legal & Binding
          </Badge>
        </DialogHeader>
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-4">
          <p><b>{t('termsSection1')}</b> {t('termsSection1Text')}</p>
          <p><b>{t('termsSection2')}</b> {t('termsSection2Text')}</p>
          <p><b>{t('termsSection3')}</b> {t('termsSection3Text')}</p>
          <p><b>{t('termsSection4')}</b> {t('termsSection4Text')}</p>
          <p><b>{t('termsSection5')}</b> {t('termsSection5Text')}</p>
          <p><b>{t('termsSection6')}</b> {t('termsSection6Text')}</p>
          <p><b>{t('termsSection7')}</b> <a href={`mailto:${t('termsContactEmail')}`} className="text-blue-600 underline">{t('termsContactEmail')}</a>.</p>
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

export default TermsModal;
