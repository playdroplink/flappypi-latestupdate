import React from 'react';

interface CoinProps {
  x: number;
  y: number;
  collected: boolean;
  onCollect: () => void;
}

const Coin: React.FC<CoinProps> = ({ x, y, collected, onCollect }) => {
  return (
    <img
      src="/flappycoins.png"
      alt="Coin"
      className={`absolute z-30 select-none transition-transform duration-300 ${collected ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} drop-shadow-lg animate-pulse`}
      style={{ left: x, top: y, width: 48, height: 48, filter: 'drop-shadow(0 0 8px gold)' }}
      onClick={onCollect}
      onTouchStart={onCollect}
      draggable={false}
    />
  );
};

export default Coin; 