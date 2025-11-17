// Country to language mapping for automatic language detection
export const countryLanguageMap: Record<string, string> = {
  // North America
  'US': 'en', // United States
  'CA': 'en', // Canada (English)
  'MX': 'es', // Mexico
  
  // South America
  'BR': 'pt', // Brazil
  'AR': 'es', // Argentina
  'CO': 'es', // Colombia
  'PE': 'es', // Peru
  'VE': 'es', // Venezuela
  'CL': 'es', // Chile
  'EC': 'es', // Ecuador
  'BO': 'es', // Bolivia
  'PY': 'es', // Paraguay
  'UY': 'es', // Uruguay
  'GY': 'en', // Guyana
  'SR': 'nl', // Suriname (not supported, fallback to en)
  'FK': 'en', // Falkland Islands
  
  // Europe
  'GB': 'en', // United Kingdom
  'DE': 'de', // Germany
  'FR': 'fr', // France
  'IT': 'it', // Italy
  'ES': 'es', // Spain
  'PT': 'pt', // Portugal
  'PL': 'pl', // Poland
  'RU': 'ru', // Russia
  'UA': 'uk', // Ukraine
  'TR': 'tr', // Turkey
  'NL': 'nl', // Netherlands
  'BE': 'fr', // Belgium (French)
  'CH': 'de', // Switzerland (German)
  'AT': 'de', // Austria
  'SE': 'sv', // Sweden
  'NO': 'no', // Norway
  'DK': 'en', // Denmark (fallback to en)
  'FI': 'fi', // Finland
  'IE': 'en', // Ireland
  'IS': 'en', // Iceland (fallback to en)
  'MT': 'en', // Malta (fallback to en)
  'CY': 'en', // Cyprus (fallback to en)
  'GR': 'el', // Greece
  'HR': 'en', // Croatia (fallback to en)
  'SI': 'en', // Slovenia (fallback to en)
  'SK': 'sk', // Slovakia
  'CZ': 'cs', // Czech Republic
  'HU': 'hu', // Hungary
  'RO': 'ro', // Romania
  'BG': 'bg', // Bulgaria
  'LT': 'en', // Lithuania (fallback to en)
  'LV': 'en', // Latvia (fallback to en)
  'EE': 'en', // Estonia (fallback to en)
  'LU': 'fr', // Luxembourg (French)
  'MC': 'fr', // Monaco (French)
  'LI': 'de', // Liechtenstein (German)
  'AD': 'es', // Andorra (Catalan not supported, fallback to es)
  'SM': 'it', // San Marino (Italian)
  'VA': 'it', // Vatican City (Italian)
  
  // Asia
  'CN': 'zh', // China
  'JP': 'ja', // Japan
  'KR': 'ko', // South Korea
  'IN': 'hi', // India
  'ID': 'id', // Indonesia
  'TH': 'th', // Thailand
  'VN': 'vi', // Vietnam
  'PH': 'tl', // Philippines (Tagalog)
  'MY': 'ms', // Malaysia
  'SG': 'en', // Singapore (fallback to en)
  'TW': 'zh', // Taiwan (Chinese)
  'HK': 'zh', // Hong Kong (Chinese)
  'MO': 'zh', // Macau (Chinese)
  'MN': 'en', // Mongolia (fallback to en)
  'KP': 'ko', // North Korea (Korean)
  'LA': 'en', // Laos (fallback to en)
  'KH': 'en', // Cambodia (fallback to en)
  'MM': 'my', // Myanmar
  'BD': 'bn', // Bangladesh
  'LK': 'en', // Sri Lanka (fallback to en)
  'NP': 'ne', // Nepal
  'BT': 'en', // Bhutan (fallback to en)
  'MV': 'en', // Maldives (fallback to en)
  'PK': 'ur', // Pakistan
  'AF': 'ps', // Afghanistan
  'TJ': 'en', // Tajikistan (fallback to en)
  'KG': 'en', // Kyrgyzstan (fallback to en)
  'KZ': 'en', // Kazakhstan (fallback to en)
  'UZ': 'en', // Uzbekistan (fallback to en)
  'TM': 'en', // Turkmenistan (fallback to en)
  'AZ': 'en', // Azerbaijan (fallback to en)
  'GE': 'en', // Georgia (fallback to en)
  'AM': 'en', // Armenia (fallback to en)
  'IR': 'fa', // Iran (Persian)
  'IQ': 'ar', // Iraq (Arabic)
  'SY': 'ar', // Syria (Arabic)
  'LB': 'ar', // Lebanon (Arabic)
  'JO': 'ar', // Jordan (Arabic)
  'IL': 'en', // Israel (fallback to en)
  'PS': 'ar', // Palestine (Arabic)
  'SA': 'ar', // Saudi Arabia (Arabic)
  'YE': 'ar', // Yemen (Arabic)
  'OM': 'ar', // Oman (Arabic)
  'AE': 'ar', // United Arab Emirates (Arabic)
  'QA': 'ar', // Qatar (Arabic)
  'BH': 'ar', // Bahrain (Arabic)
  'KW': 'ar', // Kuwait (Arabic)
  
  // Africa
  'EG': 'ar', // Egypt (Arabic)
  'LY': 'ar', // Libya (Arabic)
  'TN': 'ar', // Tunisia (Arabic)
  'DZ': 'ar', // Algeria (Arabic)
  'MA': 'ar', // Morocco (Arabic)
  'SD': 'ar', // Sudan (Arabic)
  'SS': 'en', // South Sudan (fallback to en)
  'TD': 'ar', // Chad (Arabic)
  'NE': 'fr', // Niger (French)
  'ML': 'fr', // Mali (French)
  'BF': 'fr', // Burkina Faso (French)
  'SN': 'fr', // Senegal (French)
  'GN': 'fr', // Guinea (French)
  'CI': 'fr', // Ivory Coast (French)
  'TG': 'fr', // Togo (French)
  'BJ': 'fr', // Benin (French)
  'CM': 'fr', // Cameroon (French)
  'CF': 'fr', // Central African Republic (French)
  'CG': 'fr', // Republic of the Congo (French)
  'CD': 'fr', // Democratic Republic of the Congo (French)
  'GA': 'fr', // Gabon (French)
  'GQ': 'es', // Equatorial Guinea (Spanish)
  'ST': 'pt', // São Tomé and Príncipe (Portuguese)
  'GW': 'pt', // Guinea-Bissau (Portuguese)
  'CV': 'pt', // Cape Verde (Portuguese)
  'AO': 'pt', // Angola (Portuguese)
  'MZ': 'pt', // Mozambique (Portuguese)
  'ZW': 'en', // Zimbabwe (fallback to en)
  'ZM': 'en', // Zambia (fallback to en)
  'MW': 'en', // Malawi (fallback to en)
  'TZ': 'en', // Tanzania (fallback to en)
  'KE': 'en', // Kenya (fallback to en)
  'UG': 'en', // Uganda (fallback to en)
  'RW': 'en', // Rwanda (fallback to en)
  'BI': 'en', // Burundi (fallback to en)
  'ET': 'en', // Ethiopia (fallback to en)
  'ER': 'en', // Eritrea (fallback to en)
  'DJ': 'fr', // Djibouti (French)
  'SO': 'en', // Somalia (fallback to en)
  'KM': 'ar', // Comoros (Arabic)
  'MG': 'fr', // Madagascar (French)
  'MU': 'en', // Mauritius (fallback to en)
  'SC': 'en', // Seychelles (fallback to en)
  'NA': 'en', // Namibia (fallback to en)
  'BW': 'en', // Botswana (fallback to en)
  'LS': 'en', // Lesotho (fallback to en)
  'SZ': 'en', // Eswatini (fallback to en)
  'ZA': 'en', // South Africa (fallback to en)
  'RE': 'fr', // Réunion (French)
  'YT': 'fr', // Mayotte (French)
  
  // Oceania
  'AU': 'en', // Australia
  'NZ': 'en', // New Zealand
  'FJ': 'en', // Fiji (fallback to en)
  'PG': 'en', // Papua New Guinea (fallback to en)
  'SB': 'en', // Solomon Islands (fallback to en)
  'VU': 'fr', // Vanuatu (French)
  'NC': 'fr', // New Caledonia (French)
  'PF': 'fr', // French Polynesia (French)
  'WF': 'fr', // Wallis and Futuna (French)
  'TO': 'en', // Tonga (fallback to en)
  'WS': 'en', // Samoa (fallback to en)
  'KI': 'en', // Kiribati (fallback to en)
  'TV': 'en', // Tuvalu (fallback to en)
  'NR': 'en', // Nauru (fallback to en)
  'PW': 'en', // Palau (fallback to en)
  'MH': 'en', // Marshall Islands (fallback to en)
  'FM': 'en', // Micronesia (fallback to en)
  'CK': 'en', // Cook Islands (fallback to en)
  'NU': 'en', // Niue (fallback to en)
  'TK': 'en', // Tokelau (fallback to en)
  'AS': 'en', // American Samoa (fallback to en)
  'GU': 'en', // Guam (fallback to en)
  'MP': 'en', // Northern Mariana Islands (fallback to en)
  
  // Caribbean
  'CU': 'es', // Cuba (Spanish)
  'DO': 'es', // Dominican Republic (Spanish)
  'PR': 'es', // Puerto Rico (Spanish)
  'JM': 'en', // Jamaica (fallback to en)
  'HT': 'fr', // Haiti (French)
  'BB': 'en', // Barbados (fallback to en)
  'TT': 'en', // Trinidad and Tobago (fallback to en)
  'GD': 'en', // Grenada (fallback to en)
  'LC': 'en', // Saint Lucia (fallback to en)
  'VC': 'en', // Saint Vincent and the Grenadines (fallback to en)
  'AG': 'en', // Antigua and Barbuda (fallback to en)
  'KN': 'en', // Saint Kitts and Nevis (fallback to en)
  'DM': 'en', // Dominica (fallback to en)
  'BS': 'en', // Bahamas (fallback to en)
  'TC': 'en', // Turks and Caicos Islands (fallback to en)
  'AI': 'en', // Anguilla (fallback to en)
  'VG': 'en', // British Virgin Islands (fallback to en)
  'VI': 'en', // U.S. Virgin Islands (fallback to en)
  'AW': 'en', // Aruba (fallback to en)
  'CW': 'en', // Curaçao (fallback to en)
  'SX': 'en', // Sint Maarten (fallback to en)
  'BQ': 'en', // Caribbean Netherlands (fallback to en)
  'KY': 'en', // Cayman Islands (fallback to en)
  'BM': 'en', // Bermuda (fallback to en)
  'MS': 'en', // Montserrat (fallback to en)
  'GP': 'fr', // Guadeloupe (French)
  'MQ': 'fr', // Martinique (French)
  'BL': 'fr', // Saint Barthélemy (French)
  'MF': 'fr', // Saint Martin (French)
};

