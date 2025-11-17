import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const LeaderboardRewardsModal: React.FC = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="mb-4">Leaderboard Rewards</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>Leaderboards & Rewards</DialogTitle>
      <DialogDescription>
        <div className="text-left">
          <strong>Weekly leaderboard competitions</strong>
        </div>
      </DialogDescription>
      <ul className="list-disc pl-5 space-y-2 text-left mt-2">
        <li>Top 3 players win Flappy coins and skins every week</li>
        <li>🥇 1st Place: 70,000 Flappy coins + Legendary Flappy Skin + Legendary Mystery Box + Bundles + Power-ups</li>
        <li>🥈 2nd Place: 45,000 Flappy coins + Epic Flappy Skin</li>
        <li>🥉 3rd Place: 15,000 Flappy coins + Common Flappy Skin</li>
        <li>🥇 1st Place also receives a Legendary Mystery Box and additional power-ups</li>
        <li>Top 10 players receive bonus Flappy coins</li>
        <li>🎲 Random weekly lucky draw for all participants</li>
        <li>🏅 Special badge for players who play every day</li>
        <li>💬 Exclusive Discord role for top 3 players</li>
        <li>Users who score 1,000 points will receive special rewards!</li>
        <li>Every month, REWARD POOL WILL COME FROM DeFi Pool. Stay tuned!</li>
        <li className="font-bold text-purple-700">💎 POOL WILL COME FROM DeFi Pool COMING SOON</li>
      </ul>
      <div className="mt-4 text-xs">
        To claim your rewards, email us at:<br />
        <a href="mailto:support@flappypi.fun" className="text-blue-600 underline">support@flappypi.fun</a><br />
        <a href="mailto:flappypi.fun@gmail.com" className="text-blue-600 underline">flappypi.fun@gmail.com</a>
      </div>
      {/* NPC Avatars */}
      <div className="flex flex-col items-center mt-6">
        <span className="font-bold text-blue-900 mb-2">Special NPCs</span>
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <img src="/npc/nicolas.png" alt="Nicolas" className="w-16 h-16 rounded-full border-2 border-yellow-400 mb-1" />
            <span className="text-sm font-semibold">Nicolas</span>
          </div>
          <div className="flex flex-col items-center">
            <img src="/npc/chengdiao.png" alt="Chengdiao" className="w-16 h-16 rounded-full border-2 border-blue-400 mb-1" />
            <span className="text-sm font-semibold">Chengdiao</span>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default LeaderboardRewardsModal; 