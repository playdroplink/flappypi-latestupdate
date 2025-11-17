
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Star, Zap, Coins } from 'lucide-react';

interface PiPremiumPerksProps {
  onUpgrade: () => void;
  isVisible?: boolean;
}

const PiPremiumPerks: React.FC<PiPremiumPerksProps> = ({
  onUpgrade,
  isVisible = true
}) => {
  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-600 to-blue-600 border-0 shadow-xl text-white">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Crown className="w-5 h-5 text-yellow-300" />
          <h4 className="font-bold text-lg">🌟 Pi Premium Perks</h4>
        </div>
        
        <ul className="space-y-2 mb-4 text-sm">
          <li className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-300" />
            <span>No ads during gameplay</span>
          </li>
          <li className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span>Exclusive bird skins</span>
          </li>
          <li className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-300" />
            <span>2x Pi coin multipliers</span>
          </li>
          <li className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-orange-300" />
            <span>Weekly Pi bonus rewards</span>
          </li>
        </ul>
        
        <Button 
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade with Pi (10 π)
        </Button>
      </div>
    </Card>
  );
};

export default PiPremiumPerks;
