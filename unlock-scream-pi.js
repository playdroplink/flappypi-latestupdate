// Unlock Scream Pi Mode - Run this in browser console
(function() {
  console.log('🔓 Unlocking Scream Pi Mode...');
  
  // Set all the required localStorage keys
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
  
  keys.forEach(key => {
    localStorage.setItem(key, 'true');
  });
  
  // Add the badge to the badges array
  const existingBadges = JSON.parse(localStorage.getItem('flappypi-badges') || '[]');
  if (!existingBadges.includes('social-challenge-badge')) {
    existingBadges.push('social-challenge-badge');
    localStorage.setItem('flappypi-badges', JSON.stringify(existingBadges));
  }
  
  // Set the special key
  localStorage.setItem('SOCIAL_CHALLENGE_KEY', '1');
  
  console.log('✅ Scream Pi Mode unlocked successfully!');
  console.log('🎤 You can now access Scream Pi from the home screen or game mode modal');
  console.log('📍 Navigate to: /scream-pi');
  
  // Dispatch a storage event to notify the app
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'screamPiUnlocked',
    newValue: 'true'
  }));
})(); 