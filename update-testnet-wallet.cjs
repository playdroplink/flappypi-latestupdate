#!/usr/bin/env node

/**
 * Update Testnet Wallet Configuration for Flappy Pi
 * Updates the .env file with the correct testnet wallet address and seed
 */

const fs = require('fs');
const path = require('path');

function updateTestnetWalletConfiguration() {
  console.log('💰 Updating Testnet Wallet Configuration...');
  console.log('================================================');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    return;
  }
  
  // Read current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Create backup
  const backupPath = path.join(process.cwd(), '.env.testnet-wallet.backup');
  fs.writeFileSync(backupPath, envContent);
  console.log('💾 Created backup: .env.testnet-wallet.backup');
  
  // Update wallet configurations
  const updates = [
    // Pi Network Wallet Configuration - TESTNET
    {
      from: 'PI_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"',
      to: 'PI_WALLET_ADDRESS="GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"'
    },
    {
      from: 'VITE_PI_WALLET_ADDRESS="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"',
      to: 'VITE_PI_WALLET_ADDRESS="GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"'
    },
    {
      from: 'PI_ACCOUNT_ID="GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ"',
      to: 'PI_ACCOUNT_ID="GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI"'
    }
  ];
  
  // Apply updates
  let updatedCount = 0;
  updates.forEach(update => {
    if (envContent.includes(update.from)) {
      envContent = envContent.replace(update.from, update.to);
      updatedCount++;
      console.log(`✅ Updated: ${update.from.split('=')[0]}`);
    } else {
      console.log(`⚠️  Not found: ${update.from.split('=')[0]}`);
    }
  });
  
  // Add testnet wallet seed (if not already present)
  if (!envContent.includes('PI_WALLET_SEED')) {
    const seedLine = '\n# Pi Network Wallet Seed - TESTNET\nPI_WALLET_SEED="SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I"\nVITE_PI_WALLET_SEED="SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I"';
    
    // Find a good place to insert the seed (after wallet address)
    const insertPoint = envContent.indexOf('PI_ACCOUNT_ID=');
    if (insertPoint !== -1) {
      const endOfLine = envContent.indexOf('\n', insertPoint);
      if (endOfLine !== -1) {
        envContent = envContent.slice(0, endOfLine) + seedLine + envContent.slice(endOfLine);
        console.log('✅ Added: PI_WALLET_SEED');
        updatedCount++;
      }
    }
  }
  
  // Write updated content
  fs.writeFileSync(envPath, envContent);
  
  console.log('================================================');
  console.log('🎉 TESTNET WALLET CONFIGURATION UPDATED!');
  console.log('================================================');
  console.log(`✅ Updated ${updatedCount} configurations`);
  console.log('✅ Testnet Wallet Address: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
  console.log('✅ Testnet Wallet Seed: SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I');
  console.log('✅ Account ID: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
  console.log('================================================');
  
  console.log('📋 Testnet Wallet Configuration:');
  console.log('- Wallet Address: GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI');
  console.log('- Wallet Seed: SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I');
  console.log('- Network: Testnet');
  console.log('- API URL: https://api.testnet.minepi.com/v2');
  console.log('- Platform API URL: https://api.testnet.minepi.com');
  
  console.log('🔧 Next Steps:');
  console.log('1. Test Pi Network authentication with testnet wallet');
  console.log('2. Test Pi Network payments with testnet wallet');
  console.log('3. Verify testnet wallet integration');
  console.log('4. Test on production domain: https://www.flappypi.fun');
  
  console.log('⚠️  IMPORTANT: Keep your wallet seed secure and never commit it to version control!');
}

updateTestnetWalletConfiguration();
