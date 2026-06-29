import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trophy, Package, Users, Lock, Video, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenInventory: () => void;
  onInviteFriends: () => void;
  onOpenReserveConnect?: () => void;
  onOpenStream?: () => void;
  onOpenPrivacy?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onOpenShop, onOpenLeaderboard, onOpenInventory, onInviteFriends, onOpenReserveConnect, onOpenStream, onOpenPrivacy }) => {
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

      {/* Third row - New Features */}
      <div className="grid grid-cols-3 gap-4">
        {onOpenReserveConnect && (
          <Button
            onClick={onOpenReserveConnect}
            className="h-14 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base"
          >
            <Lock className="mr-2 h-5 w-5" />
            Reserve
          </Button>
        )}
        {onOpenStream && (
          <Button
            onClick={onOpenStream}
            className="h-14 w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base"
          >
            <Video className="mr-2 h-5 w-5" />
            Stream
          </Button>
        )}
        {onOpenPrivacy && (
          <Button
            onClick={onOpenPrivacy}
            className="h-14 w-full bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-2xl text-base"
          >
            <EyeOff className="mr-2 h-5 w-5" />
            Privacy
          </Button>
        )}
      </div>

      {/* Fourth row - Dino Pi Egg */}
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
