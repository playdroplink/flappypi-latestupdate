import React from 'react';

interface CoinIconProps {
  className?: string;
}

const CoinIcon: React.FC<CoinIconProps> = ({ className }) => {
  return (
    <img src="/flappycoins.png" alt="Coin" className={className} />
  );
};

export { CoinIcon }; 