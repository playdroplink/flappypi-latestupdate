import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ExternalLink, 
  Globe, 
  Smartphone, 
  CheckCircle, 
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  piBrowserRedirect, 
  PiBrowserRedirectOptions,
  FLAPPY_PI_OFFICIAL_URL,
  PI_BROWSER_DOWNLOAD_URL 
} from '@/utils/piBrowserRedirect';

interface PiBrowserDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  options?: PiBrowserRedirectOptions;
}

const PiBrowserDownloadModal: React.FC<PiBrowserDownloadModalProps> = ({
  isOpen,
  onClose,
  options = {}
}) => {
  const [browserInfo, setBrowserInfo] = useState(piBrowserRedirect.getBrowserInfo());
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBrowserInfo(piBrowserRedirect.getBrowserInfo());
    }
  }, [isOpen]);

  const handleDownloadPiBrowser = () => {
    setIsRedirecting(true);
    piBrowserRedirect.redirectToPiBrowserDownload();
    setTimeout(() => setIsRedirecting(false), 2000);
  };

  const handleVisitFlappyPi = () => {
    setIsRedirecting(true);
    piBrowserRedirect.redirectToFlappyPiOfficial();
    setTimeout(() => setIsRedirecting(false), 2000);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Globe className="w-6 h-6 text-blue-600" />
            Pi Browser Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Browser Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Current Browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={browserInfo.isPiBrowser ? "default" : "secondary"}>
                {browserInfo.browserName}
              </Badge>
              {browserInfo.isMobile && (
                <Badge variant="outline">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile
                </Badge>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-gray-700">
                  To watch ads and earn rewards in Flappy Pi, you need to use the official Pi Browser.
                </p>
                <p className="text-sm text-gray-600">
                  Pi Browser is the secure mobile browser for the Pi Network ecosystem, where you can access Pi apps, make payments, and earn rewards.
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">Pi Browser Features:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Watch ads and earn Pi rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Secure Pi Network payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Access to Pi ecosystem apps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Enhanced privacy and security</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleDownloadPiBrowser}
              disabled={isRedirecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isRedirecting ? 'Opening...' : 'Download Pi Browser'}
            </Button>

            <Button 
              onClick={handleVisitFlappyPi}
              disabled={isRedirecting}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Flappy Pi Official
            </Button>

            <Button 
              onClick={handleClose}
              variant="ghost"
              className="w-full text-gray-600"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            <p>Pi Browser is free and available for Android and iOS devices.</p>
            <p className="mt-1">
              Learn more at{' '}
              <a 
                href="https://minepi.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                minepi.com
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PiBrowserDownloadModal; 