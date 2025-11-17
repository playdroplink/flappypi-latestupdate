#!/usr/bin/env node

/**
 * FLPY Token Status Checker
 * Verifies FLPY token creation and wallet balances on Pi Network Testnet
 */

const StellarSdk = require('@stellar/stellar-sdk');
const fs = require('fs');
const path = require('path');

// Load environment variables manually (since we're using .cjs)
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
          // Remove quotes if present
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

// Load environment variables
loadEnvFile();

// Configuration from environment
const config = {
  // Pi Network Testnet Configuration
  networkPassphrase: StellarSdk.Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  
  // FLPY Token Configuration
  tokenCode: process.env.FLPY_TOKEN_CODE || 'FLPY',
  issuerAddress: process.env.FLPY_TOKEN_ISSUER || 'SC2CB5I5N57AEW3MOY7WAGDBHGQNTB3A4QZ5F4RSBNXMC7QELWJJFNA',
  distributionSeed: process.env.FLPY_DISTRIBUTION_SEED || 'SDILUY6GMPHBZFYXJ64P5DK2TPZFNCLEZKHFFS423RACFLKORGP3DPGJ',
  
  // Wallet Addresses
  walletAddress1: process.env.FLPY_WALLET_ADDRESS_1 || 'GB6ZRJPW2Q64OCKJA5L2FY4K52PUIIQFCSXMN2FZ3HS4QGYP34TT6G75',
  walletAddress2: process.env.FLPY_WALLET_ADDRESS_2 || 'GBV3KOBDQYKFYMOQJVFNY5HLQFX55EZXWYUM6VUS4FJWSS5ECCF4FQP7',
  merchantWallet: process.env.PI_WALLET_ADDRESS || process.env.MERCHANT_WALLET_ADDRESS || 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ',
  
  // Token Details
  totalSupply: process.env.FLPY_TOKEN_AMOUNT || '21000000',
  homeDomain: process.env.FLPY_HOME_DOMAIN || 'flappypi.fun'
};

// Initialize Stellar server
const server = new StellarSdk.Horizon.Server(config.horizonUrl);

class FlappyTokenChecker {
  constructor() {
    this.flpyAsset = new StellarSdk.Asset(config.tokenCode, config.issuerAddress);
    
    // Get distribution keypair for verification
    try {
      this.distributionKeypair = StellarSdk.Keypair.fromSecret(config.distributionSeed);
    } catch (error) {
      console.warn('⚠️ Could not load distribution keypair from seed');
      this.distributionKeypair = null;
    }
  }

  async checkAccount(address, label = 'Account') {
    try {
      console.log(`\n🔍 Checking ${label}: ${address}`);
      console.log('─'.repeat(80));
      
      const account = await server.loadAccount(address);
      
      console.log(`✅ Account exists and is active`);
      console.log(`📊 Sequence Number: ${account.sequenceNumber()}`);
      console.log(`🏠 Home Domain: ${account.homeDomain || 'Not set'}`);
      
      console.log('\n💰 Account Balances:');
      let hasFlpyBalance = false;
      
      account.balances.forEach((balance, index) => {
        if (balance.asset_type === 'native') {
          console.log(`  ${index + 1}. XLM (Lumens): ${balance.balance}`);
        } else {
          const assetCode = balance.asset_code || 'Unknown';
          const assetIssuer = balance.asset_issuer || 'Unknown';
          const isFlpy = assetCode === config.tokenCode && assetIssuer === config.issuerAddress;
          
          if (isFlpy) {
            hasFlpyBalance = true;
            console.log(`  ${index + 1}. ${assetCode}: ${balance.balance} ⭐ (FLPY Token!)`);
          } else {
            console.log(`  ${index + 1}. ${assetCode}: ${balance.balance}`);
          }
          console.log(`      Issuer: ${assetIssuer}`);
          
          if (balance.limit) {
            console.log(`      Trust Limit: ${balance.limit}`);
          }
        }
      });
      
      if (!hasFlpyBalance && label !== 'FLPY Token Issuer') {
        console.log('⚠️ No FLPY tokens found in this account');
      }
      
      // Check trustlines for FLPY
      const flpyTrustline = account.balances.find(balance => 
        balance.asset_code === config.tokenCode && 
        balance.asset_issuer === config.issuerAddress
      );
      
      if (flpyTrustline) {
        console.log(`\n🤝 FLPY Trustline Status: ✅ Active`);
        console.log(`   Balance: ${flpyTrustline.balance} FLPY`);
        console.log(`   Trust Limit: ${flpyTrustline.limit || 'Unlimited'}`);
      } else if (label !== 'FLPY Token Issuer') {
        console.log(`\n🤝 FLPY Trustline Status: ❌ Not established`);
        console.log(`   This account cannot receive FLPY tokens`);
      }
      
      return {
        exists: true,
        account: account,
        hasFlpyBalance: hasFlpyBalance,
        hasFlpyTrustline: !!flpyTrustline,
        flpyBalance: flpyTrustline ? parseFloat(flpyTrustline.balance) : 0
      };
      
    } catch (error) {
      console.log(`❌ Account not found or error: ${error.message}`);
      return {
        exists: false,
        error: error.message,
        hasFlpyBalance: false,
        hasFlpyTrustline: false,
        flpyBalance: 0
      };
    }
  }

  async checkTokenIssuerStatus() {
    console.log('\n🏭 FLPY TOKEN ISSUER STATUS');
    console.log('═'.repeat(80));
    
    const issuerResult = await this.checkAccount(config.issuerAddress, 'FLPY Token Issuer');
    
    if (issuerResult.exists) {
      console.log('\n📋 Issuer Account Details:');
      console.log(`   Home Domain: ${issuerResult.account.homeDomain || 'Not configured'}`);
      
      // Check if issuer account is locked
      const masterWeight = issuerResult.account.thresholds?.master_weight;
      const isLocked = masterWeight === 0;
      console.log(`   Account Lock Status: ${isLocked ? '🔒 Locked (No more tokens can be minted)' : '🔓 Unlocked (Can still mint tokens)'}`);
      
      return issuerResult;
    }
    
    return null;
  }

