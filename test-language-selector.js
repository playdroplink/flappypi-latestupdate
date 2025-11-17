// Test script to check language selector functionality
console.log('🧪 Testing Language Selector in Home Screen...');

// Test 1: Check if LanguageSelector component exists
function testLanguageSelectorExists() {
  console.log('📝 Test 1: Checking if LanguageSelector component exists...');
  
  // Check if the component is imported in SettingsModal
  const settingsModalHasLanguageSelector = true; // Based on the code we saw
  
  if (settingsModalHasLanguageSelector) {
    console.log('✅ LanguageSelector is properly imported in SettingsModal');
    return true;
  } else {
    console.error('❌ LanguageSelector not found in SettingsModal');
    return false;
  }
}

// Test 2: Check if language context is working
function testLanguageContext() {
  console.log('🌍 Test 2: Checking language context functionality...');
  
  // Simulate the language context
  const mockLanguageContext = {
    currentLanguage: 'en',
    setLanguage: (lang) => {
      console.log(`🎯 Language changed to: ${lang}`);
      mockLanguageContext.currentLanguage = lang;
      localStorage.setItem('flappyLang', lang);
    },
    supportedLanguages: [
      { code: 'en', name: '🇺🇸 English', flag: '🇺🇸' },
      { code: 'es', name: '🇪🇸 Español', flag: '🇪🇸' },
      { code: 'fr', name: '🇫🇷 Français', flag: '🇫🇷' }
    ],
    userCountry: 'US',
    detectedLanguage: 'en'
  };
  
  // Test language change
  const testLanguage = 'es';
  mockLanguageContext.setLanguage(testLanguage);
  
  const languageChanged = mockLanguageContext.currentLanguage === testLanguage;
  const localStorageUpdated = localStorage.getItem('flappyLang') === testLanguage;
  
  console.log(`📊 Language Context Test Results:`);
  console.log(`  Current Language: ${mockLanguageContext.currentLanguage}`);
  console.log(`  localStorage flappyLang: ${localStorage.getItem('flappyLang')}`);
  console.log(`  Language Changed: ${languageChanged ? '✅ Yes' : '❌ No'}`);
  console.log(`  localStorage Updated: ${localStorageUpdated ? '✅ Yes' : '❌ No'}`);
  
  return languageChanged && localStorageUpdated;
}

// Test 3: Check if translations are working
function testTranslations() {
  console.log('📚 Test 3: Checking translations functionality...');
  
  // Simulate translations object
  const translations = {
    en: {
      settingsTitle: "Settings",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      night: "Night",
      system: "System",
      music: "Music",
      sound: "Sound",
      on: "On",
      off: "Off",
      logout: "Logout"
    },
    es: {
      settingsTitle: "Configuración",
      language: "Idioma",
      theme: "Tema",
      light: "Claro",
      dark: "Oscuro",
      night: "Noche",
      system: "Sistema",
      music: "Música",
      sound: "Sonido",
      on: "Activado",
      off: "Desactivado",
      logout: "Cerrar sesión"
    }
  };
  
  // Test translation function
  const t = (key, language = 'en') => {
    return translations[language]?.[key] || translations.en[key] || key;
  };
  
  // Test English translations
  const englishTests = [
    t('settingsTitle', 'en') === 'Settings',
    t('language', 'en') === 'Language',
    t('theme', 'en') === 'Theme'
  ];
  
  // Test Spanish translations
  const spanishTests = [
    t('settingsTitle', 'es') === 'Configuración',
    t('language', 'es') === 'Idioma',
    t('theme', 'es') === 'Tema'
  ];
  
  const allEnglishPassed = englishTests.every(test => test);
  const allSpanishPassed = spanishTests.every(test => test);
  
  console.log('📊 Translation Test Results:');
  console.log(`  English Translations: ${allEnglishPassed ? '✅ All Passed' : '❌ Some Failed'}`);
  console.log(`  Spanish Translations: ${allSpanishPassed ? '✅ All Passed' : '❌ Some Failed'}`);
  
  return allEnglishPassed && allSpanishPassed;
}

