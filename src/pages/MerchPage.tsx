import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shirt, Monitor, Gift } from 'lucide-react';
import FooterNPC from '../components/FooterNPC';
import EnhancedFooter from '../components/EnhancedFooter';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusic } from '../hooks/useGlobalMusic';


const MerchPage: React.FC = () => {
  const navigate = useNavigate();

  // Local state for music and sound toggles
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { settings } = useSettings();
  const { isPlaying, currentTrack } = useGlobalMusic(true);
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 pb-32 relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-purple-700 hover:bg-purple-100 rounded-full p-2 z-20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-700 mb-4 mt-8 text-center drop-shadow-lg">Flappy Pi Merch Store</h1>
        <p className="text-lg text-purple-800 mb-8 text-center">Official Flappy Pi merchandise is coming soon! Stay tuned for exclusive drops and digital goodies.</p>
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          {/* T-Shirts Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-2 border-yellow-200">
            <Shirt className="w-14 h-14 text-yellow-500 mb-2" />
            <h2 className="text-xl font-bold text-purple-700 mb-1">T-Shirts</h2>
            <p className="text-sm text-gray-700 text-center mb-2">Wear your love for Flappy Pi! Official T-shirts in fun designs and all sizes.</p>
            <span className="text-xs text-yellow-600 font-semibold">Coming Soon</span>
          </div>
          {/* Digital Products Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-2 border-purple-200">
            <Monitor className="w-14 h-14 text-purple-500 mb-2" />
            <h2 className="text-xl font-bold text-purple-700 mb-1">Digital Products</h2>
            <p className="text-sm text-gray-700 text-center mb-2">Exclusive wallpapers, avatars, and downloadable content for your devices.</p>
            <span className="text-xs text-purple-600 font-semibold">Coming Soon</span>
          </div>
          {/* Mystery Merch Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border-2 border-pink-200 sm:col-span-2">
            <Gift className="w-14 h-14 text-pink-500 mb-2" />
            <h2 className="text-xl font-bold text-pink-700 mb-1">More Surprises</h2>
            <p className="text-sm text-gray-700 text-center mb-2">Collectibles, stickers, and more Flappy Pi fun are on the way!</p>
            <span className="text-xs text-pink-600 font-semibold">Stay Tuned</span>
          </div>
        </div>
        <div className="mt-8 w-full flex flex-col items-center">
          <FooterNPC
            npcType="default"
            npcName="Merch NPC"
            dialogs={[
              "Welcome to the Flappy Pi Merch Store!",
              "Show your Flappy Pi pride with our merch!",
              "We have awesome Flappy Pi clothing!",
              "Wear your love for Flappy Pi!",
              "Our merch is high quality and comfortable!",
              "Perfect gifts for Flappy Pi fans!",
              "Limited edition items available!",
              "Support the Flappy Pi community!",
              "Our merch is designed by Flappy Pi fans!",
              "Wear your favorite game with pride!",
              "Comfortable and stylish Flappy Pi gear!",
              "Perfect for gaming sessions!",
              "Our merch is made with care!",
              "Show off your Flappy Pi spirit!",
              "Great conversation starters!",
              "Our merch is always in style!",
              "Perfect for any occasion!",
              "High-quality materials used!",
              "Our merch is affordable and cool!",
              "Wear your passion for Flappy Pi!",
              "Our merch is designed for comfort!",
              "Perfect for Flappy Pi enthusiasts!",
              "Our merch is always fashionable!",
              "Great for gifts and personal use!",
              "Our merch is made to last!",
              "Show your Flappy Pi loyalty!",
              "Our merch is always trending!",
              "Perfect for the whole family!",
              "Our merch is designed with love!",
              "Welcome to the Flappy Pi merch family!"
            ]}
          />
        </div>
      </div>
      <EnhancedFooter 
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    </SkyBackground>
  );
};

export default MerchPage; 