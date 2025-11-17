// Pi Browser Redirect Utility
// Ensures Flappy Pi only works in Pi Browser mainnet

export const piBrowserRedirect = {
  /**
   * Check if user is in Pi Browser
   */
  isInPiBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent;
    const hostname = window.location.hostname;
    
    // Check for Pi Browser user agent
    const isPiBrowserApp = userAgent.includes('Pi Browser') || 
                          userAgent.includes('PiNetwork') ||
                          userAgent.includes('PiBrowser') ||
                          userAgent.includes('PiApp');
    
    // Check for Pi Network subdomain
    const isPiNetworkSubdomain = hostname.includes('.pinet.com') ||
                                hostname.includes('.minepi.com') ||
                                hostname === 'flappypi2807.pinet.com';
    
    // Check if Pi SDK is available
    const hasPiSDK = typeof window.Pi !== 'undefined';
    
    return isPiBrowserApp || isPiNetworkSubdomain || hasPiSDK;
  },

  /**
   * Check if user is in Pi Browser mainnet
   */
  isInPiBrowserMainnet(): boolean {
    if (!this.isInPiBrowser()) return false;
    
    // Additional checks for mainnet
    const hostname = window.location.hostname;
    const isMainnetSubdomain = hostname === 'flappypi2807.pinet.com';
    
    return isMainnetSubdomain;
  },

  /**
   * Redirect to Pi Browser download if not in Pi Browser
   */
  redirectToPiBrowser(): void {
    if (typeof window === 'undefined') return;
    
    // Show Pi Browser download prompt
    const shouldDownload = confirm(
      'Flappy Pi requires Pi Browser to play!\n\n' +
      'Pi Browser is the official mobile browser for Pi Network apps.\n\n' +
      'Would you like to download Pi Browser?'
    );
    
    if (shouldDownload) {
      window.location.href = 'https://minepi.com/Wain2020';
    }
  },

  /**
   * Force redirect to Pi Browser if not in Pi Browser
   */
  forceRedirectToPiBrowser(): void {
    if (typeof window === 'undefined') return;
    
    if (!this.isInPiBrowser()) {
      window.location.href = 'https://minepi.com/Wain2020';
    }
  },

  /**
   * Show Pi Browser requirement message
   */
  showPiBrowserMessage(): void {
    if (typeof window === 'undefined') return;
    
    const message = `
      🎮 Flappy Pi - Pi Network Game
      
      This game is designed exclusively for Pi Browser!
      
      Pi Browser is the official mobile browser for Pi Network apps.
      It provides secure authentication, payments, and ads integration.
      
      📱 Download Pi Browser:
      https://minepi.com/Wain2020
      
      🔗 Pi Network: https://minepi.com
    `;
    
    alert(message);
  },

  /**
   * Initialize Pi Browser check and redirect
   */
  init(): void {
    if (typeof window === 'undefined') return;
    
    // Check if we're in Pi Browser
    if (!this.isInPiBrowser()) {
      console.log('⚠️ Not in Pi Browser - redirecting to download page');
      this.redirectToPiBrowser();
      return;
    }
    
    // Check if we're in mainnet
    if (!this.isInPiBrowserMainnet()) {
      console.log('⚠️ Not in Pi Browser mainnet - app may not work correctly');
    }
    
    console.log('✅ Pi Browser detected - Flappy Pi ready to play!');
  }
};

export default piBrowserRedirect; 