import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Home, ArrowLeft, AlertCircle } from 'lucide-react';

interface DinoPiLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
}

const DinoPiLockedModal: React.FC<DinoPiLockedModalProps> = ({ isOpen, onClose, onGoHome }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800">
            Dino Pi is Locked
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            This game mode is currently unavailable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Access Restricted</span>
            </div>
            <p className="text-sm text-yellow-700">
              Dino Pi game mode is currently locked and not available for play.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm"></span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Dino Pi Game</p>
                <p className="text-sm text-gray-600">Prehistoric adventure game</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onGoHome}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DinoPiLockedModal;
