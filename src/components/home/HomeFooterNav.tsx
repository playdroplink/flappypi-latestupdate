import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, ShoppingCart, Trophy, FileText, Users, Shield, Globe, BookOpen, Mail, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/context/LanguageContext';

interface HomeFooterNavProps {
  onNavigate: (path: string) => void;
}

const HomeFooterNav: React.FC<HomeFooterNavProps> = ({ onNavigate }) => {
  const { theme, getFooterBg, getFooterText, getFooterBorder } = useTheme();
  const { t } = useLanguage();
  
  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-50 ${getFooterBg()}/95 backdrop-blur-md shadow-xl border-t ${getFooterBorder()}`}>
      <nav className="flex justify-around items-center py-2 px-2 sm:px-6">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/home')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/shop')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <img src="/shop.png" alt="Shop" className="h-5 w-5" />
          <span className="text-xs mt-1">Shop</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/leaderboard')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <Trophy className="h-5 w-5" />
          <span className="text-xs mt-1">Leaderboard</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/social-challenge')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">{t('socialChallenge')}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/flappy-pi-blog')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Blog</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/partnership')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <Globe className="h-5 w-5" />
          <span className="text-xs mt-1">Partners</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/whitepaper')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Whitepaper</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/status')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <Shield className="h-5 w-5" />
          <span className="text-xs mt-1">Status</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('/inventory')} className={`flex flex-col items-center ${getFooterText()} hover:text-blue-600`}>
          <img src="/inventory.png" alt="Inventory" className="h-5 w-5" />
          <span className="text-xs mt-1">Inventory</span>
        </Button>
      </nav>
      <div className={`text-center py-1 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-white/80'}`}>
        <a href="https://flappypi.fun" className="text-blue-700 font-semibold text-xs sm:text-sm hover:underline">flappypi.fun</a>
        <span className="mx-2 text-gray-400">|</span>
        <span className={`${getFooterText()} text-xs sm:text-sm`}>Powered by Pi Network • MRWAIN ORGANIZATION</span>
      </div>
    </footer>
  );
};

export default HomeFooterNav;
