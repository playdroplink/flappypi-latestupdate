/**
 * Utility function to unlock all game modes including Challenge Mode and Scream Pi
 * This bypasses the social challenge requirement
 */

export const unlockAllModes = () => {
  console.log('🔓 Unlocking all game modes...');
  
  // Set all social challenge completion keys
  const socialChallengeKeys = [
    'socialChallengeBadge',
    'socialChallengeCompleted',
    'socialTaskCompleted',
    'socialChallengeTask',
    'completedSocialChallenge',
    'socialChallengeBadgeReceived',
    'socialChallengeTaskCompleted',
    'socialChallengeUnlocked',
    'socialChallengePassed',
    'socialChallengeVerified',
    'socialChallengeApproved',
    'socialChallengeValidated'
  ];
  
  // Set all Scream Pi unlock keys
  const screamPiKeys = [
    'screamPiUnlocked',
    'screamPiAccessGranted',
    'voiceGameUnlocked'
  ];
  
  // Set all challenge mode keys
  const challengeKeys = [
    'challengeModeUnlocked',
    'allChallengesUnlocked',
    'precisionModeUnlocked',
    'timeBombModeUnlocked',
    'gravityFlipModeUnlocked',
    'windStormModeUnlocked',
    'nightFlightModeUnlocked',
    'speedRushModeUnlocked',
    'reverseModeUnlocked',
    'iceSlideModeUnlocked',
    'lavaEscapeModeUnlocked',
    'shieldRunModeUnlocked',
    'mysteryModeUnlocked'
  ];
  
  // Set all keys to true
  [...socialChallengeKeys, ...screamPiKeys, ...challengeKeys].forEach(key => {
    localStorage.setItem(key, 'true');
  });
  
  // Add social challenge badge to badges array
  const existingBadges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
  const badgesToAdd = [
    'social-challenge-badge',
    'voice-control-badge',
    'challenge-master-badge',
    'precision-master-badge',
    'scream-pi-badge'
  ];
  
  badgesToAdd.forEach(badge => {
    if (!existingBadges.includes(badge)) {
      existingBadges.push(badge);
    }
  });
  
  localStorage.setItem('flappypi-badges', JSON.stringify(existingBadges));
  
  // Set social challenge key
  localStorage.setItem('SOCIAL_CHALLENGE_KEY', '1');
  
  // Set challenge completion flags
  localStorage.setItem('challengeModeCompleted', 'true');
  localStorage.setItem('screamPiCompleted', 'true');
  localStorage.setItem('allModesUnlocked', 'true');
  
  console.log('✅ All game modes unlocked successfully!');
  console.log('🎯 Challenge Mode: Unlocked');
  console.log('🎤 Scream Pi Challenge: Unlocked');
  console.log('🏆 All Challenge Modes: Unlocked');
  console.log('🎖️ Badges Added:', badgesToAdd);
  
  return {
    success: true,
    unlocked: {
      challengeMode: true,
      screamPiChallenge: true,
      allChallenges: true,
      socialChallenge: true
    },
    badges: badgesToAdd,
    message: 'All game modes have been unlocked! You can now access Challenge Mode and Scream Pi Challenge.'
  };
};

// Function to check unlock status
export const checkUnlockStatus = () => {
  const socialChallengeCompleted = localStorage.getItem('socialChallengeCompleted') === 'true';
  const screamPiUnlocked = localStorage.getItem('screamPiUnlocked') === 'true';
  const challengeModeUnlocked = localStorage.getItem('challengeModeUnlocked') === 'true';
  const allModesUnlocked = localStorage.getItem('allModesUnlocked') === 'true';
  
  const badges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
  const hasSocialBadge = badges.includes('social-challenge-badge');
  const hasVoiceBadge = badges.includes('voice-control-badge');
  const hasChallengeBadge = badges.includes('challenge-master-badge');
  
  return {
    socialChallenge: socialChallengeCompleted || hasSocialBadge,
    screamPi: screamPiUnlocked || hasVoiceBadge,
    challengeMode: challengeModeUnlocked || hasChallengeBadge,
    allModes: allModesUnlocked,
    badges: {
      social: hasSocialBadge,
      voice: hasVoiceBadge,
      challenge: hasChallengeBadge
    }
  };
};

// Function to force unlock everything (bypasses all checks)
export const forceUnlockAll = () => {
  console.log('🚀 Force unlocking all modes...');
  
  // Clear any existing locks
  const lockKeys = [
    'challengeLocked',
    'screamPiLocked',
    'socialChallengeRequired',
    'challengeModeLocked'
  ];
  
  lockKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Unlock everything
  const result = unlockAllModes();
  
  // Force refresh the page to apply changes
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
  return result;
};

export default {
  unlockAllModes,
  checkUnlockStatus,
  forceUnlockAll
};
