import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { unifiedLeaderboardService } from '../services/unifiedLeaderboardService';
import { DinoPiSubmission } from '../types/leaderboard';
import { PiAuthUtils } from '../utils/piAuthUtils';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  processElementToImage, 
  copyImageToClipboard, 
  downloadImage,
  shareImage,
  getImageSharingCapabilities 
} from '@/utils/imageUtils';
import { getDisplayUsername } from '../utils/usernameUtils';

interface DinoPiShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  level: number;
  coins: number;
  bestScore: number;
  username?: string;
  characterImageUrl?: string;
  gameMode?: string;
  fossils?: number;
  distance?: number;
  environment?: 'jungle' | 'volcano' | 'desert' | 'ice';
  weatherConditions?: 'sunny' | 'rainy' | 'stormy' | 'snowy';
  sessionDuration?: number;
}

const COLORS = {
  Red: '#ef4444',
  Green: '#22c55e',
  Blue: '#3b82f6',
  Orange: '#f97316',
  Purple: '#8b5cf6'
};

const postDescriptions = [
  "Just achieved an amazing score in Dino Pi!  Can you beat my record? Challenge accepted! 🚀",
  "Dino Pi is the most addictive game ever! My new high score is 🔥 Can you top this?",
  "Pi Network gaming at its finest! 🎮 Just scored big in Dino Pi. Who's up for a challenge?",
  "The Pi community is incredible! 🏆 Just set a new personal best in Dino Pi. Join the fun!",
  "Gaming with Pi Network is revolutionary! 🎯 My Dino Pi score is unbeatable... or is it?",
  "Pi Network + Gaming = Pure Magic! ✨ Just conquered Dino Pi with this score. Your turn!",
  "The future of gaming is here with Pi Network! 🚀 Dino Pi score challenge - can you beat it?",
  "Pi Network makes gaming better! 🎮 My Dino Pi achievement speaks for itself. Ready to compete?",
];

const postDescriptions2 = [
  "Just achieved an amazing score in Dino Pi!  Can you beat my record? Challenge accepted! 🚀",
  "Dino Pi is the most addictive game ever! My new high score is 🔥 Can you top this?",
  "Pi Network gaming at its finest! 🎮 Just scored big in Dino Pi. Who's up for a challenge?",
  "The Pi community is incredible! 🏆 Just set a new personal best in Dino Pi. Join the fun!",
  "Gaming with Pi Network is revolutionary! 🎯 My Dino Pi score is unbeatable... or is it?",
  "Pi Network + Gaming = Pure Magic! ✨ Just conquered Dino Pi with this score. Your turn!",
  "The future of gaming is here with Pi Network! 🚀 Dino Pi score challenge - can you beat it?",
  "Pi Network makes gaming better! 🎮 My Dino Pi achievement speaks for itself. Ready to compete?",
  "Every run is a battle. Today, I won the war 🔥\n#DinoPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #DinoPiChallenge",
  "The Pi prehistoric world is my playground ☁️📲 Let's run!\n#DinoPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #DinoPiChallenge",
  "A smooth run never made a skilled dinosaur 💡 I earned this score!\n#DinoPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #DinoPiChallenge",
  "Shoutout to my fingers — they carried the team 😂🖐️\n#DinoPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #DinoPiChallenge",
  "Dino Pi is NOT for the weak 💪 Come take the challenge\n#DinoPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #DinoPiChallenge",
  "Day made: New high score, new flex 😎📲\n#DinoPi #MrwainOrganization #PiNetwork #SoarWithPiNetwork #DinoPiChallenge",
];

