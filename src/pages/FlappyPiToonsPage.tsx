import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Video, Star, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SkyBackground from '@/components/SkyBackground';
import ErrorFreeImage from '@/components/ErrorFreeImage';

const FlappyPiToonsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <SkyBackground theme="night">
        <div></div>
      </SkyBackground>
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <ErrorFreeImage
              src="/flappy pi gif/flappy-2.gif.gif"
              alt="Flappy Pi"
              className="w-16 h-16 rounded-full"
              fallbackSrc="/flappy-logo.png"
            />
            <h1 className="text-4xl md:text-6xl font-extrabold text-white">
              Flappy Pi Toons
            </h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Animated adventures await! Our Flappy Pi animated series is currently in production.
          </p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Video className="w-8 h-8 text-yellow-400" />
                <CardTitle className="text-3xl">Coming Soon!</CardTitle>
              </div>
              <p className="text-lg text-white/80">
                We're working hard to bring you amazing animated content featuring Flappy Pi!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Epic Adventures</h3>
                  <p className="text-white/70 text-sm">
                    Follow Flappy Pi through exciting animated adventures in the Pi Network universe.
                  </p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">High Quality</h3>
                  <p className="text-white/70 text-sm">
                    Professional animation with engaging storylines and memorable characters.
                  </p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
                  <p className="text-white/70 text-sm">
                    Content created by and for the Flappy Pi community.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-white/60">
                  <Clock className="w-5 h-5" />
                  <span>Production Status: In Progress</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                  🚧 Under Construction
                </Badge>
                <p className="text-white/60 text-sm">
                  Stay tuned for updates! We'll notify you when the first episodes are ready.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <Button
                  onClick={() => navigate('/flappypiofficial')}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Visit Flappy Pi Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlappyPiToonsPage;