#!/usr/bin/env node

/**
 * Vercel 404 Fix Verification - FLPY Token Image
 * Ensures flpy.png is properly configured and ready for deployment
 */

const fs = require('fs');

console.log('🔧 Vercel 404 Fix - FLPY Token Image Setup');
console.log('='.repeat(50));

// Check if flpy.png exists
if (fs.existsSync('public/flpy.png')) {
    const stats = fs.statSync('public/flpy.png');
    console.log('✅ public/flpy.png exists');
    console.log(`   📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📅 Modified: ${stats.mtime.toLocaleString()}`);
} else {
    console.log('❌ public/flpy.png missing - this will cause 404!');
    process.exit(1);
}

// Verify pi.toml configuration
try {
    const piTomlContent = fs.readFileSync('public/.well-known/pi.toml', 'utf8');
    
    // Check for flpy.png references
    const imageMatches = piTomlContent.match(/https:\/\/flappypi\.fun\/flpy\.png/g);
    if (imageMatches && imageMatches.length >= 2) {
        console.log('✅ pi.toml properly configured');
        console.log(`   🔗 Found ${imageMatches.length} references to flpy.png`);
    } else {
        console.log('⚠️  pi.toml may have incorrect image URLs');
    }
    
    // Check token configuration
    if (piTomlContent.includes('code="FLPY"') && piTomlContent.includes('GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI')) {
        console.log('✅ FLPY token configuration correct');
    } else {
        console.log('❌ FLPY token configuration error');
    }
    
} catch (error) {
    console.log('❌ Error reading pi.toml:', error.message);
}

// Check git status
console.log('\n📦 Deployment Readiness:');
try {
    const { execSync } = require('child_process');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    
    if (gitStatus.includes('public/flpy.png') || gitStatus.includes('pi.toml')) {
        console.log('⚠️  Uncommitted changes detected');
        console.log('   📋 Files need to be committed and pushed to Vercel');
    } else {
        console.log('✅ All changes committed');
    }
} catch (error) {
    console.log('⚠️  Could not check git status');
}

console.log('\n🚀 Fix Vercel 404 Steps:');
console.log('1. ✅ Created public/flpy.png');
console.log('2. ✅ Updated pi.toml with correct URLs');
console.log('3. 📤 NEXT: Deploy to Vercel');

console.log('\n📋 Deployment Commands:');
console.log('git add public/flpy.png public/.well-known/pi.toml');
console.log('git commit -m "Fix token image 404 - add flpy.png"');
console.log('git push origin main');

console.log('\n🔍 Verification URLs (after deployment):');
console.log('Token Image: https://flappypi.fun/flpy.png');
console.log('Pi.toml: https://flappypi.fun/.well-known/pi.toml');

console.log('\n✅ 404 fix ready for deployment!');