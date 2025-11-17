// Add this at the top to extend the Window interface
export {};
declare global {
  interface Window {
    __APP_MOUNTED__?: boolean;
    __PI_BROWSER_DETECTED__?: boolean;
    __PI_SDK_LOADED__?: boolean;
    __LOADING_COMPLETE__?: boolean;
    __musicUserGesture?: boolean;
    testPiSDK?: any;
    testnetTester?: any;
    appStatusChecker?: any;
    consoleErrorFixer?: any;
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { UserProfileProvider } from './hooks/useUserProfile';
import { AuthProvider } from './context/AuthContext';
import { isPiBrowser } from './utils/isPiBrowser';
import { applyPiBrowserFixes, getPiBrowserRecommendations } from './utils/piBrowserDetection';
import { appStatusChecker } from './utils/appStatusChecker';
import { consoleErrorFixer } from './utils/consoleErrorFixer';
import { layoutFixer } from './utils/layoutFixer';
import { applyComprehensiveFixes } from './utils/piBrowserFixes';
import { getBaseUrl } from './utils/baseUrl';
import './utils/postMessageFix';
import './utils/consoleErrorSuppressor';
import './utils/appHealthCheck';
import { serviceWorkerManager } from './utils/serviceWorkerManager';
import { validatePiNetworkSetup, isPiNetworkSubdomain } from './config/piNetworkSubdomain';

// Initialize Pi authentication
console.log('[MAIN.TSX] Initializing Pi authentication system...');
console.log('[MAIN.TSX] Pi SDK available for authentication:', typeof window.Pi !== 'undefined');

// Initialize service worker manager for Pi Browser compatibility
serviceWorkerManager.initialize().then(() => {
  console.log('[MAIN.TSX] Service Worker Manager initialized');
}).catch(error => {
  console.warn('[MAIN.TSX] Service Worker Manager initialization failed:', error);
});

// Start console error monitoring
consoleErrorFixer.setupErrorHandlers();

// Initialize layout fixes
layoutFixer.initialize();

// Force hide all scrollbars
layoutFixer.forceHideScrollbars();

// Enhanced Pi Browser detection and fixes
const piBrowserDetected = isPiBrowser();

if (piBrowserDetected) {
  applyPiBrowserFixes();
  window.__PI_BROWSER_DETECTED__ = true;
  window.__PI_SDK_LOADED__ = typeof window.Pi !== 'undefined';
} else {
  window.__PI_BROWSER_DETECTED__ = false;
}
console.log('🎮 Flappy Pi loaded successfully!');

// Enhanced loading indicator management
const hideLoadingIndicator = () => {
  const loadingIndicator = document.getElementById('loading-indicator');

  // If there is no loading indicator element, mark loading complete and exit.
  // This prevents timeout warnings in environments where no indicator is rendered.
  if (!loadingIndicator) {
    if (!window.__LOADING_COMPLETE__) {
      window.__LOADING_COMPLETE__ = true;
    }
    return;
  }

  if (!window.__LOADING_COMPLETE__) {
    window.__LOADING_COMPLETE__ = true;
    console.log('[MAIN.TSX] Hiding loading indicator');

    loadingIndicator.style.opacity = '0';
    loadingIndicator.style.transform = 'translate(-50%, -50%) scale(0.9)';
    loadingIndicator.style.transition = 'all 0.5s ease-out';

    setTimeout(() => {
      if (loadingIndicator.parentNode) {
        loadingIndicator.style.display = 'none';
        console.log('[MAIN.TSX] Loading indicator hidden');
      }
    }, 500);
  }
};

// Force hide loading indicator after a maximum timeout
const forceHideLoading = () => {
  const hasIndicator = !!document.getElementById('loading-indicator');
  setTimeout(() => {
    if (!window.__LOADING_COMPLETE__) {
      if (hasIndicator) {
        console.warn('[MAIN.TSX] Force hiding loading indicator due to timeout');
        hideLoadingIndicator();
      } else {
        // No indicator exists; silently mark complete to avoid noisy warnings.
        window.__LOADING_COMPLETE__ = true;
      }
    }
  }, piBrowserDetected ? 8000 : 10000); // 8 seconds for Pi Browser, 10 for others
};

// Check if root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('[MAIN.TSX] Root element not found! This will cause a white screen.');
  // Simple error display without debug info
  document.body.innerHTML = `
    <div style="text-align:center; padding:2em; color:#333; background:#f8f9fa; margin:1rem; border-radius:0.5rem;">
      <h2>Loading Flappy Pi...</h2>
      <p>Please wait while the game loads.</p>
    </div>
  `;
} else {
  console.log('[MAIN.TSX] Root element found, mounting React app...');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    // Enhanced error boundary for React rendering
    const renderApp = () => {
      // Compute basename so routes work when hosted under a subpath like
      // /app/<sandbox-app-id>/ in Pi Browser Sandbox.
      const getBasename = () => {
        try {
          const path = window.location.pathname;
          const match = path.match(/^\/app\/[^/]+/);
          return match ? match[0] : '';
        } catch {
          return '';
        }
      };

      const basename = getBasename();
      console.log('[MAIN.TSX] Using basename:', basename);

      root.render(
        <BrowserRouter 
          basename={basename}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AuthProvider>
            <UserProfileProvider>
              <App />
            </UserProfileProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    };
    
    // Try to render with error handling
    renderApp();
    
    window.__APP_MOUNTED__ = true;
    console.log('[MAIN.TSX] React app mounted successfully');
    
    // Hide loading indicator with appropriate delay for Pi Browser
    setTimeout(() => {
      hideLoadingIndicator();
    }, piBrowserDetected ? 1000 : 800); // Longer delay for Pi Browser to ensure proper loading
    
    // Force hide loading indicator as backup
    forceHideLoading();
    
  } catch (error) {
    console.error('[MAIN.TSX] Failed to mount React app:', error);
    
    // Hide loading indicator even on error
    hideLoadingIndicator();
    
    // Simple error display without debug info
    const errorHtml = `
      <div style="text-align:center; padding:2em; color:#333; background:#f8f9fa; margin:1rem; border-radius:0.5rem;">
        <h2>Loading Flappy Pi...</h2>
        <p>Please wait while the game loads.</p>
        <button onclick="window.location.reload()" style="background:#007bff; color:white; border:none; padding:0.5rem 1rem; border-radius:0.25rem; margin-top:1rem;">
          Refresh Page
        </button>
      </div>
    `;
    
    rootElement.innerHTML = errorHtml;
  }
  
  // Reduced timeout for white screen detection (5 seconds for Pi Browser, 8 for others)
  setTimeout(() => {
    if (!window.__APP_MOUNTED__) {
      console.warn('[MAIN.TSX] App did not mount within expected time');
      // Force hide loading indicator
      hideLoadingIndicator();
    }
  }, piBrowserDetected ? 5000 : 8000);
}

// Enhanced global error handlers for Pi Browser
window.addEventListener('error', function (event) {
  // Filter out common errors that don't need to be logged
  const errorMessage = event.error?.message || event.message || '';
  
  // Skip logging for common development errors
  if (errorMessage.includes('process is not defined') ||
      errorMessage.includes('ReferenceError: process is not defined') ||
      errorMessage.includes('postMessage') ||
      errorMessage.includes('target origin')) {
    return; // Don't log these common errors
  }
  
  console.error('[MAIN.TSX] Global error caught:', event.error);
  // Hide loading indicator on error
  hideLoadingIndicator();
});

window.addEventListener('unhandledrejection', function (event) {
  // Filter out common promise rejections
  const reason = event.reason?.message || event.reason || '';
  
  // Skip logging for common development errors and network issues
  if (typeof reason === 'string' && (
      reason.includes('process is not defined') ||
      reason.includes('ReferenceError: process is not defined') ||
      reason.includes('postMessage') ||
      reason.includes('target origin') ||
      reason.includes('CORS') ||
      reason.includes('fetch') ||
      reason.includes('Failed to fetch') ||
      reason.includes('NetworkError') ||
      reason.includes('AbortError') ||
      reason.includes('timeout') ||
      reason.includes('Analytics') ||
      reason.includes('analytics'))) {
    event.preventDefault(); // Prevent console logging
    return; // Don't log these common errors
  }
  
  // Only log significant errors
  console.error('[MAIN.TSX] Unhandled promise rejection:', event.reason);
  
  // Hide loading indicator on error
  hideLoadingIndicator();
  
  // Prevent default console error for handled cases
  event.preventDefault();
});

// Pi Browser specific detection and handling
window.addEventListener('load', function() {
  // Force hide scrollbars after page load
  layoutFixer.forceHideScrollbars();
  
  // Re-check Pi Browser detection after page load
  if (!window.__PI_BROWSER_DETECTED__) {
    const piBrowserDetected = isPiBrowser();
    window.__PI_BROWSER_DETECTED__ = piBrowserDetected;
    window.__PI_SDK_LOADED__ = typeof window.Pi !== 'undefined';
  }
  
  // Additional Pi Browser specific initialization
  if (window.__PI_BROWSER_DETECTED__) {
    // Apply comprehensive Pi Browser fixes
    applyComprehensiveFixes({
      enableCORS: true,
      enableSSL: true,
      enableIframe: true,
      enableCache: true,
      enableSDK: true,
      enablePerformance: true
    });
    
    // Additional delay for Pi Browser to ensure everything is loaded
    setTimeout(() => {
      if (!window.__LOADING_COMPLETE__) {
        hideLoadingIndicator();
      }
    }, 2000);
  }
});

// Mobile optimizations for better scrolling
if (piBrowserDetected) {
  // Allow normal touch scrolling
  document.addEventListener('touchmove', function(e) {
    // Only prevent default for multi-touch gestures that might interfere with the game
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: true });
  
  // Allow normal touch behavior
  document.addEventListener('DOMContentLoaded', function() {
    // Force hide scrollbars after DOM is ready
    layoutFixer.forceHideScrollbars();
    
    // Ensure loading indicator is hidden after DOM is ready
    setTimeout(() => {
      if (!window.__LOADING_COMPLETE__) {
        hideLoadingIndicator();
      }
    }, 1000);
  });
}
