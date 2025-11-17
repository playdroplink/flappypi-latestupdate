const fs = require('fs');
const path = require('path');

// Read the translations file
const filePath = path.join(__dirname, 'src/constants/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find all duplicate tutorial keys and remove them
// Keep only the first occurrence in each language section

// Split the content into sections by language
const sections = content.split(/(?=^\s*[a-z]{2}:\s*\{)/m);

// Process each section
const processedSections = sections.map((section, index) => {
  if (index === 0) return section; // Keep the first section as is
  
  // Find and remove duplicate tutorial keys in this section
  const lines = section.split('\n');
  let tutorialFound = false;
  const cleanedLines = lines.map(line => {
    if (line.trim().startsWith('tutorial:') && !tutorialFound) {
      tutorialFound = true;
      return line;
    } else if (line.trim().startsWith('tutorial:') && tutorialFound) {
      // Remove duplicate tutorial line
      return '';
    }
    return line;
  });
  
  return cleanedLines.join('\n');
});

// Join the sections back together
const fixedContent = processedSections.join('');

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixedContent);

console.log('✅ Fixed duplicate tutorial keys in translations.ts');
console.log('📝 Removed duplicate tutorial entries while keeping the first occurrence in each language section'); 