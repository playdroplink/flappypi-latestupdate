import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FaPlay, FaDownload, FaUsers, FaTrophy, FaRocket, FaHeart, FaStar, FaGamepad, FaNewspaper, FaHome, FaBook, FaGamepad as FaGamepadIcon, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DinoPiSplashScreen from '@/components/DinoPiSplashScreen';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWallet } from '../context/WalletContext';
import { useSettings } from '../hooks/useSettings';
import { useToast } from '../hooks/useToast';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const DinoPiPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { balance } = useWallet();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { isPlaying, currentTrack } = useGlobalMusic();

  // Handle splash screen completion
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash on every visit to Dino Pi page
  useEffect(() => {
    // Always show splash for Dino Pi page
    setShowSplash(true);
  }, []);

  const features = [
    {
      icon: '',
      title: 'Evolution System',
      description: 'Evolve your dinosaur through multiple stages with unique abilities'
    },
    {
      icon: '🌍',
      title: 'Prehistoric Worlds',
      description: 'Explore stunning environments from jungles to deserts'
    },
    {
      icon: '💎',
      title: 'Pi Network Integration',
      description: 'Earn real Pi cryptocurrency while playing'
    },
    {
      icon: '🏆',
      title: 'Competitive Leaderboards',
      description: 'Compete with players worldwide for top rankings'
    },
    {
      icon: '🎮',
      title: 'Multiple Game Modes',
      description: 'Endless runner, time trials, and special challenges'
    },
    {
      icon: '🦕',
      title: 'Dinosaur Collection',
      description: 'Unlock and collect various dinosaur species'
    }
  ];

  const evolutionStages = [
    {
      stage: 'Baby T-Rex',
      icon: '',
      abilities: ['Basic Run', 'Simple Jump'],
      fossils: 0,
      color: 'from-green-400 to-green-600',
      isFree: true,
      description: 'Your friendly starter dinosaur - completely free!'
    },
    {
      stage: 'Teen T-Rex',
      icon: '',
      abilities: ['Double Jump', 'Speed Boost'],
      fossils: 50,
      color: 'from-blue-400 to-blue-600',
      isFree: false,
      description: 'Evolve with 50 fossils to unlock enhanced abilities'
    },
    {
      stage: 'Adult T-Rex',
      icon: '',
      abilities: ['Triple Jump', 'Charge Attack', 'Shield'],
      fossils: 150,
      color: 'from-purple-400 to-purple-600',
      isFree: false,
      description: 'Powerful evolution requiring 150 fossils'
    },
    {
      stage: 'Alpha T-Rex',
      icon: '',
      abilities: ['Flight', 'Sonic Roar', 'Invincibility'],
      fossils: 300,
      color: 'from-orange-400 to-orange-600',
      isFree: false,
      description: 'Ultimate form requiring 300 fossils'
    },
    {
      stage: 'Elder T-Rex',
      icon: '',
      abilities: ['Time Warp', 'Meteor Summon', 'Regeneration'],
      fossils: 500,
      color: 'from-red-400 to-red-600'
    }
  ];

  const environments = [
    {
      name: 'Jungle World',
      icon: '🌴',
      description: 'Lush prehistoric forests with towering trees and ancient ruins',
      features: ['Dense vegetation', 'Hidden treasures', 'Vine swinging']
    },
    {
      name: 'Desert World',
      icon: '🏜️',
      description: 'Vast desert landscapes with mysterious pyramids and sandstorms',
      features: ['Sand surfing', 'Pyramid exploration', 'Oasis discovery']
    },
    {
      name: 'Cave World',
      icon: '🕳️',
      description: 'Dark caverns filled with crystals and underground rivers',
      features: ['Crystal mining', 'Underground rivers', 'Ancient artifacts']
    },
    {
      name: 'Volcanic World',
      icon: '🌋',
      description: 'Fiery landscapes with lava flows and volcanic eruptions',
      features: ['Lava surfing', 'Volcanic eruptions', 'Fire resistance']
    }
  ];

  // Show splash screen if needed
  if (showSplash) {
    return <DinoPiSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Navigation Header */}
              <div className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                onClick={() => {
                  console.log('🔄 Navigating to home from DinoPiPage header...');
                  navigate('/home');
                }}
              >
                <FaHome className="mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-4">
                <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-12 h-12" />
                <h1 className="text-2xl font-bold text-orange-600">Dino Pi</h1>
              </div>
              <div className="w-16"></div>
            </div>
          </div>
        </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-32 h-32 mx-auto mb-6 animate-bounce" />
          </div>
          <h1 className="text-8xl font-black mb-8 text-white drop-shadow-2xl animate-pulse">
            DINO PI
          </h1>
          <p className="text-3xl text-white max-w-4xl mx-auto font-semibold leading-relaxed opacity-95 mb-12">
            The Epic Pi-Powered Dinosaur Adventure Game
          </p>
          <div className="space-y-6">
            {/* Game Mode Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-6 py-4 text-lg transform hover:scale-105 transition-all"
                onClick={() => navigate('/dino-pi/classic')}
              >
                <FaGamepad className="mr-2" />
                Classic Mode
              </Button>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-4 text-lg transform hover:scale-105 transition-all"
                onClick={() => navigate('/dino-pi/endless')}
              >
                <FaRocket className="mr-2" />
                Endless Mode
              </Button>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold px-6 py-4 text-lg transform hover:scale-105 transition-all"
                onClick={() => navigate('/dino-pi/challenge')}
              >
                <FaTrophy className="mr-2" />
                Challenge Mode
              </Button>
            </div>
            
            {/* Other Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 text-xl transform hover:scale-105 transition-all"
                onClick={() => setShowComingSoonModal(true)}
              >
                <FaPlay className="mr-2" />
                Coming Soon
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-4 text-xl"
                onClick={() => navigate('/dino-pi-blog')}
              >
                <FaNewspaper className="mr-2" />
                Read Blog
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-4 text-xl"
                onClick={() => {
                  console.log('🔄 Navigating to home from DinoPiPage...');
                  navigate('/home');
                }}
              >
                <FaHome className="mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['overview', 'features', 'evolution', 'worlds', 'community'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-gray-900 mb-6">
 Welcome to Dino Pi
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Embark on an epic prehistoric adventure where you'll evolve your dinosaur, 
                explore stunning environments, and earn real Pi cryptocurrency while playing!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Endless Adventure</h3>
                <p className="text-gray-600">Run, jump, and evolve through endless prehistoric landscapes</p>
              </Card>
              <Card className="text-center p-8 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="text-6xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Earn Pi</h3>
                <p className="text-gray-600">Collect Pi cryptocurrency as you play and achieve milestones</p>
              </Card>
              <Card className="text-center p-8 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Compete</h3>
                <p className="text-gray-600">Challenge players worldwide on global leaderboards</p>
              </Card>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                🚀 Game Features
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Discover the amazing features that make Dino Pi the ultimate prehistoric gaming experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Evolution Tab */}
        {activeTab === 'evolution' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-gray-900 mb-6">
 Evolution System
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Evolve your dinosaur through multiple stages, unlocking powerful abilities and becoming the ultimate prehistoric predator
              </p>
            </div>

            <div className="space-y-8">
              {evolutionStages.map((stage, index) => (
                <Card key={index} className={`p-6 hover:shadow-2xl transition-all ${stage.isFree ? 'ring-2 ring-green-400 bg-green-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${stage.color} flex items-center justify-center text-3xl`}>
                          {stage.isFree ? (
                            <img 
                              src="/dino pi/dino_0.png" 
                              alt="Free Dinosaur" 
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <span className="text-2xl">🔒</span>
                          )}
                        </div>
                        {stage.isFree && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            FREE
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{stage.stage}</h3>
                          {stage.isFree && (
                            <Badge className="bg-green-500 text-white">FREE</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{stage.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {stage.abilities.map((ability, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-800">
                              {ability}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-gray-600">
                          {stage.isFree ? 'No fossils required - Start playing immediately!' : `Fossils Required: ${stage.fossils}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {stage.isFree ? (
                        <div className="text-2xl font-bold text-green-600">FREE</div>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-orange-600">{stage.fossils}</div>
                          <div className="text-sm text-gray-500">Fossils</div>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Worlds Tab */}
        {activeTab === 'worlds' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                🌍 Prehistoric Worlds
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Explore stunning environments that will transport you to a world millions of years in the making
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {environments.map((env, index) => (
                <Card key={index} className="p-6 hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{env.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{env.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{env.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {env.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="border-orange-200 text-orange-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                👥 Join the Community
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Connect with fellow Dino Pi players, share strategies, and participate in community events
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 hover:shadow-2xl transition-all transform hover:scale-105">
                <FaUsers className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Global Players</h3>
                <p className="text-3xl font-bold text-orange-600">50K+</p>
                <p className="text-gray-600">Active players worldwide</p>
              </Card>
              <Card className="text-center p-6 hover:shadow-2xl transition-all transform hover:scale-105">
                <FaTrophy className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tournaments</h3>
                <p className="text-3xl font-bold text-orange-600">Weekly</p>
                <p className="text-gray-600">Competitive events</p>
              </Card>
              <Card className="text-center p-6 hover:shadow-2xl transition-all transform hover:scale-105">
                <FaHeart className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
                <p className="text-3xl font-bold text-orange-600">Active</p>
                <p className="text-gray-600">Friendly community</p>
              </Card>
              <Card className="text-center p-6 hover:shadow-2xl transition-all transform hover:scale-105">
                <FaStar className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rating</h3>
                <p className="text-3xl font-bold text-orange-600">4.8★</p>
                <p className="text-gray-600">Player satisfaction</p>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 text-xl"
                onClick={() => navigate('/dino-pi-game')}
              >
                <FaGamepad className="mr-2" />
                Play Game
              </Button>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => navigate('/dino-pi-blog')}
                >
                  <FaNewspaper className="mr-2" />
                  Dino Pi Blog
                </Button>
                <Button 
                  variant="outline" 
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => navigate('/dino-pi-game')}
                >
                  <FaGamepadIcon className="mr-2" />
                  Play Game
                </Button>
                <Button 
                  variant="outline" 
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => navigate('/home')}
                >
                  <FaHome className="mr-2" />
                  Main Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready for the Adventure?
          </h2>
          <p className="text-xl text-white mb-8 opacity-95">
            Join millions of players in the most epic dinosaur adventure ever created!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 text-xl"
              onClick={() => navigate('/dino-pi-game')}
            >
              <FaRocket className="mr-2" />
              Play Game
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-4 text-xl"
              onClick={() => navigate('/dino-pi-blog')}
            >
              <FaBook className="mr-2" />
              Read Blog
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-orange-600 font-bold px-8 py-4 text-xl"
              onClick={() => navigate('/home')}
            >
              <FaHome className="mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <DialogContent className="bg-white rounded-lg shadow-xl max-w-md mx-auto">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-16 h-16" />
            </div>
            <DialogTitle className="text-2xl font-bold text-orange-600 mb-2">
              Coming Soon!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg">
              Dino Pi is currently in development and will be released in the next seasons. Get ready for the ultimate prehistoric gaming experience!
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 text-orange-500">
              <FaClock className="text-xl" />
              <span className="font-semibold">Release: Next Seasons</span>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">What to Expect in Next Seasons:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• Epic dinosaur battles</li>
                <li>• Prehistoric worlds to explore</li>
                <li>• Evolution mechanics</li>
                <li>• Multiplayer features</li>
                <li>• Pi Network integration</li>
                <li>• Seasonal content updates</li>
                <li>• Community events</li>
              </ul>
            </div>
            
            <div className="flex justify-center space-x-3 pt-4">
              <Button 
                onClick={() => {
                  setShowComingSoonModal(false);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Got it!
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowComingSoonModal(false);
                  navigate('/dino-pi-blog');
                }}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                Read Blog
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DinoPiPage; 