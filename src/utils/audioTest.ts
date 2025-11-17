// Enhanced audio test utility to verify fixes for mobile audio issues and background music

import { getActiveAudioCount, checkForDuplicateAudio, cleanupMobileAudio } from './audioCleanup';

/**
 * Test audio functionality and report any issues
 */
export const testAudioSystem = () => {
  console.log('🎵 [AUDIO TEST] Testing Audio System...');
  
  // Check active audio count
  const audioCount = getActiveAudioCount();
  console.log('📊 [AUDIO TEST] Active Audio Count:', audioCount);
  
  // Check for duplicates
  const hasDuplicates = checkForDuplicateAudio();
  if (hasDuplicates) {
    console.warn('⚠️ [AUDIO TEST] Duplicate audio instances detected!');
  }
  
  // Test if we can create and play audio
  try {
    const testAudio = new Audio();
    testAudio.src = '/assets/audio/sfx_wing.wav';
    testAudio.volume = 0.1;
    
    const playPromise = testAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('✅ [AUDIO TEST] Audio play test successful');
        setTimeout(() => {
          testAudio.pause();
          testAudio.remove();
        }, 1000);
      }).catch((error) => {
        console.warn('⚠️ [AUDIO TEST] Audio play test failed (expected on first load):', error.message);
        testAudio.remove();
      });
    }
  } catch (error) {
    console.error('❌ [AUDIO TEST] Audio creation test failed:', error);
  }
  
  // Check for common mobile audio issues
  const issues = [];
  
  if (typeof window !== 'undefined') {
    // Check if we're in a mobile browser
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 [AUDIO TEST] Mobile device detected');
      
      // Check if autoplay is blocked
      if (window.__musicUserGesture === false) {
        issues.push('User gesture not detected - autoplay may be blocked');
      }
      
      // Check if we have audio context support
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        issues.push('No audio context support detected');
      }
      
      // Check if audio context is resumed
      if (window.__audioContextResumed !== true) {
        issues.push('Audio context not resumed');
      }
    }
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ [AUDIO TEST] Mobile audio issues detected:', issues);
  } else {
    console.log('✅ [AUDIO TEST] No mobile audio issues detected');
  }
  
  return {
    audioCount,
    hasDuplicates,
    issues,
    isMobile: typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  };
};

/**
 * Test audio context functionality
 */
export const testAudioContext = async () => {
  console.log('🎵 [AUDIO TEST] Testing Audio Context...');
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.error('❌ [AUDIO TEST] No AudioContext support');
      return false;
    }
    
    const audioContext = new AudioContextClass();
    console.log('✅ [AUDIO TEST] AudioContext created successfully');
    
    // Test context resume
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('✅ [AUDIO TEST] AudioContext resumed successfully');
    }
    
    // Test oscillator creation
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.01; // Very quiet
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
      console.log('✅ [AUDIO TEST] AudioContext oscillator test successful');
    }, 100);
    
    return true;
  } catch (error) {
    console.error('❌ [AUDIO TEST] AudioContext test failed:', error);
    return false;
  }
};

/**
 * Test background music functionality
 */
export const testBackgroundMusic = async () => {
  console.log('🎵 [AUDIO TEST] Testing Background Music...');
  
  try {
    const testAudio = new Audio('/sounds/background/Flappy Pi Main Theme Song.mp3');
    testAudio.volume = 0.1;
    testAudio.loop = false;
    
    // Test loading
    await new Promise((resolve, reject) => {
      testAudio.addEventListener('canplaythrough', resolve, { once: true });
      testAudio.addEventListener('error', reject, { once: true });
      testAudio.load();
    });
    
    console.log('✅ [AUDIO TEST] Background music loaded successfully');
    
    // Test playing (if user gesture is available)
    if (window.__musicUserGesture) {
      await testAudio.play();
      console.log('✅ [AUDIO TEST] Background music played successfully');
      
      setTimeout(() => {
        testAudio.pause();
        testAudio.remove();
      }, 2000);
    } else {
      console.log('⚠️ [AUDIO TEST] Background music test skipped - no user gesture');
      testAudio.remove();
    }
    
    return true;
  } catch (error) {
    console.error('❌ [AUDIO TEST] Background music test failed:', error);
    return false;
  }
};

