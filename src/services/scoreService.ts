import { validateScore } from '../utils/validation';
import { logger } from '../utils/logger';
import { scoreSubmissionLimiter } from '../utils/rateLimiter';
import { errorMessages } from '../utils/validation';

interface GameScore {
  score: number;
  timestamp: number;
  gameVersion: string;
  checksum: string;
}

export class ScoreService {
  private static instance: ScoreService;
  private readonly GAME_VERSION = '1.0.0';
  private readonly SCORE_STORAGE_KEY = 'flappy_pi_highscores';
  
  private constructor() {}
  
  public static getInstance(): ScoreService {
    if (!ScoreService.instance) {
      ScoreService.instance = new ScoreService();
    }
    return ScoreService.instance;
  }

  // Generate a simple checksum to verify score integrity
  private generateChecksum(score: number, timestamp: number): string {
    const data = `${score}-${timestamp}-${this.GAME_VERSION}`;
    return Array.from(data)
      .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
      .toString(16);
  }

  // Verify score integrity
  private verifyScore(score: GameScore): boolean {
    const expectedChecksum = this.generateChecksum(score.score, score.timestamp);
    return score.checksum === expectedChecksum &&
           score.gameVersion === this.GAME_VERSION;
  }

  async submitScore(score: number): Promise<boolean> {
    try {
      // Check rate limiting
      if (scoreSubmissionLimiter.isRateLimited('submit-score')) {
        throw new Error('Too many score submissions. Please try again later.');
      }

      // Validate score
      if (!validateScore(score)) {
        logger.warn('Invalid score submission attempt', { score });
        throw new Error(errorMessages.INVALID_SCORE);
      }

      const gameScore: GameScore = {
        score,
        timestamp: Date.now(),
        gameVersion: this.GAME_VERSION,
        checksum: this.generateChecksum(score, Date.now())
      };

      // Store score locally
      const scores = this.getStoredScores();
      scores.push(gameScore);
      scores.sort((a, b) => b.score - a.score); // Sort by highest score
      const topScores = scores.slice(0, 10); // Keep only top 10 scores

      localStorage.setItem(this.SCORE_STORAGE_KEY, JSON.stringify(topScores));
      
      logger.info('Score submitted successfully', { score });
      return true;
    } catch (error) {
      logger.error(error, { score });
      throw error;
    }
  }

  getHighScores(): GameScore[] {
    const scores = this.getStoredScores();
    // Filter out any potentially tampered scores
    return scores
      .filter(score => this.verifyScore(score))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private getStoredScores(): GameScore[] {
    try {
      const stored = localStorage.getItem(this.SCORE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Error reading stored scores', { error });
      return [];
    }
  }

  clearScores(): void {
    localStorage.removeItem(this.SCORE_STORAGE_KEY);
    logger.info('Scores cleared');
  }
} 