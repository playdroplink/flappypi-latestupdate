const StellarSDK = require('@stellar/stellar-sdk');

// Configuration
const server = new StellarSDK.Horizon.Server('https://api.testnet.minepi.com');
const NETWORK_PASSPHRASE = 'Pi Testnet';

// User's secret key (replace with actual user's key)
const USER_SECRET = 'YOUR_USER_SECRET_KEY_HERE';
const userKeypair = StellarSDK.Keypair.fromSecret(USER_SECRET);

// Token details
const FLPY_ASSET = new StellarSDK.Asset(
  'FLPY',
  'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI'
);
const PI_ASSET = StellarSDK.Asset.native();

// Swap configuration
const SWAP_TYPE = 'PI_TO_FLPY'; // or 'FLPY_TO_PI'
const AMOUNT_TO_SWAP = '10'; // Amount to swap

async function swapTokens() {
  try {
    console.log(`🔄 Swapping tokens on Pi Testnet...\n`);
    
    // Load user account
    const userAccount = await server.loadAccount(userKeypair.publicKey());
    console.log('✅ Loaded user account:', userKeypair.publicKey());

    // Get current ledger for base fee
    const response = await server.ledgers().order('desc').limit(1).call();
    const baseFee = response.records[0].base_fee_in_stroops;

    let transaction;
    
    if (SWAP_TYPE === 'PI_TO_FLPY') {
      // Swap Pi → FLPY
      console.log(`💱 Swapping ${AMOUNT_TO_SWAP} Pi → FLPY`);
      
      transaction = new StellarSDK.TransactionBuilder(userAccount, {
        fee: baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: await server.fetchTimebounds(90)
      })
        .addOperation(
          StellarSDK.Operation.pathPaymentStrictSend({
            sendAsset: PI_ASSET,
            sendAmount: AMOUNT_TO_SWAP,
            destination: userKeypair.publicKey(),
            destAsset: FLPY_ASSET,
            destMin: '0.01', // Minimum FLPY to receive (adjust based on slippage)
            path: [] // Direct swap through liquidity pool
          })
        )
        .build();
    } else {
      // Swap FLPY → Pi
      console.log(`💱 Swapping ${AMOUNT_TO_SWAP} FLPY → Pi`);
      
      transaction = new StellarSDK.TransactionBuilder(userAccount, {
        fee: baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: await server.fetchTimebounds(90)
      })
        .addOperation(
          StellarSDK.Operation.pathPaymentStrictSend({
            sendAsset: FLPY_ASSET,
            sendAmount: AMOUNT_TO_SWAP,
            destination: userKeypair.publicKey(),
            destAsset: PI_ASSET,
            destMin: '0.01', // Minimum Pi to receive (adjust based on slippage)
            path: [] // Direct swap through liquidity pool
          })
        )
        .build();
    }

    transaction.sign(userKeypair);
    const result = await server.submitTransaction(transaction);

    console.log('\n✅ Swap Successful!');
    console.log('🔗 Transaction Hash:', result.hash);
    console.log('📊 Check your Pi Wallet for updated balances');

  } catch (error) {
    console.error('❌ Error swapping tokens:', error.response?.data || error.message);
  }
}

// Only run if USER_SECRET is set
if (USER_SECRET !== 'YOUR_USER_SECRET_KEY_HERE') {
  swapTokens();
} else {
  console.log('⚠️  Please set USER_SECRET in the script before running');
  console.log('💡 This is the secret key of the wallet that wants to swap tokens');
}
