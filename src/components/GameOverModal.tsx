import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trophy, RotateCcw, Home, Share2, Play, Heart, Star, Crown, Coins, Zap, Download } from 'lucide-react';
import { adService } from '../services/adService';
import { useUserProfile } from '../hooks/useUserProfile';
import { useGameState } from '../hooks/useGameState';
import ShareScoreModal from './ShareScoreModal';
import ConfirmShareModal from './ConfirmShareModal';
import { useRewardedAdCooldown } from '../hooks/useRewardedAdCooldown';
import { piBrowserRedirect } from '@/utils/piBrowserRedirect';
import { useGlobalMusic } from '../hooks/useGlobalMusic';
import { getDisplayUsername } from '../utils/usernameUtils';
import { useSound } from '../context/SoundContext';
import { getBirdImageSrc } from '@/utils/getBirdImageSrc';
import { useAuth } from '../context/AuthContext';
import { leaderboardService } from '../services/leaderboardServiceNew';

interface GameOverModalProps {
  isVisible: boolean;
  score: number;
  highScore: number;
  coins: number;
  level: number;
  gameMode: 'classic' | 'endless' | 'challenge';
  isNewHighScore: boolean;
  canRevive: boolean;
  onRestart: () => void;
  onRevive?: () => void;
  onBackToMenu: () => void;
  onShare: () => void;
  onOpenShop?: () => void;
  onOpenSubscription?: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isVisible,
  score,
  highScore,
  coins,
  level,
  gameMode,
  isNewHighScore,
  canRevive,
  onRestart,
  onRevive,
  onBackToMenu,
  onShare,
  onOpenShop,
  onOpenSubscription
}) => {
  const [isReviving, setIsReviving] = useState(false);
  const [showAdLoading, setShowAdLoading] = useState(false);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);
  const [isNewBestGlobal, setIsNewBestGlobal] = useState(false);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  
  // Ensure background music continues playing when modal is shown
  useGlobalMusic();
  
  const { user, isAuthenticated } = useAuth();
  const [adNetworkReady, setAdNetworkReady] = useState(false);
  const [showSubscriptionOffer, setShowSubscriptionOffer] = useState(false);
  const [reviveAttempts, setReviveAttempts] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [showMandatoryAd, setShowMandatoryAd] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { profile, hasActiveSubscription } = useUserProfile();
  const { /* remove username, birdSkin */ } = useGameState();
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const adCooldown = useRewardedAdCooldown();
  const { playGameSound } = useSound();

  // Earned coins from this game
  const earnedCoins = Math.floor(score / 3) + level * 2 + (isNewHighScore ? 10 : 0);
  // Progressive revive cost: starts at 10, adds 10 for each revive
  const baseReviveCost = 10;
  const progressiveReviveCost = baseReviveCost + (reviveAttempts * 10); // Cost to revive without ads

  useEffect(() => {
    if (isVisible) {
      // Play game over sound when modal becomes visible
      playGameSound('die');
      
      // Submit score to leaderboard if user is authenticated
      const submitScoreToLeaderboard = async () => {
        if (isAuthenticated && user?.pi?.uid && !leaderboardSubmitted) {
          try {
            console.log('📊 Submitting score to leaderboard...', {
              userId: user.pi.uid,
              score,
              gameMode
            });
            
            // Convert game mode to match backend schema
            const normalizedGameMode = gameMode === 'endless' ? 'classic' : 
                                     gameMode === 'challenge' ? 'screampi' : 
                                     gameMode as 'classic' | 'screampi' | 'dinopi';
            
            const result = await leaderboardService.handleGameOver(
              user.pi.uid,
              score,
              normalizedGameMode,
              0, // session duration - could be tracked if needed
              user.pi.accessToken
            );
            
            if (result.submitted) {
              setLeaderboardSubmitted(true);
              setIsNewBestGlobal(result.newBest);
              setGlobalRank(result.rank || null);
              
              console.log('✅ Score submitted to leaderboard:', {
                newBest: result.newBest,
                rank: result.rank,
                achievements: result.achievements?.length || 0
              });
            } else {
              console.warn('⚠️ Score submission failed:', result.error);
            }
          } catch (error) {
            console.error('❌ Leaderboard submission error:', error);
          }
        }
      };
      
      submitScoreToLeaderboard();
      
      // Check Pi Ad Network support asynchronously
      const checkAdNetwork = async () => {
        try {
          const isSupported = await adService.isAdNetworkSupported();
          setAdNetworkReady(isSupported);
        } catch (error) {
          console.warn('⚠️ Error checking ad network support:', error);
          setAdNetworkReady(false);
        }
      };
      
      checkAdNetwork();
      
      // Track play count for mandatory ads
      const currentPlayCount = parseInt(localStorage.getItem('flappypi_play_count') || '0') + 1;
      setPlayCount(currentPlayCount);
      localStorage.setItem('flappypi_play_count', currentPlayCount.toString());
      
      // Show mandatory ad every 3 games for non-premium users
      if (!hasActiveSubscription && currentPlayCount % 3 === 0) {
        setShowMandatoryAd(true);
      }
      
      // Show subscription offer for high scores (classic mode focus)
      if (gameMode === 'classic' && score >= 20 && !hasActiveSubscription) {
        setShowSubscriptionOffer(true);
      }
      
      // Reset revive attempts
      setReviveAttempts(0);
    } else {
      // Reset leaderboard state when modal closes
      setLeaderboardSubmitted(false);
      setIsNewBestGlobal(false);
      setGlobalRank(null);
    }
  }, [isVisible, gameMode, score, hasActiveSubscription, isAuthenticated, user, leaderboardSubmitted]);

  const handleReviveWithAd = useCallback(async () => {
    if (isReviving) return;
    
    setIsReviving(true);
    setShowAdLoading(true);
    
    try {
      console.log('🎥 Attempting to show rewarded ad for revive...');
      
      // Use the proper ad service method with reward type and game mode
      const result = await adService.showRewardedAdForReward('revive', gameMode);
      setShowAdLoading(false);
      setIsReviving(false);
      
      if (result.success && result.shown) {
        console.log('✅ Rewarded ad completed successfully');
        if (onRevive) {
          onRevive(); // Call revive function
        }
      } else if (result.success && !result.shown) {
        // Ad was skipped (subscriber or settings)
        console.log('👑 Ad skipped for subscriber');
        if (onRevive) {
          onRevive(); // Call revive function
        }
      } else {
        console.log('❌ Rewarded ad failed:', result.description);
        setReviveAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error('❌ Error showing rewarded ad:', error);
      setShowAdLoading(false);
      setIsReviving(false);
      setReviveAttempts(prev => prev + 1);
    }
  }, [isReviving, onRevive, gameMode]);

  const handleReviveWithCoins = useCallback(() => {
    if (profile && profile.total_coins >= progressiveReviveCost && onRevive) {
      console.log(`💰 Reviving with ${progressiveReviveCost} coins`);
      onRevive(); // Call revive function
    }
  }, [profile, progressiveReviveCost, onRevive]);

  const handlePlayAgain = useCallback(async () => {
    // Show mandatory ad modal first if needed
    if (showMandatoryAd && !hasActiveSubscription) {
      return; // Don't restart yet, user needs to handle mandatory ad
    }
    
    // Show interstitial ad before restarting (if user doesn't have subscription)
    if (!hasActiveSubscription && Math.random() < 0.6) {
      setShowAdLoading(true);
      try {
        const result = await adService.showInterstitialAd();
        console.log('Interstitial ad result:', result);
      } catch (error) {
        console.log('Interstitial ad failed:', error);
      }
      setShowAdLoading(false);
    }
    
    onRestart();
  }, [hasActiveSubscription, onRestart, showMandatoryAd]);

  const handleMandatoryAd = useCallback(async () => {
    setShowAdLoading(true);
    try {
      const result = await adService.showInterstitialAd();
      console.log('✅ Mandatory ad result:', result);
    } catch (error) {
      console.log('❌ Mandatory ad failed:', error);
    }
    setShowAdLoading(false);
    setShowMandatoryAd(false);
    onRestart(); // Restart the game after the ad is shown
  }, [onRestart]);

  const handleShare = () => {
    console.log('[DEBUG] Share button clicked.');
    setConfirmModalOpen(true);
  };

  const handleConfirmShare = () => {
    console.log('[DEBUG] Confirmed share. Opening ShareScoreModal.');
    setConfirmModalOpen(false);
    setShareModalOpen(true);
  };

  const handleCancelShare = () => {
    setConfirmModalOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}
      >
        <Card className="w-full max-w-md bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl transform scale-100 animate-in duration-300">
          <CardContent className="p-6 text-center">
            {/* Mandatory Ad Modal */}
            {showMandatoryAd && (
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Support Flappy Pi Development!</span>
                </div>
                <p className="text-sm mb-3">
                  This ad helps us keep Flappy Pi free and improve the game for everyone.
                </p>
                <Button 
                  onClick={handleMandatoryAd}
                  disabled={showAdLoading}
                  className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold"
                  size="sm"
                >
                  {showAdLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading Ad...
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Watch Ad (Required)
                    </>
                  )}
                </Button>
                <p className="text-xs mt-2 opacity-80">Game #{playCount} • Ad required every 3 games</p>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent mb-3">
                Game Over!
              </h2>
              {isNewHighScore && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  🏆 NEW HIGH SCORE! 🏆
                </div>
              )}
              {gameMode === 'classic' && (
                <div className="mt-2 text-sm text-gray-600 font-medium">
                  Classic Mode • Level {level}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Final Score:</span>
                <span className="font-bold text-2xl text-blue-600">{score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Level Reached:</span>
                <span className="font-bold text-lg text-purple-600">{level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">High Score:</span>
                <span className="font-bold text-lg text-yellow-600">{highScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Earned Coins:</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-lg">🪙</span>
                  <span className="font-bold text-lg text-green-600">+{earnedCoins}</span>
                </div>
              </div>
            </div>

            {/* Leaderboard Achievements */}
            {leaderboardSubmitted && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-800">Leaderboard Updated!</span>
                </div>
                {isNewBestGlobal && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-lg text-sm font-bold mb-2 animate-pulse">
                    🌟 NEW PERSONAL BEST! 🌟
                  </div>
                )}
                {globalRank && (
                  <div className="text-sm text-green-700">
                    Global Rank: <span className="font-bold">#{globalRank}</span>
                  </div>
                )}
                <div className="text-xs text-green-600 mt-1">
                  Score submitted to global leaderboard
                </div>
              </div>
            )}

            {/* Enhanced Share Button */}
            <div className="mb-6">
              <Button 
                onClick={handleShare}
                disabled={isSharing}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-200 mb-4"
              >
                {isSharing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sharing...
                  </div>
                ) : (
                  <>
                    <Share2 className="w-5 h-5 mr-2" />
                    <span className="share-button-text">Share My Score</span>
                  </>
                )}
              </Button>
            </div>

            {/* Subscription Offer for Classic Mode */}
            {showSubscriptionOffer && gameMode === 'classic' && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold">Premium Upgrade Available!</span>
                </div>
                <p className="text-sm mb-3">🚀 No Ads • Bonus Coins • Exclusive Features • Support Development!</p>
                <Button 
                  onClick={() => onOpenSubscription && onOpenSubscription()}
                  className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold"
                  size="sm"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Get Premium Now
                </Button>
              </div>
            )}

            {/* Enhanced Revive Section */}
            {canRevive && !showMandatoryAd && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <h3 className="font-bold text-green-800 mb-3 flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Continue Playing?
                </h3>
                <div className="space-y-3">
                  {/* Watch Ad to Revive */}
                  <Button
                    onClick={piBrowserRedirect.isInPiBrowser() ? handleReviveWithAd : () => piBrowserRedirect.showPiBrowserMessage()}
                    disabled={isReviving || adCooldown > 0 || !piBrowserRedirect.isInPiBrowser()}
                    className={`w-full font-bold ${
                      piBrowserRedirect.isInPiBrowser() 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white' 
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {!piBrowserRedirect.isInPiBrowser() 
                      ? '🌐 Pi Browser Required' 
                      : adCooldown > 0 
                        ? `Ad available in 0:${adCooldown.toString().padStart(2, '0')}` 
                        : '▶️ Watch Pi Ad to Revive'
                    }
                  </Button>
                  
                  {/* Pi Browser Download Link */}
                  {!piBrowserRedirect.isInPiBrowser() && (
                    <div className="mt-3">
                      <Button
                        onClick={() => piBrowserRedirect.redirectToPiBrowser()}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
                      >
                        📱 Download Pi Browser
                      </Button>
                      <div className="mt-2 text-center">
                        <p className="text-orange-600 text-xs font-semibold">
                          💡 Download Pi Browser to watch ads and earn rewards!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pay Coins to Revive */}
                  <Button
                    onClick={handleReviveWithCoins}
                    disabled={!profile || profile.total_coins < progressiveReviveCost}
                    variant="outline"
                    className="w-full border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-bold"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Pay {progressiveReviveCost} Coins to Revive
                    {profile && (
                      <span className="ml-2 text-xs">
                        ({profile.total_coins} available)
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Enhanced Sharing Section */}
            <div className="flex gap-3">
              <button
                onClick={handlePlayAgain}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-bold 
                         transform transition-all duration-200 hover:scale-105 active:scale-95
                         flex items-center justify-center gap-2 min-h-[50px]"
              >
                <span className="text-lg">🔄</span>
                <span>Play Again</span>
              </button>
            </div>

            {/* Additional Options */}
            <div className="flex gap-3">
              <button
                onClick={() => onOpenSubscription && onOpenSubscription()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
                         text-white py-3 px-4 rounded-lg font-bold transform transition-all duration-200 
                         hover:scale-105 active:scale-95 flex items-center justify-center gap-2 min-h-[50px]"
              >
                <span className="text-lg">👑</span>
                <span>Get Premium</span>
              </button>
              
              <button
                onClick={() => onOpenShop && onOpenShop()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-bold 
                         transform transition-all duration-200 hover:scale-105 active:scale-95
                         flex items-center justify-center gap-2 min-h-[50px]"
              >
                <span className="text-lg">🛒</span>
                <span>Shop</span>
              </button>
            </div>

            {/* Back to Menu */}
            <button
              onClick={onBackToMenu}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-bold 
                       transform transition-all duration-200 hover:scale-105 active:scale-95
                       flex items-center justify-center gap-2 min-h-[50px]"
            >
              <span className="text-lg">🏠</span>
              <span>Back to Menu</span>
            </button>

            {/* Game Count Info */}
            <div className="mt-4 text-xs text-gray-500">
              Game #{playCount} {!hasActiveSubscription && `• Next ad in ${3 - (playCount % 3)} games`}
            </div>

            {/* User's Level */}
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-blue-600">Level {level}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Render the ConfirmShareModal */}
      <ConfirmShareModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmShare}
        onCancel={handleCancelShare}
      />

      {/* Render the ShareScoreModal */}
      <ShareScoreModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        score={score}
        level={level}
        coins={coins}
        bestScore={highScore}
        username={getDisplayUsername()}
        birdSkinUrl={getBirdImageSrc(profile?.selected_bird_skin || 'bird-0')}
        gameMode={gameMode}
      />
    </>
  );
};

export default GameOverModal; 