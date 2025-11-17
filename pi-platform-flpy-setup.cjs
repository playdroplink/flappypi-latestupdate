#!/usr/bin/env node

/**
 * FLPY Token Setup - Pi Platform Compliant
 * Following official Pi Platform documentation exactly
 * https://github.com/pi-apps/pi-platform-docs/blob/master/tokens.md
 */

const StellarSDK = require("@stellar/stellar-sdk");

// Pi Platform Configuration
const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";

// Your Keys (as provided)
const issuerKeypair = StellarSDK.Keypair.fromSecret("SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I");
const distributorKeypair = StellarSDK.Keypair.fromSecret("SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM");

// FLPY Token Definition
const customToken = new StellarSDK.Asset("FLPY", issuerKeypair.publicKey());

console.log('🏁 FLPY TOKEN SETUP - PI PLATFORM COMPLIANT');
console.log('═'.repeat(60));
console.log(`🪙 Token Code: FLPY`);
console.log(`🏭 Issuer: ${issuerKeypair.publicKey()}`);
console.log(`💳 Distributor: ${distributorKeypair.publicKey()}`);
console.log(`🌐 Network: Pi Testnet`);
console.log(`🔗 Pi API: https://api.testnet.minepi.com`);
console.log('═'.repeat(60));

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAccountBalance(keypair, label) {
  try {
    const account = await server.loadAccount(keypair.publicKey());
    console.log(`\n💰 ${label} Balance:`);
    account.balances.forEach((balance) => {
      if (balance.asset_type === "native") {
        console.log(`   Test-Pi: ${balance.balance}`);
      } else {
        console.log(`   ${balance.asset_code}: ${balance.balance} ⭐`);
      }
    });
    return account;
  } catch (error) {
    console.log(`❌ ${label} account not found: ${error.message}`);
    return null;
  }
}

