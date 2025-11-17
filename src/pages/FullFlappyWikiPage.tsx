import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

import { Info, Star, Award, Zap, User, BookOpen, Settings, HelpCircle, Users, Gift, Shield, TrendingUp, ExternalLink, Trophy, Key, Feather, Home, Menu, X } from 'lucide-react';
import EnhancedFooter from '../components/EnhancedFooter';
import FooterNPC from '../components/FooterNPC';

declare global {
  interface Window {
    __flappyGlobalMusic?: HTMLAudioElement | null;
  }
}

const quickLinks = [
  { label: 'Getting Started', href: '#getting-started' },
  { label: 'Game Modes', href: '#game-modes' },
  { label: 'Shops & Marketplace', href: '#shops' },
  { label: 'Wallet & Pi Payments', href: '#wallet' },
  { label: 'Inventory & Skins', href: '#inventory' },
  { label: 'Power-Ups', href: '#power-ups' },
  { label: 'Subscriptions', href: '#subscriptions' },
  { label: 'Leaderboards', href: '#leaderboards' },
  { label: 'Rewards & Achievements', href: '#rewards' },
  { label: 'Community & Wiki', href: '#community' },
  { label: 'Settings & Privacy', href: '#settings' },
  { label: 'Troubleshooting & Support', href: '#troubleshooting' },
  { label: 'Patch Notes & Updates', href: '#patch-notes' },
  { label: 'Developer Notes', href: '#dev-notes' },
  { label: 'External Resources', href: '#external' },
  { label: 'FAQ', href: '#faq' },
];

