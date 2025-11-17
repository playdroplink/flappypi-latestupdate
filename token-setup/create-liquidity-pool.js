const StellarSDK = require('@stellar/stellar-sdk');

// Configuration
const server = new StellarSDK.Horizon.Server('https://api.testnet.minepi.com');
const NETWORK_PASSPHRASE = 'Pi Testnet';

// Your keys (from mint-flpy-token.js)
const DISTRIBUTOR_SECRET = 'SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM';
const distributorKeypair = StellarSDK.Keypair.fromSecret(DISTRIBUTOR_SECRET);

// Token details
const FLPY_ASSET = new StellarSDK.Asset(
  'FLPY',
  'GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI'
);
const PI_ASSET = StellarSDK.Asset.native(); // Pi is the native asset

// Pool configuration - adjust these amounts
const FLPY_AMOUNT = '10000';  // 10,000 FLPY
const PI_AMOUNT = '100';      // 100 Pi (creates 1 FLPY = 0.01 Pi rate)

async function createLiquidityPool() {
  try {
    console.log('🏊 Creating FLPY/Pi Liquidity Pool on Pi Testnet...\n');
    
    // Load distributor account
    const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    console.log('✅ Loaded distributor account:', distributorKeypair.publicKey());

    // Get current ledger for base fee
    const response = await server.ledgers().order('desc').limit(1).call();
    const baseFee = response.records[0].base_fee_in_stroops;

    // Create liquidity pool deposit transaction
    const transaction = new StellarSDK.TransactionBuilder(distributorAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90)
    })
      .addOperation(
        StellarSDK.Operation.changeTrust({
          asset: new StellarSDK.LiquidityPoolAsset(
            PI_ASSET,
            FLPY_ASSET,
            StellarSDK.LiquidityPoolFeeV18
          )
        })
      )
      .addOperation(
        StellarSDK.Operation.liquidityPoolDeposit({
          liquidityPoolId: new StellarSDK.LiquidityPoolAsset(
            PI_ASSET,
            FLPY_ASSET,
            StellarSDK.LiquidityPoolFeeV18
          ).getLiquidityPoolId(),
          maxAmountA: PI_AMOUNT,
          maxAmountB: FLPY_AMOUNT,
          minPrice: { n: 1, d: 1000 }, // Min 1 FLPY = 0.001 Pi
          maxPrice: { n: 1, d: 10 }    // Max 1 FLPY = 0.1 Pi
        })
      )
      .build();

    transaction.sign(distributorKeypair);
    const result = await server.submitTransaction(transaction);

    console.log('\n✅ Liquidity Pool Created Successfully!');
    console.log('📊 Pool Details:');
    console.log('   - Pi Amount:', PI_AMOUNT);
    console.log('   - FLPY Amount:', FLPY_AMOUNT);
    console.log('   - Initial Rate: 1 FLPY ≈', (parseFloat(PI_AMOUNT) / parseFloat(FLPY_AMOUNT)).toFixed(6), 'Pi');
    console.log('\n🔗 Transaction Hash:', result.hash);
    console.log('🌊 Pool ID:', new StellarSDK.LiquidityPoolAsset(PI_ASSET, FLPY_ASSET, StellarSDK.LiquidityPoolFeeV18).getLiquidityPoolId());

    console.log('\n📋 Users can now:');
    console.log('   1. Swap Pi ↔ FLPY using Pi Wallet');
    console.log('   2. Add liquidity to earn fees');
    console.log('   3. Trade directly in Pi Wallet testnet');

  } catch (error) {
    console.error('❌ Error creating liquidity pool:', error.response?.data || error.message);
  }
}

createLiquidityPool();
