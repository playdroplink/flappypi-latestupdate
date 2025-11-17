
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface TutorialButtonProps {
  onOpenTutorial: () => void;
}

const TutorialButton: React.FC<TutorialButtonProps> = ({ onOpenTutorial }) => {
  return (
    <div className="w-full mb-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <Button 
        onClick={onOpenTutorial}
        className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200 border-0 rounded-xl"
      >
        <BookOpen className="mr-3 h-6 w-6" />
        How to Play Tutorial
      </Button>
    </div>
  );
};

export default TutorialButton;
