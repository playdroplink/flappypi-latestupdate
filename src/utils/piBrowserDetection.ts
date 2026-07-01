// Pi Browser Detection and Compatibility Utility
export interface PiBrowserInfo {
  isPiBrowser: boolean;
  isSubdomain: boolean;
  isSecure: boolean;
  userAgent: string;
  hostname: string;
  protocol: string;
  sdkLoaded: boolean;
  sdkVersion?: string;
  nativeFeatures?: string[];
  isPiNet: boolean;
  isMainnet: boolean;
}

export class PiBrowserDetector {
  private static instance: PiBrowserDetector;
  private detectionCache: PiBrowserInfo | null = null;

  static getInstance(): PiBrowserDetector {
    if (!PiBrowserDetector.instance) {
      PiBrowserDetector.instance = new PiBrowserDetector();
    }
    return PiBrowserDetector.instance;
  }

  detect(): PiBrowserInfo {
    if (this.detectionCache) {
      return this.detectionCache;
    }

    const userAgent = navigator.userAgent;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Enhanced Pi Browser detection
    const isPiBrowser = this.isPiBrowser(userAgent);
    const isSubdomain = this.isSubdomain(hostname);
    const isSecure = protocol === 'https:';
    const sdkLoaded = typeof window.Pi !== 'undefined';
    const isPiNet = this.isPiNetEnvironment(hostname, userAgent);
    const isMainnet = this.isMainnetEnvironment(hostname);
    
    const info: PiBrowserInfo = {
      isPiBrowser,
      isSubdomain,
      isSecure,
      userAgent,
      hostname,
      protocol,
      sdkLoaded,
      sdkVersion: sdkLoaded ? window.Pi.version : undefined,
      nativeFeatures: sdkLoaded ? window.Pi.nativeFeaturesList : undefined,
      isPiNet,
      isMainnet
    };

    this.detectionCache = info;
    this.logDetection(info);
    return info;
  }

  private isPiBrowser(userAgent: string): boolean {
    const piBrowserIndicators = [
      'Pi Browser',
      'minepi.com',
      'pinet.com',
      'PiNetwork',
      'PiSDK',
      'PiBrowser',
      'Pi Network',
      'PiCoreTeam',
      'ecosystem.pinet.com',
      'flappypi2807.pinet.com',
      'Pi/',
      'PiApp'
    ];

    // Check user agent for Pi Browser indicators
    const hasPiUserAgent = piBrowserIndicators.some(indicator => 
      userAgent.toLowerCase().includes(indicator.toLowerCase())
    );

    // Check for Pi SDK availability (most reliable indicator)
    const hasPiSDK = typeof window.Pi !== 'undefined';
    
    // Check for Pi-specific window properties
    const hasPiWindowProps = typeof window.Pi !== 'undefined' || 
                            (typeof window.__PI_BROWSER_DETECTED__ !== 'undefined' && window.__PI_BROWSER_DETECTED__) ||
                            (typeof window.__PI_SDK_LOADED__ !== 'undefined' && window.__PI_SDK_LOADED__);

    // Check for Pi-specific localStorage
    const hasPiStorage = typeof localStorage !== 'undefined' && 
                        (localStorage.getItem('pi-browser') !== null || 
                         localStorage.getItem('pi-sdk') !== null ||
                         localStorage.getItem('pi-network') !== null);

    // Check if running on Pi subdomain or Pi Network domains
    const hostname = window.location.hostname.toLowerCase();
    const isOnPiSubdomain = hostname.includes('.pinet.com') ||
                           hostname.includes('.minepi.com') ||
                           hostname.includes('.pi.network') ||
                           hostname.includes('ecosystem.pinet.com') ||
                           hostname.includes('www.flappypi.xyz'); // Add support for www.flappypi.xyz

    // Enhanced detection logic - more permissive for PiNet and mobile Pi Browser
    const isPiBrowser = hasPiUserAgent || hasPiSDK || hasPiWindowProps || hasPiStorage || isOnPiSubdomain;

    console.log('🔍 Pi Browser Detection:', {
      hasPiUserAgent,
      hasPiSDK,
      hasPiWindowProps,
      hasPiStorage,
      isOnPiSubdomain,
      hostname,
      userAgent: userAgent.substring(0, 100),
      isPiBrowser
    });

    return isPiBrowser;
  }

