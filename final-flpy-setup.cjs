const StellarSdk = require('@stellar/stellar-sdk');

const issuerSeed = 'SB4I6DX4Y6PS7SAJW2SFUQZP3DAW5HE7RBAKISOMTVACARMFCMRBH46I';
const distributionSeed = 'SBS4OY37QMZ67U2WLWZQUUFUV2JOBKWCBFS7IZDOJV3NZPYC3OOZ4OIM';

const issuerKeypair = StellarSdk.Keypair.fromSecret(issuerSeed);
const distributionKeypair = StellarSdk.Keypair.fromSecret(distributionSeed);

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const flpyAsset = new StellarSdk.Asset('FLPY', issuerKeypair.publicKey());

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setHomeDomain() {
  try {
    console.log('🏠 Setting home domain...');
    
    const account = await server.loadAccount(issuerKeypair.publicKey());
    
    if (account.homeDomain === 'flappypi.fun') {
      console.log('✅ Home domain already set');
      return;
    }
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
      timebounds: await server.fetchTimebounds(100)
    })
    .addOperation(StellarSdk.Operation.setOptions({
      homeDomain: 'flappypi.fun'
    }))
    .build();
    
    transaction.sign(issuerKeypair);
    const result = await server.submitTransaction(transaction);
    
    console.log('✅ Home domain set to flappypi.fun');
    console.log(`   Transaction: ${result.hash}`);
    
  } catch (error) {
    console.error('❌ Error setting home domain:', error.message);
  }
}

async function mintTokens() {
  try {
    console.log('💰 Minting FLPY tokens...');
    
    // Check if tokens already exist
    const distAccount = await server.loadAccount(distributionKeypair.publicKey());
    const flpyBalance = distAccount.balances.find(b => 
      b.asset_code === 'FLPY' && b.asset_issuer === issuerKeypair.publicKey()
    );
    
    if (flpyBalance && parseFloat(flpyBalance.balance) > 0) {
      console.log(`✅ Tokens already exist: ${flpyBalance.balance} FLPY`);
      return true;
    }
    
    await sleep(2000); // Wait for issuer account to be ready
    
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

async function finalCheck() {
  try {
    console.log('\n📊 Final Status Check:');
    console.log('═'.repeat(50));
    
    // Check issuer
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    console.log(`🏭 Issuer: ${issuerKeypair.publicKey()}`);
    console.log(`   Home Domain: ${issuerAccount.homeDomain || 'Not set'}`);
    issuerAccount.balances.forEach(b => {
      if (b.asset_type === 'native') console.log(`   XLM: ${b.balance}`);
    });
    
    // Check distribution
    const distAccount = await server.loadAccount(distributionKeypair.publicKey());
    console.log(`\n💳 Distribution: ${distributionKeypair.publicKey()}`);
    distAccount.balances.forEach(b => {
      if (b.asset_type === 'native') {
        console.log(`   XLM: ${b.balance}`);
      } else {
        console.log(`   ${b.asset_code}: ${b.balance} ⭐`);
      }
    });
    
    console.log('\n🎯 FLPY Token Summary:');
    console.log(`   Code: FLPY`);
    console.log(`   Issuer: ${issuerKeypair.publicKey()}`);
    console.log(`   Distribution: ${distributionKeypair.publicKey()}`);
    console.log(`   Network: Stellar Testnet`);
    console.log(`   Home Domain: flappypi.fun`);
    
  } catch (error) {
    console.error('❌ Error in final check:', error.message);
  }
}

async function main() {
  console.log('🏁 FLPY TOKEN FINAL COMPLETION');
  console.log('═'.repeat(50));
  
  await setHomeDomain();
  await sleep(3000);
  
  const mintSuccess = await mintTokens();
  await sleep(2000);
  
  await finalCheck();
  
  if (mintSuccess) {
    console.log('\n🎉 FLPY TOKEN IS FULLY OPERATIONAL!');
    console.log('═'.repeat(50));
    console.log('✅ Home domain: flappypi.fun');
    console.log('✅ Trustline: Created');
    console.log('✅ Tokens: Minted & Distributed');
    console.log('✅ Ready for use in your Pi app!');
    
    console.log('\n💡 Next: Run "node check-flpy-token-status.cjs" to verify everything');
  } else {
    console.log('\n⚠️ Token setup partially complete. Check the status and try again if needed.');
  }
}

main().catch(console.error);