import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FaComments, FaExternalLinkAlt, FaShare, FaTrophy, FaCoins } from 'react-icons/fa';
import { useUserProfile } from '../hooks/useUserProfile';
import { useToast } from '../hooks/use-toast';
import { getSkinNameById } from '@/utils/getSkinName';
import { getDisplayUsername } from '@/utils/usernameUtils';

interface FiresideForumIntegrationProps {
  score?: number;
  level?: number;
  bestScore?: number;
  coins?: number;
  isNewHighScore?: boolean;
  gameMode?: string;
  birdSkin?: string;
}

const FiresideForumIntegration: React.FC<FiresideForumIntegrationProps> = ({
  score = 0,
  level = 1,
  bestScore = 0,
  coins = 0,
  isNewHighScore = false,
  gameMode = 'Classic',
  birdSkin = 'Classic'
}) => {
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [customMessage, setCustomMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const username = getDisplayUsername();
  const piUserId = profile?.pi_user_id || '';
  const skinDisplayName = getSkinNameById(birdSkin);

  // Generate default forum post content
  const generateForumPost = () => {
    const baseMessage = `🎮 Flappy Pi Score Update! 🎮

🐦 My Score: ${score}
🏆 Level Reached: ${level}
🔥 Best Score: ${bestScore}
💰 Coins Earned: ${coins}
🎯 Game Mode: ${gameMode}
🎨 Bird Skin: ${skinDisplayName}

👤 Username: ${username}
${piUserId ? `🆔 Pi ID: ${piUserId}` : ''}

${isNewHighScore ? '🏆 NEW PERSONAL BEST! 🏆' : ''}

Can you beat my score? Join the challenge! 🚀

#FlappyPi #PiNetwork #FlappyPiChallenge #PiGaming`;

    return customMessage || baseMessage;
  };

  // Handle posting to Fireside Forum
  const handlePostToForum = async () => {
    setIsPosting(true);
    
    try {
      const postContent = generateForumPost();
      const forumUrl = 'https://fireside.pinet.com/channels/FlappyPiChallenge';
      
      // Create a form data to simulate posting (this would need backend integration)
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('channel', 'FlappyPiChallenge');
      formData.append('username', username);
      formData.append('pi_user_id', piUserId);
      
      // For now, we'll open the forum in a new tab with pre-filled content
      const encodedContent = encodeURIComponent(postContent);
      const forumPostUrl = `${forumUrl}?content=${encodedContent}`;
      
      window.open(forumPostUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Forum Post Ready!",
        description: "Fireside Forum opened with your score. Copy and paste your content to share!",
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error posting to forum:', error);
      toast({
        title: "Post Failed",
        description: "Could not post to forum. Please try again or copy the content manually.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  // Copy post content to clipboard
  const handleCopyContent = async () => {
    try {
      const postContent = generateForumPost();
      await navigator.clipboard.writeText(postContent);
      
      toast({
        title: "Content Copied!",
        description: "Your forum post content has been copied to clipboard.",
        duration: 3000
      });
    } catch (error) {
      console.error('Error copying content:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy content. Please select and copy manually.",
        variant: "destructive"
      });
    }
  };

  // Open Fireside Forum directly
  const handleOpenForum = () => {
    window.open('https://fireside.pinet.com/channels/FlappyPiChallenge', '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center sm:text-left">
        <CardTitle className="flex items-center justify-center sm:justify-start gap-2 text-orange-600">
          <FaComments className="text-2xl" />
          Fireside Forum Integration
        </CardTitle>
        <p className="text-sm text-gray-600 text-center sm:text-left">
          Share your Flappy Pi achievements directly to the Pi Network community!
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Summary */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{level}</div>
              <div className="text-xs text-gray-600">Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{bestScore}</div>
              <div className="text-xs text-gray-600">Best</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{coins}</div>
              <div className="text-xs text-gray-600">Coins</div>
            </div>
          </div>
          
          {isNewHighScore && (
            <div className="mt-3 text-center">
              <Badge className="bg-yellow-500 text-white animate-pulse">
                <FaTrophy className="mr-1" />
                NEW HIGH SCORE!
              </Badge>
            </div>
          )}
        </div>

        {/* Custom Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customize Your Forum Post (Optional)
          </label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add your personal message here... (leave empty for default post)"
            className="min-h-[100px]"
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Preview
          </label>
          <div className="bg-gray-50 p-3 rounded-lg border text-sm whitespace-pre-wrap break-all font-mono text-black max-h-48 overflow-auto">
            {generateForumPost()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handlePostToForum}
            disabled={isPosting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3"
          >
            <FaShare className="mr-2" />
            {isPosting ? 'Posting...' : 'Post to Forum'}
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <Button
              onClick={handleCopyContent}
              variant="outline"
              className="flex-1"
            >
              <FaComments className="mr-2" />
              Copy Content
            </Button>
            
            <Button
              onClick={handleOpenForum}
              variant="outline"
              className="flex-1"
            >
              <FaExternalLinkAlt className="mr-2" />
              Open Forum
            </Button>
          </div>
        </div>

        {/* Forum Info */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <FaComments className="text-blue-600" />
            <span className="font-medium">Fireside Forum Channel</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Join the <strong>#FlappyPiChallenge</strong> channel to share scores, 
            discuss strategies, and connect with other Flappy Pi players!
          </p>
          <div className="mt-2 text-xs text-blue-600">
            📍 <a 
              href="https://fireside.pinet.com/channels/FlappyPiChallenge" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              fireside.pinet.com/channels/FlappyPiChallenge
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiresideForumIntegration; 