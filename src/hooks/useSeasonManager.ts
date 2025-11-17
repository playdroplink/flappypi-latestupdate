import { useState, useEffect } from 'react';
import { seasonManager, Season } from '../utils/seasonManager';

export const useSeasonManager = () => {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [seasonProgress, setSeasonProgress] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(0);

  const updateSeason = () => {
    const seasonInfo = seasonManager.getSeasonInfo();
    setCurrentSeason(seasonInfo.current);
    setSeasonProgress(seasonInfo.progress);
    setTimeUntilNext(seasonInfo.timeUntilNext);
  };

  useEffect(() => {
    // Initial update
    updateSeason();

    // Update every minute
    const interval = setInterval(updateSeason, 60000);
    
    // Listen for season changes from settings modal
    const handleSeasonChange = () => {
      updateSeason();
    };
    
    // Listen for custom season change events
    window.addEventListener('seasonChanged', handleSeasonChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('seasonChanged', handleSeasonChange);
    };
  }, []);

  const changeSeason = (season: Season) => {
    seasonManager.forceSetSeason(season);
    updateSeason();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('seasonChanged'));
  };

  const resetToRealSeason = () => {
    seasonManager.resetToRealSeason();
    updateSeason();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('seasonChanged'));
  };

  return {
    currentSeason,
    seasonProgress,
    timeUntilNext,
    changeSeason,
    resetToRealSeason,
    updateSeason
  };
};
