import React from 'react';
import { CoinIcon } from '../CoinIcon';
import { getUserAvatar } from '@/utils/getUserAvatar';
import { getDisplayUsername } from '@/utils/usernameUtils';
import { UserProfile } from '@/types/gameTypes';

interface HomeHeaderProps {
  piUser: UserProfile | null;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ piUser }) => {
  const userAvatar = getUserAvatar(piUser);
  
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow" />
      <span className="font-bold text-lg text-blue-900 drop-shadow">{getDisplayUsername()}</span>
    </div>
  );
};

export default HomeHeader;
