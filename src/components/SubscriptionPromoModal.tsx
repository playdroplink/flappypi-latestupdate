import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Pi, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlansModal from './SubscriptionPlansModal';
import { inventoryService } from '@/services/inventoryService';

interface SubscriptionPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionPromoModal: React.FC<SubscriptionPromoModalProps> = ({
  isOpen, onClose
}) => {
  const navigate = useNavigate();
  const [showPlansModal, setShowPlansModal] = React.useState(false);

  const handleSubscribeClick = () => {
    setShowPlansModal(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-lg shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 backdrop-blur-sm border-2 border-purple-300">
        <DialogHeader className="text-center">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <DialogTitle className="text-3xl font-bold text-gray-800 mb-2">Unlock Premium Benefits!</DialogTitle>
          <DialogDescription className="text-md text-gray-700">
            Enhance your Flappy Pi experience with exclusive features like ad-free gaming, bonus coins, and unique skins!
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <Button
            onClick={handleSubscribeClick}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 text-lg"
          >
            <Pi className="h-6 w-6 mr-2" /> Subscribe Now!
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full py-3 px-6 text-gray-700 border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition-all duration-200 text-lg"
          >
            No, Thanks
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Already subscribed? Enjoy your perks!</p>
        </div>
      </DialogContent>
      {showPlansModal && (
        <SubscriptionPlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />
      )}
    </Dialog>
  );
};

export default SubscriptionPromoModal; 