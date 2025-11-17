#!/usr/bin/env node

/**
 * Logo Update Verification Script
 * Verifies new Flappy Pi logo is properly implemented
 */

const fs = require('fs');

console.log('🔍 Flappy Pi Logo Update Verification');
console.log('='.repeat(40));

// Check current flpy.png
if (fs.existsSync('public/flpy.png')) {
    const stats = fs.statSync('public/flpy.png');
    console.log('📁 Current Logo Status:');
    console.log(`   ✅ File exists: public/flpy.png`);
    console.log(`   📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📅 Last modified: ${stats.mtime.toLocaleDateString()}`);
    
    // Check if it's been recently updated (within last hour)
    const now = new Date();
    const fileTime = new Date(stats.mtime);
    const hoursDiff = (now - fileTime) / (1000 * 60 * 60);
    
    if (hoursDiff < 1) {
        console.log('   🆕 Recently updated (within last hour)');
    } else {
        console.log('   ⏰ Last updated more than 1 hour ago');
    }
} else {
    console.log('❌ public/flpy.png not found!');
}

// Verify pi.toml configuration
try {
    const piToml = fs.readFileSync('public/.well-known/pi.toml', 'utf8');
    if (piToml.includes('https://flappypi.fun/flpy.png')) {
        console.log('✅ pi.toml correctly references flpy.png');
    } else {
        console.log('❌ pi.toml configuration error');
    }
} catch (error) {
    console.log('❌ Could not read pi.toml');
}

// Check git status for uncommitted changes
console.log('\n📦 Git Status:');
try {
    const { execSync } = require('child_process');
    const gitStatus = execSync('git status --porcelain public/flpy.png', { encoding: 'utf8' }).trim();
    
    if (gitStatus) {
        console.log('⚠️  public/flpy.png has uncommitted changes');
        console.log('   📋 Run: git add public/flpy.png && git commit -m "Update logo" && git push');
    } else {
        console.log('✅ Logo changes committed');
    }
} catch (error) {
    console.log('ℹ️  Could not check git status');
}

console.log('\n🌐 Deployment URLs:');
console.log('Logo: https://flappypi.fun/flpy.png');
console.log('Token metadata: https://flappypi.fun/.well-known/pi.toml');

console.log('\n✅ Verification complete!');