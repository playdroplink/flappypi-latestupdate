import React, { useState } from 'react';

const tracks = [
  '/sounds/background/Flappy Pi Main Theme Song.mp3',
  '/sounds/background/Flappy Pi SecondMain Theme Song.mp3',
  '/sounds/background/Flappy Pi_ Soaring Dreams.mp3',
  '/sounds/background/Flappy Pi Adventure Theme – "Rise and Flap!".mp3',
  // Add more tracks as needed
];

const MusicSettings: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [selected, setSelected] = useState(() => localStorage.getItem('flappy-music') || '');

  const handleSelect = (track: string) => {
    setSelected(track);
    localStorage.setItem('flappy-music', track);
    window.dispatchEvent(new CustomEvent('set-flappy-music', { detail: track }));
    onClose();
  };

  const handleRandom = () => {
    localStorage.removeItem('flappy-music');
    window.dispatchEvent(new CustomEvent('set-flappy-music', { detail: tracks[Math.floor(Math.random() * tracks.length)] }));
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl" aria-label="Close">×</button>
        <h2 className="text-xl font-bold mb-4">Select Background Music</h2>
        <ul className="mb-4">
          {tracks.map((track) => (
            <li key={track} className="mb-2">
              <button
                className={`w-full px-4 py-2 rounded ${selected === track ? 'bg-yellow-300 font-bold' : 'bg-gray-100'}`}
                onClick={() => handleSelect(track)}
              >
                {track.split('/').pop()?.replace('.mp3', '')}
              </button>
            </li>
          ))}
        </ul>
        <button className="w-full px-4 py-2 rounded bg-blue-200 font-bold" onClick={handleRandom}>
          Random
        </button>
      </div>
    </div>
  );
};

export default MusicSettings; 