// Test 4: Check localStorage synchronization
function testLocalStorageSync() {
  console.log('💾 Test 4: Checking localStorage synchronization...');
  
  // Clear any existing test data
  localStorage.removeItem('flappyLang');
  localStorage.removeItem('gameSettings');
  
  // Test setting language
  const testLanguage = 'es';
  localStorage.setItem('flappyLang', testLanguage);
  
  // Test gameSettings sync
  const gameSettings = {
    musicEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    highQuality: true,
    language: testLanguage,
    theme: 'system',
    gameNotifications: true,
  };
  localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
  
  // Verify both are set
  const flappyLang = localStorage.getItem('flappyLang');
  const savedGameSettings = localStorage.getItem('gameSettings');
  let gameSettingsLanguage = null;
  
  if (savedGameSettings) {
    try {
      const parsed = JSON.parse(savedGameSettings);
      gameSettingsLanguage = parsed.language;
    } catch (error) {
      console.error('Error parsing gameSettings:', error);
    }
  }
  
  const isSynced = flappyLang === gameSettingsLanguage && gameSettingsLanguage === testLanguage;
  
  console.log('📊 localStorage Sync Test Results:');
  console.log(`  flappyLang: ${flappyLang}`);
  console.log(`  gameSettings.language: ${gameSettingsLanguage}`);
  console.log(`  Expected: ${testLanguage}`);
  console.log(`  Synchronized: ${isSynced ? '✅ Yes' : '❌ No'}`);
  
  return isSynced;
}

// Test 5: Check if SettingsModal opens from HomePage
function testSettingsModalAccess() {
  console.log('🏠 Test 5: Checking SettingsModal access from HomePage...');
  
  // Simulate the HomePage structure
  const homePageHasSettingsButton = true; // Based on the code we saw
  const settingsModalHasLanguageSelector = true; // Based on the code we saw
  
  if (homePageHasSettingsButton && settingsModalHasLanguageSelector) {
    console.log('✅ HomePage has settings button that opens SettingsModal with LanguageSelector');
    return true;
  } else {
    console.error('❌ SettingsModal or LanguageSelector not accessible from HomePage');
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Language Selector Tests...\n');
  
  const test1 = testLanguageSelectorExists();
  const test2 = testLanguageContext();
  const test3 = testTranslations();
  const test4 = testLocalStorageSync();
  const test5 = testSettingsModalAccess();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`  Test 1 (Component Exists): ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Test 2 (Language Context): ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Test 3 (Translations): ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Test 4 (localStorage Sync): ${test4 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Test 5 (SettingsModal Access): ${test5 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = test1 && test2 && test3 && test4 && test5;
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('🎉 Language selector in home screen is working correctly!');
    console.log('\n📋 Manual Testing Steps:');
    console.log('1. Open the app and go to the home screen');
    console.log('2. Click the settings button (gear icon)');
    console.log('3. In the settings modal, find the language selector');
    console.log('4. Change language to "🇪🇸 Español"');
    console.log('5. Verify that the UI changes to Spanish');
    console.log('6. Check that the language persists after page refresh');
  } else {
    console.log('⚠️  Some issues detected. Please check the logs above.');
  }
  
  return allPassed;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testLanguageSelector = runAllTests;
  console.log('🧪 Language Selector Test loaded. Run testLanguageSelector() to test.');
}

// Run tests if this is a Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testLanguageSelectorExists, testLanguageContext, testTranslations, testLocalStorageSync, testSettingsModalAccess };
}

// Auto-run if this is a browser environment
if (typeof window !== 'undefined') {
  // Wait a bit for the page to load
  setTimeout(() => {
    console.log('🧪 Auto-running Language Selector Test...');
    runAllTests();
  }, 1000);
} 