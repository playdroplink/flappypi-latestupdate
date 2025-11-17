import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengePanel from './ChallengePanel';

interface IsolatedChallengeModeProps {
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

const IsolatedChallengeMode: React.FC<IsolatedChallengeModeProps> = ({
  challenge,
  musicEnabled,
  setMusicEnabled,
  soundEnabled,
  setSoundEnabled
}) => {
  const navigate = useNavigate();
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Challenge-specific state (completely isolated)
  const [challengeState, setChallengeState] = useState({
    isActive: false,
    startTime: 0,
    pipesPassed: 0,
    timeElapsed: 0,
    isCompleted: false,
    failed: false,
    score: 0,
    gameStarted: false,
    gameOver: false
  });

  // Game state (isolated to this challenge only)
  const [gameState, setGameState] = useState({
    birdY: 300,
    birdVelocity: 0,
    pipes: [] as Array<{ x: number; topHeight: number; bottomHeight: number }>,
    score: 0,
    gameStarted: false,
    gameOver: false
  });

  // Challenge-specific mechanics (isolated)
  const [challengeMechanics, setChallengeMechanics] = useState({
    windForce: 0,
    gravityFlip: 1,
    shieldActive: false,
    lavaY: 800,
    iceSlideOffset: 0,
    nightLight: false,
    mysteryEffect: null as string | null
  });

  // Initialize challenge (completely isolated)
  useEffect(() => {
    console.log(`🎯 Initializing isolated challenge: ${challenge.name}`);
    
    setChallengeState({
      isActive: true,
      startTime: Date.now(),
      pipesPassed: 0,
      timeElapsed: 0,
      isCompleted: false,
      failed: false,
      score: 0,
      gameStarted: false,
      gameOver: false
    });

    setGameState({
      birdY: 300,
      birdVelocity: 0,
      pipes: [],
      score: 0,
      gameStarted: false,
      gameOver: false
    });

    // Challenge-specific initialization
    if (challenge.id === 'lavaescape') {
      setChallengeMechanics(prev => ({ ...prev, lavaY: 800 }));
    }

    return () => {
      // Cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      console.log(`🧹 Cleaning up challenge: ${challenge.name}`);
    };
  }, [challenge.id]);

  // Challenge-specific game loop (completely isolated)
  const gameLoop = useCallback(() => {
    if (!challengeState.isActive || !challengeState.gameStarted || challengeState.gameOver) return;

    setGameState(prevState => {
      const newState = { ...prevState };
      
      // Apply challenge-specific mechanics
      let effectiveGravity = challenge.mechanics.gravity;
      let effectiveFlap = challenge.mechanics.flapStrength;
      
      // Challenge-specific modifications
      if (challenge.id === 'gravityflip') {
        effectiveGravity *= challengeMechanics.gravityFlip;
      }
      
      if (challenge.id === 'reverse') {
        effectiveFlap = Math.abs(effectiveFlap); // Reverse controls
      }
      
      if (challenge.id === 'precision') {
        effectiveFlap = challenge.mechanics.flapStrength; // Weaker flap
      }

      // Apply wind effects
      if (challenge.id === 'windstorm') {
        newState.birdVelocity += challengeMechanics.windForce;
      }

      // Update bird physics
      newState.birdVelocity += effectiveGravity;
      newState.birdY += newState.birdVelocity;

      // Check collision with ground/ceiling
      if (newState.birdY >= 600 || newState.birdY <= 0) {
        newState.gameOver = true;
        setChallengeState(prev => ({ ...prev, failed: true }));
        return newState;
      }

      // Update pipes
      newState.pipes = newState.pipes.map(pipe => ({
        ...pipe,
        x: pipe.x - challenge.mechanics.pipeSpeed
      })).filter(pipe => pipe.x > -100);

      // Generate new pipes based on challenge-specific frequency
      const pipeFrequency = challenge.mechanics.pipeFrequency || 120;
      const pipeSpawnChance = pipeFrequency / 6000; // Convert frequency to probability per frame
      if (Math.random() < pipeSpawnChance) {
        const gap = challenge.mechanics.pipeGap;
        const topHeight = Math.random() * (400 - gap) + 50;
        newState.pipes.push({
          x: 800,
          topHeight,
          bottomHeight: 600 - topHeight - gap
        });
      }

      // Check pipe collisions
      for (const pipe of newState.pipes) {
        if (pipe.x < 100 && pipe.x > 50) {
          if (newState.birdY < pipe.topHeight || newState.birdY > 600 - pipe.bottomHeight) {
            newState.gameOver = true;
            setChallengeState(prev => ({ ...prev, failed: true }));
            return newState;
          }
        }
      }

      // Update score
      if (newState.pipes.some(pipe => pipe.x === 50)) {
        newState.score += 1;
        setChallengeState(prev => ({ 
          ...prev, 
          pipesPassed: prev.pipesPassed + 1,
          score: newState.score
        }));
      }

      return newState;
    });

    // Check challenge completion
    if (challengeState.pipesPassed >= challenge.completionCondition.value) {
      setChallengeState(prev => ({ ...prev, isCompleted: true, gameOver: true }));
    }

    // Continue game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [challengeState, challengeMechanics, challenge]);

  // Start game loop when challenge becomes active and game is started
  useEffect(() => {
    if (challengeState.isActive && challengeState.gameStarted && !challengeState.gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [challengeState.isActive, challengeState.gameStarted, challengeState.gameOver, gameLoop]);

  // Challenge-specific effects (isolated)
  useEffect(() => {
    if (!challengeState.isActive) return;

    const interval = setInterval(() => {
      // Time Bomb challenge
      if (challenge.id === 'timebomb') {
        const timeElapsed = (Date.now() - challengeState.startTime) / 1000;
        if (timeElapsed >= (challenge.rules.timer || 15)) {
          setChallengeState(prev => ({ ...prev, failed: true, gameOver: true }));
        }
      }

      // Wind Storm challenge
      if (challenge.id === 'windstorm') {
        setChallengeMechanics(prev => ({
          ...prev,
          windForce: (Math.random() - 0.5) * 2
        }));
      }

      // Gravity Flip challenge
      if (challenge.id === 'gravityflip') {
        setChallengeMechanics(prev => ({
          ...prev,
          gravityFlip: prev.gravityFlip * -1
        }));
      }

      // Lava Escape challenge
      if (challenge.id === 'lavaescape') {
        setChallengeMechanics(prev => ({
          ...prev,
          lavaY: Math.max(0, prev.lavaY - 1)
        }));
      }

      // Mystery Mode challenge
      if (challenge.id === 'mystery') {
        const effects = ['wind', 'gravityflip', 'night', 'speed'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        setChallengeMechanics(prev => ({
          ...prev,
          mysteryEffect: randomEffect
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [challengeState.isActive, challenge.id, challenge.rules, challengeState.startTime]);

  // Handle challenge completion
  useEffect(() => {
    if (challengeState.isCompleted) {
      console.log(`🏆 Challenge ${challenge.name} completed!`);
      // Navigate back to challenge index
      setTimeout(() => {
        navigate('/challenge');
      }, 2000);
    }
  }, [challengeState.isCompleted, challenge.name, navigate]);

  // Handle challenge failure
  useEffect(() => {
    if (challengeState.failed) {
      console.log(`❌ Challenge ${challenge.name} failed!`);
    }
  }, [challengeState.failed, challenge.name]);


  // Render game canvas
  const renderGameCanvas = () => {
    return (
      <canvas
        ref={gameCanvasRef}
        width={800}
        height={600}
        className="border border-gray-300 rounded-lg"
        style={{ background: challenge.background }}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Challenge Panel - Fixed at top */}
      <ChallengePanel
        challenge={challenge}
        challengeState={challengeState}
        gameStarted={challengeState.gameStarted}
        showMechanicsModal={false}
        onShowMechanics={() => {}}
      />
      
      {/* Game Area - Takes remaining space */}
      <div className="flex-1 relative bg-gray-100 flex items-center justify-center">
        {renderGameCanvas()}
        
        {/* Game controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              if (!challengeState.gameStarted) {
                setChallengeState(prev => ({ ...prev, gameStarted: true }));
              } else if (!challengeState.gameOver) {
                // Handle flap
                setGameState(prev => ({
                  ...prev,
                  birdVelocity: challenge.mechanics.flapStrength
                }));
              }
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            {!challengeState.gameStarted ? 'Start Challenge' : 
             challengeState.gameOver ? 'Challenge Over' : 'Flap!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IsolatedChallengeMode;
