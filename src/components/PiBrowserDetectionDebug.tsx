import React, { useEffect } from 'react';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';
import { isRunningInPiBrowser } from '../utils/pi-browser';

const PiBrowserDetectionDebug: React.FC = () => {
  const { isPiBrowser, isMobile, browserName, detectionMethod } = usePiBrowserDetection();

  useEffect(() => {
    // Console debug information
    console.log('🔍 Pi Browser Detection Debug:');
    console.log('Hook Result:', { isPiBrowser, isMobile, browserName, detectionMethod });
    console.log('Utility Function Result:', isRunningInPiBrowser());
    console.log('User Agent:', navigator.userAgent);
    console.log('Pi SDK Available:', typeof window !== 'undefined' && !!window.Pi);
    console.log('Pi SDK Methods:', typeof window !== 'undefined' && window.Pi ? Object.keys(window.Pi) : 'N/A');
    
    // Test individual detection methods
    const ua = navigator.userAgent.toLowerCase();
    console.log('User Agent Tests:', {
      'pi browser': ua.includes('pi browser'),
      'pibrowser': ua.includes('pibrowser'),
      'pi-browser': ua.includes('pi-browser')
    });
    
    console.log('Screen Size:', window.screen ? `${window.screen.width}x${window.screen.height}` : 'N/A');
    console.log('Mobile Detection:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Test localStorage
    try {
      const piStorage = localStorage.getItem('pi_authentication') || 
                       sessionStorage.getItem('pi_session') ||
                       localStorage.getItem('pi_wallet');
      console.log('Pi Storage:', !!piStorage);
    } catch (e) {
      console.log('Pi Storage: Blocked');
    }
    
    // Test cookies
    const piCookies = document.cookie.includes('pi_auth') || document.cookie.includes('pi_session');
    console.log('Pi Cookies:', piCookies);
    
    // Test platform features
    const platformFeatures = typeof window.AndroidInterface !== 'undefined' || 
                           typeof window.webkit?.messageHandlers?.piWallet !== 'undefined';
    console.log('Platform Features:', platformFeatures);
    
  }, [isPiBrowser, isMobile, browserName, detectionMethod]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">🐛 Pi Browser Detection Debug</h3>
      <p className="text-sm text-yellow-700 mb-2">
        Check the browser console for detailed detection information.
      </p>
      <div className="text-xs text-yellow-600 space-y-1">
        <div>Hook Result: {isPiBrowser ? '✅ Pi Browser' : '❌ Not Pi Browser'}</div>
        <div>Utility Result: {isRunningInPiBrowser() ? '✅ Pi Browser' : '❌ Not Pi Browser'}</div>
        <div>Mobile: {isMobile ? '✅ Yes' : '❌ No'}</div>
        <div>Browser: {browserName || 'Unknown'}</div>
        <div>Method: {detectionMethod || 'Unknown'}</div>
      </div>
    </div>
  );
};

export default PiBrowserDetectionDebug; 