import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

interface ReturnToFlappyPiButtonProps {
  isVisible: boolean;
  onReturn: () => void;
  socialMediaName?: string;
}

const ReturnToFlappyPiButton: React.FC<ReturnToFlappyPiButtonProps> = ({ 
  isVisible, 
  onReturn, 
  socialMediaName = "social media" 
}) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show button after a short delay
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setShowButton(false);
    }
  }, [isVisible]);

  if (!showButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <Button
        onClick={onReturn}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg border-2 border-white/20 backdrop-blur-sm"
        size="lg"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Flappy Pi
      </Button>
    </div>
  );
};

export default ReturnToFlappyPiButton;
