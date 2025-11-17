import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Server, Play, Users } from 'lucide-react';

interface MultiplayerFallbackProps {
  onBack: () => void;
  onStartServer?: () => void;
}

const MultiplayerFallback: React.FC<MultiplayerFallbackProps> = ({ onBack, onStartServer }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          ←
        </Button>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <WifiOff className="w-6 h-6" />
            Multiplayer Server Offline
          </CardTitle>
          <CardDescription className="text-orange-100">
            The multiplayer server is not currently running
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              To use multiplayer features, you need to start the multiplayer server first.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">How to start the server:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <p className="font-medium">Open terminal/command prompt</p>
                  <p className="text-sm text-gray-600">Navigate to your project directory</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <p className="font-medium">Run the setup script</p>
                  <p className="text-sm text-gray-600 font-mono bg-gray-200 px-2 py-1 rounded">chmod +x setup-improved-multiplayer-server.sh</p>
                  <p className="text-sm text-gray-600 font-mono bg-gray-200 px-2 py-1 rounded mt-1">./setup-improved-multiplayer-server.sh</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <p className="font-medium">Start the server</p>
                  <p className="text-sm text-gray-600 font-mono bg-gray-200 px-2 py-1 rounded">./start-server.sh</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {onStartServer && (
              <Button 
                onClick={onStartServer}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Play className="mr-2 w-5 h-5" />
                Try to Start Server
              </Button>
            )}
            
            <Button 
              onClick={onBack}
              variant="outline"
              className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 font-bold py-4 rounded-xl"
            >
              <Users className="mr-2 w-5 h-5" />
              Back to Menu
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Once the server is running, you can create and join multiplayer rooms!</p>
            <p className="mt-1">Server will be available at: <span className="font-mono bg-gray-200 px-2 py-1 rounded">http://localhost:3009</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiplayerFallback;
