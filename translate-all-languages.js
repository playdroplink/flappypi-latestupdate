// Comprehensive Translation Script for Flappy Pi
// This script will help translate all 50 languages systematically

import fs from 'fs';
import path from 'path';

// Define all 50 languages with their proper names and codes
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' }
];

// Key translations that need to be added for all languages
const keyTranslations = {
  welcomeTitle: {
    en: "Welcome to Flappy Pi!",
    es: "¡Bienvenido a Flappy Pi!",
    tl: "Maligayang pagdating sa Flappy Pi!",
    hi: "Flappy Pi में आपका स्वागत है!",
    zh: "欢迎来到 Flappy Pi！",
    id: "Selamat datang di Flappy Pi!",
    pt: "Bem-vindo ao Flappy Pi!",
    fr: "Bienvenue dans Flappy Pi !",
    ru: "Добро пожаловать в Flappy Pi!",
    tr: "Flappy Pi'ye Hoş Geldiniz!",
    vi: "Chào mừng đến với Flappy Pi!",
    th: "ยินดีต้อนรับสู่ Flappy Pi!",
    de: "Willkommen bei Flappy Pi!",
    fa: "به Flappy Pi خوش آمدید!",
    ko: "Flappy Pi에 오신 것을 환영합니다!",
    ja: "Flappy Piへようこそ！",
    ar: "مرحبًا بك في Flappy Pi!",
    uk: "Ласкаво просимо до Flappy Pi!",
    it: "Benvenuto in Flappy Pi!",
    pl: "Witamy w Flappy Pi!",
    bn: "Flappy Pi-তে স্বাগতম!",
    pa: "Flappy Pi ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ!",
    jv: "Sugeng rawuh ing Flappy Pi!",
    te: "Flappy Pi కి స్వాగతం!",
    mr: "Flappy Pi मध्ये आपले स्वागत आहे!",
    ta: "Flappy Pi க்கு வரவேற்கிறோம்!",
    ur: "Flappy Pi میں خوش آمدید!",
    ha: "Barka da zuwa Flappy Pi!",
    gu: "Flappy Pi માં તમારું સ્વાગત છે!",
    kn: "Flappy Pi ಗೆ ಸುಸ್ವಾಗತ!",
    ml: "Flappy Pi ലേക്ക് സ്വാഗതം!",
    my: "Flappy Pi မှ ကြိုဆိုပါတယ်!",
    ro: "Bun venit la Flappy Pi!",
    ps: "Flappy Pi ته ښه راغلاست!",
    sd: "Flappy Pi ۾ توهان جو خوش آمديد!",
    nl: "Welkom bij Flappy Pi!",
    sw: "Karibu Flappy Pi!",
    ne: "Flappy Pi मा स्वागत छ!",
    sr: "Добро пожаловати у Flappy Pi!",
    ms: "Selamat datang ke Flappy Pi!",
    cs: "Vítejte ve Flappy Pi!",
    el: "Καλώς ήρθατε στο Flappy Pi!",
    sk: "Vitajte vo Flappy Pi!",
    hu: "Üdvözöljük a Flappy Pi-ban!",
    sv: "Välkommen till Flappy Pi!",
    fi: "Tervetuloa Flappy Pi:hin!",
    he: "ברוכים הבאים ל-Flappy Pi!",
    no: "Velkommen til Flappy Pi!",
    am: "Flappy Pi ውስጥ እንኳን በደህና መጡ!",
    bg: "Добре дошли във Flappy Pi!"
  }
};

console.log('🌍 Flappy Pi Translation System');
console.log('================================');
console.log(`📊 Total Languages: ${languages.length}`);
console.log(`🔑 Key Translations: ${Object.keys(keyTranslations).length}`);
console.log('');

// Function to generate translation template
function generateTranslationTemplate() {
  let template = '// Translation Template for Flappy Pi\n';
  template += '// Generated automatically\n\n';
  
  languages.forEach(lang => {
    template += `// ${lang.name} (${lang.nativeName})\n`;
    template += `// Language Code: ${lang.code}\n`;
    template += `// Status: ${lang.code === 'en' ? 'Complete' : 'Needs Translation'}\n\n`;
  });
  
  return template;
}

// Function to check missing translations
function checkMissingTranslations() {
  console.log('🔍 Checking missing translations...\n');
  
  languages.forEach(lang => {
    const missingKeys = [];
    Object.keys(keyTranslations).forEach(key => {
      if (!keyTranslations[key][lang.code]) {
        missingKeys.push(key);
      }
    });
    
    if (missingKeys.length > 0) {
      console.log(`❌ ${lang.name} (${lang.code}): Missing ${missingKeys.length} translations`);
      missingKeys.forEach(key => {
        console.log(`   - ${key}`);
      });
    } else {
      console.log(`✅ ${lang.name} (${lang.code}): Complete`);
    }
  });
}

// Function to generate translation suggestions
function generateTranslationSuggestions() {
  console.log('\n💡 Translation Suggestions:');
  console.log('==========================\n');
  
  Object.keys(keyTranslations).forEach(key => {
    console.log(`📝 ${key}:`);
    languages.forEach(lang => {
      if (!keyTranslations[key][lang.code]) {
        console.log(`   ${lang.code}: [NEEDS TRANSLATION]`);
      }
    });
    console.log('');
  });
}

// Main execution
console.log('🚀 Starting translation analysis...\n');

// Generate template
const template = generateTranslationTemplate();
fs.writeFileSync('translation-template.txt', template);

// Check missing translations
checkMissingTranslations();

// Generate suggestions
generateTranslationSuggestions();

console.log('\n✅ Translation analysis complete!');
console.log('📁 Check translation-template.txt for the template');
console.log('🔧 Use this information to complete all translations'); 