  private isSubdomain(hostname: string): boolean {
    const piSubdomains = [
      '.pinet.com',
      '.minepi.com', 
      '.pi.network',
      'pinet.com',
      'minepi.com',
      'pi.network',
      'ecosystem.pinet.com',
      'flappypi2807.pinet.com'
    ];

    const isPiSubdomain = piSubdomains.some(domain => 
      hostname.includes(domain)
    );

    console.log('[PiBrowserDetector] Subdomain detection:', {
      hostname,
      isPiSubdomain,
      matchedDomains: piSubdomains.filter(domain => hostname.includes(domain))
    });

    return isPiSubdomain;
  }

  private isPiNetEnvironment(hostname: string, userAgent: string): boolean {
    // Check for PiNet ecosystem indicators
    const piNetIndicators = [
      'ecosystem.pinet.com',
      'flappypi2807.pinet.com',
      'PiNet',
      'ecosystem'
    ];

    const hasPiNetHostname = piNetIndicators.some(indicator => 
      hostname.includes(indicator)
    );

    const hasPiNetUserAgent = userAgent.toLowerCase().includes('pinet') || 
                             userAgent.toLowerCase().includes('ecosystem');

    return hasPiNetHostname || hasPiNetUserAgent;
  }

  private isMainnetEnvironment(hostname: string): boolean {
    // Check if we're on mainnet subdomain
    const mainnetIndicators = [
      'flappypi2807.pinet.com',
      'ecosystem.pinet.com'
    ];

    return mainnetIndicators.some(indicator => 
      hostname.includes(indicator)
    );
  }

  private logDetection(info: PiBrowserInfo): void {
    console.log('[PiBrowserDetector] Detection Results:', {
      isPiBrowser: info.isPiBrowser,
      isSubdomain: info.isSubdomain,
      isSecure: info.isSecure,
      hostname: info.hostname,
      sdkLoaded: info.sdkLoaded,
      sdkVersion: info.sdkVersion,
      isPiNet: info.isPiNet,
      isMainnet: info.isMainnet
    });

    if (info.isPiBrowser && info.isSubdomain) {
      console.log('[PiBrowserDetector] Pi Browser on subdomain detected - applying subdomain optimizations');
    }

    if (info.isPiNet) {
      console.log('[PiBrowserDetector] PiNet environment detected - applying PiNet optimizations');
    }

    if (info.isMainnet) {
      console.log('[PiBrowserDetector] Mainnet environment detected - applying mainnet optimizations');
    }
  }

  // Apply subdomain-specific fixes
  applySubdomainFixes(): void {
    const info = this.detect();
    
    if (info.isPiBrowser && info.isSubdomain) {
      console.log('[PiBrowserDetector] Applying subdomain-specific fixes');
      
      // Fix 1: Enhanced CORS handling for subdomains
      this.setupCORSFixes();
      
      // Fix 2: SSL/HTTPS handling
      this.setupSSLFixes();
      
      // Fix 3: iframe detection and handling
      this.setupIframeFixes();
      
      // Fix 4: Service worker and cache handling
      this.setupCacheFixes();
      
      // Fix 5: Pi SDK initialization for subdomains
      this.setupPiSDKFixes();
    }

    // Apply PiNet-specific fixes
    if (info.isPiNet) {
      console.log('[PiBrowserDetector] Applying PiNet-specific fixes');
      this.setupPiNetFixes();
    }

    // Apply mainnet-specific fixes
    if (info.isMainnet) {
      console.log('[PiBrowserDetector] Applying mainnet-specific fixes');
      this.setupMainnetFixes();
    }
  }

  private setupCORSFixes(): void {
    // Add CORS headers dynamically if needed
    if (typeof document !== 'undefined') {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Access-Control-Allow-Origin';
      meta.content = '*';
      document.head.appendChild(meta);
    }
  }

  private setupSSLFixes(): void {
    const info = this.detect();
    
    if (!info.isSecure && info.isSubdomain) {
      console.warn('[PiBrowserDetector] Non-HTTPS detected on subdomain - this may cause issues');
      
      // Force HTTPS redirect for subdomains
      if (window.location.protocol === 'http:' && window.location.hostname.includes('.pinet.com')) {
        const httpsUrl = window.location.href.replace('http:', 'https:');
        console.log('[PiBrowserDetector] Redirecting to HTTPS:', httpsUrl);
        window.location.href = httpsUrl;
      }
    }
  }

