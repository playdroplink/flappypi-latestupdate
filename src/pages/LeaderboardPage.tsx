import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, Crown, Medal, Star, RotateCw, Wifi, WifiOff, Activity, User, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { useAuth } from '../context/AuthContext';
import { leaderboardService } from '@/services/leaderboardServiceNew';
import { useRealLeaderboard } from '../hooks/useRealLeaderboard';
// Import leaderboard WebSocket hook
import { useLeaderboardWebSocket } from '../hooks/useLeaderboardWebSocket';
import BackgroundDecoration from '../components/home/BackgroundDecoration';
import LeaderboardRewardsModal from '../components/LeaderboardRewardsModal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import EnhancedFooter from '../components/EnhancedFooter';
import { getFlappyCoinRewardForRank } from '@/utils/leaderboardRewards';
import FooterNPC from '../components/FooterNPC';
import SkyBackground from '../components/SkyBackground';
import { useSettings } from '../hooks/useSettings';
import RealLeaderboardTest from '../components/RealLeaderboardTest';

type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

const coinBalance = 1000000;

const rankColors = [
  'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900', // 1st
  'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900',      // 2nd
  'bg-gradient-to-r from-orange-700 to-yellow-500 text-orange-100',// 3rd
  'bg-blue-700 text-white',
  'bg-blue-600 text-white',
  'bg-blue-500 text-white',
  'bg-blue-400 text-white',
  'bg-blue-300 text-white',
  'bg-blue-200 text-white',
];

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const gameState = useGameState();
  const { playSwoosh } = useSoundEffects();
  const { isPlaying, currentTrack } = useGlobalMusic();
  const { isAuthenticated, isPiAuth, piUser } = useAuth();
  const [localScores, setLocalScores] = useState([]);
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('all-time');
  const { settings } = useSettings();
  const theme = settings.theme === 'night' ? 'night' : (settings.theme === 'dark' ? 'dark' : 'light');

  // Use real leaderboard hook
  const {
    leaderboard,
    loading,
    userStats,
    userRank,
    isConnected,
    lastUpdate,
    fetchLeaderboard,
    submitScore
  } = useRealLeaderboard(rankingPeriod === 'all-time' ? 'all' : 'classic');

  // Real-time leaderboard WebSocket
  const socketHook = useLeaderboardWebSocket({
    gameMode: rankingPeriod,
    autoConnect: true,
    autoJoin: true
  });

  const {
    isConnected: socketConnected = false,
    socketId = null,
    leaderboard: realtimeLeaderboard = [],
    userRank: realtimeUserRank = null,
    totalPlayers = 0,
    lastUpdate: socketLastUpdate = null,
    error: socketError = null,
    isSubmitting = false,
    submitScore: socketSubmitScore = () => {},
    refreshLeaderboard: socketRefreshLeaderboard = () => {},
    getUserRank = () => {}
  } = socketHook || {};
  
  // Define clearError function locally if needed
  const clearError = () => {
    console.log('Clearing socket error...');
  };

  // Real leaderboard is now handled by the useRealLeaderboard hook

  useEffect(() => {
    fetchLeaderboard();
  }, [rankingPeriod, fetchLeaderboard]);

  // Real-time updates are now handled by the useRealLeaderboard hook

  const handleRankingPeriodChange = (period: RankingPeriod) => {
    setRankingPeriod(period);
    fetchLeaderboard();
  };

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('flappypi-guest-scores') || '[]');
    setLocalScores(scores);
  }, []);

  const handleBack = () => {
    playSwoosh();
    navigate(-1); // Go back to the previous page
  };

  // Real-time score submission function
  const handleRealtimeScoreSubmission = (scoreData: {
    pi_user_id: string;
    username: string;
    score: number;
    game_mode: string;
    challenge_type?: string;
  }) => {
    if (isConnected) {
      submitScore(
        scoreData.pi_user_id,
        scoreData.username, 
        scoreData.score,
        scoreData.game_mode as 'classic' | 'endless' | 'challenge',
        scoreData.challenge_type
      );
    } else {
      console.warn('Cannot submit score: not connected to real-time server');
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Trophy className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3: return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
      default: return 'bg-white';
    }
  };


  return (
    <SkyBackground theme={theme as 'light' | 'night'}>
      <div className="flex-1 flex flex-col items-center justify-start">
        <div className="flex w-full justify-start items-center px-4 mt-4">
          <Button variant="outline" size="sm" onClick={handleBack} className="mr-2"><ArrowLeft className="w-5 h-5" />Back</Button>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-yellow-400 drop-shadow-lg tracking-wide mb-4 sm:mb-8 mt-4 sm:mt-8 text-center" style={{ textShadow: '2px 4px 0 #2b3990' }}>LEADERBOARDS</h1>
        
        {/* Ranking Period Tabs */}
        <div className="mb-6 w-full max-w-2xl">
          <Tabs value={rankingPeriod} onValueChange={handleRankingPeriodChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="daily" className="text-sm font-medium">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-sm font-medium">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-sm font-medium">Monthly</TabsTrigger>
              <TabsTrigger value="all-time" className="text-sm font-medium">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <LeaderboardRewardsModal />
          
          {/* Real-time Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Live</span>
                {lastUpdate && (
                  <span className="text-xs text-white/70">
                    Updated {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Offline</span>
              </>
            )}
          </div>

          <Button 
            onClick={() => {
              if (isConnected) {
                fetchLeaderboard();
              } else {
                fetchLeaderboard();
              }
            }} 
            disabled={loading || isSubmitting} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RotateCw className={loading || isSubmitting ? 'animate-spin' : ''} />
            {loading || isSubmitting ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl flex flex-col items-center border-2 sm:border-4 border-blue-900 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-8 right-8 w-6 h-6 bg-yellow-300 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-4 left-8 w-4 h-4 bg-yellow-500 rounded-full opacity-25 animate-pulse"></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-4 sm:mb-6 gap-2 sm:gap-0">
            <span className="text-lg sm:text-2xl font-bold text-white text-center sm:text-left drop-shadow-lg">HIGH SCORES REWARD POOL</span>
            <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-2">
              <img src="/flappycoins.png" alt="Coin" className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce" />
              <span className="text-yellow-300 text-lg sm:text-2xl font-bold drop-shadow-lg">{coinBalance.toLocaleString()}</span>
            </div>
          </div>
          {/* Pi Reward Pool Section */}
          <div className="w-full flex flex-col items-center mb-6">
            <div className="bg-gradient-to-r from-yellow-300 via-purple-200 to-yellow-100 border-2 border-yellow-400 rounded-2xl shadow-2xl px-6 py-6 flex flex-col items-center w-full max-w-md relative">
              <div className="flex items-center gap-3 mb-2">
                <img src="/pi-logo.png" alt="Pi Network" className="w-10 h-10 sm:w-12 sm:h-12" onError={e => {e.currentTarget.style.display='none'}} />
                <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 tracking-wide">Pi Reward Pool</span>
                <span className="ml-2 px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-bold border border-yellow-300 animate-pulse">Coming Soon</span>
              </div>
              <div className="flex items-center gap-2 mt-4 mb-2">
                <span className="text-6xl sm:text-7xl font-black text-yellow-500 drop-shadow-lg animate-pulse-glow" style={{textShadow: '0 0 16px #a78bfa, 0 0 32px #fde047'}}>?</span>
                <span className="text-3xl sm:text-4xl font-bold text-purple-700">π</span>
              </div>
              <div className="text-xs text-purple-800 mt-2 text-center">POOL WILL BE FILLED SOON</div>
            </div>
          </div>
          {/* End Pi Reward Pool Section */}
          
          {/* Pi Authentication Status Section */}
          <div className="w-full flex flex-col items-center mb-6">
            <div className="bg-gradient-to-r from-green-300 via-blue-200 to-green-100 border-2 border-green-400 rounded-2xl shadow-2xl px-6 py-4 flex flex-col items-center w-full max-w-md relative">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-extrabold text-blue-700 tracking-wide">Pi Authentication</span>
                {isAuthenticated && isPiAuth ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="text-center">
                {isAuthenticated && isPiAuth ? (
                  <div className="text-green-700 font-semibold">
                    ✅ Authenticated with Pi Network
                    {piUser && (
                      <div className="text-sm text-green-600 mt-1">
                        Welcome, {piUser.username || 'Pi User'}!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700 font-semibold">
                    ❌ Not authenticated with Pi Network
                    <div className="text-sm text-red-600 mt-1">
                      Sign in to participate in Pi rewards
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* End Pi Authentication Status Section */}
          
          {/* Score Card List */}
          <div className="w-full mt-2">
            <div className="rounded-2xl bg-gradient-to-b from-blue-800 via-blue-700 to-blue-600 shadow-xl p-2 sm:p-4">
              <div className="flex items-center justify-between px-2 sm:px-6 py-2 border-b border-blue-400 mb-2">
                <span className="text-lg sm:text-xl font-bold text-white tracking-wide">HIGH SCORES</span>
                <div className="flex items-center gap-2">
                  <img src="/flappycoins.png" alt="Coin" className="w-5 h-5" />
                  <span className="text-yellow-300 text-lg font-bold">{coinBalance.toLocaleString()}</span>
                </div>
              </div>
              {/* Connection Status Indicator */}
              <div className="mb-4 flex items-center justify-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <Wifi className="w-4 h-4" />
                    <span>Live Leaderboard</span>
                    {lastUpdate && (
                      <span className="text-xs text-green-600">
                        Updated {new Date(lastUpdate).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                    <WifiOff className="w-4 h-4" />
                    <span>Offline Mode</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-white text-lg font-semibold mb-2">Loading leaderboard...</div>
                  <div className="text-blue-200 text-sm">Fetching real scores from all players</div>
                </div>
              ) : leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  let rankBg = '';
                  let rankText = 'text-white';
                  if (rank === 1) { rankBg = 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300'; rankText = 'text-yellow-900'; }
                  else if (rank === 2) { rankBg = 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-300'; rankText = 'text-gray-900'; }
                  else if (rank === 3) { rankBg = 'bg-gradient-to-br from-orange-700 to-yellow-500 border-orange-300'; rankText = 'text-orange-100'; }
                  else { rankBg = 'bg-blue-500 border-blue-300'; }
                  return (
                    <div key={entry.id} className="flex items-center justify-between px-2 sm:px-6 py-3 mb-2 rounded-xl shadow-lg bg-blue-600 bg-opacity-80 relative overflow-hidden group hover:scale-105 transition-all duration-300" style={{ minHeight: 56 }}>
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-extrabold text-lg sm:text-xl ${rankBg} ${rankText} shadow-lg`}>
                          {rank < 4 ? (
                            rank === 1 ? <Crown className="w-5 h-5 text-yellow-400" /> :
                            rank === 2 ? <Medal className="w-5 h-5 text-gray-300" /> :
                            <Medal className="w-5 h-5 text-amber-600" />
                          ) : rank}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-white ml-1 drop-shadow-lg">{entry.username}</span>
                        <span className="text-sm text-blue-200">Score: {entry.highest_score}</span>
                      </div>
                      <span className="text-lg sm:text-xl font-extrabold text-yellow-300 flex items-center gap-1 relative z-10 drop-shadow-lg">
                        <img src="/flappycoins.png" alt="FC" className="w-5 h-5 inline-block align-middle animate-bounce" />
                        {getFlappyCoinRewardForRank ? getFlappyCoinRewardForRank(rank) : 0} FC
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-white text-lg font-semibold mb-2">
                    {isConnected ? 'No scores yet' : 'Leaderboard unavailable'}
                  </div>
                  <div className="text-blue-200 text-sm">
                    {isConnected 
                      ? 'Be the first to play and set a high score!' 
                      : 'Unable to connect to the leaderboard. Please check your connection.'
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* End Score Card List */}
          {/* Add a note about Pi rewards coming soon */}
          <div className="w-full text-center mt-4">
            <span className="text-purple-700 text-sm font-bold">POOL WILL BE FILLED SOON!</span>
          </div>
        </div>
      </div>
      
      {/* Development Test Component */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 w-full max-w-4xl mx-auto px-4">
          <RealLeaderboardTest />
        </div>
      )}
      
      {localScores.length > 0 && (
        <div className="mt-8 w-full max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-purple-700 mb-2">Your Local Scores</h2>
          <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 shadow-lg p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-purple-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-purple-100">
                  {localScores.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-purple-50 transition">
                      <td className="px-6 py-4 text-lg font-bold text-purple-900">{entry.score}</td>
                      <td className="px-6 py-4 text-base text-blue-700">{entry.level}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(entry.date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => {/* maybe add delete or share */}} disabled>...</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* FooterNPC above the footer */}
      <FooterNPC
        npcType="default"
        npcName="Leaderboard NPC"
        dialogs={[
          "Welcome to the Leaderboard! See how you rank!",
          "Check out the top players in Flappy Pi!",
          "Your score determines your ranking!",
          "Global leaderboards show the best players!",
          "Local leaderboards show your friends!",
          "Daily rankings reset every day!",
          "Weekly rankings reset every week!",
          "Monthly rankings reset every month!",
          "All-time rankings are permanent!",
          "Higher scores mean better rankings!",
          "You can compete with friends!",
          isConnected ? "Leaderboards are updated in real-time! 🚀" : "Leaderboards update when you refresh!",
          isConnected ? "Live updates show instant changes! ⚡" : "Check your position regularly!",
          totalPlayers > 0 ? `There are ${totalPlayers} players on the leaderboard!` : "Try to beat your personal best!",
          "Some players are incredibly skilled!",
          "Practice makes perfect!",
          "Every point counts for ranking!",
          "You can filter by game mode!",
          "Different modes have different rankings!",
          "Challenge yourself to climb higher!",
          isConnected ? "The leaderboard updates live! 🔥" : "The leaderboard is always changing!",
          "New records are set every day!",
          "You can see detailed statistics!",
          "Compare your scores with others!",
          "The leaderboard motivates improvement!",
          "Keep trying to reach the top!",
          "Your ranking reflects your skill!",
          "Leaderboards make the game competitive!",
          "Good luck climbing the ranks!",
          "Keep flapping and keep climbing!"
        ]}
      />
      <EnhancedFooter 
        musicEnabled={false}
        setMusicEnabled={() => {}}
        soundEnabled={false}
        setSoundEnabled={() => {}}
      />
    </SkyBackground>
  );
};

export default LeaderboardPage;
