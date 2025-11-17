# Enhanced Background Music System - Flappy Pi

## 🎵 **System Overview**

The enhanced background music system provides reliable background music playback on both desktop and mobile devices across all pages (except game modes). The system uses audio files from the `public/sounds/background/` directory and includes comprehensive mobile compatibility features.

## 📁 **Available Music Files**

All background music files are located in `public/sounds/background/`:

- **Flappy Pi Main Theme Song.mp3** (4.9MB) - Main theme for home and profile pages
- **Flappy Pi SecondMain Theme Song.mp3** (1.5MB) - Alternative main theme
- **Flappy Pi Shop Theme Song.MP3** (3.4MB) - Shop and inventory pages
- **Flappy Pi Splash Theme Song.mp3** (251KB) - Splash screen
- **Soaring Dreams Theme Song.mp3** (3.9MB) - Game-related pages
- **Soaring Theme Song.mp3** (2.0MB) - Challenge and alternative game pages
- **Rise and Flap Theme Song.mp3** (3.2MB) - Community and general pages
- **Flap to the Sky Theme Song.mp3** (3.2MB) - Additional theme option

## 🔧 **Key Features**

### **1. Cross-Platform Compatibility**
- ✅ **Desktop Support**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile Support**: iOS Safari, Chrome Mobile, Firefox Mobile
- ✅ **Audio Context Management**: WebKit AudioContext support for mobile
- ✅ **User Gesture Detection**: Automatic detection of user interactions

### **2. Smart Route-Based Music Selection**
- **Home Pages**: Main Theme Song
- **Shop Pages**: Shop Theme Song
- **Community Pages**: Rise and Flap Theme Song
- **Profile Pages**: Main Theme Song
- **Game Pages**: No background music (performance optimization)

### **3. Enhanced Error Handling**
- **Retry Mechanism**: Exponential backoff retry (2s, 4s, 8s delays)
- **Graceful Degradation**: Fallback handling when audio fails
- **Debug Logging**: Comprehensive logging for troubleshooting

### **4. Mobile-Specific Features**
- **Audio Context Resume**: Automatic resumption of suspended audio context
- **Silent Audio Unlock**: Uses silent audio to unlock mobile audio restrictions
- **Visibility Change Handling**: Pauses/resumes when app goes to background/foreground

## 🎮 **Pages with Background Music**

### **Main Pages (✅ Background Music Enabled):**
- **Home Page** (`/home`, `/`) → Main Theme Song
- **Shop Page** (`/shop`) → Shop Theme Song
- **Leaderboard Page** (`/leaderboard`) → Rise and Flap Theme Song
- **Inventory Page** (`/inventory`) → Shop Theme Song
- **Community Page** (`/community`) → Rise and Flap Theme Song
- **Profile Page** (`/profile`) → Main Theme Song
- **Wallet Page** (`/wallet`) → Shop Theme Song
- **Merch Page** (`/merch`) → Rise and Flap Theme Song
- **Reserve Page** (`/reserve`) → Rise and Flap Theme Song
- **Wiki Pages** (`/wiki`, `/full-flappy-wiki`) → Rise and Flap Theme Song
- **Subscription Pages** (`/subscription`, `/subscription-plans`) → Shop Theme Song
- **History Pages** (`/game-history`, `/purchase-history`) → Main Theme Song
- **Invite Friends Page** (`/invite-friends`) → Main Theme Song
- **Sponsor Page** (`/sponsor`) → Rise and Flap Theme Song

### **Game Pages (❌ No Background Music):**
- **Game Routes** (`/game`, `/play`, `/endless`, `/classic`)
- **Challenge Routes** (`/challenge/*`)
- **PvP Routes** (`/pvp-duels`, `/pvp-tournaments`)
- **Dino Pi Game Routes** (`/dino-pi-game`)
- **Scream Pi Game Routes** (`/scream-pi-test`)
- **Social Challenge Routes** (`/social-challenge`)

## 🛠️ **Technical Implementation**

### **Core Components:**

#### **1. useGlobalMusic Hook**
```typescript
export const useGlobalMusic = (musicEnabled: boolean = true) => {
  // Returns:
  return {
    currentTrack,        // Current playing track
    isPlaying,          // Music playing status
    isLoading,          // Loading state
    error,              // Error state
    volume,             // Current volume
    playMusic,          // Play music function
    stopMusic,          // Stop music function
    updateVolume,       // Update volume function
    pauseMusicForAd,    // Pause for ads
    resumeMusicAfterAd, // Resume after ads
    forceResetMusicSystem // Force reset system
  };
};
```

#### **2. Route Detection Function**
```typescript
export const getTrackForRoute = (pathname: string): string => {
  // Game modes - NO BACKGROUND MUSIC
  if (pathname.includes('/game') || pathname.includes('/play')) {
    return 'none';
  }
  
  // Regular pages with background music
  if (pathname === '/home' || pathname === '/') return 'home';
  if (pathname === '/shop') return 'shop';
  if (pathname === '/leaderboard') return 'leaderboard';
  // ... more mappings
  
  return 'default';
};
```

#### **3. Mobile Audio Unlock**
```typescript
const forceMobileAudioUnlock = () => {
  const silentAudio = new Audio();
  silentAudio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAABOW';
  silentAudio.volume = 0.01;
  
  silentAudio.play().then(() => {
    silentAudio.pause();
    silentAudio.currentTime = 0;
  });
};
```

### **Music Track Configuration:**
```typescript
const MUSIC_TRACKS = {
  none: { url: '', volume: 0, loop: false },
  home: { 
    url: '/sounds/background/Flappy Pi Main Theme Song.mp3', 
    volume: 0.3, 
    loop: true 
  },
  shop: { 
    url: '/sounds/background/Flappy Pi Shop Theme Song.MP3', 
    volume: 0.3, 
    loop: true 
  },
  leaderboard: { 
    url: '/sounds/background/Rise and Flap Theme Song.mp3', 
    volume: 0.3, 
    loop: true 
  },
  // ... more tracks
};
```

## 📱 **Mobile Compatibility Features**

### **1. Audio Context Management**
- **WebKit AudioContext Support**: Handles iOS Safari compatibility
- **Context Resume**: Automatically resumes suspended audio context
- **State Management**: Tracks audio context state across app lifecycle

### **2. User Gesture Detection**
- **Multiple Event Listeners**: click, touchstart, keydown, mousedown, pointerdown, touchend
- **Window Focus Events**: Handles mobile app switching
- **One-time Listeners**: Prevents memory leaks
- **Passive Listeners**: Improves performance

### **3. Silent Audio Unlock**
- **Minimal Volume**: 0.01 to avoid audible playback
- **Base64 Audio**: Uses embedded silent audio data
- **Automatic Cleanup**: Pauses and resets after unlock

### **4. Visibility Change Handling**
- **Background Pause**: Pauses music when app goes to background
- **Foreground Resume**: Resumes music when app comes to foreground
- **Settings Respect**: Respects music enabled/disabled settings

## 🖥️ **Desktop Features**

### **1. Enhanced Error Handling**
- **Comprehensive Logging**: Detailed error logging for debugging
- **Retry Mechanism**: Exponential backoff retry system
- **Graceful Fallback**: Proper fallback when audio fails

### **2. Performance Optimization**
- **Singleton Pattern**: Single global music instance
- **Memory Management**: Proper cleanup of audio instances
- **Route-based Loading**: Only loads music for appropriate pages

### **3. Volume Management**
- **Track-specific Volume**: Different volume levels for different tracks
- **Volume Persistence**: Maintains volume across page changes
- **Smooth Transitions**: No fade effects for immediate response

## 🧪 **Testing and Debugging**

### **Music Test Panel**
A development-only test panel is available to verify music functionality:

```typescript
// Available in development mode only
<MusicTestPanel />
```

**Features:**
- **Real-time Status**: Shows current music state
- **Route Testing**: Tests music for current route
- **Track Testing**: Tests all available music tracks
- **Error Display**: Shows any music-related errors
- **System Reset**: Allows manual system reset

### **Debug Mode**
Enable debug logging in browser console:
```javascript
localStorage.setItem('flappyMusicDebug', 'true');
```

### **Debug Information Available:**
- Route detection and music selection
- Audio context creation and resumption
- User gesture detection
- Mobile audio unlock attempts
- Music playback status and errors
- Retry mechanism status

## 🚀 **Usage Examples**

### **Basic Usage in Page Component:**
```typescript
import { useGlobalMusic } from '../hooks/useGlobalMusic';

const MyPage = () => {
  const { isPlaying, currentTrack, error } = useGlobalMusic(true);
  
  return (
    <div>
      {/* Page content */}
      {error && <div>Music Error: {error}</div>}
    </div>
  );
};
```

### **Manual Music Control:**
```typescript
const { playMusic, stopMusic, updateVolume } = useGlobalMusic(true);

// Play specific track
playMusic('home');

// Stop music
stopMusic();

// Update volume (0.0 to 1.0)
updateVolume(0.5);
```

### **Ad Integration:**
```typescript
const { pauseMusicForAd, resumeMusicAfterAd } = useGlobalMusic(true);

// Pause music for ad
pauseMusicForAd();

// Resume music after ad
resumeMusicAfterAd();
```

## 🔧 **Configuration Options**

### **Environment Variables:**
- `NODE_ENV`: Controls debug logging (development only)
- `flappyMusicDebug`: Enables detailed debug logging
- `flappyPiDebug`: Enables general debug logging

### **Audio Settings:**
- **Default Volume**: 0.3 (30%)
- **Loop**: true for background music
- **Preload**: 'auto' for immediate playback
- **Retry Attempts**: 3 with exponential backoff

## ✅ **System Benefits**

### **1. Reliability**
- **Cross-Platform**: Works on all major browsers and devices
- **Error Recovery**: Robust error handling with retry mechanisms
- **Graceful Degradation**: Continues working even when audio fails

### **2. Performance**
- **No Game Lag**: No background music in game modes
- **Memory Efficient**: Proper cleanup and singleton pattern
- **Fast Loading**: Optimized audio loading and playback

### **3. User Experience**
- **Seamless Transitions**: Music changes smoothly between pages
- **Mobile Friendly**: Works perfectly on mobile devices
- **Background Aware**: Respects app background/foreground states

### **4. Developer Friendly**
- **Easy Integration**: Simple hook-based API
- **Comprehensive Logging**: Detailed debug information
- **Test Tools**: Built-in testing and debugging tools

## 🎯 **Summary**

The enhanced background music system provides:

1. **Universal Compatibility**: Works on desktop and mobile across all browsers
2. **Smart Music Selection**: Route-based music assignment for optimal experience
3. **Robust Error Handling**: Comprehensive error recovery and retry mechanisms
4. **Mobile Optimization**: Specialized features for mobile audio restrictions
5. **Performance Focus**: No background music in game modes to prevent lag
6. **Developer Tools**: Comprehensive testing and debugging capabilities

The system ensures that users enjoy consistent, high-quality background music across all pages while maintaining optimal performance and compatibility.