  private setupIframeFixes(): void {
    // Detect if running in iframe
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      console.log('[PiBrowserDetector] Running in iframe - applying iframe-specific fixes');
      
      // Remove restrictive sandbox attributes if possible
      try {
        const iframe = window.frameElement as HTMLIFrameElement;
        if (iframe && iframe.sandbox) {
          console.log('[PiBrowserDetector] Current iframe sandbox:', iframe.sandbox);
        }
      } catch (e) {
        // Cross-origin iframe - can't access frameElement
        console.log('[PiBrowserDetector] Cross-origin iframe detected');
      }
    }
  }

  private setupCacheFixes(): void {
    // Clear any problematic caches for subdomains
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('flappy-pi') || cacheName.includes('vite')) {
            console.log('[PiBrowserDetector] Clearing cache:', cacheName);
            caches.delete(cacheName);
          }
        });
      });
    }
  }

  private setupPiSDKFixes(): void {
    const info = this.detect();
    
    if (info.isSubdomain && !info.sdkLoaded) {
      console.log('[PiBrowserDetector] Pi SDK not loaded on subdomain - attempting to load');
      
      // Try to load Pi SDK manually for subdomains
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = () => {
        console.log('[PiBrowserDetector] Pi SDK loaded manually for subdomain');
        if (typeof window.Pi !== 'undefined') {
          try {
            window.Pi.init({ version: "2.0", sandbox: false });
            console.log('[PiBrowserDetector] Pi SDK initialized for subdomain (mainnet)');
          } catch (error) {
            console.error('[PiBrowserDetector] Failed to initialize Pi SDK for subdomain:', error);
          }
        }
      };
      script.onerror = () => {
        console.error('[PiBrowserDetector] Failed to load Pi SDK for subdomain');
      };
      document.head.appendChild(script);
    }
  }

  private setupPiNetFixes(): void {
    // PiNet-specific optimizations
    console.log('[PiBrowserDetector] Setting up PiNet environment optimizations');
    
    // Ensure Pi SDK is loaded for PiNet
    if (typeof window.Pi === 'undefined') {
      console.log('[PiBrowserDetector] Loading Pi SDK for PiNet environment');
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = () => {
        if (typeof window.Pi !== 'undefined') {
          try {
            window.Pi.init({ version: "2.0", sandbox: false });
            console.log('[PiBrowserDetector] Pi SDK initialized for PiNet (mainnet)');
          } catch (error) {
            console.error('[PiBrowserDetector] Failed to initialize Pi SDK for PiNet:', error);
          }
        }
      };
      document.head.appendChild(script);
    }
  }

  private setupMainnetFixes(): void {
    // Mainnet-specific optimizations
    console.log('[PiBrowserDetector] Setting up mainnet environment optimizations');
    
    // Ensure we're using mainnet configuration
    if (typeof window.Pi !== 'undefined') {
      try {
        window.Pi.init({ version: "2.0", sandbox: false });
        console.log('[PiBrowserDetector] Pi SDK initialized for mainnet');
      } catch (error) {
        console.error('[PiBrowserDetector] Failed to initialize Pi SDK for mainnet:', error);
      }
    }
  }

  // Get compatibility recommendations
  getCompatibilityRecommendations(): string[] {
    const info = this.detect();
    const recommendations: string[] = [];

    if (info.isPiBrowser && info.isSubdomain) {
      recommendations.push('Pi Browser on subdomain detected - applying enhanced compatibility mode');
    }

    if (info.isPiNet) {
      recommendations.push('PiNet environment detected - applying PiNet optimizations');
    }

    if (info.isMainnet) {
      recommendations.push('Mainnet environment detected - applying mainnet optimizations');
    }

    if (!info.isSecure && info.isSubdomain) {
      recommendations.push('HTTPS required for subdomain compatibility');
    }

    if (!info.sdkLoaded && info.isSubdomain) {
      recommendations.push('Pi SDK may need manual loading on subdomain');
    }

    if (info.isSubdomain) {
      recommendations.push('Subdomain mode - some features may be limited');
    }

    return recommendations;
  }

  // Check if current environment is optimal for Pi Browser
  isOptimalEnvironment(): boolean {
    const info = this.detect();
    return info.isPiBrowser && info.isSecure && info.sdkLoaded;
  }

  // Check if current environment is optimal for PiNet
  isOptimalPiNetEnvironment(): boolean {
    const info = this.detect();
    return info.isPiNet && info.isMainnet && info.sdkLoaded;
  }
}

// Export singleton instance
export const piBrowserDetector = PiBrowserDetector.getInstance();

// Export convenience functions
export const detectPiBrowser = () => piBrowserDetector.detect();
export const applyPiBrowserFixes = () => piBrowserDetector.applySubdomainFixes();
export const getPiBrowserRecommendations = () => piBrowserDetector.getCompatibilityRecommendations();
export const isOptimalPiEnvironment = () => piBrowserDetector.isOptimalEnvironment();
export const isOptimalPiNetEnvironment = () => piBrowserDetector.isOptimalPiNetEnvironment(); 