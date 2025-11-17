import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassicMode from '../game/ClassicMode';
import ChallengeMechanicsModal from './ChallengeMechanicsModal';
import ChallengePanel from './ChallengePanel';
import { Button } from '../ui/button';
import { Info } from 'lucide-react';

interface ChallengeModeWrapperProps {
  challenge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: string;
    reward: string | number;
    rules: Record<string, any>;
    mechanics: {
      pipeGap: number;
      pipeSpeed: number;
      gravity: number;
      flapStrength: number;
      pipeFrequency: number;
      specialEffects: string[];
    };
    completionCondition: {
      type: 'pipes' | 'time' | 'survival';
      value: number;
    };
    background: string;
    obstacles: any[];
    powerUps: any[];
  };
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ChallengeModeWrapper: React.FC<ChallengeModeWrapperProps> = ({
  challenge,
  musicEnabled,
  setMusicEnabled,
  soundEnabled,
  setSoundEnabled
}) => {
  const navigate = useNavigate();
  const [challengeState, setChallengeState] = useState({
    isActive: false,
    startTime: 0,
    pipesPassed: 0,
    timeElapsed: 0,
    isCompleted: false,
    failed: false
  });
  const [showMechanicsModal, setShowMechanicsModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize challenge state
  useEffect(() => {
    setChallengeState({
      isActive: true,
      startTime: Date.now(),
      pipesPassed: 0,
      timeElapsed: 0,
      isCompleted: false,
      failed: false
    });
    setGameStarted(false);
    setShowMechanicsModal(false);
  }, [challenge.id]);

  // Challenge completion logic
  const checkChallengeCompletion = (score: number, timeElapsed: number) => {
    if (challengeState.isCompleted || challengeState.failed) return;

    const { type, value } = challenge.completionCondition;
    
    let completed = false;
    switch (type) {
      case 'pipes':
        completed = score >= value;
        break;
      case 'time':
        completed = timeElapsed >= value;
        break;
      case 'survival':
        completed = timeElapsed >= value;
        break;
    }

    if (completed) {
      setChallengeState(prev => ({ ...prev, isCompleted: true }));
      // Handle challenge completion
      console.log(`🎉 Challenge ${challenge.name} completed!`);
    }
  };

  // Challenge failure logic
  const checkChallengeFailure = () => {
    if (challengeState.isCompleted || challengeState.failed) return;

    // Time-based challenges (like Time Bomb)
    if (challenge.id === 'timebomb') {
      const timeLimit = challenge.rules.timer || 15;
      const timeElapsed = (Date.now() - challengeState.startTime) / 1000;
      
      if (timeElapsed >= timeLimit) {
        setChallengeState(prev => ({ ...prev, failed: true }));
        console.log(`💣 Challenge ${challenge.name} failed - time limit exceeded!`);
      }
    }
  };

  // Update challenge state - Optimized for better performance
  useEffect(() => {
    if (!challengeState.isActive) return;

    // Use requestAnimationFrame for smoother updates instead of setInterval
    let animationFrameId: number;
    
    const updateTimer = () => {
      const timeElapsed = (Date.now() - challengeState.startTime) / 1000;
      setChallengeState(prev => ({ ...prev, timeElapsed }));
      
      checkChallengeFailure();
      
      // Continue animation if challenge is still active
      if (challengeState.isActive && !challengeState.isCompleted && !challengeState.failed) {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };
    
    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [challengeState.isActive, challengeState.startTime]);

  // Handle challenge-specific game mechanics
  const getChallengeMechanics = () => {
    const { mechanics } = challenge;
    
    return {
      pipeGap: mechanics.pipeGap,
      pipeSpeed: mechanics.pipeSpeed,
      gravity: mechanics.gravity,
      flapStrength: mechanics.flapStrength,
      pipeFrequency: mechanics.pipeFrequency,
      specialEffects: mechanics.specialEffects
    };
  };

  // Handle challenge completion
  const handleChallengeComplete = () => {
    console.log(`🏆 Challenge ${challenge.name} completed successfully!`);
    // Navigate back to challenge index or show completion modal
    navigate('/challenge');
  };

  // Handle challenge failure
  const handleChallengeFailure = () => {
    console.log(`❌ Challenge ${challenge.name} failed!`);
    // Show failure modal or retry option
  };

  // Handle starting the game
  const handleStartGame = () => {
    setGameStarted(true);
    setShowMechanicsModal(false);
  };


  return (
    <div className="flex flex-col h-screen w-full">
      {/* Challenge Panel - Fixed at top */}
      <ChallengePanel
        challenge={challenge}
        challengeState={challengeState}
        gameStarted={gameStarted}
        showMechanicsModal={showMechanicsModal}
        onShowMechanics={() => setShowMechanicsModal(true)}
      />
      
      {/* Game Area - Takes remaining space */}
      <div className="flex-1 relative">
        <ClassicMode
          mode="challenge"
          challenge={challenge}
          musicEnabled={musicEnabled}
          setMusicEnabled={setMusicEnabled}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          hideStartScreen={showMechanicsModal}
          hideChallengeUI={true}
          onGameOver={(score) => {
            if (challengeState.isCompleted) {
              handleChallengeComplete();
            } else {
              handleChallengeFailure();
            }
          }}
        />
      </div>

      {/* Challenge Mechanics Modal */}
      <ChallengeMechanicsModal
        isOpen={showMechanicsModal}
        onClose={() => setShowMechanicsModal(false)}
        onStart={handleStartGame}
        challenge={challenge}
      />
    </div>
  );
};

export default ChallengeModeWrapper;
