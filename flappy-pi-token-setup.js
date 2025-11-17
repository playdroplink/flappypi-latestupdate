import StellarSDK from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Stellar SDK Configuration for Pi Network Testnet
const NETWORK_PASSPHRASE = StellarSDK.Networks.TESTNET; // Use TESTNET for testing
const HORIZON_URL = 'https://horizon-testnet.stellar.org'; // Pi Network Testnet Horizon

const server = new StellarSDK.Horizon.Server(HORIZON_URL);

// Flappy Pi Token Configuration
const FLPY_TOKEN_CONFIG = {
  code: 'FLPY',
  issuerSeed: process.env.FLPY_TOKEN_ISSUER_SEED || 'SC2CB5I5N57AEW3MOY7WAGDBHGQNTB3A4QZ5F4RSBNXMC7QELWJJFNA',
  distributionSeed: process.env.FLPY_DISTRIBUTION_SEED || 'SDILUY6GMPHBZFYXJ64P5DK2TPZFNCLEZKHFFS423RACFLKORGP3DPGJ',
  homeDomain: process.env.FLPY_HOME_DOMAIN || 'flappypi.fun',
  amount: process.env.FLPY_TOKEN_AMOUNT || '21000000',
  name: process.env.FLPY_TOKEN_NAME || 'Flappy Pi Team',
  desc: process.env.FLPY_TOKEN_DESC || 'This is a test token that is created as an example and has no value.',
  image: process.env.FLPY_TOKEN_IMAGE || 'https://flappypi.fun/image.png'
};

class FlappyPiTokenSetup {
  constructor() {
    this.issuerKeypair = StellarSDK.Keypair.fromSecret(FLPY_TOKEN_CONFIG.issuerSeed);
    this.distributionKeypair = StellarSDK.Keypair.fromSecret(FLPY_TOKEN_CONFIG.distributionSeed);
    this.baseFee = StellarSDK.BASE_FEE;
  }

