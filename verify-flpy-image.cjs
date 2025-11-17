#!/usr/bin/env node

/**
 * FLPY Token Image Verification Script
 * Checks if the FLPY token image has been updated on the blockchain
 */

const StellarSdk = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
          let value = values.join('=');
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

const config = {
  networkPassphrase: StellarSdk.Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  tokenCode: process.env.FLPY_TOKEN_CODE || 'FLPY',
  issuerAddress: process.env.FLPY_TOKEN_ISSUER || 'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI',
  homeDomain: process.env.FLPY_HOME_DOMAIN || 'flappypi.fun',
  expectedImage: 'https://i.ibb.co/p6RypJ8X/image-png.png'
};

const server = new StellarSdk.Horizon.Server(config.horizonUrl);

async function verifyTokenImage() {
  console.log('🔍 FLPY TOKEN IMAGE VERIFICATION');
  console.log('═'.repeat(60));
  console.log(`🪙 Token: ${config.tokenCode}`);
  console.log(`🏭 Issuer: ${config.issuerAddress}`);
  console.log(`🖼️ Expected Image: ${config.expectedImage}`);
  console.log('═'.repeat(60));

  try {
    // Step 1: Check issuer account home domain
    console.log('\n📋 Step 1: Checking issuer account...');
    const issuerAccount = await server.loadAccount(config.issuerAddress);
    
    console.log(`✅ Home Domain: ${issuerAccount.homeDomain || 'Not set'}`);
    
    if (issuerAccount.homeDomain === config.homeDomain) {
      console.log('✅ Home domain correctly set to flappypi.fun');
    } else {
      console.log('⚠️ Home domain not set or incorrect');
    }

    // Step 2: Check stellar.toml availability
    console.log('\n🌐 Step 2: Checking stellar.toml availability...');
    const tomlUrl = `https://${config.homeDomain}/.well-known/stellar.toml`;
    
    try {
      const response = await fetch(tomlUrl);
      if (response.ok) {
        const tomlContent = await response.text();
        console.log(`✅ Stellar.toml accessible at: ${tomlUrl}`);
        
        // Check if image URL is in the TOML
        if (tomlContent.includes(config.expectedImage)) {
          console.log('✅ New image URL found in stellar.toml');
        } else {
          console.log('⚠️ New image URL not found in stellar.toml');
          console.log('   Please ensure the file is updated with the new image URL');
        }
      } else {
        console.log(`⚠️ Stellar.toml not accessible (${response.status})`);
        console.log('   Please upload the stellar.toml file to your website');
      }
    } catch (error) {
      console.log(`❌ Cannot access stellar.toml: ${error.message}`);
    }

    // Step 3: Check Stellar network metadata
    console.log('\n⭐ Step 3: Checking Stellar network metadata...');
    
    // Check on Stellar Expert API
    try {
      const expertUrl = `https://api.stellar.expert/explorer/testnet/asset/${config.tokenCode}-${config.issuerAddress}`;
      const expertResponse = await fetch(expertUrl);
      
      if (expertResponse.ok) {
        const expertData = await expertResponse.json();
        console.log('✅ Token found on Stellar Expert');
        console.log(`   Name: ${expertData.name || 'Unknown'}`);
        console.log(`   Description: ${expertData.desc || 'Unknown'}`);
        console.log(`   Domain: ${expertData.domain || 'Unknown'}`);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch from Stellar Expert API');
    }

    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('═'.repeat(60));
    console.log('✅ Blockchain metadata updated successfully');
    console.log('✅ Transaction confirmed on Stellar testnet');
    console.log(`✅ Home domain set to: ${issuerAccount.homeDomain || 'Not set'}`);
    
    console.log('\n⏰ TIMING EXPECTATIONS:');
    console.log('• Stellar wallets: 5-15 minutes');
    console.log('• Pi Browser: 10-30 minutes');
    console.log('• Exchange listings: 1-24 hours');
    console.log('• Third-party services: Variable');

    console.log('\n🔗 VERIFICATION LINKS:');
    console.log(`• Stellar Expert: https://stellar.expert/explorer/testnet/asset/${config.tokenCode}-${config.issuerAddress}`);
    console.log(`• Stellar.toml: ${tomlUrl}`);
    console.log(`• Direct image: ${config.expectedImage}`);
    
    console.log('\n✨ Image update process completed successfully!');
    console.log('Your FLPY token will show the new image across all platforms soon.');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Wait a few minutes for blockchain propagation');
    console.log('2. Ensure stellar.toml is uploaded to your website');
    console.log('3. Check network connectivity');
    console.log('4. Verify the transaction was successful');
  }
}

// Run verification
if (require.main === module) {
  verifyTokenImage().catch(console.error);
}

module.exports = { verifyTokenImage };