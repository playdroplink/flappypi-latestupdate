// FLPY Token Minting Script
// Creates and mints 21,000,000 FLPY tokens on Pi Testnet

const StellarSDK = require("@stellar/stellar-sdk");

// Configuration
const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet"; // Testnet passphrase

// IMPORTANT: Replace these with your actual secret keys
const ISSUER_SECRET = "SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I";
const DISTRIBUTOR_SECRET = "SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM";

// Prepare keypairs
const issuerKeypair = StellarSDK.Keypair.fromSecret(ISSUER_SECRET);
const distributorKeypair = StellarSDK.Keypair.fromSecret(DISTRIBUTOR_SECRET);

console.log("🔐 Issuer Public Key:", issuerKeypair.publicKey());
console.log("🔐 Distributor Public Key:", distributorKeypair.publicKey());

// Define FLPY token
const FLPY_TOKEN = new StellarSDK.Asset("FLPY", issuerKeypair.publicKey());

async function setupToken() {
  try {
    console.log("\n🚀 Starting FLPY Token Setup...\n");

    // Step 1: Create Trustline from Distributor
    console.log("📝 Step 1: Creating trustline from Distributor to FLPY token...");
    
    const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    const response = await server.ledgers().order("desc").limit(1).call();
    const baseFee = response.records[0].base_fee_in_stroops;

    const trustlineTransaction = new StellarSDK.TransactionBuilder(distributorAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(
        StellarSDK.Operation.changeTrust({ 
          asset: FLPY_TOKEN, 
          limit: "21000000" // Maximum 21 million tokens
        })
      )
      .build();

    trustlineTransaction.sign(distributorKeypair);
    await server.submitTransaction(trustlineTransaction);
    console.log("✅ Trustline created successfully!");

    // Step 2: Mint 21 Million FLPY Tokens
    console.log("\n💰 Step 2: Minting 21,000,000 FLPY tokens...");
    
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

    const paymentTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(
        StellarSDK.Operation.payment({
          destination: distributorKeypair.publicKey(),
          asset: FLPY_TOKEN,
          amount: "21000000", // Mint 21 million tokens
        })
      )
      .build();

    paymentTransaction.sign(issuerKeypair);
    await server.submitTransaction(paymentTransaction);
    console.log("✅ 21,000,000 FLPY tokens minted successfully!");

    // Step 3: Set Home Domain
    console.log("\n🌐 Step 3: Setting home domain for issuer account...");
    
    const issuerAccountUpdated = await server.loadAccount(issuerKeypair.publicKey());

    const setOptionsTransaction = new StellarSDK.TransactionBuilder(issuerAccountUpdated, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(
        StellarSDK.Operation.setOptions({ 
          homeDomain: "flappypi.fun" 
        })
      )
      .build();

    setOptionsTransaction.sign(issuerKeypair);
    await server.submitTransaction(setOptionsTransaction);
    console.log("✅ Home domain set to: flappypi.fun");

    // Step 4: Lock Issuer Account (OPTIONAL - Uncomment to lock)
    // This prevents further token minting and establishes max supply
    /*
    console.log("\n🔒 Step 4: Locking issuer account to establish max supply...");
    
    const issuerAccountFinal = await server.loadAccount(issuerKeypair.publicKey());

    const lockTransaction = new StellarSDK.TransactionBuilder(issuerAccountFinal, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(
        StellarSDK.Operation.setOptions({
          masterWeight: 0, // Lock the account
          lowThreshold: 1,
          medThreshold: 1,
          highThreshold: 1,
        })
      )
      .build();

    lockTransaction.sign(issuerKeypair);
    await server.submitTransaction(lockTransaction);
    console.log("✅ Issuer account locked! Max supply: 21,000,000 FLPY");
    */

    // Verify balances
    console.log("\n📊 Verifying balances...");
    const updatedDistributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    
    updatedDistributorAccount.balances.forEach((balance) => {
      if (balance.asset_type === "native") {
        console.log(`💎 Pi Balance: ${balance.balance}`);
      } else if (balance.asset_code === "FLPY") {
        console.log(`🪙 FLPY Balance: ${balance.balance}`);
      }
    });

    console.log("\n✅ FLPY Token Setup Complete!");
    console.log("\n📋 Next Steps:");
    console.log("1. Upload pi.toml file to https://flappypi.fun/.well-known/pi.toml");
    console.log("2. Wait for Pi Server to scan and verify the token");
    console.log("3. Token will appear in Pi Wallet once verified");
    console.log("4. Create liquidity pool or distribute tokens to users");
    console.log("\n🔗 Check your token at:");
    console.log(`https://api.minepi.com/assets?asset_code=FLPY&asset_issuer=${issuerKeypair.publicKey()}`);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.response && error.response.data) {
      console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Run the setup
setupToken().catch(console.error);