async function establishTrustline() {
  try {
    console.log('\n📋 STEP 1: ESTABLISH TRUSTLINE (Creating Token On-Chain)');
    console.log('─'.repeat(50));
    console.log('Following Pi Platform docs: "From the Distributor wallet, establish a trustline to FLPY"');
    
    const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    
    // Check if trustline already exists
    const existingTrustline = distributorAccount.balances.find(balance => 
      balance.asset_code === 'FLPY' && 
      balance.asset_issuer === issuerKeypair.publicKey()
    );
    
    if (existingTrustline) {
      console.log('✅ FLPY trustline already exists!');
      console.log(`   Current balance: ${existingTrustline.balance} FLPY`);
      console.log(`   Trust limit: ${existingTrustline.limit || 'Unlimited'}`);
      return true;
    }
    
    // Look up base fee
    const response = await server.ledgers().order("desc").limit(1).call();
    const latestBlock = response.records[0];
    const baseFee = latestBlock.base_fee_in_stroops;
    
    console.log(`💸 Base fee: ${baseFee} stroops`);
    
    // Prepare trustline transaction
    const trustlineTransaction = new StellarSDK.TransactionBuilder(distributorAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(StellarSDK.Operation.changeTrust({ 
        asset: customToken, 
        limit: undefined  // No limit as per Pi docs
      }))
      .build();

    trustlineTransaction.sign(distributorKeypair);

    // Submit transaction
    const result = await server.submitTransaction(trustlineTransaction);
    console.log("✅ Trustline created successfully!");
    console.log(`📋 Transaction Hash: ${result.hash}`);
    console.log('🎉 FLPY token is now recognized on-chain!');
    
    return true;
  } catch (error) {
    console.error('❌ Error establishing trustline:', error.message);
    return false;
  }
}

async function mintTokens() {
  try {
    console.log('\n📋 STEP 2: MINT TOKENS (Payment from Issuer to Distributor)');
    console.log('─'.repeat(50));
    console.log('Following Pi Platform docs: "From the Issuer wallet, send amount to Distributor wallet"');
    
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    
    // Look up base fee
    const response = await server.ledgers().order("desc").limit(1).call();
    const latestBlock = response.records[0];
    const baseFee = latestBlock.base_fee_in_stroops;
    
    const mintAmount = "21000000"; // 21 million FLPY tokens
    console.log(`💰 Minting amount: ${mintAmount} FLPY`);
    
    const paymentTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(
        StellarSDK.Operation.payment({
          destination: distributorKeypair.publicKey(),
          asset: customToken,
          amount: mintAmount,
        })
      )
      .build();

    paymentTransaction.sign(issuerKeypair);

    // Submit transaction
    const result = await server.submitTransaction(paymentTransaction);
    console.log("✅ Token minted successfully!");
    console.log(`📋 Transaction Hash: ${result.hash}`);
    console.log(`🎉 ${mintAmount} FLPY tokens have been created and sent to distributor!`);
    
    return true;
  } catch (error) {
    console.error('❌ Error minting tokens:', error.message);
    return false;
  }
}

async function setHomeDomain() {
  try {
    console.log('\n📋 STEP 3: SET HOME DOMAIN (Pi Wallet Integration)');
    console.log('─'.repeat(50));
    console.log('Following Pi Platform docs: "Link your home domain to your issuer account"');
    
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    
    // Check if home domain is already set
    if (issuerAccount.homeDomain === 'flappypi.fun') {
      console.log('✅ Home domain already set to: flappypi.fun');
      return true;
    }
    
    // Look up base fee
    const response = await server.ledgers().order("desc").limit(1).call();
    const latestBlock = response.records[0];
    const baseFee = latestBlock.base_fee_in_stroops;
    
    const setOptionsTransaction = new StellarSDK.TransactionBuilder(issuerAccount, {
      fee: baseFee,
      networkPassphrase: NETWORK_PASSPHRASE,
      timebounds: await server.fetchTimebounds(90),
    })
      .addOperation(StellarSDK.Operation.setOptions({ 
        homeDomain: "flappypi.fun" 
      }))
      .build();

    setOptionsTransaction.sign(issuerKeypair);

    const result = await server.submitTransaction(setOptionsTransaction);
    console.log("✅ Home Domain set successfully!");
    console.log(`📋 Transaction Hash: ${result.hash}`);
    console.log('🏠 Home Domain: flappypi.fun');
    console.log('📄 Pi.toml URL: https://flappypi.fun/.well-known/pi.toml');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting home domain:', error.message);
    return false;
  }
}

async function verifyPiWalletIntegration() {
  try {
    console.log('\n📋 STEP 4: VERIFY PI WALLET INTEGRATION');
    console.log('─'.repeat(50));
    console.log('Checking Pi API for token recognition...');
    
    const tokenUrl = `https://api.testnet.minepi.com/assets?asset_code=FLPY&asset_issuer=${issuerKeypair.publicKey()}`;
    console.log(`🔍 Token API URL: ${tokenUrl}`);
    
    // Check if token is recognized by Pi API
    const response = await fetch(tokenUrl);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token found in Pi API!');
      
      if (data._embedded && data._embedded.records && data._embedded.records.length > 0) {
        const tokenData = data._embedded.records[0];
        console.log('📊 Token Information:');
        console.log(`   Asset Code: ${tokenData.asset_code}`);
        console.log(`   Asset Issuer: ${tokenData.asset_issuer}`);
        console.log(`   Amount: ${tokenData.amount}`);
        console.log(`   Number of Accounts: ${tokenData.num_accounts}`);
        
        // Check for pi.toml link
        if (tokenData._links && tokenData._links.toml && tokenData._links.toml.href) {
          console.log(`   Pi.toml Link: ${tokenData._links.toml.href}`);
          console.log('✅ Token is properly linked to home domain!');
        } else {
          console.log('⚠️ Pi.toml link not yet available - may need time to propagate');
        }
      }
    } else {
      console.log('⚠️ Token not yet visible in Pi API - may need time to propagate');
    }
    
  } catch (error) {
    console.error('❌ Error verifying Pi integration:', error.message);
  }
}

