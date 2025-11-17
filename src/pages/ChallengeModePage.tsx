import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ChallengeModeWrapper from '../components/challenge/ChallengeModeWrapper';
import ChallengeIndexPage from './challenge/ChallengeIndexPage';
import ChatbotLanguageModal from '../components/ChatbotLanguageModal';
import { MessageCircle } from 'lucide-react';

const ChatbotModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">×</button>
        <h2 className="text-2xl font-extrabold text-purple-700 mb-2 text-center">Flappy Pi Chatbot</h2>
        <div className="text-gray-700 text-sm mb-4 text-center">
          I'm your friendly Flappy Pi assistant! Ask me anything about the game, shop, power-ups, subscriptions, rewards, or tips for high scores. I'm here to help you master Flappy Pi!
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-3 overflow-y-auto min-h-[120px]">(Chat UI coming soon...)</div>
        <input className="w-full border rounded-lg px-3 py-2 mb-2" placeholder="Type your question..." disabled />
        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-lg" disabled>Send</button>
      </div>
    </div>
  );
};

const ChallengeModePage: React.FC<{
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}> = ({ musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null as null | any);
  const [started, setStarted] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showChatbotModal, setShowChatbotModal] = useState(false);

  const handleStart = () => {
    setStarted(true);
  };

  const handleBack = () => {
    navigate('/home');
  };

  if (started && selected) {
    // Render the real game with challenge rules
    return (
      <ChallengeModeWrapper
        challenge={selected}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />
    );
  }

  return (
    <>
      <ChallengeIndexPage />
      <button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-lg hover:scale-105 transition"
        onClick={() => setShowChatbotModal(true)}
        aria-label="Open Flappy Pi Chatbot"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
      <ChatbotLanguageModal isOpen={showChatbotModal} onClose={() => setShowChatbotModal(false)} />
    </>
  );
};

export default ChallengeModePage; 