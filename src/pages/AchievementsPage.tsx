import React from 'react';

const AchievementsPage = ({ profile }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 border border-blue-200">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Achievements</h1>
        <div className="mb-4">
          <h2 className="font-semibold text-blue-600 mb-2">Badges & Frames</h2>
          <div className="flex gap-3 flex-wrap">
            <span className="inline-block bg-purple-300 text-purple-900 px-4 py-1 rounded-full font-bold text-xs shadow">Top Scorer</span>
            <span className="inline-block bg-blue-300 text-blue-900 px-4 py-1 rounded-full font-bold text-xs shadow">Verified</span>
            <span className="inline-block bg-green-300 text-green-900 px-4 py-1 rounded-full font-bold text-xs shadow">Community</span>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-blue-600 mb-2">Trails & Customizations</h2>
          <div className="flex gap-3 flex-wrap">
            <span className="inline-block bg-pink-200 text-pink-900 px-4 py-1 rounded-full font-bold text-xs shadow">Rainbow Trail</span>
            <span className="inline-block bg-blue-200 text-blue-900 px-4 py-1 rounded-full font-bold text-xs shadow">Profile Frame</span>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="font-semibold text-blue-600 mb-2">Longest Run</h2>
          <div className="text-blue-900 font-semibold">{profile?.longest_run ?? 0} flaps</div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage; 