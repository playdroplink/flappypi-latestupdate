import React, { useState, useEffect } from 'react';
// Removed dynamic WeatherEffect and random clouds to disable random background weather
import { useGameState } from '../../hooks/useGameState';

// No dynamic clouds or weather visuals

const BackgroundDecoration: React.FC = () => {
  const gameState = useGameState();
  // No random weather effects



  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Static decoration intentionally minimal */}
    </div>
  );
};

export default BackgroundDecoration;
