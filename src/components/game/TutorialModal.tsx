import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Target, Zap, Trophy, Users, Star, Heart, Coins, Shield, Magnet } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, onStartGame }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-0 overflow-hidden max-h-screen sm:max-h-[90vh] mt-0 sm:mt-8 flex flex-col justify-center">
        <DialogHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 sm:px-8 pt-8 pb-6 flex flex-col items-center text-white" style={{paddingTop: 'env(safe-area-inset-top, 1.5rem)'}}>
          <div className="relative">
            <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-20 h-20 mb-4 drop-shadow-2xl animate-pulse" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold animate-bounce">
              NEW
            </div>
          </div>
          <DialogTitle className="text-3xl font-black mb-2 text-center">{t('tutorialWelcome')}</DialogTitle>
          <DialogDescription className="text-blue-100 text-center text-lg mb-4">
            {t('tutorialDescription')}
          </DialogDescription>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Play className="w-4 h-4 mr-1" /> Complete Guide
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Star className="w-4 h-4 mr-1" /> Pro Strategies
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-2 sm:px-8 py-4 sm:py-6 flex-1 overflow-y-auto max-h-[calc(100vh-6rem)] sm:max-h-[70vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Getting Started */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 rounded-full p-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">{t('tutorialObjective')}</h3>
                </div>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                    <div>
                      <strong className="text-blue-700">{t('tutorialControls')}</strong>
                      <p className="text-sm text-gray-600 mt-1">Tap screen or press SPACE to flap. Timing is everything!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                    <div>
                      <strong className="text-blue-700">Navigate Smartly</strong>
                      <p className="text-sm text-gray-600 mt-1">Fly through pipe gaps. Watch for upcoming obstacles!</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-bold text-sm">3</div>
                    <div>
                      <strong className="text-blue-700">{t('tutorialScoring')}</strong>
                      <p className="text-sm text-gray-600 mt-1">Grab coins, power-ups, and special items for bonuses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-bold text-sm">4</div>
                    <div>
                      <strong className="text-blue-700">{t('tutorialPowerUps')}</strong>
                      <p className="text-sm text-gray-600 mt-1">Every second counts. Build your endurance!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-500 rounded-full p-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800">⚡ Power-up System</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-green-700">Shield</h4>
                    </div>
                    <p className="text-xs text-green-600">Protects from one collision</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Magnet className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-green-700">Magnet</h4>
                    </div>
                    <p className="text-xs text-green-600">Attracts coins automatically</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-green-700">Speed Boost</h4>
                    </div>
                    <p className="text-xs text-green-600">Temporary speed increase</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/flappycoins.png" alt="Flappy Coin" className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-green-700">Double Points</h4>
                    </div>
                    <p className="text-xs text-green-600">2x score multiplier</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Advanced Strategies */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500 rounded-full p-3">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800">🏆 Pro Strategies</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <strong className="text-purple-700">Develop Rhythm</strong>
                      <p className="text-sm text-purple-600">Find your perfect tapping tempo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl">👁️</div>
                    <div>
                      <strong className="text-purple-700">Look Ahead</strong>
                      <p className="text-sm text-purple-600">Focus on upcoming obstacles</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl">🧘</div>
                    <div>
                      <strong className="text-purple-700">Stay Calm</strong>
                      <p className="text-sm text-purple-600">Panic leads to mistakes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl">💪</div>
                    <div>
                      <strong className="text-purple-700">{t('tutorialPractice')}</strong>
                      <p className="text-sm text-purple-600">Consistency builds skill</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-500 rounded-full p-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800">🪙 Pi Network Rewards</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Earn Flappy Coins for every game</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Unlock exclusive bird skins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Join weekly tournaments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Win real Pi cryptocurrency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Climb global leaderboards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Game Modes & Tips */}
          <div className="mt-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">🎮 Choose Your Adventure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/90 rounded-xl p-4 text-center shadow-md border border-green-200">
                  <div className="text-3xl mb-2">🟢</div>
                  <h4 className="font-bold text-green-700">Classic Mode</h4>
                  <p className="text-sm text-gray-600 mb-2">Perfect for beginners</p>
                  <p className="text-xs text-green-600">Start here to learn the basics</p>
                </div>
                <div className="bg-white/90 rounded-xl p-4 text-center shadow-md border border-blue-200">
                  <div className="text-3xl mb-2">🔵</div>
                  <h4 className="font-bold text-blue-700">Endless Mode</h4>
                  <p className="text-sm text-gray-600 mb-2">Keep flying forever</p>
                  <p className="text-xs text-blue-600">Challenge your endurance</p>
                </div>
                <div className="bg-white/90 rounded-xl p-4 text-center shadow-md border border-purple-200">
                  <div className="text-3xl mb-2">🟣</div>
                  <h4 className="font-bold text-purple-700">Challenge Mode</h4>
                  <p className="text-sm text-gray-600 mb-2">For experts only</p>
                  <p className="text-xs text-purple-600">Complete special objectives</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">💡 Quick Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <strong className="text-pink-700">Take Breaks</strong>
                    <p className="text-xs text-pink-600">Rest your eyes and hands</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                  <Star className="w-5 h-5 text-orange-500" />
                  <div>
                    <strong className="text-orange-700">Set Goals</strong>
                    <p className="text-xs text-orange-600">Aim for personal records</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                  <img src="/flappycoins.png" alt="Flappy Coin" className="w-5 h-5 text-yellow-500" />
                  <div>
                    <strong className="text-yellow-700">Save Coins</strong>
                    <p className="text-xs text-yellow-600">Buy power-ups strategically</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <div>
                    <strong className="text-purple-700">Compete Daily</strong>
                    <p className="text-xs text-purple-600">Join tournaments regularly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 px-8 pb-6">
          <Button 
            variant="default" 
            size="lg" 
            onClick={onStartGame ? onStartGame : onClose} 
            className="w-full text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
          >
            🚀 {t('tutorialReady')}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Ready to soar to new heights? Good luck, Pi-oneer! 🎮✨
          </p>
        </DialogFooter>
        <div className="text-center text-xs text-gray-400 pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
          Powered by Pi Network • Built with ❤️ for the community
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal; 