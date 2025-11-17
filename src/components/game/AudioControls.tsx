import React from 'react';

interface AudioControlsProps {
  musicOn: boolean;
  sfxOn: boolean;
  onToggleMusic: () => void;
  onToggleSFX: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ musicOn, sfxOn, onToggleMusic, onToggleSFX }) => {
  return (
    <div className="absolute top-4 right-4 z-50 flex gap-3">
      <button onClick={onToggleMusic} className="bg-white/80 rounded-full p-2 shadow">
        {musicOn ? '🎵' : '🔇'}
      </button>
      <button onClick={onToggleSFX} className="bg-white/80 rounded-full p-2 shadow">
        {sfxOn ? '🔔' : '🔕'}
      </button>
    </div>
  );
};

export default AudioControls; 