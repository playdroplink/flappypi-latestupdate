import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusicContext } from '../context/GlobalMusicContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import DinoPiGameMode from '../components/game/DinoPiGameMode';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Target, 
  Clock,
  Users,
  Crown,
  Zap,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Coins,
  Star,
  Shield,
  Zap as ZapIcon,
  Gift,
  Settings,
  Volume2,
  VolumeX,
  Jump,
  Flame,
  Mountain,
  TreePine
} from 'lucide-react';

// Game mode selection
const GAME_MODES = [
  {
    id: 'classic',
    name: 'Classic Mode',
    description: 'Endless runner with dinosaur evolution',
    icon: '',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'endless',
    name: 'Endless Mode',
    description: 'Infinite prehistoric adventure',
    icon: '🌍',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'challenge',
    name: 'Challenge Mode',
    description: 'Special challenges and missions',
    icon: '🏆',
    color: 'from-purple-400 to-purple-600'
  }
];

// Pi Network integration features
const PI_FEATURES = [
  {
    name: 'Pi Fossils',
    description: 'Collect fossils to earn Pi cryptocurrency',
    icon: '💎',
    color: 'from-purple-400 to-purple-600'
  },
  {
    name: 'Evolution Rewards',
    description: 'Earn Pi for each evolution stage',
    icon: '',
    color: 'from-orange-400 to-orange-600'
  },
  {
    name: 'Daily Challenges',
    description: 'Complete daily missions for Pi rewards',
    icon: '📅',
    color: 'from-blue-400 to-blue-600'
  },
  {
    name: 'Leaderboard Prizes',
    description: 'Compete for Pi prizes on leaderboards',
    icon: '🏆',
    color: 'from-yellow-400 to-yellow-600'
  }
];

const DinoPiGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { balance, addCoins, spendCoins } = useWallet();
  const { isAuthenticated, isPiAuth, piUser } = useAuth();
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { stopMusic } = useGlobalMusicContext();
  const { playSwoosh, playClickSound, playSuccessSound, playErrorSound } = useSoundEffects();
  
  // Game state
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(settings.musicEnabled);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [showGameModeModal, setShowGameModeModal] = useState(false);
  const [showPiFeaturesModal, setShowPiFeaturesModal] = useState(false);

  // CRITICAL: Stop all music when entering game page
  useEffect(() => {
    console.log('🎵 [DinoPiGamePageNew] Component mounted - stopping all background music');
    stopMusic();
  }, [stopMusic]);

  // Handle game mode selection
  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    playClickSound();
  };

  // Handle back to menu
  const handleBackToMenu = () => {
    setSelectedMode(null);
    playClickSound();
  };

  // Handle music toggle
  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
    // Always stop music in game mode - no background music allowed
    stopMusic();
    playClickSound();
  };

  // Handle sound toggle
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    playClickSound();
  };

  // If a game mode is selected, show the game
  if (selectedMode) {
    return (
      <DinoPiGameMode
        mode={selectedMode as 'classic' | 'endless' | 'challenge'}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4"></div>
        <h1 className="text-4xl font-bold text-orange-700 mb-2">Dino Pi</h1>
        <p className="text-lg text-orange-600">Prehistoric Adventure with Pi Network Integration</p>
      </div>

      {/* Pi Network Status */}
      <Card className="w-full max-w-md mb-6 bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-2xl">π</div>
            <span className="font-bold text-purple-700">Pi Network Status</span>
            {isAuthenticated && isPiAuth ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          {isAuthenticated && isPiAuth ? (
            <div className="text-green-700 font-semibold">
              ✅ Connected to Pi Network
              {piUser && (
                <div className="text-sm text-green-600 mt-1">
                  Welcome, {piUser.username || 'Pi User'}!
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-700 font-semibold">
              ❌ Not connected to Pi Network
              <div className="text-sm text-red-600 mt-1">
                Connect to earn Pi rewards while playing
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
        {GAME_MODES.map((mode) => (
          <Card
            key={mode.id}
            className={`bg-gradient-to-br ${mode.color} border-2 border-orange-300 hover:border-orange-400 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            onClick={() => handleModeSelect(mode.id)}
          >
            <CardContent className="p-6 text-center text-white">
              <div className="text-4xl mb-3">{mode.icon}</div>
              <h3 className="text-xl font-bold mb-2">{mode.name}</h3>
              <p className="text-sm opacity-90">{mode.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pi Features */}
      <Card className="w-full max-w-4xl mb-6 bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-2">
            <div className="text-3xl">π</div>
            Pi Network Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PI_FEATURES.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${feature.color} rounded-lg p-4 text-white`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold">{feature.name}</h4>
                    <p className="text-sm opacity-90">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-8">
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {parseInt(localStorage.getItem('dino-pi-high-score') || '0')}
            </div>
            <div className="text-sm text-orange-500">High Score</div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {parseInt(localStorage.getItem('dino-pi-fossils') || '0')}
            </div>
            <div className="text-sm text-purple-500">Total Fossils</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {parseInt(localStorage.getItem('dino-pi-evolutions') || '0')}
            </div>
            <div className="text-sm text-blue-500">Evolutions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {parseInt(localStorage.getItem('dino-pi-distance') || '0')}m
            </div>
            <div className="text-sm text-green-500">Distance</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={toggleMusic}
          className={`${musicEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white font-bold px-6 py-3`}
        >
          {musicEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
          Music {musicEnabled ? 'On' : 'Off'}
        </Button>
        
        <Button
          onClick={toggleSound}
          className={`${soundEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white font-bold px-6 py-3`}
        >
          {soundEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
          Sound {soundEnabled ? 'On' : 'Off'}
        </Button>
        
        <Button
          onClick={() => setShowPiFeaturesModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3"
        >
          <Gift className="mr-2 h-4 w-4" />
          Pi Features
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={() => navigate('/dino-pi')}
          className="border-orange-500 text-orange-600 hover:bg-orange-50 px-6 py-3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        
        <Button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>

      {/* Pi Features Modal */}
      <Dialog open={showPiFeaturesModal} onOpenChange={setShowPiFeaturesModal}>
        <DialogContent className="bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-purple-600 mb-2 flex items-center justify-center gap-2">
              <div className="text-3xl">π</div>
              Pi Network Features
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg">
              Discover how Dino Pi integrates with Pi Network for real rewards!
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            {PI_FEATURES.map((feature, index) => (
              <div key={index} className={`bg-gradient-to-r ${feature.color} rounded-lg p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg">{feature.name}</h4>
                    <p className="text-sm opacity-90">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button
              onClick={() => setShowPiFeaturesModal(false)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-8 py-3"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DinoPiGamePage;
