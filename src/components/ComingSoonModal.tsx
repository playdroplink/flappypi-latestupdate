import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Zap, Trophy, Users, Star, ArrowRight, X } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
  expectedRelease?: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ 
  isOpen, 
  onClose, 
  feature,
  description = "This exciting feature is currently in development",
  expectedRelease = "Coming Soon"
}) => {
  const features = [
    {
      icon: "⚔️",
      title: "Real-time Duels",
      description: "Challenge friends in live multiplayer battles"
    },
    {
      icon: "🏆",
      title: "Tournament System",
      description: "Join weekly competitions and climb leaderboards"
    },
    {
      icon: "👥",
      title: "Team Battles",
      description: "Form teams and compete against other groups"
    },
    {
      icon: "🎯",
      title: "Ranked Matches",
      description: "Prove your skills in competitive ranked play"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full rounded-3xl shadow-2xl bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 px-6 pt-6 pb-4 flex flex-col items-center text-white">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <span className="text-4xl">⚔️</span>
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold animate-bounce">
              SOON
            </div>
          </div>
          <DialogTitle className="text-3xl font-black mb-2 text-center">
            {feature} Coming Soon!
          </DialogTitle>
          <DialogDescription className="text-orange-100 text-center text-lg mb-4">
            {description}
          </DialogDescription>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Clock className="w-4 h-4 mr-1" /> {expectedRelease}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Zap className="w-4 h-4 mr-1" /> In Development
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          {/* Main Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              🚀 What to Expect
            </h3>
            <p className="text-gray-600 text-lg">
              We're working hard to bring you an amazing dueling experience!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:scale-105 transition-transform duration-200">
                <CardHeader className="text-center pb-3">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Section */}
          <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-blue-800 text-center">
                📈 Development Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Backend Development</span>
                  <span className="text-sm text-blue-600">75%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Frontend Integration</span>
                  <span className="text-sm text-blue-600">60%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">Testing & Polish</span>
                  <span className="text-sm text-blue-600">30%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notify Me Section */}
          <Card className="bg-gradient-to-r from-green-100 to-teal-100 border-green-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Want to be notified when it's ready?
              </h3>
              <p className="text-green-700 mb-4">
                We'll send you an update as soon as the duels feature is available!
              </p>
              <Button
                onClick={() => {
                  // Here you could implement notification signup
                  alert('Notification signup would be implemented here!');
                }}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all"
              >
                <Star className="w-4 h-4 mr-2" />
                Notify Me When Ready
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-3 px-6 pb-6 bg-gradient-to-r from-red-50 to-orange-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
        
        <div className="text-center text-xs text-gray-400 pb-4 bg-gradient-to-r from-red-50 to-orange-50">
          Powered by Pi Network • Built with ❤️ for the community
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonModal;
