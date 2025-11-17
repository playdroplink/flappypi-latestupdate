import '../styles/globals.css';
import React, { useEffect, useState } from 'react';
import WelcomeUserModal from '../components/WelcomeUserModal';

import { WalletProvider } from '../context/WalletContext';
import WalletBalance from '../components/WalletBalance';

function MyApp({ Component, pageProps }: any) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasRead = localStorage.getItem('flappyPiWelcomeRead');
    if (!hasRead) setShowWelcome(true);
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem('flappyPiWelcomeRead', '1');
    setShowWelcome(false);
  };

  return (
    <WalletProvider>
      <WalletBalance />
      <WelcomeUserModal open={showWelcome} onClose={handleCloseWelcome} />
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp;