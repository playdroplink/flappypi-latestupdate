import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Play, Mic, Target } from 'lucide-react';
import { unlockGameModes, checkGameModeStatus } from '../utils/unlockGameModes';
import { ROUTES } from '../constants/routes';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const UnlockTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { isPlaying, currentTrack } = useGlobalMusic();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = () => {
    const currentStatus = checkGameModeStatus();
    setStatus(currentStatus);
  };

  const handleUnlock = () => {
    setIsUnlocking(true);
    try {
      const result = unlockGameModes();
      console.log('Unlock result:', result);
      setTimeout(() => {
        checkStatus();
        setIsUnlocking(false);
      }, 500);
    } catch (error) {
      console.error('Error unlocking modes:', error);
      setIsUnlocking(false);
    }
  };

  const handleTestPrecision = () => {
    navigate(ROUTES.CHALLENGE_PRECISION);
  };

  const handleTestScreamPi = () => {
    navigate('/scream-pi');
  };

  const handleBack = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-2xl font-bold text-gray-800">
                🎮 Game Mode Unlock Test
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Current Status:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Precision Mode Status */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="font-medium">Precision Mode</p>
                      <p className="text-sm text-gray-600">🎯 Tighter pipes, weaker jumps</p>
                    </div>
                  </div>
                  <Badge variant={status?.precisionMode ? "default" : "secondary"}>
                    {status?.precisionMode ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    {status?.precisionMode ? "Unlocked" : "Locked"}
                  </Badge>
                </div>

                {/* Scream Pi Status */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mic className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="font-medium">Scream Pi Challenge</p>
                      <p className="text-sm text-gray-600">🎤 Voice-controlled gameplay</p>
                    </div>
                  </div>
                  <Badge variant={status?.screamPiChallenge ? "default" : "secondary"}>
                    {status?.screamPiChallenge ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    {status?.screamPiChallenge ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button 
                  onClick={handleUnlock} 
                  disabled={isUnlocking}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isUnlocking ? "Unlocking..." : "🔓 Unlock Both Modes"}
                </Button>
                <Button 
                  onClick={checkStatus} 
                  variant="outline"
                  className="flex-1"
                >
                  🔄 Refresh Status
                </Button>
              </div>

              {/* Test Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={handleTestPrecision}
                  disabled={!status?.precisionMode}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Test Precision Mode
                </Button>
                <Button 
                  onClick={handleTestScreamPi}
                  disabled={!status?.screamPiChallenge}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Test Scream Pi
                </Button>
              </div>
            </div>

            {/* Debug Info */}
            {status && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Debug Information:</h4>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnlockTestPage; 