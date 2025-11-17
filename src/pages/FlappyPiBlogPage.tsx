import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
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
  FaSearch
} from 'react-icons/fa';
import { useUserProfile } from '../hooks/useUserProfile';
import { useToast } from '../hooks/use-toast';

const FlappyPiBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showFullPost, setShowFullPost] = useState(false);

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
    // Here you would send the email to your backend/newsletter service
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
    { id: 'updates', name: 'Game Updates', icon: <FaGamepad className="text-green-500" /> },
    { id: 'community', name: 'Community', icon: <FaUsers className="text-purple-500" /> },
    { id: 'rewards', name: 'Rewards', icon: <FaCoins className="text-yellow-500" /> },
    { id: 'tournaments', name: 'Tournaments', icon: <FaTrophy className="text-red-500" /> },
    { id: 'tips', name: 'Tips & Tricks', icon: <FaStar className="text-orange-500" /> },
    { id: 'technical', name: 'Technical', icon: <FaRocket className="text-indigo-500" /> },
  ];

  const blogPosts = [
    {
      id: 10,
      title: '🌍 Flappy Pi Goes Global: Now Supporting 50 Languages Worldwide!',
      excerpt: 'Flappy Pi is now available in 50 languages, making it the most accessible Pi Network game globally. Discover how we\'re breaking language barriers and connecting players worldwide!',
      content: `# 🌍 Flappy Pi Goes Global: Now Supporting 50 Languages Worldwide!

## Overview
We are thrilled to announce that **Flappy Pi** now supports **50 languages** globally, making it one of the most accessible games in the Pi Network ecosystem! This massive localization effort represents our commitment to creating a truly global gaming community where players from every corner of the world can enjoy Flappy Pi in their native language.

## 🎯 Our Global Mission

Flappy Pi was built with a simple yet powerful vision: **to connect players worldwide through the universal language of gaming**. By supporting 50 languages, we're breaking down language barriers and creating an inclusive environment where everyone can participate in the Pi Network gaming revolution.

## 🌐 Complete Language Support List

### **Major World Languages**
- **English (en)** - Global standard
- **Chinese (zh)** - 1.3+ billion speakers
- **Hindi (hi)** - 600+ million speakers
- **Spanish (es)** - 500+ million speakers
- **Arabic (ar)** - 400+ million speakers
- **Russian (ru)** - 258+ million speakers
- **French (fr)** - 280+ million speakers
- **German (de)** - 95+ million speakers
- **Japanese (ja)** - 125+ million speakers
- **Korean (ko)** - 77+ million speakers

### **Asian Languages**
- **Indonesian (id)** - 270+ million speakers
- **Thai (th)** - 69+ million speakers
- **Vietnamese (vi)** - 95+ million speakers
- **Filipino (tl)** - 100+ million speakers
- **Bengali (bn)** - 230+ million speakers
- **Punjabi (pa)** - 100+ million speakers
- **Javanese (jv)** - 84+ million speakers
- **Telugu (te)** - 82+ million speakers
- **Marathi (mr)** - 83+ million speakers
- **Tamil (ta)** - 78+ million speakers
- **Urdu (ur)** - 170+ million speakers
- **Gujarati (gu)** - 55+ million speakers
- **Kannada (kn)** - 44+ million speakers
- **Malayalam (ml)** - 38+ million speakers
- **Myanmar (my)** - 38+ million speakers
- **Persian (fa)** - 110+ million speakers
- **Turkish (tr)** - 80+ million speakers

### **European Languages**
- **Italian (it)** - 67+ million speakers
- **Polish (pl)** - 40+ million speakers
- **Ukrainian (uk)** - 40+ million speakers
- **Dutch (nl)** - 24+ million speakers
- **Swedish (sv)** - 10+ million speakers
- **Finnish (fi)** - 5+ million speakers
- **Norwegian (no)** - 5+ million speakers
- **Czech (cs)** - 10+ million speakers
- **Greek (el)** - 13+ million speakers
- **Slovak (sk)** - 5+ million speakers
- **Hungarian (hu)** - 13+ million speakers
- **Romanian (ro)** - 24+ million speakers
- **Serbian (sr)** - 12+ million speakers
- **Bulgarian (bg)** - 8+ million speakers

### **African Languages**
- **Hausa (ha)** - 50+ million speakers
- **Swahili (sw)** - 100+ million speakers
- **Amharic (am)** - 22+ million speakers

### **Regional Languages**
- **Pashto (ps)** - 50+ million speakers
- **Sindhi (sd)** - 30+ million speakers
- **Nepali (ne)** - 16+ million speakers
- **Malay (ms)** - 290+ million speakers

## 🚀 Technical Implementation

### Localization Architecture
Our localization system is built with scalability in mind:

- **Dynamic Translation Loading**: Translations load on-demand for optimal performance
- **Fallback System**: Automatic fallback to English for missing translations
- **RTL Support**: Full right-to-left language support for Arabic and Hebrew
- **Cultural Adaptation**: UI elements adapt to different cultural preferences
- **Real-time Updates**: Language changes apply instantly without page reload

### Translation Quality Assurance
- **Native Speaker Review**: All translations reviewed by native speakers
- **Context-Aware Translation**: Gaming terminology properly localized
- **Cultural Sensitivity**: Translations respect cultural nuances
- **Regular Updates**: Continuous improvement of translation quality

## 🌟 User Experience Features

### **Seamless Language Switching**
- **Instant Language Change**: Switch languages without losing game progress
- **Persistent Settings**: Language preference saved across sessions
- **Smart Detection**: Automatic language detection based on device settings
- **Offline Support**: All translations available offline

### **Localized Content**
- **Game Interface**: Complete UI translation
- **Game Instructions**: Tutorials in native languages
- **Error Messages**: User-friendly error messages in local languages
- **Support Documentation**: Help and FAQ in all supported languages

## 📊 Global Impact

### **Community Growth**
- **Increased Accessibility**: Players from non-English speaking regions can now fully participate
- **Cultural Diversity**: Rich mix of players from different cultural backgrounds
- **Local Communities**: Language-specific community groups forming
- **Tournament Participation**: More diverse tournament participation

### **Pi Network Integration**
- **Global Pi Adoption**: Easier onboarding for non-English speakers
- **Localized Pi Education**: Pi Network concepts explained in native languages
- **Community Building**: Stronger local Pi communities
- **Economic Inclusion**: Financial inclusion through localized gaming

## 🎮 Gaming Experience by Region

### **Asia-Pacific**
- **High Mobile Usage**: Optimized for mobile-first gaming
- **Social Features**: Enhanced social sharing for Asian markets
- **Competitive Play**: Tournament systems popular in competitive cultures
- **Reward Systems**: Culturally appropriate reward mechanisms

### **Europe**
- **Multi-language Support**: Many players speak multiple languages
- **Privacy Focus**: Enhanced privacy controls for GDPR compliance
- **Quality Gaming**: Focus on high-quality gaming experience
- **Community Features**: Strong emphasis on community building

### **Americas**
- **Diverse Languages**: Support for Spanish, Portuguese, and indigenous languages
- **Mobile Gaming**: Optimized for mobile gaming culture
- **Social Integration**: Deep social media integration
- **Accessibility**: Strong focus on accessibility features

### **Africa**
- **Local Languages**: Support for major African languages
- **Offline Capability**: Works with limited internet connectivity
- **Community Building**: Emphasis on local community development
- **Economic Empowerment**: Gaming as economic opportunity

## 🔮 Future Language Expansion

### **Planned Additions**
- **Indigenous Languages**: Support for more indigenous languages
- **Regional Dialects**: Local dialect variations
- **Sign Language**: Accessibility features for hearing-impaired players
- **Voice Commands**: Multi-language voice control support

### **Community-Driven Translation**
- **Crowdsourced Translations**: Community contribution to translations
- **Local Expert Review**: Local gaming experts review translations
- **Cultural Consultants**: Cultural experts ensure appropriate localization
- **Feedback Integration**: Continuous improvement based on user feedback

## 🏆 Global Tournament Support

### **Multi-language Tournaments**
- **Language-Specific Events**: Tournaments in different languages
- **Global Championships**: International tournaments with multi-language support
- **Local Competitions**: Regional tournaments in local languages
- **Cultural Celebrations**: Special events celebrating different cultures

### **Fair Play Across Languages**
- **Universal Rules**: Tournament rules translated to all languages
- **Equal Opportunity**: All players have equal access regardless of language
- **Cultural Sensitivity**: Tournament themes respect cultural diversity
- **Inclusive Prizes**: Prizes and rewards appropriate for all cultures

## 💡 How to Change Your Language

### **In-Game Language Settings**
1. **Open Settings**: Tap the settings icon in the main menu
2. **Select Language**: Choose your preferred language from the dropdown
3. **Apply Changes**: Language changes apply immediately
4. **Save Preference**: Your language choice is saved for future sessions

### **Device Language Detection**
- **Automatic Detection**: Flappy Pi automatically detects your device language
- **Manual Override**: You can always manually select your preferred language
- **Multiple Languages**: Support for players who speak multiple languages
- **Family Sharing**: Different family members can use different languages

## 🌍 Join the Global Flappy Pi Community

### **Connect with Players Worldwide**
- **Language-Specific Groups**: Join groups in your native language
- **Cultural Exchange**: Learn about gaming cultures from around the world
- **Global Friendships**: Make friends across language barriers
- **Shared Experiences**: Share gaming experiences with players worldwide

### **Contribute to Global Growth**
- **Translation Feedback**: Help improve translations in your language
- **Cultural Insights**: Share cultural perspectives with the development team
- **Community Building**: Help build local Flappy Pi communities
- **Pi Network Promotion**: Help spread Pi Network adoption in your region

## 📈 Impact Metrics

### **Global Reach**
- **50 Languages**: Covering 90%+ of the world's population
- **200+ Countries**: Available in virtually every country
- **Billions of Speakers**: Combined reach of billions of potential players
- **Cultural Diversity**: Representation of diverse cultures and traditions

### **Community Growth**
- **Increased Engagement**: Higher engagement from non-English speaking players
- **Diverse Participation**: More diverse tournament and community participation
- **Local Communities**: Strong local communities forming in different regions
- **Pi Network Growth**: Accelerated Pi Network adoption in new regions

## 🎉 Celebrating Global Unity

Flappy Pi's 50-language support represents more than just technical achievement—it's a celebration of global unity through gaming. Every language supported is a bridge to a new community, a new culture, and new friendships.

**Join us in building the world's most inclusive Pi Network gaming community!**

*Available now in 50 languages worldwide. Download Flappy Pi and experience gaming without language barriers!*

## 🔗 Resources

### **Language Support**
- **Complete Language List**: View all 50 supported languages
- **Translation Quality**: Learn about our translation process
- **Cultural Adaptation**: Understand our cultural sensitivity approach
- **Community Guidelines**: Guidelines for respectful cross-cultural interaction

### **Getting Started**
- **First Time Setup**: Guide for new players in any language
- **Language Switching**: How to change your language preference
- **Community Features**: How to connect with players in your language
- **Tournament Participation**: How to join tournaments in your language

*Flappy Pi - Where the world plays together! 🌍🎮*`,
      author: 'Flappy Pi Global Team',
      date: '2025-07-26',
      category: 'updates',
      readTime: '10 min read',
      views: 0,
      likes: 0,
      comments: 0,
      featured: true,
      image: '/flappy-logo.png',
      tags: ['global', 'languages', 'localization', '50-languages', 'worldwide', 'multilingual', 'inclusive', 'community']
    },
    {
      id: 1,
      title: '🎮 Flappy Pi v2.1.0 - New Bird Skins & Enhanced Gameplay!',
      excerpt: 'Discover the latest bird skins, improved physics, and exciting new features in our biggest update yet!',
      content: `We're thrilled to announce Flappy Pi v2.1.0, our most comprehensive update to date! This release brings stunning new bird skins, enhanced gameplay mechanics, and improved performance across all devices.

## 🐤 New Bird Skins
- **Golden Phoenix**: Rare legendary skin with fire effects
- **Cyber Bird**: Futuristic design with neon animations
- **Nature Spirit**: Organic skin with leaf particle effects
- **Crystal Bird**: Transparent skin with prismatic reflections

## 🎯 Enhanced Gameplay
- Improved collision detection for smoother gameplay
- New power-up combinations for strategic play
- Enhanced visual effects and animations
- Optimized performance for better frame rates

## 🏆 Community Features
- Real-time leaderboard updates
- Enhanced social sharing capabilities
- Improved tournament system
- Better Pi Network integration

Join the Flappy Pi community and experience these amazing new features!`,
      author: 'Flappy Pi Team',
      date: '2025-07-26',
      category: 'updates',
      readTime: '5 min read',
      views: 2847,
      likes: 156,
      comments: 23,
      featured: true,
      image: '/flappy-logo.png',
      tags: ['update', 'new-features', 'bird-skins']
    },
    {
      id: 2,
      title: '🏆 Weekly Tournament Results - June 2025',
      excerpt: 'Congratulations to our top players! See who dominated this week\'s Flappy Pi tournament.',
      content: `Another exciting week of Flappy Pi tournaments has concluded! We had over 2,500 participants competing for Pi rewards and exclusive bird skins.

## 🥇 Top Performers
1. **@PiGamer2025** - Score: 1,247 (Prize: 50 Pi)
2. **@FlappyMaster** - Score: 1,189 (Prize: 30 Pi)
3. **@NetworkPro** - Score: 1,156 (Prize: 20 Pi)

## 🎁 Special Rewards
- All top 10 players received exclusive bird skins
- Community participation bonus distributed
- Special recognition for new players

## 📊 Tournament Stats
- Total Participants: 2,547
- Average Score: 342
- Total Pi Distributed: 500 Pi
- New Records Set: 15

The next tournament starts on Monday! Are you ready to compete?`,
      author: 'Tournament Admin',
      date: '2025-07-26',
      category: 'tournaments',
      readTime: '3 min read',
      views: 1892,
      likes: 89,
      comments: 45,
      featured: false,
      image: '/flappy-logo.png',
      tags: ['tournament', 'winners', 'rewards']
    },
    {
      id: 3,
      title: '💡 Pro Tips: How to Score 1000+ in Flappy Pi',
      excerpt: 'Master the advanced techniques used by top players to achieve high scores consistently.',
      content: `Want to join the elite 1000+ score club? Here are the proven strategies used by our top players!

## 🎯 Core Techniques
1. **Rhythm Mastery**: Develop a consistent tapping rhythm
2. **Gap Analysis**: Learn to read pipe gaps quickly
3. **Power-up Timing**: Use power-ups strategically
4. **Mental Focus**: Stay calm under pressure

## 🚀 Advanced Strategies
- **Pattern Recognition**: Identify repeating pipe patterns
- **Speed Adaptation**: Adjust to increasing difficulty
- **Risk Management**: Know when to use power-ups
- **Endurance Training**: Build stamina for long sessions

## 🏆 Practice Routine
- Start with 10-minute warm-up sessions
- Focus on consistency over speed initially
- Gradually increase session duration
- Track your progress with detailed stats

Remember: Practice makes perfect! Keep flapping and you'll reach new heights!`,
      author: 'Pro Player @FlappyMaster',
      date: '2025-06-10',
      category: 'tips',
      readTime: '7 min read',
      views: 3241,
      likes: 234,
      comments: 67,
      featured: true,
      image: '/flappy-logo.png',
      tags: ['tips', 'strategy', 'high-scores']
    },
    {
      id: 4,
      title: '💰 Pi Network Integration: How to Maximize Your Earnings',
      excerpt: 'Learn how to earn more Pi through Flappy Pi and optimize your gaming strategy.',
      content: `Flappy Pi is more than just a game - it's your gateway to earning Pi cryptocurrency! Here's how to maximize your earnings:

## 🎮 Earning Methods
- **Daily Challenges**: Complete daily missions for Pi rewards
- **Tournament Participation**: Compete in weekly tournaments
- **Achievement Unlocks**: Reach milestones for bonus Pi
- **Social Sharing**: Share achievements for referral bonuses

## 📈 Optimization Tips
- Play during peak hours for better rewards
- Complete all daily challenges consistently
- Participate in community events
- Use power-ups strategically to increase scores

## 🏆 Reward Tiers
- **Bronze**: 1-10 Pi per session
- **Silver**: 11-25 Pi per session
- **Gold**: 26-50 Pi per session
- **Platinum**: 50+ Pi per session

Start earning Pi today and join the Flappy Pi economy!`,
      author: 'Pi Network Expert',
      date: '2025-06-08',
      category: 'rewards',
      readTime: '4 min read',
      views: 2156,
      likes: 178,
      comments: 34,
      featured: false,
      image: '/flappy-logo.png',
      tags: ['pi-network', 'earnings', 'rewards']
    },
    {
      id: 5,
      title: '🌟 Community Spotlight: Meet Our Top Players',
      excerpt: 'Get to know the amazing players who make the Flappy Pi community special.',
      content: `The Flappy Pi community is filled with incredible players! Let's meet some of our most active and inspiring members.

## 👑 Featured Players

### @PiGamer2025
- **Achievement**: First player to reach 1500+ score
- **Specialty**: Endless mode mastery
- **Community Role**: Mentor for new players
- **Quote**: "Flappy Pi changed my life - I've earned over 500 Pi!"

### @FlappyMaster
- **Achievement**: Tournament champion 3x
- **Specialty**: Speed running and strategy
- **Community Role**: Strategy guide creator
- **Quote**: "The key is consistency and mental focus."

### @NetworkPro
- **Achievement**: Most helpful community member
- **Specialty**: Teaching new players
- **Community Role**: Community moderator
- **Quote**: "We're building something special here!"

## 🤝 Community Values
- **Support**: Helping new players succeed
- **Innovation**: Sharing new strategies and techniques
- **Friendship**: Building lasting connections
- **Growth**: Continuous improvement and learning

Join our community and become the next featured player!`,
      author: 'Community Manager',
      date: '2025-06-05',
      category: 'community',
      readTime: '6 min read',
      views: 1897,
      likes: 145,
      comments: 56,
      featured: false,
      image: '/flappy-logo.png',
      tags: ['community', 'players', 'spotlight']
    },
    {
      id: 6,
      title: '🚀 Flappy Pi Roadmap 2025: What\'s Coming Next',
      excerpt: 'Get an exclusive look at the exciting features and updates planned for Flappy Pi in 2025.',
      content: `2025 is going to be an incredible year for Flappy Pi! Here's what we have planned:

## 🎮 Q1 2025 - Enhanced Gameplay
- **Multiplayer Mode**: Compete with friends in real-time
- **Custom Bird Builder**: Create your own unique bird skins
- **Advanced Power-ups**: New strategic power-up combinations
- **Seasonal Events**: Special themed tournaments

## 🏆 Q2 2025 - Competitive Features
- **Global Championships**: International tournament series
- **Team Competitions**: Form teams and compete together
- **Achievement System**: Comprehensive achievement tracking
- **Social Features**: Enhanced community interaction

## 💰 Q3 2025 - Pi Network Integration
- **Pi Marketplace**: Trade bird skins and items
- **Staking Rewards**: Earn Pi by staking your achievements
- **Governance**: Community voting on game features
- **NFT Integration**: Unique collectible bird skins

## 🌟 Q4 2025 - Innovation
- **AI Opponents**: Challenge AI-powered opponents
- **Cross-platform**: Play on multiple devices seamlessly
- **Advanced Analytics**: Detailed performance tracking
- **Community Tools**: Enhanced community management

The future of Flappy Pi is bright! Stay tuned for these amazing features!`,
      author: 'Development Team',
      date: '2025-06-02',
      category: 'updates',
      readTime: '8 min read',
      views: 3456,
      likes: 267,
      comments: 89,
      featured: true,
      image: '/flappy-logo.png',
      tags: ['roadmap', '2025', 'features']
    },
    {
      id: 7,
      title: '🌍 Flappy Pi Now Supports 20 Languages + Light & Night Mode!',
      excerpt: 'Flappy Pi is now fully localized for 20 countries and features both Light and Night Mode for the best experience.',
      content: `We are excited to announce a major update for the global Flappy Pi community!

## 🌐 20 Languages & Countries
Flappy Pi is now available in 20 languages, making it accessible to players around the world. Supported languages include:
- English
- Chinese
- Hindi
- Spanish
- Russian
- Turkish
- Vietnamese
- Thai
- German
- French
- Italian
- Polish
- Arabic
- Korean
- Persian
- Ukrainian
- Filipino
- Indonesian
- Portuguese
- Japanese

Switch your language in the settings and enjoy a fully localized experience!

## 🌙 Light & Night Mode
You can now toggle between beautiful Light Mode and Night Mode for comfortable play at any time of day. Find the theme switch in your settings menu.

Thank you to our amazing community for making Flappy Pi a truly global game! More features and languages coming soon.`,
      author: 'Flappy Pi Team',
      date: '2025-06-16',
      category: 'updates',
      readTime: '3 min read',
      views: 0,
      likes: 0,
      comments: 0,
      featured: true,
      image: '/flappy-logo.png',
      tags: ['languages', 'update', 'theme', 'night-mode', 'light-mode', 'global']
    },
    {
      id: 8,
      title: '🎤 Scream Pi: Revolutionary Voice-Controlled Gaming Experience!',
      excerpt: 'Introducing Scream Pi - the world\'s first voice-controlled Flappy Pi variant that lets you jump with your voice!',
      content: `# 🎤 Scream Pi: Revolutionary Voice-Controlled Gaming Experience!

## Overview
We're thrilled to announce **Scream Pi**, a groundbreaking new game mode that revolutionizes how you play Flappy Pi! Scream Pi combines the classic Flappy Pi gameplay with cutting-edge voice recognition technology, allowing you to control your character using your voice.

## 🎮 How Scream Pi Works

### Voice Control System
- **Microphone Integration**: Uses your device's microphone to detect voice input
- **Scream Detection**: Advanced audio analysis detects volume and pitch changes
- **Jump Mechanics**: Scream louder to jump higher - the more you scream, the higher you jump!
- **Tap Alternative**: Don't want to scream? Use traditional tap controls instead

### Game Modes
1. **Scream Jump Mode**: Use your voice to control jumping
2. **Tap Jump Mode**: Traditional tap and hold controls
3. **Character Selection**: Choose between Nicolas and Chengdiao characters

## 🚀 Revolutionary Features

### Advanced Power-Up System
- **🛡️ Shield**: Protects from one collision (10 seconds)
- **🧲 Magnet**: Attracts coins from distance (8 seconds)
- **💰 Coin Multiplier**: Doubles coin earnings (12 seconds)
- **⚡ Turbo Start**: Increases game speed by 50% (15 seconds)
- **❤️ Extra Life**: Provides additional revive when you die

### Performance Optimizations
- **60 FPS Gameplay**: Smooth, lag-free experience
- **Optimized Audio Processing**: Reduced CPU usage for better performance
- **Smart State Management**: Efficient React state updates
- **Preloaded Assets**: Fast loading times

### Visual Enhancements
- **Real-time Scream Meter**: See your voice level in real-time
- **Character Reactions**: Characters react to your scream intensity
- **Particle Effects**: Beautiful visual feedback for actions
- **Shield Visual Effects**: Cyan ring shows when shield is active

## 🎯 Gameplay Mechanics

### Voice Control
- **Soft Voice**: Walk/float gently
- **Medium Scream**: Normal jump height
- **Loud Scream**: High jump for difficult obstacles
- **Sensitivity Adjustment**: Customize microphone sensitivity

### Scoring System
- **Obstacle Passing**: Score points by successfully passing obstacles
- **Coin Collection**: Collect coins for rewards
- **Distance Tracking**: Track how far you've traveled
- **Level Progression**: Unlock higher levels with better scores

## 🏆 Competitive Features

### Character System
- **Nicolas**: The brave adventurer with a heart of gold
- **Chengdiao**: The wise scholar with quick reflexes
- **Unique Abilities**: Each character has special traits

### Power-Up Strategy
- **Strategic Timing**: Use power-ups at the right moments
- **Combination Effects**: Stack multiple power-ups for maximum effect
- **Resource Management**: Manage limited power-up quantities

## 🌟 Technical Innovation

### Audio Processing
- **Real-time Analysis**: Continuous microphone monitoring
- **Frequency Detection**: Advanced audio frequency analysis
- **Noise Filtering**: Intelligent background noise reduction
- **Cross-platform Support**: Works on all modern browsers

### Performance Features
- **Optimized Game Loop**: Reduced state updates for smooth gameplay
- **Batch Rendering**: Efficient canvas rendering
- **Memory Management**: Automatic cleanup of unused resources
- **Mobile Optimization**: Designed for mobile devices

## 🎮 How to Play

### Getting Started
1. **Select Character**: Choose Nicolas or Chengdiao
2. **Choose Mode**: Pick Scream Jump or Tap Jump
3. **Adjust Sensitivity**: Set microphone sensitivity to your preference
4. **Start Playing**: Scream to jump or tap to control!

### Tips for Success
- **Practice Voice Control**: Start with gentle sounds and gradually increase
- **Use Power-ups Strategically**: Save them for difficult sections
- **Watch the Scream Meter**: Monitor your voice level
- **Stay Calm**: Don't get too excited - controlled screaming works better!

## 🔮 Future Updates

### Planned Features
- **Multiplayer Voice Battles**: Compete with friends using voice
- **Voice Recognition Profiles**: Personalized voice training
- **Advanced Audio Effects**: Enhanced sound processing
- **Community Challenges**: Voice-based tournaments

### Technical Roadmap
- **AI Voice Recognition**: Machine learning for better accuracy
- **Cross-platform Voice Sync**: Seamless voice control across devices
- **Advanced Analytics**: Detailed voice performance tracking
- **Accessibility Features**: Support for various voice patterns

## 🎉 Join the Revolution!

Scream Pi represents a new era in gaming - where your voice becomes your controller! Experience the thrill of voice-controlled gameplay while enjoying all the classic Flappy Pi mechanics you love.

**Ready to scream your way to victory?** Try Scream Pi today and discover a whole new way to play!

*Available now on all Flappy Pi platforms. No additional downloads required.*`,
      author: 'Flappy Pi Team',
      date: '2025-06-17',
      category: 'updates',
      readTime: '8 min read',
      views: 0,
      likes: 0,
      comments: 0,
      featured: true,
      image: '/flappy-logo.png',
      tags: ['scream-pi', 'voice-control', 'new-feature', 'revolutionary', 'gaming']
    },
    {
      id: 9,
      title: '🚀 Technical Deep Dive: Scaling Flappy Pi for Millions of Players',
      excerpt: 'Learn about the advanced performance optimizations, anti-cheat systems, and scalable architecture implemented in Flappy Pi.',
      content: `# 🚀 Technical Deep Dive: Scaling Flappy Pi for Millions of Players

## Overview
Flappy Pi has been completely rearchitected to handle massive scale while maintaining smooth, lag-free gameplay. This technical deep dive explores the advanced systems we've implemented.

## 🎯 Performance Optimization Systems

### 1. Smart Asset Loading
- **Lazy Loading**: Non-critical assets load on-demand
- **Sprite Sheets**: Consolidated bird animations into optimized sprite sheets
- **Critical Asset Preloading**: Essential assets (bird, ground, sounds) preload for instant gameplay
- **Memory Management**: Automatic cleanup of unused assets

### 2. Advanced Performance Monitoring
- **Real-time FPS Tracking**: Continuous monitoring with 60-frame history
- **Device Capability Detection**: Automatic detection of low-power devices
- **Dynamic Quality Adjustment**: Graphics quality adapts to device performance
- **Frame Skip Logic**: Intelligent frame skipping for smooth gameplay

### 3. Anti-Cheat System
- **Score Validation**: Comprehensive score verification algorithms
- **Session Tracking**: Device fingerprinting and session monitoring
- **Rate Limiting**: Prevents rapid-fire actions and bot behavior
- **Pi Network Integration**: User identity validation through Pi Network

## 🏗️ Scalable Architecture

### Frontend Optimizations
- **Canvas/WebGL Rendering**: Hardware-accelerated graphics
- **60 FPS Target**: Optimized frame rate for mobile devices
- **Asset Compression**: WebP images, MP3 audio
- **Responsive Design**: Adapts to all screen sizes

### Backend Infrastructure
- **Vercel Deployment**: Global edge network for fast loading
- **Supabase Database**: Scalable PostgreSQL with real-time features
- **Cloudflare CDN**: Global content delivery network
- **Serverless Functions**: Auto-scaling API endpoints

## 📊 Performance Metrics

### Target Performance
- **10,000+ users/day**: Basic Vercel + Supabase setup
- **100,000+ users/day**: Optimized with caching and CDN
- **1,000,000+ users/day**: Full-scale architecture with Redis caching

### Optimization Results
- **50% faster loading**: Optimized asset loading
- **30% better FPS**: Performance monitoring and frame skipping
- **99.9% uptime**: Cloudflare protection and auto-scaling
- **Global reach**: Edge locations worldwide

## 🛡️ Security & Anti-Cheat

### Validation Systems
- **Score Range Checking**: Prevents impossible scores
- **Time Correlation**: Validates score vs. game time
- **Session Monitoring**: Tracks user behavior patterns
- **Device Fingerprinting**: Unique device identification

### Rate Limiting
- **Action Limits**: Maximum 20 actions per second
- **Session Duration**: Minimum 2-second sessions
- **Score Progression**: Validates realistic score increases

## 🌐 Global Delivery

### CDN Strategy
- **Cloudflare Edge**: 200+ locations worldwide
- **Asset Caching**: Static assets cached globally
- **DDoS Protection**: Automatic attack mitigation
- **Geographic Routing**: Users connect to nearest server

### Database Scaling
- **Read Replicas**: Separate read/write operations
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed and optimized queries
- **Caching Layer**: Redis for frequently accessed data

## 🔧 Implementation Details

### Game Loop Optimization
\`\`\`typescript
// Optimized game loop with performance monitoring
class GameLoop {
  private shouldSkipFrame(): boolean {
    const metrics = performanceMonitor.getPerformanceMetrics();
    return metrics.fps < this.config.targetFPS * 0.8;
  }
}
\`\`\`

### Asset Loading System
\`\`\`typescript
// Smart asset loading with caching
class AssetLoader {
  async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = ['bird_0', 'ground_grass', 'sfx_hit'];
    await Promise.all(criticalAssets.map(asset => this.loadAsset(asset)));
  }
}
\`\`\`

### Anti-Cheat Validation
\`\`\`typescript
// Comprehensive score validation
validateScore(score: number, gameTime: number): ScoreValidation {
  const isValid = this.performScoreValidation(score, gameTime);
  const suspiciousLevel = this.calculateSuspiciousLevel(score, gameTime);
  return { isValid, suspiciousLevel, sessionData };
}
\`\`\`

## 📈 Monitoring & Analytics

### Real-time Monitoring
- **Performance Dashboard**: Live FPS and memory usage
- **Error Tracking**: Automatic error reporting and analysis
- **User Analytics**: Gameplay patterns and engagement metrics
- **Server Health**: API response times and uptime monitoring

### Scaling Alerts
- **Auto-scaling Triggers**: Automatic resource allocation
- **Performance Alerts**: FPS drops and memory issues
- **Security Alerts**: Suspicious activity detection
- **Capacity Planning**: Predictive scaling based on usage patterns

## 🎮 User Experience Improvements

### Adaptive Quality
- **Low Graphics Mode**: Automatic for low-power devices
- **Frame Rate Adaptation**: Dynamic FPS adjustment
- **Battery Optimization**: Reduced effects on mobile devices
- **Network Optimization**: Minimal data usage

### Cross-Platform Support
- **Mobile Optimization**: Touch controls and responsive design
- **Desktop Enhancement**: Keyboard controls and high-resolution graphics
- **Progressive Web App**: Offline capability and app-like experience
- **Multi-language Support**: 20 languages with full localization

## 🚀 Future Scaling Plans

### Phase 1: Current Implementation ✅
- Basic performance optimization
- Anti-cheat system
- Asset loading optimization
- Performance monitoring

### Phase 2: Advanced Scaling (Coming Soon)
- **Microservices Architecture**: Separate services for different game features
- **Real-time Leaderboards**: Live updates with WebSocket connections
- **Advanced Analytics**: Machine learning for player behavior analysis
- **A/B Testing Framework**: Optimize game mechanics based on data

### Phase 3: Enterprise Features (Future)
- **Tournament System**: Large-scale competitive events
- **Social Features**: Friend systems and team play
- **Advanced Anti-Cheat**: Machine learning-based cheat detection
- **Global Leaderboards**: Regional and worldwide rankings

## 🔗 Technical Resources

### Development Tools
- **Vercel**: Frontend hosting and edge functions
- **Supabase**: Backend database and authentication
- **Cloudflare**: CDN and security services
- **TypeScript**: Type-safe development

### Monitoring Tools
- **Performance Monitor**: Custom FPS and memory tracking
- **Error Reporting**: Automatic crash reporting
- **Analytics**: User behavior and engagement metrics
- **Health Checks**: Automated system monitoring

## 📚 Conclusion

Flappy Pi is now built on a foundation that can scale from thousands to millions of players while maintaining the smooth, responsive gameplay that players love. The combination of frontend optimizations, intelligent backend architecture, and comprehensive monitoring systems ensures that every player gets the best possible experience, regardless of their device or location.

The technical implementation demonstrates modern web development best practices, with a focus on performance, security, and scalability. As we continue to grow, these systems will automatically adapt and scale to meet the demands of our global player base.

*Stay tuned for more technical deep dives and behind-the-scenes insights into the Flappy Pi development process!*`,
      author: 'Flappy Pi Team',
      date: '2025-06-20',
      category: 'technical',
      readTime: '8 min read',
      views: 0,
      likes: 0,
      comments: 0,
      featured: true,
      image: '/flappy-logo.png',
      tags: ['scaling', 'performance', 'technical', 'architecture']
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSharePost = async (post: any) => {
    const shareText = `📖 ${post.title}\n\n${post.excerpt}\n\nRead more on Flappy Pi Blog!\n\n#FlappyPi #PiNetwork #Gaming`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Post Shared!",
          description: "Blog post link copied to clipboard.",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleLikePost = (postId: number) => {
    toast({
      title: "Post Liked!",
      description: "Thanks for your support!",
      duration: 2000
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/home')}
                className="text-white hover:bg-white/20"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <img src="/flappy-logo.png" alt="Flappy Pi" className="w-8 h-8 sm:w-10 sm:h-10" />
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Flappy Pi Blog</h1>
                  <p className="text-blue-100 text-xs sm:text-sm">Latest news, updates & community stories</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs sm:text-sm"
              >
                <FaBookmark className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Subscribe</span>
                <span className="sm:hidden">Sub</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4 sm:space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                {category.icon}
                <span className="ml-1 sm:ml-2">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.filter(post => post.featured).length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                <Badge className="bg-blue-500 text-white text-xs">Latest</Badge>
              </div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-800">
                {filteredPosts.filter(post => post.featured)[0]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                {filteredPosts.filter(post => post.featured)[0]?.excerpt}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaUser className="w-3 h-3 sm:w-4 sm:h-4" />
                    {filteredPosts.filter(post => post.featured)[0]?.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getRelativeTime(filteredPosts.filter(post => post.featured)[0]?.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                    {filteredPosts.filter(post => post.featured)[0]?.views}
                  </span>
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm sm:text-base"
                  onClick={() => handleReadFullPost(filteredPosts.filter(post => post.featured)[0])}
                >
                  Read More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${
                    post.category === 'updates' ? 'bg-green-500' :
                    post.category === 'community' ? 'bg-purple-500' :
                    post.category === 'rewards' ? 'bg-yellow-500' :
                    post.category === 'tournaments' ? 'bg-red-500' :
                    post.category === 'technical' ? 'bg-indigo-500' :
                    'bg-blue-500'
                  } text-white text-xs`}>
                    {categories.find(cat => cat.id === post.category)?.name}
                  </Badge>
                  {post.featured && (
                    <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                  )}
                </div>
                <CardTitle className="text-base sm:text-lg text-gray-800 line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm sm:text-base">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-500 mb-4 space-y-1 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center gap-1">
                      <FaUser className="w-3 h-3 sm:w-4 sm:h-4" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                      {getRelativeTime(post.date)}
                    </span>
                  </div>
                  <span>{post.readTime}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <FaHeart className="w-3 h-3 sm:w-4 sm:h-4" />
                      {post.likes}
                    </button>
                    <span className="flex items-center gap-1">
                      <FaComments className="w-3 h-3 sm:w-4 sm:h-4" />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                      {post.views}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReadFullPost(post)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 text-xs sm:text-sm"
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Stay Updated!</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <p className="mb-4 text-sm sm:text-base">
              Get the latest Flappy Pi news, updates, and exclusive content delivered to your inbox!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 sm:py-2 rounded-lg text-gray-800 text-sm sm:text-base"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                disabled={isSubscribed}
              />
              <Button
                className={`bg-white text-blue-600 hover:bg-gray-100 text-sm sm:text-base ${isSubscribed ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleNewsletterSubscribe}
                disabled={isSubscribed}
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </div>
            {subscribeError && <div className="text-yellow-200 mt-2 text-xs sm:text-sm">{subscribeError}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Full Post Modal */}
      {showFullPost && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseFullPost}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{selectedPost.title}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2 space-y-1 sm:space-y-0">
                      <span className="flex items-center gap-1">
                        <FaUser className="w-3 h-3 sm:w-4 sm:h-4" />
                        {selectedPost.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatDate(selectedPost.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                        {selectedPost.views}
                      </span>
                      <span>{selectedPost.readTime}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSharePost(selectedPost)}
                    className="text-xs sm:text-sm"
                  >
                    <FaShare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLikePost(selectedPost.id)}
                    className="text-xs sm:text-sm"
                  >
                    <FaHeart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {selectedPost.likes}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm sm:text-base">
                  {selectedPost.content}
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Tags:</span>
                  {selectedPost.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaComments className="w-3 h-3 sm:w-4 sm:h-4" />
                      {selectedPost.comments} comments
                    </span>
                    <span className="flex items-center gap-1">
                      <FaHeart className="w-3 h-3 sm:w-4 sm:h-4" />
                      {selectedPost.likes} likes
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleCloseFullPost}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlappyPiBlogPage; 