// Centralized audio cleanup utility to prevent duplicate audio instances on mobile

// Global tracking of all audio instances
const globalAudioInstances = new Set<HTMLAudioElement>();
const globalAudioClones = new Set<HTMLAudioElement>();

// Track all audio contexts
const globalAudioContexts = new Set<AudioContext>();

// Track global music instance specifically
let globalMusicInstance: HTMLAudioElement | null = null;

/**
 * Register an audio instance for global cleanup
 */
export const registerAudioInstance = (audio: HTMLAudioElement) => {
  globalAudioInstances.add(audio);
  console.debug('🎵 [AUDIO CLEANUP] Registered audio instance');
};

/**
 * Register an audio clone for cleanup
 */
export const registerAudioClone = (audio: HTMLAudioElement) => {
  globalAudioClones.add(audio);
  console.debug('🎵 [AUDIO CLEANUP] Registered audio clone');
};

/**
 * Register an audio context for cleanup
 */
export const registerAudioContext = (context: AudioContext) => {
  globalAudioContexts.add(context);
  console.debug('🎵 [AUDIO CLEANUP] Registered audio context');
};

/**
 * Register global music instance
 */
export const registerGlobalMusic = (audio: HTMLAudioElement) => {
  // Clean up previous global music instance if exists
  if (globalMusicInstance) {
    cleanupAudioInstance(globalMusicInstance);
  }
  globalMusicInstance = audio;
  globalAudioInstances.add(audio);
  console.debug('🎵 [AUDIO CLEANUP] Registered global music instance');
};

/**
 * Get global music instance
 */
export const getGlobalMusicInstance = () => {
  return globalMusicInstance;
};

/**
 * Cleanup a single audio instance with enhanced mobile support
 */
export const cleanupAudioInstance = (audio: HTMLAudioElement) => {
  try {
    if (audio) {
      // Pause and reset audio
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load();
      
      // Remove from DOM
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
      } else {
        audio.remove();
      }
      
      // Remove from tracking sets
      globalAudioInstances.delete(audio);
      globalAudioClones.delete(audio);
      
      // Clear global music instance if it's the same
      if (globalMusicInstance === audio) {
        globalMusicInstance = null;
      }
      
      console.debug('🎵 [AUDIO CLEANUP] Audio instance cleaned up successfully');
    }
  } catch (error) {
    console.debug('🎵 [AUDIO CLEANUP] Audio cleanup error:', error);
  }
};

/**
 * Cleanup all audio instances with enhanced mobile support
 */
export const cleanupAllAudio = () => {
  console.log('🎵 [AUDIO CLEANUP] Cleaning up all audio instances...');
  
  // Cleanup all audio instances
  globalAudioInstances.forEach(audio => {
    cleanupAudioInstance(audio);
  });
  globalAudioInstances.clear();
  
  // Cleanup all audio clones
  globalAudioClones.forEach(audio => {
    cleanupAudioInstance(audio);
  });
  globalAudioClones.clear();
  
  // Suspend all audio contexts
  globalAudioContexts.forEach(context => {
    try {
      if (context.state !== 'closed') {
        context.suspend();
      }
    } catch (error) {
      console.debug('🎵 [AUDIO CLEANUP] Audio context cleanup error:', error);
    }
  });
  globalAudioContexts.clear();
  
  // Clear global music instance
  globalMusicInstance = null;
  
  console.log('🎵 [AUDIO CLEANUP] All audio instances cleaned up');
};

/**
 * Stop all currently playing audio with enhanced mobile support
 */
export const stopAllAudio = () => {
  console.log('🎵 [AUDIO CLEANUP] Stopping all audio...');
  
  // Stop all audio instances
  globalAudioInstances.forEach(audio => {
    try {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (error) {
      console.debug('🎵 [AUDIO CLEANUP] Audio stop error:', error);
    }
  });
  
  // Stop all audio clones
  globalAudioClones.forEach(audio => {
    try {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (error) {
      console.debug('🎵 [AUDIO CLEANUP] Audio clone stop error:', error);
    }
  });
  
  // Stop global music instance specifically
  if (globalMusicInstance && !globalMusicInstance.paused) {
    try {
      globalMusicInstance.pause();
      globalMusicInstance.currentTime = 0;
    } catch (error) {
      console.debug('🎵 [AUDIO CLEANUP] Global music stop error:', error);
    }
  }
  
  console.log('🎵 [AUDIO CLEANUP] All audio stopped');
};

/**
 * Stop only background music (global music instance)
 */
export const stopBackgroundMusic = () => {
  if (globalMusicInstance) {
    try {
      globalMusicInstance.pause();
      globalMusicInstance.currentTime = 0;
      console.debug('🎵 [AUDIO CLEANUP] Background music stopped');
    } catch (error) {
      console.debug('🎵 [AUDIO CLEANUP] Background music stop error:', error);
    }
  }
};

/**
 * Remove audio instance from tracking
 */
export const unregisterAudioInstance = (audio: HTMLAudioElement) => {
  globalAudioInstances.delete(audio);
  if (globalMusicInstance === audio) {
    globalMusicInstance = null;
  }
  console.debug('🎵 [AUDIO CLEANUP] Audio instance unregistered');
};

/**
 * Remove audio clone from tracking
 */
export const unregisterAudioClone = (audio: HTMLAudioElement) => {
  globalAudioClones.delete(audio);
  console.debug('🎵 [AUDIO CLEANUP] Audio clone unregistered');
};

/**
 * Remove audio context from tracking
 */
export const unregisterAudioContext = (context: AudioContext) => {
  globalAudioContexts.delete(context);
  console.debug('🎵 [AUDIO CLEANUP] Audio context unregistered');
};

/**
 * Get count of active audio instances
 */
export const getActiveAudioCount = () => {
  return {
    instances: globalAudioInstances.size,
    clones: globalAudioClones.size,
    contexts: globalAudioContexts.size,
    globalMusic: globalMusicInstance ? 1 : 0
  };
};

/**
 * Check for duplicate audio instances (mobile issue detection)
 */
export const checkForDuplicateAudio = () => {
  const counts = getActiveAudioCount();
  const hasDuplicates = counts.instances > 1 || counts.clones > 2;
  
  if (hasDuplicates) {
    console.warn('🎵 [AUDIO CLEANUP] Duplicate audio instances detected:', counts);
    return true;
  }
  
  return false;
};

/**
 * Mobile-specific audio cleanup
 */
export const cleanupMobileAudio = () => {
  console.log('🎵 [AUDIO CLEANUP] Performing mobile-specific audio cleanup...');
  
  // Stop all audio immediately
  stopAllAudio();
  
  // Clean up any remaining instances
  cleanupAllAudio();
  
  // Reset global state
  globalMusicInstance = null;
  
  console.log('🎵 [AUDIO CLEANUP] Mobile audio cleanup completed');
};

/**
 * Periodic cleanup check for mobile devices
 */
export const startPeriodicCleanup = (intervalMs: number = 5000) => {
  const cleanupInterval = setInterval(() => {
    // Check for duplicates
    if (checkForDuplicateAudio()) {
      console.warn('🎵 [AUDIO CLEANUP] Periodic cleanup triggered due to duplicates');
      cleanupAllAudio();
    }
    
    // Clean up finished audio clones
    globalAudioClones.forEach(audio => {
      if (audio.ended || audio.paused) {
        cleanupAudioInstance(audio);
      }
    });
  }, intervalMs);
  
  return () => {
    clearInterval(cleanupInterval);
  };
};

// Initialize periodic cleanup for mobile devices
if (typeof window !== 'undefined') {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    startPeriodicCleanup();
  }
}
