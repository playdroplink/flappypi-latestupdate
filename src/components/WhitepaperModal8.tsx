import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] z-[9999] bg-gradient-to-b from-sky-100 to-blue-100 rounded-2xl shadow-2xl border-4 border-blue-300 flex flex-col p-0 overflow-y-auto">
        <DialogHeader className="p-6 rounded-t-xl bg-blue-200/50 border-b-2 border-blue-300 sticky top-0">
          <div className="flex items-center gap-4">
            <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Mascot" className="w-20 h-20 drop-shadow-xl" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
            <div>
              <DialogTitle className="text-4xl font-extrabold text-blue-800 tracking-tight">Flappy Pi Web3 Whitepaper</DialogTitle>
              <DialogDescription className="text-lg text-blue-600 mt-1">
                The Future of Web3 Gaming on the Pi Network
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-grow p-8 text-gray-800 text-lg leading-relaxed">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">1. Web3 Introduction</h2>
              <p>Flappy Pi is a revolutionary Web3 play-to-earn (P2E) game built exclusively on the Pi Network, combining addictive gameplay with a robust, decentralized economy. Our mission is to pioneer the future of Web3 gaming, providing a fun, fair, and rewarding experience for all players, powered by blockchain technology and the Pi cryptocurrency.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">2. Web3 Vision & Mission</h2>
              <p><strong>Vision:</strong> To become the leading Web3 gaming platform on the Pi Network, fostering a vibrant community and showcasing the power of blockchain technology for everyday gaming and transactions.</p>
              <p><strong>Mission:</strong> To create a sustainable Web3 ecosystem where players are rewarded for their skill and engagement, with true digital ownership, community governance, and innovative blockchain features.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">3. Web3 Gameplay & Features</h2>
              <p>Flappy Pi offers classic, addictive gameplay with cutting-edge Web3 features. Players navigate their bird through obstacles to earn Pi tokens, Flappy Coins, and unique NFTs, creating a comprehensive blockchain gaming experience.</p>
              <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                <li><strong>Multiple Game Modes:</strong> Classic, Endless, and Challenge modes with blockchain-verified scores.</li>
                <li><strong>NFT Collectibles:</strong> Unique, tradable bird skins, trading cards, and digital assets.</li>
                <li><strong>Breeding System:</strong> Create new Flappy variants with unique traits and abilities.</li>
                <li><strong>Multiplayer PvP:</strong> Real-time battles with Pi rewards and NFT prizes.</li>
                <li><strong>Evolution Mechanics:</strong> Transform Flappies into rare forms through gameplay.</li>
                <li><strong>Egg System:</strong> Hatch rare Flappies with special genetic traits.</li>
                <li><strong>Guild System:</strong> Form alliances, share resources, and compete together.</li>
                <li><strong>Tournament Mode:</strong> Compete in global tournaments with massive Pi prizes.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">4. Web3 Tokenomics & Economy</h2>
              <p className="mb-2">Flappy Pi uses a comprehensive multi-token system designed for fairness, transparency, and future growth within the Pi Network ecosystem:</p>
              <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                <li>
                  <b>Pi Token:</b> <span className="text-gray-700">The primary blockchain currency for all transactions, rewards, and marketplace activities.</span>
                </li>
                <li>
                  <b>Flappy Pi Token (FPT):</b> <span className="text-gray-700">Utility token for breeding, evolution, and special game mechanics. Can be swapped with Pi through DEX integration.</span>
                </li>
                <li>
                  <b>Flappy Coins (FC):</b> <span className="text-gray-700">In-game currency earned by playing, used for upgrades, skins, and power-ups.</span>
                </li>
                <li>
                  <b>NFT Marketplace:</b> <span className="text-gray-700">Trade Flappy skins, cards, and collectibles for Pi tokens.</span>
                </li>
                <li>
                  <b>Staking Rewards:</b> <span className="text-gray-700">Stake Pi tokens to earn additional rewards and exclusive NFTs.</span>
                </li>
                <li>
                  <b>Governance Tokens:</b> <span className="text-gray-700">Vote on game updates and new features through DAO governance.</span>
                </li>
              </ul>
            </section>
             <section>
              <h2 className="text-2xl font-bold text-blue-700 mb-3 border-b-2 border-blue-300 pb-2">5. Web3 Development Roadmap</h2>
              <p>Our Web3 development roadmap is ambitious and community-focused. Key milestones include:</p>
              <ul className="list-disc list-inside space-y-2 mt-4 pl-4">
                <li><strong>Q4 2025:</strong> Mainnet smart contract launch, Pi NFT marketplace, and global tournaments.</li>
                <li><strong>Q1 2026:</strong> Flappy Pi Token (FPT) launch, breeding system, and evolution mechanics.</li>
                <li><strong>Q2 2026:</strong> Multiplayer PvP battles, guild system, and DAO governance launch.</li>
                <li><strong>Q4 2025 - Q1 2026:</strong> DeFi integration, staking rewards, and liquidity mining (timeline depends on Pi Core team progress).</li>
                <li><strong>Q3 2026:</strong> Virtual land ownership, metaverse expansion, and cross-game assets.</li>
                <li><strong>Q4 2026:</strong> AR/VR gameplay, advanced breeding mechanics, and rare NFT collections.</li>
                <li><strong>Q1 2027:</strong> Full metaverse launch, persistent world, and real-world integrations.</li>
                <li><strong>2026 and Beyond:</strong> Major Web3 Feature Releases:
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
        <DialogFooter className="p-4 bg-blue-200/50 border-t-2 border-blue-300 rounded-b-xl sticky bottom-0">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhitepaperModal; 