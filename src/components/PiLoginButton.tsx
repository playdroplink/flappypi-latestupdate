// Pi OAuth Login Button Component
// Provides a "Sign in with Pi" button that initiates the OAuth flow

import React from 'react';
import { loginWithPiSDK, loginWithPi } from '../services/piAuth';

interface PiLoginButtonProps {
  className?: string;
  scopes?: string[];
  useSDK?: boolean; // Use Pi SDK's signIn method if available (recommended)
  children?: React.ReactNode;
}

const PiLoginButton: React.FC<PiLoginButtonProps> = ({
  className = '',
  scopes = ['username', 'payments'],
  useSDK = true,
  children = 'Sign in with Pi'
}) => {
  const handleClick = () => {
    try {
      if (useSDK) {
        loginWithPiSDK(scopes);
      } else {
        loginWithPi(scopes);
      }
    } catch (error) {
      console.error('Error initiating Pi login:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        bg-gradient-to-r from-purple-600 to-blue-600 
        hover:from-purple-700 hover:to-blue-700
        text-white font-semibold transition-all duration-200
        shadow-md hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* Pi Network Logo */}
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      {children}
    </button>
  );
};

export default PiLoginButton;
