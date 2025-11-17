import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const chatbotResponses = {
  greetings: [
    "Hello! I'm your Flappy Pi assistant. How can I help you today?",
    "Hi there! Ready to flap and earn some Pi?",
    "Welcome to Flappy Pi! What would you like to know?",
    "Hey! I'm here to help with all things Flappy Pi!"
  ],
  gameplay: [
    "Flappy Pi is a Pi Network-powered game where you control a bird through pipes. Tap to flap and avoid obstacles!",
    "The goal is to navigate through pipes while collecting Pi coins and power-ups.",
    "You can play different modes: Classic, Endless, Challenge, and Time Attack.",
    "The higher you go, the more coins you earn. Watch out for golden pipes - they give bigger rewards!"
  ],
  earning: [
    "You earn Pi coins by playing the game and completing challenges.",
    "Daily rewards, mystery boxes, and special events all give you Pi coins.",
    "You can also earn by watching ads and participating in community events.",
    "The more you play, the more you earn. It's that simple!"
  ],
  technical: [
    "Flappy Pi works on any device with a web browser.",
    "For the best experience, use Pi Browser which is optimized for Pi Network apps.",
    "The game saves your progress automatically when you're logged in.",
    "If you're having issues, try refreshing the page or clearing your browser cache."
  ],
  community: [
    "Join our Discord server to connect with other players!",
    "Follow us on social media for updates and community events.",
    "The Flappy Pi community is very active and welcoming to new players.",
    "You can share your scores and achievements with the community."
  ],
  default: [
    "I'm not sure about that. Try asking about gameplay, earning Pi, or technical support!",
    "That's a great question! Let me know if you need help with the game or earning Pi.",
    "I'm here to help with Flappy Pi questions. What would you like to know?",
    "Feel free to ask about gameplay, earning Pi, or technical support!"
  ]
};

const FlappyPiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your Flappy Pi assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return chatbotResponses.greetings[Math.floor(Math.random() * chatbotResponses.greetings.length)];
    }
    
    if (lowerMessage.includes('play') || lowerMessage.includes('game') || lowerMessage.includes('how to play')) {
      return chatbotResponses.gameplay[Math.floor(Math.random() * chatbotResponses.gameplay.length)];
    }
    
    if (lowerMessage.includes('earn') || lowerMessage.includes('coin') || lowerMessage.includes('pi')) {
      return chatbotResponses.earning[Math.floor(Math.random() * chatbotResponses.earning.length)];
    }
    
    if (lowerMessage.includes('technical') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return chatbotResponses.technical[Math.floor(Math.random() * chatbotResponses.technical.length)];
    }
    
    if (lowerMessage.includes('community') || lowerMessage.includes('discord') || lowerMessage.includes('social')) {
      return chatbotResponses.community[Math.floor(Math.random() * chatbotResponses.community.length)];
    }
    
    return chatbotResponses.default[Math.floor(Math.random() * chatbotResponses.default.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: getBotResponse(inputValue),
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-200"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md w-full h-[600px] flex flex-col p-0">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <DialogTitle className="text-lg font-bold">Flappy Pi Assistant</DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <User className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Flappy Pi..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlappyPiChatbot; 