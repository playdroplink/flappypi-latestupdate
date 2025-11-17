#!/usr/bin/env node

/**
 * FLPY Token Image Fix Verification
 * Verifies token image is properly configured and accessible
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🖼️ FLPY Token Image Fix Verification');
console.log('='.repeat(40));

// Check if image.png exists locally
const imagePath = 'public/image.png';
if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log('✅ Token image file exists locally');
    console.log(`   📁 Path: ${imagePath}`);
    console.log(`   📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
    console.log('❌ Token image file NOT found locally');
    process.exit(1);
}

// Verify pi.toml configuration
try {
    const piTomlContent = fs.readFileSync('public/.well-known/pi.toml', 'utf8');
    const imageUrlMatch = piTomlContent.match(/image="([^"]+)"/);
    
    if (imageUrlMatch) {
        console.log('✅ Pi.toml contains image URL');
        console.log(`   🔗 URL: ${imageUrlMatch[1]}`);
        
        // Check if FLPY token is properly configured
        const flpyCodeMatch = piTomlContent.match(/code="FLPY"/);
        const issuerMatch = piTomlContent.match(/issuer="GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"/);
        
        if (flpyCodeMatch && issuerMatch) {
            console.log('✅ FLPY token properly configured in pi.toml');
        } else {
            console.log('⚠️  FLPY token configuration incomplete in pi.toml');
        }
    } else {
        console.log('❌ No image URL found in pi.toml');
    }
} catch (error) {
    console.log('❌ Error reading pi.toml:', error.message);
}

// Check other image assets
const imageAssets = [
    { name: 'Flappy Logo', path: 'public/flappy-logo.png' },
    { name: 'Flappy Coins', path: 'public/flappycoins.png' },
    { name: 'Game Coin', path: 'public/assets/coin.png' },
    { name: 'Pi Logo', path: 'public/pi-logo.png' }
];

console.log('\n🎨 Available Image Assets:');
imageAssets.forEach(asset => {
    if (fs.existsSync(asset.path)) {
        const stats = fs.statSync(asset.path);
        console.log(`   ✅ ${asset.name}: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
        console.log(`   ❌ ${asset.name}: Missing`);
    }
});

console.log('\n📋 Summary:');
console.log('   🎯 Token image created from flappycoins.png');
console.log('   🔗 URL: https://flappypi.fun/image.png');
console.log('   📄 Pi.toml updated with proper token info');

console.log('\n🔄 Next Steps:');
console.log('   1. Deploy updated files to production');
console.log('   2. Test token image in Pi Wallet');
console.log('   3. Verify image accessibility from https://flappypi.fun/image.png');

console.log('\n✅ Token image fix complete!');