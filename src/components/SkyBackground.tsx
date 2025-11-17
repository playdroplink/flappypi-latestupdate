import React from 'react';

interface SkyBackgroundProps {
  theme: 'light' | 'night';
  children: React.ReactNode;
}

const SkyBackground: React.FC<SkyBackgroundProps> = ({ theme, children }) => {
  // Static gradient background only; removed random/animated elements for consistency
  const baseClass = 'relative min-h-screen transition-colors duration-500';
  const gradient = theme === 'night'
    ? 'bg-gradient-to-b from-gray-900 via-blue-900 to-black'
    : 'bg-gradient-to-b from-yellow-100 via-blue-100 to-blue-200';
  return (
    <div className={`${baseClass} ${gradient}`}>
      <div className="relative z-10 min-h-screen w-full">{children}</div>
    </div>
  );
};

export default SkyBackground; 