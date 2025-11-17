import React, { useState } from 'react';
import NPCGuide from '../../../src/components/NPCGuide1';

const npcDialogs = [
  'Welcome! Need any help?',
  'Just chilling here.',
  'Anything I can do for you?',
  'I\'m always here if you need me.',
  'Another day, another flap!',
  'Feeling neutral - not bad, not great.',
  'Let\'s keep it simple today.',
  'No drama, just flying.',
  'Stable skies today.',
  'Do what you do best!',
  'Glad to see you! Ask me anything.',
  'Feeling fantastic! :D',
  'Flapping high on happiness!',
  'You\'re awesome - just saying!',
  'Yay! You\'re back!',
  'Let\'s crush those pipes together!',
  'Happiness is a good score!',
  'I\'m smiling... can\'t you tell?',
  'Today\'s a great day to fly!',
  'Joy levels: 100',
];

function getRandomDialog() {
  return npcDialogs[Math.floor(Math.random() * npcDialogs.length)];
}

interface LoginNPCModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginNPCModal: React.FC<LoginNPCModalProps> = ({ open, onClose }) => {
  const [dialog, setDialog] = useState(getRandomDialog());

  const handleNPCClick = () => {
    setDialog(getRandomDialog());
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-xs sm:max-w-md rounded-lg sm:rounded-2xl shadow-2xl p-4 sm:p-6 text-center relative flex flex-col items-center min-h-[300px] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-3xl w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900" aria-label="Close">×</button>
        <div className="flex flex-col items-center justify-center mb-2 w-full">
          <div className="cursor-pointer" onClick={handleNPCClick}>
            <img src="/npc/nicolas.png.png" alt="NPC" className="w-20 h-20 mx-auto mb-2" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-2">Nicolas says:</h2>
          <div className="bg-blue-100 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-base sm:text-lg font-medium text-blue-900 mb-2">
            {dialog}
          </div>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm mt-2">Tap the NPC for a new tip! Need more help? Ask the NPC or check the FAQ!</p>
      </div>
    </div>
  );
};

export default LoginNPCModal; 