export default function FullFlappyWikiPage({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }: { musicEnabled: boolean, setMusicEnabled: (enabled: boolean) => void, soundEnabled: boolean, setSoundEnabled: (enabled: boolean) => void }) {
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const [npcVisible, setNpcVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqVisible, setFaqVisible] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => setNpcVisible(true), 300);
    setTimeout(() => setFaqVisible(true), 800);
  }, []);

  const navIcons = [
    <Home size={18} />, <BookOpen size={18} />, <Gift size={18} />, <Zap size={18} />, <User size={18} />, <Shield size={18} />, <Award size={18} />, <Trophy size={18} />, <Star size={18} />, <Users size={18} />, <Settings size={18} />, <HelpCircle size={18} />, <TrendingUp size={18} />, <Info size={18} />, <ExternalLink size={18} />, <Key size={18} />
  ];
  const wikiDialogs = [
    "Welcome to the Flappy Wiki! Ask me anything.",
    "Want info on a skin? I got you.",
    "What's that power-up do? Let me explain.",
    "I know all about game tips and tricks!",
    "Tap a character to see full details.",
    "Curious about rarities? I'll break it down!",
    "The Wiki is your knowledge nest.",
    "Ask about boost types, rarity, or lore!",
    "Wondering how to unlock secret items?",
    "Every flap fact lives here!",
    "Did you know… there's a secret bird?",
    "The Wiki grows with each update!",
    "Explore game history and characters.",
    "Ask me how to earn coins faster!",
    "Want the story behind Flappy Pi?",
    "I'm full of fun facts and secrets!",
    "Here's how to evolve your skin.",
    "Power-up stacking? Learn more here.",
    "Need a tutorial refresher?",
    "Rarity tiers explained — ask me!",
    "All character stats live here!",
    "Unlockables and how to find them.",
    "What's a Pi Drop? Find out here!",
    "Learn how to flap like a master.",
    "Where are the best coin zones?",
    "Game mechanics simplified!",
    "Want to speedrun levels? Tips here!",
    "Flap physics explained 🤓",
    "Lore? I've got plenty!",
    "This Wiki knows everything but I don't know your name.",
    "Ask me anything — even Pi trivia!",
    "Wonder how power-ups work together?",
    "Learn what's new in the latest patch!",
    "Community tips updated weekly!",
    "Know your enemy: The Pipes!",
    "What happens after 100 pipes?",
    "Get the most out of each run.",
    "Want a perfect start? I'll help!",
    "Game dev notes? They're in here too!",
    "Bird stats, skin bonuses, and more!",
    "Planning your loadout? Start here.",
    "Rare item drop rates revealed!",
    "Want to beat the leaderboard? Study up!",
    "Unlock badges with Wiki help.",
    "Expert mode strategies are right here.",
    "Learn to maximize combos.",
    "This is your flap manual!",
    "Dev secrets? Maybe I know some...",
    "New to the game? Start with the basics!",
    "Wiki wings activated 🧠"
  ];

  const fullWikiDialog = [
    "Welcome to the Full Flappy Pi Wiki! I'm your comprehensive guide!",
    "This is the complete knowledge base for everything Flappy Pi!",
    "From basic controls to advanced strategies, I know it all!",
    "Explore every feature, mechanic, and secret of the game!",
    "Whether you're new or experienced, this Wiki has what you need!",
    "Find detailed guides for all game modes and features!",
    "Learn about skins, power-ups, and rare items!",
    "Master the art of flapping with expert tips!",
    "Discover hidden mechanics and advanced techniques!",
    "Get the latest updates and patch information!",
    "Understand the economy and Pi payment system!",
    "Learn about leaderboards and competitive play!",
    "Explore the community features and social aspects!",
    "Find troubleshooting guides and support information!",
    "Master your inventory and item management!",
    "Learn about subscriptions and premium features!",
    "Understand the reward system and achievements!",
    "Get tips for maximizing your coin earnings!",
    "Learn about the different rarity tiers and their value!",
    "Discover the story and lore behind Flappy Pi!",
    "Find strategies for different game modes!",
    "Learn about power-up combinations and synergies!",
    "Understand the scoring system and multipliers!",
    "Get tips for beating your high scores!",
    "Learn about seasonal events and limited items!",
    "Discover community challenges and tournaments!",
    "Understand the Pi Network integration!",
    "Learn about wallet management and security!",
    "Get tips for trading and marketplace features!",
    "Master the art of timing and precision!",
    "Learn about the different bird characters and their abilities!",
    "Understand the physics and mechanics of the game!",
    "Get tips for surviving longer and earning more!",
    "Learn about the development roadmap and future features!",
    "This Wiki is constantly updated with new information!",
    "Your journey to becoming a Flappy Pi master starts here!"
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f0f4ff 0%, #f9f7ff 100%)' }}>
      {/* Top NPC with different dialog, block element, centered, margin below */}
      <div className="w-full flex flex-col items-center mt-6 mb-8">
        <FooterNPC
          npcType="nicolas"
          npcName="Wiki NPC"
          dialogs={fullWikiDialog}
        />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 8px 32px 8px', display: 'flex', flexDirection: 'row', gap: 32, flexWrap: 'wrap' }}>
        {/* Main Content */}
        <div style={{ flex: 2, minWidth: 0, width: '100%', maxWidth: 800 }}>
          <div style={{
            background: 'linear-gradient(90deg, #f3e8ff 0%, #e0e7ff 100%)',
            borderRadius: 18,
            boxShadow: '0 4px 24px #a78bfa22',
            padding: 32,
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeInDown 0.7s',
          }}>
            <h1 style={{ color: '#9333ea', fontWeight: 800, fontSize: 36, marginBottom: 16, letterSpacing: 1 }}>Welcome to the Full Flappy Pi Wiki</h1>

            <p style={{ fontSize: 18, marginBottom: 0, color: '#6d28d9', fontWeight: 500, textAlign: 'center', maxWidth: 700 }}>
              This is your complete guide to all features, mechanics, and secrets of the Flappy Pi app. Whether you're a new player or a seasoned pioneer, you'll find everything you need to master the game, manage your wallet, and explore the Flappy Pi universe.
            </p>
          </div>

          {/* Animated Card Section Helper */}
          {[
            { id: 'getting-started', title: 'Getting Started', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Download and install the Flappy Pi app from the official source.</li>
                <li>Sign in with your Pi Network account for full features.</li>
                <li>Complete the tutorial to learn basic controls and navigation.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#9333ea" /> },
            { id: 'rarity-tiers', title: 'Rarity Tiers', content: (
              <div style={{ overflowX: 'auto', marginBottom: 0 }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e2c29033' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '12px 8px', fontWeight: 700, color: '#b45309', fontSize: 16, textAlign: 'left' }}>Rarity Tier</th>
                      <th style={{ padding: '12px 8px', fontWeight: 700, color: '#b45309', fontSize: 16, textAlign: 'left' }}>Color</th>
                      <th style={{ padding: '12px 8px', fontWeight: 700, color: '#b45309', fontSize: 16, textAlign: 'left' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#F4B400' }}>🟡 Legendary</span></td>
                      <td><span style={{ background: '#F4B400', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#F4B400</span></td>
                      <td>Ultra rare, highest value, exclusive rewards</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#A259FF' }}>🟣 Epic</span></td>
                      <td><span style={{ background: '#A259FF', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#A259FF</span></td>
                      <td>Very rare, premium perks and elemental designs</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#4FC3F7' }}>🔵 Rare</span></td>
                      <td><span style={{ background: '#4FC3F7', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#4FC3F7</span></td>
                      <td>Rare features, unique visuals, bonus effects</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#EC407A' }}>🔴 Special</span></td>
                      <td><span style={{ background: '#EC407A', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#EC407A</span></td>
                      <td>Seasonal/event-only collectibles</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#BDBDBD' }}>⚪ Common</span></td>
                      <td><span style={{ background: '#BDBDBD', color: '#333', borderRadius: 8, padding: '2px 10px' }}>#BDBDBD</span></td>
                      <td>Starters, basic flappers, free unlocks</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#FFD700' }}>✨ Mythic</span></td>
                      <td><span style={{ background: '#FFD700', color: '#333', borderRadius: 8, padding: '2px 10px' }}>#FFD700</span></td>
                      <td>Extremely rare, founder/dev-tier skins</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#7C4DFF' }}>🔮 Mystic</span></td>
                      <td><span style={{ background: '#7C4DFF', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#7C4DFF</span></td>
                      <td>Hidden/quest unlocks with secret animations</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#FF6D00' }}>🔥 Ultra</span></td>
                      <td><span style={{ background: '#FF6D00', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#FF6D00</span></td>
                      <td>Premium PvP and elite challenge rewards</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#8D6E63' }}>🌌 Ancient</span></td>
                      <td><span style={{ background: '#8D6E63', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#8D6E63</span></td>
                      <td>Time-lost skins only from dungeon relics or special codes</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#26C6DA' }}>🧪 Experimental</span></td>
                      <td><span style={{ background: '#26C6DA', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#26C6DA</span></td>
                      <td>Early-access/beta reward skins only from dev campaigns</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#00E676' }}>🌈 Shiny Variant</span></td>
                      <td><span style={{ background: '#00E676', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#00E676</span></td>
                      <td>Alternate color versions (super rare pull chance)</td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: 700, color: '#D4AF37' }}>👑 VIP</span></td>
                      <td><span style={{ background: '#D4AF37', color: '#fff', borderRadius: 8, padding: '2px 10px' }}>#D4AF37</span></td>
                      <td>Exclusive to <b>VIP members</b>, Pi premium users, includes perks & bonuses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ), icon: <Star size={20} color="#f59e42" /> },
            { id: 'game-modes', title: 'Game Modes', content: (
              <ul style={{ marginBottom: 0 }}>
                <li><b>Classic Mode:</b> The original endless flapping challenge. Compete for high scores!</li>
                <li><b>Challenge Mode:</b> Complete special levels and earn unique rewards.</li>
                <li><b>Event Modes:</b> Limited-time events with special rules and prizes.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'shops', title: 'Shops & Marketplace', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Buy skins, power-ups, and special items using Pi or Flappy Coins.</li>
                <li>Marketplace for trading rare and limited edition items.</li>
                <li>Discounts, promos, and limited-time offers available regularly.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'wallet', title: 'Wallet & Pi Payments', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Integrated Pi wallet for secure payments and transactions.</li>
                <li>Earn, spend, and withdraw Pi and Flappy Coins.</li>
                <li>All purchases and rewards are recorded on your profile.</li>
                <li>Pi Payment Flow: Select item → Confirm → Pi Browser → Approve → Return to app.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'inventory', title: 'Inventory & Skins', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>View and manage all owned skins, power-ups, and collectibles.</li>
                <li>Equip your favorite bird and customize your look.</li>
                <li>Track limited edition and rare items in your collection.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'power-ups', title: 'Power-Ups', content: (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 0 }}>
                {/* Extra Life */}
                <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e2c29033', padding: 20, textAlign: 'center' }}>
                  <img src="/powerups/Extra life.png" alt="Extra Life" style={{ width: 64, height: 64, marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#10b981', marginBottom: 6 }}>Extra Life</div>
                  <div style={{ fontSize: 15 }}>Revive instantly after crashing. Gives you a second chance to keep flapping!</div>
                </div>
                {/* Coin Magnet */}
                <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e2c29033', padding: 20, textAlign: 'center' }}>
                  <img src="/powerups/Coin Magnet.png" alt="Coin Magnet" style={{ width: 64, height: 64, marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#f59e42', marginBottom: 6 }}>Coin Magnet</div>
                  <div style={{ fontSize: 15 }}>Attracts all nearby coins to your bird for a limited time. Great for boosting your score!</div>
                </div>
                {/* 2x Coin Multiplier */}
                <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e2c29033', padding: 20, textAlign: 'center' }}>
                  <img src="/powerups/2x Coin Multiplier.png" alt="2x Coin Multiplier" style={{ width: 64, height: 64, marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#6366f1', marginBottom: 6 }}>2x Coin Multiplier</div>
                  <div style={{ fontSize: 15 }}>Doubles all coins you collect for a short period. Perfect for high-score runs!</div>
                </div>
                {/* Shield */}
                <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e2c29033', padding: 20, textAlign: 'center' }}>
                  <img src="/powerups/Shield.png" alt="Shield" style={{ width: 64, height: 64, marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#60a5fa', marginBottom: 6 }}>Shield</div>
                  <div style={{ fontSize: 15 }}>Protects you from one obstacle. Stay safe and keep flying!</div>
                </div>
                {/* Turbo Start */}
                <div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 260, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e2c29033', padding: 20, textAlign: 'center' }}>
                  <img src="/powerups/turbo-start.png" alt="Turbo Start" style={{ width: 64, height: 64, marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#fbbf24', marginBottom: 6 }}>Turbo Start</div>
                  <div style={{ fontSize: 15 }}>Gives you a burst of speed at the start of your run. Great for getting ahead early!</div>
                </div>
              </div>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'subscriptions', title: 'Subscriptions', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Ad-Free and All Skins subscription plans available.</li>
                <li>Enjoy exclusive perks, discounts, and early access to new features.</li>
                <li>Manage your subscription status in your profile.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'leaderboards', title: 'Leaderboards', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Compete globally for the highest scores and achievements.</li>
                <li>Weekly, monthly, and all-time leaderboards.</li>
                <li>Special rewards for top players.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'rewards', title: 'Rewards & Achievements', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Daily login rewards, achievement badges, and milestone bonuses.</li>
                <li>Claim free coins and special items by completing challenges.</li>
                <li>Track your progress and unlock new achievements.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'community', title: 'Community & Wiki', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Access the in-game Wiki for tips, lore, and character stories.</li>
                <li>Join the Flappy Pi community for events, news, and support.</li>
                <li>Ask questions and share strategies with other players.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'settings', title: 'Settings & Privacy', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Customize your game experience: music, sound, controls, and more.</li>
                <li>Manage privacy settings and account security.</li>
                <li>Review terms of service and privacy policy.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'troubleshooting', title: 'Troubleshooting & Support', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Check the FAQ for common issues and solutions.</li>
                <li>Contact support via the in-app help or official channels.</li>
                <li>For Pi Network account issues, visit the official Pi Network support page.</li>
                <li>Report bugs and feedback through the app or community channels.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'patch-notes', title: 'Patch Notes & Updates', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Stay tuned for the latest updates, new features, and bug fixes.</li>
                <li>Patch notes are posted in the app and on the official website.</li>
                <li>Major updates may introduce new game modes, power-ups, or events.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'dev-notes', title: 'Developer Notes', content: (
              <ul style={{ marginBottom: 0 }}>
                <li>Flappy Pi is built for the Pi Network community by passionate developers.</li>
                <li>We value your feedback and suggestions for future updates.</li>
                <li>Follow our social channels for behind-the-scenes info and dev blogs.</li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'external', title: 'External Resources', content: (
              <ul style={{ marginBottom: 0 }}>
                <li><a href="https://minepi.com/Wain2020" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Official Pi Network Website</a></li>
                <li><a href="https://minepi.com/white-paper/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Pi Network Whitepaper</a></li>
                <li><a href="https://support.minepi.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Pi Network Support</a></li>
              </ul>
            ), icon: <BookOpen size={20} color="#6366f1" /> },
            { id: 'faq', title: 'FAQ', content: (
              <div style={{ marginBottom: 0 }}>
                {[
                  {
                    question: "How do I earn Flappy Coins?",
                    answer: "Play any game mode, complete daily challenges, or watch ads to earn Flappy Coins. You can also buy them in the shop using Pi."
                  },
                  {
                    question: "How do I use Pi to buy items?",
                    answer: "Go to the shop, select an item, and choose the Pi payment option. Follow the Pi Browser payment flow to complete your purchase securely."
                  },
                  {
                    question: "What are Legendary and Epic birds?",
                    answer: "These are rare skins with special effects and bonuses. Legendary birds are the rarest and often have limited supply or are only available during special events."
                  },
                  {
                    question: "How do I unlock new characters?",
                    answer: "Earn or buy Flappy Coins, then use them in the shop to unlock new birds. Some characters may be event-exclusive or require special codes."
                  },
                  {
                    question: "Why can't I make a Pi payment?",
                    answer: "Make sure you are using the Pi Browser and are logged in to your Pi Network account. If issues persist, check your Pi balance or try again later."
                  },
                  {
                    question: "How do I contact support?",
                    answer: "Visit the 'External Resources' section for official support links, or use the in-app help button in the footer."
                  },
                  {
                    question: "Is my progress saved?",
                    answer: "Yes! Your progress, purchases, and rewards are saved to your Pi Network account and synced across devices."
                  }
                ].map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden',
                      background: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: faqVisible ? 'translateY(0)' : 'translateY(20px)',
                      opacity: faqVisible ? 1 : 0,
                      animation: faqVisible ? `slideInUp 0.5s ease-out ${index * 0.1}s both` : 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 600,
                        fontSize: 16,
                        color: '#374151',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{faq.question}</span>
                      <span
                        style={{
                          fontSize: 20,
                          color: '#9333ea',
                          transition: 'transform 0.3s ease',
                          transform: expandedFaq === index ? 'rotate(45deg)' : 'rotate(0deg)'
                        }}
                      >
                        +
                      </span>
                    </button>
                    <div
                      style={{
                        maxHeight: expandedFaq === index ? '200px' : '0',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: '#f8fafc',
                        borderTop: expandedFaq === index ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <div style={{ padding: '16px 20px', color: '#6b7280', lineHeight: 1.6 }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ), icon: <HelpCircle size={20} color="#9333ea" /> },
          ].map((section, idx) => (
            <div key={section.id} id={section.id} style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 16px #a78bfa18',
              marginBottom: 32,
              padding: 28,
              animation: `fadeInUp 0.7s ${0.1 * idx + 0.3}s both`,
              transition: 'transform 0.2s',
              willChange: 'transform',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.025)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                {section.icon}
                <h2 style={{ color: '#9333ea', fontWeight: 700, fontSize: 24, marginLeft: 12 }}>{section.title}</h2>
              </div>
              {section.content}
            </div>
          ))}
        </div>
      </div>
      {/* Right-side drawer toggle button */}
      <button
        onClick={() => setRightDrawerOpen(true)}
        style={{ 
          position: 'fixed', 
          top: '50%', 
          right: 0, 
          transform: 'translateY(-50%)', 
          zIndex: 1200, 
          background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)', 
          border: 'none', 
          borderRadius: '12px 0 0 12px', 
          padding: '16px 8px', 
          boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
        aria-label="Open navigation menu"
      >
        <BookOpen size={24} color="white" />
      </button>

      {/* Right drawer overlay */}
      {rightDrawerOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(60,0,100,0.18)', 
            zIndex: 1199,
            animation: 'fadeIn 0.3s ease-out'
          }} 
          onClick={() => setRightDrawerOpen(false)} 
        />
      )}

      {/* Right drawer menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: rightDrawerOpen ? 0 : -340,
        width: 320,
        height: '100vh',
        background: 'linear-gradient(135deg, #f4f3ff 0%, #ede9fe 100%)',
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        boxShadow: rightDrawerOpen ? '-4px 0 32px rgba(147, 51, 234, 0.3)' : '-4px 0 24px #a78bfa33',
        zIndex: 1201,
        padding: '32px 24px 24px 24px',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        display: 'flex',
        flexDirection: 'column',
        transform: rightDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
        opacity: rightDrawerOpen ? 1 : 0.8
      }}>
        <button 
          onClick={() => setRightDrawerOpen(false)} 
          style={{ 
            alignSelf: 'flex-start', 
            background: 'none', 
            border: 'none', 
            marginBottom: 16,
            padding: 8,
            borderRadius: 8,
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }} 
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(147, 51, 234, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          aria-label="Close navigation menu"
        >
          <X size={28} color="#9333ea" />
        </button>
        <h2 style={{ color: '#9333ea', fontWeight: 700, fontSize: 22, marginBottom: 16, textAlign: 'center' }}>Quick Navigation</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {quickLinks.map((link, i) => (
            <li 
              key={link.href} 
              style={{ 
                marginBottom: 16, 
                display: 'flex', 
                alignItems: 'center', 
                borderRadius: 12, 
                padding: '8px 12px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateX(0)',
                animation: rightDrawerOpen ? `slideInRight 0.3s ease-out ${i * 0.05}s both` : 'none'
              }}
              onClick={() => setRightDrawerOpen(false)}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#ede9fe';
                e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0) scale(1)';
              }}
            >
              <span style={{ marginRight: 12, transition: 'transform 0.2s ease' }}>{navIcons[i % navIcons.length]}</span>
              <a 
                href={link.href} 
                style={{ 
                  color: '#2563eb', 
                  fontWeight: 500, 
                  fontSize: 18, 
                  textDecoration: 'none', 
                  flex: 1,
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#9333ea'}
                onMouseLeave={e => e.currentTarget.style.color = '#2563eb'}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.7); }
          60% { opacity: 1; transform: scale(1.1); }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        @media (max-width: 900px) {
          .wiki-flex-row { flex-direction: column !important; gap: 0 !important; }
          .wiki-main { max-width: 100% !important; width: 100% !important; }
          .wiki-nav { max-width: 100% !important; width: 100% !important; margin-top: 24px !important; }
        }
      `}</style>
      {/* Footer NPC above the footer, centered, margin above and below */}
      <div className="w-full flex flex-col items-center mt-12 mb-2">
        <FooterNPC 
          npcType="nicolas" 
          npcName="Wiki NPC"
          dialogs={wikiDialogs} 
        />
      </div>
      <EnhancedFooter
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </div>
  );
} 