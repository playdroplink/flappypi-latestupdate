import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackgroundDecoration from '../components/home/BackgroundDecoration';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

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
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center">Analytics</h1>
        <p className="text-lg mb-8 text-blue-800 text-center max-w-2xl">Detailed analytics and insights will be displayed here.</p>
        {/* Placeholder for analytics content */}
        <div className="w-full max-w-4xl bg-gray-100/60 p-6 rounded-lg text-gray-800 text-center">
          <p className="text-xl font-semibold mb-4">Coming Soon!</p>
          <p>This page will provide comprehensive analytics for app usage, user engagement, and more.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
