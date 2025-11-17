import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { getNextNpcInRotation, getRandomNpcGif } from '@/utils/npcRotation';
import ErrorFreeImage from './ErrorFreeImage';

interface FooterNPCProps {
  npcType: 'default' | 'chengdiao' | 'nicolas';
  dialogs: string[];
  style?: React.CSSProperties;
  npcName?: string;
}

// NPC rotation is now handled by the utility

// Legacy sprite mapping for backward compatibility
const npcSprites: Record<string, string> = {
  default: getRandomNpcGif(),
  chengdiao: getRandomNpcGif(),
  nicolas: getRandomNpcGif(),
};

// Fallback sprite if the main one fails to load
const fallbackSprite = '/flappy pi gif/flappy-2.gif.gif';

const npcNames: Record<string, string> = {
  default: 'FlappyBot',
  chengdiao: 'Chengdiao',
  nicolas: 'Nicolas',
  reserve: 'Reserve NPC',
  shop: 'Shop NPC',
  wiki: 'Wiki NPC',
  inventory: 'Inventory NPC',
  leaderboard: 'Leaderboard NPC',
  wallet: 'Community NPC',
  merch: 'Merch NPC',
};

const FooterNPC: React.FC<FooterNPCProps> = ({ npcType, dialogs, style, npcName }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [dialogIndex, setDialogIndex] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedNpcGif, setSelectedNpcGif] = useState<string>('');

  useEffect(() => {
    setDialogIndex(0);
  }, [dialogs]);

  // Select the next NPC in rotation when component mounts
  useEffect(() => {
    if (!selectedNpcGif) {
      setSelectedNpcGif(getNextNpcInRotation('footer'));
    }
  }, [selectedNpcGif]);

  const handleNpcClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎮 NPC clicked! Current index:', dialogIndex, 'Total dialogs:', dialogs.length);
    console.log('🎮 NPC type:', npcType, 'NPC name:', npcName);
    console.log('🎮 Event type:', e.type, 'Target:', e.currentTarget);
    
    // Check if it's a double-click to change NPC
    const now = Date.now();
    const lastClick = (e.currentTarget as any).lastClickTime || 0;
    const timeDiff = now - lastClick;
    
    if (timeDiff < 500) { // Double click within 500ms
      console.log('🎮 Double click detected! Changing NPC...');
      setSelectedNpcGif(getNextNpcInRotation('footer'));
      setImageError(false); // Reset error state
    } else {
      // Single click - cycle through dialogs
      setDialogIndex((prev) => (prev + 1) % dialogs.length);
    }
    
    (e.currentTarget as any).lastClickTime = now;
    setIsClicked(true);
    
    // Reset click animation after 200ms
    setTimeout(() => setIsClicked(false), 200);
  };

  // Determine the name to display
  let displayName = npcName;
  if (!displayName) {
    if (npcType === 'nicolas') displayName = npcNames.nicolas;
    else if (npcType === 'chengdiao') displayName = npcNames.chengdiao;
    else displayName = npcNames.default;
  }

  // Get the sprite URL with fallback - use random NPC GIF if available, otherwise fallback to legacy sprites
  const spriteUrl = imageError ? fallbackSprite : (selectedNpcGif || npcSprites[npcType] || npcSprites.default);

  return (
    <div
      className="footer-npc-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 0 0 0',
        position: 'relative',
        zIndex: 50,
        ...style,
      }}
    >
      <div
        className="npc-clickable-area"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 100,
          minHeight: '160px',
          minWidth: '160px',
          padding: '15px',
          borderRadius: '20px',
          transition: 'all 0.2s ease-in-out',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          backgroundColor: 'transparent',
        }}
        onClick={handleNpcClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Dialog bubble above NPC */}
        <div
          className="npc-dialog-bubble"
          style={{
            background: theme === 'dark' ? '#1f2937' : '#fff',
            borderRadius: 16,
            padding: '12px 20px',
            boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 500,
            fontSize: 16,
            color: theme === 'dark' ? '#ffffff' : '#333',
            textAlign: 'center',
            maxWidth: 320,
            marginBottom: 12,
            border: '2px solid #fbbf24',
            userSelect: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease-in-out',
            transform: isClicked ? 'scale(1.02)' : 'scale(1)',
            opacity: 1,
            pointerEvents: 'none',
            position: 'relative',
            zIndex: 101,
          }}
        >
          {dialogs[dialogIndex] || 'Hello there! 👋'}
        </div>
        
        {/* NPC Sprite below dialog */}
        <ErrorFreeImage
          src={spriteUrl}
          alt={`${displayName} NPC`}
          className={`animate-bounce-slow ${isClicked ? 'scale-105' : ''}`}
          fallbackSrc="/flappy pi gif/flappy-2.gif.gif"
          style={{ 
            width: 88, 
            height: 'auto', 
            display: 'block', 
            margin: '0 auto',
            transition: 'transform 0.2s ease-in-out',
            transform: isClicked ? 'scale(1.05)' : 'scale(1)',
            pointerEvents: 'none',
            position: 'relative',
            zIndex: 100,
          }}
          onLoad={() => {
            console.log('✅ NPC sprite loaded successfully:', spriteUrl);
            setImageError(false);
          }}
          onError={() => {
            console.warn('⚠️ NPC sprite failed to load:', spriteUrl);
            setImageError(true);
          }}
          retryAttempts={3}
          retryDelay={1000}
        />
        
        {/* NPC Name below sprite */}
        <div className="npc-name-text" style={{ 
          fontSize: 15, 
          color: theme === 'dark' ? '#e5e7eb' : '#888', 
          fontWeight: 500, 
          textAlign: 'center', 
          marginTop: 8,
          transition: 'color 0.2s ease-in-out',
          pointerEvents: 'none',
          position: 'relative',
          zIndex: 100,
        }}>
          {displayName}
          <div className="npc-subtitle-text" style={{ 
            fontSize: 12, 
            color: theme === 'dark' ? '#d1d5db' : '#aaa', 
            marginTop: 4,
            opacity: 0.8,
            fontWeight: 400,
          }}>
            Click to chat! 💬
          </div>
        </div>
        

        
        <style>{`
          .animate-bounce-slow {
            animation: bounce 2.2s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-18px); }
          }
          
          .footer-npc-container {
            position: relative;
            z-index: 50;
          }
          
          .npc-clickable-area {
            position: relative;
            z-index: 100;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          
          .npc-clickable-area:hover {
            background-color: transparent;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FooterNPC; 