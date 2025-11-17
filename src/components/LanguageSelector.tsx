import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';
import { getCountryName } from '../utils/countryLanguageMapping';

interface LanguageSelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'default'
}) => {
  const { currentLanguage, setLanguage, supportedLanguages, userCountry, detectedLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  };

  const variantClasses = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white',
    outline: 'bg-white/90 backdrop-blur-md border border-gray-300/50 hover:bg-white text-gray-800 dark:bg-gray-900/90 dark:border-gray-600/50 dark:hover:bg-gray-800 dark:text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-800 dark:text-white dark:hover:bg-gray-800/20'
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debug: Monitor currentLanguage changes
  useEffect(() => {
    console.log('🔄 LanguageSelector: currentLanguage changed to:', currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = (code: string) => {
    try {
      setLanguage(code);
      setOpen(false);
    } catch (error) {
      console.error('❌ LanguageSelector: Error changing language:', error);
    }
  };

  const selected = supportedLanguages.find(l => l.code === currentLanguage);
  const countryName = getCountryName(userCountry || 'US');
  const isAutoDetected = currentLanguage === detectedLanguage;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className={`flex items-center justify-between w-full ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>{selected?.name || '🇺🇸 English'}</span>
                     {isAutoDetected && (
             <span className="text-xs bg-green-100 text-green-800 dark:bg-green-600/30 dark:text-green-300 px-1.5 py-0.5 rounded-full">
               Auto
             </span>
           )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-md border border-gray-200/50 dark:bg-gray-900/95 dark:border-gray-700/50 rounded-lg shadow-2xl max-h-60 overflow-y-auto" role="listbox">
          {/* Country Detection Info */}
          <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-200/50 dark:bg-gray-800/50 dark:border-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3 h-3" />
              <span>Detected: {countryName} ({userCountry || 'US'})</span>
            </div>
            <div className="text-xs">
              Auto-detected language: {supportedLanguages.find(l => l.code === (detectedLanguage || 'en'))?.name || (detectedLanguage || 'en')}
            </div>
          </div>
          
          {/* Language Options */}
          <ul>
            {supportedLanguages.map(lang => (
              <li
                key={lang.code}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-colors ${lang.code === currentLanguage ? 'bg-blue-100/80 font-bold text-blue-700 dark:bg-blue-600/30 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}
                onClick={() => handleLanguageChange(lang.code)}
                role="option"
                aria-selected={lang.code === currentLanguage}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {lang.code === detectedLanguage && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-600/30 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                    Auto
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 