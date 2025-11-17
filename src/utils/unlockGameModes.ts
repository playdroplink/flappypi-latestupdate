/**
 * Utility function to unlock specific game modes
 * This can be called to unlock Precision Mode and Scream Pi Challenge
 */

export const unlockGameModes = () => {
  // Unlock Scream Pi by setting all the necessary localStorage keys
  const screamPiKeys = [
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
  
  // Set all Scream Pi unlock keys
  screamPiKeys.forEach(key => {
    localStorage.setItem(key, 'true');
  });
  
  // Add social challenge badge to badges array
  const existingBadges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
  if (!existingBadges.includes('social-challenge-badge')) {
    existingBadges.push('social-challenge-badge');
    localStorage.setItem('flappypi-badges', JSON.stringify(existingBadges));
  }
  
  // Set social challenge key
  localStorage.setItem('SOCIAL_CHALLENGE_KEY', '1');
  
  console.log('✅ Game modes unlocked successfully!');
  console.log('🎯 Precision Mode: Unlocked');
  console.log('🎤 Scream Pi Challenge: Unlocked');
  
  return {
    precisionMode: true,
    screamPiChallenge: true,
    message: 'Precision Mode and Scream Pi Challenge have been unlocked!'
  };
};

// Function to check if modes are unlocked
export const checkGameModeStatus = () => {
  const precisionUnlocked = true; // Set to true in ChallengeIndexPage.tsx
  
  const screamPiKeys = [
    'socialChallengeBadge',
    'socialChallengeCompleted',
    'screamPiUnlocked',
    'completedSocialChallenge',
    'socialChallengeUnlocked',
    'screamPiAccessGranted',
    'voiceGameUnlocked'
  ];
  
  const hasScreamPiKey = screamPiKeys.some(key => localStorage.getItem(key) === 'true');
  const hasBadge = JSON.parse(localStorage.getItem('flappypi-badges') || '[]').includes('social-challenge-badge');
  const hasSocialKey = localStorage.getItem('SOCIAL_CHALLENGE_KEY') === '1';
  
  const screamPiUnlocked = hasScreamPiKey || hasBadge || hasSocialKey;
  
  return {
    precisionMode: precisionUnlocked,
    screamPiChallenge: screamPiUnlocked,
    details: {
      precisionMode: 'Unlocked via configuration',
      screamPiChallenge: {
        hasKey: hasScreamPiKey,
        hasBadge: hasBadge,
        hasSocialKey: hasSocialKey
      }
    }
  };
}; 