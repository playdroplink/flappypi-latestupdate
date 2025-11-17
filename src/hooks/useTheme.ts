import React, { useState, useEffect } from 'react';
import { useSettings } from './useSettings';

export const useTheme = () => {
  const { settings } = useSettings();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const determineTheme = () => {
      const theme = settings.theme;
      
      if (theme === 'night') {
        // FIXED: Night theme should be treated as dark mode
        setCurrentTheme('dark');
      } else {
        setCurrentTheme(theme as 'light' | 'dark');
      }
    };

    determineTheme();


  }, [settings.theme]);

  // Apply theme to document body for Tailwind dark mode
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  const isDark = currentTheme === 'dark';
  const isLight = currentTheme === 'light';

  // Enhanced theme utilities for specific components
  const getThemeStyles = {
    // NPC Dialog styles
    npcDialog: {
      background: isDark ? '#1f2937' : '#fff',
      color: isDark ? '#ffffff' : '#333',
      border: '2px solid #fbbf24',
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
    },
    
    // NPC Name styles
    npcName: {
      color: isDark ? '#e5e7eb' : '#888',
    },
    
    // NPC Subtitle styles
    npcSubtitle: {
      color: isDark ? '#d1d5db' : '#aaa',
    },
    
    // Card styles
    card: {
      background: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      border: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
      color: isDark ? '#ffffff' : '#1f2937',
    },
    
    // Button styles
    button: {
      background: isDark ? '#374151' : '#f3f4f6',
      color: isDark ? '#ffffff' : '#1f2937',
      border: isDark ? '#4b5563' : '#d1d5db',
    },
    
    // Input styles
    input: {
      background: isDark ? '#374151' : '#ffffff',
      color: isDark ? '#ffffff' : '#1f2937',
      border: isDark ? '#4b5563' : '#d1d5db',
    },
    
    // Text styles
    text: {
      primary: isDark ? '#ffffff' : '#1f2937',
      secondary: isDark ? '#e5e7eb' : '#6b7280',
      muted: isDark ? '#9ca3af' : '#9ca3af',
    },
    
    // Background styles
    background: {
      primary: isDark ? '#111827' : '#ffffff',
      secondary: isDark ? '#1f2937' : '#f9fafb',
      accent: isDark ? '#374151' : '#f3f4f6',
    },
  };

  return {
    theme: currentTheme,
    isDark,
    isLight,
    // FIXED: Add helper to check if night theme is active
    isNight: settings.theme === 'night',
    // Enhanced theme-aware styling utilities
    getFooterBg: () => isDark ? 'bg-gray-900' : 'bg-white',
    getFooterText: () => isDark ? 'text-gray-100' : 'text-gray-800',
    getFooterBorder: () => isDark ? 'border-gray-700' : 'border-gray-200',
    getButtonBg: () => isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200',
    getButtonText: () => isDark ? 'text-gray-100' : 'text-gray-800',
    // New enhanced theme styles
    getThemeStyles,
  };
}; 