// Comprehensive Translation Check for Flappy Pi
// This script will analyze all translation keys used in the app

import fs from 'fs';
import path from 'path';

// Define all 50 languages
const languages = [
  'en', 'es', 'tl', 'hi', 'zh', 'id', 'pt', 'fr', 'ru', 'tr', 'vi', 'th', 'de', 'fa', 'ko', 'ja', 'ar', 'uk', 'it', 'pl', 'bn', 'pa', 'jv', 'te', 'mr', 'ta', 'ur', 'ha', 'gu', 'kn', 'ml', 'my', 'ro', 'ps', 'sd', 'nl', 'sw', 'ne', 'sr', 'ms', 'cs', 'el', 'sk', 'hu', 'sv', 'fi', 'he', 'no', 'am', 'bg'
];

// Read the translations file
function readTranslationsFile() {
  try {
    const content = fs.readFileSync('src/constants/translations.ts', 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading translations file:', error);
    return null;
  }
}

// Extract all translation keys from the file
function extractTranslationKeys(content) {
  const keys = [];
  const lines = content.split('\n');
  
  for (let line of lines) {
    // Look for translation key patterns like: key: "value"
    const match = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*["'`]([^"'`]*)["'`]/);
    if (match) {
      keys.push(match[1]);
    }
  }
  
  return [...new Set(keys)]; // Remove duplicates
}

// Check which languages have which keys
function analyzeTranslations(content) {
  const analysis = {};
  const lines = content.split('\n');
  let currentLanguage = null;
  
  for (let line of lines) {
    // Check for language section start
    const langMatch = line.match(/^\s*([a-z]{2}):\s*\{/);
    if (langMatch) {
      currentLanguage = langMatch[1];
      analysis[currentLanguage] = new Set();
      continue;
    }
    
    // Check for translation keys in current language
    if (currentLanguage) {
      const keyMatch = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*["'`]([^"'`]*)["'`]/);
      if (keyMatch) {
        analysis[currentLanguage].add(keyMatch[1]);
      }
    }
  }
  
  return analysis;
}

// Find missing translations
function findMissingTranslations(analysis) {
  const allKeys = new Set();
  
  // Collect all keys from all languages
  Object.values(analysis).forEach(keys => {
    keys.forEach(key => allKeys.add(key));
  });
  
  const missing = {};
  
  languages.forEach(lang => {
    missing[lang] = [];
    allKeys.forEach(key => {
      if (!analysis[lang] || !analysis[lang].has(key)) {
        missing[lang].push(key);
      }
    });
  });
  
  return { allKeys: Array.from(allKeys), missing };
}

// Main execution
console.log('🔍 Comprehensive Translation Analysis');
console.log('=====================================\n');

const content = readTranslationsFile();
if (!content) {
  console.log('❌ Could not read translations file');
  process.exit(1);
}

console.log('📖 Analyzing translations file...\n');

const analysis = analyzeTranslations(content);
const { allKeys, missing } = findMissingTranslations(analysis);

console.log(`📊 Total unique translation keys: ${allKeys.length}`);
console.log(`🌍 Languages analyzed: ${Object.keys(analysis).length}\n`);

// Show missing translations by language
console.log('❌ Missing Translations by Language:');
console.log('====================================\n');

languages.forEach(lang => {
  if (missing[lang] && missing[lang].length > 0) {
    console.log(`${lang.toUpperCase()}: ${missing[lang].length} missing keys`);
    if (missing[lang].length <= 10) {
      missing[lang].forEach(key => console.log(`  - ${key}`));
    } else {
      console.log(`  - First 10: ${missing[lang].slice(0, 10).join(', ')}...`);
    }
    console.log('');
  }
});

// Show languages with complete translations
const completeLanguages = languages.filter(lang => !missing[lang] || missing[lang].length === 0);
console.log(`✅ Languages with complete translations: ${completeLanguages.length}`);
console.log(`❌ Languages with missing translations: ${languages.length - completeLanguages.length}\n`);

// Show most common missing keys
const missingKeyCounts = {};
languages.forEach(lang => {
  if (missing[lang]) {
    missing[lang].forEach(key => {
      missingKeyCounts[key] = (missingKeyCounts[key] || 0) + 1;
    });
  }
});

const sortedMissingKeys = Object.entries(missingKeyCounts)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20);

console.log('🔑 Most commonly missing translation keys:');
console.log('==========================================\n');

sortedMissingKeys.forEach(([key, count]) => {
  console.log(`${key}: missing in ${count} languages`);
});

console.log('\n✅ Analysis complete!');
console.log('💡 Focus on the most commonly missing keys first for maximum impact.'); 