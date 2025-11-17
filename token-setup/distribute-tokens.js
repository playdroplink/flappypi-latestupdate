// Token Distribution Script
// Distributes FLPY tokens to recipients

const StellarSDK = require("@stellar/stellar-sdk");

const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";

// Distributor secret key
const DISTRIBUTOR_SECRET = "SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM";
const distributorKeypair = StellarSDK.Keypair.fromSecret(DISTRIBUTOR_SECRET);

// Issuer public key (for defining the asset)
const ISSUER_PUBLIC_KEY = "GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI";
const FLPY_TOKEN = new StellarSDK.Asset("FLPY", ISSUER_PUBLIC_KEY);

/**
 * Distribute FLPY tokens to a recipient
 * @param {string} recipientPublicKey - Recipient's public key
 * @param {string} amount - Amount of FLPY to send
 * @param {string} memo - Optional memo for the transaction
 */
async function distributeTokens(recipientPublicKey, amount, memo = "") {
  try {
    console.log(`\n💸 Distributing ${amount} FLPY to ${recipientPublicKey}...`);

    // Load distributor account
    const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    
    // Get base fee
    const response = await server.ledgers().order("desc").limit(1).call();
    const baseFee = response.records[0].base_fee_in_stroops;

    // Build transaction
    const transaction = new StellarSDK.TransactionBuilder(distributorAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(
        StellarSDK.Operation.payment({
          destination: recipientPublicKey,
          asset: FLPY_TOKEN,
          amount: amount,
        })
      );

    // Add memo if provided
    if (memo) {
      transaction.addMemo(StellarSDK.Memo.text(memo));
    }

    const builtTransaction = transaction.build();
    builtTransaction.sign(distributorKeypair);

    // Submit transaction
    const result = await server.submitTransaction(builtTransaction);
    
    console.log("✅ Distribution successful!");
    console.log(`📋 Transaction Hash: ${result.hash}`);
    console.log(`🔗 View on Explorer: https://pi-blockchain.net/transactions/${result.hash}`);

    return result;
  } catch (error) {
    console.error("❌ Distribution failed:", error.message);
    if (error.response && error.response.data) {
      console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Batch distribute tokens to multiple recipients
 * @param {Array} recipients - Array of {publicKey, amount, memo?} objects
 */
async function batchDistribute(recipients) {
  console.log(`\n📦 Starting batch distribution to ${recipients.length} recipients...`);
  
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await distributeTokens(
        recipient.publicKey,
        recipient.amount,
        recipient.memo || ""
      );
      results.push({ success: true, ...recipient, hash: result.hash });
      
      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({ success: false, ...recipient, error: error.message });
    }
  }

  console.log("\n📊 Distribution Summary:");
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  return results;
}

// Example usage
async function main() {
  // Single distribution example
  // await distributeTokens(
  //   "RECIPIENT_PUBLIC_KEY_HERE",
  //   "100",
  //   "Welcome to Flappy Pi!"
  // );

  // Batch distribution example
  const recipients = [
    // { publicKey: "RECIPIENT_1_PUBLIC_KEY", amount: "100", memo: "Airdrop Reward" },
    // { publicKey: "RECIPIENT_2_PUBLIC_KEY", amount: "50", memo: "Game Prize" },
    // Add more recipients here
  ];

  if (recipients.length > 0 && recipients[0].publicKey !== "RECIPIENT_1_PUBLIC_KEY") {
    await batchDistribute(recipients);
  } else {
    console.log("\n⚠️  No recipients configured.");
    console.log("Edit this file and add recipient public keys to distribute tokens.");
    console.log("\nExample:");
    console.log('await distributeTokens("GA...", "100", "Your reward");');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { distributeTokens, batchDistribute };
