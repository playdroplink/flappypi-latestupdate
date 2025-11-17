import React, { memo } from 'react';
import { isMobile } from '@/utils/browserDetection';
import ImageWithFallback from '../ImageWithFallback';
import { useTheme } from '@/hooks/useTheme';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';

interface PowerUp {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  description?: string;
}

interface FooterPowerupBarProps {
  powerUps: PowerUp[];
  onActivate: (powerUpId: string) => void;
  isVisible?: boolean;
  gameMode?: 'classic' | 'endless' | 'challenge';
  level?: number;
  levelLabel?: string;
  openInventory?: () => void;
  openPremium?: () => void;
  openShop?: () => void;
  coinBalance?: number;
  equippedSkinImg?: string;
  activePowerUps?: { [key: string]: any };
}

const gameModeConfig = {
  classic: { name: 'Classic', icon: getBirdImageSrc('bird-0') },
  endless: { name: 'Endless', icon: getBirdImageSrc('bird-1') },
  challenge: { name: 'Challenge', icon: getBirdImageSrc('bird-2') },
};

const FooterPowerupBar: React.FC<FooterPowerupBarProps> = memo(({ 
  powerUps, 
  onActivate, 
  isVisible = true,
  gameMode = 'classic',
  level = 1,
  levelLabel = 'Level',
  openInventory,
  openPremium,
  openShop,
  coinBalance = 0,
  equippedSkinImg,
  activePowerUps = {}
}) => {
  const { theme, getFooterBg, getFooterText } = useTheme();
  if (!isVisible) return null;
  
  // Use equipped skin image for level, fallback to game mode icon
  const levelIcon = equippedSkinImg || gameModeConfig[gameMode].icon;



  // Helper function to get power-up colors
  const getPowerUpColor = (powerUpId: string): string => {
    const colors = {
      shield: '#8b5cf6', // Purple
      magnet: '#06b6d4', // Cyan
      coin_multiplier: '#ef4444', // Red
      turbo_start: '#fbbf24', // Yellow
      extra_life: '#3b82f6' // Blue
    };
    return colors[powerUpId] || '#6366f1';
  };

  // Helper function to get power-up gradients
  const getPowerUpGradient = (powerUpId: string): string => {
    const gradients = {
      shield: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Purple
      magnet: 'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
      coin_multiplier: 'linear-gradient(135deg, #ef4444, #dc2626)', // Red
      turbo_start: 'linear-gradient(135deg, #fbbf24, #f59e0b)', // Yellow
      extra_life: 'linear-gradient(135deg, #3b82f6, #2563eb)' // Blue
    };
    return gradients[powerUpId] || 'linear-gradient(135deg, #6366f1, #4f46e5)';
  };

  // Helper function to get power-up descriptions
  const getPowerUpDescription = (powerUpId: string): string => {
    const descriptions = {
      shield: 'Protects from collision',
      magnet: 'Attracts coins nearby',
      coin_multiplier: 'Doubles coin earnings',
      turbo_start: 'Increases game speed',
      extra_life: 'Revives you once'
    };
    return descriptions[powerUpId] || 'Special effect';
  };

  // Add enhanced CSS animations for modern power-up effects
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes spinModern {
          from { transform: rotate(-90deg); }
          to { transform: rotate(270deg); }
        }
        
        @keyframes activePulseModern {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 16px currentColor;
          }
          50% {
            transform: scale(1.3);
            box-shadow: 0 0 24px currentColor;
          }
        }
        
        @keyframes powerupGlowModern {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        /* Info panel removed for cleaner UI */
        
        .active-powerup-modern {
          animation: powerupFloatModern 4s ease-in-out infinite;
        }
        
        @keyframes powerupFloatModern {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(2deg);
          }
        }
        
        .powerup-info-panel {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

    return (
    <>

      
      {/* Redesigned Footer Bar - Mobile optimized */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-3 pb-2 sm:pb-3 pointer-events-none`} style={{
        transition:'all 0.3s cubic-bezier(.4,0,.2,1)', 
        background: theme === 'dark' ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)', 
        height: isMobile ? '60px' : '56px', 
        maxHeight: isMobile ? '15vw' : '14vw',
        // Add safe area padding for mobile devices
        paddingBottom: isMobile ? 'max(8px, env(safe-area-inset-bottom))' : '8px'
      }}>
        <div className={`flex items-center justify-between ${getFooterBg()}/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border ${theme === 'dark' ? 'border-gray-600/50' : 'border-white/50'} px-3 sm:px-5 py-2 sm:py-3 pointer-events-auto`} style={{
          minHeight: '44px', 
          maxHeight: '56px'
        }}>
          {/* Left: Level (user skin) & Wallet */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-[120px] sm:min-w-[140px] pointer-events-auto flex-shrink-0">
            <div className="flex flex-col items-center pointer-events-auto">
              <img src={levelIcon} alt="Level" className="w-6 h-6 sm:w-8 sm:h-8" title={levelLabel} />
              <span className={`text-xs ${getFooterText()} text-center font-medium`}>{levelLabel}</span>
            </div>
          </div>
          
          {/* Center: Power-ups with proper spacing */}
          <div className="flex items-center justify-center gap-1 pointer-events-auto flex-1 mx-2" style={{ maxWidth: '250px' }}>
            {powerUps
              .filter(p => p.quantity > 0) // Only show power-ups with quantity > 0
              .slice(0, 5)
              .map((powerup) => {
                const available = powerup.quantity > 0;
                const isActive = activePowerUps[powerup.id];
                const powerUpColor = getPowerUpColor(powerup.id);
                const powerUpGradient = getPowerUpGradient(powerup.id);
                
                // Calculate time remaining for active power-ups
                const timeLeft = isActive && isActive.duration > 0 
                  ? Math.max(0, isActive.duration - (Date.now() - isActive.activatedAt)) 
                  : null;
                const progress = isActive && isActive.duration > 0 
                  ? Math.max(0, 1 - (Date.now() - isActive.activatedAt) / isActive.duration) 
                  : 1;
        
        return (
                <div key={powerup.id} style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (available) {
                onActivate(powerup.id);
                        const button = e.currentTarget;
                        button.style.transform = 'scale(0.85) rotate(5deg)';
                        setTimeout(() => {
                          button.style.transform = 'scale(1) rotate(0deg)';
                        }, 200);
              }
            }}
            disabled={!available}
            style={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: isActive ? powerUpGradient : powerUpGradient,
              boxShadow: available 
                        ? isActive 
                          ? `0 6px 24px ${powerUpColor}80, 0 3px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)` 
                          : `0 4px 16px ${powerUpColor}40, 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)`
                        : '0 2px 6px rgba(0,0,0,0.1)',
                      border: isActive ? `2px solid ${powerUpColor}` : `2px solid ${powerUpColor}60`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
                      fontSize: 16,
                      filter: available ? 'none' : 'grayscale(1) opacity(0.4)',
              cursor: available ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              userSelect: 'none',
                      overflow: 'hidden',
                      position: 'relative',
            }}
                    className={isActive ? 'active-powerup-modern' : ''}
                  >
                    {/* Enhanced glow effect for active power-ups */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        borderRadius: '14px',
                        background: `radial-gradient(circle, ${powerUpColor}30 0%, transparent 70%)`,
                        animation: 'powerupGlowModern 2s ease-in-out infinite alternate',
                        zIndex: -1,
                      }} />
                    )}
                    
            <img 
              src={powerup.icon} 
              alt={powerup.name} 
              style={{ 
                        width: 20, 
                        height: 20,
                        filter: isActive ? 'brightness(1.4) drop-shadow(0 0 6px rgba(255,255,255,0.9))' : 'none',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        zIndex: 2,
              }}
              onError={(e) => {
                console.log('❌ Power-up icon failed to load:', powerup.icon);
                (e.target as HTMLImageElement).src = 'powerups/Shield.png';
              }}
            />
                    
                    {/* Enhanced quantity badge */}
            <span style={{
              position: 'absolute',
                      bottom: -3,
                      right: -3,
                      background: '#1f2937',
              color: '#fff',
                      borderRadius: '6px',
                      fontSize: 8,
              fontWeight: 700,
                      padding: '1px 3px',
                      minWidth: 12,
              textAlign: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.3)',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: 1,
                      zIndex: 3,
            }}>{powerup.quantity}</span>
            
                    {/* Enhanced active indicator */}
            {isActive && (
              <div style={{
                position: 'absolute',
                        top: -4,
                        right: -4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                        background: powerUpColor,
                border: '2px solid #fff',
                        boxShadow: `0 0 8px ${powerUpColor}cc`,
                        animation: 'activePulseModern 2s infinite',
                        zIndex: 3,
                      }} />
                    )}
                    
                    {/* Timer indicator for active power-ups */}
                    {isActive && timeLeft !== null && (
                      <div style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        borderTop: `2px solid ${powerUpColor}`,
                        borderRight: `2px solid ${powerUpColor}66`,
                        animation: 'spinModern 1.5s linear infinite',
                        transform: 'rotate(-90deg)',
                        zIndex: 3,
              }} />
            )}
          </button>
                  
                  {/* Timer panel for active power-ups */}
                  {isActive && timeLeft !== null && (
                    <div style={{
                      position: 'absolute',
                      top: -28,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: `linear-gradient(135deg, ${powerUpColor}15, ${powerUpColor}25)`,
                      border: `1px solid ${powerUpColor}60`,
                      borderRadius: 6,
                      padding: '3px 6px',
                      minWidth: 40,
                      backdropFilter: 'blur(8px)',
                      boxShadow: `0 3px 12px ${powerUpColor}40`,
                      zIndex: 10,
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 600,
                        fontFamily: 'monospace',
                      }}>
                        <span style={{ fontSize: 7 }}>⏱️</span>
                        <span>{Math.ceil(timeLeft / 1000)}s</span>
    </div>
                      
                      {/* Progress bar */}
                      <div style={{
                        marginTop: 2,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: 3,
                        height: 2,
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{
                          height: '100%',
                          background: powerUpGradient,
                          width: `${progress * 100}%`,
                          transition: 'width 0.3s ease',
                          borderRadius: 3,
                          boxShadow: `0 0 3px ${powerUpColor}80`,
                        }} />
                      </div>
            </div>
                  )}
            </div>
              );
            })}
          </div>
          
          {/* Right: Menu buttons in corners */}
          <div className="flex items-center gap-1 pointer-events-auto min-w-[120px] sm:min-w-[140px] justify-end flex-shrink-0">
            <button 
              onClick={openInventory} 
              title="Inventory" 
              className={`flex flex-col items-center p-1 ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'} rounded-lg transition-all duration-300 hover:scale-105`}
            >
              <ImageWithFallback
                src="/inventory.png"
                alt="Inventory"
                className="w-6 h-6 sm:w-7 sm:h-7"
                fallbackSrc="/icons/icon-128x128.png"
              />
              <span className={`text-xs ${getFooterText()} text-center font-medium`}>Inventory</span>
            </button>
            <button 
              onClick={openShop} 
              title="Shop" 
              className={`flex flex-col items-center p-1 ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'} rounded-lg transition-all duration-300 hover:scale-105`}
            >
              <ImageWithFallback
                src="/shop.png"
                alt="Shop"
                className="w-6 h-6 sm:w-7 sm:h-7"
                fallbackSrc="/icons/icon-128x128.png"
              />
              <span className={`text-xs ${getFooterText()} text-center font-medium`}>Shop</span>
            </button>
            <button 
              onClick={openPremium} 
              title="Premium" 
              className={`flex flex-col items-center p-1 ${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'} rounded-lg transition-all duration-300 hover:scale-105`}
            >
              <ImageWithFallback
                src="/npc gif/subscriptionplanbutton.gif.gif"
                alt="Premium"
                className="w-6 h-6 sm:w-7 sm:h-7"
                fallbackSrc="/icons/icon-128x128.png"
              />
              <span className={`text-xs ${getFooterText()} text-center font-medium`}>Premium</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Add CSS for modern animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
});

export default FooterPowerupBar; 