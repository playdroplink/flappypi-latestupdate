import React, { useState, useEffect } from 'react';

interface GameSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  highQuality: boolean;
  language: string;
  theme: 'light' | 'dark' | 'night';
  gameNotifications: boolean;
}

const defaultSettings: GameSettings = {
  musicEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  highQuality: true,
  language: 'en',
  theme: 'light',
  gameNotifications: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('gameSettings');
      const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
      
      // Check if flappyLang exists and sync it with gameSettings
      const flappyLang = localStorage.getItem('flappyLang');
      if (flappyLang && !parsedSettings.language) {
        parsedSettings.language = flappyLang;
        console.log('🔄 Syncing flappyLang with gameSettings:', flappyLang);
      }
      
      return { ...defaultSettings, ...parsedSettings };
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  });

  // Sync updates across all hook instances within the same window and across tabs
  useEffect(() => {
    const handleBroadcast = (event: Event) => {
      try {
        const customEvent = event as CustomEvent<Partial<GameSettings> | GameSettings>;
        const incoming = customEvent.detail as Partial<GameSettings> | GameSettings;
        if (incoming && typeof incoming === 'object') {
          isProcessingBroadcast.current = true;
          setSettings(prev => ({ ...prev, ...incoming }));
          // Reset flag after a short delay to allow the state update to complete
          setTimeout(() => {
            isProcessingBroadcast.current = false;
          }, 100);
        }
      } catch {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'gameSettings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as GameSettings;
          setSettings(parsed);
        } catch {}
      }
    };

    window.addEventListener('flappypi-settings-changed', handleBroadcast as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('flappypi-settings-changed', handleBroadcast as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Track if we're currently processing a broadcast to prevent infinite loops
  const isProcessingBroadcast = React.useRef(false);

  useEffect(() => {
    // Don't broadcast if we're currently processing a broadcast to prevent infinite loops
    if (isProcessingBroadcast.current) {
      return;
    }

    try {
      localStorage.setItem('gameSettings', JSON.stringify(settings));
      
      // Also sync with flappyLang if language changed
      if (settings.language) {
        const currentFlappyLang = localStorage.getItem('flappyLang');
        if (currentFlappyLang !== settings.language) {
          localStorage.setItem('flappyLang', settings.language);
          console.log('🔄 Syncing gameSettings language with flappyLang:', settings.language);
        }
      }

      // Broadcast changes AFTER commit to avoid nested updates during render
      try {
        window.dispatchEvent(new CustomEvent('flappypi-settings-changed', { detail: settings }));
      } catch {}
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]); // Removed settings.language dependency to prevent infinite loop

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // If language is being updated, also update flappyLang
      if (newSettings.language) {
        localStorage.setItem('flappyLang', newSettings.language);
        console.log('🔄 Language updated in both systems:', newSettings.language);
      }
      
      // Persist immediately and broadcast change so other hook instances update
      try {
        localStorage.setItem('gameSettings', JSON.stringify(updated));
      } catch {}

      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    // Also reset flappyLang to default
    localStorage.setItem('flappyLang', 'en');
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
}; 