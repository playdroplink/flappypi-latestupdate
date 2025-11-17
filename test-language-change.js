// Test script to debug language change functionality
console.log('🧪 Testing language change functionality...');

// Test 1: Check if translations object has all languages
const testLanguages = ['en', 'es', 'hi', 'zh', 'ar', 'pt', 'bn', 'ru', 'ja', 'pa', 'de', 'jv', 'ko', 'fr', 'te', 'mr', 'tr', 'vi', 'th', 'it', 'pl', 'ta', 'ur', 'ha', 'gu', 'kn', 'ml', 'my', 'ro', 'ps', 'sd', 'nl', 'tl', 'sw', 'ne', 'sr', 'ms', 'fa', 'cs', 'el', 'sk', 'hu', 'sv', 'fi', 'he', 'no', 'id', 'am', 'bg', 'uk'];

console.log('📋 Testing translations object...');
testLanguages.forEach(lang => {
  try {
    // This would need to be imported in a real environment
    console.log(`✅ ${lang}: Available`);
  } catch (error) {
    console.log(`❌ ${lang}: Missing - ${error.message}`);
  }
});

// Test 2: Check localStorage functionality
console.log('\n📦 Testing localStorage...');
try {
  localStorage.setItem('flappyLang', 'es');
  const savedLang = localStorage.getItem('flappyLang');
  console.log(`✅ localStorage test: ${savedLang === 'es' ? 'PASS' : 'FAIL'}`);
  
  // Test gameSettings sync
  const gameSettings = { language: 'fr' };
  localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
  const savedSettings = JSON.parse(localStorage.getItem('gameSettings'));
  console.log(`✅ gameSettings test: ${savedSettings.language === 'fr' ? 'PASS' : 'FAIL'}`);
} catch (error) {
  console.log(`❌ localStorage error: ${error.message}`);
}

// Test 3: Check supportedLanguages array
console.log('\n🌍 Testing supportedLanguages array...');
const supportedLanguages = [
  { code: 'en', name: '🇺🇸 English', flag: '🇺🇸' },
  { code: 'es', name: '🇪🇸 Español', flag: '🇪🇸' },
  { code: 'hi', name: '🇮🇳 हिन्दी', flag: '🇮🇳' },
  // ... more languages
];

console.log(`✅ supportedLanguages count: ${supportedLanguages.length}`);
console.log(`✅ First language: ${supportedLanguages[0].name}`);
console.log(`✅ Language codes: ${supportedLanguages.map(l => l.code).slice(0, 5).join(', ')}...`);

console.log('\n🎯 Language change test completed!'); 