// Function to detect user's country and return appropriate language
export const detectUserLanguage = (): string => {
  try {
    // First priority: Check browser language preferences
    const browserLanguages = navigator.languages || [navigator.language];
    
    for (const lang of browserLanguages) {
      const languageCode = lang.split('-')[0].toLowerCase();
      
      // Map common language codes to our supported languages
      const languageMap: Record<string, string> = {
        'en': 'en',
        'es': 'es',
        'hi': 'hi',
        'zh': 'zh',
        'id': 'id',
        'pt': 'pt',
        'fr': 'fr',
        'ru': 'ru',
        'tr': 'tr',
        'vi': 'vi',
        'th': 'th',
        'de': 'de',
        'fa': 'fa',
        'ko': 'ko',
        'ja': 'ja',
        'ar': 'ar',
        'uk': 'uk',
        'it': 'it',
        'pl': 'pl',
        'tl': 'tl', // Tagalog/Filipino
        'fil': 'tl', // Also support 'fil' for backward compatibility
        'bn': 'bn', // Bengali
        'pa': 'pa', // Punjabi
        'jv': 'jv', // Javanese
        'te': 'te', // Telugu
        'mr': 'mr', // Marathi
        'ta': 'ta', // Tamil
        'ur': 'ur', // Urdu
        'ha': 'ha', // Hausa
        'gu': 'gu', // Gujarati
        'kn': 'kn', // Kannada
        'ml': 'ml', // Malayalam
        'my': 'my', // Burmese
        'ro': 'ro', // Romanian
        'ps': 'ps', // Pashto
        'sd': 'sd', // Sindhi
        'nl': 'nl', // Dutch
        'sw': 'sw', // Swahili
        'ne': 'ne', // Nepali
        'sr': 'sr', // Serbian
        'ms': 'ms', // Malay
        'cs': 'cs', // Czech
        'el': 'el', // Greek
        'sk': 'sk', // Slovak
        'hu': 'hu', // Hungarian
        'sv': 'sv', // Swedish
        'fi': 'fi', // Finnish
        'he': 'he', // Hebrew
        'no': 'no', // Norwegian
        'am': 'am', // Amharic
        'bg': 'bg'  // Bulgarian
      };
      
      if (languageMap[languageCode]) {
        console.log('🌍 Detected language from browser preferences:', languageCode, '->', languageMap[languageCode]);
        return languageMap[languageCode];
      }
    }
    
    // Second priority: Try to get country from browser's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryFromTimezone = timezone.split('/').pop()?.toUpperCase();
    
    if (countryFromTimezone && countryLanguageMap[countryFromTimezone]) {
      console.log('🌍 Detected language from timezone:', countryFromTimezone, '->', countryLanguageMap[countryFromTimezone]);
      return countryLanguageMap[countryFromTimezone];
    }
    
    // Final fallback to English
    console.log('🌍 No language detected, falling back to English');
    return 'en';
  } catch (error) {
    console.warn('Could not detect user language, falling back to English:', error);
    return 'en';
  }
};

// Function to get country name from country code
export const getCountryName = (countryCode: string): string => {
  try {
    // Validate country code format (should be 2 uppercase letters)
    if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
      return countryCode || 'Unknown';
    }
    
    const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode);
    return countryName || countryCode;
  } catch (error) {
    console.warn('Could not get country name for:', countryCode, error);
    return countryCode || 'Unknown';
  }
};

// Function to get current user's country
export const getUserCountry = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryFromTimezone = timezone.split('/').pop()?.toUpperCase();
    
    // Validate the country code
    if (countryFromTimezone && countryFromTimezone.length === 2 && /^[A-Z]{2}$/.test(countryFromTimezone)) {
      return countryFromTimezone;
    }
    
    // Fallback to US if timezone parsing fails or gives invalid country code
    return 'US';
  } catch (error) {
    console.warn('Could not detect country from timezone:', error);
    return 'US';
  }
}; 