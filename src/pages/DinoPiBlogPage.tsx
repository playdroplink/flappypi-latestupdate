import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DinoPiSplashScreen from '@/components/DinoPiSplashScreen';
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaUser, 
  FaEye, 
  FaHeart, 
  FaShare, 
  FaComments,
  FaTrophy,
  FaCoins,
  FaGamepad,
  FaUsers,
  FaRocket,
  FaStar,
  FaBookmark,
  FaSearch,
  FaPaw,
  FaEgg,
  FaLeaf,
  FaFire,
  FaMountain
} from 'react-icons/fa';
import { useUserProfile } from '../hooks/useUserProfile';
import { useToast } from '../hooks/use-toast';

const DinoPiBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFullPost, setShowFullPost] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Handle splash screen completion
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash on every visit to Dino Pi Blog page
  useEffect(() => {
    // Always show splash for Dino Pi Blog page
    setShowSplash(true);
  }, []);

  // Newsletter Signup State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  // Newsletter subscribe handler
  const handleNewsletterSubscribe = () => {
    setSubscribeError('');
    if (!newsletterEmail || !newsletterEmail.match(/^\S+@\S+\.\S+$/)) {
      setSubscribeError('Please enter a valid email address.');
      return;
    }
    setIsSubscribed(true);
    toast({
      title: "Success!",
      description: "You've been subscribed to Dino Pi updates!",
    });
  };

  const username = profile?.username || 'Player';

  // Function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return formatDate(dateString);
  };

  const categories = [
    { id: 'all', name: 'All Posts', icon: <FaBookmark className="text-blue-500" /> },
    { id: 'announcements', name: 'Announcements', icon: <FaPaw className="text-green-500" /> },
    { id: 'development', name: 'Development', icon: <FaRocket className="text-purple-500" /> },
    { id: 'features', name: 'Features', icon: <FaStar className="text-yellow-500" /> },
    { id: 'community', name: 'Community', icon: <FaUsers className="text-red-500" /> },
    { id: 'preview', name: 'Game Preview', icon: <FaGamepad className="text-orange-500" /> },
    { id: 'technical', name: 'Technical', icon: <FaRocket className="text-indigo-500" /> },
  ];

  const blogPosts = [
    {
      id: 1,
      title: '🦕 Dino Pi: The Epic Pi-Powered Dinosaur Adventure Coming Soon!',
      excerpt: 'Get ready for the most exciting dinosaur game ever created! Dino Pi combines endless runner gameplay with Pi Network integration and epic evolution mechanics.',
      content: `# 🦕 Dino Pi: The Epic Pi-Powered Dinosaur Adventure Coming Soon!

We're thrilled to announce **Dino Pi**, the latest addition to the Mrwain Organization gaming universe! This groundbreaking game combines the excitement of endless runner gameplay with the innovative Pi Network integration that our community loves.

## 🎮 What is Dino Pi?

Dino Pi is an epic dinosaur-themed endless runner game where players control a dinosaur character through prehistoric environments, collecting Pi fossils, evolving their character, and competing for high scores. Unlike any other game in the genre, Dino Pi integrates seamlessly with the Pi Network, allowing players to earn Pi cryptocurrency while having fun!

##  Core Gameplay Features

### **Evolution System**
- **5 Evolution Stages**: From Baby T-Rex to Elder T-Rex
- **Unique Abilities**: Each evolution unlocks new powers and abilities
- **Visual Progression**: Watch your dinosaur grow and evolve
- **Pi Fossil Collection**: Collect fossils to advance your evolution

### **Game Modes**
1. **Extinction Run** - Classic endless runner mode
2. **Meteor Mayhem** - Dodge falling meteors and collect space fossils
3. **Rescue Mission** - Save trapped baby dinos for extra rewards
4. **PvP Race** - Compete against other players in real-time

### **Pi Network Integration**
- **Pi Fossils**: Collect fossils that can be converted to Pi
- **Daily Rewards**: Login daily to earn Pi rewards
- **Tournament Prizes**: Compete in tournaments for Pi prizes
- **Community Challenges**: Participate in community events

## 🎯 Unique Features

### **Dynamic Weather System**
- **Rainy Weather**: Affects gameplay with slippery surfaces
- **Stormy Weather**: Increases difficulty with lightning obstacles
- **Snowy Weather**: Changes physics and adds snow particles
- **Sunny Weather**: Perfect conditions for high scores

### **Character Evolution**
- **Baby T-Rex**: Basic abilities, perfect for beginners
- **Teen T-Rex**: Enhanced jumping and speed
- **Adult T-Rex**: Advanced abilities and special moves
- **Alpha T-Rex**: Legendary status with unique powers
- **Elder T-Rex**: Ultimate evolution with time-bending abilities

### **Power-up System**
- **Shield**: Protects from collisions
- **Magnet**: Attracts nearby coins and fossils
- **Coin Multiplier**: Doubles your earnings
- **Turbo Start**: Increases game speed
- **Extra Life**: Revives you once

## 🌍 Environments & Worlds

### **Jungle World**
- Lush prehistoric forests
- Vine obstacles and tree branches
- Hidden treasure caves
- Jungle-themed power-ups

### **Volcano Zone**
- Lava flows and fire obstacles
- Ash particles and smoke effects
- Heat-resistant evolution bonuses
- Volcanic eruption events

### **Desert Landscape**
- Sandstorms and mirages
- Ancient ruins and pyramids
- Desert-specific challenges
- Sand dune physics

### **Ice Age**
- Frozen landscapes and glaciers
- Slippery ice mechanics
- Snow particle effects
- Ice cave exploration

## 🏆 Community Features

### **Dino Tribes**
- Join or create dinosaur tribes
- Compete in tribe-wide challenges
- Unlock exclusive tribe rewards
- Build your prehistoric community

### **Weekly Challenges**
- "Jurassic Week" events
- "Volcano Mode" challenges
- "Snowstorm Trials" competitions
- Special themed rewards

### **Leaderboards**
- Global rankings
- Friend competitions
- Weekly resets
- Pi reward distribution

### **Social Sharing**
- Share achievements
- Create epic screenshots
- Challenge friends
- Community highlights

## 🎨 Visual & Audio Excellence

### **Stunning Graphics**
- High-quality dinosaur animations
- Dynamic weather effects
- Particle systems and explosions
- Smooth 60fps gameplay

### **Immersive Audio**
- Prehistoric sound effects
- Dynamic background music
- Voice-acted character reactions
- Environmental audio cues

## 🚀 Technical Innovation

### **Advanced Physics**
- Realistic dinosaur movement
- Dynamic obstacle interaction
- Weather-affected physics
- Smooth collision detection

### **Performance Optimization**
- 60fps on all devices
- Efficient memory usage
- Battery optimization
- Cross-platform compatibility

## 📱 Platform Support

- **Web Browser**: Play instantly in any modern browser
- **Mobile Devices**: Optimized for touch controls
- **Pi Browser**: Native Pi Network integration
- **Desktop**: Full keyboard and mouse support

## 🎁 Early Access & Rewards

### **Pre-Registration Benefits**
- Exclusive "Founder" dinosaur skin
- 100 Pi bonus on launch
- Early access to beta testing
- Special community badge

### **Launch Rewards**
- Limited edition "Launch Dino" character
- 500 Pi welcome bonus
- Exclusive evolution path
- Special tournament entry

## 🔮 Future Roadmap

### **Phase 1: Launch**
- Core gameplay mechanics
- Basic evolution system
- Pi Network integration
- Community features

### **Phase 2: Expansion**
- Additional game modes
- More dinosaur species
- Enhanced weather systems
- Advanced tournaments

### **Phase 3: Innovation**
- VR/AR integration
- AI-powered opponents
- Cross-game connectivity
- Advanced Pi features

## 🤝 Join the Dino Pi Community

### **Stay Updated**
- Follow our social media channels
- Join the Discord community
- Subscribe to our newsletter
- Participate in beta testing

### **Get Involved**
- Share your feedback
- Suggest new features
- Report bugs and issues
- Help shape the game's future

## 🎯 Why Dino Pi?

Dino Pi represents the next evolution in Pi Network gaming. By combining the addictive gameplay of endless runners with the innovative Pi Network integration, we're creating an experience that's both entertaining and rewarding.

### **For Players**
- Engaging gameplay that never gets old
- Real rewards through Pi Network
- Community-driven development
- Regular updates and new content

### **For Pi Network**
- New use case for Pi cryptocurrency
- Increased network adoption
- Community engagement
- Educational gaming experience

## 🚀 Coming Soon!

Dino Pi is currently in active development and will be launching soon! Stay tuned for:
- Beta testing announcements
- Feature previews
- Community events
- Launch date reveal

**Get ready to embark on the most epic dinosaur adventure ever created! 🦕✨**

*Follow us for more updates and be among the first to experience Dino Pi when it launches!*`,
      author: 'Mrwain Organization',
      date: '2025-07-15',
      category: 'announcements',
      readTime: '8 min read',
      views: 15420,
      likes: 892,
      comments: 156,
      featured: true,
      image: '/npc gif/npc-3.gif.gif',
      tags: ['dino-pi', 'announcement', 'coming-soon', 'pi-network']
    },
    {
      id: 2,
      title: ' Dino Pi Development Update: Evolution System Revealed!',
      excerpt: 'Take a deep dive into the revolutionary evolution system that will make Dino Pi unlike any other endless runner game.',
      content: `#  Dino Pi Development Update: Evolution System Revealed!

We're excited to share the first detailed look at Dino Pi's revolutionary evolution system! This feature will set Dino Pi apart from any other endless runner game in the market.

## 🥚 Evolution Stages

### **Baby T-Rex (Unlocked)**
- **Abilities**: Basic Run, Simple Jump
- **Fossils Required**: 0
- **Special**: Perfect for beginners
- **Visual**: Cute baby dinosaur with oversized head

### **Teen T-Rex (Common)**
- **Abilities**: Double Jump, Speed Boost
- **Fossils Required**: 50
- **Special**: Enhanced mobility
- **Visual**: Growing dinosaur with developing features

### **Adult T-Rex (Rare)**
- **Abilities**: Triple Jump, Charge Attack, Shield
- **Fossils Required**: 150
- **Special**: Combat abilities
- **Visual**: Fully grown, intimidating presence

### **Alpha T-Rex (Epic)**
- **Abilities**: Flight, Sonic Roar, Invincibility
- **Fossils Required**: 300
- **Special**: Legendary powers
- **Visual**: Majestic with glowing effects

### **Elder T-Rex (Legendary)**
- **Abilities**: Time Warp, Meteor Summon, Regeneration
- **Fossils Required**: 500
- **Special**: Reality-bending powers
- **Visual**: Ancient, mystical appearance

## 🎮 Evolution Mechanics

### **Fossil Collection**
- Collect fossils during gameplay
- Different fossils have different values
- Rare fossils provide bonus evolution points
- Community events offer fossil multipliers

### **Evolution Triggers**
- Automatic evolution when requirements are met
- Visual evolution animation
- Sound effects and particle systems
- Achievement notifications

### **Ability Unlocking**
- New abilities unlock with each evolution
- Abilities can be upgraded further
- Special combinations between abilities
- Strategic ability usage

## 🏆 Competitive Evolution

### **Evolution Leaderboards**
- Track fastest evolution times
- Compare evolution paths
- Community challenges
- Pi rewards for evolution milestones

### **Evolution Events**
- "Speed Evolution" tournaments
- "Rare Fossil Hunt" events
- "Evolution Master" challenges
- Special evolution-themed rewards

## 🎨 Visual Evolution System

### **Character Progression**
- Smooth visual transitions
- Detailed character models
- Dynamic lighting effects
- Particle system integration

### **Environment Adaptation**
- Different environments affect evolution
- Weather impacts evolution speed
- Special evolution locations
- Hidden evolution chambers

## 🔮 Future Evolution Features

### **Cross-Species Evolution**
- Evolve into different dinosaur types
- Hybrid evolution paths
- Special combination evolutions
- Community-voted evolution options

### **Seasonal Evolutions**
- Limited-time evolution forms
- Holiday-themed evolutions
- Event-specific abilities
- Exclusive seasonal rewards

*The evolution system is just one of the many innovative features that will make Dino Pi a truly unique gaming experience!*`,
      author: 'Dino Pi Development Team',
      date: '2025-07-12',
      category: 'development',
      readTime: '6 min read',
      views: 8920,
      likes: 445,
      comments: 89,
      featured: true,
      image: '/npc gif/npc-3.gif.gif',
      tags: ['evolution-system', 'development', 'game-mechanics']
    },
    {
      id: 3,
      title: '🌍 Dino Pi Environments: A Journey Through Prehistoric Worlds',
      excerpt: 'Explore the stunning environments that will make Dino Pi a visual masterpiece and gameplay innovation.',
      content: `# 🌍 Dino Pi Environments: A Journey Through Prehistoric Worlds

Dino Pi isn't just a game—it's a journey through beautifully crafted prehistoric environments that will transport players to a world millions of years in the making.

## 🌴 Jungle World

### **Visual Design**
- Lush prehistoric forests with towering trees
- Dense vegetation and hanging vines
- Ancient ruins hidden in the foliage
- Dynamic lighting through canopy gaps

### **Gameplay Elements**
- Vine obstacles that swing and move
- Tree branches to jump between
- Hidden treasure caves behind waterfalls
- Jungle-themed power-ups and collectibles

### **Weather Effects**
- Tropical rain with realistic water physics
- Humidity affects that create mist
- Lightning storms with dramatic lighting
- Wind effects that move vegetation

## 🌋 Volcano Zone

### **Visual Design**
- Active volcanoes with flowing lava
- Ash clouds and smoke effects
- Red-hot magma rivers
- Volcanic rock formations

### **Gameplay Elements**
- Lava flows that create moving obstacles
- Ash particles that reduce visibility
- Heat-resistant evolution bonuses
- Volcanic eruption events

### **Weather Effects**
- Intense heat waves
- Ash storms that obscure vision
- Lava rain during eruptions
- Thermal updrafts for enhanced jumping

## 🏜️ Desert Landscape

### **Visual Design**
- Vast sand dunes and rock formations
- Ancient pyramids and ruins
- Mirage effects in the distance
- Sunset and sunrise lighting

### **Gameplay Elements**
- Sandstorms that create moving walls
- Mirage obstacles that appear and disappear
- Desert-specific challenges
- Sand dune physics for unique movement

### **Weather Effects**
- Intense heat with visual distortion
- Sandstorms with particle effects
- Wind-blown sand that affects visibility
- Temperature-based gameplay mechanics

## ❄️ Ice Age

### **Visual Design**
- Frozen landscapes with glaciers
- Snow-covered mountains
- Ice caves with crystal formations
- Aurora borealis in the sky

### **Gameplay Elements**
- Slippery ice mechanics
- Snow particle effects
- Ice cave exploration
- Frozen obstacles and platforms

### **Weather Effects**
- Snowstorms with reduced visibility
- Ice formation on surfaces
- Blizzard conditions
- Temperature-based character effects

## 🎨 Technical Innovation

### **Dynamic Lighting**
- Real-time lighting calculations
- Weather-affected lighting systems
- Dynamic shadows and reflections
- Atmospheric scattering effects

### **Particle Systems**
- Advanced particle physics
- Weather-specific particle effects
- Performance-optimized rendering
- Interactive particle interactions

### **Audio Integration**
- 3D positional audio
- Environment-specific sound effects
- Dynamic music that adapts to gameplay
- Immersive ambient audio

## 🚀 Performance Optimization

### **Graphics Engine**
- Custom-built rendering pipeline
- Efficient memory management
- Adaptive quality settings
- Cross-platform optimization

### **Loading Systems**
- Seamless environment transitions
- Background asset loading
- Progressive detail enhancement
- Smart caching systems

*Each environment in Dino Pi is crafted with attention to detail, ensuring both visual excellence and engaging gameplay mechanics!*`,
      author: 'Dino Pi Art Team',
      date: '2025-07-10',
      category: 'features',
      readTime: '7 min read',
      views: 7230,
      likes: 334,
      comments: 67,
      featured: false,
      image: '/npc gif/npc-3.gif.gif',
      tags: ['environments', 'visual-design', 'game-worlds']
    },
    {
      id: 4,
      title: '💰 Pi Network Integration: How Dino Pi Rewards Players',
      excerpt: 'Discover how Dino Pi seamlessly integrates with the Pi Network to provide real rewards for players.',
      content: `# 💰 Pi Network Integration: How Dino Pi Rewards Players

Dino Pi takes Pi Network integration to the next level, providing multiple ways for players to earn Pi cryptocurrency while enjoying an amazing gaming experience.

## 🎮 Earning Methods

### **Daily Challenges**
- Complete daily missions for Pi rewards
- Progressive difficulty scaling
- Bonus rewards for consecutive completions
- Special weekend challenges

### **Tournament Prizes**
- Weekly tournament competitions
- Pi prizes for top performers
- Community participation bonuses
- Special event tournaments

### **Evolution Milestones**
- Pi rewards for evolution achievements
- Bonus rewards for fast evolution
- Special rewards for rare evolutions
- Community evolution challenges

### **Collection Rewards**
- Pi fossils convert to Pi currency
- Rare fossil bonuses
- Collection completion rewards
- Limited-time collection events

## 🏆 Tournament System

### **Weekly Tournaments**
- Regular competitive events
- Pi prize pools
- Leaderboard rankings
- Special tournament skins

### **Community Events**
- Pi Network-sponsored events
- Special challenge tournaments
- Community voting for prizes
- Cross-game tournaments

### **Seasonal Championships**
- Major quarterly events
- Significant Pi prize pools
- Exclusive championship rewards
- Professional player recognition

## 🔄 Pi Integration Features

### **Seamless Wallet Integration**
- Direct Pi wallet connection
- Real-time balance updates
- Secure transaction processing
- Multi-wallet support

### **Reward Distribution**
- Automatic Pi distribution
- Transparent reward tracking
- Instant reward claiming
- Reward history logging

### **Community Economics**
- Pi-based marketplace
- Player-to-player trading
- Community-driven economy
- Sustainable reward system

## 📊 Reward Statistics

### **Average Daily Earnings**
- Active players: 5-15 Pi daily
- Tournament winners: 50-200 Pi
- Evolution milestones: 10-50 Pi
- Special events: 25-100 Pi

### **Total Pi Distribution**
- Monthly distribution: 10,000+ Pi
- Community events: 5,000+ Pi
- Tournament prizes: 15,000+ Pi
- Development rewards: 5,000+ Pi

## 🎯 Future Pi Features

### **Pi-Based Marketplace**
- Trade in-game items for Pi
- Player-created content marketplace
- Pi-powered community features
- Decentralized governance

### **Advanced Integration**
- Pi-based smart contracts
- Automated reward systems
- Cross-game Pi compatibility
- Blockchain-based achievements

*Dino Pi represents the future of Pi Network gaming, providing real value to players while building a sustainable gaming ecosystem!*`,
      author: 'Pi Network Integration Team',
      date: '2025-07-08',
      category: 'technical',
      readTime: '5 min read',
      views: 6540,
      likes: 289,
      comments: 78,
      featured: false,
      image: '/npc gif/npc-3.gif.gif',
      tags: ['pi-network', 'rewards', 'cryptocurrency']
    }
  ];

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSharePost = async (post: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`${post.title}\n\n${post.excerpt}\n\nRead more at: ${window.location.href}`);
        toast({
          title: "Link copied!",
          description: "Post link has been copied to clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleLikePost = (postId: number) => {
    toast({
      title: "Liked!",
      description: "Thanks for your support!",
    });
  };

  const handleReadFullPost = (post: any) => {
    setSelectedPost(post);
    setShowFullPost(true);
  };

  const handleCloseFullPost = () => {
    setShowFullPost(false);
    setSelectedPost(null);
  };

  // Show splash screen if needed
  if (showSplash) {
    return <DinoPiSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 drop-shadow-lg">
                🦕 Dino Pi Blog
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Latest news and updates about Dino Pi</p>
            </div>
            <div className="w-16 sm:w-20"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Prominent Banner - Orange Theme */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 py-8 sm:py-12 lg:py-16 shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-transparent opacity-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-4 sm:mb-6">
            <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-2 sm:mb-4 animate-bounce" />
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 text-white drop-shadow-2xl animate-pulse">
            DINO PI BLOG
          </h2>
          <p className="text-sm sm:text-lg lg:text-2xl text-white max-w-4xl mx-auto font-semibold leading-relaxed opacity-95 px-2">
            Your source for all things Dino Pi - Development updates, feature announcements, 
            and community highlights from the prehistoric gaming world!
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="bg-white bg-opacity-20 rounded-full px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base">
              🎮 Latest Updates
            </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base">
 Development News
            </div>
            <div className="bg-white bg-opacity-20 rounded-full px-4 sm:px-6 py-2 text-white font-semibold text-sm sm:text-base">
              💎 Pi Network Integration
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Orange Theme */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 sm:mb-8 shadow-xl">
            <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 drop-shadow-2xl">
 Dino Pi Blog
          </h1>
          <p className="text-sm sm:text-lg lg:text-2xl text-gray-700 max-w-4xl mx-auto font-medium leading-relaxed px-2">
            Stay updated with the latest news, development progress, and exciting features 
            of the upcoming Dino Pi game. Join the prehistoric adventure!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {category.icon}
                  <span className="ml-1 sm:ml-2">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  {post.featured && (
                    <Badge className="bg-yellow-500 text-white text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle 
                  className="text-lg sm:text-xl font-bold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors leading-tight"
                  onClick={() => handleReadFullPost(post)}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-xl sm:text-2xl">{post.category === 'announcements' ? '' : post.category === 'development' ? '🦕' : post.category === 'features' ? '' : post.category === 'technical' ? '🦕' : ''}</span>
                    <span>{post.title}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-gray-800 mb-4 line-clamp-3 font-medium text-sm sm:text-base">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-700 mb-4 space-y-1 sm:space-y-0">
                  <div className="flex items-center">
                    <FaUser className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="font-medium">{getRelativeTime(post.date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700 mb-4">
                  <div className="flex items-center">
                    <FaEye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="font-medium">{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FaHeart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="font-medium">{post.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <FaComments className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="font-medium">{post.comments}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <Button
                    onClick={() => handleReadFullPost(post)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-sm sm:text-base"
                  >
                    Read More
                  </Button>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className="text-xs sm:text-sm"
                    >
                      <FaHeart className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSharePost(post)}
                      className="text-xs sm:text-sm"
                    >
                      <FaShare className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Newsletter Signup - Orange Theme */}
        <Card className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-2xl border-0">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="text-center">
              <div className="mb-4 sm:mb-6">
                <img src="/dino pi/dinopi logo.png" alt="Dino Pi Logo" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto animate-bounce" />
              </div>
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white drop-shadow-lg">
                Stay Updated with Dino Pi!
              </h3>
              <p className="text-sm sm:text-lg lg:text-xl text-white mb-6 sm:mb-8 font-semibold opacity-95 px-2">
                Be the first to know about Dino Pi updates, beta testing opportunities, 
                and exclusive launch rewards!
              </p>
              
              {!isSubscribed ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-gray-900 focus:ring-4 focus:ring-white focus:ring-opacity-50 border-0 shadow-lg text-sm sm:text-lg font-medium"
                  />
                  <Button
                    onClick={handleNewsletterSubscribe}
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg text-sm sm:text-lg transform hover:scale-105 transition-all"
                  >
 Subscribe Now
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-white font-bold text-lg sm:text-xl lg:text-2xl">
                    ✅ You're subscribed! Check your email for updates.
                  </p>
                </div>
              )}
              
              {subscribeError && (
                <p className="text-red-200 text-xs sm:text-sm mt-2">{subscribeError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Post Modal */}
      {showFullPost && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {selectedPost.title}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 mb-4 space-y-1 sm:space-y-0">
                    <div className="flex items-center">
                      <FaUser className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="mr-2 sm:mr-4">{selectedPost.author}</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{formatDate(selectedPost.date)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseFullPost}
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="prose max-w-none text-sm sm:text-base">
                <div dangerouslySetInnerHTML={{ __html: selectedPost.content.replace(/\n/g, '<br/>') }} />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t space-y-2 sm:space-y-0">
                <div className="flex gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleLikePost(selectedPost.id)}
                    className="text-xs sm:text-sm"
                  >
                    <FaHeart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSharePost(selectedPost)}
                    className="text-xs sm:text-sm"
                  >
                    <FaShare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Share
                  </Button>
                </div>
                <Button
                  onClick={handleCloseFullPost}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-sm sm:text-base"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DinoPiBlogPage; 