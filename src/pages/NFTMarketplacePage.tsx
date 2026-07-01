import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Sparkles, Lock, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const nftProjects = [
  {
    name: 'Flappy Pi NFT',
    description: 'Official Flappy Pi NFT collectibles. Unique birds, backgrounds, and more!',
    image: '/public/img/bird_0.png',
    comingSoon: true
  },
  {
    name: 'Scream Pi NFT',
    description: 'Scream Pi challenge NFTs. Own a piece of the loudest Pi game!',
    image: '/public/img/bird_1.png',
    comingSoon: true
  },
  {
    name: 'Dino Pi NFT',
    description: 'Dino Pi adventure NFTs. Collect rare dino skins and scenes!',
    image: '/public/img/bird_2.png',
    comingSoon: true
  }
];

const NFTMarketplacePage: React.FC = () => {
  const { isPlaying, currentTrack } = useGlobalMusic();
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-yellow-100 to-purple-100 p-4">
      {/* Hero Section */}
      <div className="w-full max-w-2xl text-center mt-10 mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-700 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          NFT Marketplace & Galleries
        </h1>
        <p className="text-lg text-gray-700 mb-2">A new way to own, buy, and sell Flappy Pi, Scream Pi, and Dino Pi NFTs is coming soon!</p>
        <Badge className="bg-yellow-400 text-purple-900 text-base px-4 py-2 rounded-xl">Coming Soon</Badge>
      </div>

      {/* NFT Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
        {nftProjects.map((nft) => (
          <Card key={nft.name} className="flex flex-col items-center p-4 shadow-lg bg-white/90">
            <CardHeader className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                <img src={nft.image} alt={nft.name} className="w-20 h-20 object-contain" onError={e => (e.currentTarget.src = '/public/img/bird_0.png')} />
              </div>
              <CardTitle className="text-xl font-bold text-purple-700 text-center">{nft.name}</CardTitle>
              <Badge className="bg-gray-300 text-gray-700 mt-2"><Lock className="w-4 h-4 mr-1 inline" /> Coming Soon</Badge>
            </CardHeader>
            <CardContent className="text-center text-gray-600 text-sm">
              {nft.description}
            </CardContent>
            <Button disabled className="w-full mt-4 bg-gradient-to-r from-purple-400 to-yellow-300 text-white font-bold cursor-not-allowed opacity-70" title="NFT trading coming soon">
              <ShoppingCart className="w-4 h-4 mr-2" /> Buy / Sell NFT
            </Button>
          </Card>
        ))}
      </div>

      {/* Future Features Section */}
      <div className="w-full max-w-2xl bg-white/80 rounded-xl p-6 mb-8 shadow-md">
        <h2 className="text-2xl font-bold text-purple-700 mb-2 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-yellow-400" />
          NFT Ownership & Marketplace
        </h2>
        <ul className="list-disc list-inside text-gray-700 text-base mb-2">
          <li>Buy, sell, and trade official Flappy Pi, Scream Pi, and Dino Pi NFTs</li>
          <li>Showcase your NFT collection in your personal gallery</li>
          <li>Prove NFT ownership and rarity on the Pi Network</li>
          <li>All transactions powered by secure Pi payments</li>
          <li>Marketplace and gallery features launching soon!</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button disabled className="flex-1 bg-gradient-to-r from-yellow-400 to-purple-400 text-white font-bold cursor-not-allowed opacity-70" title="NFT buy/sell coming soon">
            <ShoppingCart className="w-4 h-4 mr-2" /> Buy / Sell NFT (Coming Soon)
          </Button>
          <Button disabled className="flex-1 bg-gradient-to-r from-purple-400 to-yellow-400 text-white font-bold cursor-not-allowed opacity-70" title="Gallery coming soon">
            <ImageIcon className="w-4 h-4 mr-2" /> View My Gallery (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Call to Action / Waitlist */}
      <div className="w-full max-w-xl text-center mt-4 mb-10">
        <p className="text-lg text-purple-700 font-semibold mb-2">Want to be the first to know when NFT trading launches?</p>
        <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold px-8 py-3 rounded-xl shadow-lg text-lg">
          <a href="mailto:support@www.flappypi.xyz?subject=NFT%20Marketplace%20Waitlist">Join the Waitlist</a>
        </Button>
      </div>
    </div>
  );
};

export default NFTMarketplacePage; 