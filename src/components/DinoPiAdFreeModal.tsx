import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Crown, Star, Zap, Shield, Heart } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import SubscriptionPlansModal from './SubscriptionPlansModal';
import { useToast } from '../hooks/use-toast';

interface DinoPiAdFreeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
}

const DinoPiAdFreeModal: React.FC<DinoPiAdFreeModalProps> = ({
  isVisible,
  onClose,
  onSubscribe
}) => {
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe();
    } else {
      setShowSubscriptionModal(true);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
          {/* Dino Pi Branding */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl mr-2"></span>
            <h1 className="text-2xl font-bold text-orange-700">Dino Pi Premium!</h1>
          </div>

          {/* Premium Features */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Unlock the Ultimate Prehistoric Experience!
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-500 mr-3" />
                <div>
                  <div className="font-semibold text-gray-800">Ad-Free Gaming</div>
                  <div className="text-sm text-gray-600">No interruptions during your prehistoric adventures</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <Star className="w-6 h-6 text-blue-500 mr-3" />
                <div>
                  <div className="font-semibold text-gray-800">Exclusive Dinosaurs</div>
                  <div className="text-sm text-gray-600">Unlock rare and legendary dinosaur species</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Zap className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <div className="font-semibold text-gray-800">Double Rewards</div>
                  <div className="text-sm text-gray-600">Earn 2x fossils and Pi rewards</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <Shield className="w-6 h-6 text-purple-500 mr-3" />
                <div>
                  <div className="font-semibold text-gray-800">Premium Revives</div>
                  <div className="text-sm text-gray-600">Unlimited free revives</div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-500 mr-3" />
                <div>
                  <div className="font-semibold text-gray-800">Extra Lives</div>
                  <div className="text-sm text-gray-600">Start each game with bonus lives</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">$4.99/month</div>
              <div className="text-sm text-gray-600">Cancel anytime</div>
              <div className="text-xs text-gray-500 mt-1">
                *First month free for new subscribers
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubscribe}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
            >
              <Crown className="w-5 h-5 mr-2" />
              Subscribe Now
            </Button>
            
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <X className="w-5 h-5 mr-2" />
              Maybe Later
            </Button>
          </div>

          {/* Benefits Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
 Join thousands of premium Dino Pi players and experience the ultimate prehistoric adventure!
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionPlansModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </>
  );
};

export default DinoPiAdFreeModal;
