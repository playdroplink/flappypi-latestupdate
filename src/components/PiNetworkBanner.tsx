import React, { useState, useEffect } from 'react';
import { useAdsSystem } from '../hooks/useAdsSystem';
import { usePiBrowserDetection } from '../hooks/usePiBrowserDetection';
import { piAdNetworkService } from '../services/piAdNetworkService';
import { X, Pi, ExternalLink, Play, Star } from 'lucide-react';

interface PiNetworkBannerProps {
  className?: string;
}

const PiNetworkBanner: React.FC<PiNetworkBannerProps> = ({ className = '' }) => {
  const { isAdNetworkSupported } = useAdsSystem();
  const { isPiBrowser } = usePiBrowserDetection();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [adContent, setAdContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Pi Ad Network and load real ads
  useEffect(() => {
    const initializeAdNetwork = async () => {
      if (!isAdNetworkSupported || !isPiBrowser || isDismissed) {
        setIsVisible(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Initialize Pi Ad Network service
        const initResult = await piAdNetworkService.initialize();
        if (!initResult.success) {
          console.warn('Pi Ad Network initialization failed:', initResult.error);
          setIsVisible(false);
          return;
        }

        // Load a real banner ad
        const adResult = await piAdNetworkService.loadAd('header_banner', 'banner');
        if (adResult.success && adResult.ad) {
          setAdContent(adResult.ad.content);
          setIsVisible(true);
          
          // Track ad impression
          piAdNetworkService.trackAdImpression(adResult.ad.id);
        } else {
          console.warn('Failed to load Pi Ad Network ad:', adResult.error);
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Error initializing Pi Ad Network:', error);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdNetwork();
  }, [isAdNetworkSupported, isPiBrowser, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleAdClick = () => {
    // Track ad click for revenue
    if (adContent) {
      // In a real implementation, you would track the click with the ad ID
      console.log('Ad clicked:', adContent);
    }
    
    // Open ad destination
    window.open('https://minepi.com', '_blank');
  };

  const handleLearnMore = () => {
    // Open Pi Network documentation or ad network info
    window.open('https://developers.minepi.com/ads', '_blank');
  };

  if (!isVisible || isLoading) {
    return null;
  }

  // Show real Pi Ad Network ad content
  if (adContent) {
    return (
      <div className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg ${className}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">{adContent.title}</div>
              <div className="text-xs opacity-90">{adContent.description}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdClick}
              className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors font-medium"
            >
              <Star className="w-3 h-3" />
              {adContent.cta}
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback banner if no ad content
  return (
    <div className={`w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-lg ${className}`}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Pi className="w-5 h-5 text-white" />
          <span className="font-semibold text-sm">
            Pi Ad Network Available
          </span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            Earn Pi
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleLearnMore}
            className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Learn More
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PiNetworkBanner;
