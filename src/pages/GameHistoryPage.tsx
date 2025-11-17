import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Download, 
  Trash2, 
  Filter,
  Calendar,
  Gamepad2,
  Coins,
  Bird,
  BarChart3,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useGameHistory } from '@/hooks/useGameHistory';
import { GameHistoryFilters } from '@/types/gameHistory';
import { formatDistanceToNow, format } from 'date-fns';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const GameHistoryPage: React.FC = () => {
  // Add background music
  const { isPlaying, currentTrack } = useGlobalMusic();
  
  const {
    history,
    stats,
    loading,
    error,
    hasMore,
    totalCount,
    loadGameHistory,
    loadMore,
    clearHistory,
    exportHistory,
  } = useGameHistory();

  const [filters, setFilters] = useState<GameHistoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleFilterChange = (key: keyof GameHistoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadGameHistory(filters, 1, 20);
  };

  const clearFilters = () => {
    setFilters({});
    loadGameHistory({}, 1, 20);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBirdSkinName = (birdSkin: string) => {
    const skinNames: Record<string, string> = {
      'bird_0': 'Classic',
      'bird_1': 'Red',
      'bird_2': 'Blue',
      'bird_3': 'Green',
      'bird_4': 'Yellow',
      'bird_5': 'Purple',
      'bird_6': 'Orange',
      'bird_7': 'Pink',
      'bird_8': 'Cyan',
      'bird_9': 'Magenta',
      'bird_10': 'Dragon',
      'bird_11': 'Gold',
      'bird_12': 'Legendary',
    };
    return skinNames[birdSkin] || birdSkin;
  };

  const getGameModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      classic: 'bg-blue-100 text-blue-800',
      endless: 'bg-green-100 text-green-800',
      challenge: 'bg-purple-100 text-purple-800',
    };
    return colors[mode] || 'bg-gray-100 text-gray-800';
  };

  if (loading && history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Loading game history...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game History</h1>
          <p className="text-gray-600">Track your Flappy Pi gameplay progress and statistics</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Games</p>
                    <p className="text-2xl font-bold">{stats.totalGames}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Best Score</p>
                    <p className="text-2xl font-bold">{stats.bestScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Play Time</p>
                    <p className="text-2xl font-bold">{formatDuration(stats.totalPlayTime)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Improvement Rate</p>
                    <p className="text-2xl font-bold">{stats.improvementRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bird className="w-5 h-5" />
                  Favorite Bird Skin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{getBirdSkinName(stats.favoriteBirdSkin)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Most Played Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getGameModeColor(stats.mostPlayedMode)}>
                  {stats.mostPlayedMode.charAt(0).toUpperCase() + stats.mostPlayedMode.slice(1)}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm">This week: {stats.gamesThisWeek} games</p>
                  <p className="text-sm">This month: {stats.gamesThisMonth} games</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>

          <Button
            onClick={exportHistory}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Clear History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear Game History</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to clear all your game history? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <Button onClick={clearHistory} variant="destructive">
                    Clear History
                  </Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Game Mode</label>
                  <Select value={filters.gameMode} onValueChange={(value) => handleFilterChange('gameMode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="endless">Endless</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Min Score</label>
                  <Input
                    type="number"
                    placeholder="Min score"
                    value={filters.minScore || ''}
                    onChange={(e) => handleFilterChange('minScore', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max Score</label>
                  <Input
                    type="number"
                    placeholder="Max score"
                    value={filters.maxScore || ''}
                    onChange={(e) => handleFilterChange('maxScore', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bird Skin</label>
                  <Select value={filters.birdSkin} onValueChange={(value) => handleFilterChange('birdSkin', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All skins" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bird_0">Classic</SelectItem>
                      <SelectItem value="bird_1">Red</SelectItem>
                      <SelectItem value="bird_2">Blue</SelectItem>
                      <SelectItem value="bird_3">Green</SelectItem>
                      <SelectItem value="bird_4">Yellow</SelectItem>
                      <SelectItem value="bird_5">Purple</SelectItem>
                      <SelectItem value="bird_6">Orange</SelectItem>
                      <SelectItem value="bird_7">Pink</SelectItem>
                      <SelectItem value="bird_8">Cyan</SelectItem>
                      <SelectItem value="bird_9">Magenta</SelectItem>
                      <SelectItem value="bird_10">Dragon</SelectItem>
                      <SelectItem value="bird_11">Gold</SelectItem>
                      <SelectItem value="bird_12">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={applyFilters}>Apply Filters</Button>
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game History List */}
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{entry.score}</p>
                      <p className="text-sm text-gray-600">Score</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getGameModeColor(entry.gameMode)}>
                          {entry.gameMode.charAt(0).toUpperCase() + entry.gameMode.slice(1)}
                        </Badge>
                        {entry.isNewHighScore && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Trophy className="w-3 h-3 mr-1" />
                            New Record!
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Level {entry.level}</span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {entry.coinsEarned}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(entry.duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Bird className="w-4 h-4" />
                          {getBirdSkinName(entry.birdSkin)}
                        </span>
                        {entry.reviveCount > 0 && (
                          <span>Revives: {entry.reviveCount}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowDetails(true);
                      }}
                      className="mt-2"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {history.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Gamepad2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Game History</h3>
                <p className="text-gray-600">Start playing Flappy Pi to see your game history here!</p>
              </CardContent>
            </Card>
          )}

          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Game Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Game Details</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Score</h4>
                    <p className="text-2xl font-bold text-blue-600">{selectedEntry.score}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Level</h4>
                    <p className="text-xl">{selectedEntry.level}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Duration</h4>
                    <p>{formatDuration(selectedEntry.duration)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Coins Earned</h4>
                    <p className="flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {selectedEntry.coinsEarned}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold">Game Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-600">Pipes Passed</p>
                      <p className="font-semibold">{selectedEntry.gameStats.pipesPassed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coins Collected</p>
                      <p className="font-semibold">{selectedEntry.gameStats.coinsCollected}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Power-ups Used</p>
                      <p className="font-semibold">{selectedEntry.gameStats.powerUpsActivated}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Distance Traveled</p>
                      <p className="font-semibold">{selectedEntry.gameStats.distanceTraveled}m</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold">Device Info</h4>
                  <p className="text-sm text-gray-600">{selectedEntry.deviceInfo.platform}</p>
                  <p className="text-sm text-gray-600">
                    {selectedEntry.deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Timestamp</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedEntry.timestamp), 'PPP p')}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GameHistoryPage; 