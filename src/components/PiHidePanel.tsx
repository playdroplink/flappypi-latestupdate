import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface PiHidePanelProps {
  className?: string;
}

const PiHidePanel: React.FC<PiHidePanelProps> = ({ className = "" }) => {
  const { isPiAuth, piUser } = useAuth();
  const [isHidden, setIsHidden] = useState(false);
  const [hideResult, setHideResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleToggleHide = async () => {
    if (!isPiAuth || !piUser) {
      setHideResult({ success: false, message: 'Please sign in with Pi Network first' });
      return;
    }

    try {
      // In production, this would call an API to toggle privacy settings
      const newHiddenState = !isHidden;
      setIsHidden(newHiddenState);
      
      setHideResult({ 
        success: true, 
        message: newHiddenState 
          ? 'Your profile is now hidden from public leaderboards' 
          : 'Your profile is now visible on public leaderboards' 
      });
    } catch (error) {
      setHideResult({ success: false, message: error instanceof Error ? error.message : 'Toggle failed' });
    }
  };

  if (!isPiAuth) {
    return (
      <div className={`p-6 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 mb-2">🔐 Authentication Required</h3>
          <p className="text-sm text-gray-700">
            Please sign in with Pi Network to access privacy settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🙈 Privacy Settings</h2>
      
      {/* Privacy Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Hide from Leaderboards</h3>
            <p className="text-sm text-gray-600">
              {isHidden 
                ? 'Your profile is currently hidden from public leaderboards' 
                : 'Your profile is visible on public leaderboards'}
            </p>
          </div>
          <button
            onClick={handleToggleHide}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isHidden ? 'bg-gray-600' : 'bg-green-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isHidden ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Result */}
      {hideResult && (
        <div className={`mb-4 p-3 rounded-lg ${
          hideResult.success
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {hideResult.success ? (
            <p>✅ {hideResult.message}</p>
          ) : (
            <p>❌ {hideResult.message}</p>
          )}
        </div>
      )}

      {/* Privacy Options */}
      <div className="space-y-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">🏆 Leaderboard Visibility</h4>
          <p className="text-sm text-gray-600">
            Control whether your scores appear on public leaderboards
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">👤 Profile Privacy</h4>
          <p className="text-sm text-gray-600">
            Manage who can see your profile information and game statistics
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">📊 Stats Privacy</h4>
          <p className="text-sm text-gray-600">
            Choose which game statistics are visible to other players
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-800">
          Signed in as: <span className="font-medium">{piUser?.username}</span>
        </p>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-600">
        <div>🙈 Hide your scores from public leaderboards</div>
        <div>🔒 Protect your privacy while still enjoying the game</div>
        <div>⚙️ Customize your privacy preferences anytime</div>
      </div>
    </div>
  );
};

export default PiHidePanel;