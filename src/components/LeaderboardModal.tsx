
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Award, Crown, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeaderboard } from '@/hooks/useLeaderboard';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { leaderboard, loading, fetchLeaderboard } = useLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-500" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'from-blue-50 to-indigo-50 border-blue-100';
    }
  };

  const getPlayerAvatar = (rank: number) => {
    const avatars = ['👑', '🥈', '🥉', '🐦', '☁️', '🪶', '🔍', '💃', '✈️', '🥷'];
    return avatars[rank - 1] || '🎮';
  };

  const getRankLabel = (rank: number) => {
    if (rank === 1) return 'Champion';
    if (rank === 2) return 'Runner-up';
    if (rank === 3) return 'Third Place';
    return '';
  };

  // Refresh leaderboard when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-hidden bg-white border-gray-300 mx-2">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-gray-800 flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Pi Leaderboard</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLeaderboard}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Top flyers worldwide
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(85vh-180px)] pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 text-sm">Loading...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <Card className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No scores yet!</p>
                  <p className="text-xs text-gray-500">Be the first to set a high score!</p>
                </Card>
              ) : (
                leaderboard.map((player, index) => {
                  const rank = index + 1;
                  return (
                    <Card 
                      key={player.id} 
                      className={`p-3 bg-gradient-to-r ${getRankColor(rank)} border`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="flex items-center space-x-1">
                            {getRankIcon(rank)}
                            <span className="font-bold text-gray-800 text-sm">
                              #{rank}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <span className="text-lg">{getPlayerAvatar(rank)}</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-800 text-sm truncate">
                                {player.username}
                              </div>
                              {rank <= 3 && (
                                <div className="text-xs text-gray-600">
                                  {getRankLabel(rank)}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                {player.total_games} games
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-gray-800 text-sm">
                            {player.highest_score.toLocaleString()}
                          </div>
                          <div className="text-gray-600 text-xs">points</div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-2 border-t">
          <Card className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-lg">🎯</span>
              <span className="font-bold text-gray-800 text-sm">Weekly Prize Pool</span>
            </div>
            <div className="text-gray-700 text-xs text-center mb-2">
              Top 3 players win Pi coins every week!
            </div>
            <div className="flex justify-center space-x-3 text-xs text-gray-600">
              <span>🥇 100 Pi</span>
              <span>🥈 50 Pi</span>
              <span>🥉 25 Pi</span>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;
