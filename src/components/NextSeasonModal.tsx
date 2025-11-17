import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Calendar, 
  Star, 
  Gift, 
  Zap, 
  Users, 
  Trophy,
  ShoppingBag,
  Heart,
  ArrowRight,
  Clock
} from 'lucide-react';

interface NextSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'dino-pi' | 'pvp-duels';
}

const NextSeasonModal: React.FC<NextSeasonModalProps> = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();
  const isDinoPi = feature === 'dino-pi';
  const isPvPDuels = feature === 'pvp-duels';

  const features = {
    'dino-pi': {
      title: '🦕 Dino Pi',
      subtitle: 'Prehistoric Adventure Awaits!',
      description: 'Get ready for an epic dinosaur adventure with evolution, fossils, and prehistoric worlds!',
      icon: '🦕',
      logo: '/dino pi/dinopi logo.png',
      color: 'from-green-500 to-blue-600',
      features: [
        '🦴 Fossil Collection System',
        '🌍 Multiple Prehistoric Worlds',
        '⚡ Dinosaur Evolution Stages',
        '🏆 Challenge Modes',
        '🎮 Classic & Endless Gameplay'
      ]
    },
    'pvp-duels': {
      title: '⚔️ PvP Duels',
      subtitle: 'Battle Against Friends!',
      description: 'Challenge your friends to epic Flappy Pi battles with real-time multiplayer action!',
      icon: '⚔️',
      logo: null, // Use emoji icon instead of generic logo
      color: 'from-red-500 to-orange-600',
      features: [
        '👥 Real-time Multiplayer',
        '🏆 Tournament System',
        '⚡ Power-ups & Special Moves',
        '🎯 Skill-based Matchmaking',
        '🏅 Ranking & Rewards'
      ]
    }
  };

  const currentFeature = features[feature];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 p-6 rounded-xl shadow-2xl">
        <DialogHeader className="text-center">
          <div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ${
            isPvPDuels 
              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          }`}>
            {currentFeature.logo ? (
              <img 
                src={currentFeature.logo} 
                alt={currentFeature.title}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
            ) : null}
            <div className={`${isPvPDuels ? 'text-5xl' : 'text-4xl'}`} style={{ display: currentFeature.logo ? 'none' : 'block' }}>
              {currentFeature.icon}
            </div>
          </div>
          <DialogTitle className={`text-3xl font-bold bg-clip-text text-transparent ${
            isDinoPi 
              ? 'bg-gradient-to-r from-green-600 to-blue-600' 
              : isPvPDuels 
                ? 'bg-gradient-to-r from-red-600 to-orange-600'
                : 'bg-gradient-to-r from-purple-600 to-blue-600'
          }`}>
            {currentFeature.title}
          </DialogTitle>
          <DialogDescription className="text-xl font-semibold text-gray-600 dark:text-gray-300 mt-2">
            {currentFeature.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Coming Soon Badge */}
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 text-lg font-bold">
              <Clock className="w-4 h-4 mr-2" />
              Coming in Next Season!
            </Badge>
          </div>

          {/* Description */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4">
              <p className="text-gray-700 dark:text-gray-300 text-center text-lg">
                {currentFeature.description}
              </p>
            </CardContent>
          </Card>

          {/* Features List */}
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800 dark:to-blue-800 border-2 border-purple-300 dark:border-purple-600">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-3 text-center text-purple-800 dark:text-purple-200">
                🎮 What's Coming:
              </h3>
              <div className="space-y-2">
                {currentFeature.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Message */}
          <Card className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 border-2 border-green-300 dark:border-green-600">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Heart className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-lg text-green-800 dark:text-green-200">
                  Support Flappy Pi Development!
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Help us bring these amazing features to life! Your support through purchases helps fund development and brings new content faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => {
                    onClose();
                    navigate('/shop');
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold px-6 py-3"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Visit Shop
                </Button>
                <Button 
                  onClick={() => {
                    onClose();
                    navigate('/subscription-plans');
                  }}
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50 font-bold px-6 py-3"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Premium Plans
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold px-6 py-3"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Playing
            </Button>
            <Button 
              onClick={() => {
                onClose();
                navigate('/leaderboard');
              }}
              variant="outline"
              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold px-6 py-3"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          </div>

          {/* Footer Message */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Thank you for being part of the Flappy Pi community! 🚀</p>
            <p className="mt-1">Stay tuned for updates on our social channels.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NextSeasonModal;
