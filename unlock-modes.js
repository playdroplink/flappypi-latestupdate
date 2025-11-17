// 🎮 Flappy Pi - Unlock All Modes Script
// Run this in your browser console to unlock Challenge Mode and Scream Pi

console.log('🚀 Starting Flappy Pi Mode Unlock...');

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
  console.log(`✅ Set ${key}: true`);
});

// Add badges to badges array
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
    console.log(`🏆 Added badge: ${badge}`);
  }
});

localStorage.setItem('flappypi-badges', JSON.stringify(existingBadges));

// Set additional keys
localStorage.setItem('SOCIAL_CHALLENGE_KEY', '1');
localStorage.setItem('challengeModeCompleted', 'true');
localStorage.setItem('screamPiCompleted', 'true');
localStorage.setItem('allModesUnlocked', 'true');

console.log('🎉 All game modes unlocked successfully!');
console.log('🎯 Challenge Mode: ✅ Unlocked');
console.log('🎤 Scream Pi Challenge: ✅ Unlocked');
console.log('🏆 All Challenge Modes: ✅ Unlocked');
console.log('🎖️ Badges Added:', badgesToAdd);
console.log('');
console.log('🔄 Please refresh the page to see the changes!');
console.log('📍 Navigate to /challenge to access Challenge Mode');
console.log('📍 Navigate to /scream-pi to access Scream Pi Challenge');

// Show success alert
alert('🎉 All game modes unlocked successfully!\n\n✅ Challenge Mode\n✅ Scream Pi Challenge\n✅ All Challenge Modes\n\nPlease refresh the page to see the changes.');