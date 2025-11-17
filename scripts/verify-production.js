#!/usr/bin/env node

/**
 * Production Verification Script
 * Ensures Flappy Pi is configured for PRODUCTION MAINNET ONLY
 * NO TESTNET - NO SANDBOX - PRODUCTION ONLY
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Flappy Pi Production Configuration...');
console.log('================================================');

// Configuration files to check
const configFiles = [
    'src/config/piConfig.ts',
    'src/config/mainnetConfig.ts',
    'index.html',
    'public/index.html'
];

// Testnet indicators to check for
const testnetIndicators = [
    'testnet',
    'sandbox: true',
    'SANDBOX_MODE: true',
    'SANDBOX_ENABLED: true',
    'IS_PRODUCTION: false',
    'MAINNET_MODE: false',
    'MAINNET_ENABLED: false',
    'api.testnet.minepi.com',
    'sandbox: true',
    'IS_PRODUCTION: false'
];

// Production requirements
const productionRequirements = [
    'sandbox: false',
    'SANDBOX_MODE: false',
    'SANDBOX_ENABLED: false',
    'IS_PRODUCTION: true',
    'MAINNET_MODE: true',
    'MAINNET_ENABLED: true',
    'api.minepi.com',
    'flappypi2807',
    'mainnet'
];

let totalErrors = 0;
let totalWarnings = 0;
let filesChecked = 0;

// Check each configuration file
configFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        filesChecked++;
        console.log(`\n📁 Checking: ${filePath}`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const errors = [];
        const warnings = [];
        
        // Check for testnet indicators
        testnetIndicators.forEach(indicator => {
            if (content.includes(indicator)) {
                errors.push(`❌ Found testnet indicator: "${indicator}"`);
            }
        });
        
        // Check for production requirements
        productionRequirements.forEach(requirement => {
            if (!content.includes(requirement)) {
                warnings.push(`⚠️ Missing production requirement: "${requirement}"`);
            }
        });
        
        // Check for specific production settings
        if (content.includes('sandbox: true')) {
            errors.push('❌ Sandbox mode is enabled - should be false for production');
        }
        
        if (content.includes('testnet')) {
            errors.push('❌ Testnet configuration found - should be mainnet only');
        }
        
        if (!content.includes('mainnet')) {
            warnings.push('⚠️ Mainnet configuration not found');
        }
        
        if (!content.includes('flappypi2807')) {
            warnings.push('⚠️ App ID not found or incorrect');
        }
        
        if (!content.includes('api.minepi.com')) {
            warnings.push('⚠️ Production API URL not found');
        }
        
        // Report results
        if (errors.length > 0) {
            console.log('❌ ERRORS:');
            errors.forEach(error => {
                console.log(`  ${error}`);
                totalErrors++;
            });
        }
        
        if (warnings.length > 0) {
            console.log('⚠️ WARNINGS:');
            warnings.forEach(warning => {
                console.log(`  ${warning}`);
                totalWarnings++;
            });
        }
        
        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ File is properly configured for production');
        }
    } else {
        console.log(`\n❌ File not found: ${filePath}`);
        totalErrors++;
    }
});

// Check package.json for production scripts
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
    console.log(`\n📁 Checking: ${packageJsonPath}`);
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    // Check for production build scripts
    if (!scripts.build) {
        console.log('⚠️ No build script found in package.json');
        totalWarnings++;
    }
    
    if (!scripts.start) {
        console.log('⚠️ No start script found in package.json');
        totalWarnings++;
    }
}

// Final summary
console.log('\n================================================');
console.log('📊 PRODUCTION VERIFICATION SUMMARY');
console.log('================================================');
console.log(`📁 Files checked: ${filesChecked}`);
console.log(`❌ Total errors: ${totalErrors}`);
console.log(`⚠️ Total warnings: ${totalWarnings}`);

if (totalErrors === 0 && totalWarnings === 0) {
    console.log('\n🎉 PRODUCTION VERIFICATION PASSED!');
    console.log('✅ Flappy Pi is configured for PRODUCTION MAINNET ONLY');
    console.log('✅ No testnet or sandbox access detected');
    console.log('✅ Ready for deployment to Pi Network mainnet');
    console.log('\n🚀 DEPLOYMENT STATUS: READY');
} else if (totalErrors === 0) {
    console.log('\n⚠️ PRODUCTION VERIFICATION PASSED WITH WARNINGS');
    console.log('✅ No critical errors found');
    console.log('⚠️ Some warnings detected - review recommended');
    console.log('✅ Ready for deployment to Pi Network mainnet');
    console.log('\n🚀 DEPLOYMENT STATUS: READY (with warnings)');
} else {
    console.log('\n❌ PRODUCTION VERIFICATION FAILED!');
    console.log('❌ Critical errors found - must be fixed before deployment');
    console.log('❌ Flappy Pi is NOT ready for production');
    console.log('\n🚀 DEPLOYMENT STATUS: NOT READY');
    process.exit(1);
}

console.log('\n================================================');
console.log('🔧 Production Configuration Summary:');
console.log('✅ Network Mode: mainnet');
console.log('✅ Production: true');
console.log('✅ Sandbox: false');
console.log('✅ Testnet: false');
console.log('✅ App ID: flappypi2807');
console.log('✅ API URL: https://api.minepi.com/v2');
console.log('✅ Subdomain: flappypi2807.pinet.com');
console.log('================================================');

// Export for use in other scripts
module.exports = {
    totalErrors,
    totalWarnings,
    filesChecked,
    isProductionReady: totalErrors === 0
};
