import { useState, useEffect } from 'react';
import { seasonManager, Season, SEASON_CONFIGS } from '../utils/seasonManager';

export const useSeasonManager = () => {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [seasonProgress, setSeasonProgress] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(0);

  const updateSeason = () => {
    // Check if user has selected a season from profile settings (HOME PAGE ONLY)
    const selectedSeason = localStorage.getItem('flappypi-selected-season') as Season | null;
    
    if (selectedSeason) {
      // Use the user's selected season for home page display ONLY
      // This DOES NOT affect the real season or the game
      setCurrentSeason(selectedSeason);
      setSeasonProgress(0.5); // Mid-way through season
      setTimeUntilNext(12 * 60 * 60 * 1000); // Arbitrary time
      console.log(`🏠 HomePage using selected season: ${selectedSeason}`);
    } else {
      // Fall back to real season rotation (for game and home page when no selection)
      const seasonInfo = seasonManager.getSeasonInfo();
      setCurrentSeason(seasonInfo.current);
      setSeasonProgress(seasonInfo.progress);
      setTimeUntilNext(seasonInfo.timeUntilNext);
      console.log(`🎮 Using real season: ${seasonInfo.current}`);
    }
  };

  useEffect(() => {
    // Initial update
    updateSeason();

    // Update every minute
    const interval = setInterval(updateSeason, 60000);
    
    // Listen for storage changes (when user selects season in profile)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'flappypi-selected-season') {
        updateSeason();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const changeSeason = (season: Season) => {
    // Only update localStorage for HOME PAGE display
    // This does NOT touch the real season in seasonManager
    localStorage.setItem('flappypi-selected-season', season);
    updateSeason();
    console.log(`🏠 HomePage season changed to: ${season} (home page only)`);
  };

  const resetToRealSeason = () => {
    // Remove the selected season from localStorage
    // This returns home page to showing the real season
    localStorage.removeItem('flappypi-selected-season');
    updateSeason();
    console.log(`🏠 HomePage reset to real season`);
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
