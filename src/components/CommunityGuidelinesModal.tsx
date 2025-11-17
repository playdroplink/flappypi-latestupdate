import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Handshake } from 'lucide-react';

interface CommunityGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunityGuidelinesModal: React.FC<CommunityGuidelinesModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-pink-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Community Guidelines</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            Help keep Flappy Pi friendly, inclusive, and fun for everyone.
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-purple-700 bg-purple-100 border-purple-200 mb-2">
            <Handshake className="w-4 h-4 mr-1" /> Be Respectful
          </Badge>
        </DialogHeader>
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-4">
          <p><b>Be kind and respectful.</b> Harassment, hate speech, or threats are not tolerated.</p>
          <p><b>Keep it clean.</b> Avoid offensive names, images, and messages.</p>
          <p><b>Play fair.</b> Cheating, exploiting bugs, or using unauthorized tools is prohibited.</p>
          <p><b>Protect privacy.</b> Do not share personal or sensitive information about yourself or others.</p>
          <p><b>Stay safe.</b> Report harmful behavior or content via the Help section or contact support.</p>
          <p><b>Follow platform rules.</b> Comply with Pi Network and app store policies at all times.</p>
          <p>
            Violations may result in warnings, restrictions, or account action at our discretion. Let’s build a positive community together!
          </p>
        </div>
        <DialogFooter className="flex flex-col gap-2 px-8 pb-6">
          <Button variant="default" size="lg" onClick={onClose} className="w-full text-lg">Close</Button>
        </DialogFooter>
        <div className="text-center text-xs text-gray-400 pb-1">Powered by Pi Network</div>
        <div className="text-center text-xs text-gray-500 pb-4">Flappy Pi is a Project of <b>Mrwain Organization</b></div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityGuidelinesModal;


