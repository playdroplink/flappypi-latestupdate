import React from 'react';
// import HomeHeader from '../components/home/HomeHeader'; // Removed
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const PressPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  const { isPlaying, currentTrack } = useGlobalMusic();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="bg-white/90 shadow-xl p-8 w-full flex flex-col items-center relative mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" lazy={true} />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Flappy Pi Press Kit</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Download our logo, screenshots, and press release for media use.</p>

        <div className="bg-white/60 rounded-xl shadow-lg p-8 w-full text-blue-900">
          <h2 className="text-2xl font-bold mb-4">Media Assets</h2>
          <div className="flex gap-4 flex-wrap mb-4 justify-center">
            <a href="/flappy-logo.png" download className="hover:scale-110 transition-transform"><ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-24 h-24 rounded-xl" lazy={true} /></a>
            <a href="/flappycoins.png" download className="hover:scale-110 transition-transform"><ImageWithFallback src="/flappycoins.png" alt="Flappy Coins" className="w-24 h-24 rounded-xl" lazy={true} /></a>
            <a href="/birds/blue-bird.png" download className="hover:scale-110 transition-transform"><ImageWithFallback src="/birds/blue-bird.png" alt="Blue Bird" className="w-24 h-24 rounded-xl" lazy={true} /></a>
          </div>
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition-all duration-300 shadow-md">
            <a href="#" download>Download All Assets (zip)</a>
          </Button>
        </div>

        <Card className="w-full mt-8 bg-white/60 rounded-xl shadow-lg p-8 text-blue-900">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold">Sample Press Release</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h3 className="text-xl font-semibold mb-2">Flappy Pi Launches on the Pi Network</h3>
            <p className="mb-4">Flappy Pi, the most addictive tap-to-fly arcade game, is now available on the Pi Network. Players can compete, earn Pi cryptocurrency, and join a growing community of Pi gamers. Download the press kit for more information and assets.</p>
            <p className="text-sm text-blue-700">Contact: press@flappypi.fun</p>
          </CardContent>
        </Card>
      </div>
    </SkyBackground>
  );
};

export default PressPage; 