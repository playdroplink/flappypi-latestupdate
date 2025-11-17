
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gift, Calendar, Star, Coins, Crown } from 'lucide-react';

interface DailyRewardsProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (day: number, reward: number) => void;
}

const DailyRewards: React.FC<DailyRewardsProps> = ({ isOpen, onClose, onClaimReward }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [claimedDays, setClaimedDays] = useState<number[]>([]);

  const dailyRewards = [
    { day: 1, coins: 10, icon: '🪙' },
    { day: 2, coins: 15, icon: '💎' },
    { day: 3, coins: 20, icon: '⭐' },
    { day: 4, coins: 25, icon: '🎯' },
    { day: 5, coins: 35, icon: '🏆' },
    { day: 6, coins: 50, icon: '👑' },
    { day: 7, coins: 100, icon: '🎉' }
  ];

  useEffect(() => {
    // Load daily rewards data from localStorage
    const savedDay = localStorage.getItem('flappypi-daily-day');
    const savedClaimed = localStorage.getItem('flappypi-daily-claimed');
    const lastLogin = localStorage.getItem('flappypi-last-login');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
      // New day, increment current day
      const newDay = savedDay ? Math.min(parseInt(savedDay) + 1, 7) : 1;
      setCurrentDay(newDay);
      localStorage.setItem('flappypi-daily-day', newDay.toString());
      localStorage.setItem('flappypi-last-login', today);
    } else if (savedDay) {
      setCurrentDay(parseInt(savedDay));
    }

    if (savedClaimed) {
      setClaimedDays(JSON.parse(savedClaimed));
    }
  }, []);

  const handleClaimReward = (day: number, reward: number) => {
    const newClaimedDays = [...claimedDays, day];
    setClaimedDays(newClaimedDays);
    localStorage.setItem('flappypi-daily-claimed', JSON.stringify(newClaimedDays));
    onClaimReward(day, reward);
  };

  const canClaim = (day: number) => {
    return day <= currentDay && !claimedDays.includes(day);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-violet-300/50 bg-gradient-to-br from-violet-600/95 to-purple-700/95 backdrop-blur-sm text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-white">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="h-8 w-8 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Daily Rewards
              </span>
            </div>
            <div className="text-sm text-violet-200 font-normal">
              🎁 Login daily for amazing rewards! 🎁
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {dailyRewards.map((reward) => (
              <Card 
                key={reward.day}
                className={`p-3 text-center border-2 transition-all duration-200 ${
                  claimedDays.includes(reward.day)
                    ? 'bg-green-500/20 border-green-400/50'
                    : canClaim(reward.day)
                    ? 'bg-yellow-500/20 border-yellow-400/50 animate-pulse'
                    : 'bg-gray-500/20 border-gray-400/50'
                }`}
              >
                <div className="text-2xl mb-1">{reward.icon}</div>
                <div className="text-xs font-bold text-white">Day {reward.day}</div>
                <div className="text-xs text-yellow-300">{reward.coins} coins</div>
                {claimedDays.includes(reward.day) && (
                  <div className="text-xs text-green-300 mt-1">✓ Claimed</div>
                )}
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-sm text-white/90">
                Current Streak: <span className="font-bold text-yellow-300">{currentDay} days</span>
              </p>
            </div>

            {dailyRewards.filter(r => canClaim(r.day)).length > 0 ? (
              <div className="space-y-2">
                {dailyRewards
                  .filter(r => canClaim(r.day))
                  .slice(0, 1)
                  .map(reward => (
                    <Button
                      key={reward.day}
                      onClick={() => handleClaimReward(reward.day, reward.coins)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg py-3 rounded-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      Claim Day {reward.day} - {reward.coins} Flappy Coins!
                    </Button>
                  ))}
              </div>
            ) : (
              <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
                <p className="text-sm text-blue-200">
                  Come back tomorrow for your next reward! 🌅
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/20 rounded-xl"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyRewards;
