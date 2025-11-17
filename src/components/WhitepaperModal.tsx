import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface WhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhitepaperModal: React.FC<WhitepaperModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-2xl shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-50 via-white to-purple-50 px-8 pt-8 pb-4 flex flex-col items-center">
          <img src="/flappy pi gif/flappy-2.gif.gif" alt="Flappy Pi Logo" className="w-16 h-16 mb-2" onError={(e) => { e.currentTarget.src = '/flappy-logo.png'; }} />
          <DialogTitle className="text-2xl font-bold text-purple-700 mb-1">Flappy Pi Web3 Whitepaper</DialogTitle>
          <DialogDescription className="text-gray-500 text-center mb-2">
            Revolutionary Web3 play-to-earn gaming on Pi Network
          </DialogDescription>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-blue-700 bg-blue-100 border-blue-200 mb-2">
            <FileText className="w-4 h-4 mr-1" /> Web3 Technical Documentation
          </Badge>
        </DialogHeader>
        
        <div className="px-8 pb-8 max-h-[60vh] overflow-y-auto text-gray-700 text-sm space-y-6">
          <section>
            <h3 className="font-bold text-lg text-purple-700 mb-2">🚀 Web3 Introduction</h3>
            <p>Flappy Pi is a revolutionary Web3 play-to-earn mobile game built exclusively for the Pi Network ecosystem. Combining addictive gameplay with real crypto rewards, NFTs, blockchain technology, and social competition.</p>
          </section>
          
          <section>
            <h3 className="font-bold text-lg text-purple-700 mb-2">🎮 Web3 Gameplay Features</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li><b>NFT Collectibles:</b> Unique Flappy skins, cards, and digital assets</li>
              <li><b>Breeding System:</b> Create new Flappy variants with unique traits</li>
              <li><b>Multiplayer PvP:</b> Real-time battles with Pi rewards and NFT prizes</li>
              <li><b>Evolution Mechanics:</b> Transform Flappies into rare forms</li>
              <li><b>Egg System:</b> Hatch rare Flappies with special genetic traits</li>
            </ul>
          </section>
          
          <section>
            <h3 className="font-bold text-lg text-purple-700 mb-2">💰 Tokenomics & Economy</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li><b>Pi Token:</b> Primary blockchain currency for all transactions</li>
              <li><b>Flappy Pi Token (FPT):</b> Utility token for breeding and evolution</li>
              <li><b>Token Swapping:</b> Convert FPT to Pi and vice versa</li>
              <li><b>Staking Rewards:</b> Stake Pi tokens to earn additional rewards</li>
              <li><b>NFT Marketplace:</b> Trade Flappy skins, cards, and collectibles</li>
            </ul>
          </section>
          
          <section>
            <h3 className="font-bold text-lg text-purple-700 mb-2">🏆 Multiplayer & Social</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li><b>Real-time PvP:</b> Battle other players for Pi rewards and NFTs</li>
              <li><b>Guild System:</b> Form alliances, share resources, and compete together</li>
              <li><b>Tournament Mode:</b> Compete in global tournaments with massive prizes</li>
              <li><b>Guild Wars:</b> Epic battles between guilds for territory and resources</li>
            </ul>
          </section>
          
          <section>
            <h3 className="font-bold text-lg text-purple-700 mb-2">🔮 Future Roadmap</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li><b>Q4 2025:</b> Mainnet smart contracts, Pi NFT marketplace, global tournaments</li>
              <li><b>Q1 2026:</b> FPT launch, breeding system, evolution mechanics</li>
              <li><b>Q2 2026:</b> Multiplayer PvP battles, guild system, DAO governance</li>
              <li><b>Q4 2025 - Q1 2026:</b> DeFi integration (depends on Pi Core team progress)</li>
            </ul>
          </section>
          
          <section>
            <h3 className="font-bold text-lg text-purple-700 mb-2">📞 Contact & Support</h3>
            <p>Join the Flappy Pi Web3 revolution! Contact us at <a href="mailto:support@flappypi.fun" className="text-blue-600 underline">support@flappypi.fun</a> for partnerships, collaborations, and community involvement.</p>
          </section>
        </div>
        
        <DialogFooter className="flex flex-col gap-2 px-8 pb-6">
          <Button variant="default" size="lg" onClick={onClose} className="w-full text-lg">{t('close')}</Button>
        </DialogFooter>
        <div className="text-center text-xs text-gray-400 pb-4">Powered by Pi Network</div>
      </DialogContent>
    </Dialog>
  );
};

export default WhitepaperModal; 