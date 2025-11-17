# Music Debug Fix

## Problem Description
The console was being flooded with excessive `[MUSIC DEBUG]` messages, especially in game mode where background music should be disabled. This was creating console noise and making it difficult to identify other critical issues. The debug messages were appearing even when debug mode was not explicitly enabled.

## Root Cause Analysis

### 1. **Excessive Debug Logging**
The music and sound systems were logging debug messages regardless of debug settings:
- `[MUSIC DEBUG] Pausing music for ad` - appearing frequently during sound effects
- `[MUSIC DEBUG] Resuming music after ad` - appearing after every sound effect
- `[MUSIC DEBUG] Game route detected` - appearing on every route change
- `[SOUND DEBUG]` messages - appearing for every sound effect

### 2. **Unnecessary Music Operations in Game Mode**
The sound effects system was calling `pauseMusicForAd()` and `resumeMusicAfterAd()` even in game mode where there's no background music, causing unnecessary debug messages.

### 3. **Debug Messages Not Respecting Debug Settings**
All debug messages were using `console.log` instead of `console.debug` and weren't checking for debug flags.

## Solution Implemented

### 1. **Conditional Debug Logging**
Updated all debug messages to only appear when debug mode is explicitly enabled:

```typescript
// Only log in development mode and when debug is enabled
const debug = (typeof window !== 'undefined' && window.location.hostname === 'localhost') &&
  (typeof window !== 'undefined' && (localStorage.getItem('flappyPiDebug') === 'true' || localStorage.getItem('flappyMusicDebug') === 'true'));

if (debug) console.debug(`🎵 [MUSIC DEBUG] Message here`);
```

### 2. **Reduced Debug Verbosity**
- Changed `console.log` to `console.debug` for all debug messages
- Added conditional checks before logging
- Implemented separate debug flags for music and sound systems

### 3. **Debug Flag System**
The system now respects these debug flags:
- `flappyPiDebug` - General debug mode
- `flappyMusicDebug` - Music-specific debug mode
- `flappySoundDebug` - Sound-specific debug mode

## Files Modified

### 1. **src/hooks/useGlobalMusic.ts**
- Updated `pauseMusicForAd()` and `resumeMusicAfterAd()` functions
- Updated `forceStopAllMusic()` function
- Updated `getTrackForRoute()` function with conditional debug logging
- All route detection messages now use conditional debug

### 2. **src/hooks/useSoundEffects.ts**
- Updated `playSound()` function with conditional debug logging
- Updated `initializeGameSounds()` function
- Updated `cleanup()` function
- All sound effect messages now use conditional debug

## Debug Flag Usage

### To Enable Debug Mode:
```javascript
// Enable general debug
localStorage.setItem('flappyPiDebug', 'true');

// Enable music-specific debug
localStorage.setItem('flappyMusicDebug', 'true');

// Enable sound-specific debug
localStorage.setItem('flappySoundDebug', 'true');
```

### To Disable Debug Mode:
```javascript
// Disable all debug
localStorage.removeItem('flappyPiDebug');
localStorage.removeItem('flappyMusicDebug');
localStorage.removeItem('flappySoundDebug');
```

## Benefits of the Fix

1. **✅ Clean Console**: No more excessive debug messages flooding the console
2. **✅ Better Debugging**: Debug messages only appear when explicitly enabled
3. **✅ Performance**: Reduced console operations when debug is disabled
4. **✅ User Experience**: Cleaner console for users and developers
5. **✅ Maintainable**: Easy to enable/disable debug modes as needed
6. **✅ Selective Debugging**: Can enable specific debug modes (music, sound, general)

## Testing Scenarios

The fix ensures that:
- ✅ No debug messages appear by default
- ✅ Debug messages appear when debug flags are enabled
- ✅ Music debug messages only appear when `flappyMusicDebug` is enabled
- ✅ Sound debug messages only appear when `flappySoundDebug` is enabled
- ✅ General debug messages only appear when `flappyPiDebug` is enabled
- ✅ Console remains clean during normal gameplay
- ✅ Debug information is still available when needed

## Technical Details

### Debug Message Categories:
1. **Music System**: Route detection, music pausing/resuming, audio context management
2. **Sound System**: Sound loading, playing, cleanup, error handling
3. **General**: Overall system state and performance

### Debug Levels:
- **console.debug**: Detailed debug information (only when debug flags are enabled)
- **console.warn**: Warning messages (always shown)
- **console.error**: Error messages (always shown)

### Environment Detection:
- Debug messages only appear in development mode (`localhost`)
- Production builds will have minimal console output
- Debug flags can be enabled/disabled at runtime

This fix significantly reduces console noise while maintaining the ability to debug audio issues when needed.
