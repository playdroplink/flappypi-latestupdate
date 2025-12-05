import { useState, useEffect } from 'react';
import { seasonManager, Season } from '../utils/seasonManager';

export const useSeasonManager = () => {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [seasonProgress, setSeasonProgress] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(0);

  const updateSeason = () => {
    // Check if user has selected a season from profile settings
    const selectedSeason = localStorage.getItem('flappypi-selected-season') as Season | null;
    
    if (selectedSeason) {
      // Use the user's selected season for home page display only
      setCurrentSeason(selectedSeason);
      setSeasonProgress(0.5); // Mid-way through season
      setTimeUntilNext(12 * 60 * 60 * 1000); // Arbitrary time
      console.log(`🌍 Using selected season: ${selectedSeason}`);
    } else {
      // Fall back to real season rotation
      const seasonInfo = seasonManager.getSeasonInfo();
      setCurrentSeason(seasonInfo.current);
      setSeasonProgress(seasonInfo.progress);
      setTimeUntilNext(seasonInfo.timeUntilNext);
      console.log(`🌍 Using real season: ${seasonInfo.current}`);
    }
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
    
    // Listen for storage changes (when user selects season in profile)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'flappypi-selected-season') {
        updateSeason();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('seasonChanged', handleSeasonChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const changeSeason = (season: Season) => {
    // Save to localStorage so home page picks it up
    localStorage.setItem('flappypi-selected-season', season);
    updateSeason();
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('seasonChanged'));
  };

  const resetToRealSeason = () => {
    // Remove the selected season from localStorage
    localStorage.removeItem('flappypi-selected-season');
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
