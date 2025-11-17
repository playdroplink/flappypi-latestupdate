// NOTE: This modal is only shown for users NOT in the Pi Browser. Pi Browser users are routed directly to splash/auth/home.
import React from 'react';
import { Button } from '@/components/ui/button';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';

interface PiBrowserPromptProps {
  open: boolean;
  onClose: () => void;
  feature?: string; // Optional: name of the feature being accessed
}

const PiBrowserPrompt: React.FC<PiBrowserPromptProps> = ({ open, onClose, feature }) => {
  const { isPiBrowser, detectionMethod } = usePiBrowserDetection();
  
  // If we're in Pi Browser, don't show the prompt
  if (isPiBrowser) {
    return null;
  }

  // If not open, don't render
  if (!open) return null;

  const currentUrl = encodeURIComponent(window.location.href);
  
  // Get device-specific download links
  const getDownloadLink = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
      return 'https://apps.apple.com/us/app/pi-browser/id1560911608';
    } else if (userAgent.includes('android')) {
      return 'https://play.google.com/store/apps/details?id=pi.browser&hl=en&pli=1';
    } else {
      return 'https://minepi.com/Wain2020';
    }
  };

  const downloadLink = getDownloadLink();
  const downloadText = navigator.userAgent.toLowerCase().includes('iphone') || 
                      navigator.userAgent.toLowerCase().includes('ipad') || 
                      navigator.userAgent.toLowerCase().includes('ipod') 
                      ? 'Download Pi Browser (App Store)' 
                      : 'Download Pi Browser';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <img src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-16 h-16 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2 text-blue-800">
          {feature ? `${feature} requires Pi Browser` : 'Open in Pi Browser'}
        </h2>
        <p className="text-gray-600 mb-6">
          To use {feature ? `the ${feature}` : 'all features'}, please open Flappy Pi in the official Pi Browser app.
        </p>
        
        {/* Debug info in development */}
        {(typeof window !== 'undefined' && window.location.hostname === 'localhost') && (
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
            <div>Detection Method: {detectionMethod}</div>
            <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
          </div>
        )}
        
        <Button
          className="w-full mb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          onClick={() => {
            try {
              // Try to open in Pi Browser using deep link
              window.location.href = `pi://browser?url=${currentUrl}`;
              
              // Fallback after a short delay
              setTimeout(() => {
                window.open(downloadLink, '_blank');
              }, 1000);
            } catch (error) {
              console.warn('Failed to open Pi Browser deep link:', error);
              window.open(downloadLink, '_blank');
            }
          }}
        >
          Open in Pi Browser
        </Button>
        <Button
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-xl transition-all duration-200"
          onClick={() => window.open(downloadLink, '_blank')}
        >
          {downloadText}
        </Button>
        
        {/* Additional help text */}
        <p className="text-xs text-gray-500 mt-4">
          Pi Browser is required for payments, rewards, and full game features.
        </p>
      </div>
    </div>
  );
};

export default PiBrowserPrompt;
