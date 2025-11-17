import React, { useState } from 'react';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useGlobalMusicContext } from '../context/GlobalMusicContext';
import { useEnhancedMusic } from '../hooks/useEnhancedMusic';

const SettingsPage = ({ profile, onSave }) => {
  const [theme, setTheme] = useState(profile?.theme || 'light');
  const [region, setRegion] = useState(profile?.region || 'Global');
  const [privacy, setPrivacy] = useState(profile?.is_private || false);
  const [notifications, setNotifications] = useState(profile?.notifications || true);
  const { t } = useLanguage();
  const { musicEnabled, setMusicEnabled, isPlaying, currentTrack } = useGlobalMusicContext();
  
  // Initialize enhanced music with global setting
  useEnhancedMusic(musicEnabled);

  const handleSave = () => {
    // Call onSave or Supabase sync here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-4 sm:p-6 border border-blue-200">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-700 mb-4 text-center sm:text-left">{t('settings')}</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-sm sm:text-base">{t('theme')}</label>
            <select className="w-full mb-4 p-2 sm:p-3 border rounded text-sm sm:text-base" value={theme} onChange={e => setTheme(e.target.value)}>
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 font-semibold text-sm sm:text-base">{t('language')}</label>
            <LanguageSelector variant="outline" size="md" />
          </div>
          
          <div>
            <label className="block mb-2 font-semibold text-sm sm:text-base">{t('region')}</label>
            <select className="w-full mb-4 p-2 sm:p-3 border rounded text-sm sm:text-base" value={region} onChange={e => setRegion(e.target.value)}>
              <option>Global</option>
              <option>USA</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} className="w-4 h-4" />
            <label className="font-semibold text-sm sm:text-base">{t('privateProfile')}</label>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} className="w-4 h-4" />
            <label className="font-semibold text-sm sm:text-base">{t('enableNotifications')}</label>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <input 
              type="checkbox" 
              checked={musicEnabled} 
              onChange={e => setMusicEnabled(e.target.checked)} 
              className="w-4 h-4" 
            />
            <label className="font-semibold text-sm sm:text-base">
              {t('backgroundMusic') || 'Background Music'}
            </label>
            {isPlaying && currentTrack && (
              <span className="text-xs text-green-600 ml-2">♪ Playing</span>
            )}
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 