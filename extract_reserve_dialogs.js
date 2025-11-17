import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the translations file
const translationsPath = path.join(__dirname, 'src', 'constants', 'translations.ts');
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Extract all npcReserveDialog translations
const dialogRegex = /npcReserveDialog(\d+):\s*"([^"]+)"/g;
const translations = {};

let match;
while ((match = dialogRegex.exec(translationsContent)) !== null) {
    const dialogNumber = match[1];
    const translation = match[2];
    
    if (!translations[dialogNumber]) {
        translations[dialogNumber] = {};
    }
    
    // Try to determine language from context
    // This is a simplified approach - you may need to adjust based on your file structure
    const beforeMatch = translationsContent.substring(Math.max(0, match.index - 200), match.index);
    const afterMatch = translationsContent.substring(match.index, Math.min(translationsContent.length, match.index + 200));
    
    // Look for language indicators
    let language = 'unknown';
    if (beforeMatch.includes('en:') || afterMatch.includes('en:')) language = 'en';
    else if (beforeMatch.includes('es:') || afterMatch.includes('es:')) language = 'es';
    else if (beforeMatch.includes('fr:') || afterMatch.includes('fr:')) language = 'fr';
    else if (beforeMatch.includes('de:') || afterMatch.includes('de:')) language = 'de';
    else if (beforeMatch.includes('zh:') || afterMatch.includes('zh:')) language = 'zh';
    else if (beforeMatch.includes('ja:') || afterMatch.includes('ja:')) language = 'ja';
    else if (beforeMatch.includes('ko:') || afterMatch.includes('ko:')) language = 'ko';
    else if (beforeMatch.includes('ru:') || afterMatch.includes('ru:')) language = 'ru';
    else if (beforeMatch.includes('pt:') || afterMatch.includes('pt:')) language = 'pt';
    else if (beforeMatch.includes('it:') || afterMatch.includes('it:')) language = 'it';
    else if (beforeMatch.includes('tr:') || afterMatch.includes('tr:')) language = 'tr';
    else if (beforeMatch.includes('vi:') || afterMatch.includes('vi:')) language = 'vi';
    else if (beforeMatch.includes('ar:') || afterMatch.includes('ar:')) language = 'ar';
    else if (beforeMatch.includes('fa:') || afterMatch.includes('fa:')) language = 'fa';
    else if (beforeMatch.includes('pl:') || afterMatch.includes('pl:')) language = 'pl';
    else if (beforeMatch.includes('uk:') || afterMatch.includes('uk:')) language = 'uk';
    else if (beforeMatch.includes('nl:') || afterMatch.includes('nl:')) language = 'nl';
    else if (beforeMatch.includes('id:') || afterMatch.includes('id:')) language = 'id';
    else if (beforeMatch.includes('th:') || afterMatch.includes('th:')) language = 'th';
    else if (beforeMatch.includes('hi:') || afterMatch.includes('hi:')) language = 'hi';
    
    translations[dialogNumber][language] = translation;
}

// Generate CSV output
let csvContent = 'Dialog,Language,Translation\n';
for (const dialogNumber of Object.keys(translations).sort((a, b) => parseInt(a) - parseInt(b))) {
    for (const language of Object.keys(translations[dialogNumber])) {
        const translation = translations[dialogNumber][language].replace(/"/g, '""');
        csvContent += `${dialogNumber},${language},"${translation}"\n`;
    }
}

// Generate JSON output
const jsonContent = JSON.stringify(translations, null, 2);

// Write outputs
fs.writeFileSync('reserve_dialogs.csv', csvContent);
fs.writeFileSync('reserve_dialogs.json', jsonContent);

console.log('✅ Extraction complete!');
console.log('📁 Files created:');
console.log('   - reserve_dialogs.csv (CSV format)');
console.log('   - reserve_dialogs.json (JSON format)');
console.log('');
console.log('📊 Summary:');
console.log(`   - ${Object.keys(translations).length} dialogs found`);
console.log('   - Languages detected:', [...new Set(Object.values(translations).flatMap(langs => Object.keys(langs)))].join(', ')); 