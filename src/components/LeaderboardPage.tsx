import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Calendar, User, Gamepad2, Timer, Star, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { unifiedLeaderboardService } from '@/services/unifiedLeaderboardService';
import { LeaderboardEntry, UserStats, Achievement, GameMode, LeaderboardFilter } from '@/types/leaderboard';

const LeaderboardPage: React.FC = () => {
  const { piUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'all-time' | 'daily' | 'my-stats'>('all-time');
  const [gameMode, setGameMode] = useState<GameMode | 'all'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = async (isDaily: boolean = false) => {
    try {
      const filter: Partial<LeaderboardFilter> = {
        game_mode: gameMode,
        time_period: isDaily ? 'daily' : 'all_time',
        limit: 50,
        offset: 0
      };

      const result = await unifiedLeaderboardService.getLeaderboard(filter);
      
      if (!result.success) {
        throw new Error(result.error || `Failed to fetch ${isDaily ? 'daily ' : ''}leaderboard`);
      }
      
      if (isDaily) {
        setDailyLeaderboard(result.data || []);
      } else {
        setLeaderboard(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!isAuthenticated || !piUser?.uid) return;

    try {
      const result = await unifiedLeaderboardService.getUserStats(piUser.uid);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user stats');
      }
      
      setUserStats(result.data || null);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  // Fetch user achievements
  const fetchAchievements = async () => {
    if (!isAuthenticated || !piUser?.uid) return;

    try {
      // Placeholder for achievements - will be implemented when achievements system is ready
      setAchievements([]);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  // Load data on component mount and tab/mode changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchLeaderboard(false), // All-time
          fetchLeaderboard(true),  // Daily
          fetchUserStats(),
          fetchAchievements()
        ]);
      } catch (err) {
        console.error('Error loading leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [gameMode, isAuthenticated, piUser]);

  // Refresh data
  const refreshData = () => {
    fetchLeaderboard(activeTab === 'daily');
    if (activeTab === 'my-stats') {
      fetchUserStats();
      fetchAchievements();
    }
  };

  // Render rank icon
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
    }
  };

  // Render game mode badge
  const getGameModeBadge = (mode: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      classic: { color: 'bg-blue-100 text-blue-800', label: 'Classic' },
      endless: { color: 'bg-indigo-100 text-indigo-800', label: 'Endless' },
      screampi: { color: 'bg-purple-100 text-purple-800', label: 'ScreamPi' },
      dinopi: { color: 'bg-green-100 text-green-800', label: 'DinoPi' },
      challenge: { color: 'bg-orange-100 text-orange-800', label: 'Challenge' },
      'flappy-stack': { color: 'bg-red-100 text-red-800', label: 'Flappy Stack' },
      'night-mode': { color: 'bg-gray-100 text-gray-800', label: 'Night Mode' }
    };

    const variant = variants[mode] || { color: 'bg-gray-100 text-gray-800', label: mode };
    
    return (
      <Badge className={`${variant.color} text-xs`}>
        {variant.label}
      </Badge>
    );
  };

  // Format score with commas
  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  // Render leaderboard table
  const renderLeaderboardTable = (entries: LeaderboardEntry[], title: string) => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No scores yet. Be the first to play!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
          >
            Refresh
          </Button>
        </div>
        
        {entries.map((entry, index) => {
          const rank = entry.rank || index + 1;
          const isCurrentUser = isAuthenticated && entry.pi_user_id === piUser?.uid;
          
          return (
            <Card key={entry.id} className={`${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  {getRankIcon(rank)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {entry.username || `Player ${entry.pi_user_id?.slice(0, 8)}`}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getGameModeBadge(entry.game_mode)}
                      <span className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    {formatScore(entry.score)}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Flappy Pi Leaderboard
            </CardTitle>
            <CardDescription>
              Compete with players worldwide and climb the ranks!
            </CardDescription>
          </CardHeader>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <span className="text-sm">{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshData}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Mode Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Game Mode:</span>
              <div className="flex space-x-2">
                {['all', 'classic', 'endless', 'screampi', 'dinopi', 'challenge'].map((mode) => (
                  <Button
                    key={mode}
                    variant={gameMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGameMode(mode as typeof gameMode)}
                    className="capitalize"
                  >
                    <Gamepad2 className="w-4 h-4 mr-1" />
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all-time" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>All Time</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Daily</span>
            </TabsTrigger>
            <TabsTrigger value="my-stats" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>My Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* All Time Leaderboard */}
          <TabsContent value="all-time">
            <Card>
              <CardContent className="p-6">
                {renderLeaderboardTable(leaderboard, 'All-Time Top Players')}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Leaderboard */}
          <TabsContent value="daily">
            <Card>
              <CardContent className="p-6">
                {renderLeaderboardTable(dailyLeaderboard, "Today's Top Players")}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Stats */}
          <TabsContent value="my-stats">
            {!isAuthenticated ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    Sign in with Pi Network to view your statistics
                  </p>
                  <Button>Sign In with Pi</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* User Statistics */}
                {userStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Your Statistics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatScore(userStats.best_score)}
                          </div>
                          <div className="text-sm text-gray-600">Best Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            #{userStats.rank_position || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Global Rank</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {userStats.total_games}
                          </div>
                          <div className="text-sm text-gray-600">Games Played</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {userStats.games_today}
                          </div>
                          <div className="text-sm text-gray-600">Games Today</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Achievements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {achievements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No achievements yet. Keep playing to unlock them!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                          <Card key={achievement.id} className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl">{achievement.icon}</div>
                                <div>
                                  <div className="font-semibold text-yellow-800">
                                    {achievement.title}
                                  </div>
                                  <div className="text-sm text-yellow-600">
                                    {achievement.description}
                                  </div>
                                  <div className="text-xs text-yellow-500 mt-1">
                                    Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaderboardPage;