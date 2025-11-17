/**
 * Mobile Audio Test Utility
 * Helps debug mobile background music issues
 */

export const testMobileAudio = () => {

  
  const diagnostics = {
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isPiBrowser: /Pi Browser/i.test(navigator.userAgent),
    hasAudioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
    hasUserGesture: window.__musicUserGesture === true,
    audioContextResumed: window.__audioContextResumed === true,
    globalMusicInstance: !!window.__flappyGlobalMusic,
    globalMusicPlaying: window.__flappyGlobalMusic?.paused === false,
  };
  

  
  // Test audio context creation
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const testContext = new AudioContextClass();

      
      // Test audio context resume
      if (testContext.state === 'suspended') {
        testContext.resume().then(() => {
  
        }).catch((error) => {

        });
      }
      
      // Clean up test context
      testContext.close();
    } else {

    }
  } catch (error) {
    
  }
  
  // Test audio element creation
  try {
    const testAudio = new Audio();
    testAudio.src = '/sounds/background/Flappy Pi Main Theme Song.mp3';
    testAudio.volume = 0.1;
    testAudio.preload = 'metadata';
    
    testAudio.addEventListener('canplaythrough', () => {

    });
    
    testAudio.addEventListener('error', (e) => {
      
    });
    
    testAudio.load();
  } catch (error) {
    
  }
  
  // Provide recommendations
  
  
  if (diagnostics.isMobile) {
    if (!diagnostics.hasUserGesture) {
      console.log('  - User interaction required for audio playback');
      console.log('  - Tap/click anywhere to enable audio');
    }
    
    if (!diagnostics.audioContextResumed) {
      console.log('  - Audio context needs to be resumed');
      console.log('  - This should happen automatically on user interaction');
    }
    
    if (diagnostics.isPiBrowser) {
      console.log('  - Pi Browser detected - audio should work normally');
    }
  }
  
  return diagnostics;
};

export const forceMobileAudioUnlock = () => {
  
  
  // Create a silent audio to unlock audio context
  const silentAudio = new Audio();
  silentAudio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAABOW';
  silentAudio.volume = 0.01;
  
  const playPromise = silentAudio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      
      silentAudio.pause();
      silentAudio.currentTime = 0;
      
      // Resume global audio context if available
      if (window.__flappyGlobalMusic && window.__flappyGlobalMusic.paused) {
        window.__flappyGlobalMusic.play().catch(() => {});
      }
    }).catch((error) => {
      
    });
  }
};

// Auto-run test in development mode
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run test after a short delay to ensure everything is loaded
  setTimeout(() => {
    if (window.location.hostname === 'localhost') {
      testMobileAudio();
    }
  }, 2000);
}
