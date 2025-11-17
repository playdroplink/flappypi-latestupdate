import React from 'react';
import HomeHeader from '../components/home/HomeHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageWithFallback from '@/components/ImageWithFallback';
import EnhancedFooter from '../components/EnhancedFooter';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import { useGlobalMusic } from '@/hooks/useGlobalMusic';


const faqs = [
  {
    question: 'Is Flappy Pi free to play?',
    answer: 'Yes! Flappy Pi is free to play for everyone on the Pi Network.'
  },
  {
    question: 'Can I earn real Pi cryptocurrency?',
    answer: 'Yes, you can earn Pi rewards by playing and achieving high scores.'
  },
  {
    question: 'What devices are supported?',
    answer: 'Flappy Pi works on all modern browsers and mobile devices.'
  },
  {
    question: 'How do I join the leaderboard?',
    answer: 'Play Flappy Pi and achieve a high score to appear on the leaderboard.'
  },
];

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

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
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Frequently Asked Questions</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Find answers to common questions about Flappy Pi and the Pi Network integration.</p>
        <div className="bg-white/60 shadow-lg p-8 w-full text-blue-900">
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="p-4 bg-white/80 border-blue-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-800 font-semibold">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent className="text-blue-700">
                  <p>{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <EnhancedFooter />
      {/* FAQPage Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }) }} />
    </SkyBackground>
  );
};

export default FAQPage; 