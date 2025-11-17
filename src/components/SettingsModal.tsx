import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserProfile } from '@/types/gameTypes';
import NotificationToggle from './game/NotificationToggle';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import SeasonModal from './SeasonModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  musicEnabled: boolean;
  onMusicToggle: (enabled: boolean) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  theme: 'light' | 'night';
  onThemeChange: (theme: 'light' | 'night') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, soundEnabled, onSoundToggle, musicEnabled, onMusicToggle, theme, onThemeChange
}) => {
  const { profile: userProfile } = useUserProfile();
  const { t } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const { isDark } = useTheme();
  
  // Season modal state
  const [showSeasonModal, setShowSeasonModal] = useState(false);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md w-full backdrop-blur-md rounded-xl p-6 ${
        isDark ? 'bg-gray-800/95 text-white' : 'bg-white/95 text-gray-900'
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{t('settingsTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('sound')}</span>
            <button
              className={`px-4 py-2 rounded-lg font-bold ${soundEnabled ? 'bg-blue-500 text-white' : (isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
              onClick={() => onSoundToggle(!soundEnabled)}
            >
              {soundEnabled ? t('on') : t('off')}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{t('music')}</span>
            <button
              className={`px-4 py-2 rounded-lg font-bold ${musicEnabled ? 'bg-purple-500 text-white' : (isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
              onClick={() => onMusicToggle(!musicEnabled)}
            >
              {musicEnabled ? t('on') : t('off')}
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{t('theme')}</label>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg font-bold border ${
                  theme === 'light' 
                    ? 'bg-yellow-200 border-yellow-400 text-blue-900' 
                    : (isDark ? 'bg-gray-700 border-gray-500 text-gray-300' : 'bg-white border-gray-300 text-gray-700')
                }`}
                onClick={() => onThemeChange('light')}
              >
                {t('light')}
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-bold border ${
                  theme === 'night' 
                    ? 'bg-blue-900 border-blue-700 text-white' 
                    : (isDark ? 'bg-gray-700 border-gray-500 text-gray-300' : 'bg-white border-gray-300 text-gray-700')
                }`}
                onClick={() => onThemeChange('night')}
              >
                {t('night')}
              </button>

            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{t('language')}</label>
            <LanguageSelector variant="outline" size="md" />
          </div>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Game Notifications</span>
            <NotificationToggle
              position="static"
              size="small"
              showLabel={false}
              onToggle={(enabled) => {
                updateSettings({ gameNotifications: enabled });
              }}
              storageKey="gameNotifications"
              initialValue={settings.gameNotifications}
            />
          </div>
          
          {/* Season Settings Button */}
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>Seasonal Weather</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSeasonModal(true)}
                className="text-xs"
              >
                🌤️ Open Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Season Modal */}
    <SeasonModal 
      isOpen={showSeasonModal} 
      onClose={() => setShowSeasonModal(false)} 
    />
    </>
  );
};

export default SettingsModal; 