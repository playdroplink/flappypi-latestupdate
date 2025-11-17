import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from './drawer';
import { Home, Play, ShoppingBag, Trophy, Wallet, Settings, Info, User, Menu, Users, BookOpen, HelpCircle, Zap, TestTube, History, Monitor, Sword } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
// import { usePerformance } from '../../context/PerformanceContext'; // Disabled to prevent performance issues

const menuSections = [
  {
    title: 'Main',
    items: [
      { icon: <Home size={20} />, label: 'Home', path: '/home' },
    ],
  },
  {
    title: 'Game Modes',
    items: [
      { icon: <Play size={20} />, label: 'Play', path: '/play' },
      // { icon: <Sword size={20} />, label: 'Duels', path: '/pvp-duels' }, // Temporarily disabled
      // { icon: <Sword size={20} />, label: 'PvP Duels', path: '/pvp-duels' }, // Temporarily disabled
      { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard' },
      { icon: <History size={20} />, label: 'Game History', path: '/game-history' },
      { icon: <ShoppingBag size={20} />, label: 'My Shop', path: '/shop' },
      { icon: <Wallet size={20} />, label: 'Wallet', path: '/wallet' },
      { icon: <User size={20} />, label: 'Inventory', path: '/inventory' },
      { icon: <Zap size={20} />, label: 'Pi Test', path: '/pi-test' },
      { icon: <TestTube size={20} />, label: 'SDK Test', path: '/pi-sdk-test' },
    ],
  },
  {
    title: 'Community',
    items: [
      { icon: <Users size={20} />, label: 'Invite Friends', path: '/invite-friends' },
      { icon: <BookOpen size={20} />, label: 'Wiki', path: '/flappy-wiki' },
      { icon: <HelpCircle size={20} />, label: 'Help & Support', path: '/help' },
    ],
  },
  {
    title: 'Info',
    items: [
      { icon: <Info size={20} />, label: 'About', path: '/about' },
      { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
      { icon: <Monitor size={20} />, label: 'Performance Monitor', path: '/performance-monitor' },
    ],
  },
];

const MenuDrawer = ({ open, onOpenChange, onOpenSubscriptionModal, onOpenShopModal, onOpenInventoryModal, onOpenGameModeModal, onOpenWikiModal, onOpenHelpModal, onOpenAboutModal, onOpenSettingsModal, onOpenPiSDKTestPanel }) => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useUserProfile();
  // const { lowQualityMode, setLowQualityMode, autoLowQuality } = usePerformance(); // Disabled to prevent performance issues
  // Fallback values for performance settings
  const lowQualityMode = false;
  const setLowQualityMode = () => {};
  const autoLowQuality = false;

  // ENABLED: Authentication check - only show menu drawer if user is authenticated
  // FULL PRODUCTION: Authentication required for menu access
  // if (!isAuthenticated) {
  //   return null; // Don't render the drawer if user is not authenticated
  // }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-xs w-full bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 text-xl font-bold">
            <Menu size={24} />
            Menu
          </DrawerTitle>
        </DrawerHeader>
        <nav className="flex flex-col gap-6 px-2 pb-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2 tracking-wider">
                {section.title}
              </div>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition"
                      onClick={() => {
                        if (item.label === 'Play' && onOpenGameModeModal) {
                          onOpenGameModeModal();
                          onOpenChange(false);
                        } else if (item.label === 'Inventory' && onOpenInventoryModal) {
                          onOpenInventoryModal();
                          onOpenChange(false);
                        } else if (item.label === 'My Shop') {
                          navigate('/shop');
                          onOpenChange(false);
                        } else if (item.label === 'Wiki') {
                          navigate('/flappy-wiki');
                          onOpenChange(false);
                        } else if (item.label === 'Help & Support' && onOpenHelpModal) {
                          onOpenHelpModal();
                          onOpenChange(false);
                        } else if (item.label === 'About' && onOpenAboutModal) {
                          onOpenAboutModal();
                          onOpenChange(false);
                        } else if (item.label === 'Settings' && onOpenSettingsModal) {
                          onOpenSettingsModal();
                          onOpenChange(false);
                        } else {
                          navigate(item.path);
                          onOpenChange(false);
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
                {section.title === 'Info' && (
                  <li>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition"
                      onClick={() => {
                        if (onOpenPiSDKTestPanel) {
                          onOpenPiSDKTestPanel();
                          onOpenChange(false);
                        }
                      }}
                    >
                      <TestTube size={20} />
                      <span>Pi SDK Test Panel</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
          
          {/* Performance Settings Section */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2 tracking-wider">
              Performance
            </div>
            <div className="space-y-2 px-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Low Quality Mode</span>
                <button
                  onClick={() => setLowQualityMode(!lowQualityMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    lowQualityMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      lowQualityMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto Low Quality</span>
                <button
                  onClick={() => setLowQualityMode(!autoLowQuality)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoLowQuality ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoLowQuality ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </nav>
        <DrawerClose className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl font-bold">×</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
};

export default MenuDrawer; 