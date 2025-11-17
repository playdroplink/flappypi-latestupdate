// PostMessage Cross-Origin Fix
// This utility fixes cross-origin postMessage errors with Pi Network SDK

interface PostMessageEvent {
  data: any;
  origin: string;
  source: Window;
}

class PostMessageFix {
  private static instance: PostMessageFix;
  private isApplied = false;
  private originalPostMessage: typeof window.postMessage;

  private constructor() {
    this.originalPostMessage = window.postMessage;
  }

  static getInstance(): PostMessageFix {
    if (!PostMessageFix.instance) {
      PostMessageFix.instance = new PostMessageFix();
    }
    return PostMessageFix.instance;
  }

  applyFix(): void {
    if (this.isApplied) return;

    // Override postMessage to handle cross-origin issues
    window.postMessage = (message: any, targetOrigin: string, transfer?: Transferable[]) => {
      try {
        // Handle Pi Network domains
        const piDomains = [
          'https://sandbox.minepi.com',
          'https://minepi.com',
          'https://app-cdn.minepi.com',
          'https://pinet.com'
        ];

        // Check if target origin is a Pi Network domain
        const isPiDomain = piDomains.some(domain => 
          targetOrigin === domain || targetOrigin.startsWith(domain)
        );

        // For localhost development, allow communication with Pi Network
        const isLocalhost = window.location.origin.startsWith('http://localhost:') || 
                           window.location.origin.startsWith('https://localhost:');

        if (isPiDomain && isLocalhost) {
          // Use '*' as target origin for localhost development
          return this.originalPostMessage.call(window, message, '*', transfer);
        }

        // For production, use the original postMessage
        return this.originalPostMessage.call(window, message, targetOrigin, transfer);

      } catch (error) {
        // Fallback: try with '*' as target origin
        try {
          return this.originalPostMessage.call(window, message, '*', transfer);
        } catch (fallbackError) {
          console.warn('PostMessage failed:', fallbackError);
          return;
        }
      }
    };

    // Add message listener to handle incoming messages
    window.addEventListener('message', (event: MessageEvent) => {
      try {
        // Handle messages from Pi Network domains
        const piDomains = [
          'https://sandbox.minepi.com',
          'https://minepi.com',
          'https://app-cdn.minepi.com',
          'https://pinet.com'
        ];

        const isFromPiDomain = piDomains.some(domain => 
          event.origin === domain || event.origin.startsWith(domain)
        );

        if (isFromPiDomain) {
          // Message received from Pi Network - handle it
          this.handlePiMessage(event);
        }
      } catch (error) {
        // Ignore message handling errors
      }
    }, { passive: true });

    this.isApplied = true;
    console.log('PostMessage cross-origin fix applied');
  }

  private handlePiMessage(event: PostMessageEvent): void {
    try {
      // Handle different types of Pi Network messages
      if (event.data && typeof event.data === 'object') {
        // Authentication messages
        if (event.data.type === 'auth' || event.data.type === 'authentication') {
          // Handle authentication
        }
        
        // Payment messages
        if (event.data.type === 'payment' || event.data.type === 'transaction') {
          // Handle payment
        }
        
        // SDK initialization messages
        if (event.data.type === 'sdk_init' || event.data.type === 'ready') {
          // Handle SDK initialization
        }
      }
    } catch (error) {
      // Ignore message handling errors
    }
  }

  // Reset the fix
  reset(): void {
    if (this.isApplied) {
      window.postMessage = this.originalPostMessage;
      this.isApplied = false;
    }
  }
}

// Export singleton instance
export const postMessageFix = PostMessageFix.getInstance();

// Auto-apply the fix
if (typeof window !== 'undefined') {
  postMessageFix.applyFix();
}

export default postMessageFix;
