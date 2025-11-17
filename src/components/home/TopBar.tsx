import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const pages = [
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Shop', path: '/shop' },
  { label: 'Settings', path: '/settings' },
  { label: 'Wiki', path: '/wiki' },
  { label: 'About', path: '/about' },
  { label: 'Terms', path: '/terms' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Whitepaper', path: '/whitepaper' },
  { label: 'Subscription', path: '/subscription' },
];

interface TopBarProps {
  hideNavigation?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ hideNavigation = false }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 w-full z-50 flex flex-col bg-white/80 shadow-md">
      <div className="flex items-center gap-6 px-8 py-3">
        <img src="/flappy-logo.png" alt="Home" className="w-10 h-10 cursor-pointer" onClick={() => navigate('/home')} />
        <span className="text-2xl font-black text-blue-700 tracking-wide cursor-pointer" onClick={() => navigate('/home')}>Flappy Pi</span>
        {!hideNavigation && (
          <button
            onClick={() => navigate('/play')}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg border-2 border-yellow-600 transition-all duration-200 text-lg"
          >
            Play Now
          </button>
        )}
      </div>
      {!hideNavigation && (
        <div className="w-full overflow-x-auto flex flex-nowrap gap-4 px-4 pb-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
          {pages.map((page) => (
            <button key={page.label} onClick={() => navigate(page.path)} className="flex-shrink-0 text-base sm:text-lg font-black text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full shadow-md border-2 border-blue-500 transition-all whitespace-nowrap">
              {page.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopBar; 