#!/usr/bin/env node

/**
 * Pi Network API Key and Validation Key Update Verification
 * Verifies all API keys and validation keys have been updated correctly
 */

const fs = require('fs');
const path = require('path');

// Expected values
const EXPECTED_API_KEY = "zrt9rwcjrdaejytlu72ha0yi2czvljx6geuwphzueaeybqsyboixukixy0cmogmo";
const EXPECTED_VALIDATION_KEY = "94e29cc9c70b87c8fc91e496ac630d23664bff7082cca3ad9d6466bba1aa2902caa46a8eb82a64437d272dbcd329c763679c85cfcba91b95e6fb5b4a6f17b2ce";

console.log('🔍 Pi Network API Key & Validation Key Update Verification');
console.log('='.repeat(60));

// Verify .env file
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    
    // Check API keys
    const piApiKey = envContent.match(/PI_API_KEY="([^"]+)"/);
    const piNetworkApiKey = envContent.match(/PI_NETWORK_API_KEY="([^"]+)"/);
    const piServerApiKey = envContent.match(/PI_SERVER_API_KEY="([^"]+)"/);
    const reactApiKey = envContent.match(/REACT_APP_PI_API_KEY="([^"]+)"/);
    
    // Check validation keys
    const viteValidationKey = envContent.match(/VITE_PI_VALIDATION_KEY="([^"]+)"/);
    const reactValidationKey = envContent.match(/REACT_APP_PI_VALIDATION_KEY="([^"]+)"/);
    
    console.log('📄 .env File Verification:');
    console.log(`  PI_API_KEY: ${piApiKey?.[1] === EXPECTED_API_KEY ? '✅' : '❌'} ${piApiKey?.[1] === EXPECTED_API_KEY ? 'UPDATED' : 'NEEDS UPDATE'}`);
    console.log(`  PI_NETWORK_API_KEY: ${piNetworkApiKey?.[1] === EXPECTED_API_KEY ? '✅' : '❌'} ${piNetworkApiKey?.[1] === EXPECTED_API_KEY ? 'UPDATED' : 'NEEDS UPDATE'}`);
    console.log(`  PI_SERVER_API_KEY: ${piServerApiKey?.[1] === EXPECTED_API_KEY ? '✅' : '❌'} ${piServerApiKey?.[1] === EXPECTED_API_KEY ? 'UPDATED' : 'NEEDS UPDATE'}`);
    console.log(`  REACT_APP_PI_API_KEY: ${reactApiKey?.[1] === EXPECTED_API_KEY ? '✅' : '❌'} ${reactApiKey?.[1] === EXPECTED_API_KEY ? 'UPDATED' : 'NEEDS UPDATE'}`);
    console.log(`  VITE_PI_VALIDATION_KEY: ${viteValidationKey?.[1] === EXPECTED_VALIDATION_KEY ? '✅' : '❌'} ${viteValidationKey?.[1] === EXPECTED_VALIDATION_KEY ? 'UPDATED' : 'NEEDS UPDATE'}`);
    console.log(`  REACT_APP_PI_VALIDATION_KEY: ${reactValidationKey?.[1] === EXPECTED_VALIDATION_KEY ? '✅' : '❌'} ${reactValidationKey?.[1] === EXPECTED_VALIDATION_KEY ? 'UPDATED' : 'NEEDS UPDATE'}`);
    
} catch (error) {
    console.log('❌ Error reading .env file:', error.message);
}

// Verify validation key files
const validationKeyFiles = [
    'public/.well-known/flappypi.fun-validation-key.txt',
    'public/.well-known/flappypi2807-validation-key.txt',
    'public/.well-known/flappypi2807.pinet.com-validation-key.txt'
];

console.log('\n🔑 Validation Key Files Verification:');
validationKeyFiles.forEach(filePath => {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8').trim();
            const isCorrect = content === EXPECTED_VALIDATION_KEY;
            console.log(`  ${path.basename(filePath)}: ${isCorrect ? '✅ UPDATED' : '❌ NEEDS UPDATE'}`);
            if (!isCorrect) {
                console.log(`    Expected: ${EXPECTED_VALIDATION_KEY.slice(0, 32)}...`);
                console.log(`    Found:    ${content.slice(0, 32)}...`);
            }
        } else {
            console.log(`  ${path.basename(filePath)}: ❌ FILE NOT FOUND`);
        }
    } catch (error) {
        console.log(`  ${path.basename(filePath)}: ❌ ERROR - ${error.message}`);
    }
});

console.log('\n📋 Summary:');
console.log(`  New API Key: ${EXPECTED_API_KEY.slice(0, 16)}...`);
console.log(`  New Validation Key: ${EXPECTED_VALIDATION_KEY.slice(0, 32)}...`);
console.log('\n🔄 Next Steps:');
console.log('  1. Restart any running development servers');
console.log('  2. Clear browser cache for Pi authentication');
console.log('  3. Test Pi Network authentication with new keys');

console.log('\n✅ API Key and Validation Key update verification complete!');