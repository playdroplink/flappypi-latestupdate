import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { 
  Play, 
  Coins, 
  Trophy, 
  ShoppingCart, 
  Users, 
  Gift, 
  Star,
  Download,
  ArrowRight,
  Zap,
  Shield,
  Target,
  Heart,
  Sparkles,
  X,
  Globe,
  Magnet
} from 'lucide-react';
import AboutModal from '@/components/AboutModal';
import HelpModal from '@/components/HelpModal';
import TermsModal from '@/components/TermsModal';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import Contact from '@/components/Contact';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FaTwitter, FaTelegram, FaDiscord, FaFacebook, FaTiktok, FaInstagram, FaYoutube, FaComments, FaBookmark } from 'react-icons/fa';
import FAQModal from '@/components/FAQModal';
import ContactModal from '@/components/ContactModal';
import PrivacyModal from '@/components/PrivacyModal';
import { motion } from 'framer-motion';
import WhitepaperModal from '@/components/WhitepaperModal';

const npcDialogMessages = [
  "Welcome to Flappy Pi — ready to flap and earn?",
  "Every flap brings you closer to Pi rewards!",
  "Challenge Mode unlocked… if you dare!",
  "Tap those pipes, collect that Pi!",
  "Play now, earn Pi later. It's that simple!",
  "Leaderboards reset weekly. Stay on top!",
  "Don’t forget your daily mystery box!",
  "New skins in the shop! Which bird are you today?",
  "Stats rising? You must be a flapping pro!",
  "Watch an ad, support the devs, win some Pi!",
  "Start flapping… greatness awaits!",
  "Flappy fingers = flying fortunes!",
  "Game on, Pioneer!",
  "The whole Pi world is watching… fly proud!",
  "Only legends reach 100+ pipes. Got what it takes?",
  "Top 10 players win weekly bonuses!",
  "Customize your bird. Express yourself!",
  "What’s in today’s mystery egg? Tap to find out!",
  "Hint: Golden pipes give bigger rewards!",
  "Watch out for turbo pipes — they’re sneaky!",
  "Playing on mobile? You’re already optimized!",
  "Settings menu? Bottom right. Adjust your flight!",
  "Have feedback? We’re all ears (and feathers).",
  "New map levels coming soon. Stay tuned!",
  "Tip: Slow flaps = better control!",
  "You’ve earned a new badge!",
  "Under maintenance? We’ll be back flapping soon!",
  "Explore the Pipe Kingdom!",
  "AI Chatbot ready to help anytime!",
  "Sound on = more immersive flapping!",
  "Flap in Night Mode — looks cooler!",
  "Your bird. Your journey. Your Pi.",
  "The community is talking — join us!",
  "Log in to save progress and Pi earnings.",
  "New to Flappy Pi? Tap 'How to Play!'",
  "Invite friends — earn bonus Pi!",
  "Your bird misses you!",
  "Limited-time event incoming!",
  "Rare egg alert! Can you crack it?",
  "New skins rotate every 24 hours!",
  "Practice makes perfect. Pipes won't dodge themselves!",
  "VIP skins only for top 100 players!",
  "Redeem codes? Oh yes — coming soon!",
  "Eyes on the skies — golden Pi drops happen randomly!",
  "Enable notifications to never miss rewards.",
  "Your best score: Can you beat it today?",
  "Unlock the Rainbow Trail skin!",
  "Leaderboard glitch? Nah, you're just THAT good!",
  "Smooth as Pi. Fast as feathers.",
  "Back again? We love that energy!"
];

const npcImages = [
  "/npc gif/npc-4.gif.gif",
  "/npc/chengdiao.png",
  "/npc/nicolas.png"
];