const DinoPiShareScoreModal: React.FC<DinoPiShareScoreModalProps> = ({
  isOpen,
  onClose,
  score,
  level,
  coins,
  bestScore,
  username,
  characterImageUrl,
  gameMode = 'Dino Pi',
  fossils = 0,
  distance = 0,
  environment = 'jungle',
  weatherConditions = 'sunny',
  sessionDuration = 0
}) => {
  const [backgroundColor, setBackgroundColor] = useState(COLORS.Orange);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState(getImageSharingCapabilities());
  const [showTemplate, setShowTemplate] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [showDescriptionSelector, setShowDescriptionSelector] = useState(false);
  
  const { profile } = useUserProfile();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBackgroundColor(COLORS.Orange);
      setCapabilities(getImageSharingCapabilities());
      setError(null);
    }
  }, [isOpen]);

  const handleShareScore = async () => {
    try {
      setIsProcessing(true);
      
      // Submit score to unified leaderboard
      if (profile?.pi_user_id) {
        const scoreSubmission: DinoPiSubmission = {
          score,
          game_mode: 'dinopi',
          session_duration: sessionDuration || 0,
          character_used: 'dino', // Default character
          difficulty: 'normal',
          level_reached: level,
          fossils_collected: fossils || 0,
          distance_traveled: distance || score * 10, // Estimate if not provided
          environment: environment || 'jungle',
          weather_conditions: weatherConditions || 'sunny',
          collectibles_found: coins,
          obstacles_avoided: Math.floor(score / 10) // Estimate based on score
        };

        await unifiedLeaderboardService.handleGameOver(
          profile.pi_user_id,
          profile.username || username || getDisplayUsername(),
          scoreSubmission
        );
      }

      // Share via Pi Network
      if (window.Pi?.openShareDialog) {
        const title = "Check out my Dino Pi score!";
        const message = `I just scored ${score} points and reached level ${level} in Dino Pi!  Can you beat my score? Play now at https://flappypi.fun/dinopi`;
        window.Pi.openShareDialog(title, message);
      } else if (navigator.share) {
        await navigator.share({
          title: "My Dino Pi Score",
          text: `I scored ${score} points in Dino Pi!  Can you beat it?`,
          url: window.location.href
        });
      } else {
        // Fallback to clipboard
        const shareText = `I scored ${score} points in Dino Pi!  Can you beat it? Play at https://flappypi.fun/dinopi`;
        await navigator.clipboard.writeText(shareText);
        alert('Score copied to clipboard!');
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to share score:', error);
      setError('Failed to share score. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dataUrl = await processElementToImage(cardRef.current, {
        scale: 2,
        quality: 0.9,
        width: 400,
        height: 600
      });
      
      downloadImage(dataUrl);
      console.log('✅ Dino Pi score card downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download score card:', error);
      setError('Failed to download image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const dataUrl = await processElementToImage(cardRef.current, {
        scale: 2,
        quality: 0.9,
        width: 400,
        height: 600
      });
      
      const result = await copyImageToClipboard(dataUrl);
      
      if (result.success) {
        alert('✅ Image copied to clipboard! You can now paste it anywhere.');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('❌ Failed to copy image:', error);
      setError('Failed to copy image. Please try the download option instead.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectDescription = (description: string) => {
    setSelectedDescription(description);
    setShowDescriptionSelector(false);
  };

  const handleCopyDescription = () => {
    const randomDesc = postDescriptions2[Math.floor(Math.random() * postDescriptions2.length)];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(randomDesc);
      alert('Description copied! Paste it to your social media post.\n\n' + randomDesc);
    } else {
      window.prompt('Copy this description:', randomDesc);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600 text-center">
 Share Your Dino Pi Score!
            </DialogTitle>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Score Card Preview */}
            <div ref={cardRef} className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white text-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2"> Dino Pi</h3>
              <div className="text-4xl font-black mb-2">{score}</div>
              <div className="text-lg">Level {level}</div>
              <div className="text-sm opacity-90">Best: {bestScore}</div>
              <div className="text-xs mt-2">Powered by Pi Network</div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleShareScore}
                disabled={isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
              >
                {isProcessing ? 'Sharing...' : '🚀 Share Score'}
              </Button>

              <Button
                onClick={handleDownloadImage}
                disabled={isProcessing}
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                {isProcessing ? 'Processing...' : '📸 Download Image'}
              </Button>

              <Button
                onClick={handleCopyImage}
                disabled={isProcessing || !capabilities.clipboard}
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {isProcessing ? 'Processing...' : capabilities.clipboard ? '📋 Copy Image' : 'Copy Not Supported'}
              </Button>

              <Button
                onClick={handleCopyDescription}
                variant="outline"
                className="w-full border-green-300 text-green-600 hover:bg-green-50"
              >
                📝 Copy Post Description
              </Button>
            </div>

            {/* Social Media Tips */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">💡 Sharing Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the post description for social media</li>
                <li>• Download the image for Instagram stories</li>
                <li>• Copy image for Discord/Telegram</li>
                <li>• Share via Pi Network for Pi rewards!</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DinoPiShareScoreModal;
