import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const PartnershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPlaying, currentTrack } = useGlobalMusic();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 relative z-10 bg-gradient-to-b from-purple-400 to-indigo-600">
      <BackgroundDecoration />
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
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Flappy Pi Partnerships</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">We welcome collaborations and partnerships with projects, communities, and brands aligned with our vision. Reach out to join the Flappy Pi journey!</p>

        <div className="bg-white/60 shadow-lg p-8 w-full text-blue-900">
          <h2 className="text-2xl font-bold mb-4">Become a Partner</h2>
          <p className="text-lg mb-2">Email: <a href="mailto:support@www.flappypi.xyz" className="underline text-blue-700">support@www.flappypi.xyz</a></p>
          <p className="text-lg mb-4">Website: <a href="https://www.flappypi.xyz" className="underline text-blue-700">www.flappypi.xyz</a></p>
          <p className="text-sm mt-4 text-blue-800">Coming soon: <span className="font-semibold">flappy.pi</span> domain</p>
        </div>
      </div>
    </div>
  );
};

export default PartnershipPage; 