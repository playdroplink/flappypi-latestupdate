import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trophy, Package, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenInventory: () => void;
  onInviteFriends: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onOpenShop, onOpenLeaderboard, onOpenInventory, onInviteFriends }) => {
  const navigate = useNavigate();

  const handleDinoPiClick = () => {
    navigate('/dino-pi');
  };

  return (
    <div className="w-full space-y-4 mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
      {/* First row - Shop and Leaderboard */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={onOpenShop}
          className="h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base"
        >
          <img src="/shop.png" alt="Shop" className="mr-3 h-6 w-6" />
          Shop
        </Button>
        
        <Button 
          onClick={onOpenLeaderboard}
          className="h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base"
        >
          <Trophy className="mr-3 h-6 w-6" />
          Leaderboard
        </Button>
      </div>
      
      {/* Second row - Inventory and Invite Friends */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={onOpenInventory}
          className="h-14 w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base"
        >
          <img src="/inventory.png" alt="Inventory" className="mr-3 h-6 w-6" />
          Inventory
        </Button>
        <Button
          onClick={onInviteFriends}
          className="h-14 w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base"
        >
          <Users className="mr-3 h-6 w-6" />
          Invite Friends
        </Button>
      </div>

      {/* Third row - Dino Pi Egg */}
      <div className="grid grid-cols-1 gap-4">
        <Button
          onClick={handleDinoPiClick}
          className="h-14 w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base border-2 border-green-400"
        >
          <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="mr-3 w-6 h-6" />
          <span>Dino Pi Coming Soon!</span>
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
