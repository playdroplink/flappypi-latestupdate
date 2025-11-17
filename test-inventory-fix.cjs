const fs = require('fs');
const path = require('path');

console.log('🔍 Inventory Page Fix Verification');
console.log('==================================');

// Check if the InventoryPage.tsx file has the correct import
const inventoryPagePath = path.join(__dirname, 'src', 'pages', 'InventoryPage.tsx');

if (fs.existsSync(inventoryPagePath)) {
  const content = fs.readFileSync(inventoryPagePath, 'utf8');
  
  console.log('✅ InventoryPage.tsx exists');
  
  // Check for the getBirdImageSrc import
  if (content.includes("import { getBirdImageSrc } from '@/utils/getBirdImageSrc';")) {
    console.log('✅ getBirdImageSrc import found');
  } else {
    console.log('❌ getBirdImageSrc import missing');
  }
  
  // Check for the function usage
  if (content.includes('getBirdImageSrc(getEquippedSkin())')) {
    console.log('✅ getBirdImageSrc function usage found');
  } else {
    console.log('❌ getBirdImageSrc function usage not found');
  }
  
  // Check if getBirdImageSrc utility exists
  const utilPath = path.join(__dirname, 'src', 'utils', 'getBirdImageSrc.ts');
  if (fs.existsSync(utilPath)) {
    console.log('✅ getBirdImageSrc utility file exists');
  } else {
    console.log('❌ getBirdImageSrc utility file missing');
  }
  
  console.log('\n🎯 Fix Summary:');
  console.log('- Added missing import for getBirdImageSrc utility');
  console.log('- This should resolve the "getBirdImageSrc is not defined" error');
  console.log('- Inventory page should now load properly');
  
} else {
  console.log('❌ InventoryPage.tsx not found');
}

console.log('\n🚀 Next Steps:');
console.log('1. Open browser to http://localhost:1115/');
console.log('2. Navigate to inventory page');
console.log('3. Check if page loads without errors');
console.log('4. Verify that equipped skins display correctly');