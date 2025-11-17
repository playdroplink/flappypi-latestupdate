import React, { useState, useEffect } from 'react';
import { useDuelsSocket } from '../../hooks/useDuelsSocket';
import { GameRoom } from '../../services/duelsSocketService';
import { useButtonSound } from '../../hooks/useButtonSound';

interface DuelsLobbyProps {
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (data: { roomName: string; gameMode: string; difficulty: string }) => void;
  onBack: () => void;
}

export const DuelsLobby: React.FC<DuelsLobbyProps> = ({ onJoinRoom, onCreateRoom, onBack }) => {
  const {
    isConnected,
    availableRooms,
    playerName,
    joinLobby,
    refreshRooms,
    error,
    clearError
  } = useDuelsSocket({ autoConnect: true });
  
  const { playClickSound, playSuccessSound, playErrorSound } = useButtonSound();

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [gameMode, setGameMode] = useState('classic');
  const [difficulty, setDifficulty] = useState('normal');

  useEffect(() => {
    if (isConnected && playerName) {
      joinLobby(playerName);
    }
  }, [isConnected, playerName, joinLobby]);

  useEffect(() => {
    if (isConnected) {
      refreshRooms();
    }
  }, [isConnected, refreshRooms]);

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      playSuccessSound();
      onCreateRoom({
        roomName: newRoomName,
        gameMode,
        difficulty
      });
    } else {
      playErrorSound();
    }
  };

  const handleJoinRoom = (roomId: string) => {
    playClickSound();
    onJoinRoom(roomId);
  };

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case 'classic': return 'bg-blue-500';
      case 'endless': return 'bg-green-500';
      case 'challenge': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-400';
      case 'normal': return 'bg-yellow-400';
      case 'hard': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white dark:border-gray-300 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-2">Connecting to Duels Server...</h2>
          <p className="text-gray-300 dark:text-gray-400">Please wait while we establish the connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white dark:text-gray-100 hover:text-yellow-300 dark:hover:text-yellow-400 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white dark:text-gray-100 mb-2">⚔️ Duels Lobby</h1>
            <p className="text-gray-300 dark:text-gray-400">Challenge friends in epic multiplayer battles!</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-400 dark:text-green-500">
              <div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Connected
            </div>
            <button
              onClick={() => refreshRooms()}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-200">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Create Room Section */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Create New Room</h2>
              <button
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                {showCreateRoom ? 'Cancel' : 'Create Room'}
              </button>
            </div>

            {showCreateRoom && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Room Name</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name..."
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Game Mode</label>
                    <select
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="classic">Classic</option>
                      <option value="endless">Endless</option>
                      <option value="challenge">Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="normal">Normal</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoomName.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Create Room
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Available Rooms */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Available Rooms</h2>
          
          {availableRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Rooms Available</h3>
              <p className="text-gray-400">Create a new room to start playing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-300 transition-colors">
                      {room.hostName}'s Room
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {room.playerCount}/{room.maxPlayers}
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getGameModeColor(room.gameMode)}`}>
                        {room.gameMode.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor(room.difficulty)}`}>
                        {room.difficulty.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Status: <span className="text-green-400 capitalize">{room.gameState}</span>
                      </span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
