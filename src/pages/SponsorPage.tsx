import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../hooks/useGameState';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  Star, 
  Gift, 
  Coins, 
  ArrowLeft, 
  Crown, 
  Sparkles,
  Trophy,
  Award,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import FooterNPC from '../components/FooterNPC';
import EnhancedFooter from '../components/EnhancedFooter';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useLanguage } from '../context/LanguageContext';

const SponsorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coins: flappyCoins, setCoins } = useGameState();
  const { toast } = useToast();
  
  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();

  // Local state for music and sound toggles
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'sponsors' | 'donations' | 'partners'>('sponsors');

  const { settings, updateSettings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  const handleBack = () => {
    navigate(-1);
  };

  const sponsors = [
    {
      name: "Pi Network",
      logo: "/pi-logo.png",
      tier: "Platinum",
      description: "Blockchain infrastructure and payment processing support",
      contribution: "Infrastructure & Payment Processing",
      since: "Future Partnership"
    },
    {
      name: "Pi Browser",
      logo: "/pi-logo.png",
      tier: "Gold",
      description: "Browser integration and user experience optimization",
      contribution: "Browser Integration & UX",
      since: "Future Partnership"
    },
    {
      name: "Pi Core Team",
      logo: "/pi-logo.png",
      tier: "Platinum",
      description: "Technical guidance and blockchain development support",
      contribution: "Technical Guidance & Development",
      since: "Future Partnership"
    },
    {
      name: "Pi Community",
      logo: "/pi-logo.png",
      tier: "Gold",
      description: "Community-driven development and feedback",
      contribution: "Community Support & Feedback",
      since: "Future Partnership"
    },
    {
      name: "Pi Developers",
      logo: "/pi-logo.png",
      tier: "Silver",
      description: "Developer tools and API access support",
      contribution: "Developer Tools & API Access",
      since: "Future Partnership"
    },
    {
      name: "Pi Pioneers",
      logo: "/pi-logo.png",
      tier: "Bronze",
      description: "Early adopter support and testing",
      contribution: "Early Adoption & Testing",
      since: "Future Partnership"
    }
  ];

  const partners = [
    {
      name: "Pi Network Foundation",
      logo: "/pi-logo.png",
      description: "Official blockchain infrastructure and development partnership",
      partnership: "Infrastructure & Development",
      benefits: "Technical support, API access, and blockchain integration"
    },
    {
      name: "Pi Browser Team",
      logo: "/pi-logo.png",
      description: "Browser integration and user experience optimization",
      partnership: "Browser Integration",
      benefits: "Seamless gaming experience and performance optimization"
    },
    {
      name: "Pi Core Developers",
      logo: "/pi-logo.png",
      description: "Technical guidance and blockchain development expertise",
      partnership: "Technical Partnership",
      benefits: "Development tools, documentation, and best practices"
    },
    {
      name: "Pi Community Hub",
      logo: "/pi-logo.png",
      description: "Community-driven development and user feedback",
      partnership: "Community Partnership",
      benefits: "User feedback, testing, and community engagement"
    },
    {
      name: "Pi Developer Network",
      logo: "/pi-logo.png",
      description: "Developer tools and API access for game development",
      partnership: "Developer Tools",
      benefits: "SDK access, documentation, and technical support"
    },
    {
      name: "Pi Gaming Alliance",
      logo: "/pi-logo.png",
      description: "Gaming industry collaboration and cross-promotion",
      partnership: "Gaming Partnership",
      benefits: "Cross-promotion, shared resources, and industry insights"
    }
  ];

  const donationTiers = [
    {
      name: "Pi Pioneer",
      amount: "10 π",
      icon: "🌟",
      benefits: [
        "Exclusive Pioneer badge",
        "Early access to new features",
        "Special Discord role",
        "Monthly newsletter"
      ]
    },
    {
      name: "Pi Supporter", 
      amount: "25 π",
      icon: "💎",
      benefits: [
        "All Pioneer benefits",
        "Custom profile frame",
        "Priority customer support",
        "Beta testing access"
      ]
    },
    {
      name: "Pi Champion",
      amount: "50 π", 
      icon: "👑",
      benefits: [
        "All Supporter benefits",
        "Exclusive in-game items",
        "Direct developer feedback",
        "VIP community access"
      ]
    },
    {
      name: "Pi Legend",
      amount: "100 π",
      icon: "🏆", 
      benefits: [
        "All Champion benefits",
        "Custom game character",
        "Monthly developer calls",
        "Lifetime premium access"
      ]
    }
  ];

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-32 relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-yellow-700 hover:bg-yellow-100 rounded-full p-2 z-20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <h1 className={`text-4xl font-extrabold ${theme === 'night' ? 'text-white' : 'text-yellow-800'}`}>
              Future Support
            </h1>
          </div>
          <p className={`text-lg font-medium ${theme === 'night' ? 'text-gray-200' : 'text-gray-700'}`}>
            Join our mission to create the best blockchain gaming experience
          </p>
          <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <p className="text-yellow-900 text-sm font-semibold">
              🚀 Coming Soon - Project Launch Expected 2025
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-6 flex justify-center">
          <Button
            onClick={() => updateSettings({ ...settings, theme: theme === 'night' ? 'light' : 'night' })}
            className="rounded-full bg-white/90 backdrop-blur-sm shadow p-2 hover:bg-blue-100 transition cursor-pointer"
          >
            {theme === 'night' ? (
              <Sun className="w-5 h-5 text-yellow-600" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-white/90 rounded-xl p-1 shadow-lg">
          <Button
            variant={activeTab === 'sponsors' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('sponsors')}
            className="flex items-center space-x-2 font-semibold"
          >
            <Star className="h-4 w-4" />
            <span>Sponsors</span>
          </Button>
          <Button
            variant={activeTab === 'donations' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('donations')}
            className="flex items-center space-x-2 font-semibold"
          >
            <Gift className="h-4 w-4" />
            <span>Donations</span>
          </Button>
          <Button
            variant={activeTab === 'partners' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('partners')}
            className="flex items-center space-x-2 font-semibold"
          >
            <Users className="h-4 w-4" />
            <span>Partners</span>
          </Button>
        </div>

        {/* Content */}
        <div className="max-w-4xl w-full">
          {activeTab === 'sponsors' && (
            <div className="space-y-6">
              <div className="bg-white/90 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Star className="h-6 w-6 text-yellow-500 mr-2" />
                  Future Sponsorship Opportunities
                </h2>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 text-sm font-semibold">
                    <strong>🚀 Pre-Launch Phase:</strong> We're currently in development and planning future partnerships.
                    These are potential sponsorship opportunities that will be available upon project launch.
                  </p>
                </div>
                <p className="text-gray-700 mb-6 font-medium">
                  These amazing organizations represent potential future sponsors for Flappy Pi's development and help us create the best gaming experience.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sponsors.map((sponsor, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-lg mr-3 bg-gray-100 flex items-center justify-center">
                          <img 
                            src={sponsor.logo} 
                            alt={sponsor.name} 
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                              if (target && fallback) {
                                target.style.display = 'none';
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg fallback-icon" style={{display: 'none'}}>
                            {sponsor.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{sponsor.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            sponsor.tier === 'Platinum' ? 'bg-purple-100 text-purple-900' :
                            sponsor.tier === 'Gold' ? 'bg-yellow-100 text-yellow-900' :
                            sponsor.tier === 'Silver' ? 'bg-gray-100 text-gray-900' :
                            'bg-orange-100 text-orange-900'
                          }`}>
                            {sponsor.tier} Tier
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 font-medium">{sponsor.description}</p>
                      <div className="text-xs text-gray-600 font-medium">
                        <strong>Contribution:</strong> {sponsor.contribution}<br />
                        <strong>Status:</strong> {sponsor.since}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="space-y-6">
              <div className="bg-white/90 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Gift className="h-6 w-6 text-green-500 mr-2" />
                  Future Support Tiers
                </h2>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                  <p className="text-green-900 text-sm font-semibold">
                    <strong>💡 Coming Soon:</strong> These donation tiers will be available upon project launch.
                    Your future support will help us maintain servers, develop new features, and create amazing gaming experiences.
                  </p>
                </div>
                <p className="text-gray-700 mb-6 font-medium">
                  Future donation tiers that will help us maintain servers, develop new features, and create amazing gaming experiences.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {donationTiers.map((tier, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{tier.icon}</div>
                        <h3 className="font-bold text-xl text-gray-900">{tier.name}</h3>
                        <div className="text-2xl font-bold text-green-700 mt-2">{tier.amount}</div>
                      </div>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-sm text-gray-700 font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Future Custom Donation
                  </h3>
                  <p className="mb-4 font-medium">Want to support us with a custom amount? Every contribution will help upon launch!</p>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Amount in π"
                      className="flex-1 px-4 py-2 rounded-lg text-black font-medium"
                      disabled
                    />
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6">
              <div className="bg-white/90 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-500 mr-2" />
                  Future Partnership Opportunities
                </h2>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 text-sm font-semibold">
                    <strong>🤝 Pre-Launch Partnerships:</strong> We're currently in development and planning future collaborations.
                    These represent potential partnership opportunities that will be available upon project launch.
                  </p>
                </div>
                <p className="text-gray-700 mb-6 font-medium">
                  We plan to collaborate with amazing partners to bring you the best gaming experience possible.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners.map((partner, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-lg mr-3 bg-gray-100 flex items-center justify-center">
                          <img 
                            src={partner.logo} 
                            alt={partner.name} 
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                              if (target && fallback) {
                                target.style.display = 'none';
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg fallback-icon" style={{display: 'none'}}>
                            {partner.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{partner.name}</h3>
                          <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded font-semibold">
                            Future Partner
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 font-medium">{partner.description}</p>
                      <div className="text-xs text-gray-600 font-medium">
                        <strong>Partnership:</strong> {partner.partnership}<br />
                        <strong>Benefits:</strong> {partner.benefits}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Globe className="h-5 w-5" />
                  </div>
                  Future Partnership Opportunities
                </h3>
                <p className="mb-4 font-medium">
                  Interested in future partnership opportunities with Flappy Pi? We're planning collaborations for post-launch!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs">⚡</span>
                      </div>
                      <h4 className="font-bold text-lg">For Businesses</h4>
                    </div>
                    <p className="text-sm font-medium">Future integration opportunities, co-marketing, and technical partnerships.</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs">💻</span>
                      </div>
                      <h4 className="font-bold text-lg">For Developers</h4>
                    </div>
                    <p className="text-sm font-medium">Future API access, development tools, and community collaboration.</p>
                  </div>
                </div>
                <Button className="mt-4 bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105" disabled>
                  Contact Us (Coming Soon)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* FooterNPC */}
        <FooterNPC
          npcType="default"
          npcName="Support NPC"
          dialogs={[
            "Thank you for your interest in supporting Flappy Pi! We're excited about future collaboration opportunities.",
            "Every future donation, no matter how small, will make a difference in our development journey.",
            "Our future sponsors and partners will be the backbone of our success. We're grateful for your interest!",
            "Want to explore future partnership opportunities? We're planning collaborations for post-launch!",
            "The Flappy Pi community is growing stronger every day thanks to supporters like you!",
            "Your future support will allow us to maintain servers, develop new features, and keep the game free.",
            "We believe in transparency - all future donations will go directly to development and community building.",
            "Future partnerships will help us reach more players and create better gaming experiences.",
            "Every future sponsor, donor, and partner will be part of our Flappy Pi family!",
            "Together, we're building the future of blockchain gaming."
          ]}
        />
      </div>

      {/* Copyright text */}
      <EnhancedFooter
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </SkyBackground>
  );
};

export default SponsorPage; 