  async setupIssuerAccount() {
    try {
      console.log('🚀 Setting up Flappy Pi Token Issuer Account...');
      console.log(`Issuer Public Key: ${this.issuerKeypair.publicKey()}`);
      console.log(`Distribution Public Key: ${this.distributionKeypair.publicKey()}`);

      // Load issuer account
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());
      console.log('✅ Issuer account loaded successfully');

      // Set home domain for the issuer account
      const setOptionsTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
        fee: this.baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: await server.fetchTimebounds(90),
      })
        .addOperation(StellarSDK.Operation.setOptions({ 
          homeDomain: FLPY_TOKEN_CONFIG.homeDomain 
        }))
        .build();

      setOptionsTransaction.sign(this.issuerKeypair);

      const result = await server.submitTransaction(setOptionsTransaction);
      console.log('✅ Home Domain is set successfully');
      console.log(`🏠 Home Domain: ${FLPY_TOKEN_CONFIG.homeDomain}`);
      console.log(`📋 Transaction Hash: ${result.hash}`);

      return result;
    } catch (error) {
      console.error('❌ Error setting up issuer account:', error.message);
      throw error;
    }
  }

  async createToken() {
    try {
      console.log('🪙 Creating Flappy Pi Token (FLPY)...');

      // Load distribution account
      const distributionAccount = await server.loadAccount(this.distributionKeypair.publicKey());
      console.log('✅ Distribution account loaded successfully');

      // Create the FLPY asset
      const flpyAsset = new StellarSDK.Asset(FLPY_TOKEN_CONFIG.code, this.issuerKeypair.publicKey());
      console.log(`🎯 Token Asset: ${FLPY_TOKEN_CONFIG.code}:${this.issuerKeypair.publicKey()}`);

      // Create trustline for FLPY token
      const changeTrustTransaction = new StellarSDK.TransactionBuilder(distributionAccount, {
        fee: this.baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: await server.fetchTimebounds(90),
      })
        .addOperation(StellarSDK.Operation.changeTrust({
          asset: flpyAsset,
          limit: FLPY_TOKEN_CONFIG.amount
        }))
        .build();

      changeTrustTransaction.sign(this.distributionKeypair);

      const trustResult = await server.submitTransaction(changeTrustTransaction);
      console.log('✅ Trustline created successfully');
      console.log(`📋 Trust Transaction Hash: ${trustResult.hash}`);

      return { flpyAsset, trustResult };
    } catch (error) {
      console.error('❌ Error creating token:', error.message);
      throw error;
    }
  }

  async mintTokens(flpyAsset) {
    try {
      console.log('💰 Minting FLPY tokens...');

      // Load issuer account for minting
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());

      // Mint tokens by sending from issuer to distribution account
      const paymentTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
        fee: this.baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: await server.fetchTimebounds(90),
      })
        .addOperation(StellarSDK.Operation.payment({
          destination: this.distributionKeypair.publicKey(),
          asset: flpyAsset,
          amount: FLPY_TOKEN_CONFIG.amount
        }))
        .build();

      paymentTransaction.sign(this.issuerKeypair);

      const paymentResult = await server.submitTransaction(paymentTransaction);
      console.log(`✅ Successfully minted ${FLPY_TOKEN_CONFIG.amount} FLPY tokens`);
      console.log(`📋 Payment Transaction Hash: ${paymentResult.hash}`);

      return paymentResult;
    } catch (error) {
      console.error('❌ Error minting tokens:', error.message);
      throw error;
    }
  }

  async lockIssuerAccount() {
    try {
      console.log('🔒 Locking issuer account (optional)...');
      
      // Load issuer account
      const issuerAccount = await server.loadAccount(this.issuerKeypair.publicKey());

      // Set master weight to 0 to lock the account
      const lockTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
        fee: this.baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: await server.fetchTimebounds(90),
      })
        .addOperation(StellarSDK.Operation.setOptions({
          masterWeight: 0
        }))
        .build();

      lockTransaction.sign(this.issuerKeypair);

      const lockResult = await server.submitTransaction(lockTransaction);
      console.log('✅ Issuer account locked successfully (no more tokens can be minted)');
      console.log(`📋 Lock Transaction Hash: ${lockResult.hash}`);

      return lockResult;
    } catch (error) {
      console.error('❌ Error locking issuer account:', error.message);
      throw error;
    }
  }

  async fullSetup() {
    try {
      console.log('🎮 Flappy Pi Token (FLPY) - Complete Setup');
      console.log('================================================');
      
      // Step 1: Setup issuer account with home domain
      await this.setupIssuerAccount();
      
      // Step 2: Create token and trustline
      const { flpyAsset } = await this.createToken();
      
      // Step 3: Mint tokens
      await this.mintTokens(flpyAsset);
      
      // Step 4: Optionally lock issuer account (uncomment if desired)
      // await this.lockIssuerAccount();
      
      console.log('================================================');
      console.log('🎉 Flappy Pi Token setup completed successfully!');
      console.log(`🪙 Token: ${FLPY_TOKEN_CONFIG.code}`);
      console.log(`🏭 Issuer: ${this.issuerKeypair.publicKey()}`);
      console.log(`💳 Distribution: ${this.distributionKeypair.publicKey()}`);
      console.log(`💰 Total Supply: ${FLPY_TOKEN_CONFIG.amount} FLPY`);
      console.log(`🌐 Home Domain: ${FLPY_TOKEN_CONFIG.homeDomain}`);
      console.log(`📄 pi.toml: https://${FLPY_TOKEN_CONFIG.homeDomain}/.well-known/pi.toml`);
      
    } catch (error) {
      console.error('❌ Full setup failed:', error.message);
      process.exit(1);
    }
  }

  // Utility functions
  async getAccountInfo(publicKey) {
    try {
      const account = await server.loadAccount(publicKey);
      console.log(`Account: ${publicKey}`);
      console.log(`Sequence: ${account.sequenceNumber()}`);
      console.log('Balances:');
      account.balances.forEach(balance => {
        if (balance.asset_type === 'native') {
          console.log(`  XLM: ${balance.balance}`);
        } else {
          console.log(`  ${balance.asset_code}: ${balance.balance}`);
        }
      });
    } catch (error) {
      console.error(`❌ Error loading account ${publicKey}:`, error.message);
    }
  }

  async checkAccountsInfo() {
    console.log('📊 Account Information');
    console.log('======================');
    await this.getAccountInfo(this.issuerKeypair.publicKey());
    console.log('');
    await this.getAccountInfo(this.distributionKeypair.publicKey());
  }
}

// Main execution
async function main() {
  const tokenSetup = new FlappyPiTokenSetup();
  
  // Check if we want to run full setup or just check account info
  const args = process.argv.slice(2);
  
  if (args.includes('--info')) {
    await tokenSetup.checkAccountsInfo();
  } else {
    await tokenSetup.fullSetup();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FlappyPiTokenSetup;