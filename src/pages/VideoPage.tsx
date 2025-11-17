import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const video = {
  name: 'Flappy Pi Gameplay Trailer',
  description: 'Watch the official Flappy Pi gameplay trailer and see how you can earn Pi while playing!',
  thumbnailUrl: 'https://flappypi.fun/assets/social-preview.jpg',
  uploadDate: '2025-06-15',
  contentUrl: 'https://www.youtube.com/watch?v=',
  embedUrl: 'https://www.youtube.com/embed/',
};

const VideoPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');
  const { isPlaying, currentTrack } = useGlobalMusic();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 w-full max-w-5xl flex flex-col items-center relative mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="absolute top-4 left-4 text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ImageWithFallback 
          src="/flappy pi gif/flappy-2.gif.gif" 
          alt="Flappy Pi Logo" 
          className="w-20 h-20 mb-6 drop-shadow-xl animate-bounce-slow" 
          lazy={true}
          fallbackSrc="/flappy-logo.png"
        />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Watch Flappy Pi in Action</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Watch the official Flappy Pi gameplay trailer and see how you can earn Pi while playing!</p>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{video.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-w-16 aspect-h-9 w-full mb-4">
              <iframe
                width="100%"
                height="315"
                src={video.embedUrl}
                title={video.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="false"
                className="rounded-xl shadow-lg"
              ></iframe>
            </div>
            <p>{video.description}</p>
          </CardContent>
        </Card>
        {/* VideoObject Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          'name': video.name,
          'description': video.description,
          'thumbnailUrl': video.thumbnailUrl,
          'uploadDate': video.uploadDate,
          'contentUrl': video.contentUrl,
          'embedUrl': video.embedUrl,
        }) }} />
      </div>
    </SkyBackground>
  );
};

export default VideoPage; 