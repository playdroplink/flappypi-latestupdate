// Music Transition Manager
// Prevents dual music playing and manages smooth transitions

interface MusicTransition {
  trackKey: string;
  startTime: number;
  duration: number;
  isActive: boolean;
}

class MusicTransitionManager {
  private static instance: MusicTransitionManager;
  private currentTransition: MusicTransition | null = null;
  private transitionQueue: MusicTransition[] = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): MusicTransitionManager {
    if (!MusicTransitionManager.instance) {
      MusicTransitionManager.instance = new MusicTransitionManager();
    }
    return MusicTransitionManager.instance;
  }

  // Check if a transition is currently active
  isTransitioning(): boolean {
    return this.currentTransition?.isActive || false;
  }

  // Get current transition info
  getCurrentTransition(): MusicTransition | null {
    return this.currentTransition;
  }

  // Start a new music transition
  startTransition(trackKey: string, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const transition: MusicTransition = {
        trackKey,
        startTime: Date.now(),
        duration,
        isActive: true
      };

      // If there's already a transition, queue this one
      if (this.currentTransition?.isActive) {
        this.transitionQueue.push(transition);
        return;
      }

      this.currentTransition = transition;
      this.isProcessing = true;

      // Auto-complete transition after duration
      setTimeout(() => {
        this.completeTransition();
        resolve();
      }, duration);
    });
  }

  // Complete current transition
  completeTransition(): void {
    if (this.currentTransition) {
      this.currentTransition.isActive = false;
      this.currentTransition = null;
    }

    this.isProcessing = false;

    // Process next transition in queue
    if (this.transitionQueue.length > 0) {
      const nextTransition = this.transitionQueue.shift();
      if (nextTransition) {
        this.currentTransition = nextTransition;
        this.isProcessing = true;

        setTimeout(() => {
          this.completeTransition();
        }, this.currentTransition.duration);
      }
    }
  }

  // Cancel all transitions
  cancelAllTransitions(): void {
    this.currentTransition = null;
    this.transitionQueue = [];
    this.isProcessing = false;
  }

  // Get transition progress (0-1)
  getTransitionProgress(): number {
    if (!this.currentTransition?.isActive) {
      return 0;
    }

    const elapsed = Date.now() - this.currentTransition.startTime;
    return Math.min(elapsed / this.currentTransition.duration, 1);
  }

  // Check if a specific track is currently transitioning
  isTrackTransitioning(trackKey: string): boolean {
    return this.currentTransition?.trackKey === trackKey && this.currentTransition.isActive;
  }

  // Wait for current transition to complete
  waitForTransition(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isTransitioning()) {
        resolve();
        return;
      }

      const checkComplete = () => {
        if (!this.isTransitioning()) {
          resolve();
        } else {
          setTimeout(checkComplete, 50);
        }
      };

      checkComplete();
    });
  }
}

// Export singleton instance
export const musicTransitionManager = MusicTransitionManager.getInstance();

// Export convenience functions
export const isMusicTransitioning = () => musicTransitionManager.isTransitioning();
export const startMusicTransition = (trackKey: string, duration?: number) => 
  musicTransitionManager.startTransition(trackKey, duration);
export const cancelMusicTransitions = () => musicTransitionManager.cancelAllTransitions();
export const waitForMusicTransition = () => musicTransitionManager.waitForTransition();
export const getTransitionProgress = () => musicTransitionManager.getTransitionProgress();
