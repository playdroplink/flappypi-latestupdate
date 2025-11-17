import React, { useState, useEffect, useRef } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { 
  processElementToImage, 
  copyImageToClipboard, 
  downloadImage,
  getImageSharingCapabilities 
} from '@/utils/imageUtils';
import { getDisplayUsername } from '@/utils/usernameUtils';

const birdSkins = {
  classic: "/birds/bird_0.png",
  red: "/birds/bird_1.png",
  blue: "/birds/bird_2.png",
  yellow: "/birds/bird_3.png",
  green: "/birds/bird_4.png",
  purple: "/birds/bird_5.png",
  pink: "/birds/bird_6.png",
  orange: "/birds/bird_7.png",
  cyan: "/birds/bird_8.png",
  magenta: "/birds/bird_9.png",
  dragon: "/birds/bird_10.png",
  gold: "/birds/bird_11.png",
};

const BG_COLORS = [
  '#2563eb', // blue
  '#8b5cf6', // violet
  '#ef4444', // red
  '#facc15', // yellow
  '#22c55e', // green
];

const decorationsList = [
  { emoji: '🌟', style: { left: '10%', top: '10%' } },
  { emoji: '✨', style: { right: '15%', top: '20%' } },
  { emoji: '💫', style: { left: '20%', bottom: '15%' } },
  { emoji: '⭐', style: { right: '10%', bottom: '20%' } },
  { emoji: '🎯', style: { left: '5%', top: '50%' } },
  { emoji: '🎪', style: { right: '5%', top: '60%' } },
  { emoji: '🎨', style: { left: '15%', top: '30%' } },
  { emoji: '🎭', style: { right: '20%', bottom: '10%' } },
];

const postDescriptions = [
  "Just achieved an amazing score in Flappy Pi! 🐦 Can you beat my record? Challenge accepted! 🚀",
  "Flappy Pi is the most addictive game ever! My new high score is 🔥 Can you top this?",
  "Pi Network gaming at its finest! 🎮 Just scored big in Flappy Pi. Who's up for a challenge?",
  "The Pi community is incredible! 🏆 Just set a new personal best in Flappy Pi. Join the fun!",
  "Gaming with Pi Network is revolutionary! 🎯 My Flappy Pi score is unbeatable... or is it?",
  "Pi Network + Gaming = Pure Magic! ✨ Just conquered Flappy Pi with this score. Your turn!",
  "The future of gaming is here with Pi Network! 🚀 Flappy Pi score challenge - can you beat it?",
  "Pi Network makes gaming better! 🎮 My Flappy Pi achievement speaks for itself. Ready to compete?",
];

interface ShareScoreProps {
  score: number;
  level: number;
  bestScore?: number;
  birdSkin?: string;
  gameMode?: string;
  characterName?: string;
}

