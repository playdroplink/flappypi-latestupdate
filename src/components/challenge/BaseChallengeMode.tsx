import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useRealTimeScoring } from '../../hooks/useRealTimeScoring';
import { useGlobalMusic } from '../../hooks/useGlobalMusic';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../hooks/use-toast';
import GameOverModal from '../game/GameOverModal';
import ChallengePanel from './ChallengePanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, RotateCcw, Home } from 'lucide-react';

export interface ChallengeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  reward: string | number;
  rules: Record<string, any>;
  mechanics: {
    pipeGap?: number;
    pipeSpeed?: number;
    gravity?: number;
    flapStrength?: number;
    pipeFrequency?: number;
    specialEffects?: string[];
  };
  completionCondition: {
    type: 'score' | 'time' | 'pipes' | 'survival';
    value: number;
  };
  background?: string;
  obstacles?: any[];
  powerUps?: any[];
}

interface BaseChallengeModeProps {
  challenge: ChallengeConfig;
  onComplete?: (score: number, time: number) => void;
  onFail?: (reason: string) => void;
}

const BaseChallengeMode: React.FC<BaseChallengeModeProps> = ({
  challenge,
  onComplete,
  onFail
}) => {
  // Real-time scoring integration
  const {
    startGameSession,
    updateScore: updateRealTimeScore,
    addCoinsEarned,
    addAchievement,
    handleChallengeComplete,
    handleChallengeFail,
    getSessionInfo
  } = useRealTimeScoring();
  const navigate = useNavigate();
  const { musicEnabled, setMusicEnabled } = useGameState();
  const { soundEnabled, setSoundEnabled } = useSoundEffects();
  const { isPlaying, currentTrack } = useGlobalMusic(musicEnabled);
  const { balance, setBalance } = useWallet();
  const { toast } = useToast();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [pipesPassed, setPipesPassed] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Bird state
  const [birdY, setBirdY] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [birdRotation, setBirdRotation] = useState(0);

  // Pipes state
  const [pipes, setPipes] = useState<any[]>([]);
  const [pipeSpeed, setPipeSpeed] = useState(challenge.mechanics.pipeSpeed || 2);
  const [pipeGap, setPipeGap] = useState(challenge.mechanics.pipeGap || 150);

  // Challenge-specific state
  const [challengeTimer, setChallengeTimer] = useState(0);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [specialEffects, setSpecialEffects] = useState<string[]>([]);

  // Refs
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Challenge-specific mechanics
  const applyChallengeMechanics = useCallback(() => {
    // Override default mechanics based on challenge
    if (challenge.mechanics.pipeGap) {
      setPipeGap(challenge.mechanics.pipeGap);
    }
    if (challenge.mechanics.pipeSpeed) {
      setPipeSpeed(challenge.mechanics.pipeSpeed);
    }
  }, [challenge]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameOver || gamePaused) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Update time
    setTime(prev => prev + deltaTime / 1000);
    setChallengeTimer(prev => prev + deltaTime / 1000);

    // Update bird physics
    const gravity = challenge.mechanics.gravity || 0.5;
    const newVelocity = birdVelocity + gravity * deltaTime / 16;
    const newBirdY = birdY + newVelocity * deltaTime / 16;

    setBirdVelocity(newVelocity);
    setBirdY(newBirdY);
    setBirdRotation(Math.min(90, newVelocity * 3));

    // Check collision with ground/ceiling
    if (newBirdY > 400 || newBirdY < 0) {
      setGameOver(true);
      setShowGameOverModal(true);
      // Handle real-time challenge failure
      handleChallengeFail();
      onFail?.('Hit ground or ceiling');
      return;
    }

    // Update pipes
    setPipes(prevPipes => {
      const newPipes = prevPipes.map(pipe => ({
        ...pipe,
        x: pipe.x - pipeSpeed * deltaTime / 16
      })).filter(pipe => pipe.x > -50);

      // Add new pipes
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 300) {
        const newPipe = {
          x: 400,
          topHeight: Math.random() * 200 + 50,
          bottomY: Math.random() * 200 + 250,
          passed: false
        };
        newPipes.push(newPipe);
      }

      return newPipes;
    });

    // Check pipe collisions
    pipes.forEach(pipe => {
      if (pipe.x < 100 && pipe.x > 50) {
        const birdLeft = 50;
        const birdRight = 100;
        const birdTop = newBirdY;
        const birdBottom = newBirdY + 30;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + 50;
        const pipeTop = pipe.topHeight;
        const pipeBottom = pipe.bottomY;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          if (birdTop < pipeTop || birdBottom > pipeBottom) {
            setGameOver(true);
            setShowGameOverModal(true);
            // Handle real-time challenge failure
            handleChallengeFail();
            onFail?.('Hit pipe');
            return;
          }
        }

        // Check if passed pipe
        if (!pipe.passed && pipe.x < 50) {
          pipe.passed = true;
          setPipesPassed(prev => prev + 1);
          setScore(prev => {
            const newScore = prev + 1;
            // Update real-time scoring
            updateRealTimeScore(newScore);
            return newScore;
          });
        }
      }
    });

    // Check challenge completion
    checkChallengeCompletion();

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, gamePaused, birdY, birdVelocity, pipes, pipeSpeed, challenge, onComplete, onFail]);

  // Check challenge completion
  const checkChallengeCompletion = useCallback(() => {
    const { type, value } = challenge.completionCondition;
    
    switch (type) {
      case 'score':
        if (score >= value) {
          setChallengeComplete(true);
          setGameOver(true);
          setShowGameOverModal(true);
          // Handle real-time challenge completion
          handleChallengeComplete(score, time);
          onComplete?.(score, time);
        }
        break;
      case 'time':
        if (challengeTimer >= value) {
          setChallengeComplete(true);
          setGameOver(true);
          setShowGameOverModal(true);
          // Handle real-time challenge completion
          handleChallengeComplete(score, time);
          onComplete?.(score, time);
        }
        break;
      case 'pipes':
        if (pipesPassed >= value) {
          setChallengeComplete(true);
          setGameOver(true);
          setShowGameOverModal(true);
          // Handle real-time challenge completion
          handleChallengeComplete(score, time);
          onComplete?.(score, time);
        }
        break;
      case 'survival':
        if (challengeTimer >= value) {
          setChallengeComplete(true);
          setGameOver(true);
          setShowGameOverModal(true);
          // Handle real-time challenge completion
          handleChallengeComplete(score, time);
          onComplete?.(score, time);
        }
        break;
    }
  }, [challenge, score, time, challengeTimer, pipesPassed, onComplete]);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTime(0);
    setPipesPassed(0);
    setChallengeTimer(0);
    setBirdY(250);
    setBirdVelocity(0);
    setPipes([]);
    applyChallengeMechanics();
    
    // Start real-time scoring session for challenge
    startGameSession('challenge', challenge.id);
    
    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  // Pause/Resume game
  const togglePause = () => {
    setGamePaused(!gamePaused);
  };

  // Restart game
  const restartGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setGamePaused(false);
    setScore(0);
    setTime(0);
    setPipesPassed(0);
    setChallengeTimer(0);
    setBirdY(250);
    setBirdVelocity(0);
    setPipes([]);
    setChallengeComplete(false);
    setShowGameOverModal(false);
  };

  // Handle flap
  const handleFlap = () => {
    if (!gameStarted || gameOver || gamePaused) return;
    
    const flapStrength = challenge.mechanics.flapStrength || -8;
    setBirdVelocity(flapStrength);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleFlap();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver, gamePaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Challenge Panel - Fixed at top */}
      <ChallengePanel
        challenge={challenge}
        challengeState={{
          isActive: gameStarted,
          timeElapsed: time,
          pipesPassed: pipesPassed,
          score: score,
          isCompleted: challengeComplete,
          failed: gameOver
        }}
        gameStarted={gameStarted}
        showMechanicsModal={false}
        onShowMechanics={() => {}}
      />
      
      {/* Game Area - Takes remaining space */}
      <div className="flex-1 relative bg-gradient-to-b from-blue-400 to-purple-600 overflow-hidden">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/challenge')}
          className="absolute top-4 left-4 z-50 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Challenges
        </Button>

        {/* Background */}
        <div className={`absolute inset-0 ${challenge.background || 'bg-gradient-to-b from-sky-400 to-green-400'}`}>
          {/* Challenge-specific background elements */}
        </div>

        {/* Bird */}
        <div
          className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-orange-500 z-10 transition-transform duration-75"
          style={{
            left: '50px',
            top: `${birdY}px`,
            transform: `rotate(${birdRotation}deg)`
          }}
        >
          <div className="w-2 h-2 bg-orange-600 rounded-full absolute top-1 left-1"></div>
        </div>

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <div key={index}>
            {/* Top pipe */}
            <div
              className="absolute bg-green-500 border-2 border-green-600"
              style={{
                left: `${pipe.x}px`,
                top: '0px',
                width: '50px',
                height: `${pipe.topHeight}px`
              }}
            />
            {/* Bottom pipe */}
            <div
              className="absolute bg-green-500 border-2 border-green-600"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.bottomY}px`,
                width: '50px',
                height: `${window.innerHeight - pipe.bottomY}px`
              }}
            />
          </div>
        ))}

        {/* Challenge-specific effects */}
        {specialEffects.map((effect, index) => (
          <div key={index} className="absolute inset-0 pointer-events-none">
            {/* Render special effects based on challenge */}
          </div>
        ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">
                  {challengeComplete ? '🎉' : '💀'}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {challengeComplete ? 'Challenge Complete!' : 'Game Over'}
                </h2>
                <p className="text-gray-600 mb-4">
                  {challengeComplete 
                    ? `You completed ${challenge.name}!` 
                    : `You failed ${challenge.name}`
                  }
                </p>
                <div className="space-y-2 mb-6">
                  <div>Score: {score}</div>
                  <div>Time: {Math.floor(time)}s</div>
                  {challenge.completionCondition.type === 'pipes' && (
                    <div>Pipes Passed: {pipesPassed}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={restartGame} className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/challenge')}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Challenges
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Start Screen */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">{challenge.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{challenge.name}</h2>
                <p className="text-gray-600 mb-4">{challenge.description}</p>
                
                <div className="mb-4">
                  <Badge className={`${
                    challenge.difficulty === 'Easy' ? 'bg-green-500' :
                    challenge.difficulty === 'Medium' ? 'bg-yellow-500' :
                    challenge.difficulty === 'Hard' ? 'bg-orange-500' :
                    'bg-red-500'
                  } text-white`}>
                    {challenge.difficulty}
                  </Badge>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Challenge Rules:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {Object.entries(challenge.rules).map(([key, value]) => (
                      <div key={key}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}: {String(value)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Completion Condition:</h3>
                  <div className="text-sm text-gray-600">
                    {challenge.completionCondition.type === 'score' && `Reach ${challenge.completionCondition.value} points`}
                    {challenge.completionCondition.type === 'time' && `Survive for ${challenge.completionCondition.value} seconds`}
                    {challenge.completionCondition.type === 'pipes' && `Pass ${challenge.completionCondition.value} pipes`}
                    {challenge.completionCondition.type === 'survival' && `Survive for ${challenge.completionCondition.value} seconds`}
                  </div>
                </div>

                <Button onClick={startGame} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Challenge
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pause Overlay */}
        {gamePaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
                <Button onClick={togglePause} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleFlap}
            disabled={!gameStarted || gameOver || gamePaused}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Flap
          </Button>
          <Button
            onClick={togglePause}
            disabled={!gameStarted || gameOver}
            variant="outline"
            className="text-white border-white hover:bg-white/20"
          >
            {gamePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        isVisible={showGameOverModal}
        score={score}
        coins={0}
        totalWallet={balance}
        onRestart={restartGame}
        onHome={() => navigate('/challenge')}
        onShare={() => {}}
        onRevive={() => {}}
        reviveUsed={false}
        level={1}
        bestScore={0}
        extraLives={0}
        onUseExtraLife={() => {}}
        birdSkin=""
        leaderboard={[]}
        onSubmitScore={async () => false}
        isPiUser={false}
        onSignInWithPi={() => {}}
      />
    </div>
  );
};

export default BaseChallengeMode;