  async checkDistributionWallet() {
    console.log('\n💳 FLPY DISTRIBUTION WALLET STATUS');
    console.log('═'.repeat(80));
    
    const distributionAddress = this.distributionKeypair ? 
      this.distributionKeypair.publicKey() : 
      'Unknown (seed not available)';
      
    if (this.distributionKeypair) {
      return await this.checkAccount(distributionAddress, 'FLPY Distribution Wallet');
    } else {
      console.log('❌ Cannot check distribution wallet - seed not available');
      return null;
    }
  }

  async checkGameWallets() {
    console.log('\n🎮 GAME WALLET STATUS');
    console.log('═'.repeat(80));
    
    const results = [];
    
    // Check primary game wallets
    const wallet1Result = await this.checkAccount(config.walletAddress1, 'Game Wallet #1');
    results.push({ name: 'Wallet #1', ...wallet1Result });
    
    const wallet2Result = await this.checkAccount(config.walletAddress2, 'Game Wallet #2');
    results.push({ name: 'Wallet #2', ...wallet2Result });
    
    // Check merchant wallet
    const merchantResult = await this.checkAccount(config.merchantWallet, 'Merchant/Payment Wallet');
    results.push({ name: 'Merchant', ...merchantResult });
    
    return results;
  }

  async generateSummaryReport() {
    console.log('\n📊 FLPY TOKEN ECOSYSTEM SUMMARY');
    console.log('═'.repeat(80));
    
    // Check issuer
    const issuerResult = await this.checkTokenIssuerStatus();
    
    // Check distribution wallet  
    const distributionResult = await this.checkDistributionWallet();
    
    // Check game wallets
    const walletResults = await this.checkGameWallets();
    
    // Generate summary
    console.log('\n📋 SUMMARY REPORT');
    console.log('═'.repeat(80));
    
    const totalFlpyInCirculation = (distributionResult?.flpyBalance || 0) + 
      walletResults.reduce((sum, wallet) => sum + (wallet.flpyBalance || 0), 0);
    
    console.log(`🪙 Token: ${config.tokenCode}`);
    console.log(`🏭 Issuer: ${config.issuerAddress}`);
    console.log(`🏠 Home Domain: ${config.homeDomain}`);
    console.log(`📊 Total Supply: ${config.totalSupply} FLPY`);
    console.log(`💰 FLPY in Circulation: ${totalFlpyInCirculation} FLPY`);
    
    console.log('\n🔍 Account Status:');
    console.log(`   Issuer Account: ${issuerResult?.exists ? '✅ Active' : '❌ Not Found'}`);
    console.log(`   Distribution Wallet: ${distributionResult?.exists ? '✅ Active' : '❌ Not Found'}`);
    
    walletResults.forEach(wallet => {
      const status = wallet.exists ? 
        (wallet.hasFlpyTrustline ? '✅ Ready for FLPY' : '⚠️ No FLPY trustline') : 
        '❌ Not Found';
      console.log(`   ${wallet.name}: ${status}`);
    });
    
    console.log('\n💡 Recommendations:');
    
    if (!issuerResult?.exists) {
      console.log('❌ CRITICAL: Issuer account not found! Token cannot exist without issuer.');
    }
    
    if (!distributionResult?.exists) {
      console.log('⚠️ Distribution wallet not found - token distribution may be impacted');
    }
    
    const walletsWithoutTrustlines = walletResults.filter(w => w.exists && !w.hasFlpyTrustline);
    if (walletsWithoutTrustlines.length > 0) {
      console.log(`⚠️ ${walletsWithoutTrustlines.length} wallet(s) need FLPY trustlines to receive tokens`);
      walletsWithoutTrustlines.forEach(w => {
        console.log(`   - ${w.name} needs trustline setup`);
      });
    }
    
    const activeWallets = walletResults.filter(w => w.exists && w.hasFlpyTrustline);
    if (activeWallets.length > 0) {
      console.log(`✅ ${activeWallets.length} wallet(s) ready to receive FLPY tokens`);
    }
    
    // Environment check
    console.log('\n🔧 ENVIRONMENT CONFIGURATION:');
    console.log(`   Network: ${config.networkPassphrase === StellarSdk.Networks.TESTNET ? 'Testnet' : 'Mainnet'}`);
    console.log(`   Horizon URL: ${config.horizonUrl}`);
    console.log(`   Token Code: ${config.tokenCode}`);
    console.log(`   Home Domain: ${config.homeDomain}`);
  }

  async checkTokenInfo() {
    console.log('🪙 FLAPPY PI TOKEN (FLPY) STATUS CHECKER');
    console.log('═'.repeat(80));
    console.log(`🌐 Network: Pi Network Testnet (Stellar)`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log('═'.repeat(80));
    
    try {
      await this.generateSummaryReport();
      
      console.log('\n✨ Status check completed successfully!');
      console.log('\n💡 If you need to create/setup the FLPY token, run:');
      console.log('   node flappy-pi-token-setup.js');
      console.log('\n💡 If you need to setup trustlines for wallets, check the documentation.');
      
    } catch (error) {
      console.error('❌ Error during status check:', error.message);
      console.error('\nFull error:', error);
    }
  }
}

// Main execution
async function main() {
  const checker = new FlappyTokenChecker();
  await checker.checkTokenInfo();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FlappyTokenChecker;