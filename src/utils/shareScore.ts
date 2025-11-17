// Enhanced Score Sharing Utility for Flappy Pi
// Generates visual score cards and handles multiple sharing platforms

interface ShareScoreData {
  score: number;
  highScore: number;
  level: number;
  gameMode: 'classic' | 'endless' | 'challenge';
  isNewHighScore: boolean;
  coins: number;
  birdSkin?: string; // User's selected bird skin
}

interface ShareOptions {
  includeImage: boolean;
  platform: 'native' | 'clipboard' | 'download' | 'all';
  customMessage?: string;
}

// Get bird character image based on skin ID
function getBirdCharacterForSkin(skinId: string): string {
  const birdMap: { [key: string]: string } = {
    'default': '🐦', // Classic blue bird
    'fluppy': '🐦', // Default Fluppy
    'red': '🔴', // Red cardinal
    'blue': '🔵', // Blue jay
    'green': '🟢', // Emerald parrot
    'elite-gold': '🟡', // Golden phoenix
    'elite-violet': '🟣', // Violet storm
    'elite-eagle': '🦅', // Royal eagle
    'elite-royal': '🦚', // Royal peacock
    'legendary': '✨', // Legendary birds
    'epic': '⭐', // Epic birds
    'rare': '💎', // Rare birds
  };

  // Return specific character or default
  return birdMap[skinId] || birdMap['default'] || '🐦';
}

// Generate visual score card as canvas (matching social challenge format)
export async function generateScoreCard(data: ShareScoreData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas for score card (full size like social challenge)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size (exact modal size - 400x700)
      canvas.width = 400;
      canvas.height = 700;

      // Purple gradient background (like the modal)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#8b5cf6'); // Purple
      gradient.addColorStop(1, '#7c3aed'); // Darker purple
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title - "Flappy Pi"
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Flappy Pi', canvas.width / 2, 60);

      // Bird icon (small)
      ctx.fillStyle = '#fbbf24'; // Yellow
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 100, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Subtitle
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Soar with Pi Network! 🚀', canvas.width / 2, 140);

      // Score card (white background)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(40, 180, canvas.width - 80, 80);
      
      // Score label
      ctx.fillStyle = '#6B7280';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Your Score', canvas.width / 2, 210);
      
      // Score value
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(data.score.toString(), canvas.width / 2, 250);

      // Level card (white background)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(40, 280, canvas.width - 80, 80);
      
      // Level label
      ctx.fillStyle = '#6B7280';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Level Reached', canvas.width / 2, 310);
      
      // Level value
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(data.level.toString(), canvas.width / 2, 340);

      // Best score (in same card)
      ctx.fillStyle = '#6B7280';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Best Score', canvas.width / 2, 370);
      
      // Best score value
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(data.highScore.toString(), canvas.width / 2, 390);

      // Username
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`@${data.username || 'Player'}`, canvas.width / 2, 450);

      // Footer text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Join the Pi Network gaming revolution!', canvas.width / 2, 600);
      
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Powered by Mrwain Organization', canvas.width / 2, 620);

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png', 0.9);
      resolve(dataURL);

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png', 0.9);
      resolve(dataURL);
      


      ctx.fillStyle = '#6B7280';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('Best Score', canvas.width / 2, bestScoreY + 30);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 40px Arial, sans-serif';
      ctx.fillText(data.highScore.toString(), canvas.width / 2, bestScoreY + 70);

      // New high score indicator
      if (data.isNewHighScore) {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('🏆 NEW HIGH SCORE! 🏆', canvas.width / 2, bestScoreY + 95);
      }

      // Footer text (like second image)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Join the Pi Network gaming revolution!', canvas.width / 2, 540);
      
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Powered by mrwain organization', canvas.width / 2, 570);

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png', 0.9);
      resolve(dataURL);
      
    } catch (error) {
      reject(error);
    }
  });
}

// Generate share text with bird skin info
export function generateShareText(data: ShareScoreData, customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }

  const modeText = data.gameMode.charAt(0).toUpperCase() + data.gameMode.slice(1);
  const newRecordText = data.isNewHighScore ? '🏆 NEW PERSONAL BEST! 🏆\n' : '';
  const birdText = data.birdSkin && data.birdSkin !== 'default' ? `\n🎨 Bird Skin: ${data.birdSkin}` : '';
  
  return `🎮 Just scored ${data.score} points in Flappy Pi!\n\n${newRecordText}📊 Level ${data.level} • ${modeText} Mode\n💰 ${data.coins} coins earned\n🏅 Best: ${data.highScore}${birdText}\n\nCan you beat my score? 🚀\n\n#FlappyPi #PiNetwork #MobileGaming #FlappyPiChallenge`;
}

