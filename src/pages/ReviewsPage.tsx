import React from 'react';
// import HomeHeader from '../components/home/HomeHeader'; // Removed
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Removed
import ImageWithFallback from '@/components/ImageWithFallback';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const reviews = [
  {
    author: 'Alice',
    rating: 5,
    text: 'Flappy Pi is so much fun! I love earning Pi while playing.',
  },
  {
    author: 'Bob',
    rating: 4,
    text: 'Great game, very addictive. The community is awesome!',
  },
  {
    author: 'Charlie',
    rating: 5,
    text: 'Best Pi Network game out there. Highly recommend!',
  },
];

const ReviewsPage: React.FC = () => {
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
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Player Reviews</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Hear what our amazing players have to say about Flappy Pi!</p>

        <div className="bg-white/60 rounded-xl shadow-lg p-8 w-full text-blue-900">
          <div className="space-y-6">
            {reviews.map((review, idx) => (
              <Card key={idx} className="p-4 bg-white/80 border-blue-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-800 font-semibold">{review.author} - {review.rating}★</CardTitle>
                </CardHeader>
                <CardContent className="text-blue-700">
                  <p>{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Review Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'itemListElement': reviews.map((review, idx) => ({
            '@type': 'Review',
            'author': { '@type': 'Person', 'name': review.author },
            'reviewRating': { '@type': 'Rating', 'ratingValue': review.rating, 'bestRating': 5 },
            'reviewBody': review.text
          }))
        }) }} />
      </div>
    </div>
  );
};

export default ReviewsPage; 