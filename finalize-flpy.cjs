const StellarSdk = require('@stellar/stellar-sdk');

// Configuration
const issuerSeed = 'SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I';
const distributionSeed = 'SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM';

const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSeed);
const distributionKeypair = StellarSdk.Keypair.fromSecret(distributionSeed);

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const flpyAsset = new StellarSdk.Asset('FLPY', issuerKeypair.publicKey());

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTrustlineWithRetry() {
  console.log('🤝 Creating FLPY trustline...');
  console.log(`Distribution Account: ${distributionKeypair.publicKey()}`);
  console.log(`FLPY Asset: FLPY:${issuerKeypair.publicKey()}`);
  
  for (let i = 0; i < 5; i++) {
    try {
      console.log(`\n⏳ Attempt ${i + 1}/5 - Loading account...`);
      await sleep(2000); // Wait 2 seconds
      
      const account = await server.loadAccount(distributionKeypair.publicKey());
      console.log('✅ Account loaded successfully');
      
      // Check if trustline already exists
      const existingTrustline = account.balances.find(balance => 
        balance.asset_code === 'FLPY' && 
        balance.asset_issuer === issuerKeypair.publicKey()
      );
      
      if (existingTrustline) {
        console.log('✅ FLPY trustline already exists!');
        console.log(`   Balance: ${existingTrustline.balance} FLPY`);
        return true;
      }
      
      console.log('📋 Creating trustline transaction...');
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
        timebounds: await server.fetchTimebounds(100)
      })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: flpyAsset,
        limit: '21000000'
      }))
      .build();
      
      transaction.sign(distributionKeypair);
      
      console.log('📤 Submitting trustline transaction...');
      const result = await server.submitTransaction(transaction);
      
      console.log('✅ FLPY trustline created successfully!');
      console.log(`   Transaction: ${result.hash}`);
      return true;
      
    } catch (error) {
      console.log(`❌ Attempt ${i + 1} failed: ${error.message}`);
      if (i === 4) {
        console.error('💥 All attempts failed:', error);
        return false;
      }
      console.log('⏳ Waiting 5 seconds before retry...');
      await sleep(5000);
    }
  }
  return false;
}

async function mintTokens() {
  try {
    console.log('\n💰 Minting FLPY tokens...');
    
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
      timebounds: await server.fetchTimebounds(100)
    })
    .addOperation(StellarSdk.Operation.payment({
      destination: distributionKeypair.publicKey(),
      asset: flpyAsset,
      amount: '21000000'
    }))
    .build();
    
    transaction.sign(issuerKeypair);
    
    const result = await server.submitTransaction(transaction);
    console.log('✅ 21,000,000 FLPY tokens minted successfully!');
    console.log(`   Transaction: ${result.hash}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error minting tokens:', error.message);
    return false;
  }
}

async function checkFinalBalance() {
  try {
    console.log('\n📊 Checking final balances...');
    
    const account = await server.loadAccount(distributionKeypair.publicKey());
    console.log(`💳 Distribution Wallet: ${distributionKeypair.publicKey()}`);
    
    account.balances.forEach(balance => {
      if (balance.asset_type === 'native') {
        console.log(`   XLM: ${balance.balance}`);
      } else {
        console.log(`   ${balance.asset_code}: ${balance.balance} ⭐`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
  }
}

async function main() {
  console.log('🪙 FLPY TOKEN COMPLETION SCRIPT');
  console.log('═'.repeat(50));
  
  const trustlineSuccess = await createTrustlineWithRetry();
  
  if (trustlineSuccess) {
    await sleep(3000);
    const mintSuccess = await mintTokens();
    
    if (mintSuccess) {
      await sleep(2000);
      await checkFinalBalance();
      
      console.log('\n🎉 FLPY TOKEN SETUP COMPLETED!');
      console.log('═'.repeat(50));
      console.log('✅ Trustline created');
      console.log('✅ Tokens minted');
      console.log('✅ Ready to use!');
      
      console.log('\n📋 Token Info:');
      console.log(`   Code: FLPY`);
      console.log(`   Issuer: ${issuerKeypair.publicKey()}`);
      console.log(`   Distribution: ${distributionKeypair.publicKey()}`);
      console.log(`   Total Supply: 21,000,000 FLPY`);
    }
  } else {
    console.log('\n💥 Failed to create trustline. Please try again later.');
  }
}

main().catch(console.error);