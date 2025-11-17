// Utility to determine Flappy Coin rewards based on leaderboard rank
export function getFlappyCoinRewardForRank(rank: number): number {
  if (rank === 1) return 30000;
  if (rank === 2) return 5000;
  if (rank === 3) return 1000;
  if (rank <= 10) return 500;
  if (rank <= 50) return 100;
  return 0;
} 