const ShareScore: React.FC<ShareScoreProps> = ({ score, level, bestScore, birdSkin, gameMode = 'Classic', characterName }) => {
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState(getImageSharingCapabilities());
  const navigate = useNavigate();
  
  useEffect(() => {
    setBgColor(BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)]);
    setCapabilities(getImageSharingCapabilities());
  }, []);

  const { profile } = useUserProfile();
  
  // Use the same bird skin resolution as ReviveModal and GameOverModal
  const finalBirdSkin = birdSkin || 
                        profile?.selected_bird_skin || 
                        'bird_0';
  
  console.debug('[ShareScore] Bird skin resolution:', {
    birdSkin,
    profileSelectedSkin: profile?.selected_bird_skin,
    finalBirdSkin
  });
  
  const username = getDisplayUsername();
  const piUserId = profile?.pi_user_id || '';

  const cardRef = useRef(null);

  const getRandomDecorations = () => {
    const shuffled = [...decorationsList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 5);
  };
  const [decorations, setDecorations] = useState(getRandomDecorations());
  useEffect(() => {
    setDecorations(getRandomDecorations());
    // eslint-disable-next-line
  }, [bgColor]);

  const handleShareScore = () => {
    const skinName = profile?.selected_bird_skin || 'Classic';
    const characterDisplay = gameMode === 'Scream Pi' ? `🎭 Character: ${characterName || 'NPC'}` : `🎨 Bird Skin: ${skinName}`;
    const gameTitle = gameMode === 'Scream Pi' ? 'Scream Pi!' : 'Flappy Pi';
    const shareText = `
${gameTitle}

${gameMode === 'Scream Pi' ? '🎤' : '🐦'} My Score: ${score}
🏆 Level Reached: ${level}
🔥 Best Score: ${bestScore}
${characterDisplay}

👤 Username: ${username.charAt(0).toUpperCase() + username.slice(1)}
${piUserId ? `🆔 Pi ID: ${piUserId}` : ''}

Join the Pi Network gaming revolution!
Powered by Mrwain Organization
    `.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert('Score copied! Paste it to share with your friends.');
    } else {
      window.prompt('Copy your score:', shareText);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dataUrl = await processElementToImage(cardRef.current, {
        scale: 2, // Good quality for modal size
        quality: 0.9, // Good quality
        width: 400, // Exact modal size
        height: 700 // Exact modal size
      });
      
      downloadImage(dataUrl);
      console.log('✅ Score card downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download score card:', error);
      setError('Failed to download image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyImageLink = async () => {
    if (!cardRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Enhanced image processing with exact modal size
      const dataUrl = await processElementToImage(cardRef.current, {
        scale: 2, // Good quality for modal size
        quality: 0.9, // Good quality
        width: 400, // Exact modal size
        height: 700, // Exact modal size
        backgroundColor: null
      });
      
      const result = await copyImageToClipboard(dataUrl);
      
      if (result.success) {
        if (result.method === 'image') {
          alert('✅ Image copied to clipboard! You can now paste it anywhere.');
        } else {
          alert('📋 Image data URL copied to clipboard! Paste this link in another browser to download.');
        }
        
        // Additional feedback for successful copy
        console.log('✅ Image link copied successfully');
        console.log('📊 Image size:', dataUrl.length, 'characters');
        console.log('🖼️ Image format: PNG with high quality');
        
        // Optional: Show preview in new tab for verification
        if (confirm('Would you like to see a preview of the copied image?')) {
          window.open(dataUrl, '_blank');
        }
      } else {
        setError(result.message);
        console.error('❌ Copy failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Failed to copy image link:', error);
      
      // More detailed error messages
      if (error.message.includes('CORS')) {
        setError('CORS error: Please try the download option instead.');
      } else if (error.message.includes('canvas')) {
        setError('Canvas error: Please refresh the page and try again.');
      } else if (error.message.includes('clipboard')) {
        setError('Clipboard error: Please try the download option instead.');
      } else {
        setError('Failed to copy image. Please try the download option instead.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyDescription = () => {
    const randomDesc = postDescriptions[Math.floor(Math.random() * postDescriptions.length)];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(randomDesc);
      alert('Description copied! Paste it to your social media post.\n\n' + randomDesc);
    } else {
      window.prompt('Copy this description:', randomDesc);
    }
  };

  const handleCommunityShare = () => {
    // Navigate to community page
    navigate('/community');
  };

  return (
    <div>
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '8px 12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      <div ref={cardRef} style={{
        background: bgColor,
        borderRadius: 16,
        padding: 16,
        textAlign: 'center',
        margin: '16px auto',
        maxWidth: 320,
        minWidth: 280,
        boxShadow: '0 4px 24px #0002',
        position: 'relative',
        color: '#fff',
        zIndex: 1,
      }}>
        {/* Decorations Layer - only corners/edges, never center */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
          {decorations.map((d, i) => (
            <span key={i} style={{ position: 'absolute', ...d.style, opacity: 0.5, filter: 'blur(0.5px)' }}>{d.emoji}</span>
          ))}
        </div>
        {/* Game Title and Character/Bird */}
        <h2 style={{ fontWeight: 900, fontSize: 24, marginBottom: 6, color: '#fff' }}>
          {gameMode === 'Scream Pi' ? 'Scream Pi!' : 'Flappy Pi'}
        </h2>
        <img 
          src={gameMode === 'Scream Pi' ? (birdSkin || '/npc/nicolas.png') : getBirdImageSrc(finalBirdSkin)} 
          alt={gameMode === 'Scream Pi' ? 'Your Character' : 'Your Flappy Skin'} 
          style={{ width: 48, height: 48, margin: '0 auto 8px auto', display: 'block' }}
          crossOrigin="anonymous"
          onError={(e) => {
            console.log(`❌ ${gameMode === 'Scream Pi' ? 'Character' : 'Bird skin'} image failed to load in ShareScore:`, gameMode === 'Scream Pi' ? birdSkin : finalBirdSkin);
            e.currentTarget.src = gameMode === 'Scream Pi' ? '/npc/nicolas.png' : '/birds/bird_0.png';
          }}
        />
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 6 }}>
          {gameMode === 'Scream Pi' ? 'Scream with Pi Network! 🎤' : 'Soar with Pi Network! 🚀'}
        </div>
        {/* Score Box */}
        <div style={{
          background: 'linear-gradient(90deg, #fff 60%, #e5e7eb 100%)',
          borderRadius: 12,
          margin: '16px 0 8px 0',
          padding: '12px 0',
          boxShadow: '0 2px 8px #0001',
        }}>
          <div style={{ color: '#555', fontWeight: 600, fontSize: 16, marginBottom: 2 }}>Your Score</div>
          <div style={{ color: '#2563eb', fontWeight: 900, fontSize: 36, lineHeight: 1 }}>{score}</div>
        </div>
        {/* Level Box */}
        <div style={{
          background: 'linear-gradient(90deg, #fff 60%, #e5e7eb 100%)',
          borderRadius: 12,
          margin: '0 0 8px 0',
          padding: '12px 0',
          boxShadow: '0 2px 8px #0001',
        }}>
          <div style={{ color: '#555', fontWeight: 600, fontSize: 16, marginBottom: 2 }}>Level Reached</div>
          <div style={{ color: '#22c55e', fontWeight: 900, fontSize: 28, lineHeight: 1 }}>{level}</div>
          <div style={{ color: '#555', fontWeight: 600, fontSize: 14, marginTop: 6 }}>Best Score</div>
          <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: 24, lineHeight: 1 }}>{bestScore}</div>
        </div>
        {/* Username and Pi ID */}
        <div style={{ fontSize: 16, margin: '8px 0 0 0', color: '#fff', fontWeight: 700 }}>@{username.charAt(0).toUpperCase() + username.slice(1)}</div>
        {piUserId && (
          <div style={{ fontSize: 10, margin: '0 0 8px 0', color: '#fff9', wordBreak: 'break-all' }}>Pi ID: {piUserId}</div>
        )}
        {/* Footer */}
        <div style={{ fontSize: 13, margin: '12px 0 0 0', color: '#fff', fontWeight: 700 }}>
          Join the Pi Network gaming revolution!<br />
          <span style={{ fontSize: 11, color: '#fff' }}>Powered by Mrwain Organization</span>
        </div>
      </div>
      {/* Organized Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        alignItems: 'center',
        marginTop: 32,
      }}>
        <button 
          onClick={handleDownload}
          disabled={isProcessing}
          style={{
            background: isProcessing ? '#9ca3af' : '#fbbf24', 
            color: '#222', 
            borderRadius: 8, 
            padding: '12px 0', 
            fontWeight: 900, 
            fontSize: 16, 
            cursor: isProcessing ? 'not-allowed' : 'pointer', 
            width: 260, 
            maxWidth: '100%', 
            transition: 'all 0.2s ease',
            opacity: isProcessing ? 0.6 : 1
          }} 
          aria-label="Take Screenshot" 
          onMouseOver={(e) => !isProcessing && (e.currentTarget.style.background = '#f59e0b')} 
          onMouseOut={(e) => !isProcessing && (e.currentTarget.style.background = '#fbbf24')}
        >
          {isProcessing ? 'Processing...' : 'Take Screenshot'}
        </button>
        <button
          onClick={handleCopyImageLink}
          disabled={isProcessing || !capabilities.clipboard}
          style={{
            background: isProcessing || !capabilities.clipboard ? '#9ca3af' : '#06b6d4', 
            color: '#fff', 
            borderRadius: 8, 
            padding: '12px 0', 
            fontWeight: 900, 
            fontSize: 16, 
            cursor: isProcessing || !capabilities.clipboard ? 'not-allowed' : 'pointer', 
            width: 260, 
            maxWidth: '100%', 
            transition: 'all 0.2s ease',
            opacity: isProcessing || !capabilities.clipboard ? 0.6 : 1
          }}
          onMouseOver={(e) => !isProcessing && capabilities.clipboard && (e.currentTarget.style.background = '#0891b2')} 
          onMouseOut={(e) => !isProcessing && capabilities.clipboard && (e.currentTarget.style.background = '#06b6d4')}
        >
          {isProcessing ? 'Processing...' : capabilities.clipboard ? 'Copy Image Link' : 'Copy Not Supported'}
        </button>
        <div style={{
          fontSize: 12, color: '#6b7280', textAlign: 'center', maxWidth: 260, marginTop: 4, padding: '0 8px'
        }}>
          Paste this link in another browser to download if needed.
        </div>
        <button onClick={handleCommunityShare} style={{
          background: '#22c55e', color: '#fff', borderRadius: 8, padding: '12px 0', fontWeight: 900, fontSize: 16, cursor: 'pointer', width: 260, maxWidth: '100%', transition: 'all 0.2s ease'
        }} onMouseOver={(e) => e.currentTarget.style.background = '#16a34a'} onMouseOut={(e) => e.currentTarget.style.background = '#22c55e'}>
          {gameMode === 'Scream Pi' ? 'Scream Pi Community' : 'Flappy Pi Community'}
        </button>
        <button onClick={handleCopyDescription} style={{
          background: '#2563eb', color: '#fff', borderRadius: 8, padding: '12px 0', fontWeight: 900, fontSize: 16, cursor: 'pointer', width: 260, maxWidth: '100%', transition: 'all 0.2s ease'
        }} onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'} onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}>
          Copy Post Description
        </button>
      </div>
    </div>
  );
};

export default ShareScore; 