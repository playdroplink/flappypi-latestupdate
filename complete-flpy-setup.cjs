#!/usr/bin/env node

/**
 * Complete FLPY Token Setup - Trustlines and Minting Only
 * For when accounts already exist but token needs completion
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
  
  tokenCode: 'FLPY',
  issuerSeed: process.env.FLPY_TOKEN_ISSUER_SEED || 'SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I',
  distributionSeed: process.env.FLPY_DISTRIBUTION_SEED || 'SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM',
  
  totalSupply: '21000000',
  homeDomain: 'flappypi.fun'
};

const server = new StellarSdk.Horizon.Server(config.horizonUrl);

class FlappyTokenCompleter {
  constructor() {
    this.issuerKeypair = StellarSdk.Keypair.fromSecret(config.issuerSeed);
    this.distributionKeypair = StellarSdk.Keypair.fromSecret(config.distributionSeed);
    this.flpyAsset = new StellarSdk.Asset(config.tokenCode, this.issuerKeypair.publicKey());
    this.baseFee = StellarSdk.BASE_FEE;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async setupHomeDomain() {
    try {
      console.log('🏠 Setting up home domain...');
      
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());
      
      // Check if home domain is already set
      if (issuerAccount.homeDomain === config.homeDomain) {
        console.log('✅ Home domain already configured');
        return;
      }
      
      const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
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
      
      console.log('✅ Home domain configured');
      console.log(`   Transaction: ${result.hash}`);
      
    } catch (error) {
      console.error('❌ Error setting home domain:', error.message);
      throw error;
    }
  }

  async createTrustline() {
    try {
      console.log('🤝 Creating FLPY trustline for distribution wallet...');
      
      const distributionAccount = await server.loadAccount(this.distributionKeypair.publicKey());
      
      // Check if trustline already exists
      const existingTrustline = distributionAccount.balances.find(balance => 
        balance.asset_code === config.tokenCode && 
        balance.asset_issuer === this.issuerKeypair.publicKey()
      );
      
      if (existingTrustline) {
        console.log('✅ Trustline already exists');
        console.log(`   Current balance: ${existingTrustline.balance} FLPY`);
        return existingTrustline;
      }
      
      const transaction = new StellarSdk.TransactionBuilder(distributionAccount, {
        fee: this.baseFee,
        networkPassphrase: config.networkPassphrase,
        timebounds: await server.fetchTimebounds(100)
      })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: this.flpyAsset,
        limit: config.totalSupply
      }))
      .build();
      
      transaction.sign(this.distributionKeypair);
      const result = await server.submitTransaction(transaction);
      
      console.log('✅ Trustline created successfully');
      console.log(`   Transaction: ${result.hash}`);
      
      return result;
    } catch (error) {
      console.error('❌ Error creating trustline:', error.message);
      throw error;
    }
  }

  async mintTokens() {
    try {
      console.log('💰 Checking if tokens need to be minted...');
      
      // Check distribution wallet balance
      const distributionAccount = await server.loadAccount(this.distributionKeypair.publicKey());
      const flpyBalance = distributionAccount.balances.find(balance => 
        balance.asset_code === config.tokenCode && 
        balance.asset_issuer === this.issuerKeypair.publicKey()
      );
      
      if (flpyBalance && parseFloat(flpyBalance.balance) > 0) {
        console.log(`✅ Tokens already minted: ${flpyBalance.balance} FLPY`);
        return;
      }
      
      console.log('💰 Minting FLPY tokens...');
      
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());
      
      const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
        fee: this.baseFee,
        networkPassphrase: config.networkPassphrase,
        timebounds: await server.fetchTimebounds(100)
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: this.distributionKeypair.publicKey(),
        asset: this.flpyAsset,
        amount: config.totalSupply
      }))
      .build();
      
      transaction.sign(this.issuerKeypair);
      const result = await server.submitTransaction(transaction);
      
      console.log(`✅ Minted ${config.totalSupply} FLPY tokens`);
      console.log(`   Transaction: ${result.hash}`);
      
    } catch (error) {
      console.error('❌ Error minting tokens:', error.message);
      throw error;
    }
  }

  async checkFinalStatus() {
    try {
      console.log('\n📊 Final Token Status:');
      console.log('─'.repeat(50));
      
      // Check issuer
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());
      console.log(`🏭 Issuer (${this.issuerKeypair.publicKey()}):`);
      console.log(`   Home Domain: ${issuerAccount.homeDomain || 'Not set'}`);
      issuerAccount.balances.forEach(balance => {
        if (balance.asset_type === 'native') {
          console.log(`   XLM: ${balance.balance}`);
        }
      });
      
      // Check distribution
      const distributionAccount = await server.loadAccount(this.distributionKeypair.publicKey());
      console.log(`\n💳 Distribution (${this.distributionKeypair.publicKey()}):`);
      distributionAccount.balances.forEach(balance => {
        if (balance.asset_type === 'native') {
          console.log(`   XLM: ${balance.balance}`);
        } else {
          console.log(`   ${balance.asset_code}: ${balance.balance} ⭐`);
        }
      });
      
    } catch (error) {
      console.error('❌ Error checking status:', error.message);
    }
  }

  async completeSetup() {
    try {
      console.log('🏁 COMPLETING FLAPPY PI TOKEN SETUP');
      console.log('═'.repeat(60));
      console.log(`🪙 Token: ${config.tokenCode}`);
      console.log(`🏭 Issuer: ${this.issuerKeypair.publicKey()}`);
      console.log(`💳 Distribution: ${this.distributionKeypair.publicKey()}`);
      console.log('═'.repeat(60));
      
      // Step 1: Set home domain
      await this.setupHomeDomain();
      await this.sleep(2000);
      
      // Step 2: Create trustline
      await this.createTrustline();
      await this.sleep(2000);
      
      // Step 3: Mint tokens
      await this.mintTokens();
      await this.sleep(2000);
      
      // Step 4: Final status
      await this.checkFinalStatus();
      
      console.log('\n🎉 FLAPPY PI TOKEN SETUP COMPLETED!');
      console.log('═'.repeat(60));
      console.log('✅ Home domain configured');
      console.log('✅ Trustline established');
      console.log('✅ Tokens minted and distributed');
      console.log('\n💡 Your FLPY token is now ready to use!');
      console.log('\n📋 Token Details:');
      console.log(`   Code: ${config.tokenCode}`);
      console.log(`   Issuer: ${this.issuerKeypair.publicKey()}`);
      console.log(`   Distribution: ${this.distributionKeypair.publicKey()}`);
      console.log(`   Total Supply: ${config.totalSupply} FLPY`);
      console.log(`   Home Domain: ${config.homeDomain}`);
      
    } catch (error) {
      console.error('\n❌ Setup completion failed:', error.message);
      console.error('Full error:', error);
      return false;
    }
    return true;
  }
}

async function main() {
  const completer = new FlappyTokenCompleter();
  const success = await completer.completeSetup();
  
  if (success) {
    console.log('\n✨ Run "node check-flpy-token-status.cjs" to verify everything is working!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FlappyTokenCompleter;