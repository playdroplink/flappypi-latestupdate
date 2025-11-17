import React from 'react';
import { Heart, Crown, Star, Clock, X } from 'lucide-react';

interface ReviveConfirmationModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onDecline: () => void;
  hasUnlimitedRevives: boolean;
  reviveCount: number;
  score: number;
}

const ReviveConfirmationModal: React.FC<ReviveConfirmationModalProps> = ({
  isVisible,
  onConfirm,
  onDecline,
  hasUnlimitedRevives,
  reviveCount,
  score
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 animate-pulse" />
            <h2 className="text-2xl font-bold">💥 Oops! You Crashed!</h2>
          </div>
          
          <p className="text-red-100 text-lg font-medium">
            Score: {score} • Do you want to continue?
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Premium Status */}
          {hasUnlimitedRevives ? (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800 text-lg">Premium Member! 👑</h3>
                  <p className="text-sm text-purple-600">Unlimited revives • No ads</p>
                </div>
              </div>

              <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-purple-700 font-bold mb-1">✨ Instant Revive Available!</div>
                  <div className="text-xs text-purple-600">Continue playing without any interruptions</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-orange-800 text-lg">Free Player</h3>
                  <p className="text-sm text-orange-600">Limited revives • Ads supported</p>
                </div>
              </div>

              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-3">
                <div className="text-center">
                  <div className="text-orange-700 font-medium mb-1">⚠️ Revive #{reviveCount + 1}</div>
                  <div className="text-xs text-orange-600">You have limited revives per game</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-blue-700 font-bold text-sm mb-1">💡 Want Unlimited Revives?</div>
                  <div className="text-xs text-blue-600">Subscribe to Premium for ad-free unlimited revives!</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Continue Button */}
            <button
              onClick={onConfirm}
              className={`w-full py-4 px-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                hasUnlimitedRevives
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              {hasUnlimitedRevives ? '✨ Continue Instantly!' : '🎬 Watch Ad & Continue'}
            </button>

            {/* Decline Button */}
            <button
              onClick={onDecline}
              className="w-full py-4 px-4 rounded-xl font-bold text-lg bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5 inline mr-2" />
              😞 Give Up & See Results
            </button>
          </div>

          {/* Info Message */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-gray-700 font-medium text-sm mb-1">
              {hasUnlimitedRevives 
                ? '🎮 Premium members never see ads and get instant revives!' 
                : '💡 Tip: Premium users get unlimited instant revives with no ads!'
              }
            </div>
            <div className="text-gray-500 text-xs">
              Keep flying • Never give up • Reach new heights!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviveConfirmationModal; 