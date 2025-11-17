import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new Flappy Pi Blog page
    navigate('/flappy-pi-blog', { replace: true });
  }, [navigate]);

  return (
          <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative z-10 bg-gradient-to-b from-sky-300 via-sky-200 to-blue-200">
      <div className="bg-white/90 shadow-xl p-8 flex flex-col items-center max-w-md">
        <img src="/flappy-logo.png" alt="Flappy Pi Logo" className="w-16 h-16 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold mb-2 text-blue-700 text-center">Redirecting...</h1>
        <p className="text-sm text-blue-600 text-center">Taking you to the Flappy Pi Blog</p>
      </div>
    </div>
  );
};

export default BlogPage; 