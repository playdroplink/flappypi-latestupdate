import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaComments, FaExternalLinkAlt, FaShare, FaTrophy, FaCoins, FaUsers, FaHashtag, FaArrowLeft } from 'react-icons/fa';
import { useUserProfile } from '../hooks/useUserProfile';
import { useToast } from '../hooks/use-toast';
import FiresideForumIntegration from '../components/FiresideForumIntegration';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const FiresideForumPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [showIntegration, setShowIntegration] = useState(false);

  const username = profile?.username || 'Player';
  const piUserId = profile?.pi_user_id || '';

  const forumStats = [
    { label: 'Active Members', value: '2,847', icon: <FaUsers className="text-blue-500" /> },
    { label: 'Total Posts', value: '15,392', icon: <FaComments className="text-green-500" /> },
    { label: 'Daily Discussions', value: '156', icon: <FaHashtag className="text-purple-500" /> },
    { label: 'Top Score', value: '1,247', icon: <FaTrophy className="text-yellow-500" /> },
  ];

  const recentTopics = [
    {
      title: '🏆 Weekly Leaderboard Results',
      author: '@PiGamer2025',
      replies: 23,
      lastActivity: '2 hours ago',
      isPinned: true
    },
    {
      title: '🐤 Best Bird Skin Combinations',
      author: '@FlappyMaster',
      replies: 45,
      lastActivity: '5 hours ago',
      isPinned: false
    },
    {
      title: '💡 Strategy Tips for Level 50+',
      author: '@PiNetworkPro',
      replies: 67,
      lastActivity: '1 day ago',
      isPinned: false
    },
    {
      title: '🎮 New Challenge Mode Discussion',
      author: '@GameDevPi',
      replies: 89,
      lastActivity: '2 days ago',
      isPinned: false
    },
    {
      title: '💰 Pi Rewards Distribution Update',
      author: '@PiAdmin',
      replies: 34,
      lastActivity: '3 days ago',
      isPinned: true
    }
  ];

  const handleOpenForum = () => {
    window.open('https://fireside.pinet.com/channels/FlappyPiChallenge', '_blank', 'noopener,noreferrer');
  };

  const handleShareForum = async () => {
    const shareText = `🎮 Join the Flappy Pi community on Fireside Forum! 

🏆 Share your scores, discuss strategies, and connect with other Pi Network gamers.

📍 fireside.pinet.com/channels/FlappyPiChallenge
🌐 Play Flappy Pi: https://flappypi.fun/flappypiofficial

#FlappyPi #PiNetwork #FlappyPiChallenge #PiGaming`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Flappy Pi - Fireside Forum',
          text: shareText,
          url: 'https://fireside.pinet.com/channels/FlappyPiChallenge'
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Forum Link Copied!",
          description: "Share the Fireside Forum link with your friends!",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error sharing forum:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/home')}
                className="text-white hover:bg-white/20"
              >
                <FaArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <FaComments className="text-3xl" />
                <div>
                  <h1 className="text-2xl font-bold">Fireside Forum</h1>
                  <p className="text-orange-100 text-sm">Pi Network Community Hub</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleShareForum}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <FaShare className="mr-2" />
                Share Forum
              </Button>
              <Button
                onClick={handleOpenForum}
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                <FaExternalLinkAlt className="mr-2" />
                Open Forum
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <FaComments className="text-2xl" />
              Welcome to Flappy Pi Community Forum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Connect with fellow Flappy Pi players, share your achievements, discuss strategies, 
              and be part of the growing Pi Network gaming community!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowIntegration(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <FaShare className="mr-2" />
                Share My Score
              </Button>
              <Button
                onClick={handleOpenForum}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <FaExternalLinkAlt className="mr-2" />
                Browse Discussions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forum Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {forumStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-4">
                <div className="flex justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaComments className="text-xl" />
              Recent Discussions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={handleOpenForum}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {topic.isPinned && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          📌 Pinned
                        </Badge>
                      )}
                      <span className="font-medium text-gray-800">{topic.title}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      by {topic.author} • {topic.replies} replies • {topic.lastActivity}
                    </div>
                  </div>
                  <FaExternalLinkAlt className="text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Community Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Be respectful and supportive of other community members</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Share your scores and achievements with pride</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Help new players with tips and strategies</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Report any inappropriate content to moderators</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Use #FlappyPiChallenge hashtag in your posts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setShowIntegration(true)}
                className="h-20 flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white"
              >
                <FaShare className="text-2xl mb-1" />
                <span className="text-sm">Share Score</span>
              </Button>
              <Button
                onClick={handleOpenForum}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center border-orange-300 text-orange-700"
              >
                <FaComments className="text-2xl mb-1" />
                <span className="text-sm">Join Discussion</span>
              </Button>
              <Button
                onClick={handleShareForum}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center border-blue-300 text-blue-700"
              >
                <FaExternalLinkAlt className="text-2xl mb-1" />
                <span className="text-sm">Invite Friends</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fireside Forum Integration Modal */}
      {showIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-6xl w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center min-h-[80vh] sm:min-h-0">
            <div className="p-4 sm:p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-orange-700">Share to Fireside Forum</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowIntegration(false)}
                >
                  ✕
                </Button>
              </div>
              <FiresideForumIntegration 
                score={0}
                level={1}
                bestScore={0}
                coins={0}
                isNewHighScore={false}
                gameMode="Classic"
                birdSkin=""
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiresideForumPage; 