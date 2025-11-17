// Enhanced Pi Browser Detection Utility
// Better detection of external browsers vs Pi Browser

export interface EnhancedBrowserInfo {
  isPiBrowser: boolean;
  isExternalBrowser: boolean;
  isMobile: boolean;
  platform: string;
  browserName: string;
  osName: string;
  detectionMethod: string;
  confidence: number; // 0-100 confidence level
  externalBrowserType: string;
  adNetworkSupported: boolean;
  detectionDetails: {
    hasPiSDK: boolean;
    hasPiUserAgent: boolean;
    hasPiStorage: boolean;
    hasPiCookies: boolean;
    hasPiNetworkFeatures: boolean;
    externalBrowserIndicators: string[];
  };
}

export class EnhancedPiBrowserDetector {
  private static readonly PI_BROWSER_INDICATORS = [
    'pi browser',
    'pibrowser',
    'pi-browser',
    'pi network',
    'minepi',
    'pinet',
    'pibrowser.app',
    'pi.network'
  ];

  private static readonly EXTERNAL_BROWSER_INDICATORS = [
    'chrome',
    'firefox',
    'safari',
    'edge',
    'opera',
    'brave',
    'uc browser',
    'samsung internet',
    'mi browser',
    'huawei browser',
    'qq browser',
    'baidu browser',
    'yandex',
    'maxthon',
    'vivaldi',
    'chromium'
  ];

  private static readonly MOBILE_BROWSER_INDICATORS = [
    'mobile safari',
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'iemobile',
    'opera mini',
    'opera mobi'
  ];

  /**
   * Enhanced detection with confidence scoring
   */
  static detectBrowser(): EnhancedBrowserInfo {
    if (typeof window === 'undefined') {
      return this.getServerSideInfo();
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const detectionDetails = this.getDetectionDetails(userAgent);
    const confidence = this.calculateConfidence(detectionDetails);
    
    const isPiBrowser = this.isPiBrowser(detectionDetails, confidence);
    const externalBrowserType = this.getExternalBrowserType(userAgent);
    const isExternalBrowser = !isPiBrowser && externalBrowserType !== 'unknown';

    return {
      isPiBrowser,
      isExternalBrowser,
      isMobile: this.isMobile(userAgent),
      platform: this.getPlatform(userAgent),
      browserName: isPiBrowser ? 'Pi Browser' : externalBrowserType,
      osName: this.getOSName(userAgent),
      detectionMethod: this.getDetectionMethod(detectionDetails),
      confidence,
      externalBrowserType,
      adNetworkSupported: false, // Will be set separately
      detectionDetails
    };
  }

  /**
   * Check if it's Pi Browser based on multiple indicators
   */
  private static isPiBrowser(details: any, confidence: number): boolean {
    // Must have high confidence and Pi indicators
    if (confidence < 70) return false;
    
    // Must have at least one strong Pi indicator
    return details.hasPiSDK || 
           details.hasPiUserAgent || 
           details.hasPiNetworkFeatures;
  }

  /**
   * Get detailed detection information
   */
  private static getDetectionDetails(userAgent: string) {
    const details = {
      hasPiSDK: false,
      hasPiUserAgent: false,
      hasPiStorage: false,
      hasPiCookies: false,
      hasPiNetworkFeatures: false,
      externalBrowserIndicators: [] as string[]
    };

    // Check Pi SDK
    if (window.Pi) {
      details.hasPiSDK = true;
      
      // Check for specific Pi SDK features
      if (typeof window.Pi.authenticate === 'function') {
        details.hasPiNetworkFeatures = true;
      }
      if (typeof window.Pi.nativeFeaturesList === 'function') {
        details.hasPiNetworkFeatures = true;
      }
    }

    // Check Pi User Agent
    for (const indicator of this.PI_BROWSER_INDICATORS) {
      if (userAgent.includes(indicator)) {
        details.hasPiUserAgent = true;
        break;
      }
    }

    // Check Pi Storage
    try {
      const piStorageKeys = [
        'pi_authentication',
        'pi_session',
        'pi_wallet',
        'pi_user',
        'pi_network_mode',
        'pi_browser_session',
        'pi_app_data'
      ];
      
      for (const key of piStorageKeys) {
        if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
          details.hasPiStorage = true;
          break;
        }
      }
    } catch (error) {
      console.warn('[EnhancedPiBrowserDetection] Storage access blocked:', error);
    }

    // Check Pi Cookies
    const piCookiePatterns = [
      'pi_auth',
      'pi_session',
      'pi_network',
      'pi_browser',
      'pi_user'
    ];
    
    for (const pattern of piCookiePatterns) {
      if (document.cookie.includes(pattern)) {
        details.hasPiCookies = true;
        break;
      }
    }

    // Check for external browser indicators
    for (const indicator of this.EXTERNAL_BROWSER_INDICATORS) {
      if (userAgent.includes(indicator)) {
        details.externalBrowserIndicators.push(indicator);
      }
    }

    return details;
  }

  /**
   * Calculate confidence level (0-100)
   */
  private static calculateConfidence(details: any): number {
    let confidence = 0;

    // Pi Browser indicators (positive)
    if (details.hasPiSDK) confidence += 40;
    if (details.hasPiUserAgent) confidence += 30;
    if (details.hasPiStorage) confidence += 15;
    if (details.hasPiCookies) confidence += 10;
    if (details.hasPiNetworkFeatures) confidence += 25;

    // External browser indicators (negative)
    if (details.externalBrowserIndicators.length > 0) {
      confidence -= details.externalBrowserIndicators.length * 20;
    }

    // Ensure confidence is between 0-100
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get external browser type
   */
  private static getExternalBrowserType(userAgent: string): string {
    const browserPatterns = [
      { name: 'Chrome', pattern: 'chrome' },
      { name: 'Firefox', pattern: 'firefox' },
      { name: 'Safari', pattern: 'safari' },
      { name: 'Edge', pattern: 'edge' },
      { name: 'Opera', pattern: 'opera' },
      { name: 'Brave', pattern: 'brave' },
      { name: 'UC Browser', pattern: 'uc browser' },
      { name: 'Samsung Internet', pattern: 'samsung internet' },
      { name: 'MI Browser', pattern: 'mi browser' },
      { name: 'Huawei Browser', pattern: 'huawei browser' },
      { name: 'QQ Browser', pattern: 'qq browser' },
      { name: 'Baidu Browser', pattern: 'baidu browser' },
      { name: 'Yandex', pattern: 'yandex' },
      { name: 'Maxthon', pattern: 'maxthon' },
      { name: 'Vivaldi', pattern: 'vivaldi' }
    ];

    for (const browser of browserPatterns) {
      if (userAgent.includes(browser.pattern)) {
        return browser.name;
      }
    }

    return 'unknown';
  }

  /**
   * Check if device is mobile
   */
  private static isMobile(userAgent: string): boolean {
    return this.MOBILE_BROWSER_INDICATORS.some(indicator => 
      userAgent.includes(indicator)
    );
  }

  /**
   * Get platform information
   */
  private static getPlatform(userAgent: string): string {
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) return 'iOS';
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    return 'unknown';
  }

  /**
   * Get OS name
   */
  private static getOSName(userAgent: string): string {
    if (userAgent.includes('android')) return 'Android';
    if (userAgent.includes('iphone')) return 'iOS';
    if (userAgent.includes('ipad')) return 'iOS';
    if (userAgent.includes('ipod')) return 'iOS';
    if (userAgent.includes('windows')) return 'Windows';
    if (userAgent.includes('mac')) return 'macOS';
    if (userAgent.includes('linux')) return 'Linux';
    return 'unknown';
  }

  /**
   * Get detection method description
   */
  private static getDetectionMethod(details: any): string {
    if (details.hasPiSDK && details.hasPiUserAgent) return 'Pi SDK + User Agent';
    if (details.hasPiSDK) return 'Pi SDK';
    if (details.hasPiUserAgent) return 'User Agent';
    if (details.hasPiStorage) return 'Pi Storage';
    if (details.hasPiCookies) return 'Pi Cookies';
    if (details.externalBrowserIndicators.length > 0) return 'External Browser';
    return 'Unknown';
  }

  /**
   * Get server-side info
   */
  private static getServerSideInfo(): EnhancedBrowserInfo {
    return {
      isPiBrowser: false,
      isExternalBrowser: false,
      isMobile: false,
      platform: 'server',
      browserName: 'unknown',
      osName: 'unknown',
      detectionMethod: 'server-side',
      confidence: 0,
      externalBrowserType: 'unknown',
      adNetworkSupported: false,
      detectionDetails: {
        hasPiSDK: false,
        hasPiUserAgent: false,
        hasPiStorage: false,
        hasPiCookies: false,
        hasPiNetworkFeatures: false,
        externalBrowserIndicators: []
      }
    };
  }

  /**
   * Check if user should be prompted to download Pi Browser
   */
  static shouldPromptForPiBrowser(info: EnhancedBrowserInfo): boolean {
    return !info.isPiBrowser && info.isMobile;
  }

  /**
   * Get appropriate download link based on platform
   */
  static getDownloadLink(info: EnhancedBrowserInfo): string {
    if (info.platform === 'iOS') {
      return 'https://apps.apple.com/us/app/pi-browser/id1560911608';
    } else if (info.platform === 'Android') {
      return 'https://play.google.com/store/apps/details?id=pi.browser';
    } else {
      return 'https://minepi.com/Wain2020';
    }
  }

  /**
   * Get user-friendly browser name
   */
  static getBrowserDisplayName(info: EnhancedBrowserInfo): string {
    if (info.isPiBrowser) return 'Pi Browser';
    if (info.externalBrowserType !== 'unknown') return info.externalBrowserType;
    return 'External Browser';
  }
} 