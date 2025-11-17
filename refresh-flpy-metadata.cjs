#!/usr/bin/env node

/**
 * FLPY Token Metadata Refresh Script
 * Updates the FLPY token metadata on Pi Network blockchain with new image URL
 * This script updates the token issuer's home domain metadata to refresh the image
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

// Configuration
const config = {
  // Network Configuration
  networkPassphrase: StellarSdk.Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  
  // FLPY Token Configuration
  tokenCode: process.env.FLPY_TOKEN_CODE || 'FLPY',
  issuerAddress: process.env.FLPY_TOKEN_ISSUER || 'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI',
  issuerSeed: process.env.FLPY_TOKEN_ISSUER_SEED || process.env.PI_WALLET_PRIVATE_SEED,
  homeDomain: process.env.FLPY_HOME_DOMAIN || 'flappypi.fun',
  
  // New token metadata
  newImageUrl: 'https://i.ibb.co/p6RypJ8X/image-png.png',
  tokenName: process.env.FLPY_TOKEN_NAME || 'Flappy Pi Team',
  tokenDesc: process.env.FLPY_TOKEN_DESC || 'This is a test token that is created as an example and has no value.',
  maxSupply: process.env.FLPY_TOKEN_AMOUNT || '21000000'
};

console.log('🔄 FLPY TOKEN METADATA REFRESH');
console.log('═'.repeat(80));
console.log(`🪙 Token Code: ${config.tokenCode}`);
console.log(`🏭 Issuer: ${config.issuerAddress}`);
console.log(`🌐 Network: ${config.networkPassphrase === StellarSdk.Networks.MAINNET ? 'Mainnet' : 'Testnet'}`);
console.log(`🏠 Home Domain: ${config.homeDomain}`);
console.log(`🖼️ New Image: ${config.newImageUrl}`);
console.log('═'.repeat(80));

// Initialize Stellar server
const server = new StellarSdk.Horizon.Server(config.horizonUrl);

class TokenMetadataRefresher {
  constructor() {
    if (!config.issuerSeed) {
      throw new Error('❌ FLPY_TOKEN_ISSUER_SEED not found in environment variables');
    }
    
    try {
      this.issuerKeypair = StellarSdk.Keypair.fromSecret(config.issuerSeed);
      console.log(`✅ Loaded issuer keypair: ${this.issuerKeypair.publicKey()}`);
      
      if (this.issuerKeypair.publicKey() !== config.issuerAddress) {
        console.warn(`⚠️ Warning: Keypair public key doesn't match configured issuer address`);
        console.warn(`   Keypair: ${this.issuerKeypair.publicKey()}`);
        console.warn(`   Config:  ${config.issuerAddress}`);
      }
    } catch (error) {
      throw new Error(`❌ Invalid issuer seed: ${error.message}`);
    }
  }

  async updateTokenMetadata() {
    try {
      console.log('\n📋 Step 1: Loading issuer account...');
      
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());
      console.log(`✅ Issuer account loaded successfully`);
      console.log(`   Sequence: ${issuerAccount.sequenceNumber()}`);
      console.log(`   Current Home Domain: ${issuerAccount.homeDomain || 'Not set'}`);
      
      console.log('\n🔧 Step 2: Creating token metadata update transaction...');
      
      // Create transaction to update home domain
      const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: config.networkPassphrase
      })
        .addOperation(StellarSdk.Operation.setOptions({
          homeDomain: config.homeDomain
        }))
        .setTimeout(300) // 5 minutes timeout
        .build();
      
      console.log('✅ Transaction created with home domain update');
      
      console.log('\n🔐 Step 3: Signing transaction...');
      transaction.sign(this.issuerKeypair);
      console.log('✅ Transaction signed');
      
      console.log('\n📤 Step 4: Submitting transaction to blockchain...');
      const result = await server.submitTransaction(transaction);
      
      console.log('✅ Transaction submitted successfully!');
      console.log(`   Hash: ${result.hash}`);
      console.log(`   Ledger: ${result.ledger}`);
      console.log(`   Success: ${result.successful}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to update token metadata:', error.message);
      
      if (error.response?.data) {
        console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw error;
    }
  }

  async createUpdatedPiToml() {
    console.log('\n📝 Creating updated pi.toml file...');
    
    const tomlContent = `[[CURRENCIES]]
code="${config.tokenCode}"
issuer="${config.issuerAddress}"
name="${config.tokenName}"
desc="${config.tokenDesc}"
image="${config.newImageUrl}"

# Additional Token Information
[DOCUMENTATION]
ORG_NAME="Flappy Pi"
ORG_URL="https://${config.homeDomain}"
ORG_LOGO="${config.newImageUrl}"
ORG_DESCRIPTION="Flappy Pi is a blockchain-powered gaming platform on Pi Network, offering engaging gameplay with cryptocurrency rewards."
ORG_SUPPORT_EMAIL="support@${config.homeDomain}"

# Token Details
[[CURRENCIES.DISPLAY_DECIMALS]]
value=7

[[CURRENCIES.CONDITIONS]]
max_supply="${config.maxSupply}"
is_asset_anchored=false

[[CURRENCIES.METADATA]]
name="${config.tokenName}"
description="${config.tokenDesc}"
image="${config.newImageUrl}"
home_domain="${config.homeDomain}"
`;
    
    const tomlPath = path.join(__dirname, 'pi.toml');
    fs.writeFileSync(tomlPath, tomlContent);
    
    console.log(`✅ Updated pi.toml created at: ${tomlPath}`);
    console.log('📋 Content preview:');
    console.log(tomlContent);
    
    return tomlPath;
  }

  async uploadTomlToWebsite() {
    console.log('\n🌐 IMPORTANT: Upload pi.toml to your website');
    console.log('═'.repeat(60));
    console.log(`1. Upload the pi.toml file to: https://${config.homeDomain}/.well-known/stellar.toml`);
    console.log(`2. OR upload to: https://${config.homeDomain}/stellar.toml`);
    console.log('3. Ensure the file is publicly accessible');
    console.log('4. Verify CORS headers allow access from stellar.org');
    console.log('\n💡 You can test the URL in your browser:');
    console.log(`   https://${config.homeDomain}/.well-known/stellar.toml`);
  }

  async verifyMetadataUpdate() {
    console.log('\n🔍 Verifying metadata update...');
    
    try {
      // Wait a moment for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedAccount = await server.loadAccount(this.issuerKeypair.publicKey());
      console.log(`✅ Updated home domain: ${updatedAccount.homeDomain}`);
      
      if (updatedAccount.homeDomain === config.homeDomain) {
        console.log('✅ Home domain updated successfully!');
        return true;
      } else {
        console.log('⚠️ Home domain update not yet reflected');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error verifying update:', error.message);
      return false;
    }
  }

  async refreshTokenMetadata() {
    try {
      console.log('🚀 Starting FLPY token metadata refresh process...\n');
      
      // Step 1: Update blockchain metadata
      const txResult = await this.updateTokenMetadata();
      console.log('\n✅ Blockchain metadata updated successfully!');
      
      // Step 2: Create updated pi.toml
      await this.createUpdatedPiToml();
      
      // Step 3: Upload instructions
      await this.uploadTomlToWebsite();
      
      // Step 4: Verify update
      const verified = await this.verifyMetadataUpdate();
      
      console.log('\n🎉 METADATA REFRESH COMPLETE!');
      console.log('═'.repeat(80));
      console.log('✅ Blockchain transaction submitted');
      console.log('✅ Updated pi.toml file created');
      console.log(`${verified ? '✅' : '⏳'} Metadata update ${verified ? 'verified' : 'pending'}`);
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Upload the pi.toml file to your website');
      console.log('2. Wait 10-15 minutes for blockchain propagation');
      console.log('3. Check token appearance in Pi wallets and exchanges');
      console.log('4. Verify image displays correctly across platforms');
      
      console.log('\n🔗 Useful Links:');
      console.log(`   Pi.toml URL: https://${config.homeDomain}/.well-known/stellar.toml`);
      console.log(`   Transaction: https://stellar.expert/explorer/public/tx/${txResult.hash}`);
      console.log(`   Token Info: https://stellar.expert/explorer/public/asset/${config.tokenCode}-${config.issuerAddress}`);
      
      return {
        success: true,
        transactionHash: txResult.hash,
        verified: verified
      };
      
    } catch (error) {
      console.error('\n💥 Metadata refresh failed:', error.message);
      
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Verify issuer seed is correct in .env file');
      console.log('2. Ensure issuer account has sufficient XLM for fees');
      console.log('3. Check network connectivity');
      console.log('4. Confirm issuer account is not locked');
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Main execution
async function main() {
  try {
    const refresher = new TokenMetadataRefresher();
    const result = await refresher.refreshTokenMetadata();
    
    if (result.success) {
      console.log('\n🎯 SUCCESS: FLPY token metadata refresh completed!');
      process.exit(0);
    } else {
      console.log('\n❌ FAILURE: Could not refresh FLPY token metadata');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TokenMetadataRefresher;