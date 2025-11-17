import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Crown, Trophy, Medal, Star, Play, Settings, Wifi, WifiOff, Clock, Target, Loader2, XCircle, Copy, Check } from 'lucide-react';

interface ImprovedMultiplayerLobbyProps {
  onBack: () => void;
  onCreateRoom: (data: { name: string; maxPlayers: number; gameMode: string }) => void;
  onJoinRoom: (roomId: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  currentRoom: any;
  players: any[];
  gameStatus: string;
  error: string | null;
  isHost: boolean;
  socketId: string | null;
}

const ImprovedMultiplayerLobby: React.FC<ImprovedMultiplayerLobbyProps> = ({
  onBack,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onLeaveRoom,
  currentRoom,
  players,
  gameStatus,
  error,
  isHost,
  socketId
}) => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [gameMode, setGameMode] = useState('classic');
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    onCreateRoom({ name: roomName, maxPlayers, gameMode });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    onJoinRoom(roomId);
  };

  const copyRoomId = () => {
    if (currentRoom?.id) {
      navigator.clipboard.writeText(currentRoom.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case 'classic': return 'bg-blue-500';
      case 'endless': return 'bg-purple-500';
      case 'race': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getGameModeIcon = (mode: string) => {
    switch (mode) {
      case 'classic': return '🎮';
      case 'endless': return '♾️';
      case 'race': return '🏁';
      default: return '🎯';
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="text-blue-700 hover:bg-blue-100 rounded-full p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-600">Connected</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Create Room Section */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Crown className="w-6 h-6" />
              Create Room
            </CardTitle>
            <CardDescription className="text-blue-100">
              Start a new multiplayer game and invite friends
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomName" className="text-sm font-semibold text-gray-700">
                  Room Name
                </Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="My Flappy Room"
                  className="mt-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxPlayers" className="text-sm font-semibold text-gray-700">
                    Max Players
                  </Label>
                  <Select value={maxPlayers.toString()} onValueChange={(value) => setMaxPlayers(parseInt(value))}>
                    <SelectTrigger className="mt-2 border-2 border-gray-200 rounded-xl focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="gameMode" className="text-sm font-semibold text-gray-700">
                    Game Mode
                  </Label>
                  <Select value={gameMode} onValueChange={setGameMode}>
                    <SelectTrigger className="mt-2 border-2 border-gray-200 rounded-xl focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">🎮 Classic</SelectItem>
                      <SelectItem value="endless">♾️ Endless</SelectItem>
                      <SelectItem value="race">🏁 Race</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Crown className="mr-2 w-5 h-5" />
                Create Room
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Join Room Section */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-6 h-6" />
              Join Room
            </CardTitle>
            <CardDescription className="text-green-100">
              Enter a room ID to join an existing game
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomId" className="text-sm font-semibold text-gray-700">
                  Room ID
                </Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                  className="mt-2 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0"
                />
              </div>

              <Button 
                onClick={handleJoinRoom}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Users className="mr-2 w-5 h-5" />
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Room Display */}
      {currentRoom && (
        <Card className="w-full max-w-4xl mt-8 bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  {currentRoom.name}
                </CardTitle>
                <CardDescription className="text-purple-100 mt-2">
                  Room ID: <span className="font-mono bg-white/20 px-2 py-1 rounded">{currentRoom.id}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyRoomId}
                    className="ml-2 text-white hover:bg-white/20"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </CardDescription>
              </div>
              <Badge className={`${getGameModeColor(currentRoom.gameMode)} text-white px-3 py-1`}>
                {getGameModeIcon(currentRoom.gameMode)} {currentRoom.gameMode.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Players List */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({players.length}/{currentRoom.maxPlayers})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      player.id === socketId 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {player.id === currentRoom.hostId && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {player.username} {player.id === socketId && "(You)"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {player.id === currentRoom.hostId ? 'Host' : 'Player'}
                        </p>
                      </div>
                    </div>
                    {gameStatus === 'gameOver' && (
                      <div className="text-right">
                        <p className="font-bold text-blue-600">Score: {player.score}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isHost && gameStatus === 'waiting' && (
                <Button 
                  onClick={onStartGame} 
                  disabled={players.length < 2}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <Play className="mr-2 w-5 h-5" />
                  {players.length < 2 ? `Need ${2 - players.length} more player${2 - players.length > 1 ? 's' : ''}` : 'Start Game'}
                </Button>
              )}
              
              {!isHost && gameStatus === 'waiting' && (
                <Button 
                  disabled 
                  className="flex-1 bg-gray-400 text-white font-bold py-4 rounded-xl"
                >
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Waiting for host to start...
                </Button>
              )}
              
              {gameStatus === 'gameOver' && (
                <Button 
                  onClick={onStartGame} 
                  disabled={players.length < 2}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Play Again
                </Button>
              )}

              <Button 
                onClick={onLeaveRoom}
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold py-4 rounded-xl"
              >
                <Users className="mr-2 w-5 h-5" />
                Leave Room
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImprovedMultiplayerLobby;
