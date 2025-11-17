#!/usr/bin/env node

/**
 * FLPY Token Complete Setup Script - Robust Version
 * Includes retry logic and better error handling
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
  networkPassphrase: StellarSdk.Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  friendbotUrl: 'https://friendbot.stellar.org',
  
  tokenCode: process.env.FLPY_TOKEN_CODE || 'FLPY',
  issuerSeed: process.env.FLPY_TOKEN_ISSUER_SEED || 'SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I',
  distributionSeed: process.env.FLPY_DISTRIBUTION_SEED || 'SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM',
  
  totalSupply: process.env.FLPY_TOKEN_AMOUNT || '21000000',
  homeDomain: process.env.FLPY_HOME_DOMAIN || 'flappypi.fun',
  tokenName: process.env.FLPY_TOKEN_NAME || 'Flappy Pi Team',
  tokenDesc: process.env.FLPY_TOKEN_DESC || 'This is a test token that is created as an example and has no value.',
  tokenImage: process.env.FLPY_TOKEN_IMAGE || 'https://flappypi.fun/image.png'
};

const server = new StellarSdk.Horizon.Server(config.horizonUrl);

class RobustFlappyTokenCreator {
  constructor() {
    this.issuerKeypair = StellarSdk.Keypair.fromSecret(config.issuerSeed);
    this.distributionKeypair = StellarSdk.Keypair.fromSecret(config.distributionSeed);
    this.baseFee = StellarSdk.BASE_FEE;
    
    console.log('🎮 Robust Flappy Pi Token Creator Initialized');
    console.log(`🏭 Issuer: ${this.issuerKeypair.publicKey()}`);
    console.log(`💳 Distribution: ${this.distributionKeypair.publicKey()}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryOperation(operation, maxRetries = 5, delay = 3000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.log(`⚠️ Attempt ${i + 1}/${maxRetries} failed: ${error.message}`);
        if (i === maxRetries - 1) throw error;
        
        console.log(`⏳ Waiting ${delay/1000} seconds before retry...`);
        await this.sleep(delay);
        delay *= 1.5; // Exponential backoff
      }
    }
  }

  async waitForAccount(publicKey, label) {
    console.log(`⏳ Waiting for ${label} to be available...`);
    
    return this.retryOperation(async () => {
      const account = await server.loadAccount(publicKey);
      console.log(`✅ ${label} is now available`);
      return account;
    }, 10, 2000);
  }

  async fundAccount(publicKey, label) {
    try {
      console.log(`💰 Funding ${label}: ${publicKey}`);
      
      const response = await fetch(`${config.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${label} funded successfully!`);
        console.log(`   Transaction: ${result.hash}`);
        
        // Wait for account to be available
        await this.waitForAccount(publicKey, label);
        
        return true;
      } else {
        console.log(`❌ Failed to fund ${label}: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error funding ${label}:`, error.message);
      return false;
    }
  }

  async setupIssuerAccount() {
    console.log('\n🏭 Setting up Issuer Account...');
    
    return this.retryOperation(async () => {
      const account = await server.loadAccount(this.issuerKeypair.publicKey());
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: this.baseFee,
        networkPassphrase: config.networkPassphrase,
        timebounds: await server.fetchTimebounds(100)
      })
      .addOperation(StellarSdk.Operation.setOptions({
        homeDomain: config.homeDomain
      }))
      .build();
      
      transaction.sign(this.issuerKeypair);
      
      const result = await server.submitTransaction(transaction);
      console.log('✅ Issuer account configured with home domain');
      console.log(`   Transaction: ${result.hash}`);
      
      return result;
    });
  }

  async createTokenAndTrustline() {
    console.log('\n🪙 Creating FLPY Token and Trustline...');
    
    return this.retryOperation(async () => {
      const flpyAsset = new StellarSdk.Asset(config.tokenCode, this.issuerKeypair.publicKey());
      const distributionAccount = await server.loadAccount(this.distributionKeypair.publicKey());
      
      const transaction = new StellarSdk.TransactionBuilder(distributionAccount, {
        fee: this.baseFee,
        networkPassphrase: config.networkPassphrase,
        timebounds: await server.fetchTimebounds(100)
      })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: flpyAsset,
        limit: config.totalSupply
      }))
      .build();
      
      transaction.sign(this.distributionKeypair);
      
      const result = await server.submitTransaction(transaction);
      console.log('✅ Trustline created successfully');
      console.log(`   Transaction: ${result.hash}`);
      
      return { flpyAsset, result };
    });
  }

  async mintTokens(flpyAsset) {
    console.log('\n💰 Minting FLPY Tokens...');
    
    return this.retryOperation(async () => {
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());
      
      const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
        fee: this.baseFee,
        networkPassphrase: config.networkPassphrase,
        timebounds: await server.fetchTimebounds(100)
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: this.distributionKeypair.publicKey(),
        asset: flpyAsset,
        amount: config.totalSupply
      }))
      .build();
      
      transaction.sign(this.issuerKeypair);
      
      const result = await server.submitTransaction(transaction);
      console.log(`✅ Minted ${config.totalSupply} FLPY tokens successfully`);
      console.log(`   Transaction: ${result.hash}`);
      
      return result;
    });
  }

  async checkAccountBalance(publicKey, label) {
    try {
      const account = await server.loadAccount(publicKey);
      console.log(`\n💳 ${label} Balance:`);
      account.balances.forEach(balance => {
        if (balance.asset_type === 'native') {
          console.log(`   XLM: ${balance.balance}`);
        } else {
          console.log(`   ${balance.asset_code}: ${balance.balance}`);
        }
      });
      return account.balances;
    } catch (error) {
      console.log(`❌ Could not check ${label} balance:`, error.message);
      return [];
    }
  }

  async fullSetup() {
    try {
      console.log('🚀 STARTING ROBUST FLAPPY PI TOKEN SETUP');
      console.log('═'.repeat(80));
      
      // Step 1: Fund accounts
      console.log('\n📋 STEP 1: FUND ACCOUNTS');
      console.log('─'.repeat(40));
      
      const issuerFunded = await this.fundAccount(this.issuerKeypair.publicKey(), 'Issuer Account');
      const distributionFunded = await this.fundAccount(this.distributionKeypair.publicKey(), 'Distribution Account');
      
      if (!issuerFunded || !distributionFunded) {
        throw new Error('Failed to fund accounts');
      }
      
      // Step 2: Wait a bit more for network propagation
      console.log('\n⏳ Waiting for network synchronization...');
      await this.sleep(5000);
      
      // Step 3: Setup issuer account
      console.log('\n📋 STEP 2: CONFIGURE ISSUER');
      console.log('─'.repeat(40));
      await this.setupIssuerAccount();
      
      // Step 4: Create token and trustline
      console.log('\n📋 STEP 3: CREATE TOKEN');
      console.log('─'.repeat(40));
      const { flpyAsset } = await this.createTokenAndTrustline();
      
      // Step 5: Mint tokens
      console.log('\n📋 STEP 4: MINT TOKENS');
      console.log('─'.repeat(40));
      await this.mintTokens(flpyAsset);
      
      // Step 6: Verify setup
      console.log('\n📋 STEP 5: VERIFY SETUP');
      console.log('─'.repeat(40));
      await this.checkAccountBalance(this.issuerKeypair.publicKey(), 'Issuer');
      await this.checkAccountBalance(this.distributionKeypair.publicKey(), 'Distribution');
      
      console.log('\n🎉 SUCCESS! FLAPPY PI TOKEN SETUP COMPLETE');
      console.log('═'.repeat(80));
      console.log(`🪙 Token Code: ${config.tokenCode}`);
      console.log(`🏭 Issuer: ${this.issuerKeypair.publicKey()}`);
      console.log(`💳 Distribution: ${this.distributionKeypair.publicKey()}`);
      console.log(`💰 Total Supply: ${config.totalSupply} FLPY`);
      console.log(`🏠 Home Domain: ${config.homeDomain}`);
      console.log('═'.repeat(80));
      
      console.log('\n💡 Next Steps:');
      console.log('1. Run: node check-flpy-token-status.cjs');
      console.log('2. Update your pi.toml file');
      console.log('3. Set up trustlines for game wallets if needed');
      
      return true;
      
    } catch (error) {
      console.error('\n❌ SETUP FAILED:', error.message);
      console.error('Full error:', error);
      return false;
    }
  }
}

async function main() {
  const creator = new RobustFlappyTokenCreator();
  const success = await creator.fullSetup();
  
  if (success) {
    console.log('\n✨ FLPY token setup completed successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 FLPY token setup failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = RobustFlappyTokenCreator;