# 🎮 Unlock Precision Mode and Scream Pi Challenge

This guide explains how to unlock the **Precision Mode** and **Scream Pi Challenge** game modes in Flappy Pi.

## ✅ What's Been Done

### 1. **Precision Mode** - ✅ UNLOCKED
- **Location**: `src/pages/challenge/ChallengeIndexPage.tsx`
- **Change**: Set `unlocked: true` for the precision challenge
- **Status**: Now available in the Challenge Mode section

### 2. **Scream Pi Challenge** - ✅ UNLOCKED
- **Location**: `src/pages/challenge/ChallengeIndexPage.tsx`
- **Change**: Set `unlocked: true` for the screampi challenge
- **Status**: Now available in the Challenge Mode section

## 🚀 How to Access the Unlocked Modes

### Method 1: Direct Navigation
1. **Precision Mode**: Navigate to `/challenge` and look for the Precision Mode card
2. **Scream Pi Challenge**: Navigate to `/scream-pi` directly

### Method 2: Test Page
1. Navigate to `/unlock-test` to see the unlock status and test the modes
2. Use the "Unlock Both Modes" button to ensure they're unlocked
3. Use the "Test" buttons to navigate to each mode

### Method 3: Browser Console (Quick Unlock)
1. Open your browser's developer console (F12)
2. Copy and paste the entire content of `unlock-modes.js`
3. Press Enter to execute the unlock script
4. Refresh the page to see the changes

## 🛠️ Technical Details

### Precision Mode Configuration
```typescript
{
  id: 'precision',
  name: 'Precision Mode',
  description: 'Pipes are closer together and Flappy Pi\'s jump is weaker. Tap with precision!',
  icon: '🎯',
  difficulty: 'Medium',
  reward: 100,
  rules: { pipeGap: 90, flapStrength: -6, coinBonus: 2 },
  unlocked: true, // ✅ Now unlocked!
  route: ROUTES.CHALLENGE_PRECISION,
  color: 'from-blue-500 to-cyan-500',
  gradient: 'from-blue-50 to-cyan-50'
}
```

### Scream Pi Challenge Configuration
```typescript
{
  id: 'screampi',
  name: 'Scream Pi Challenge',
  description: 'Use your voice to control the game! Scream to score points and complete the challenge.',
  icon: '🎤',
  difficulty: 'Medium',
  reward: 'Voice Control Badge',
  rules: { voiceControl: true, screamScoring: true, timeLimit: 60 },
  unlocked: true, // ✅ Now unlocked!
  route: ROUTES.CHALLENGE_SCREAM_PI,
  color: 'from-purple-500 to-pink-500',
  gradient: 'from-purple-50 to-pink-50'
}
```

## 🔧 Files Modified

1. **`src/pages/challenge/ChallengeIndexPage.tsx`**
   - Changed `unlocked: false` to `unlocked: true` for both modes

2. **`src/components/ChallengeModeSelector.tsx`**
   - Added Scream Pi Challenge to the challenges array
   - Set `unlocked: true` for all challenges

3. **`src/utils/unlockGameModes.ts`** (New)
   - Utility functions to unlock and check game mode status

4. **`src/pages/UnlockTestPage.tsx`** (New)
   - Test page to verify unlock status and test the modes

5. **`src/App.tsx`**
   - Added route for `/unlock-test`

6. **`unlock-modes.js`** (New)
   - Browser console script for quick unlocking

## 🎯 Game Mode Features

### Precision Mode
- **Difficulty**: Medium
- **Reward**: 100 Coins
- **Features**: 
  - Tighter pipe gaps (90px)
  - Weaker jump strength (-6)
  - Double coin bonus
  - Requires precise timing

### Scream Pi Challenge
- **Difficulty**: Medium
- **Reward**: Voice Control Badge
- **Features**:
  - Voice-controlled gameplay
  - Scream to score points
  - 60-second time limit
  - Microphone integration

## 🧪 Testing

1. **Navigate to `/unlock-test`**
2. **Click "Unlock Both Modes"**
3. **Click "Test Precision Mode"** to verify Precision Mode works
4. **Click "Test Scream Pi"** to verify Scream Pi Challenge works

## 🔍 Troubleshooting

### If modes still appear locked:
1. **Refresh the page** after unlocking
2. **Clear browser cache** and try again
3. **Check browser console** for any errors
4. **Verify localStorage** has the correct keys set

### Console commands to check status:
```javascript
// Check if Scream Pi is unlocked
localStorage.getItem('screamPiUnlocked') === 'true'

// Check badges
JSON.parse(localStorage.getItem('flappypi-badges') || '[]').includes('social-challenge-badge')

// Check social challenge key
localStorage.getItem('SOCIAL_CHALLENGE_KEY') === '1'
```

## 🎉 Success!

Both **Precision Mode** and **Scream Pi Challenge** are now unlocked and ready to play! 

- **Precision Mode**: Test your timing skills with tighter pipes and weaker jumps
- **Scream Pi Challenge**: Use your voice to control the game and earn the Voice Control Badge

Enjoy the new game modes! 🎮 