const StellarSDK = require('@stellar/stellar-sdk');
require('dotenv').config();

// Stellar SDK Configuration for Pi Network Testnet
const NETWORK_PASSPHRASE = StellarSDK.Networks.TESTNET; // Use TESTNET for testing
const HORIZON_URL = 'https://horizon-testnet.stellar.org'; // Pi Network Testnet Horizon

const server = new StellarSDK.Horizon.Server(HORIZON_URL);

// Flappy Pi Token Configuration
const issuerSeed = 'SC2CB5I5N57AEW3MOY7WAGDBHGQNTB3A4QZ5F4RSBNXMC7QELWJJFNA';
const issuerKeypair = StellarSDK.Keypair.fromSecret(issuerSeed);
const baseFee = StellarSDK.BASE_FEE;

async function setupFlappyPiToken() {
  try {
    console.log('🎮 Setting up Flappy Pi Token (FLPY)...');
    console.log(`Issuer Public Key: ${issuerKeypair.publicKey()}`);

    // Load issuer account
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    console.log('✅ Issuer account loaded successfully');

    // Set home domain for the issuer account
    const setOptionsTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(StellarSDK.Operation.setOptions({ homeDomain: "flappypi.fun" })) // replace with your actual domain
      .build();

    setOptionsTransaction.sign(issuerKeypair);

    const result = await server.submitTransaction(setOptionsTransaction);
    console.log("✅ Home Domain is set successfully.");
    console.log(`🏠 Home Domain: flappypi.fun`);
    console.log(`📋 Transaction Hash: ${result.hash}`);

    // Display token information
    console.log('\n🪙 Flappy Pi Token (FLPY) Information:');
    console.log('======================================');
    console.log(`Token Code: FLPY`);
    console.log(`Issuer: ${issuerKeypair.publicKey()}`);
    console.log(`Home Domain: flappypi.fun`);
    console.log(`Total Supply: 21,000,000 FLPY`);
    console.log(`pi.toml URL: https://flappypi.fun/.well-known/pi.toml`);

    return result;
  } catch (error) {
    console.error('❌ Error setting up Flappy Pi Token:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Run the setup
setupFlappyPiToken()
  .then(() => {
    console.log('\n🎉 Flappy Pi Token setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });