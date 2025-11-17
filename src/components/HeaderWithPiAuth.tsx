import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePiAuth } from '../context/PiAuthContext';
import { useTheme } from '../hooks/useTheme';
import { PI_CONFIG } from '../config/piConfig';
import LanguageSelector from './LanguageSelector';
import PiNetworkBanner from './PiNetworkBanner';
import AuthenticationUI from './AuthenticationUI';
import { syncPiUserData, checkPiAuthentication, getCurrentPiUser } from '../utils/piNetworkUtils';

interface HeaderWithPiAuthProps {
  title?: string;
  showNavigation?: boolean;
  className?: string;
}

const HeaderWithPiAuth: React.FC<HeaderWithPiAuthProps> = ({ 
  title = "Flappy Pi", 
  showNavigation = false,
  className = ""
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, piUser, loginWithPi, logout } = useAuth();
  const { user: piAuthUser, isAuthenticated: isPiAuthenticated, login, isLoading, error } = usePiAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, getFooterBg, getFooterText, getFooterBorder, getButtonBg, getButtonText } = useTheme();

  // Add scroll detection for enhanced visual effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    navigate('/home');
  };

  // Match footer styling with transparency and backdrop blur
  const headerClass = `w-full ${getFooterBg()}/95 backdrop-blur-md border-b ${getFooterBorder()} transition-all duration-300 z-40 relative ${className} header`;

  return (
    <div className={headerClass}>
      {/* Top spacing bar for mobile status bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
      
      {/* Pi Network Banner */}
      <PiNetworkBanner />
      
      {/* Main header content */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/flappy pi gif/flappy-2.gif.gif" 
            alt="Flappy Pi" 
            className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform" 
            onClick={handleLogoClick}
            onError={(e) => {
              console.warn('❌ Flappy Pi GIF failed to load in HeaderWithPiAuth, using fallback');
              e.currentTarget.src = '/flappy-logo.png';
            }}
          />
          <h1 className={`text-xl font-bold cursor-pointer ${getFooterText()} header-text`} onClick={handleLogoClick}>
            {title}
          </h1>
        </div>
        
        {/* Right side - Language Selector and Authentication */}
        <div className="flex items-center gap-2">
          {/* Language Selector - Enhanced design with higher z-index */}
          <div className="hidden md:block relative z-50 header-language-selector">
            <div className={`${getFooterBg()}/95 backdrop-blur-md rounded-xl p-1 shadow-xl border ${getFooterBorder()} hover:shadow-2xl transition-all duration-200`}>
              <LanguageSelector 
                variant="ghost" 
                size="sm" 
                className="min-w-[100px] text-sm font-medium language-selector"
              />
            </div>
          </div>
          
          {/* Mobile Language Selector - Compact design with higher z-index */}
          <div className="md:hidden relative z-50 header-language-selector">
            <div className={`${getFooterBg()}/95 backdrop-blur-md rounded-lg p-1 shadow-lg border ${getFooterBorder()} transition-all duration-200`}>
              <LanguageSelector 
                variant="ghost" 
                size="sm" 
                className="min-w-[80px] text-xs font-medium language-selector"
              />
            </div>
          </div>
          
          <AuthenticationUI variant="header" showUserInfo={true} />
        </div>
      </div>
      
      {/* Environment Info (Production mode - hidden) */}
      {false && (typeof window !== 'undefined' && window.location.hostname === 'localhost') && (
        <div className={`px-4 pb-2 ${theme === 'dark' ? 'bg-gray-800/95' : 'bg-gray-100/95'} backdrop-blur-sm`}>
          <div className={`text-xs ${getFooterText()} flex items-center gap-4 flex-wrap`}>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${false ? 'bg-green-400' : 'bg-gray-400'}`}></span>
              Pi Browser: {false ? 'Yes (Production)' : 'No (Development)'}
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${false ? 'bg-green-400' : 'bg-red-400'}`}></span>
              Pi SDK: {false ? 'Available' : 'Not Available'}
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-blue-400' : 'bg-gray-400'}`}></span>
              Auth: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${PI_CONFIG.getNetworkMode() === 'mainnet' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
              Network: {PI_CONFIG.getNetworkMode().toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${false ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
              Mode: {false ? 'Production' : 'Development'}
            </span>
            {error && (
              <span className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                Error: {error}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderWithPiAuth;