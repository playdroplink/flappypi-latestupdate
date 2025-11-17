// =============================================
// FLAPPY PI LEADERBOARD API ENDPOINTS
// =============================================
// Complete backend API for leaderboard system with Pi Network authentication

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://feiifpwfbfjrjpcvjdfz.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlaWlmcHdmYmZqcmpwY3ZqZGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODA1MDEsImV4cCI6MjA3ODc1NjUwMX0.TwkSgRYAEwq6GI1tNw4hL-2bVjgO_wM-0qmZK3_iZEQ'
);

// Rate limiting for score submission
const scoreSubmissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 score submissions per minute
  message: {
    error: 'Too many score submissions. Please wait before submitting again.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for leaderboard requests
const leaderboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    error: 'Too many leaderboard requests. Please wait before requesting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================
// ANTI-CHEAT AND VALIDATION FUNCTIONS
// =============================================

/**
 * Validate score based on game mode and other factors
 * @param {number} score - The score to validate
 * @param {string} gameMode - The game mode
 * @param {number} duration - Game duration in seconds
 * @param {number} coinsCollected - Number of coins collected
 * @returns {object} Validation result
 */
function validateScore(score, gameMode = 'classic', duration = 0, coinsCollected = 0) {
  const validationRules = {
    classic: { maxScore: 5000, minDurationForScore: 0.1 },
    scream_pi: { maxScore: 3000, minDurationForScore: 0.1 },
    dino_pi: { maxScore: 8000, minDurationForScore: 0.1 },
    challenge: { maxScore: 10000, minDurationForScore: 0.1 }
  };

  const rules = validationRules[gameMode] || validationRules.classic;
  
  // Basic score validation
  if (score < 0) {
    return { valid: false, reason: 'Negative scores are not allowed' };
  }
  
  if (score > rules.maxScore) {
    return { valid: false, reason: `Score too high for ${gameMode} mode (max: ${rules.maxScore})` };
  }

  // Duration-based validation
  if (duration > 0) {
    const minExpectedDuration = score * rules.minDurationForScore;
    if (duration < minExpectedDuration) {
      return { valid: false, reason: 'Score achieved too quickly to be legitimate' };
    }
  }

  // Coins-to-score ratio validation
  if (coinsCollected > score * 2) {
    return { valid: false, reason: 'Too many coins collected relative to score' };
  }

  return { valid: true };
}

/**
 * Verify Pi Network user authentication
 * @param {string} piAccessToken - Pi access token
 * @param {string} piUserId - Pi user ID
 * @returns {object} Verification result
 */
async function verifyPiUser(piAccessToken, piUserId) {
  if (!piAccessToken || !piUserId) {
    return { verified: false, reason: 'Missing Pi authentication data' };
  }

  try {
    // In a real implementation, verify with Pi Network API
    // For now, we'll do basic validation
    if (piAccessToken.length < 10 || piUserId.length < 5) {
      return { verified: false, reason: 'Invalid Pi authentication format' };
    }

    // TODO: Add actual Pi Network API verification
    // const response = await fetch('https://api.minepi.com/v2/me', {
    //   headers: { Authorization: `Bearer ${piAccessToken}` }
    // });

    return { verified: true, piUserId, username: `PiUser_${piUserId.slice(-8)}` };
  } catch (error) {
    console.error('Pi verification error:', error);
    return { verified: false, reason: 'Pi verification failed' };
  }
}

/**
 * Generate session ID for anti-cheat tracking
 * @param {string} userAgent - User agent string
 * @param {string} ip - IP address
 * @returns {string} Session ID
 */
function generateSessionId(userAgent, ip) {
  const data = `${userAgent}_${ip}_${Date.now()}`;
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
}

// =============================================
// API ENDPOINTS
// =============================================

/**
 * POST /api/leaderboard/submit-score
 * Submit a new score to the leaderboard
 */
async function submitScore(req, res) {
  try {
    const {
      username,
      score,
      gameMode = 'classic',
      characterUsed = 'default',
      difficulty = 'normal',
      gameDuration = 0,
      coinsCollected = 0,
      powerUpsUsed = [],
      piAccessToken,
      piUserId,
      // New unified system fields
      game_data = {},
      clientSessionId,
      // Classic mode specific fields
      pipes_passed,
      max_height,
      difficulty_multiplier,
      streak_bonus,
      perfect_passes,
      // ScreamPi mode specific fields
      scream_inputs,
      tap_inputs,
      voice_sensitivity,
      audio_quality,
      input_method,
      // DinoPi mode specific fields
      obstacles_jumped,
      distance_traveled,
      power_ups_collected,
      jump_accuracy,
      speed_bonus,
      // Challenge mode specific fields
      challenge_type,
      obstacles_avoided,
      time_limit,
      special_conditions,
      completion_bonus
    } = req.body;

    // Basic validation
    if (!username || username.length < 1 || username.length > 50) {
      return res.status(400).json({ 
        error: 'Username is required and must be 1-50 characters',
        code: 'INVALID_USERNAME'
      });
    }

    if (typeof score !== 'number' || isNaN(score)) {
      return res.status(400).json({ 
        error: 'Score must be a valid number',
        code: 'INVALID_SCORE'
      });
    }

    // Validate score with anti-cheat
    const scoreValidation = validateScore(score, gameMode, gameDuration, coinsCollected);
    if (!scoreValidation.valid) {
      return res.status(400).json({ 
        error: scoreValidation.reason,
        code: 'INVALID_SCORE_DATA'
      });
    }

    // Verify Pi Network user (if provided)
    let isPiUser = false;
    let verifiedPiUserId = null;
    let verifiedUsername = username;
    
    if (piAccessToken && piUserId) {
      const piVerification = await verifyPiUser(piAccessToken, piUserId);
      if (piVerification.verified) {
        isPiUser = true;
        verifiedPiUserId = piVerification.piUserId;
        verifiedUsername = piVerification.username || username;
      }
    }

    // Generate session tracking data
    const sessionId = clientSessionId || generateSessionId(req.get('User-Agent') || '', req.ip);
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent') || '';

    // Build game_data based on game mode
    let finalGameData = { ...game_data };
    
    // Add mode-specific data if provided
    switch (gameMode) {
      case 'classic':
        if (pipes_passed !== undefined) finalGameData.pipes_passed = pipes_passed;
        if (max_height !== undefined) finalGameData.max_height = max_height;
        if (difficulty_multiplier !== undefined) finalGameData.difficulty_multiplier = difficulty_multiplier;
        if (streak_bonus !== undefined) finalGameData.streak_bonus = streak_bonus;
        if (perfect_passes !== undefined) finalGameData.perfect_passes = perfect_passes;
        break;
        
      case 'screampi':
      case 'scream_pi':
        if (scream_inputs !== undefined) finalGameData.scream_inputs = scream_inputs;
        if (tap_inputs !== undefined) finalGameData.tap_inputs = tap_inputs;
        if (voice_sensitivity !== undefined) finalGameData.voice_sensitivity = voice_sensitivity;
        if (audio_quality !== undefined) finalGameData.audio_quality = audio_quality;
        if (input_method !== undefined) finalGameData.input_method = input_method;
        break;
        
      case 'dinopi':
      case 'dino_pi':
        if (obstacles_jumped !== undefined) finalGameData.obstacles_jumped = obstacles_jumped;
        if (distance_traveled !== undefined) finalGameData.distance_traveled = distance_traveled;
        if (power_ups_collected !== undefined) finalGameData.power_ups_collected = power_ups_collected;
        if (jump_accuracy !== undefined) finalGameData.jump_accuracy = jump_accuracy;
        if (speed_bonus !== undefined) finalGameData.speed_bonus = speed_bonus;
        break;
        
      case 'challenge':
        if (challenge_type !== undefined) finalGameData.challenge_type = challenge_type;
        if (obstacles_avoided !== undefined) finalGameData.obstacles_avoided = obstacles_avoided;
        if (time_limit !== undefined) finalGameData.time_limit = time_limit;
        if (special_conditions !== undefined) finalGameData.special_conditions = special_conditions;
        if (completion_bonus !== undefined) finalGameData.completion_bonus = completion_bonus;
        break;
    }

    // Prepare score data
    const scoreData = {
      pi_user_id: verifiedPiUserId,
      username: verifiedUsername,
      score: score,
      game_mode: gameMode,
      character_used: characterUsed,
      difficulty: difficulty,
      game_duration: gameDuration > 0 ? gameDuration : null,
      coins_collected: coinsCollected,
      power_ups_used: powerUpsUsed.length > 0 ? powerUpsUsed : null,
      game_data: finalGameData,
      session_id: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      is_verified: isPiUser,
      is_pi_user: isPiUser,
      created_at: new Date().toISOString()
    };

    // Insert score into database
    const { data: insertedScore, error: insertError } = await supabase
      .from('leaderboard')
      .insert([scoreData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({ 
        error: 'Failed to save score to database',
        code: 'DATABASE_ERROR'
      });
    }

    // Get user's new rank
    const { data: rankData } = await supabase
      .from('global_leaderboard')
      .select('rank')
      .eq('pi_user_id', verifiedPiUserId)
      .eq('username', verifiedUsername)
      .eq('game_mode', gameMode)
      .eq('score', score)
      .order('created_at', { ascending: false })
      .limit(1);

    const newRank = rankData && rankData[0] ? rankData[0].rank : null;

    // Check for achievements
    const achievements = await checkForAchievements(verifiedPiUserId || 'anonymous', gameMode, score, newRank);

    // Return success response
    res.json({
      success: true,
      scoreId: insertedScore.id,
      rank: newRank,
      isPiUser: isPiUser,
      verified: isPiUser,
      achievements: achievements,
      message: isPiUser ? 'Score submitted and verified with Pi Network!' : 'Score submitted successfully!'
    });

  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/leaderboard
 * Get leaderboard data with filtering options
 */
async function getLeaderboard(req, res) {
  try {
    const {
      gameMode = 'classic',
      limit = 50,
      offset = 0,
      timeframe = 'all-time', // 'all-time', 'daily', 'weekly', 'monthly'
      verifiedOnly = false
    } = req.query;

    const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 entries
    const offsetNum = parseInt(offset) || 0;

    let query = supabase
      .from('unified_leaderboard_view')
      .select('rank, pi_user_id, username, score, game_mode, character_used, difficulty, game_duration, coins_collected, power_ups_used, game_data, is_pi_user, is_verified, created_at')
      .eq('game_mode', gameMode);

    // Apply verified filter if requested
    if (verifiedOnly === 'true') {
      query = query.eq('is_verified', true);
    }

    // Apply timeframe filter
    if (timeframe === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('created_at', `${today}T00:00:00.000Z`);
    } else if (timeframe === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', weekAgo);
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', monthAgo);
    }

    // Apply pagination
    query = query.order('rank', { ascending: true });
    
    if (limitNum > 0) {
      query = query.range(offsetNum, offsetNum + limitNum - 1);
    }

    const { data: leaderboardData, error: leaderboardError } = await query;

    if (leaderboardError) {
      console.error('Leaderboard fetch error:', leaderboardError);
      return res.status(500).json({ 
        error: 'Failed to fetch leaderboard data',
        code: 'DATABASE_ERROR'
      });
    }

    // Get leaderboard stats
    const { data: statsData } = await supabase
      .from('leaderboard_stats')
      .select('*')
      .eq('game_mode', gameMode)
      .single();

    res.json({
      success: true,
      gameMode: gameMode,
      timeframe: timeframe,
      totalEntries: leaderboardData ? leaderboardData.length : 0,
      leaderboard: leaderboardData || [],
      stats: statsData || null,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        hasMore: leaderboardData && leaderboardData.length === limitNum
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/leaderboard/user-stats/:piUserId
 * Get detailed statistics for a specific user
 */
async function getUserStats(req, res) {
  try {
    const { piUserId } = req.params;
    
    if (!piUserId) {
      return res.status(400).json({ 
        error: 'Pi User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Get user's best scores across all game modes
    const { data: bestScores } = await supabase
      .from('user_best_scores')
      .select('*')
      .eq('pi_user_id', piUserId);

    // Get user's recent games
    const { data: recentGames } = await supabase
      .from('leaderboard')
      .select('score, game_mode, character_used, difficulty, game_duration, coins_collected, game_data, created_at')
      .eq('pi_user_id', piUserId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get user's achievements
    const { data: achievements } = await supabase
      .from('leaderboard_achievements')
      .select('*')
      .eq('pi_user_id', piUserId)
      .eq('is_active', true)
      .order('earned_at', { ascending: false });

    // Get user's overall stats
    const { data: overallStats } = await supabase
      .from('user_leaderboard_stats')
      .select('*')
      .eq('pi_user_id', piUserId)
      .single();

    res.json({
      success: true,
      piUserId: piUserId,
      bestScores: bestScores || [],
      recentGames: recentGames || [],
      achievements: achievements || [],
      overallStats: overallStats || null
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/leaderboard/daily
 * Get daily leaderboard
 */
async function getDailyLeaderboard(req, res) {
  try {
    const { gameMode = 'classic', date } = req.query;
    
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data: dailyData, error } = await supabase
      .from('daily_leaderboard_ranked')
      .select('*')
      .eq('game_mode', gameMode)
      .eq('date', targetDate)
      .order('rank', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Daily leaderboard fetch error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch daily leaderboard',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      gameMode: gameMode,
      date: targetDate,
      leaderboard: dailyData || []
    });

  } catch (error) {
    console.error('Get daily leaderboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Check for achievements when a new score is submitted
 * @param {string} piUserId - Pi user ID
 * @param {string} gameMode - Game mode
 * @param {number} score - Score achieved
 * @param {number} rank - Current rank
 * @returns {array} Achievements earned
 */
async function checkForAchievements(piUserId, gameMode, score, rank) {
  const achievements = [];

  try {
    // Check for rank-based achievements
    if (rank === 1) {
      achievements.push({
        type: 'first_place',
        title: 'Champion!',
        description: `Reached #1 in ${gameMode} mode!`,
        data: { rank: 1, score, gameMode }
      });
    } else if (rank <= 10) {
      achievements.push({
        type: 'top_10',
        title: 'Elite Player',
        description: `Reached top 10 in ${gameMode} mode!`,
        data: { rank, score, gameMode }
      });
    }

    // Check for score milestones
    const milestones = [100, 500, 1000, 2000, 5000];
    for (const milestone of milestones) {
      if (score >= milestone) {
        achievements.push({
          type: 'high_score',
          title: `${milestone}+ Club`,
          description: `Scored ${milestone}+ points in ${gameMode}!`,
          data: { milestone, score, gameMode }
        });
      }
    }

    // Save achievements to database
    if (achievements.length > 0 && piUserId !== 'anonymous') {
      const achievementRecords = achievements.map(achievement => ({
        pi_user_id: piUserId,
        username: `PiUser_${piUserId.slice(-8)}`,
        achievement_type: achievement.type,
        achievement_data: achievement.data,
        game_mode: gameMode,
        score_achieved: score,
        rank_achieved: rank
      }));

      await supabase
        .from('leaderboard_achievements')
        .insert(achievementRecords);
    }

  } catch (error) {
    console.error('Achievement check error:', error);
  }

  return achievements;
}

// =============================================
// EXPORT FUNCTIONS
// =============================================

module.exports = {
  submitScore: [scoreSubmissionLimiter, submitScore],
  getLeaderboard: [leaderboardLimiter, getLeaderboard],
  getUserStats: [leaderboardLimiter, getUserStats],
  getDailyLeaderboard: [leaderboardLimiter, getDailyLeaderboard],
  
  // Utility functions for external use
  validateScore,
  verifyPiUser,
  generateSessionId,
  checkForAchievements
};

// =============================================
// EXAMPLE USAGE FOR INTEGRATION
// =============================================

/*
// In your main server.js file:

const leaderboardAPI = require('./leaderboard-api');

// Submit score endpoint
app.post('/api/leaderboard/submit-score', ...leaderboardAPI.submitScore);

// Get leaderboard endpoint  
app.get('/api/leaderboard', ...leaderboardAPI.getLeaderboard);

// Get user stats endpoint
app.get('/api/leaderboard/user-stats/:piUserId', ...leaderboardAPI.getUserStats);

// Get daily leaderboard endpoint
app.get('/api/leaderboard/daily', ...leaderboardAPI.getDailyLeaderboard);

// Example POST request to submit score:
fetch('/api/leaderboard/submit-score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'PiPlayer123',
    score: 1250,
    gameMode: 'classic',
    characterUsed: 'red_bird',
    difficulty: 'normal',
    gameDuration: 180,
    coinsCollected: 25,
    powerUpsUsed: ['extra_life', 'shield'],
    piAccessToken: 'pi_access_token_here',
    piUserId: 'pi_user_id_here'
  })
});

// Example GET request to fetch leaderboard:
fetch('/api/leaderboard?gameMode=classic&limit=50&timeframe=daily&verifiedOnly=true')
  .then(res => res.json())
  .then(data => console.log(data.leaderboard));
*/