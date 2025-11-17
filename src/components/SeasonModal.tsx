import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '../hooks/useTheme';
import { seasonManager, Season, SEASON_CONFIGS } from '../utils/seasonManager';
import { useSeasonManager } from '../hooks/useSeasonManager';

interface SeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SeasonModal: React.FC<SeasonModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  
  // Season management using custom hook
  const { currentSeason, seasonProgress, timeUntilNext, changeSeason, resetToRealSeason } = useSeasonManager();
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [isChangingSeason, setIsChangingSeason] = useState(false);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSeasonError(null);
      setIsChangingSeason(false);
    }
  }, [isOpen]);

  const handleSeasonChange = async (season: Season) => {
    if (isChangingSeason) return;
    try {
      setIsChangingSeason(true);
      setSeasonError(null);
      changeSeason(season);
    } catch (error) {
      setSeasonError(`Failed to change season: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsChangingSeason(false);
    }
  };

  const handleResetSeason = async () => {
    if (isChangingSeason) return;
    try {
      setIsChangingSeason(true);
      setSeasonError(null);
      resetToRealSeason();
    } catch (error) {
      setSeasonError(`Failed to reset season: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsChangingSeason(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl w-full backdrop-blur-md rounded-xl p-6 ${
        isDark ? 'bg-gray-800/95 text-white' : 'bg-white/95 text-gray-900'
      }`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={`text-3xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              🌤️ Seasonal Weather Settings
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`text-2xl hover:bg-gray-200 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ×
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Current Season Display */}
          <div className={`p-4 rounded-xl border-2 ${
            currentSeason === 'spring' ? 'bg-gradient-to-r from-green-100 to-pink-100 border-green-300' :
            currentSeason === 'summer' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300' :
            currentSeason === 'autumn' ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300' :
            currentSeason === 'winter' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300' :
            currentSeason === 'thunder' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300' :
            currentSeason === 'rain' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300' :
            currentSeason === 'fog' ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300' :
            currentSeason === 'storm' ? 'bg-gradient-to-r from-gray-100 to-red-100 border-red-300' :
            currentSeason === 'christmas' ? 'bg-gradient-to-r from-red-100 to-green-100 border-red-300' :
            currentSeason === 'newyear' ? 'bg-gradient-to-r from-yellow-100 to-blue-100 border-yellow-300' :
            currentSeason === 'halloween' ? 'bg-gradient-to-r from-orange-100 to-purple-100 border-orange-300' :
            'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{SEASON_CONFIGS[currentSeason]?.emoji || '🌤️'}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {SEASON_CONFIGS[currentSeason]?.name || 'Unknown Season'}
                  </h3>
                  <p className="text-sm text-gray-600">Current Season</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {Math.floor(timeUntilNext / 3600)}h {Math.floor((timeUntilNext % 3600) / 60)}m
                </div>
                <p className="text-sm text-gray-600">Time Remaining</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${seasonProgress * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {seasonError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center">
              {seasonError}
            </div>
          )}
          
          {/* Loading Indicator */}
          {isChangingSeason && (
            <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 text-center">
              Changing season...
            </div>
          )}

          {/* Season Selection */}
          <div className="space-y-6">
            {/* Basic Seasons */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-700">🌱 Basic Seasons</h4>
              <div className="grid grid-cols-2 gap-3">
                {['spring', 'summer', 'autumn', 'winter'].map((seasonId) => {
                  const season = SEASON_CONFIGS[seasonId as Season];
                  return (
                    <Button
                      key={season.id}
                      variant={currentSeason === season.id ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSeasonChange(season.id)}
                      disabled={isChangingSeason}
                      className={`h-16 text-base font-semibold ${
                        currentSeason === season.id 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl mr-2">{season.emoji}</span>
                      {season.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Weather Seasons */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-700">⛈️ Weather Effects</h4>
              <div className="grid grid-cols-2 gap-3">
                {['thunder', 'rain', 'fog', 'storm'].map((seasonId) => {
                  const season = SEASON_CONFIGS[seasonId as Season];
                  return (
                    <Button
                      key={season.id}
                      variant={currentSeason === season.id ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSeasonChange(season.id)}
                      disabled={isChangingSeason}
                      className={`h-16 text-base font-semibold ${
                        currentSeason === season.id 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl mr-2">{season.emoji}</span>
                      {season.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Holiday Seasons */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-700">🎉 Special Events</h4>
              <div className="grid grid-cols-1 gap-3">
                {['christmas', 'newyear', 'halloween'].map((seasonId) => {
                  const season = SEASON_CONFIGS[seasonId as Season];
                  return (
                    <Button
                      key={season.id}
                      variant={currentSeason === season.id ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSeasonChange(season.id)}
                      disabled={isChangingSeason}
                      className={`h-16 text-base font-semibold ${
                        currentSeason === season.id 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl mr-2">{season.emoji}</span>
                      {season.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="lg"
                onClick={handleResetSeason}
                disabled={isChangingSeason}
                className="w-full h-12 text-base font-semibold"
              >
                🔄 Reset to Real Season
              </Button>
              <div className="text-sm text-gray-500 text-center mt-2">
                Seasons change automatically (24h basic, 12h weather, 48h holidays)
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-4">
              <Button
                variant="default"
                size="lg"
                onClick={onClose}
                className="w-full h-12 text-base font-semibold bg-gray-600 hover:bg-gray-700 text-white"
              >
                ✅ Close Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeasonModal;
