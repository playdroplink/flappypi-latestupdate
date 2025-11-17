import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Globe, Users, Star, CheckCircle } from 'lucide-react';

interface ChatbotLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotLanguageModal: React.FC<ChatbotLanguageModalProps> = ({ isOpen, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  if (!isOpen) return null;

  const languages = [
    { name: 'English', code: 'en', flag: '🇺🇸', country: 'United States', speakers: '1.5B+' },
    { name: 'Chinese', code: 'zh', flag: '🇨🇳', country: 'China', speakers: '1.3B+' },
    { name: 'Hindi', code: 'hi', flag: '🇮🇳', country: 'India', speakers: '600M+' },
    { name: 'Spanish', code: 'es', flag: '🇪🇸', country: 'Spain', speakers: '500M+' },
    { name: 'Arabic', code: 'ar', flag: '🇸🇦', country: 'Saudi Arabia', speakers: '400M+' },
    { name: 'Russian', code: 'ru', flag: '🇷🇺', country: 'Russia', speakers: '258M+' },
    { name: 'French', code: 'fr', flag: '🇫🇷', country: 'France', speakers: '280M+' },
    { name: 'German', code: 'de', flag: '🇩🇪', country: 'Germany', speakers: '95M+' },
    { name: 'Japanese', code: 'ja', flag: '🇯🇵', country: 'Japan', speakers: '125M+' },
    { name: 'Korean', code: 'ko', flag: '🇰🇷', country: 'South Korea', speakers: '77M+' },
    { name: 'Indonesian', code: 'id', flag: '🇮🇩', country: 'Indonesia', speakers: '270M+' },
    { name: 'Thai', code: 'th', flag: '🇹🇭', country: 'Thailand', speakers: '69M+' },
    { name: 'Vietnamese', code: 'vi', flag: '🇻🇳', country: 'Vietnam', speakers: '95M+' },
    { name: 'Filipino', code: 'tl', flag: '🇵🇭', country: 'Philippines', speakers: '100M+' },
    { name: 'Bengali', code: 'bn', flag: '🇧🇩', country: 'Bangladesh', speakers: '230M+' },
    { name: 'Turkish', code: 'tr', flag: '🇹🇷', country: 'Turkey', speakers: '80M+' },
    { name: 'Italian', code: 'it', flag: '🇮🇹', country: 'Italy', speakers: '67M+' },
    { name: 'Polish', code: 'pl', flag: '🇵🇱', country: 'Poland', speakers: '40M+' },
    { name: 'Ukrainian', code: 'uk', flag: '🇺🇦', country: 'Ukraine', speakers: '40M+' },
    { name: 'Dutch', code: 'nl', flag: '🇳🇱', country: 'Netherlands', speakers: '24M+' },
    { name: 'Swedish', code: 'sv', flag: '🇸🇪', country: 'Sweden', speakers: '10M+' },
    { name: 'Finnish', code: 'fi', flag: '🇫🇮', country: 'Finland', speakers: '5M+' },
    { name: 'Norwegian', code: 'no', flag: '🇳🇴', country: 'Norway', speakers: '5M+' },
    { name: 'Czech', code: 'cs', flag: '🇨🇿', country: 'Czech Republic', speakers: '10M+' },
    { name: 'Greek', code: 'el', flag: '🇬🇷', country: 'Greece', speakers: '13M+' },
    { name: 'Slovak', code: 'sk', flag: '🇸🇰', country: 'Slovakia', speakers: '5M+' },
    { name: 'Hungarian', code: 'hu', flag: '🇭🇺', country: 'Hungary', speakers: '13M+' },
    { name: 'Romanian', code: 'ro', flag: '🇷🇴', country: 'Romania', speakers: '24M+' },
    { name: 'Serbian', code: 'sr', flag: '🇷🇸', country: 'Serbia', speakers: '12M+' },
    { name: 'Bulgarian', code: 'bg', flag: '🇧🇬', country: 'Bulgaria', speakers: '8M+' },
    { name: 'Hausa', code: 'ha', flag: '🇳🇬', country: 'Nigeria', speakers: '50M+' },
    { name: 'Swahili', code: 'sw', flag: '🇹🇿', country: 'Tanzania', speakers: '100M+' },
    { name: 'Amharic', code: 'am', flag: '🇪🇹', country: 'Ethiopia', speakers: '22M+' },
    { name: 'Pashto', code: 'ps', flag: '🇦🇫', country: 'Afghanistan', speakers: '50M+' },
    { name: 'Sindhi', code: 'sd', flag: '🇵🇰', country: 'Pakistan', speakers: '30M+' },
    { name: 'Nepali', code: 'ne', flag: '🇳🇵', country: 'Nepal', speakers: '16M+' },
    { name: 'Malay', code: 'ms', flag: '🇲🇾', country: 'Malaysia', speakers: '290M+' },
    { name: 'Persian', code: 'fa', flag: '🇮🇷', country: 'Iran', speakers: '110M+' },
    { name: 'Portuguese', code: 'pt', flag: '🇵🇹', country: 'Portugal', speakers: '260M+' },
    { name: 'Hebrew', code: 'he', flag: '🇮🇱', country: 'Israel', speakers: '9M+' },
    { name: 'Urdu', code: 'ur', flag: '🇵🇰', country: 'Pakistan', speakers: '170M+' },
    { name: 'Gujarati', code: 'gu', flag: '🇮🇳', country: 'India', speakers: '55M+' },
    { name: 'Kannada', code: 'kn', flag: '🇮🇳', country: 'India', speakers: '44M+' },
    { name: 'Malayalam', code: 'ml', flag: '🇮🇳', country: 'India', speakers: '38M+' },
    { name: 'Myanmar', code: 'my', flag: '🇲🇲', country: 'Myanmar', speakers: '38M+' },
    { name: 'Telugu', code: 'te', flag: '🇮🇳', country: 'India', speakers: '82M+' },
    { name: 'Marathi', code: 'mr', flag: '🇮🇳', country: 'India', speakers: '83M+' },
    { name: 'Tamil', code: 'ta', flag: '🇮🇳', country: 'India', speakers: '78M+' },
    { name: 'Javanese', code: 'jv', flag: '🇮🇩', country: 'Indonesia', speakers: '84M+' },
    { name: 'Punjabi', code: 'pa', flag: '🇮🇳', country: 'India', speakers: '100M+' }
  ];

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    // Here you would typically send the language preference to the chatbot
    setTimeout(() => {
      window.open('https://flappypisupport8397.pinet.com', '_blank');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
                                        <div>
                            <h1 className="text-2xl font-bold text-black">Flappy Pi Chatbot</h1>
                            <p className="text-black">Choose your preferred language</p>
                            {selectedLanguage && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg">
                                  {languages.find(lang => lang.name === selectedLanguage)?.flag}
                                </span>
                                <span className="text-sm text-black">
                                  {languages.find(lang => lang.name === selectedLanguage)?.country}
                                </span>
                              </div>
                            )}
                          </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Header Information */}
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
                                      <CardTitle className="flex items-center gap-2 text-black">
                          <Globe className="w-5 h-5" />
                          Multi-Language Support
                        </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              <span className="text-black">50+ Languages Supported</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-600" />
                              <span className="text-black">Native Speaker Quality</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-black">Real-time Translation</span>
                            </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Selection */}
          <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-black mb-4">Select Your Language</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.name)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedLanguage === language.name
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{language.flag}</span>
                                                        <div className="text-left">
                                    <div className="font-semibold text-black">{language.name}</div>
                                    <div className="text-xs text-black">{language.country}</div>
                                    <div className="text-xs text-black">{language.speakers} speakers</div>
                                  </div>
                    </div>
                    {selectedLanguage === language.name && (
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <Card className="mb-6">
            <CardHeader>
                                      <CardTitle className="text-lg font-semibold text-black">Chatbot Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-800">✓</Badge>
                                <span className="text-black">Game Tips & Strategies</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-800">✓</Badge>
                                <span className="text-black">Pi Network Integration Help</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-purple-100 text-purple-800">✓</Badge>
                                <span className="text-black">Technical Support</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-yellow-100 text-yellow-800">✓</Badge>
                                <span className="text-black">Reward System Guide</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-pink-100 text-pink-800">✓</Badge>
                                <span className="text-black">Community Features</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-indigo-100 text-indigo-800">✓</Badge>
                                <span className="text-black">Tournament Information</span>
                              </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleLanguageSelect(selectedLanguage)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat in {selectedLanguage}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {/* Footer Note */}
                                <div className="mt-6 text-center text-xs text-black">
                        <p>💡 Tip: You can change your language preference anytime during the chat!</p>
                        <p className="mt-1">🌍 Supporting 50+ languages to serve our global Flappy Pi community</p>
                      </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotLanguageModal; 