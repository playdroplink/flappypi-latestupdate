import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealLeaderboard } from '@/hooks/useRealLeaderboard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const RealLeaderboardTest: React.FC = () => {
  const { isAuthenticated, piUser } = useAuth();
  const { toast } = useToast();
  
  const {
    leaderboard,
    loading,
    isConnected,
    lastUpdate,
    fetchLeaderboard
  } = useRealLeaderboard('classic');


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Real Leaderboard Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-700 font-semibold">Connected to Real Leaderboard</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-red-700 font-semibold">Offline Mode</span>
              </>
            )}
          </div>
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last update: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>


        {/* Refresh Button */}
        <Button 
          onClick={fetchLeaderboard}
          disabled={loading}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Leaderboard'}
        </Button>

        {/* Leaderboard Display */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Current Leaderboard ({leaderboard.length} entries)</h3>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {leaderboard.slice(0, 10).map((entry, idx) => (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">#{idx + 1}</span>
                    <span className="font-semibold">{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{entry.highest_score.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{entry.total_games} games</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {isConnected ? 'No scores yet' : 'Unable to load leaderboard'}
            </div>
          )}
        </div>

        {/* Authentication Status */}
        <div className="text-sm text-gray-600">
          {isAuthenticated ? (
            <span className="text-green-600">✅ Authenticated as {piUser?.username || 'Pi User'}</span>
          ) : (
            <span className="text-red-600">❌ Not authenticated - Sign in to submit scores</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealLeaderboardTest;
