import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Home, ArrowLeft, AlertCircle, Gamepad2 } from 'lucide-react';
import DinoPiLockedModal from '@/components/DinoPiLockedModal';

const DinoPiLockedPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLockedModal, setShowLockedModal] = useState(true);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleCloseModal = () => {
    setShowLockedModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
              Dino Pi is Locked
            </CardTitle>
            <p className="text-gray-600 text-lg">
              This prehistoric adventure is currently unavailable
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Access Restricted</span>
              </div>
              <p className="text-sm text-yellow-700">
                Dino Pi game mode is currently locked and not available for play. 
                Please check back later or try other available game modes.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg">Available Game Modes</h3>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🐦</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Flappy Pi Classic</p>
                    <p className="text-sm text-green-600">Endless flying adventure</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => navigate('/play')}
                  >
                    Play
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🎤</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-purple-800">Scream Pi</p>
                    <p className="text-sm text-purple-600">Voice-controlled gameplay</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => navigate('/scream-pi')}
                  >
                    Play
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🏆</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">Challenge Mode</p>
                    <p className="text-sm text-blue-600">Special challenges and missions</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => navigate('/challenge')}
                  >
                    Play
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg"></span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-600">Dino Pi</p>
                    <p className="text-sm text-gray-500">Prehistoric adventure</p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-300 text-gray-600">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGoHome}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button
                onClick={() => navigate('/play')}
                variant="outline"
                className="flex-1"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Play Flappy Pi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DinoPiLockedModal
        isOpen={showLockedModal}
        onClose={handleCloseModal}
        onGoHome={handleGoHome}
      />
    </div>
  );
};

export default DinoPiLockedPage;
