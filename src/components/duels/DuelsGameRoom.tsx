import React, { useState, useEffect } from 'react';
import { useDuelsSocket } from '../../hooks/useDuelsSocket';
import { DuelsPlayer } from '../../services/duelsSocketService';

interface DuelsGameRoomProps {
  onLeaveRoom: () => void;
  onStartGame: () => void;
}

export const DuelsGameRoom: React.FC<DuelsGameRoomProps> = ({ onLeaveRoom, onStartGame }) => {
  const {
    currentRoom,
    isHost,
    canStartGame,
    gameState,
    gameData,
    winner,
    setPlayerReady,
    startGame,
    sendGameAction,
    error,
    clearError
  } = useDuelsSocket();

  const [isReady, setIsReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameState === 'playing' && !gameStarted) {
      setGameStarted(true);
    } else if (gameState === 'waiting' && gameStarted) {
      setGameStarted(false);
    }
  }, [gameState, gameStarted]);

  const handleReadyToggle = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    setPlayerReady(newReadyState);
  };

  const handleStartGame = () => {
    if (isHost && canStartGame) {
      startGame();
      onStartGame();
    }
  };

  const handleJump = () => {
    if (gameState === 'playing') {
      sendGameAction('jump');
    }
  };

  const getPlayerStatus = (player: DuelsPlayer) => {
    if (player.ready) {
      return { text: 'Ready', color: 'text-green-400', bg: 'bg-green-400/20' };
    } else if (player.connected) {
      return { text: 'Not Ready', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    } else {
      return { text: 'Disconnected', color: 'text-red-400', bg: 'bg-red-400/20' };
    }
  };

  const getGameStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400';
      case 'playing': return 'text-green-400';
      case 'finished': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Room...</h2>
          <p className="text-gray-300">Please wait while we load the room data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onLeaveRoom}
            className="flex items-center text-white hover:text-yellow-300 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Leave Room
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-1">⚔️ Duels Room</h1>
            <p className="text-gray-300">Game Mode: {currentRoom.settings.gameMode} | Difficulty: {currentRoom.settings.difficulty}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-400">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Connected
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGameStatusColor(gameState)} bg-white/10`}>
              {gameState.toUpperCase()}
            </div>
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

        {/* Game State Display */}
        {gameState === 'playing' && gameData && (
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">🎮 Game in Progress</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Player 1 Score */}
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400 mb-2">Player 1</div>
                <div className="text-3xl font-bold text-white mb-2">{gameData.bird1.score}</div>
                <div className={`text-sm ${gameData.bird1.alive ? 'text-green-400' : 'text-red-400'}`}>
                  {gameData.bird1.alive ? 'Alive' : 'Eliminated'}
                </div>
              </div>

              {/* Player 2 Score */}
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-400 mb-2">Player 2</div>
                <div className="text-3xl font-bold text-white mb-2">{gameData.bird2.score}</div>
                <div className={`text-sm ${gameData.bird2.alive ? 'text-green-400' : 'text-red-400'}`}>
                  {gameData.bird2.alive ? 'Alive' : 'Eliminated'}
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="mt-6 text-center">
              <button
                onClick={handleJump}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-95"
              >
                🐦 JUMP!
              </button>
              <p className="text-sm text-gray-400 mt-2">Press to make your bird jump</p>
            </div>
          </div>
        )}

        {/* Game End Display */}
        {gameState === 'finished' && winner && (
          <div className="mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">🏆 Game Finished!</h2>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <div className="text-xl font-semibold text-yellow-400 mb-2">
                {winner ? 'Player Won!' : 'Game Ended'}
              </div>
              <div className="text-gray-300">
                Final Scores: Player 1: {gameData?.bird1.score || 0} | Player 2: {gameData?.bird2.score || 0}
              </div>
            </div>
          </div>
        )}

        {/* Players List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Players ({currentRoom.players.length}/{currentRoom.settings.maxPlayers})</h2>
          
          <div className="space-y-3">
            {currentRoom.players.map((player, index) => {
              const status = getPlayerStatus(player);
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{player.name}</div>
                      <div className="text-sm text-gray-400">
                        {player.isHost ? 'Host' : 'Player'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.bg}`}>
                      {status.text}
                    </div>
                    {player.isHost && (
                      <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        HOST
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Room Controls</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Ready Button */}
            <button
              onClick={handleReadyToggle}
              disabled={gameState === 'playing'}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                isReady
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              } ${gameState === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isReady ? '✅ Ready' : '❌ Not Ready'}
            </button>

            {/* Start Game Button (Host Only) */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStartGame || gameState === 'playing'}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                  canStartGame && gameState !== 'playing'
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {gameState === 'playing' ? 'Game in Progress' : 'Start Game'}
              </button>
            )}
          </div>

          {/* Game Instructions */}
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">How to Play:</h3>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Both players must be ready to start the game</li>
              <li>• Use the JUMP button to make your bird fly</li>
              <li>• Avoid pipes and collect points</li>
              <li>• The player with the highest score wins!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