async function checkFinalStatus() {
  try {
    console.log('\n📊 FINAL STATUS CHECK');
    console.log('═'.repeat(50));
    
    // Check both accounts
    await checkAccountBalance(issuerKeypair, 'Issuer Account');
    await checkAccountBalance(distributorKeypair, 'Distributor Account');
    
    // Check issuer account details
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    console.log(`\n🏭 Issuer Account Details:`);
    console.log(`   Public Key: ${issuerKeypair.publicKey()}`);
    console.log(`   Home Domain: ${issuerAccount.homeDomain || 'Not set'}`);
    console.log(`   Sequence: ${issuerAccount.sequenceNumber()}`);
    
    // Check distributor account details
    const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
    console.log(`\n💳 Distributor Account Details:`);
    console.log(`   Public Key: ${distributorKeypair.publicKey()}`);
    console.log(`   Sequence: ${distributorAccount.sequenceNumber()}`);
    
    // Check for FLPY tokens
    const flpyBalance = distributorAccount.balances.find(balance => 
      balance.asset_code === 'FLPY' && 
      balance.asset_issuer === issuerKeypair.publicKey()
    );
    
    if (flpyBalance) {
      console.log(`   FLPY Balance: ${flpyBalance.balance} FLPY ⭐`);
      console.log(`   Trust Limit: ${flpyBalance.limit || 'Unlimited'}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking final status:', error.message);
  }
}

async function main() {
  try {
    // Initial account check
    console.log('\n🔍 INITIAL ACCOUNT CHECK');
    console.log('─'.repeat(30));
    await checkAccountBalance(issuerKeypair, 'Issuer');
    await checkAccountBalance(distributorKeypair, 'Distributor');
    
    // Step 1: Establish trustline (creates token on-chain)
    const trustlineSuccess = await establishTrustline();
    if (!trustlineSuccess) throw new Error('Trustline creation failed');
    
    await sleep(3000); // Wait for network propagation
    
    // Step 2: Mint tokens (payment from issuer to distributor)
    const mintSuccess = await mintTokens();
    if (!mintSuccess) throw new Error('Token minting failed');
    
    await sleep(3000); // Wait for network propagation
    
    // Step 3: Set home domain (for Pi Wallet integration)
    const homeDomainSuccess = await setHomeDomain();
    if (!homeDomainSuccess) throw new Error('Home domain setup failed');
    
    await sleep(5000); // Wait for Pi API to recognize changes
    
    // Step 4: Verify Pi Wallet integration
    await verifyPiWalletIntegration();
    
    // Final status check
    await checkFinalStatus();
    
    console.log('\n🎉 FLPY TOKEN SETUP COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('✅ Trustline established (token created on-chain)');
    console.log('✅ Tokens minted and distributed to distributor wallet');
    console.log('✅ Home domain set for Pi Wallet integration');
    console.log('✅ Token should appear in Pi Wallet soon');
    console.log('═'.repeat(60));
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Verify your pi.toml file is accessible at: https://flappypi.fun/.well-known/pi.toml');
    console.log('2. Check Pi Wallet for FLPY token (may take a few minutes to appear)');
    console.log('3. Enable FLPY token in Pi Wallet to create trustlines from user wallets');
    console.log('4. Users can now add FLPY token and receive distributions');
    
    console.log('\n🔗 USEFUL LINKS:');
    console.log(`• Token API: https://api.testnet.minepi.com/assets?asset_code=FLPY&asset_issuer=${issuerKeypair.publicKey()}`);
    console.log(`• Issuer Account: https://api.testnet.minepi.com/accounts/${issuerKeypair.publicKey()}`);
    console.log(`• Distributor Account: https://api.testnet.minepi.com/accounts/${distributorKeypair.publicKey()}`);
    console.log('• Pi Wallet: Access through Pi Browser');
    
  } catch (error) {
    console.error('\n💥 SETUP FAILED:', error.message);
    console.error('Check the error above and try again');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };