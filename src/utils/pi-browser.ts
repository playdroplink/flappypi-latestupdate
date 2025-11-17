// src/utils/pi-browser.ts
// Global platform URLs and constants

// Add TypeScript declarations for Pi Browser specific properties
declare global {
  interface Window {
    AndroidInterface?: any;
    webkit?: {
      messageHandlers?: {
        piWallet?: any;
      };
    };
  }
}

// Dynamic import for ua-parser-js to avoid build issues
const getUAParser = () => {
  try {
    return require('ua-parser-js');
  } catch {
    return null;
  }
};

export const PI_BROWSER_URL = "https://pinet.com/";
export const PI_BROWSER_DOWNLOAD_URL = "https://play.google.com/store/apps/details?id=pi.browser";
export const PI_PLATFORM_DOMAINS = ['minepi.com', 'pi.app', 'pinet.com'];

interface PiBrowserDetectionResult {
  isPiBrowser: boolean;
  detectionScore: number;
  detectionMethods: string[];
}

const detectPiBrowser = (): PiBrowserDetectionResult => {
  if (typeof window === 'undefined') {
    return { isPiBrowser: false, detectionScore: 0, detectionMethods: ["Server-side environment"] };
  }

  const detectionMethods: string[] = [];
  let detectionScore = 0;

  // Method 1: Check for Pi Network SDK
  if (typeof window.Pi !== 'undefined') {
    detectionScore += 3;
    detectionMethods.push("Pi SDK Present");
  }

  // Method 2: User Agent Analysis
  const UAParser = getUAParser();
  if (!UAParser) {
    // Fallback if UAParser is not available
    if (navigator.userAgent.toLowerCase().includes('pi-browser')) {
      detectionScore += 2;
      detectionMethods.push("User Agent (fallback)");
    }
  } else {
    const ua = new UAParser(window.navigator.userAgent);
    const browser = ua.getBrowser();
    const os = ua.getOS();

    if (browser.name?.toLowerCase().includes('pi') || 
        navigator.userAgent.toLowerCase().includes('pi-browser')) {
      detectionScore += 2;
      detectionMethods.push("User Agent");
    }

    // Method 5: Mobile OS Check
    if (os.name === 'Android' || os.name === 'iOS') {
      detectionScore += 1;
      detectionMethods.push("Mobile OS");
    }
  }

  // Method 3: Platform Features
  if (typeof window.AndroidInterface !== 'undefined' || 
      typeof window.webkit?.messageHandlers?.piWallet !== 'undefined') {
    detectionScore += 2;
    detectionMethods.push("Platform Features");
  }

  // Method 4: Screen Characteristics
  if (window.screen) {
    const { width, height } = window.screen;
    if (width <= 500 && height <= 900) { // Common mobile dimensions
      detectionScore += 1;
      detectionMethods.push("Mobile Screen Size");
    }
  }

  // Method 6: Check for Pi-specific localStorage items
  try {
    if (localStorage.getItem('pi_authentication') || 
        localStorage.getItem('pi_wallet')) {
      detectionScore += 1;
      detectionMethods.push("Pi Storage");
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // Method 7: Check for Pi-specific cookies
  if (document.cookie.includes('pi_auth') || 
      document.cookie.includes('pi_session')) {
    detectionScore += 1;
    detectionMethods.push("Pi Cookies");
  }

  return {
    isPiBrowser: detectionScore >= 3, // Require at least 3 points for positive detection
    detectionScore,
    detectionMethods
  };
};

// Cache the result to avoid multiple detections
let cachedDetection: PiBrowserDetectionResult | null = null;

export const isRunningInPiBrowser = (): boolean => {
  if (cachedDetection) {
    return cachedDetection.isPiBrowser;
  }
  
  cachedDetection = detectPiBrowser();
  return cachedDetection.isPiBrowser;
};

export function redirectToPiBrowser() {
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `pi://browser?url=${currentUrl}`;
  
  // Fallback after delay if redirect fails
  setTimeout(() => {
    window.location.href = PI_BROWSER_DOWNLOAD_URL;
  }, 1000);
}

// Check if the Pi Browser protocol is supported
function checkProtocolSupport(protocol: string): Promise<boolean> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const timeoutId = setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve(false);
    }, 1000);

    iframe.onload = () => {
      clearTimeout(timeoutId);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve(true);
    };

    try {
      iframe.src = `${protocol}://test`;
    } catch (e) {
      clearTimeout(timeoutId);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      resolve(false);
    }
  });
}
