#!/usr/bin/env node

/**
 * FLPY Trustline Creation Helper
 * Guide users through adding FLPY token to their Pi Wallet
 */

require('dotenv').config();

const FLPY_ISSUER = process.env.FLPY_TOKEN_ISSUER;

console.log('🤝 FLPY Trustline Setup Guide for Users');
console.log('='.repeat(45));

console.log('\n📱 How Users Add FLPY to Pi Wallet:');

console.log('\n🔹 Step 1: Open Pi Wallet');
console.log('   • Open Pi Browser → Pi Wallet');
console.log('   • Or use Pi Wallet app');

console.log('\n🔹 Step 2: Navigate to Assets');
console.log('   • Tap "Assets" or "Tokens" section');
console.log('   • Look for "Add Asset" or "+" button');

console.log('\n🔹 Step 3: Add FLPY Token');
console.log('   Option A - Search by Code:');
console.log('   • Search for "FLPY"');
console.log('   • Select FLPY token from results');
console.log('');
console.log('   Option B - Manual Entry:');
console.log('   • Select "Add Custom Asset"');
console.log(`   • Asset Code: FLPY`);
console.log(`   • Issuer Address: ${FLPY_ISSUER}`);

console.log('\n🔹 Step 4: Confirm Trustline');
console.log('   • Review asset details');
console.log('   • Confirm trustline creation');
console.log('   • Pay small network fee (usually ~0.01 PI)');

console.log('\n🔹 Step 5: Ready to Receive');
console.log('   • FLPY now appears in asset list');
console.log('   • Balance starts at 0.0000000 FLPY');
console.log('   • Ready to receive FLPY tokens!');

console.log('\n🎮 Integration with Flappy Pi Game:');

console.log('\n📋 Automated Trustline Flow:');
console.log('1. User authenticates with Pi Network');
console.log('2. Game checks if user has FLPY trustline');
console.log('3. If no trustline → prompt user to add FLPY');
console.log('4. User adds FLPY to wallet');
console.log('5. Game can now send FLPY rewards');

console.log('\n💻 Frontend Implementation:');
console.log('```javascript');
console.log('// Check if user has FLPY trustline');
console.log('const userAssets = await pi.getUser().assets;');
console.log('const hasFLPY = userAssets.some(asset => ');
console.log('  asset.code === "FLPY" && ');
console.log(`  asset.issuer === "${FLPY_ISSUER}"`);
console.log(');');
console.log('');
console.log('if (!hasFLPY) {');
console.log('  // Show trustline creation prompt');
console.log('  showAddFLPYDialog();');
console.log('}');
console.log('```');

console.log('\n🔗 Direct Links for Users:');
console.log('Pi Wallet Asset Discovery:');
console.log(`• Asset Code: FLPY`);
console.log(`• Issuer: ${FLPY_ISSUER}`);
console.log('• Network: Pi Testnet');

console.log('\n📊 Verification:');
console.log('Users can verify FLPY token details at:');
console.log('https://flappypi.fun/.well-known/pi.toml');

console.log('\n🎯 Marketing Messages for Users:');
console.log('"🎮 Add FLPY to your Pi Wallet to earn tokens playing Flappy Pi!"');
console.log('"💰 Collect FLPY rewards for high scores and achievements!"');
console.log('"🏆 Join the Flappy Pi community and start earning FLPY today!"');

console.log('\n✅ Once users add FLPY trustline, they can:');
console.log('• Receive FLPY from game rewards');
console.log('• Send/receive FLPY with other users');
console.log('• View FLPY balance in Pi Wallet');
console.log('• Use FLPY for in-game purchases');

console.log('\n🚀 FLPY trustline setup complete!');