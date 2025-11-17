import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

const ScreamPiTestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(ROUTES.CHALLENGE);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Scream Pi Test Page</h1>
          <p className="text-lg text-gray-600">This is a test page to verify the Scream Pi Challenge route is working.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4">
            <h3 className="font-bold text-green-800 mb-2">✅ Route Working</h3>
            <p className="text-green-700">The Scream Pi Challenge route is accessible!</p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => navigate('/challenge/scream-pi')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl"
            >
              Test Direct Route
            </Button>
            
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Challenges
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreamPiTestPage; 