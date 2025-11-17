#!/usr/bin/env node

/**
 * FLPY Token Complete Setup Script
 * 1. Fund accounts using Friendbot (Testnet)
 * 2. Create FLPY token
 * 3. Set up trustlines
 * 4. Mint and distribute tokens
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
  issuerSeed: process.env.FLPY_TOKEN_ISSUER_SEED || 'SCWWOFM5VPZCKWVGHPCC4FFQQPXLFKLTDPDURM4BKGFRJ7QVAXODENLH',
  distributionSeed: process.env.FLPY_DISTRIBUTION_SEED || 'SDILUY6GMPHBZFYXJ64P5DK2TPZFNCLEZKHFFS423RACFLKORGP3DPGJ',
  
  totalSupply: process.env.FLPY_TOKEN_AMOUNT || '21000000',
  homeDomain: process.env.FLPY_HOME_DOMAIN || 'flappypi.fun',
  tokenName: process.env.FLPY_TOKEN_NAME || 'Flappy Pi Team',
  tokenDesc: process.env.FLPY_TOKEN_DESC || 'This is a test token that is created as an example and has no value.',
  tokenImage: process.env.FLPY_TOKEN_IMAGE || 'https://flappypi.fun/image.png'
};

const server = new StellarSdk.Horizon.Server(config.horizonUrl);

class FlappyTokenCreator {
  constructor() {
    this.issuerKeypair = StellarSdk.Keypair.fromSecret(config.issuerSeed);
    this.distributionKeypair = StellarSdk.Keypair.fromSecret(config.distributionSeed);
    this.baseFee = StellarSdk.BASE_FEE;
    
    console.log('🎮 Flappy Pi Token Creator Initialized');
    console.log(`🏭 Issuer: ${this.issuerKeypair.publicKey()}`);
    console.log(`💳 Distribution: ${this.distributionKeypair.publicKey()}`);
  }

  async fundAccount(publicKey, label) {
    try {
      console.log(`💰 Funding ${label}: ${publicKey}`);
      
      const response = await fetch(`${config.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${label} funded successfully!`);
        console.log(`   Transaction: ${result.hash}`);
        
        // Wait a moment for the account to be available
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
    try {
      console.log('\n🏭 Setting up Issuer Account...');
      
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
    } catch (error) {
      console.error('❌ Error setting up issuer account:', error.message);
      throw error;
    }
  }

  async createTokenAndTrustline() {
    try {
      console.log('\n🪙 Creating FLPY Token and Trustline...');
      
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
    } catch (error) {
      console.error('❌ Error creating trustline:', error.message);
      throw error;
    }
  }

  async mintTokens(flpyAsset) {
    try {
      console.log('\n💰 Minting FLPY Tokens...');
      
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
    } catch (error) {
      console.error('❌ Error minting tokens:', error.message);
      throw error;
    }
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
    } catch (error) {
      console.log(`❌ Could not check ${label} balance:`, error.message);
    }
  }

  async fullSetup() {
    try {
      console.log('🚀 STARTING FLAPPY PI TOKEN SETUP');
      console.log('═'.repeat(80));
      
      // Step 1: Fund accounts using Friendbot
      console.log('\n📋 STEP 1: FUND ACCOUNTS');
      console.log('─'.repeat(40));
      
      const issuerFunded = await this.fundAccount(this.issuerKeypair.publicKey(), 'Issuer Account');
      const distributionFunded = await this.fundAccount(this.distributionKeypair.publicKey(), 'Distribution Account');
      
      if (!issuerFunded || !distributionFunded) {
        throw new Error('Failed to fund accounts');
      }
      
      // Step 2: Setup issuer account
      console.log('\n📋 STEP 2: CONFIGURE ISSUER');
      console.log('─'.repeat(40));
      await this.setupIssuerAccount();
      
      // Step 3: Create token and trustline
      console.log('\n📋 STEP 3: CREATE TOKEN');
      console.log('─'.repeat(40));
      const { flpyAsset } = await this.createTokenAndTrustline();
      
      // Step 4: Mint tokens
      console.log('\n📋 STEP 4: MINT TOKENS');
      console.log('─'.repeat(40));
      await this.mintTokens(flpyAsset);
      
      // Step 5: Verify balances
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
      console.log('2. Fund game wallets if needed');
      console.log('3. Set up trustlines for game wallets');
      console.log('4. Test token transfers');
      
    } catch (error) {
      console.error('\n❌ SETUP FAILED:', error.message);
      console.error('Full error:', error);
      process.exit(1);
    }
  }

  async quickStatus() {
    try {
      console.log('\n📊 Quick Status Check');
      console.log('─'.repeat(40));
      await this.checkAccountBalance(this.issuerKeypair.publicKey(), 'Issuer');
      await this.checkAccountBalance(this.distributionKeypair.publicKey(), 'Distribution');
    } catch (error) {
      console.error('❌ Error checking status:', error.message);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const creator = new FlappyTokenCreator();
  
  if (args.includes('--status')) {
    await creator.quickStatus();
  } else {
    await creator.fullSetup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FlappyTokenCreator;