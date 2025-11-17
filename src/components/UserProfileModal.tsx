import React, { useState } from 'react';
import { LogOut, Volume2, VolumeX, History, ShoppingCart, Coins, Settings, Crown, Users, X, Home, Gamepad2, Trophy, Megaphone, Handshake, BookOpen, ExternalLink, ShieldQuestion, Mail, ScrollText, FileText, BarChart3, Star, Zap } from 'lucide-react';
import { UserProfile } from '@/types/gameTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import ConfirmationModal from '@/components/ConfirmationModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PiNetworkLogoImg } from '@/components/PiNetworkLogoImg';
import { CoinIcon } from '@/components/CoinIcon';
import ImageWithFallback from '@/components/ImageWithFallback';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { getUserAvatar } from '@/utils/getUserAvatar';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onLogout: () => void;
  musicEnabled: boolean;
  onToggleMusic: (enabled: boolean) => void;
  onNavigate: (path: string) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen, onClose, profile, onLogout, musicEnabled, onToggleMusic, onNavigate
}) => {
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmLogout(true);
  };

  const handleConfirmLogout = () => {
    onLogout();
    setShowConfirmLogout(false);
    onClose();
  };

  const getBirdSkinImagePath = (skinId: string) => {
    return `/birds/${skinId}.png`;
  };

  const selectedBirdImagePath = profile?.selected_bird_skin
    ? getBirdSkinImagePath(profile.selected_bird_skin)
    : '/birds/bird_0.png';

  const MenuItem = ({ icon: Icon, text, onClick }) => (
    <Button
      onClick={onClick}
      className="flex items-center justify-start gap-3 px-4 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md transition w-full"
    >
      <Icon className="h-5 w-5" />
      {text}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0 bg-blue-800 text-white rounded-none shadow-xl fixed right-0 top-0 h-full w-[300px] transform transition-transform duration-300 ease-in-out data-[state=closed]:translate-x-full data-[state=open]:translate-x-0">
        <DialogHeader className="p-4 pb-0 flex flex-col items-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <ImageWithFallback 
              src={getUserAvatar(profile)}
              alt="Profile Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-lg"
              fallbackSrc="/flappy-logo.png" 
              lazy={true}
            />
            <div className="flex items-center gap-2 text-xl font-bold">
              <span>@{profile?.username || 'Guest'}</span>
              <CoinIcon className="w-5 h-5 text-yellow-300" />
              <span>{profile?.total_coins || 0}</span>
            </div>
          </div>
          <div className="w-full flex justify-end pr-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-200 hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </div>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(100%-120px)] px-4 pb-4">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wide px-2 py-1">PROFILE ACTIONS</p>
            <MenuItem 
              icon={musicEnabled ? Volume2 : VolumeX} 
              text={musicEnabled ? "Music On" : "Music Off"} 
              onClick={() => onToggleMusic(!musicEnabled)} 
            />
            <MenuItem icon={History} text="Purchase History" onClick={() => onNavigate('/purchase-history')} />
            <MenuItem icon={BarChart3} text="Game History" onClick={() => onNavigate('/game-history')} />
            <MenuItem icon={ShoppingCart} text="Character Shop" onClick={() => onNavigate('/shop?tab=characters')} />
            <MenuItem icon={Coins} text="Coin Shop" onClick={() => onNavigate('/shop?tab=coins')} />
            <MenuItem icon={Settings} text="Settings" onClick={() => onNavigate('/settings')} />
            <MenuItem icon={Crown} text="Subscription Plans" onClick={() => onNavigate('/subscription-plans')} />
            <MenuItem icon={Users} text="Invite Friends" onClick={() => onNavigate('/invite-friends')} />
            <Button
              onClick={handleLogoutClick}
              className="flex items-center justify-start gap-3 px-4 py-3 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md w-full mt-4"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>

      <ConfirmationModal
        isOpen={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to log in again to play."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </Dialog>
  );
};

export default UserProfileModal; 