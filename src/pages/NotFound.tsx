import React from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
// import EnhancedFooter from '../components/EnhancedFooter'; // Removed as per new design
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusic } from '@/hooks/useGlobalMusic';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center justify-center animate-fade-in border border-white/40">
          <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-24 h-24 mb-6 drop-shadow-xl animate-bounce-slow" lazy={true} />
          <h1 className="text-4xl font-extrabold text-blue-700 mb-4">Page Not Found</h1>
          <p className="text-lg text-blue-900 mb-6 text-center">The page you're looking for doesn't exist. Here are some helpful links:</p>
          <div className="flex flex-col gap-3 w-full">
            <Button 
              onClick={() => navigate('/home')} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              🏠 Go Home
            </Button>
            <Button 
              onClick={() => navigate('/flappy-pi-blog')} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              📖 Read Blog
            </Button>
            <Button 
              onClick={() => navigate('/community')} 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              👥 Community
            </Button>
            <Button 
              onClick={() => navigate('/play')} 
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              🎮 Play Game
            </Button>
          </div>
        </div>
      </div>
    </SkyBackground>
  );
};

export default NotFound;
