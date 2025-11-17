import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Trophy, 
  Gift, 
  Users, 
  BookOpen, 
  Star, 
  Zap, 
  Crown, 
  Heart, 
  Globe,
  Settings,
  HelpCircle,
  MessageCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface QuickActionButtonsProps {
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutorial?: () => void;
  onOpenCommunity?: () => void;
  onOpenDailyRewards?: () => void;
  onOpenSubscription?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onOpenChat?: () => void;
  onOpenEvents?: () => void;
  onOpenSpecial?: () => void;
}

// Button configuration for better organization
const buttonConfigs = {
  primary: [
    {
      id: 'shop',
      icon: ShoppingCart,
      label: 'shop',
      gradient: 'from-cyan-500 via-blue-500 to-cyan-600',
      hoverGradient: 'from-cyan-600 via-blue-600 to-cyan-700',
      onClick: 'onOpenShop',
      priority: 'high'
    },
    {
      id: 'leaderboard',
      icon: Trophy,
      label: 'leaderboard',
      gradient: 'from-purple-500 via-violet-500 to-purple-600',
      hoverGradient: 'from-purple-600 via-violet-600 to-purple-700',
      onClick: 'onOpenLeaderboard',
      priority: 'high'
    }
  ],
  secondary: [
    {
      id: 'dailyRewards',
      icon: Gift,
      label: 'dailyRewards',
      gradient: 'from-yellow-500 via-orange-500 to-yellow-600',
      hoverGradient: 'from-yellow-600 via-orange-600 to-yellow-700',
      onClick: 'onOpenDailyRewards',
      priority: 'medium'
    },
    {
      id: 'tutorial',
      icon: BookOpen,
      label: 'tutorial',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      hoverGradient: 'from-green-600 via-emerald-600 to-green-700',
      onClick: 'onOpenTutorial',
      priority: 'medium'
    },
    {
      id: 'community',
      icon: Users,
      label: 'community',
      gradient: 'from-pink-500 via-rose-500 to-pink-600',
      hoverGradient: 'from-pink-600 via-rose-600 to-pink-700',
      onClick: 'onOpenCommunity',
      priority: 'medium'
    }
  ],
  premium: [
    {
      id: 'subscription',
      icon: Crown,
      label: 'premium',
      gradient: 'from-indigo-500 via-purple-500 to-indigo-600',
      hoverGradient: 'from-indigo-600 via-purple-600 to-indigo-700',
      onClick: 'onOpenSubscription',
      priority: 'low'
    },
    {
      id: 'special',
      icon: Sparkles,
      label: 'special',
      gradient: 'from-red-500 via-pink-500 to-red-600',
      hoverGradient: 'from-red-600 via-pink-600 to-red-700',
      onClick: 'onOpenSpecial',
      priority: 'low'
    }
  ],
  utility: [
    {
      id: 'settings',
      icon: Settings,
      label: 'settings',
      gradient: 'from-gray-500 via-slate-500 to-gray-600',
      hoverGradient: 'from-gray-600 via-slate-600 to-gray-700',
      onClick: 'onOpenSettings',
      priority: 'low'
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'help',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      hoverGradient: 'from-blue-600 via-cyan-600 to-blue-700',
      onClick: 'onOpenHelp',
      priority: 'low'
    }
  ]
};

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onOpenShop,
  onOpenLeaderboard,
  onOpenTutorial,
  onOpenCommunity,
  onOpenDailyRewards,
  onOpenSubscription,
  onOpenSettings,
  onOpenHelp,
  onOpenChat,
  onOpenEvents,
  onOpenSpecial
}) => {
  const { t } = useLanguage();

  // Handler mapping for cleaner code
  const handlers = {
    onOpenShop,
    onOpenLeaderboard,
    onOpenTutorial,
    onOpenCommunity,
    onOpenDailyRewards,
    onOpenSubscription,
    onOpenSettings,
    onOpenHelp,
    onOpenChat,
    onOpenEvents,
    onOpenSpecial
  };

  // Render button with consistent styling and improved mobile responsiveness
  const renderButton = (config: any, size: 'large' | 'medium' | 'small' = 'medium') => {
    const IconComponent = config.icon;
    const handler = handlers[config.onClick as keyof typeof handlers];
    
    if (!handler) return null;

    const sizeClasses = {
      large: 'h-14 sm:h-16 text-base min-h-[56px] sm:min-h-[64px]',
      medium: 'h-12 sm:h-14 text-sm sm:text-base min-h-[48px] sm:min-h-[56px]',
      small: 'h-10 sm:h-12 text-xs sm:text-sm min-h-[40px] sm:min-h-[48px]'
    };

    return (
      <Button 
        key={config.id}
        onClick={handler}
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-r ${config.gradient} 
          hover:bg-gradient-to-r ${config.hoverGradient}
          text-white font-bold shadow-xl 
          transform hover:scale-105 active:scale-95 
          transition-all duration-300 border-0 rounded-xl 
          relative overflow-hidden group
          focus:outline-none focus:ring-2 focus:ring-white/50
          disabled:opacity-50 disabled:cursor-not-allowed
          w-full px-3 sm:px-4
          touch-manipulation
        `}
        aria-label={t(config.label)}
        title={t(config.label)}
      >
        {/* Hover overlay effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        
        {/* Button content with improved mobile layout */}
        <div className="flex items-center justify-center w-full relative z-10 gap-1 sm:gap-2">
          <IconComponent className={`${size === 'large' ? 'h-5 w-5 sm:h-6 sm:w-6' : size === 'medium' ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />
          <span className="font-bold truncate">
            {t(config.label)}
          </span>
        </div>
      </Button>
    );
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 mb-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
      {/* Enhanced Section Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
          <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 animate-pulse" />
          <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl drop-shadow-lg">
            {t('quickActions')}
          </h3>
        </div>
        <p className="text-white/80 text-xs sm:text-sm drop-shadow-md max-w-md mx-auto px-2">
          {t('quickActionsDescription')}
        </p>
      </div>

      {/* Primary Actions - Large Buttons */}
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {buttonConfigs.primary.map(config => renderButton(config, 'large'))}
        </div>
      </div>

      {/* Secondary Actions - Medium Buttons with improved mobile layout */}
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {buttonConfigs.secondary.map(config => renderButton(config, 'medium'))}
        </div>
      </div>

      {/* Premium Features - Medium Buttons */}
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {buttonConfigs.premium.map(config => renderButton(config, 'medium'))}
        </div>
      </div>

      {/* Utility Actions - Small Buttons (Optional) */}
      {(onOpenSettings || onOpenHelp) && (
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {buttonConfigs.utility
              .filter(config => handlers[config.onClick as keyof typeof handlers])
              .map(config => renderButton(config, 'small'))
            }
          </div>
        </div>
      )}

      {/* Accessibility and Performance Notes */}
      <div className="sr-only">
        <p>Quick action buttons for easy navigation to main features</p>
        <p>Primary actions: Shop and Leaderboard</p>
        <p>Secondary actions: Daily Rewards, Tutorial, and Community</p>
        <p>Premium features: Subscription and Special offers</p>
      </div>
    </div>
  );
};

export default QuickActionButtons;
