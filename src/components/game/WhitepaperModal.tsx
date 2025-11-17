import React from 'react';
import { Button } from '@/components/ui/button';

interface WhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DoorSVG = ({ size = 96 }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="15" width="40" height="55" rx="6" fill="#ffe066" stroke="#e2c290" strokeWidth="5" />
    <rect x="18" y="40" width="8" height="15" rx="2" fill="#e2c290" />
    <circle cx="44" cy="55" r="3" fill="#e2c290" />
  </svg>
);

const WhitepaperModal: React.FC<WhitepaperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-sky-100 to-blue-100 rounded-2xl shadow-2xl border-4 border-blue-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-blue-200/50 border-b-2 border-blue-300 flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src="/flappy-logo.png" alt="Flappy Pi Mascot" className="w-20 h-20 drop-shadow-xl" />
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">Flappy Pi Whitepaper</h1>
              <p className="text-lg text-blue-600 mt-1">
                The Future of Decentralized Gaming on the Pi Network
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-3xl font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 text-gray-800 text-lg leading-relaxed">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">1. Introduction</h2>
              <p>Flappy Pi is a revolutionary play-to-earn (P2E) game built on the Pi Network, combining addictive gameplay with a robust, decentralized economy. Our mission is to provide a fun, fair, and rewarding experience for all players, powered by the Pi cryptocurrency.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">2. Vision & Mission</h2>
              <p><strong>Vision:</strong> To become the leading decentralized gaming application on the Pi Network, fostering a vibrant community and showcasing the power of Pi for everyday transactions.</p>
              <p><strong>Mission:</strong> To create a sustainable P2E ecosystem where players are rewarded for their skill and engagement, and to continuously innovate with new features, game modes, and community-driven events.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">3. Gameplay & Features</h2>
              <p>Flappy Pi offers classic, addictive gameplay with a modern twist. Players navigate their bird through obstacles to earn Flappy Coins, which can be used for in-game purchases, power-ups, and character customizations.</p>
              <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                <li><strong>Multiple Game Modes:</strong> Classic, Endless, and Challenge modes to test your skills.</li>
                <li><strong>NFT Integration:</strong> Unique, tradable bird skins and items as NFTs.</li>
                <li><strong>Power-Ups & Shop:</strong> Use your earnings to buy advantages and cosmetic items.</li>
                <li><strong>Leaderboards & Tournaments:</strong> Compete for high scores and valuable Pi prizes.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">4. Tokenomics</h2>
              <p className="mb-2">Flappy Pi uses a dual-currency system designed for fairness, transparency, and future growth within the Pi Network ecosystem:</p>
              <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                <li>
                  <b>Pi:</b> <span className="text-gray-700">The only blockchain currency used in Flappy Pi. All smart contracts and transactions are exclusively on the Pi Network mainnet. <b>No other blockchains or cross-chain features are supported.</b></span>
                </li>
                <li>
                  <b>Flappy Coins (FC):</b> <span className="text-gray-700">Earned by playing, used for in-game upgrades, skins, and power-ups. <b>Flappy Coins cannot be converted to Pi at this time and are only usable for in-game assets.</b> If and when Pi Network supports smart contracts, a conversion mechanism may be considered in the future, subject to Pi Network's Mainnet policies.</span>
                </li>
                <li>
                  <b>NFTs:</b> <span className="text-gray-700">Unique Flappy skins and collectibles, to be issued as Pi Network NFTs when smart contracts are available. <b>All NFTs will be Pi Network native.</b></span>
                </li>
              </ul>
            </section>
             <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">5. Roadmap</h2>
              <p>Our development roadmap is ambitious and community-focused. Key milestones include:</p>
              <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                <li><strong>June 2025:</strong> Launch of NFT Marketplace & Player-to-Player Trading.</li>
                <li><strong>Q4 2025:</strong> Introduction of Seasonal Events & Special Edition Birds.</li>
                <li><strong>Q1 2026:</strong> Expansion of Game Modes & Cross-Platform Support.</li>
                <li><strong>Q2 2026:</strong> Governance Token Launch & DAO for community voting.</li>
                <li><strong>2026 and Beyond:</strong> Major Feature Releases:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Battle Royal Mode (100 players)</li>
                    <li>Speed Run Challenges</li>
                    <li>Co-op Multiplayer Mode</li>
                    <li>Daily Dungeon Raids</li>
                    <li>Seasonal Events & Tournaments</li>
                    <li>NFT Character Trading</li>
                    <li>Augmented Reality Mode</li>
                    <li>Voice Commands Control</li>
                    <li>Social Guild System</li>
                    <li>Cross-Platform Cloud Saves</li>
                  </ul>
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">6. Future Features</h2>
              <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                <li>Player-to-Player Trading</li>
                <li>Seasonal Events & Special Edition Birds</li>
                <li>Cross-Platform Play</li>
                <li>DAO & Community Governance</li>
                <li>Augmented Reality Mode</li>
                <li>Social Guild System</li>
                <li>And much more...</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-purple-700 mb-3 border-b-2 border-purple-300 pb-2">🆕 New Game Modes for Flappy Pi</h2>
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">1. 🎯 Target Mode – "Pipe Hunter"</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Hit target rings inside pipes for bonus scores.</li>
                    <li>Perfect/Good/Pass = Score Multipliers</li>
                    <li>Precision-based gameplay with combo effects.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">2. 💣 Time Bomb Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Beat a countdown timer by passing enough pipes.</li>
                    <li>Timer resets slightly after each pipe.</li>
                    <li>High pressure = high reward.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">3. 🌪️ Wind Storm Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Wind pushes Flappy Pi left or right.</li>
                    <li>Gust direction changes randomly.</li>
                    <li>Weather effects: swaying trees, clouds.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">4. 🌀 Gravity Flip Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Gravity switches every 10 seconds.</li>
                    <li>Bird flies on ceiling or floor.</li>
                    <li>Pipes adjust based on gravity.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">5. 🌑 Night Flight Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Dark screen with spotlight around bird.</li>
                    <li>Limited visibility.</li>
                    <li>Uses sound and glowing pipe edges.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">6. ⚡ Speed Rush Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Game starts slow, but speed increases over time.</li>
                    <li>Pipes move faster, gaps shrink.</li>
                    <li>Score = time survived.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">7. 🧊 Ice Slide Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Frozen world: Flappy slides when landing.</li>
                    <li>Pipes slowly slide horizontally.</li>
                    <li>Snow particle effects and slipperiness.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">8. 🔥 Lava Escape Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Lava rises from bottom of screen.</li>
                    <li>Pipes are static, player must go upward.</li>
                    <li>Vertical climb mode.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">9. 🛡️ Shield Run Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>You start with a shield (1 hit protection).</li>
                    <li>More shields appear as power-ups.</li>
                    <li>Pipes become more dangerous over time.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">10. 🔄 Reverse Control Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Tapping makes Flappy fall instead of rise.</li>
                    <li>Total mind-bender mode.</li>
                    <li>Alternate physics with same obstacles.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">11. 🧠 Precision Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Pipes are extremely close together.</li>
                    <li>Jump power is slightly weaker.</li>
                    <li>High difficulty, high multiplier.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">12. 🎭 Mystery Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Random effects every 15 seconds:</li>
                    <ul className="list-disc list-inside ml-10">
                      <li>Gravity Flip</li>
                      <li>Wind</li>
                      <li>Speed Boost</li>
                      <li>Dark Mode</li>
                    </ul>
                    <li>Pure chaos — and fun.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">13. 🪂 Flappy Drop Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Start at high altitude.</li>
                    <li>No pipes — avoid obstacles while falling.</li>
                    <li>Use glider-like motion.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">14. 🚧 Obstacle Zone</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Pipes are replaced by other moving obstacles:</li>
                    <ul className="list-disc list-inside ml-10">
                      <li>Rotating spikes</li>
                      <li>Horizontal lasers</li>
                      <li>Saws</li>
                    </ul>
                    <li>Dodge-based mode, like Flappy + Geometry Dash.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">15. 📦 Crate Crash Mode</h3>
                  <ul className="list-disc list-inside ml-6">
                    <li>Pipes drop random crates that block gaps.</li>
                    <li>Tap crates to destroy them mid-air.</li>
                    <li>Score extra if you destroy crates.</li>
                  </ul>
                </div>
              </div>
            </section>
            <div className="flex flex-col items-center justify-center mt-12 mb-4">
              <span className="mb-2 animate-bounce" style={{ filter: 'drop-shadow(0 4px 12px #60a5fa88)' }}><DoorSVG size={96} /></span>
              <div className="text-xl font-bold text-blue-700 mt-2">A New Door Opens Soon...</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-blue-200/50 border-t-2 border-blue-300 flex-shrink-0">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperModal; 
