import React, { useState, useEffect } from 'react';
import PrivacyModal from './PrivacyModal';

const COOKIE_KEY = 'flappypi-cookie-consent';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-300 shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
        <div className="text-gray-800 text-sm flex-1">
          This site uses cookies to enhance gameplay, analyze usage, and improve features. By continuing, you agree to our use of cookies for analytics and game improvement.{' '}
          <button
            className="underline text-blue-700 hover:text-blue-900 font-semibold"
            onClick={() => setShowPrivacy(true)}
            type="button"
          >
            Learn more
          </button>.
        </div>
        <button
          onClick={handleAccept}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-full shadow border border-purple-800 transition-all"
        >
          Accept
        </button>
      </div>
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
};

export default CookieConsent; 