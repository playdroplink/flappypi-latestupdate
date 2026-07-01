import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedFooter from '../components/EnhancedFooter';
import FooterNPC from '../components/FooterNPC';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { getNextNpcInRotation, getRandomNpcGif } from '../utils/npcRotation';
import ErrorFreeImage from '../components/ErrorFreeImage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Whitepaper({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }: { musicEnabled: boolean, setMusicEnabled: (enabled: boolean) => void, soundEnabled: boolean, setSoundEnabled: (enabled: boolean) => void }) {
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();

  // Local state for music and sound toggles (like ReservePage)
  const [localMusicEnabled, setLocalMusicEnabled] = useState(true);
  const [localSoundEnabled, setLocalSoundEnabled] = useState(true);

  // Debug music settings
  console.log('🎵 Whitepaper Music Debug:', {
    musicEnabled,
    localMusicEnabled,
    isPlaying,
    currentTrack,
    pathname: window.location.pathname
  });

  // Ensure music is properly initialized for this page (like FlappyWikiPage)
  useEffect(() => {
    // Force user gesture detection for music
    const handleUserInteraction = () => {
      if (typeof window !== 'undefined') {
        window.__musicUserGesture = true;
        console.log('[WHITEPAPER DEBUG] User gesture detected for music');
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    // Dispatch a custom event to trigger music for this route
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('route-changed', { 
        detail: { pathname: '/whitepaper' } 
      }));
    }, 100);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Whitepaper-specific NPC dialogs
  const whitepaperNpcDialogs = [
    "Welcome to the Flappy Pi Web3 Whitepaper! 🚀",
    "This document outlines our revolutionary Web3 gaming platform! 💰",
    "We're building the future of play-to-earn gaming on Pi Network! 🎮",
    "Check out our comprehensive DeFi features and NFT collections! 🎨",
    "Our roadmap shows exciting developments coming soon! 🗺️",
    "Join us in pioneering Web3 gaming with true digital ownership! ✨",
    "The Flappy Pi ecosystem will revolutionize how we play and earn! 🌟",
    "Our tokenomics are designed for sustainable growth and community rewards! 💎",
    "Experience the power of blockchain technology in gaming! ⛓️",
    "Together, we're building the ultimate Web3 gaming experience! 🎯"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      <BackgroundDecoration />
      <div className="relative z-10">
        {/* Header Section */}
        <div className="bg-white text-gray-800 py-20 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-6 mb-10">
              <img 
                src="/flappy pi gif/flappy-2.gif.gif" 
                alt="Flappy Pi Logo" 
                className="w-20 h-20 rounded-full shadow-lg"
                onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }}
              />
              <h1 className="text-5xl md:text-6xl font-extrabold">Flappy Pi Web3 Whitepaper</h1>
            </div>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-10">
              Revolutionary Web3 play-to-earn gaming on Pi Network
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-base font-medium">Web3 Gaming</span>
              <span className="bg-purple-100 text-purple-800 px-6 py-3 rounded-full text-base font-medium">NFT Collectibles</span>
              <span className="bg-green-100 text-green-800 px-6 py-3 rounded-full text-base font-medium">DeFi Integration</span>
              <span className="bg-orange-100 text-orange-800 px-6 py-3 rounded-full text-base font-medium">Play-to-Earn</span>
            </div>
          </div>
        </div>


        {/* Back Button */}
        <div className="max-w-4xl mx-auto p-6 -mt-8 relative z-20">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-6 bg-white/90 hover:bg-white border-gray-300 text-gray-700 hover:text-gray-900 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-6 relative z-20">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Section 1: Introduction */}
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                  <h2 className="text-4xl font-bold text-gray-800">Introduction</h2>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border-l-4 border-green-500 shadow-lg">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    Flappy Pi is a revolutionary Web3 play-to-earn mobile game built exclusively for the Pi Network ecosystem. 
                    Inspired by the classic Flappy Bird, it combines addictive gameplay with real crypto rewards, NFTs, 
                    blockchain technology, and social competition. Our mission is to pioneer the future of Web3 gaming, 
                    bringing fun, fairness, and financial empowerment to millions of Pi users worldwide through innovative blockchain features.
                  </p>
                </div>
              </section>

              {/* Section 2: Vision & Mission */}
              <section className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                  <h2 className="text-4xl font-bold text-gray-800">Vision & Mission</h2>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border-l-4 border-green-500 shadow-lg">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    We envision a world where anyone can earn real value by playing skill-based games. Flappy Pi aims to be 
                    the flagship Web3 game of the Pi Network, pioneering fair play, transparent rewards, true digital ownership, 
                    and a vibrant player-driven economy powered by blockchain technology.
                  </p>
                </div>
              </section>

              {/* Section 3: Web3 Gameplay Overview */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
                  <h2 className="text-3xl font-bold text-gray-800">Web3 Gameplay Overview</h2>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-500">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🎮</div>
                        <span className="font-semibold text-gray-800">Classic, Endless, and Challenge modes</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">💰</div>
                        <span className="font-semibold text-gray-800">Earn Pi and Flappy Coins</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🎨</div>
                        <span className="font-semibold text-gray-800">NFT Collectibles</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">⚔️</div>
                        <span className="font-semibold text-gray-800">Multiplayer PvP Battles</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🧬</div>
                        <span className="font-semibold text-gray-800">Breeding System</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🃏</div>
                        <span className="font-semibold text-gray-800">NFT Trading Cards</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✨</div>
                        <span className="font-semibold text-gray-800">Evolution Mechanics</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🥚</div>
                        <span className="font-semibold text-gray-800">Egg System</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">🏆</div>
                        <span className="font-semibold text-gray-800">Global Tournaments</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">👥</div>
                        <span className="font-semibold text-gray-800">Social Features</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Section 4: Web3 Tokenomics & Economy */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">4</div>
                  <h2 className="text-3xl font-bold text-gray-800">Web3 Tokenomics & Economy</h2>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-l-4 border-yellow-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/70 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">π</div>
                          <h3 className="font-bold text-gray-800">Pi Token</h3>
                        </div>
                        <p className="text-sm text-gray-600">Primary blockchain currency for all transactions, rewards, and marketplace activities</p>
                      </div>
                      <div className="bg-white/70 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">F</div>
                          <h3 className="font-bold text-gray-800">Flappy Pi Token (FPT)</h3>
                        </div>
                        <p className="text-sm text-gray-600">Utility token for breeding, evolution, and special game mechanics</p>
                      </div>
                      <div className="bg-white/70 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
                          <h3 className="font-bold text-gray-800">Flappy Coins (FC)</h3>
                        </div>
                        <p className="text-sm text-gray-600">In-game currency earned by playing, used for upgrades and power-ups</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/70 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🎨</div>
                          <h3 className="font-bold text-gray-800">NFT Marketplace</h3>
                        </div>
                        <p className="text-sm text-gray-600">Trade Flappy skins, cards, and collectibles for Pi</p>
                      </div>
                      <div className="bg-white/70 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🔄</div>
                          <h3 className="font-bold text-gray-800">Token Swapping</h3>
                        </div>
                        <p className="text-sm text-gray-600">Convert FPT to Pi and vice versa through DEX integration</p>
                      </div>
                      <div className="bg-white/70 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🏦</div>
                          <h3 className="font-bold text-gray-800">Staking & Governance</h3>
                        </div>
                        <p className="text-sm text-gray-600">Stake tokens to earn rewards and vote on game updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Section 5: Web3 Features & Blockchain Integration */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">5</div>
                  <h2 className="text-3xl font-bold text-gray-800">Web3 Features & Blockchain Integration</h2>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 rounded-xl border-l-4 border-indigo-500">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">🎨</div>
                          <span className="font-semibold text-sm text-gray-800">NFT Collectibles</span>
                        </div>
                        <p className="text-xs text-gray-600">Unique Flappy skins, trading cards, and digital assets</p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">🧬</div>
                          <span className="font-semibold text-sm text-gray-800">Breeding System</span>
                        </div>
                        <p className="text-xs text-gray-600">Create new Flappy variants with unique traits</p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs">✨</div>
                          <span className="font-semibold text-sm text-gray-800">Evolution Mechanics</span>
                        </div>
                        <p className="text-xs text-gray-600">Transform Flappies into rare forms</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">🥚</div>
                          <span className="font-semibold text-sm text-gray-800">Egg System</span>
                        </div>
                        <p className="text-xs text-gray-600">Hatch rare Flappies with special genetic traits</p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">⚔️</div>
                          <span className="font-semibold text-sm text-gray-800">Multiplayer PvP</span>
                        </div>
                        <p className="text-xs text-gray-600">Real-time battles with Pi rewards and NFT prizes</p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">👥</div>
                          <span className="font-semibold text-sm text-gray-800">Guild System</span>
                        </div>
                        <p className="text-xs text-gray-600">Form alliances, share resources, and compete together</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">🏘️</div>
                          <span className="font-semibold text-sm text-gray-800">Land Ownership</span>
                        </div>
                        <p className="text-xs text-gray-600">Own virtual land plots in the Flappy Pi metaverse</p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">🏦</div>
                          <span className="font-semibold text-sm text-gray-800">DeFi Integration</span>
                        </div>
                        <p className="text-xs text-gray-600">Yield farming, liquidity mining, and staking rewards</p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🤖</div>
                          <span className="font-semibold text-sm text-gray-800">Smart Contracts</span>
                        </div>
                        <p className="text-xs text-gray-600">Automated breeding, evolution, and reward distribution</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Section 6: Web3 Development Roadmap */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">6</div>
                  <h2 className="text-3xl font-bold text-gray-800">Web3 Development Roadmap</h2>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border-l-4 border-emerald-500">
                  <div className="space-y-6">
                    {/* Q4 2025 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">Q4</div>
                        <h3 className="text-lg font-bold text-gray-800">Q4 2025 - Core DeFi Launch</h3>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Coming Soon</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Mainnet smart contract launch
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Pi NFT marketplace
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Global tournaments
                        </div>
                      </div>
                    </div>

                    {/* Q1 2026 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">Q1</div>
                        <h3 className="text-lg font-bold text-gray-800">Q1 2026 - Token & Breeding</h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Planned</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          FPT token launch
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Breeding system
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Evolution mechanics
                        </div>
                      </div>
                    </div>

                    {/* Q2 2026 */}
                    <div className="bg-white/70 p-4 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">Q2</div>
                        <h3 className="text-lg font-bold text-gray-800">Q2 2026 - Multiplayer & Governance</h3>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Planned</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Multiplayer PvP battles
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Guild system
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          DAO governance launch
                        </div>
                      </div>
                    </div>

                    {/* DeFi Integration */}
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border border-yellow-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">💰</div>
                        <h3 className="text-lg font-bold text-gray-800">Q4 2025 - Q1 2026 - DeFi Integration</h3>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Depends on Pi Core</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Timeline depends on Pi Core team progress</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          DeFi integration
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Staking rewards
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Liquidity mining
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Section 7: Web3 Long-Term Vision */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">7</div>
                  <h2 className="text-3xl font-bold text-gray-800">Web3 Long-Term Vision</h2>
                </div>
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl border-l-4 border-rose-500">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Flappy Pi aims to become the leading Web3 play-to-earn platform on Pi Network, empowering players with 
                    true digital ownership, community governance, and innovative blockchain gameplay. Our vision is to create 
                    a sustainable, player-owned economy that bridges gaming, blockchain, and real-world value for millions 
                    globally through cutting-edge Web3 technology.
                  </p>
                </div>
              </section>

              {/* Section 8: NFT Collections & Collectibles */}
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">8</div>
                  <h2 className="text-3xl font-bold text-gray-800">NFT Collections & Collectibles</h2>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border-l-4 border-indigo-500">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">🎨</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Flappy Skins</h3>
                          <p className="text-sm text-gray-600">Unique, tradeable character skins with special abilities</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">🃏</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Trading Cards</h3>
                          <p className="text-sm text-gray-600">Collectible cards with stats, abilities, and rarity levels</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm">✨</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Evolution Forms</h3>
                          <p className="text-sm text-gray-600">Rare evolved Flappies with enhanced capabilities</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm">🧬</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Breeding Results</h3>
                          <p className="text-sm text-gray-600">Unique offspring from breeding different Flappy types</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">🏘️</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Land NFTs</h3>
                          <p className="text-sm text-gray-600">Virtual land plots in the Flappy Pi metaverse</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">⚔️</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Equipment</h3>
                          <p className="text-sm text-gray-600">Wings, accessories, and power-ups as tradeable NFTs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">🏆</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Tournament Rewards</h3>
                          <p className="text-sm text-gray-600">Exclusive NFTs from competitions and events</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">🎁</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Seasonal Collections</h3>
                          <p className="text-sm text-gray-600">Limited-time NFT drops and special editions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section className="mb-8">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-xl">
                  <h2 className="text-2xl font-bold mb-4 text-center">Join the Flappy Pi Revolution!</h2>
                  <p className="text-center text-green-100 mb-6 max-w-2xl mx-auto">
                    Be part of the future of Web3 gaming. Contact us for partnerships, collaborations, and community involvement.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">📧 Official Email</h3>
                      <a href="mailto:support@www.flappypi.xyz" className="text-green-200 hover:text-white underline">support@www.flappypi.xyz</a>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">🌐 Website</h3>
                      <a href="https://www.flappypi.xyz" className="text-green-200 hover:text-white underline">www.flappypi.xyz</a>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      {/* Footer NPC */}
      <FooterNPC
        npcType="default"
        npcName="Flappy Pi Guide"
        dialogs={whitepaperNpcDialogs}
      />
      
      <EnhancedFooter
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </div>
  );
} 