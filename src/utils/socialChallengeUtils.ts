/**
 * Social Challenge Utilities
 * Centralized logic for detecting and managing social challenge completion
 */

export interface SocialChallengeStatus {
  isCompleted: boolean;
  hasBadge: boolean;
  hasKey: boolean;
  hasIndividualKey: boolean;
  badges: string[];
  individualKeys: Record<string, string | null>;
  debugInfo: {
    allKeys: string[];
    checkedKeys: string[];
    badgeSystem: string[];
  };
}

/**
 * Check if social challenge is completed using all possible indicators
 */
export function checkSocialChallengeCompletion(): SocialChallengeStatus {
  // All possible individual keys
  const allKeys = [
    'socialChallengeBadge',
    'socialChallengeCompleted', 
    'socialTaskCompleted',
    'socialChallengeTask',
    'screamPiUnlocked',
    'completedSocialChallenge',
    'socialChallengeBadgeReceived',
    'socialChallengeTaskCompleted',
    'socialChallengeUnlocked',
    'screamPiAccessGranted',
    'voiceGameUnlocked',
    'socialChallengePassed',
    'socialChallengeVerified',
    'socialChallengeApproved',
    'socialChallengeValidated'
  ];
  
  // Check individual keys
  const individualKeys: Record<string, string | null> = {};
  const checkedKeys: string[] = [];
  
  allKeys.forEach(key => {
    const value = localStorage.getItem(key);
    individualKeys[key] = value;
    if (value === 'true') {
      checkedKeys.push(key);
    }
  });
  
  const hasIndividualKey = checkedKeys.length > 0;
  
  // Check badge system
  const badges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
  const hasSocialChallengeBadge = badges.includes('social-challenge-badge');
  
  // Check social challenge completion key
  const hasSocialChallengeKey = localStorage.getItem('SOCIAL_CHALLENGE_KEY') === '1';
  
  const isCompleted = hasIndividualKey || hasSocialChallengeBadge || hasSocialChallengeKey;
  
  return {
    isCompleted,
    hasBadge: hasSocialChallengeBadge,
    hasKey: hasSocialChallengeKey,
    hasIndividualKey,
    badges,
    individualKeys,
    debugInfo: {
      allKeys,
      checkedKeys,
      badgeSystem: badges
    }
  };
}

/**
 * Force unlock Scream Pi by setting all possible keys
 */
export function forceUnlockScreamPi(): void {
  const keys = [
    'socialChallengeBadge',
    'socialChallengeCompleted',
    'socialTaskCompleted',
    'socialChallengeTask',
    'screamPiUnlocked',
    'completedSocialChallenge',
    'socialChallengeBadgeReceived',
    'socialChallengeTaskCompleted',
    'socialChallengeUnlocked',
    'screamPiAccessGranted',
    'voiceGameUnlocked',
    'socialChallengePassed',
    'socialChallengeVerified',
    'socialChallengeApproved',
    'socialChallengeValidated'
  ];
  
  // Set all keys to true
  keys.forEach(key => localStorage.setItem(key, 'true'));
  
  // Add badge to badge system
  let badges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
  if (!badges.includes('social-challenge-badge')) {
    badges.push('social-challenge-badge');
    localStorage.setItem('flappypi-badges', JSON.stringify(badges));
  }
  
  // Set social challenge key
  localStorage.setItem('SOCIAL_CHALLENGE_KEY', '1');
  
  console.log('🔓 Force unlocked Scream Pi - all keys set');
  console.log('📊 Keys set:', keys);
  console.log('🏆 Badge added to system');
}

/**
 * Clear all social challenge keys (for testing)
 */
export function clearSocialChallengeKeys(): void {
  const keys = [
    'socialChallengeBadge',
    'socialChallengeCompleted',
    'socialTaskCompleted',
    'socialChallengeTask',
    'screamPiUnlocked',
    'completedSocialChallenge',
    'socialChallengeBadgeReceived',
    'socialChallengeTaskCompleted',
    'socialChallengeUnlocked',
    'screamPiAccessGranted',
    'voiceGameUnlocked',
    'socialChallengePassed',
    'socialChallengeVerified',
    'socialChallengeApproved',
    'socialChallengeValidated',
    'SOCIAL_CHALLENGE_KEY'
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
  
  // Remove badge from badge system
  let badges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
  badges = badges.filter((badge: string) => badge !== 'social-challenge-badge');
  localStorage.setItem('flappypi-badges', JSON.stringify(badges));
  
  console.log('🗑️ Cleared all social challenge keys');
}

/**
 * Debug function to log current social challenge status
 */
export function debugSocialChallengeStatus(): void {
  const status = checkSocialChallengeCompletion();
  
  console.log('🔍 Social Challenge Debug Status:');
  console.log('✅ Is Completed:', status.isCompleted);
  console.log('🏆 Has Badge:', status.hasBadge);
  console.log('🔑 Has Key:', status.hasKey);
  console.log('📋 Has Individual Key:', status.hasIndividualKey);
  console.log('📊 Checked Keys:', status.debugInfo.checkedKeys);
  console.log('🏅 Badges:', status.badges);
  console.log('🔑 Individual Keys:', status.individualKeys);
}

/**
 * Check if Scream Pi should be unlocked
 */
export function isScreamPiUnlocked(): boolean {
  const status = checkSocialChallengeCompletion();
  return status.isCompleted;
} 