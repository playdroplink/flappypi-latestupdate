import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatbotButtonProps {
  onClick: () => void;
  className?: string;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ onClick, className = '' }) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
      size="lg"
    >
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-6 w-6" />
        <div className="hidden sm:flex items-center space-x-1">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span className="font-medium">Flappy Pi AI</span>
        </div>
      </div>
    </Button>
  );
};

export default ChatbotButton;
