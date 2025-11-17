import React, { useState } from 'react';
import { useGlobalMusic } from '../hooks/useGlobalMusic';

// import EnhancedFooter from '../components/EnhancedFooter';

const AnimatedFlappyLogo = () => (
  <img
    src="/flappy pi gif/flappy-2.gif.gif"
    alt="Flappy Pi Logo"
    className="w-24 h-24 mb-2 drop-shadow-xl animate-bounce"
    style={{ display: 'block', margin: '0 auto' }}
    loading="lazy"
    onError={(e) => {
      console.warn('❌ Flappy Pi GIF failed to load in AnimatedFlappyLogo, using fallback');
      e.currentTarget.src = '/flappy-logo.png';
    }}
  />
);

const flappyTips = [
  "💡 Tip: Tap to flap! Keep tapping to stay airborne.",
  "🎯 Tip: Try to pass through the pipes without hitting them.",
  "🏆 Tip: Collect coins for extra points and rewards!",
  "⚡ Tip: Use power-ups to make the game easier.",
  "🔄 Tip: Practice makes perfect! Keep trying!",
  "🌟 Tip: Complete daily challenges for bonus rewards!",
  "💎 Tip: Save your coins for special items in the shop.",
  "🎮 Tip: Different game modes offer unique challenges!",
  "📱 Tip: Make sure you're using the Pi Browser for the best experience!",
  "🎉 Tip: Join the Pi Network community for more games!"
];

const NotInPiBrowser: React.FC = () => {
  const [npcDialogIndex, setNpcDialogIndex] = useState(0);
  const { isPlaying, currentTrack } = useGlobalMusic();
  
  const handleNpcClick = () => {
    setNpcDialogIndex((prev) => (prev + 1) % flappyTips.length);
  };
  
  const handleDownloadPiBrowser = () => {
    window.open('https://minepi.com/Wain2020', '_blank');
  };
  
  const handleOpenWiki = () => {
    window.open('https://support.help.minepi.com/servicedesk/customer/portal/1/article/33038', '_blank');
  };
  
  const handleContinueToWelcome = () => {
    window.location.href = '/home';
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-200 to-blue-100 justify-between">
      {/* NPC and dialog at the top */}
      <div className="flex flex-col items-center pt-8 pb-2">
        <div className="flex flex-col items-center">
          <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-4 py-2 mb-2 text-gray-800 text-center shadow-md max-w-xs">
            {flappyTips[npcDialogIndex]}
          </div>
          <span className="text-3xl mb-2">🧑‍💻</span>
          <div className="text-xs text-gray-500">Footer NPC</div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-2 pb-32">
        <img 
          src="/flappy pi gif/flappy-2.gif.gif" 
          alt="Flappy Pi Logo" 
          className="w-24 h-24 mb-4"
          onError={(e) => {
            console.warn('❌ Flappy Pi GIF failed to load in not-in-pi-browser, using fallback');
            e.currentTarget.src = '/flappy-logo.png';
          }}
        />
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Oops!</h2>
        <p className="text-lg text-gray-700 mb-4 text-center max-w-xs">
          This app can only be accessed via the Pi Browser.<br/>
          To play Flappy Pi, please open this app in the official Pi Browser.<br/>
          If you don't have Pi Browser, download it below:
        </p>
        <button
          className="w-full max-w-xs bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3 px-6 rounded-xl text-lg mb-4 flex items-center justify-center gap-2 shadow-lg"
          onClick={handleDownloadPiBrowser}
        >
          <img src="/pi-logo.png" alt="Pi" className="w-7 h-7 mr-2" />
          Download Pi Browser
        </button>
        <button
          className="w-full max-w-xs bg-gradient-to-r from-purple-400 to-blue-500 text-white font-bold py-3 px-6 rounded-xl text-lg mb-4 flex items-center justify-center gap-2 shadow-lg"
          onClick={handleOpenWiki}
        >
          Community Wiki
        </button>
        <button
          className="w-full max-w-xs bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-6 rounded-xl text-lg mb-2 flex items-center justify-center gap-2 shadow-lg"
          onClick={handleContinueToWelcome}
        >
          🚀 Continue to Welcome
        </button>
      </div>
    </div>
  );
};

export default NotInPiBrowser;