// App-to-User (A2U) Payment Service
// Based on official Pi Network documentation: https://github.com/pi-apps/pi-platform-docs.git

interface A2UPaymentRequest {
  userUid: string;
  amount: number;
  memo: string;
  metadata?: any;
  network?: string;
}

interface A2UPaymentResponse {
  success: boolean;
  paymentId?: string;
  txid?: string;
  error?: string;
}

interface BulkA2UPaymentRequest {
  payments: Array<{
    userUid: string;
    amount: number;
    memo: string;
    metadata?: any;
  }>;
  network?: string;
}

interface BulkA2UPaymentResponse {
  success: boolean;
  results: Array<{
    userUid: string;
    success: boolean;
    paymentId?: string;
    txid?: string;
    error?: string;
  }>;
  totalSent: number;
  totalFailed: number;
}

export class A2UPaymentService {
  private static instance: A2UPaymentService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://flappypi2807.pinet.com' 
      : 'http://localhost:3009';
  }

  static getInstance(): A2UPaymentService {
    if (!A2UPaymentService.instance) {
      A2UPaymentService.instance = new A2UPaymentService();
    }
    return A2UPaymentService.instance;
  }

  /**
   * Send a single A2U payment to a user
   */
  async sendPayment(request: A2UPaymentRequest): Promise<A2UPaymentResponse> {
    try {
      console.log('💰 Sending A2U payment:', request);

      const response = await fetch(`${this.baseUrl}/api/pi/send-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ A2U payment sent successfully:', result);

      return {
        success: true,
        paymentId: result.paymentId,
        txid: result.txid
      };

    } catch (error: any) {
      console.error('❌ A2U payment failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send payment'
      };
    }
  }

  /**
   * Send bulk A2U payments to multiple users
   */
  async sendBulkPayments(request: BulkA2UPaymentRequest): Promise<BulkA2UPaymentResponse> {
    try {
      console.log('💰 Sending bulk A2U payments:', { count: request.payments.length });

      const response = await fetch(`${this.baseUrl}/api/pi/bulk-send-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Bulk A2U payments sent successfully:', result);

      return {
        success: true,
        results: result.results,
        totalSent: result.totalSent,
        totalFailed: result.totalFailed
      };

    } catch (error: any) {
      console.error('❌ Bulk A2U payments failed:', error);
      return {
        success: false,
        results: [],
        totalSent: 0,
        totalFailed: request.payments.length
      };
    }
  }

  /**
   * Send reward payment to user (convenience method)
   */
  async sendReward(
    userUid: string, 
    amount: number, 
    reason: string = 'Game Reward'
  ): Promise<A2UPaymentResponse> {
    return this.sendPayment({
      userUid,
      amount,
      memo: `Flappy Pi ${reason} - ${new Date().toLocaleDateString()}`,
      metadata: {
        type: 'game_reward',
        reason,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Send leaderboard rewards to top players
   */
  async sendLeaderboardRewards(
    leaderboard: Array<{ userUid: string; rank: number; score: number }>
  ): Promise<BulkA2UPaymentResponse> {
    const payments = leaderboard.map((player, index) => {
      let rewardAmount = 0;
      
      // Calculate reward based on rank
      if (player.rank === 1) rewardAmount = 5.0;      // 1st place: 5 Pi
      else if (player.rank === 2) rewardAmount = 3.0; // 2nd place: 3 Pi
      else if (player.rank === 3) rewardAmount = 2.0; // 3rd place: 2 Pi
      else if (player.rank <= 10) rewardAmount = 1.0; // Top 10: 1 Pi
      else if (player.rank <= 50) rewardAmount = 0.5; // Top 50: 0.5 Pi
      else rewardAmount = 0.1; // Participation: 0.1 Pi

      return {
        userUid: player.userUid,
        amount: rewardAmount,
        memo: `Flappy Pi Leaderboard Reward - Rank #${player.rank}`,
        metadata: {
          type: 'leaderboard_reward',
          rank: player.rank,
          score: player.score,
          rewardAmount
        }
      };
    });

    return this.sendBulkPayments({ payments });
  }

  /**
   * Send daily login bonus
   */
  async sendDailyBonus(userUid: string, streakDays: number): Promise<A2UPaymentResponse> {
    const bonusAmount = Math.min(streakDays * 0.1, 1.0); // Max 1 Pi for 10+ day streak
    
    return this.sendPayment({
      userUid,
      amount: bonusAmount,
      memo: `Flappy Pi Daily Bonus - ${streakDays} day streak`,
      metadata: {
        type: 'daily_bonus',
        streakDays,
        bonusAmount
      }
    });
  }

  /**
   * Send achievement reward
   */
  async sendAchievementReward(
    userUid: string, 
    achievementName: string, 
    rewardAmount: number
  ): Promise<A2UPaymentResponse> {
    return this.sendPayment({
      userUid,
      amount: rewardAmount,
      memo: `Flappy Pi Achievement: ${achievementName}`,
      metadata: {
        type: 'achievement_reward',
        achievementName,
        rewardAmount
      }
    });
  }

  /**
   * Send tournament prize
   */
  async sendTournamentPrize(
    userUid: string, 
    tournamentName: string, 
    position: number, 
    prizeAmount: number
  ): Promise<A2UPaymentResponse> {
    return this.sendPayment({
      userUid,
      amount: prizeAmount,
      memo: `Flappy Pi Tournament: ${tournamentName} - Position #${position}`,
      metadata: {
        type: 'tournament_prize',
        tournamentName,
        position,
        prizeAmount
      }
    });
  }
}

// Export singleton instance
export const a2uPaymentService = A2UPaymentService.getInstance();
export default a2uPaymentService;
