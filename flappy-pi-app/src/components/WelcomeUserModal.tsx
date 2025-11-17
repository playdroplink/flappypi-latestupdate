import React from 'react';

const WelcomeUserModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-yellow-700 hover:text-yellow-900" aria-label="Skip">
          ×
        </button>
        <h2 className="text-3xl font-extrabold text-yellow-700 mb-2">Welcome to Flappy Pi!</h2>
        <p className="text-lg text-yellow-900 mb-4">
          <b>Flappy Pi</b> is a fun, skill-based game where you soar through obstacles, collect coins, unlock rare birds, and compete for high scores—all powered by the Pi Network!
        </p>
        <p className="text-yellow-900 mb-6">Ready to start your adventure? Tap <b>Skip</b> to begin!</p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default WelcomeUserModal; 