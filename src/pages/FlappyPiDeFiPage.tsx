import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Coins, Shield, Users, Zap, Globe, Star, Heart, Share2, ExternalLink, DollarSign, BarChart, Layers, Handshake, Gem, Lock, Settings, Activity, CheckCircle, XCircle, Info, Calendar, Clock, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkyBackground from '@/components/SkyBackground';
import ErrorFreeImage from '@/components/ErrorFreeImage';
import EnhancedFooter from '@/components/EnhancedFooter';
import FooterNPC from '@/components/FooterNPC';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { getNextNpcInRotation } from '../utils/npcRotation';

interface FlappyPiDeFiPageProps {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const FlappyPiDeFiPage: React.FC<FlappyPiDeFiPageProps> = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic(musicEnabled);

  // DeFi-specific NPC dialogs
  const defiNpcDialogs = [
    "Welcome to Flappy Pi DeFi! 🚀",
    "DeFi Coming Soon! FPT Token N/A for now! 💰",
    "Get ready for revolutionary DeFi features! 🏦",
    "Stay tuned for updates on DeFi integration! 🎨",
    "DeFi features will be available soon! 🗳️",
    "Experience the power of Web3 gaming! ⛓️",
    "Join the DeFi revolution on Pi Network! 🌟",
    "Your journey to financial freedom starts here! 💎"
  ];


  const defiFeatures = [
    {
      icon: <Coins className="w-8 h-8 text-yellow-500" />,
      title: "Flappy Pi Token (FPT)",
      description: "FPT Token N/A for now - DeFi Coming Soon",
      features: ["Coming Soon", "DeFi Integration Pending", "Token Launch TBD", "Stay Tuned"]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      title: "Token Swapping & DEX",
      description: "DeFi Coming Soon - Features in Development",
      features: ["Coming Soon", "DEX Integration Pending", "Token Swap TBD", "Stay Tuned"]
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Staking & Yield Farming",
      description: "DeFi Coming Soon - Staking Features in Development",
      features: ["Coming Soon", "Staking Pending", "Yield Farming TBD", "Stay Tuned"]
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Guild Treasury & Governance",
      description: "DeFi Coming Soon - Governance Features in Development",
      features: ["Coming Soon", "Governance Pending", "Treasury TBD", "Stay Tuned"]
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      title: "NFT Marketplace",
      description: "DeFi Coming Soon - Marketplace Features in Development",
      features: ["Coming Soon", "Marketplace Pending", "NFT Trading TBD", "Stay Tuned"]
    },
    {
      icon: <Globe className="w-8 h-8 text-cyan-500" />,
      title: "Advanced DeFi",
      description: "DeFi Coming Soon - Advanced Features in Development",
      features: ["Coming Soon", "Advanced DeFi Pending", "Features TBD", "Stay Tuned"]
    }
  ];

