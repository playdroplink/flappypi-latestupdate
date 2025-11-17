import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forceStopAllMusic } from '../hooks/useGlobalMusic';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import { pvpService, Duel, GhostRun } from '../services/pvpService';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Target, 
  Clock,
  Users,
  Crown,
  Zap,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Game constants
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 800;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const PIPE_WIDTH = 80;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -8;
const SCROLL_SPEED = 4;

interface GameState {
  birdY: number;
  birdVelocity: number;
  pipes: Array<{ x: number; gapY: number }>;
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
  ghostBirdY: number;
  ghostBirdVelocity: number;
  ghostPipes: Array<{ x: number; gapY: number }>;
  ghostScore: number;
  ghostFlapTimestamps: number[];
  currentFrame: number;
  totalFrames: number;
}

const PvPDuelPlayPage: React.FC = () => {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, piUser } = useAuth();
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const gameStartTimeRef = useRef<number>(0);
  const flapTimestampsRef = useRef<number[]>([]);
  const birdPositionsRef = useRef<{ x: number; y: number }[]>([]);
  const pipePositionsRef = useRef<{ x: number; y: number; gap_y: number }[]>([]);

  // State
  const [duel, setDuel] = useState<Duel | null>(null);
  const [ghostRun, setGhostRun] = useState<GhostRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [{ x: CANVAS_WIDTH + 100, gapY: CANVAS_HEIGHT / 2 }],
    score: 0,
    gameOver: false,
    gameStarted: false,
    ghostBirdY: CANVAS_HEIGHT / 2,
    ghostBirdVelocity: 0,
    ghostPipes: [{ x: CANVAS_WIDTH + 100, gapY: CANVAS_HEIGHT / 2 }],
    ghostScore: 0,
    ghostFlapTimestamps: [],
    currentFrame: 0,
    totalFrames: 0
  });
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const currentUser = piUser || profile;
  const userId = currentUser?.id || currentUser?.user_id;

  useEffect(() => {
    if (!duelId) {
      navigate(ROUTES.HOME);
      return;
    }

    loadDuelData();
  }, [duelId]);

  const loadDuelData = async () => {
    try {
      const duelData = await pvpService.getDuel(duelId!);
      if (!duelData) {
        toast({
          title: 'Error',
          description: 'Duel not found.',
          variant: 'destructive'
        });
        navigate(ROUTES.PVP_DUELS);
        return;
      }

      setDuel(duelData);

      // Load ghost run data
      if (duelData.ghost_run_id) {
        const ghostData = await pvpService.getGhostRun(duelData.ghost_run_id);
        if (ghostData) {
          setGhostRun(ghostData);
          setGameState(prev => ({
            ...prev,
            ghostFlapTimestamps: ghostData.run_data.flap_timestamps || [],
            totalFrames: ghostData.run_data.bird_positions?.length || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error loading duel data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load duel data.',
        variant: 'destructive'
      });
      navigate(ROUTES.PVP_DUELS);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    // Force stop all background music when game starts
    forceStopAllMusic();
    
    setGameState(prev => ({ ...prev, gameStarted: true }));
    setShowInstructions(false);
    gameStartTimeRef.current = Date.now();
    startGameLoop();
  };

  const startGameLoop = () => {
    const gameLoop = () => {
      if (isPaused) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      updateGame();
      renderGame();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();
  };

  const updateGame = () => {
    setGameState(prev => {
      if (prev.gameOver) return prev;

      // Update player bird
      const newBirdY = prev.birdY + prev.birdVelocity;
      const newBirdVelocity = prev.birdVelocity + GRAVITY;

      // Update ghost bird
      let newGhostBirdY = prev.ghostBirdY;
      let newGhostBirdVelocity = prev.ghostBirdVelocity;
      let newGhostScore = prev.ghostScore;

      if (ghostRun && prev.currentFrame < prev.totalFrames) {
        const ghostPositions = ghostRun.run_data.bird_positions;
        const ghostPipes = ghostRun.run_data.pipe_positions;
        
        if (ghostPositions && ghostPositions[prev.currentFrame]) {
          newGhostBirdY = ghostPositions[prev.currentFrame].y;
        }
        
        if (ghostPipes && ghostPipes[prev.currentFrame]) {
          // Update ghost pipes based on recorded data
          const newGhostPipes = ghostPipes
            .filter((pipe: any) => pipe.x > -100)
            .map((pipe: any) => ({ x: pipe.x, gapY: pipe.gap_y }));
          
          // Update ghost score based on pipes passed
          if (newGhostPipes.length > 0 && newGhostPipes[0].x < 200) {
            newGhostScore = Math.floor(prev.currentFrame / 60); // Rough score calculation
          }
        }
      }

      // Update pipes
      const newPipes = prev.pipes.map(pipe => ({
        ...pipe,
        x: pipe.x - SCROLL_SPEED
      })).filter(pipe => pipe.x > -PIPE_WIDTH);

      // Add new pipes
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 300) {
        newPipes.push({
          x: CANVAS_WIDTH + 100,
          gapY: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50
        });
      }

      // Update ghost pipes
      const newGhostPipes = prev.ghostPipes.map(pipe => ({
        ...pipe,
        x: pipe.x - SCROLL_SPEED
      })).filter(pipe => pipe.x > -PIPE_WIDTH);

      // Collision detection
      const birdRect = {
        x: 100,
        y: newBirdY,
        width: BIRD_WIDTH,
        height: BIRD_HEIGHT
      };

      const collision = newPipes.some(pipe => {
        const topPipe = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapY };
        const bottomPipe = { 
          x: pipe.x, 
          y: pipe.gapY + PIPE_GAP, 
          width: PIPE_WIDTH, 
          height: CANVAS_HEIGHT - pipe.gapY - PIPE_GAP 
        };

        return (
          birdRect.x < topPipe.x + topPipe.width &&
          birdRect.x + birdRect.width > topPipe.x &&
          birdRect.y < topPipe.y + topPipe.height &&
          birdRect.y + birdRect.height > topPipe.y
        ) || (
          birdRect.x < bottomPipe.x + bottomPipe.width &&
          birdRect.x + birdRect.width > bottomPipe.x &&
          birdRect.y < bottomPipe.y + bottomPipe.height &&
          birdRect.y + birdRect.height > bottomPipe.y
        );
      });

      // Update score
      let newScore = prev.score;
      newPipes.forEach(pipe => {
        if (pipe.x + PIPE_WIDTH < 100 && pipe.x + PIPE_WIDTH >= 100 - SCROLL_SPEED) {
          newScore++;
        }
      });

      // Check game over
      const isGameOver = collision || newBirdY < 0 || newBirdY + BIRD_HEIGHT > CANVAS_HEIGHT;

      return {
        ...prev,
        birdY: newBirdY,
        birdVelocity: newBirdVelocity,
        pipes: newPipes,
        score: newScore,
        gameOver: isGameOver,
        ghostBirdY: newGhostBirdY,
        ghostBirdVelocity: newGhostBirdVelocity,
        ghostPipes: newGhostPipes,
        ghostScore: newGhostScore,
        currentFrame: prev.currentFrame + 1
      };
    });
  };

  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    gameState.pipes.forEach(pipe => {
      // Top pipe
      ctx.fillStyle = '#228B22';
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
      
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);
    });

    // Draw ghost pipes (semi-transparent)
    gameState.ghostPipes.forEach(pipe => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);
    });

    // Draw ghost bird (semi-transparent)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(100, gameState.ghostBirdY, BIRD_WIDTH, BIRD_HEIGHT);

    // Draw player bird
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(100, gameState.birdY, BIRD_WIDTH, BIRD_HEIGHT);

    // Draw scores
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`You: ${gameState.score}`, 10, 30);
    ctx.fillText(`Ghost: ${gameState.ghostScore}`, 10, 60);
  };

  const handleFlap = () => {
    if (gameState.gameOver || !gameState.gameStarted) return;

    const currentTime = Date.now() - gameStartTimeRef.current;
    flapTimestampsRef.current.push(currentTime);

    setGameState(prev => ({
      ...prev,
      birdVelocity: FLAP_STRENGTH
    }));
  };

  const handleGameOver = async () => {
    if (!duel || !ghostRun) return;

    // Record player's run data
    const runData = pvpService.recordGameRun(
      flapTimestampsRef.current,
      birdPositionsRef.current,
      pipePositionsRef.current,
      Date.now() - gameStartTimeRef.current
    );

    // Complete the duel
    const success = await pvpService.completeDuel(
      duel.id,
      gameState.score,
      runData,
      Date.now() - gameStartTimeRef.current
    );

    if (success) {
      setShowResults(true);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to complete duel. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleRestart = () => {
    setGameState({
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [{ x: CANVAS_WIDTH + 100, gapY: CANVAS_HEIGHT / 2 }],
      score: 0,
      gameOver: false,
      gameStarted: false,
      ghostBirdY: CANVAS_HEIGHT / 2,
      ghostBirdVelocity: 0,
      ghostPipes: [{ x: CANVAS_WIDTH + 100, gapY: CANVAS_HEIGHT / 2 }],
      ghostScore: 0,
      ghostFlapTimestamps: gameState.ghostFlapTimestamps,
      currentFrame: 0,
      totalFrames: gameState.totalFrames
    });
    flapTimestampsRef.current = [];
    birdPositionsRef.current = [];
    pipePositionsRef.current = [];
    setShowResults(false);
  };

  const handleBackToDuels = () => {
    navigate(ROUTES.PVP_DUELS);
  };

  // Handle game over
  useEffect(() => {
    if (gameState.gameOver) {
      handleGameOver();
    }
  }, [gameState.gameOver]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Loading Duel...</p>
        </div>
      </div>
    );
  }

  const isWinner = gameState.score > gameState.ghostScore;
  const isTie = gameState.score === gameState.ghostScore;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={handleBackToDuels} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Duels
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">PvP Duel</h1>
            {duel && (
              <p className="text-gray-600">
                {duel.challenger_username} vs {duel.opponent_username}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            {gameState.gameStarted && !gameState.gameOver && (
              <Button onClick={() => setIsPaused(!isPaused)} variant="outline">
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-4 border-gray-800 rounded-lg shadow-lg"
              onClick={handleFlap}
              style={{ cursor: 'pointer' }}
            />
            
            {!gameState.gameStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <Target className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Ready to Duel?</h2>
                  <p className="mb-4">Click to flap and beat the ghost run!</p>
                  <Button onClick={startGame} size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Start Duel
                  </Button>
                </div>
              </div>
            )}

            {gameState.gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <Trophy className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Duel Complete!</h2>
                  <p className="mb-4">
                    Final Score: {gameState.score} vs {gameState.ghostScore}
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={handleRestart} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rematch
                    </Button>
                    <Button onClick={handleBackToDuels}>
                      Back to Duels
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Your Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{gameState.score}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span>Ghost Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-600">{gameState.ghostScore}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span>Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress 
                value={(gameState.currentFrame / gameState.totalFrames) * 100} 
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Frame {gameState.currentFrame} / {gameState.totalFrames}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span>How to Play</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Your Bird (Yellow)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click to flap and avoid pipes</li>
                  <li>• Try to beat the ghost's score</li>
                  <li>• Higher score wins the duel</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ghost Bird (White)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Replay of your opponent's run</li>
                  <li>• Semi-transparent for visibility</li>
                  <li>• Compare your performance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {isWinner ? (
                <>
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <span>Victory!</span>
                </>
              ) : isTie ? (
                <>
                  <Target className="w-6 h-6 text-blue-500" />
                  <span>It's a Tie!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-500" />
                  <span>Defeat</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isWinner 
                ? "Congratulations! You won the duel!" 
                : isTie 
                ? "Great match! It ended in a tie."
                : "Better luck next time! The ghost won this round."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Your Score</p>
                  <p className="text-2xl font-bold text-blue-600">{gameState.score}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600">Ghost Score</p>
                  <p className="text-2xl font-bold text-gray-600">{gameState.ghostScore}</p>
                </CardContent>
              </Card>
            </div>

            {isWinner && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Rewards Earned!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  You earned 3 Pi Tips for winning this duel!
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Rematch
              </Button>
              <Button onClick={handleBackToDuels} variant="outline" className="flex-1">
                Back to Duels
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PvPDuelPlayPage; 