// Download score card as image
export function downloadScoreCard(dataURL: string, filename?: string): void {
  try {
    const link = document.createElement('a');
    link.download = filename || `flappy-pi-score-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    console.log('✅ Score card downloaded successfully');
  } catch (error) {
    console.error('❌ Failed to download score card:', error);
  }
}

// Copy to clipboard (text or image)
export async function copyToClipboard(text: string, imageDataURL?: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      if (imageDataURL && window.ClipboardItem) {
        // Try to copy image to clipboard
        try {
          const response = await fetch(imageDataURL);
          const blob = await response.blob();
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          console.log('✅ Score card image copied to clipboard');
          return true;
        } catch (imageError) {
          console.log('⚠️ Image copy failed, falling back to text');
        }
      }
      
      // Fallback to text
      await navigator.clipboard.writeText(text);
      console.log('✅ Score text copied to clipboard');
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        console.log('✅ Score text copied to clipboard (fallback)');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Failed to copy to clipboard:', error);
    return false;
  }
}

// Native share API
export async function nativeShare(data: ShareScoreData, options: ShareOptions = { includeImage: false, platform: 'native' }): Promise<boolean> {
  try {
    if (!navigator.share) {
      console.log('⚠️ Native sharing not supported');
      return false;
    }

    const shareText = generateShareText(data, options.customMessage);
    let shareData: any = {
      title: 'My Flappy Pi Score!',
      text: shareText,
      url: 'https://flappypi.fun'
    };

    // Add image if requested and supported
    if (options.includeImage) {
      try {
        const imageDataURL = await generateScoreCard(data);
        const response = await fetch(imageDataURL);
        const blob = await response.blob();
        const file = new File([blob], 'flappy-pi-score.png', { type: 'image/png' });
        
        shareData.files = [file];
        
        // Check if sharing with files is supported
        if (navigator.canShare && !navigator.canShare(shareData)) {
          // Remove files if not supported
          delete shareData.files;
          console.log('⚠️ File sharing not supported, sharing text only');
        }
      } catch (imageError) {
        console.log('⚠️ Failed to generate image for sharing:', imageError);
      }
    }

    await navigator.share(shareData);
    console.log('✅ Score shared successfully via native API');
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('ℹ️ User cancelled share');
    } else {
      console.error('❌ Native share failed:', error);
    }
    return false;
  }
}

// Main share function with multiple options
export async function shareScore(data: ShareScoreData, options: ShareOptions = { includeImage: true, platform: 'all' }): Promise<{ success: boolean; method: string; message: string }> {
  try {
    const shareText = generateShareText(data, options.customMessage);
    let imageDataURL: string | undefined;

    // Generate image if requested
    if (options.includeImage) {
      try {
        imageDataURL = await generateScoreCard(data);
      } catch (error) {
        console.warn('⚠️ Failed to generate score card:', error);
      }
    }

    // Try different sharing methods based on platform preference
    switch (options.platform) {
      case 'native':
        const nativeSuccess = await nativeShare(data, options);
        if (nativeSuccess) {
          return { success: true, method: 'native', message: 'Shared via native API' };
        }
        break;

      case 'clipboard':
        const clipboardSuccess = await copyToClipboard(shareText, imageDataURL);
        if (clipboardSuccess) {
          return { success: true, method: 'clipboard', message: 'Copied to clipboard' };
        }
        break;

      case 'download':
        if (imageDataURL) {
          downloadScoreCard(imageDataURL);
          return { success: true, method: 'download', message: 'Score card downloaded' };
        }
        break;

      case 'all':
      default:
        // Try native first
        const nativeResult = await nativeShare(data, options);
        if (nativeResult) {
          return { success: true, method: 'native', message: 'Shared via native API' };
        }

        // Fallback to clipboard
        const clipboardResult = await copyToClipboard(shareText, imageDataURL);
        if (clipboardResult) {
          return { success: true, method: 'clipboard', message: 'Copied to clipboard' };
        }

        // Last resort: download image
        if (imageDataURL) {
          downloadScoreCard(imageDataURL);
          return { success: true, method: 'download', message: 'Score card downloaded' };
        }
        break;
    }

    return { success: false, method: 'none', message: 'All sharing methods failed' };

  } catch (error) {
    console.error('❌ Share score failed:', error);
    return { success: false, method: 'error', message: error.message || 'Unknown error' };
  }
}

// Utility to add rounded rectangle to canvas context
if (typeof CanvasRenderingContext2D !== 'undefined') {
  CanvasRenderingContext2D.prototype.roundRect = function(x: number, y: number, width: number, height: number, radius: number) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
} 