// Add the socialLinks array for the website social section
const socialLinks: Array<{
  name: string;
  handle: string;
  url: string;
  icon: JSX.Element;
  btn: string;
  color: string;
  isInternal?: boolean;
}> = [
  { name: 'Discord', handle: '@flappypiofficial', url: 'https://discord.gg/W2CJFMqR', icon: <FaDiscord size={32} color="#5865F2" />, btn: 'Join Discord', color: '#5865F2' },
  { name: 'Twitter', handle: '@flappypifun', url: 'https://x.com/flappypifun', icon: <FaTwitter size={32} color="#1DA1F2" />, btn: 'Follow', color: '#1DA1F2' },
  { name: 'Telegram', handle: '@flappypiofficial', url: 'https://t.me/flappypiofficial', icon: <FaTelegram size={32} color="#0088cc" />, btn: 'Join Channel', color: '#0088cc' },
  { name: 'YouTube', handle: '@flappypiofficial', url: 'https://youtube.com/@flappypiofficial', icon: <FaYoutube size={32} color="#FF0000" />, btn: 'Subscribe', color: '#FF0000' },
  { name: 'Instagram', handle: '@flappypiofficial', url: 'https://instagram.com/flappypiofficial', icon: <FaInstagram size={32} color="#E4405F" />, btn: 'Follow', color: '#E4405F' },
  { name: 'Facebook', handle: '@flappypiofficial', url: 'https://facebook.com/flappypiofficial', icon: <FaFacebook size={32} color="#1877F2" />, btn: 'Like Page', color: '#1877F2' },
  { name: 'TikTok', handle: '@flappypiofficial', url: 'https://tiktok.com/@flappypiofficial', icon: <FaTiktok size={32} color="#000000" />, btn: 'Follow', color: '#000000' },
  { name: 'Fireside Forum', handle: '@FlappyPiChallenge', url: 'https://fireside.pinet.com/channels/FlappyPiChallenge', icon: <FaComments size={32} color="#FF6B35" />, btn: 'Join Forum', color: '#FF6B35' },
  { name: 'Website', handle: 'flappypiofficial', url: '/flappypiofficial', icon: <Globe size={32} color="#10B981" />, btn: 'Visit Website', color: '#10B981', isInternal: true },
];

