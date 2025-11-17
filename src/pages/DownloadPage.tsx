import React from 'react';
import ImageWithFallback from '@/components/ImageWithFallback';
import { Button } from '@/components/ui/button';

const DownloadPage: React.FC = () => (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-300 to-blue-400 overflow-hidden">
    {/* Animated clouds layer */}
    <div className="absolute inset-0 pointer-events-none z-0 animate-clouds">
      <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <ellipse cx="200" cy="100" rx="120" ry="40" fill="#fff" opacity="0.7">
          <animate attributeName="cx" values="200;1600" dur="30s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="800" cy="180" rx="180" ry="60" fill="#fff" opacity="0.5">
          <animate attributeName="cx" values="800;-200" dur="40s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="1200" cy="80" rx="100" ry="30" fill="#fff" opacity="0.6">
          <animate attributeName="cx" values="1200;0" dur="35s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    </div>
    <ImageWithFallback src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-32 h-32 mb-6 drop-shadow-xl animate-bounce-slow" lazy={true} />
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-yellow-300 text-center animate-slide-in">Get Pi Browser</h1>
    <p className="text-lg mb-8 text-white/80 font-medium text-center max-w-xl">To access all features of Flappy Pi, including payments and rewards, please open this game in the official Pi Browser.</p>
    <a href="https://minepi.com/Wain2020" target="_blank" rel="noopener noreferrer">
      <Button className="w-full max-w-xs mb-4 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold px-6 py-3 rounded-xl shadow-lg text-lg">Download Pi Network App</Button>
    </a>
    <a href="https://browser.minepi.com" target="_blank" rel="noopener noreferrer">
      <Button className="w-full max-w-xs bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg text-lg">Get Pi Browser</Button>
    </a>
    <p className="text-xs text-white/60 mt-8">© 2025 Flappy Pi</p>
  </div>
);

export default DownloadPage; 