/**
 * Test sound effects functionality
 */
export const testSoundEffects = async () => {
  console.log('🎵 [AUDIO TEST] Testing Sound Effects...');
  
  const soundEffects = [
    '/audio/sfx_wing.wav',
    '/audio/sfx_point.wav',
    '/audio/sfx_hit.wav',
    '/audio/sfx_die.wav'
  ];
  
  let successCount = 0;
  
  for (const soundUrl of soundEffects) {
    try {
      const testAudio = new Audio(soundUrl);
      testAudio.volume = 0.1;
      
      await new Promise((resolve, reject) => {
        testAudio.addEventListener('canplaythrough', resolve, { once: true });
        testAudio.addEventListener('error', reject, { once: true });
        testAudio.load();
      });
      
      console.log(`✅ [AUDIO TEST] Sound effect loaded: ${soundUrl}`);
      successCount++;
      
      // Test playing if user gesture is available
      if (window.__musicUserGesture) {
        await testAudio.play();
        setTimeout(() => {
          testAudio.pause();
          testAudio.remove();
        }, 1000);
      } else {
        testAudio.remove();
      }
    } catch (error) {
      console.warn(`⚠️ [AUDIO TEST] Sound effect failed: ${soundUrl}`, error);
    }
  }
  
  console.log(`📊 [AUDIO TEST] Sound effects test: ${successCount}/${soundEffects.length} successful`);
  return successCount === soundEffects.length;
};

/**
 * Comprehensive audio system test
 */
export const runComprehensiveAudioTest = async () => {
  console.log('🎵 [AUDIO TEST] Starting Comprehensive Audio Test...');
  
  const results = {
    basicTest: testAudioSystem(),
    audioContext: await testAudioContext(),
    backgroundMusic: await testBackgroundMusic(),
    soundEffects: await testSoundEffects()
  };
  
  console.log('📊 [AUDIO TEST] Comprehensive Test Results:', results);
  
  // Check for mobile-specific issues
  if (results.basicTest.isMobile) {
    console.log('📱 [AUDIO TEST] Mobile-specific recommendations:');
    
    if (!window.__musicUserGesture) {
      console.log('  - User interaction required for audio playback');
    }
    
    if (results.basicTest.hasDuplicates) {
      console.log('  - Duplicate audio instances detected - consider cleanup');
      cleanupMobileAudio();
    }
    
    if (results.basicTest.issues.length > 0) {
      console.log('  - Issues found:', results.basicTest.issues);
    }
  }
  
  return results;
};

/**
 * Mobile-specific audio diagnostics
 */
export const runMobileAudioDiagnostics = () => {
  console.log('📱 [AUDIO TEST] Running Mobile Audio Diagnostics...');
  
  const diagnostics = {
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    hasAudioContext: !!(window.AudioContext || (window as any).webkitAudioContext),
    hasUserGesture: window.__musicUserGesture === true,
    audioContextResumed: window.__audioContextResumed === true,
    activeAudioCount: getActiveAudioCount(),
    hasDuplicates: checkForDuplicateAudio()
  };
  
  console.log('📊 [AUDIO TEST] Mobile Diagnostics:', diagnostics);
  
  // Provide recommendations
  if (diagnostics.isMobile) {
    console.log('📱 [AUDIO TEST] Mobile Audio Recommendations:');
    
    if (!diagnostics.hasUserGesture) {
      console.log('  - User interaction required for audio playback');
      console.log('  - Tap/click anywhere to enable audio');
    }
    
    if (!diagnostics.audioContextResumed) {
      console.log('  - Audio context needs to be resumed');
      console.log('  - This should happen automatically on user interaction');
    }
    
    if (diagnostics.hasDuplicates) {
      console.log('  - Duplicate audio instances detected');
      console.log('  - Running cleanup...');
      cleanupMobileAudio();
    }
  }
  
  return diagnostics;
};

// Auto-run tests in development mode
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        runComprehensiveAudioTest().catch(console.error);
      }, 2000);
    });
  } else {
    setTimeout(() => {
      runComprehensiveAudioTest().catch(console.error);
    }, 2000);
  }
}
