const fs = require('fs');
const path = require('path');

console.log('Starting translations fix...');

// Read the translations file
const filePath = path.join(__dirname, 'src/constants/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

console.log('File read successfully');

// Extract the object content (remove export and trailing semicolon)
let objectContent = content.replace(/^export const translations = /, '').replace(/;?\s*$/, '');

// Fix trailing commas that might cause parsing issues
objectContent = objectContent.replace(/,(\s*[}\]])/g, '$1');

// Parse the object
let translations;
try {
  // Use Function constructor to safely evaluate the object
  translations = Function('return ' + objectContent)();
  console.log('Object parsed successfully');
} catch (error) {
  console.error('Error parsing object:', error.message);
  process.exit(1);
}

// Deduplicate languages and keys
const cleanedTranslations = {};
const processedLanguages = new Set();

for (const lang in translations) {
  if (processedLanguages.has(lang)) {
    console.log(`Skipping duplicate language block: ${lang}`);
    continue;
  }
  
  processedLanguages.add(lang);
  const seenKeys = new Set();
  const dedupedLang = {};
  
  // Get all keys for this language (handle both object and array-like structures)
  const langObj = translations[lang];
  if (typeof langObj === 'object' && langObj !== null) {
    for (const key in langObj) {
      if (!seenKeys.has(key)) {
        dedupedLang[key] = langObj[key];
        seenKeys.add(key);
      } else {
        console.log(`Removing duplicate key '${key}' in language '${lang}'`);
      }
    }
  }
  
  cleanedTranslations[lang] = dedupedLang;
  console.log(`Processed language: ${lang} (${Object.keys(dedupedLang).length} keys)`);
}

// Convert back to TypeScript format
const output = 'export const translations = ' + JSON.stringify(cleanedTranslations, null, 2) + ';\n';

// Write back to file
fs.writeFileSync(filePath, output, 'utf8');

console.log('✅ Translations file fixed successfully!');
console.log(`Total languages: ${Object.keys(cleanedTranslations).length}`);
console.log('All duplicate language blocks and keys have been removed.'); 