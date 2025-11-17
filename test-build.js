// Build Test Script for Flappy Pi
// This script helps identify build issues before deployment

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Testing Flappy Pi Build...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check required files
const requiredFiles = [
  'src/main.tsx',
  'src/App.tsx',
  'index.html',
  'vite.config.ts',
  'public/validation-key.txt',
  'public/flappypi.fun-validation-key.txt',
  'public/.well-known/flappypi.fun-validation-key.txt'
];

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file} - MISSING`);
    process.exit(1);
  }
}

// Check validation key content
console.log('\n🔑 Checking validation keys...');
const validationKey = '312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156';

const validationFiles = [
  'public/validation-key.txt',
  'public/flappypi.fun-validation-key.txt',
  'public/.well-known/flappypi.fun-validation-key.txt'
];

for (const file of validationFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8').trim();
    if (content === validationKey) {
      console.log(`✅ ${file} - Valid`);
    } else {
      console.error(`❌ ${file} - Invalid content`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ ${file} - Error reading file: ${error.message}`);
    process.exit(1);
  }
}

// Check dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['react', 'react-dom', 'vite'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.error(`❌ ${dep} - Missing dependency`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Test build
console.log('\n🔨 Testing build...');
try {
  console.log('Running: npm run build');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check dist folder
console.log('\n📁 Checking build output...');
const distFiles = [
  'dist/index.html',
  'dist/assets'
];

for (const file of distFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file} - Missing from build output`);
    process.exit(1);
  }
}

// Check for validation key files in dist
console.log('\n🔑 Checking validation keys in build output...');
const distValidationFiles = [
  'dist/validation-key.txt',
  'dist/flappypi.fun-validation-key.txt',
  'dist/.well-known/flappypi.fun-validation-key.txt'
];

for (const file of distValidationFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file} - Missing from build output`);
    process.exit(1);
  }
}

console.log('\n🎉 All tests passed! Build is ready for deployment.');
console.log('\n📋 Next steps:');
console.log('1. Run: vercel --prod');
console.log('2. Test validation keys at:');
console.log('   - https://flappypi.fun/validation-key.txt');
console.log('   - https://flappypi.fun/flappypi.fun-validation-key.txt');
console.log('   - https://flappypi.fun/.well-known/flappypi.fun-validation-key.txt');
console.log('3. Test the app in Pi Browser'); 