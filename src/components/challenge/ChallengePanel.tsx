import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ChallengePanelProps {
  challenge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: string;
  };
  challengeState: {
    isActive: boolean;
    timeElapsed: number;
    pipesPassed: number;
    score: number;
    isCompleted: boolean;
    failed: boolean;
  };
  gameStarted: boolean;
  showMechanicsModal: boolean;
  onShowMechanics: () => void;
}

const ChallengePanel: React.FC<ChallengePanelProps> = ({
  challenge,
  challengeState,
  gameStarted,
  showMechanicsModal,
  onShowMechanics
}) => {
  // Don't render if game hasn't started and no mechanics modal
  if (!gameStarted && !showMechanicsModal) {
    return null;
  }

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg flex-shrink-0">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Challenge Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{challenge.icon}</span>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{challenge.name}</h3>
                <p className="text-sm text-gray-600">{challenge.description}</p>
              </div>
            </div>
            
            <Badge 
              className={`${
                challenge.difficulty === 'Easy' ? 'bg-green-500' :
                challenge.difficulty === 'Medium' ? 'bg-yellow-500' :
                challenge.difficulty === 'Hard' ? 'bg-orange-500' :
                'bg-red-500'
              } text-white`}
            >
              {challenge.difficulty}
            </Badge>
          </div>

          {/* Challenge Progress - Only show when game is active */}
          {gameStarted && challengeState.isActive && (
            <div className="flex items-center space-x-6">
              {/* Challenge-specific UI */}
              {challenge.id === 'timebomb' && (
                <div className="text-red-600 font-bold text-lg">
                  ⏰ {Math.max(0, (challenge.rules?.timer || 15) - challengeState.timeElapsed).toFixed(1)}s
                </div>
              )}
              
              {challenge.id === 'windstorm' && (
                <div className="text-yellow-600 font-bold text-lg">
                  🌪️ {challengeState.timeElapsed >= 30 ? 'Survived!' : 'Surviving...'}
                </div>
              )}
              
              {challenge.completionCondition?.type === 'pipes' && (
                <div className="text-green-600 font-bold text-lg">
                  🎯 {challengeState.pipesPassed}/{challenge.completionCondition.value}
                </div>
              )}

              <div className="text-blue-600 font-bold text-lg">
                Score: {challengeState.score}
              </div>
            </div>
          )}

          {/* Challenge Info Button - Only show when game hasn't started */}
          {!gameStarted && (
            <button
              onClick={onShowMechanics}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Challenge Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengePanel;
