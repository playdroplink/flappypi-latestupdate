import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, supportedLanguages, LanguageCode, TranslationKey } from '../constants/translations';
import { detectUserLanguage, getUserCountry } from '../utils/countryLanguageMapping';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  supportedLanguages: typeof supportedLanguages;
  userCountry: string;
  detectedLanguage: string;
  refreshTrigger: number; // Add refresh trigger
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [userCountry, setUserCountry] = useState<string>('US');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // Add refresh trigger state

  // Function to sync language with both localStorage systems
  const syncLanguageWithGameSettings = (language: LanguageCode) => {
    try {
      // Update flappyLang
      localStorage.setItem('flappyLang', language);
      
      // Update gameSettings
      const savedGameSettings = localStorage.getItem('gameSettings');
      let gameSettings = savedGameSettings ? JSON.parse(savedGameSettings) : {};
      gameSettings.language = language;
      localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
      
      console.log('🔄 Language synchronized:', {
        flappyLang: localStorage.getItem('flappyLang'),
        gameSettings: JSON.parse(localStorage.getItem('gameSettings') || '{}')
      });
    } catch (error) {
      console.error('Error syncing language settings:', error);
    }
  };

  useEffect(() => {
    try {
      // Detect user's country and language
      const country = getUserCountry();
      const detectedLang = detectUserLanguage();
      
      // Safely get country name with error handling
      let countryName = country;
      try {
        countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(country) || country;
      } catch (error) {
        console.warn('Could not get country name for:', country, error);
        countryName = country;
      }
      
      setUserCountry(country);
      setDetectedLanguage(detectedLang);
      
      // Check both localStorage systems for saved language
      const savedLanguage = localStorage.getItem('flappyLang') as LanguageCode;
      const savedGameSettings = localStorage.getItem('gameSettings');
      let gameSettingsLanguage: LanguageCode | null = null;
      
      if (savedGameSettings) {
        try {
          const parsed = JSON.parse(savedGameSettings);
          gameSettingsLanguage = parsed.language;
        } catch (error) {
          console.warn('Error parsing gameSettings:', error);
        }
      }
      
      // Priority: flappyLang > gameSettings.language > detected language > English
      let languageToUse: LanguageCode = 'en';
      
      if (savedLanguage && translations[savedLanguage]) {
        languageToUse = savedLanguage;
      } else if (gameSettingsLanguage && translations[gameSettingsLanguage]) {
        languageToUse = gameSettingsLanguage;
        // Sync flappyLang with gameSettings
        localStorage.setItem('flappyLang', gameSettingsLanguage);
      } else if (translations[detectedLang as LanguageCode]) {
        languageToUse = detectedLang as LanguageCode;
        // Sync both systems with detected language
        syncLanguageWithGameSettings(languageToUse);
      } else {
        syncLanguageWithGameSettings('en');
      }
      
      setCurrentLanguage(languageToUse);
    } catch (error) {
      console.error('Error in language detection:', error);
      // Fallback to English if detection fails
      setCurrentLanguage('en');
      setUserCountry('US');
      setDetectedLanguage('en');
      syncLanguageWithGameSettings('en');
    }
  }, []);

  const setLanguage = (language: LanguageCode) => {
    // Check if the language exists in translations
    if (!translations[language]) {
      console.error('❌ LanguageContext: Language not found in translations:', language);
      return;
    }
    
    setCurrentLanguage(language);
    syncLanguageWithGameSettings(language);
    
    // Force a refresh by incrementing the trigger to notify all components
    setRefreshTrigger(prev => prev + 1);
  };

  const t = (key: TranslationKey): string => {
    const currentTranslations = translations[currentLanguage];
    const fallbackTranslations = translations.en;
    
    // Return translation for current language, fallback to English
    return currentTranslations[key] || fallbackTranslations[key] || key;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    supportedLanguages,
    userCountry,
    detectedLanguage,
    refreshTrigger
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 