const FlappyPiWebsite: React.FC = () => {
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [showNpcDialog, setShowNpcDialog] = React.useState(true);
  const [npcDialogIndex, setNpcDialogIndex] = React.useState(0);
  const [npcImageIndex, setNpcImageIndex] = React.useState(0);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [faqOpen, setFaqOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  const [termsOpen, setTermsOpen] = React.useState(false);
  const [demoOpen, setDemoOpen] = React.useState(false);
  const [showWhitepaper, setShowWhitepaper] = React.useState(false);

  const handlePlayNow = () => {
    navigate('/play');
  };

  const handleDownload = () => {
    window.open('https://minepi.com/Wain2020', '_blank');
  };

  const handleNextDialog = () => {
    setNpcDialogIndex((i) => (i + 1) % npcDialogMessages.length);
    setNpcImageIndex((i) => (i + 1) % npcImages.length);
  };

  return (
          <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* HEADER */}
      <header className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-4 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img 
            src="/flappy pi gif/flappy-2.gif.gif" 
            alt="Flappy Pi Logo" 
            className="w-10 h-10"
            onError={(e) => {
              console.warn('❌ Flappy Pi GIF failed to load in FlappyPiWebsite header, using fallback');
              e.currentTarget.src = '/flappy-logo.png';
            }}
          />
          <span className="text-2xl font-bold text-white tracking-tight">Flappy Pi</span>
        </div>
        <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded-xl shadow-md" asChild>
          <a href="https://www.flappypi.xyz/" target="_blank" rel="noopener noreferrer">
            <Play className="w-5 h-5 mr-2" /> Play Now
          </a>
        </Button>
      </header>
      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Coins className="w-4 h-4 mr-2" />
                  Play to Earn Pi Rewards
                </Badge>
                <div className="flex items-center gap-3 mb-4">
                  <img src="/flappycoins.png" alt="Flappy Coin" className="w-10 h-10 drop-shadow-md animate-bounce animate-pulse" />
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight">
                    Flap Your Way to <span className="text-blue-700">Pi Riches!</span>
                  </h1>
                </div>
                <p className="text-xl text-gray-600 leading-relaxed">
                  The ultimate Pi Network-powered Flappy Bird experience. 
                  Earn Pi coins while having fun, compete with friends, and 
                  unlock amazing rewards!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  asChild
                  className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-10 py-5 text-lg rounded-xl shadow-lg border-2 border-yellow-600 transition-all duration-200"
                  style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)' }}
                >
                  <a href="https://www.flappypi.xyz" target="_blank" rel="noopener noreferrer">
                    <Play className="w-5 h-5 mr-2" />
                    Play Now
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleDownload}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Pi Browser
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/flappy-pi-blog')}
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold"
                >
                  <FaBookmark size={20} color="#8B5CF6" />
                  Read Blog
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>500K+ Players</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span>1M+ Pi Earned</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  <span>4.8/5 Rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/birds2/bird_0.gif" 
                  alt="Flappy Pi Bird" 
                  className="w-64 h-64 mx-auto animate-bounce"
                  onError={(e) => {
                    console.warn('❌ Bird GIF failed to load in FlappyPiWebsite hero, using fallback');
                    e.currentTarget.src = '/birds/bird_0.png';
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Features Section */}
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">Why Play Flappy Pi?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-2xl p-6 bg-white shadow-lg border-t-4 border-yellow-400 flex flex-col items-center text-center">
            <Trophy className="w-12 h-12 text-yellow-500 mb-3" />
            <h3 className="font-bold text-xl mb-2">Compete & Win</h3>
            <p className="text-gray-600">Climb the leaderboards and win real Pi every week!</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="rounded-2xl p-6 bg-white shadow-lg border-t-4 border-green-400 flex flex-col items-center text-center">
            <Coins className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="font-bold text-xl mb-2">Earn Pi</h3>
            <p className="text-gray-600">Play, flap, and earn Pi coins while having fun!</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="rounded-2xl p-6 bg-white shadow-lg border-t-4 border-pink-400 flex flex-col items-center text-center">
            <Star className="w-12 h-12 text-pink-500 mb-3" />
            <h3 className="font-bold text-xl mb-2">Collect & Customize</h3>
            <p className="text-gray-600">Unlock rare birds, power-ups, and exclusive skins.</p>
          </motion.div>
        </div>
        {/* NEW: Language & Theme Support Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 shadow">
            <Globe size={32} color="#2563EB" />
            <div>
              <div className="font-bold text-lg text-blue-700">Now in 50 Languages!</div>
              <div className="text-gray-600 text-sm">Flappy Pi is fully localized for 50 countries & languages worldwide, making it the most accessible Pi Network game globally!</div>
              <Button 
                variant="link" 
                className="text-blue-600 p-0 h-auto font-semibold text-sm mt-1"
                onClick={() => navigate('/languages')}
              >
                View All Languages →
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 shadow">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <div className="font-bold text-lg text-purple-700">Light & Night Mode</div>
              <div className="text-gray-600 text-sm">Switch between beautiful light and night themes for the best experience any time of day.</div>
            </div>
          </div>
        </div>
        {/* Rewards Section */}
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Weekly Rewards</h2>
        <motion.div whileHover={{ scale: 1.03 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-2xl p-8 bg-gradient-to-r from-yellow-100 to-green-100 shadow-xl flex flex-col items-center text-center mb-12">
          <Gift className="w-14 h-14 text-yellow-500 mb-4" />
          <h3 className="font-bold text-2xl mb-2">Top 10 Players Win Pi Weekly!</h3>
          <p className="text-gray-700">Compete for a spot on the leaderboard and earn real Pi rewards every week. The more you play, the more you can win!</p>
        </motion.div>
        {/* Community Section */}
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Join the Community</h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 justify-items-center mb-12">
          <motion.a whileHover={{ scale: 1.1 }} href="https://discord.gg/W2CJFMqR" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-t-4 border-indigo-400">
            <FaDiscord size={48} color="#5865F2" />
            <span className="font-bold text-indigo-700">Discord</span>
          </motion.a>
          <motion.a whileHover={{ scale: 1.1 }} href="https://x.com/flappypifun" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-t-4 border-blue-400">
            <FaTwitter size={48} color="#1DA1F2" />
            <span className="font-bold text-blue-700">Twitter</span>
          </motion.a>
          <motion.a whileHover={{ scale: 1.1 }} href="https://t.me/flappypiofficial" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-t-4 border-blue-500">
            <FaTelegram size={48} color="#0088cc" />
            <span className="font-bold text-blue-700">Telegram</span>
          </motion.a>
          <motion.a whileHover={{ scale: 1.1 }} href="https://youtube.com/@flappypiofficial" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-t-4 border-red-400">
            <FaYoutube size={48} color="#FF0000" />
            <span className="font-bold text-red-700">YouTube</span>
          </motion.a>
          <motion.a whileHover={{ scale: 1.1 }} href="https://fireside.pinet.com/channels/FlappyPiChallenge" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-t-4 border-orange-400">
            <FaComments size={48} color="#FF6B35" />
            <span className="font-bold text-orange-700">Forum</span>
          </motion.a>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            onClick={() => navigate('/flappy-pi-blog')}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-t-4 border-purple-400"
          >
            <FaBookmark size={48} color="#8B5CF6" />
            <span className="font-bold text-purple-700">Blog</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            onClick={() => navigate('/languages')}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border-t-4 border-green-400"
          >
            <Globe size={48} color="#10B981" />
            <span className="font-bold text-green-700">Languages</span>
          </motion.button>
        </div>
      </div>

      {/* Flappy Pi Full Details Showcase Section */}
              <section className="bg-gradient-to-b from-sky-50 to-blue-100 py-16">
        <h2 className="text-4xl font-extrabold text-blue-700 text-center mb-8">What is Flappy Pi?</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
            <Coins className="text-yellow-500 w-8 h-8" />
            <h3 className="font-bold text-lg mt-3 mb-2 text-blue-700">Earn Pi</h3>
            <p className="text-gray-600">Play and win Pi coins by flapping, winning, and completing challenges.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
            <Trophy className="text-blue-500 w-8 h-8" />
            <h3 className="font-bold text-lg mt-3 mb-2 text-blue-700">Compete</h3>
            <p className="text-gray-600">Climb global leaderboards and win weekly rewards.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
            <Star className="text-pink-500 w-8 h-8" />
            <h3 className="font-bold text-lg mt-3 mb-2 text-blue-700">Collect Skins</h3>
            <p className="text-gray-600">Unlock dozens of unique, rare bird skins.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
            <Zap className="text-orange-500 w-8 h-8" />
            <h3 className="font-bold text-lg mt-3 mb-2 text-blue-700">Power-Ups</h3>
            <p className="text-gray-600">Use special power-ups to boost your score and earnings.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
            <Users className="text-green-500 w-8 h-8" />
            <h3 className="font-bold text-lg mt-3 mb-2 text-blue-700">Community</h3>
            <p className="text-gray-600">Join a global community of Pi Network gamers.</p>
          </div>
        </div>
        {/* Bird Skins Section */}
        <h3 className="text-2xl font-bold text-pink-700 mb-4 text-center">Flappy Skins</h3>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <img src="/birds2/bird_0.gif" className="w-14 h-14 rounded-full border-2 border-blue-300" onError={(e) => { e.currentTarget.src = '/birds/bird_0.png'; }} />
          <img src="/birds2/bird_1.gif" className="w-14 h-14 rounded-full border-2 border-pink-300" onError={(e) => { e.currentTarget.src = '/birds/bird_1.png'; }} />
          <img src="/birds2/bird_2.gif" className="w-14 h-14 rounded-full border-2 border-green-300" onError={(e) => { e.currentTarget.src = '/birds/bird_2.png'; }} />
          <img src="/birds2/bird_3.gif" className="w-14 h-14 rounded-full border-2 border-yellow-300" onError={(e) => { e.currentTarget.src = '/birds/bird_3.png'; }} />
          <img src="/birds2/bird_4.gif" className="w-14 h-14 rounded-full border-2 border-purple-300" onError={(e) => { e.currentTarget.src = '/birds/bird_4.png'; }} />
          <img src="/birds2/bird_5.gif" className="w-14 h-14 rounded-full border-2 border-indigo-300" onError={(e) => { e.currentTarget.src = '/birds/bird_5.png'; }} />
          {/* ...more skins */}
        </div>
        {/* Power-Ups and Community Section */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="font-bold text-purple-700 mb-2">Power-Ups</h4>
            <ul className="space-y-2">
              <li><span className="inline-block mr-2"><Zap className="text-orange-500 w-5 h-5" /></span>2x Coin Multiplier: Double your Pi earnings for a limited time</li>
              <li><span className="inline-block mr-2"><Magnet className="text-blue-500 w-5 h-5" /></span>Coin Magnet: Attracts all coins to your bird</li>
              <li><span className="inline-block mr-2"><Heart className="text-red-500 w-5 h-5" /></span>Extra Life: Get a second chance after crashing</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="font-bold text-green-700 mb-2">Community & Social</h4>
            <div className="flex flex-wrap gap-3">
              <a href="https://discord.gg/W2CJFMqR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 shadow transition"><FaDiscord size={24} color="#5865F2" /><span className="font-bold">Discord</span></a>
              <a href="https://t.me/flappypiofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 shadow transition"><FaTelegram size={24} color="#0088cc" /><span className="font-bold">Telegram</span></a>
              <a href="https://x.com/flappypifun" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 shadow transition"><FaTwitter size={24} color="#1DA1F2" /><span className="font-bold">Twitter</span></a>
              <a href="https://facebook.com/flappypiofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 shadow transition"><FaFacebook size={24} color="#1877F2" /><span className="font-bold">Facebook</span></a>
              <a href="https://tiktok.com/@flappypiofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 shadow transition"><FaTiktok size={24} color="#000000" /><span className="font-bold">TikTok</span></a>
              <a href="https://instagram.com/flappypiofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 shadow transition"><FaInstagram size={24} color="#E4405F" /><span className="font-bold">Instagram</span></a>
              <a href="https://youtube.com/@flappypiofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 shadow transition"><FaYoutube size={24} color="#FF0000" /><span className="font-bold">YouTube</span></a>
              <a href="https://fireside.pinet.com/channels/FlappyPiChallenge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-orange-50 shadow transition"><FaComments size={24} color="#FF6B35" /><span className="font-bold">Forum</span></a>
              <button onClick={() => navigate('/flappy-pi-blog')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-purple-50 shadow transition"><FaBookmark size={24} color="#8B5CF6" /><span className="font-bold">Blog</span></button>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE MOCKUPS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">See Flappy Pi in Action</h2>
          <p className="text-xl text-gray-600 mb-8">Preview the game on mobile and watch a live demo!</p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-8">
            <img src="/birds2/bird_0.gif" alt="Flappy Pi Mobile Mockup 1" className="w-48 h-auto rounded-2xl shadow-lg border-2 border-blue-100" onError={(e) => { e.currentTarget.src = '/birds/bird_0.png'; }} />
            <img src="/birds2/bird_1.gif" alt="Flappy Pi Mobile Mockup 2" className="w-48 h-auto rounded-2xl shadow-lg border-2 border-blue-100" onError={(e) => { e.currentTarget.src = '/birds/bird_1.png'; }} />
            <img src="/birds2/bird_2.gif" alt="Flappy Pi Mobile Mockup 3" className="w-48 h-auto rounded-2xl shadow-lg border-2 border-blue-100" onError={(e) => { e.currentTarget.src = '/birds/bird_2.png'; }} />
          </div>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg" onClick={() => setDemoOpen(true)}>
            <Play className="w-5 h-5 mr-2" /> Watch Demo
          </Button>
        </div>
      </section>
      {/* FLAPPY PI SOCIAL SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-4">Flappy Pi Social</h2>
          <p className="text-xl text-blue-700 mb-8">Connect with the Flappy Pi community and follow us everywhere!</p>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 z-20">
            {socialLinks.map((s, idx) => (
              <div key={s.name} className="flex flex-col items-center justify-between rounded-2xl shadow-lg p-6 card-bounce bg-white" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className="mb-2">{s.icon}</div>
                <div className="font-bold text-lg mb-1 text-gray-900">{s.name}</div>
                <div className="mb-3 text-base opacity-90 text-gray-700">{s.handle}</div>
                {s.isInternal ? (
                  <Button 
                    className="w-full font-bold text-base py-2 rounded-xl shadow-md transition border-0" 
                    style={{ background: s.color, color: '#fff' }}
                    onClick={() => navigate(s.url)}
                  >
                    {s.btn}
                  </Button>
                ) : (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full font-bold text-base py-2 rounded-xl shadow-md transition border-0" style={{ background: s.color, color: '#fff' }}>
                      {s.btn}
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* DEMO MODAL */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
            <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Flappy Pi Trailer</DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-lg flex flex-col items-center justify-center">
            <div className="w-full flex flex-col items-center justify-center py-12">
              <span className="text-3xl font-bold text-yellow-500 mb-4">🚧</span>
              <span className="text-2xl font-bold text-purple-700 mb-2">Flappy Pi Trailer is Coming Soon!</span>
              <span className="text-base text-gray-600">This feature is under construction.</span>
            </div>
            <Button variant="default" size="lg" onClick={() => setDemoOpen(false)} className="w-full text-lg mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Game Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most exciting Flappy Bird game with Pi Network integration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Play to Earn</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Earn Pi coins for every pipe you pass through. The higher your score, 
                  the more Pi you earn!
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-xl">Multiple Game Modes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Classic, Endless, and Challenge modes to keep you entertained 
                  and earning Pi rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Leaderboards</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Compete with players worldwide and climb the global leaderboards 
                  to earn extra rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Shop & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Buy power-ups, skins, and mystery boxes with your earned Pi coins.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-pink-600" />
                </div>
                <CardTitle className="text-xl">Mystery Boxes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Open mystery boxes to discover rare skins, power-ups, and bonus Pi rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Community Events</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Participate in special events and tournaments to earn exclusive rewards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start earning Pi rewards in just three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Play</h3>
              <p className="text-gray-600">
                Download Pi Browser and start playing Flappy Pi. 
                Navigate through pipes and avoid obstacles.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn</h3>
              <p className="text-gray-600">
                Earn Pi coins for every pipe you pass through. 
                Watch ads and complete challenges for bonus rewards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Redeem</h3>
              <p className="text-gray-600">
                Use your earned Pi coins to buy items in the shop, 
                open mystery boxes, or withdraw to your Pi wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Top Players
            </h2>
            <p className="text-xl text-gray-600">
              See who's dominating the leaderboards
            </p>
          </div>

          {/* Note above leaderboard */}
          <div className="text-center font-bold text-yellow-500 mb-4 text-lg">
            <div className="flex justify-center mb-2">
              <img 
                src="/flappycoins.png" 
                alt="Flappy Coin" 
                className="w-12 h-12 inline-block animate-bounce animate-pulse drop-shadow-lg" 
                style={{ 
                  animation: 'float 3s ease-in-out infinite',
                  filter: 'drop-shadow(0 4px 12px rgba(255, 193, 7, 0.3))'
                }}
              />
            </div>
            <div>
              Flappy Coins is in-game currency. Pi reward will be given too soon.
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Global Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "PiMaster2025", score: 15420, pi: 50000 },
                    { rank: 2, name: "FlappyChampion", score: 12850, pi: 30000 },
                    { rank: 3, name: "BirdWhisperer", score: 11230, pi: 20000 },
                    { rank: 4, name: "PiCollector", score: 9870, pi: 10000 },
                    { rank: 5, name: "SkyPilot", score: 8650, pi: 5000 },
                  ].map((player) => (
                    <div key={player.rank} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          player.rank === 1 ? 'bg-yellow-500' : 
                          player.rank === 2 ? 'bg-gray-400' : 
                          player.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{player.name}</p>
                          <p className="text-sm text-gray-500">Score: {player.score.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <img src="/flappycoins.png" alt="FC" className="w-5 h-5 inline-block align-middle" />
                        <span className="font-semibold text-yellow-600">{player.pi.toLocaleString()} FC</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-2">
                    <span className="text-purple-700 text-sm font-bold">POOL WILL COME FROM DeFi Pool COMING SOON!</span>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/leaderboard')}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    View Full Leaderboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Players Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of happy players earning Pi rewards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                location: "Canada",
                text: "I love how I can earn Pi while having fun! The game is addictive and the rewards are real.",
                rating: 5
              },
              {
                name: "Alex K.",
                location: "Nigeria",
                text: "Best Flappy Bird game ever! The Pi integration is seamless and I've earned over 500 Pi so far.",
                rating: 5
              },
              {
                name: "Maria L.",
                location: "Philippines",
                text: "Great community and amazing rewards. The mystery boxes are my favorite feature!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Earning Pi?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Download Pi Browser and join the Flappy Pi community today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handlePlayNow}
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-10 py-5 text-lg rounded-xl shadow-lg border-2 border-yellow-600 transition-all duration-200"
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)' }}
            >
              <Play className="w-5 h-5 mr-2" />
              Play Now
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={handleDownload}
              className="bg-black hover:bg-gray-900 text-white font-bold px-10 py-5 text-lg rounded-xl shadow-lg border-2 border-white transition-all duration-200"
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)' }}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Pi Browser
            </Button>
          </div>
        </div>
      </section>

      {/* NPC Floating Character and Dialog - bottom-left above footer */}
      {showNpcDialog && (
        <div className="fixed bottom-8 left-8 z-50 flex items-end gap-2">
          {/* Dialog Bubble */}
          <div className="relative bg-white rounded-2xl shadow-xl px-4 md:px-6 py-3 md:py-4 max-w-[200px] md:max-w-xs border-2 border-blue-200 text-gray-800 text-sm md:text-base font-semibold cartoon-bubble animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowNpcDialog(false)}
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mb-2">{npcDialogMessages[npcDialogIndex]}</div>
            <button
              className="mt-2 text-blue-600 font-bold hover:underline text-xs md:text-sm"
              onClick={handleNextDialog}
            >
              Next Tip
            </button>
          </div>
          {/* NPC Bird */}
          <img
            src={npcImages[npcImageIndex]}
            alt="Flappy Pi NPC"
            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg animate-bounce"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/birds2/bird_0.gif" alt="Flappy Pi" className="w-8 h-8" onError={(e) => { e.currentTarget.src = '/birds/bird_0.png'; }} />
                <span className="text-xl font-bold">Flappy Pi</span>
              </div>
              <p className="text-gray-400 mb-4">
                The ultimate Pi Network-powered Flappy Bird game. 
                Play, earn, and have fun!
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="https://twitter.com/flappypiofficial" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-white text-2xl"><FaTwitter /></a>
                <a href="https://t.me/flappypiofficial" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-gray-400 hover:text-white text-2xl"><FaTelegram /></a>
                <a href="https://discord.gg/flappypi" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="text-gray-400 hover:text-white text-2xl"><FaDiscord /></a>
                <a href="https://facebook.com/flappypiofficial" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-white text-2xl"><FaFacebook /></a>
                <a href="https://tiktok.com/@flappypiofficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-white text-2xl"><FaTiktok /></a>
                <a href="https://instagram.com/flappypiofficial" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-white text-2xl"><FaInstagram /></a>
                <a href="https://youtube.com/@flappypiofficial" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-400 hover:text-white text-2xl"><FaYoutube /></a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Info & Legal</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setAboutOpen(true)} className="text-gray-400 hover:text-white underline">About</button></li>
                <li><button onClick={() => setFaqOpen(true)} className="text-gray-400 hover:text-white underline">FAQ</button></li>
                <li><button onClick={() => setTermsOpen(true)} className="text-gray-400 hover:text-white underline">Terms of Service</button></li>
                <li><button onClick={() => setPrivacyOpen(true)} className="text-gray-400 hover:text-white underline">Privacy Policy</button></li>
                <li><button onClick={() => setContactOpen(true)} className="text-gray-400 hover:text-white underline">Contact</button></li>
                <li><button onClick={() => setShowWhitepaper(true)} className="text-gray-400 hover:text-white underline">Whitepaper</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Game</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.flappypi.xyz" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-yellow-300" style={{ color: '#fff' }}>
                    Play Now
                  </a>
                </li>
                <li><a href="#" className="text-gray-400 hover:text-white">Leaderboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Shop</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Inventory</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Community</h3>
              <ul className="space-y-2">
                <li><a href="https://discord.gg/flappypi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Discord</a></li>
                <li><a href="https://t.me/flappypiofficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Telegram</a></li>
                <li><a href="https://twitter.com/flappypiofficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Twitter</a></li>
                <li><a href="https://facebook.com/flappypiofficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Facebook</a></li>
                <li><a href="https://tiktok.com/@flappypiofficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">TikTok</a></li>
                <li><a href="https://instagram.com/flappypiofficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Instagram</a></li>
                <li><a href="https://youtube.com/@flappypiofficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">YouTube</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Flappy Pi. All rights reserved. Powered by Pi Network.
            </p>
          </div>
        </div>
        {/* Modals */}
        <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
        <FAQModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
        <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
            <DialogHeader className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
              <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Flappy Pi Trailer</DialogTitle>
            </DialogHeader>
            <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-lg flex flex-col items-center justify-center">
              <div className="w-full flex flex-col items-center justify-center py-12">
                <span className="text-3xl font-bold text-yellow-500 mb-4">🚧</span>
                <span className="text-2xl font-bold text-purple-700 mb-2">Flappy Pi Trailer is Coming Soon!</span>
                <span className="text-base text-gray-600">This feature is under construction.</span>
              </div>
              <Button variant="default" size="lg" onClick={() => setDemoOpen(false)} className="w-full text-lg mt-4">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
        <WhitepaperModal isOpen={showWhitepaper} onClose={() => setShowWhitepaper(false)} />
      </footer>
    </div>
  );
};

export default FlappyPiWebsite; 