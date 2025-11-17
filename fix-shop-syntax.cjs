const fs = require('fs');

console.log('🔧 Fixing ShopPage.tsx syntax errors...');

// Read the file
let content = fs.readFileSync('src/pages/ShopPage.tsx', 'utf8');

// Count braces
const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;

console.log(`📊 Found ${openBraces} opening braces and ${closeBraces} closing braces`);
console.log(`📊 Missing ${openBraces - closeBraces} closing braces`);

// Find the line with the return statement that's causing the error
const lines = content.split('\n');
const returnLineIndex = lines.findIndex(line => line.trim().startsWith('return (') && line.includes('SkyBackground'));

if (returnLineIndex !== -1) {
  console.log(`📍 Found return statement at line ${returnLineIndex + 1}`);
  
  // Check if there are missing closing braces before the return statement
  const beforeReturn = lines.slice(0, returnLineIndex).join('\n');
  const openBracesBefore = (beforeReturn.match(/\{/g) || []).length;
  const closeBracesBefore = (beforeReturn.match(/\}/g) || []).length;
  
  console.log(`📊 Before return: ${openBracesBefore} opening, ${closeBracesBefore} closing`);
  console.log(`📊 Missing ${openBracesBefore - closeBracesBefore} closing braces before return`);
  
  // Add missing closing braces before the return statement
  const missingBraces = openBracesBefore - closeBracesBefore;
  if (missingBraces > 0) {
    console.log(`🔧 Adding ${missingBraces} missing closing braces...`);
    
    // Insert missing closing braces before the return statement
    const beforeReturnLines = lines.slice(0, returnLineIndex);
    const returnAndAfter = lines.slice(returnLineIndex);
    
    // Add missing closing braces
    for (let i = 0; i < missingBraces; i++) {
      beforeReturnLines.push('  };');
    }
    
    // Reconstruct the file
    const fixedContent = beforeReturnLines.join('\n') + '\n' + returnAndAfter.join('\n');
    
    // Write the fixed content
    fs.writeFileSync('src/pages/ShopPage.tsx', fixedContent);
    
    console.log('✅ Fixed missing closing braces');
    
    // Verify the fix
    const newContent = fs.readFileSync('src/pages/ShopPage.tsx', 'utf8');
    const newOpenBraces = (newContent.match(/\{/g) || []).length;
    const newCloseBraces = (newContent.match(/\}/g) || []).length;
    
    console.log(`✅ After fix: ${newOpenBraces} opening braces and ${newCloseBraces} closing braces`);
    console.log(`✅ Balance: ${newOpenBraces - newCloseBraces} (should be 0)`);
  } else {
    console.log('✅ No missing closing braces found');
  }
} else {
  console.log('❌ Could not find the return statement');
}

console.log('🎉 ShopPage.tsx syntax fix complete!');
