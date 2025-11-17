import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import { pvpService, Duel, DuelStats, Tournament } from '../services/pvpService';
import { ROUTES } from '../constants/routes';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  Star,
  Sword,
  Shield,
  Zap,
  Crown,
  Calendar,
  Award,
  BarChart3,
  Play,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const PvPDuelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, piUser } = useAuth();
  const { profile } = useUserProfile();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();

  // Debug log: component mount
  console.log('[PvPDuelsPage] Mounted');

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [duels, setDuels] = useState<Duel[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [duelStats, setDuelStats] = useState<DuelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDuel, setShowCreateDuel] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [opponentSearch, setOpponentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([]);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log('[PvPDuelsPage] useEffect: showSplash true, setting timeout');
    const timer = setTimeout(() => {
      setShowSplash(false);
      console.log('[PvPDuelsPage] Splash finished');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const currentUser = piUser || profile;
  const userId = currentUser?.id || currentUser?.user_id;

  useEffect(() => {
    console.log('[PvPDuelsPage] useEffect: userId:', userId);
    console.log('[PvPDuelsPage] Loading PvP data...');
    loadPvPData();
  }, [userId]);

  const loadPvPData = async () => {
    setLoading(true);
    try {
      console.log('[PvPDuelsPage] loadPvPData: fetching data...');
      const [duelsData, tournamentsData, statsData] = await Promise.all([
        pvpService.getUserDuels(userId),
        pvpService.getActiveTournaments(),
        pvpService.getDuelStats(userId)
      ]);
      setDuels(duelsData);
      setTournaments(tournamentsData);
      setDuelStats(statsData);
      console.log('[PvPDuelsPage] loadPvPData: data loaded', { duelsData, tournamentsData, statsData });
    } catch (error) {
      console.error('[PvPDuelsPage] Error loading PvP data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PvP data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      console.log('[PvPDuelsPage] loadPvPData: loading set to false');
    }
  };

  const handleSearchOpponents = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await pvpService.searchUsers(query);
      setSearchResults(results.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error searching opponents:', error);
    }
  };

  const handleCreateDuel = async () => {
    if (!selectedOpponent) {
      toast({
        title: 'Error',
        description: 'Please select an opponent.',
        variant: 'destructive'
      });
      return;
    }

    // For now, we'll create a mock ghost run
    // In a real implementation, this would be created after a game session
    const mockGhostRun = await pvpService.createGhostRun(
      userId,
      currentUser?.username || 'Anonymous',
      42, // Mock score
      pvpService.recordGameRun([], [], [], 30000), // Mock run data
      30000, // 30 seconds
      true
    );

    if (!mockGhostRun) {
      toast({
        title: 'Error',
        description: 'Failed to create ghost run. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    const selectedUser = searchResults.find(user => user.id === selectedOpponent);
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Selected opponent not found.',
        variant: 'destructive'
      });
      return;
    }

    const duel = await pvpService.createDuel(
      userId,
      currentUser?.username || 'Anonymous',
      selectedUser.id,
      selectedUser.username,
      mockGhostRun.id
    );

    if (duel) {
      toast({
        title: 'Duel Created!',
        description: `Challenge sent to ${selectedUser.username}!`,
      });
      setShowCreateDuel(false);
      setSelectedOpponent('');
      setOpponentSearch('');
      loadPvPData(); // Refresh the list
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create duel. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleAcceptDuel = async (duel: Duel) => {
    const success = await pvpService.acceptDuel(duel.id, userId);
    if (success) {
      toast({
        title: 'Duel Accepted!',
        description: 'Get ready to compete!',
      });
      navigate(`${ROUTES.PVP_DUEL_PLAY.replace(':duelId', duel.id)}`);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to accept duel. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeclineDuel = async (duel: Duel) => {
    const success = await pvpService.declineDuel(duel.id, userId);
    if (success) {
      toast({
        title: 'Duel Declined',
        description: 'The duel has been declined.',
      });
      loadPvPData();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to decline duel. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const getDuelStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getDuelStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'completed': return 'Completed';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-200 to-blue-400">
        <img 
          src="/flappy pi gif/flappy-2.gif.gif" 
          alt="Flappy Pi Bird" 
          className="w-24 h-24 mb-6 animate-bounce"
          onError={(e) => {
            console.warn('❌ Flappy Pi GIF failed to load in PvPDuelsPage splash, using fallback');
            e.currentTarget.src = '/flappy-logo.png';
          }}
        />
        <div className="text-3xl font-bold text-blue-800 mb-2">Loading Duels...</div>
        <div className="w-48 h-3 bg-blue-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '80%' }} />
        </div>
        <div className="text-blue-600 text-sm">Preparing your PvP adventure...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Loading PvP Duels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      {/* Back to Home Button */}
      <div className="pt-4 pl-4">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 font-bold rounded-lg shadow hover:bg-blue-100 transition"
        >
          <span className="text-xl">←</span> Back to Home
        </button>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Sword className="w-8 h-8 mr-3 text-blue-600" />
            PvP Duels
          </h1>
          <p className="text-gray-600 text-lg">
            Challenge friends and compete in asynchronous battles!
          </p>
        </div>

        {/* Stats Overview */}
        {duelStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Duels</p>
                    <p className="text-2xl font-bold text-gray-800">{duelStats.total_duels}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Duels Won</p>
                    <p className="text-2xl font-bold text-gray-800">{duelStats.duels_won}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-800">{duelStats.win_rate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Score</p>
                    <p className="text-2xl font-bold text-gray-800">{duelStats.average_score.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="duels" className="flex items-center space-x-2">
              <Sword className="w-4 h-4" />
              <span className="hidden sm:inline">My Duels</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Tournaments</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setShowCreateDuel(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Challenge a Friend
                  </Button>
                  
                  <Button 
                    onClick={() => navigate(ROUTES.PVP_TOURNAMENTS)}
                    variant="outline"
                    className="w-full"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Join Tournament
                  </Button>

                  <Button 
                    onClick={() => navigate(ROUTES.PVP_LEADERBOARD)}
                    variant="outline"
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Leaderboard
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {duels.slice(0, 5).map((duel) => (
                      <div key={duel.id} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <Badge className={getDuelStatusColor(duel.status)}>
                            {getDuelStatusText(duel.status)}
                          </Badge>
                          <div>
                            <p className="font-medium text-gray-800">
                              {duel.challenger_id === userId ? duel.opponent_username : duel.challenger_username}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(duel.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {duel.status === 'pending' && duel.opponent_id === userId && (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleAcceptDuel(duel)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeclineDuel(duel)}>
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {duels.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No recent duels</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Duels Tab */}
          <TabsContent value="duels" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Sword className="w-5 h-5 text-blue-600" />
                    <span>My Duels</span>
                  </CardTitle>
                  <Button onClick={loadPvPData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {duels.map((duel) => (
                    <div key={duel.id} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <Badge className={getDuelStatusColor(duel.status)}>
                          {getDuelStatusText(duel.status)}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-800">
                            {duel.challenger_id === userId ? 'You' : duel.challenger_username} vs {duel.opponent_id === userId ? 'You' : duel.opponent_username}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(duel.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {duel.status === 'completed' && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Scores</p>
                            <p className="font-medium">
                              {duel.challenger_score || 0} - {duel.opponent_score || 0}
                            </p>
                          </div>
                        )}
                        
                        {duel.status === 'pending' && duel.opponent_id === userId && (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleAcceptDuel(duel)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeclineDuel(duel)}>
                              Decline
                            </Button>
                          </div>
                        )}
                        
                        {duel.status === 'accepted' && (
                          <Button size="sm" onClick={() => navigate(`${ROUTES.PVP_DUEL_PLAY.replace(':duelId', duel.id)}`)}>
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {duels.length === 0 && (
                    <div className="text-center py-8">
                      <Sword className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No duels yet</p>
                      <Button onClick={() => setShowCreateDuel(true)} className="mt-4">
                        Create Your First Duel
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span>Active Tournaments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tournaments.map((tournament) => (
                    <Card key={tournament.id} className="bg-white/60">
                      <CardHeader>
                        <CardTitle className="text-lg">{tournament.name}</CardTitle>
                        <CardDescription>{tournament.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {tournament.participants_count} participants
                            </span>
                          </div>
                          <Badge className={tournament.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {tournament.status}
                          </Badge>
                        </div>
                        <Button 
                          onClick={() => navigate(`${ROUTES.PVP_TOURNAMENT_DETAILS.replace(':tournamentId', tournament.id)}`)}
                          className="w-full mt-4"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {tournaments.length === 0 && (
                    <div className="text-center py-8 col-span-full">
                      <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active tournaments</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>PvP Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">
                  Leaderboard coming soon! Compete in duels to climb the ranks.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Duel Dialog */}
      <Dialog open={showCreateDuel} onOpenChange={setShowCreateDuel}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Challenge a Friend</DialogTitle>
            <DialogDescription>
              Select an opponent and create a new duel challenge.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="opponent-search">Search Opponent</Label>
              <div className="flex space-x-2">
                <Input
                  id="opponent-search"
                  placeholder="Enter username..."
                  value={opponentSearch}
                  onChange={(e) => {
                    setOpponentSearch(e.target.value);
                    handleSearchOpponents(e.target.value);
                  }}
                />
                <Button onClick={() => handleSearchOpponents(opponentSearch)}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div>
                <Label>Select Opponent</Label>
                <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an opponent" />
                  </SelectTrigger>
                  <SelectContent>
                    {searchResults.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleCreateDuel} className="flex-1">
                Create Challenge
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDuel(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PvPDuelsPage; 