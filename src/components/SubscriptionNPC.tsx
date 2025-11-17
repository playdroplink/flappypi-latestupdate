import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import SubscriptionPlansModal from '@/components/SubscriptionPlansModal';

const flappyAdFreeDialog = [
  "Welcome to the skies, ad-free flyer!",
  "You're soaring without ads. Enjoy the view!",
  "Thanks for supporting Flappy Pi. You've unlocked ad-free flight!",
  "No ads, just pure flying fun!",
  "Ad-free means faster flaps and more focus!",
  "You're flapping in peace. No interruptions!",
  "The skies are quieter now… just you and the wind.",
  "Look at you, flying like a VIP!",
  "Ad-free? More like stress-free!",
  "You've got wings and freedom—no ads here!",
  "You earned it—enjoy every flap!",
  "Flying clean. No breaks, no distractions.",
  "Freedom feels good, right?",
  "Flappy Pi loves our ad-free champions!",
  "This is how the pros fly—uninterrupted!",
  "Your support keeps the skies clear!",
  "Who needs ads when you've got skill?",
  "You're now officially in the no-ad elite club!",
  "Premium player detected. Respect.",
  "You're helping shape the future of Flappy Pi!",
  "More time flying, less time waiting.",
  "Flap. Score. Repeat. No ads in between.",
  "You're in focus mode—fly high!",
  "You're boosting the flock with your support!",
  "Less noise, more coins.",
  "Ads? Never heard of them.",
  "Sky's the limit when you fly ad-free!",
  "You're a true Pi supporter—thank you!",
  "Tap faster knowing no ad is coming!",
  "Every flap now counts even more!",
  "No ad interruptions = higher scores!",
  "You've got uninterrupted skies!",
  "You're flapping with flair!",
  "Ad-free means elite bird energy 🕊️",
  "Soar like no one's watching… because no one's selling!",
  "This is the premium pilot experience.",
  "Supporters like you keep Flappy Pi growing!",
  "Enjoy your peaceful journey through the pipes.",
  "One bird. One mission. Zero ads.",
  "You've earned the silent skies.",
  "Ad-free = stress-free gaming.",
  "Take a deep breath—no popups here.",
  "You're a high-flyer in more ways than one!",
  "You've helped fund future features. Thanks!",
  "You're a core part of the flock. 💙",
  "Wanna brag? Show them your ad-free skies.",
  "No commercials, just commitment.",
  "You're flapping with purpose!",
  "Less time watching, more time winning!",
  "You're a pioneer in the ad-free skylands!",
  "No ads. Just you, your wings, and the world ahead."
];

const SubscriptionNPC = () => {
  const { profile } = useUserProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  // Only allow modal on non-login pages
  React.useEffect(() => {
    if (location.pathname === '/login') {
      setOpen(false);
    }
  }, [location.pathname]);

  const handleOpen = () => {
    if (!profile) {
              navigate('/home');
      return;
    }
    setOpen(true);
  };

  const [dialog, setDialog] = useState('');

  useEffect(() => {
    setDialog(flappyAdFreeDialog[Math.floor(Math.random() * flappyAdFreeDialog.length)]);
  }, []);

  const handleDialogClick = () => {
    let newDialog = dialog;
    while (newDialog === dialog && flappyAdFreeDialog.length > 1) {
      newDialog = flappyAdFreeDialog[Math.floor(Math.random() * flappyAdFreeDialog.length)];
    }
    setDialog(newDialog);
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
      onClick={handleDialogClick}
    >
      <img
        src="/flappy pi gif 2/adfree.gif"
        alt="Ad Free NPC"
        className="animate-bounce-slow"
        style={{ width: 120, height: 'auto', marginBottom: 8 }}
      />
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '10px 18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontWeight: 500,
          fontSize: 16,
          color: '#333',
          textAlign: 'center',
          maxWidth: 320,
          marginTop: -8,
          border: '2px solid #fbbf24', // gold border for premium
        }}
      >
        {dialog}
      </div>
      <style>{`
        .animate-bounce-slow {
          animation: bounce 2.2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionNPC; 