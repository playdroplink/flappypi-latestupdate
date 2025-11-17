import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useGameSettings = () => {
  const [selectedBirdSkin, setSelectedBirdSkin] = useState('default');
  const [musicEnabled, setMusicEnabled] = useState(true);
  const { profile, updateProfile } = useUserProfile();

  useEffect(() => {
    // Load saved data from localStorage (fallback)
    const savedSkin = localStorage.getItem('flappypi-skin');
    const savedMusic = localStorage.getItem('flappypi-music');
    
    if (savedSkin) setSelectedBirdSkin(savedSkin);
    if (savedMusic) setMusicEnabled(savedMusic === 'true');
  }, []);

  // Sync with user profile when available
  useEffect(() => {
    if (profile && profile.selected_bird_skin && typeof profile.music_enabled !== 'undefined') {
      setSelectedBirdSkin(profile.selected_bird_skin || 'default');
      setMusicEnabled(profile.music_enabled !== false); // Default to true if undefined
      
      // Update localStorage to match profile - with safety checks
      if (profile.selected_bird_skin) {
        localStorage.setItem('flappypi-skin', profile.selected_bird_skin);
      }
      if (typeof profile.music_enabled === 'boolean') {
        localStorage.setItem('flappypi-music', profile.music_enabled.toString());
      }
    }
  }, [profile]);

  // Update bird skin and sync with backend
  const updateBirdSkin = async (skin: string) => {
    if (!skin) return; // Safety check
    
    setSelectedBirdSkin(skin);
    localStorage.setItem('flappypi-skin', skin);
    
    // Update in backend if profile exists
    if (profile && updateProfile) {
      try {
        await updateProfile({ selected_bird_skin: skin });
      } catch (error) {
        console.error('Failed to update bird skin in profile:', error);
      }
    }
  };

  // Update music setting and sync with backend
  const updateMusicEnabled = async (enabled: boolean) => {
    if (typeof enabled !== 'boolean') return; // Safety check
    
    setMusicEnabled(enabled);
    localStorage.setItem('flappypi-music', enabled.toString());
    
    // Update in backend if profile exists
    if (profile && updateProfile) {
      try {
        await updateProfile({ music_enabled: enabled });
      } catch (error) {
        console.error('Failed to update music setting in profile:', error);
      }
    }
  };

  return {
    selectedBirdSkin: selectedBirdSkin || 'default',
    musicEnabled: musicEnabled !== false, // Ensure boolean
    setSelectedBirdSkin: updateBirdSkin,
    setMusicEnabled: updateMusicEnabled
  };
};