  const roadmapPhases = [
    {
      phase: "Phase 1",
      quarter: "Q4 2025 - Q1 2026",
      title: "Core DeFi Launch",
      features: [
        "FPT token launch",
        "Basic staking mechanisms",
        "Simple token swapping",
        "NFT marketplace launch"
      ],
      status: "Coming Soon"
    },
    {
      phase: "Phase 2",
      quarter: "Q2 2026",
      title: "Advanced Features",
      features: [
        "Lending and borrowing",
        "Advanced staking options",
        "Guild treasury system",
        "Tournament prize pools"
      ],
      status: "Planned"
    },
    {
      phase: "Phase 3",
      quarter: "Q3 2026",
      title: "Full DeFi Suite",
      features: [
        "Insurance products",
        "Derivatives trading",
        "Advanced governance",
        "Cross-platform integration"
      ],
      status: "Planned"
    },
    {
      phase: "Phase 4",
      quarter: "Q4 2026+",
      title: "Ecosystem Expansion",
      features: [
        "Third-party integrations",
        "Advanced analytics",
        "Mobile optimization",
        "Global expansion"
      ],
      status: "Future"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      <div className="relative z-10">
        {/* Header Section */}
        <div className="bg-white text-gray-800 py-20 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-10">
              <ErrorFreeImage
                src="/flappy pi gif/flappy-2.gif.gif"
                alt="Flappy Pi"
                className="w-20 h-20 rounded-full shadow-lg"
                fallbackSrc="/flappy-logo.png"
              />
              <h1 className="text-5xl md:text-6xl font-extrabold">Flappy Pi DeFi</h1>
            </div>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-10">
              DeFi Coming Soon! FPT Token N/A for now - Revolutionary DeFi features will be available once DeFi becomes available on Pi Network
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-base font-medium">DeFi Integration</span>
              <span className="bg-purple-100 text-purple-800 px-6 py-3 rounded-full text-base font-medium">Token Swapping</span>
              <span className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-base font-medium">Staking Rewards</span>
              <span className="bg-orange-100 text-orange-800 px-6 py-3 rounded-full text-base font-medium">NFT Marketplace</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="max-w-4xl mx-auto p-6 -mt-8 relative z-20">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="bg-white/90 backdrop-blur-sm border-gray-300 text-gray-800 hover:bg-white hover:border-gray-400 shadow-lg mb-6 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>


        {/* Main Content */}
        <div className="relative z-10 px-6 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 md:p-12">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border-white/20 text-white mb-8">
                    <TabsTrigger value="overview" className="text-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">Overview</TabsTrigger>
                    <TabsTrigger value="features" className="text-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">Features</TabsTrigger>
                    <TabsTrigger value="roadmap" className="text-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">Roadmap</TabsTrigger>
                    <TabsTrigger value="economics" className="text-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white">Economics</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-8">
                      {/* What is Flappy Pi DeFi Section */}
                      <section className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">💰</div>
                          <h2 className="text-4xl font-bold text-gray-800">What is Flappy Pi DeFi?</h2>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border-l-4 border-green-500 shadow-lg">
                          <p className="text-xl text-gray-700 leading-relaxed mb-6">
                            <strong>DeFi Coming Soon!</strong> FPT Token N/A for now. Flappy Pi DeFi will transform the game into a comprehensive Web3 gaming ecosystem 
                            with advanced financial features once DeFi capabilities become available on Pi Network.
                          </p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">💰</div>
                              <span className="font-semibold text-gray-800">Earn rewards through staking and yield farming</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🎨</div>
                              <span className="font-semibold text-gray-800">Trade NFTs and tokens on integrated marketplaces</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">🗳️</div>
                              <span className="font-semibold text-gray-800">Participate in governance and community decisions</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">🏦</div>
                              <span className="font-semibold text-gray-800">Access lending, borrowing, and insurance products</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Key Benefits Section */}
                      <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">⭐</div>
                          <h2 className="text-3xl font-bold text-gray-800">Key Benefits</h2>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-l-4 border-yellow-500">
                          <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-white/70 rounded-lg border border-yellow-200">
                              <div className="text-3xl font-bold text-green-500 mb-2">TBD</div>
                              <div className="text-sm text-gray-600 font-semibold">Staking APY</div>
                            </div>
                            <div className="text-center p-4 bg-white/70 rounded-lg border border-yellow-200">
                              <div className="text-3xl font-bold text-blue-500 mb-2">N/A</div>
                              <div className="text-sm text-gray-600 font-semibold">FPT Supply</div>
                            </div>
                            <div className="text-center p-4 bg-white/70 rounded-lg border border-yellow-200">
                              <div className="text-3xl font-bold text-purple-500 mb-2">TBD</div>
                              <div className="text-sm text-gray-600 font-semibold">Token Burn</div>
                            </div>
                            <div className="text-center p-4 bg-white/70 rounded-lg border border-yellow-200">
                              <div className="text-3xl font-bold text-orange-500 mb-2">TBD</div>
                              <div className="text-sm text-gray-600 font-semibold">LP Rewards</div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defiFeatures.map((feature, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        {feature.icon}
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <p className="text-white/70 text-sm">{feature.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="text-white/60 text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="mt-8">
              <div className="space-y-6">
                {roadmapPhases.map((phase, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={phase.status === 'Coming Soon' ? 'default' : 'secondary'}
                            className={phase.status === 'Coming Soon' ? 'bg-green-500/20 text-green-200 border-green-400/30' : 'bg-blue-500/20 text-blue-200 border-blue-400/30'}
                          >
                            {phase.status}
                          </Badge>
                          <div>
                            <CardTitle className="text-xl">{phase.phase}: {phase.title}</CardTitle>
                            <p className="text-white/60 text-sm">{phase.quarter}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {phase.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-white/70">
                            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Economics Tab */}
            <TabsContent value="economics" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Coins className="w-6 h-6 text-yellow-400" />
                      Token Economics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">FPT Token Status</span>
                        <span className="font-bold text-yellow-400">N/A for now</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">DeFi Status</span>
                        <span className="font-bold text-blue-400">Coming Soon</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">Token Launch</span>
                        <span className="font-bold text-green-400">TBD</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">Stay Tuned</span>
                        <span className="font-bold text-purple-400">Updates Coming</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      Revenue Streams
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">Trading Fees</span>
                        <span className="font-bold text-yellow-400">Coming Soon</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">Staking Fees</span>
                        <span className="font-bold text-blue-400">Coming Soon</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">NFT Royalties</span>
                        <span className="font-bold text-green-400">Coming Soon</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/80">Premium Features</span>
                        <span className="font-bold text-purple-400">Coming Soon</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 backdrop-blur-lg border-2 border-green-300 shadow-2xl">
              <CardContent className="p-10">
                <h3 className="text-3xl font-bold mb-6 text-white">DeFi Coming Soon!</h3>
                <p className="text-green-100 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                  FPT Token N/A for now. Join the Flappy Pi community and be among the first to experience Web3 gaming 
                  with advanced DeFi features once they become available on Pi Network.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    onClick={() => navigate('/')}
                    size="lg"
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    Join Flappy Pi
                  </Button>
                  <Button
                    onClick={() => navigate('/whitepaper')}
                    variant="outline"
                    size="lg"
                    className="bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Read Whitepaper
                  </Button>
                  <Button
                    onClick={() => window.open('mailto:support@www.flappypi.xyz', '_blank')}
                    variant="outline"
                    size="lg"
                    className="bg-white/20 border-2 border-white/30 text-white hover:bg-white/30 hover:border-white/50 font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Share2 className="w-5 h-5 mr-3" />
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer NPC */}
      <FooterNPC
        npcType="default"
        npcName="DeFi Guide"
        dialogs={defiNpcDialogs}
      />
      
      {/* Enhanced Footer */}
      <EnhancedFooter
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </div>
  );
};

export default FlappyPiDeFiPage;
