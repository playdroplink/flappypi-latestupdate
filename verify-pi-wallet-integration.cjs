#!/usr/bin/env node

/**
 * FLPY Token Pi Wallet Integration Verification
 * Check if token is properly set up for Pi Wallet
 */

const StellarSDK = require("@stellar/stellar-sdk");

const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const issuerPublicKey = "GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI";
const distributorPublicKey = "GCTPMH43NGN7E4IXLQ27H2XWGGWWDY3I6UAPBFXYQSEUPEKNQE2BZXC2";

console.log('🔍 FLPY TOKEN - PI WALLET INTEGRATION CHECK');
console.log('═'.repeat(60));

async function checkTokenInPiAPI() {
  try {
    console.log('\n📋 CHECKING PI API TOKEN RECOGNITION');
    console.log('─'.repeat(50));
    
    const tokenUrl = `https://api.testnet.minepi.com/assets?asset_code=FLPY&asset_issuer=${issuerPublicKey}`;
    console.log(`🔗 Token API URL: ${tokenUrl}`);
    
    const response = await fetch(tokenUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data._embedded && data._embedded.records && data._embedded.records.length > 0) {
        const tokenData = data._embedded.records[0];
        
        console.log('✅ FLPY TOKEN FOUND IN PI API!');
        console.log('─'.repeat(30));
        console.log(`🪙 Asset Code: ${tokenData.asset_code}`);
        console.log(`🏭 Asset Issuer: ${tokenData.asset_issuer}`);
        console.log(`💰 Total Amount: ${tokenData.amount} FLPY`);
        console.log(`👥 Number of Accounts: ${tokenData.num_accounts}`);
        console.log(`📊 Number of Claimable Balances: ${tokenData.num_claimable_balances}`);
        console.log(`📈 Number of Liquidity Pools: ${tokenData.num_liquidity_pools}`);
        
        // Check pi.toml integration
        if (tokenData._links && tokenData._links.toml) {
          const tomlLink = tokenData._links.toml.href;
          console.log('\n📄 PI.TOML INTEGRATION:');
          console.log(`   Link: ${tomlLink || 'Not set'}`);
          
          if (tomlLink && tomlLink.includes('flappypi.fun')) {
            console.log('✅ Pi.toml properly linked to flappypi.fun!');
          } else if (tomlLink) {
            console.log('⚠️ Pi.toml linked but not to expected domain');
          } else {
            console.log('❌ Pi.toml not linked - home domain may not be set');
          }
        }
        
        return true;
      } else {
        console.log('❌ Token not found in Pi API results');
        return false;
      }
    } else {
      console.log(`❌ Failed to fetch from Pi API: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking Pi API:', error.message);
    return false;
  }
}

async function checkIssuerAccount() {
  try {
    console.log('\n📋 CHECKING ISSUER ACCOUNT');
    console.log('─'.repeat(50));
    
    const account = await server.loadAccount(issuerPublicKey);
    
    console.log(`🏭 Issuer: ${issuerPublicKey}`);
    console.log(`🏠 Home Domain: ${account.homeDomain || 'Not set'}`);
    console.log(`📊 Sequence: ${account.sequenceNumber()}`);
    
    console.log('\n💰 Issuer Balances:');
    account.balances.forEach((balance, index) => {
      if (balance.asset_type === 'native') {
        console.log(`   ${index + 1}. Test-Pi: ${balance.balance}`);
      } else {
        console.log(`   ${index + 1}. ${balance.asset_code}: ${balance.balance}`);
      }
    });
    
    return account.homeDomain === 'flappypi.fun';
    
  } catch (error) {
    console.error('❌ Error checking issuer account:', error.message);
    return false;
  }
}

async function checkDistributorAccount() {
  try {
    console.log('\n📋 CHECKING DISTRIBUTOR ACCOUNT');
    console.log('─'.repeat(50));
    
    const account = await server.loadAccount(distributorPublicKey);
    
    console.log(`💳 Distributor: ${distributorPublicKey}`);
    console.log(`📊 Sequence: ${account.sequenceNumber()}`);
    
    console.log('\n💰 Distributor Balances:');
    let flpyBalance = null;
    
    account.balances.forEach((balance, index) => {
      if (balance.asset_type === 'native') {
        console.log(`   ${index + 1}. Test-Pi: ${balance.balance}`);
      } else {
        console.log(`   ${index + 1}. ${balance.asset_code}: ${balance.balance} ⭐`);
        if (balance.asset_code === 'FLPY') {
          flpyBalance = balance;
        }
      }
    });
    
    if (flpyBalance) {
      console.log('\n🎯 FLPY TOKEN STATUS:');
      console.log(`   Balance: ${flpyBalance.balance} FLPY`);
      console.log(`   Issuer: ${flpyBalance.asset_issuer}`);
      console.log(`   Trust Limit: ${flpyBalance.limit || 'Unlimited'}`);
      console.log(`   ✅ FLPY tokens successfully distributed!`);
    }
    
    return !!flpyBalance;
    
  } catch (error) {
    console.error('❌ Error checking distributor account:', error.message);
    return false;
  }
}

async function checkPiTomlAccessibility() {
  try {
    console.log('\n📋 CHECKING PI.TOML ACCESSIBILITY');
    console.log('─'.repeat(50));
    
    const piTomlUrl = 'https://flappypi.fun/.well-known/pi.toml';
    console.log(`📄 Pi.toml URL: ${piTomlUrl}`);
    
    const response = await fetch(piTomlUrl);
    
    if (response.ok) {
      const content = await response.text();
      console.log('✅ Pi.toml is accessible!');
      console.log(`📏 Content length: ${content.length} characters`);
      
      // Check for required fields
      const hasCode = content.includes('code="FLPY"');
      const hasIssuer = content.includes(`issuer="${issuerPublicKey}"`);
      const hasName = content.includes('name=');
      const hasDesc = content.includes('desc=');
      const hasImage = content.includes('image=');
      
      console.log('\n🔍 REQUIRED FIELDS CHECK:');
      console.log(`   ✅ Token Code: ${hasCode ? 'Found' : 'Missing'}`);
      console.log(`   ✅ Issuer: ${hasIssuer ? 'Found' : 'Missing'}`);
      console.log(`   ✅ Name: ${hasName ? 'Found' : 'Missing'}`);
      console.log(`   ✅ Description: ${hasDesc ? 'Found' : 'Missing'}`);
      console.log(`   ✅ Image: ${hasImage ? 'Found' : 'Missing'}`);
      
      return hasCode && hasIssuer && hasName && hasDesc && hasImage;
    } else {
      console.log(`❌ Pi.toml not accessible: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking pi.toml:', error.message);
    return false;
  }
}

async function main() {
  try {
    const tokenInAPI = await checkTokenInPiAPI();
    const issuerOK = await checkIssuerAccount();
    const distributorOK = await checkDistributorAccount();
    const piTomlOK = await checkPiTomlAccessibility();
    
    console.log('\n🎯 FINAL VERIFICATION RESULTS');
    console.log('═'.repeat(60));
    
    console.log(`🔍 Token in Pi API: ${tokenInAPI ? '✅ YES' : '❌ NO'}`);
    console.log(`🏠 Home Domain Set: ${issuerOK ? '✅ YES' : '❌ NO'}`);
    console.log(`💰 Tokens Distributed: ${distributorOK ? '✅ YES' : '❌ NO'}`);
    console.log(`📄 Pi.toml Accessible: ${piTomlOK ? '✅ YES' : '❌ NO'}`);
    
    const allOK = tokenInAPI && issuerOK && distributorOK && piTomlOK;
    
    console.log('\n🎉 OVERALL STATUS:');
    if (allOK) {
      console.log('✅ FLPY TOKEN IS FULLY READY FOR PI WALLET!');
      console.log('═'.repeat(60));
      console.log('🎮 Your token should now be discoverable in Pi Wallet');
      console.log('👥 Users can add FLPY token and establish trustlines');
      console.log('💸 You can distribute tokens to users who have trustlines');
      console.log('🏪 Token can be used in Pi ecosystem applications');
      
      console.log('\n📋 WHAT USERS NEED TO DO:');
      console.log('1. Open Pi Wallet in Pi Browser');
      console.log('2. Go to "Tokens" section');
      console.log('3. Search for "FLPY" or your issuer address');
      console.log('4. Enable/Trust the FLPY token');
      console.log('5. They can now receive FLPY tokens!');
      
    } else {
      console.log('⚠️ SETUP INCOMPLETE - Some issues need to be resolved');
      console.log('Check the failed items above and fix them');
    }
    
    console.log('\n🔗 USEFUL LINKS:');
    console.log(`• Pi API Token: https://api.testnet.minepi.com/assets?asset_code=FLPY&asset_issuer=${issuerPublicKey}`);
    console.log(`• Issuer Account: https://api.testnet.minepi.com/accounts/${issuerPublicKey}`);
    console.log(`• Distributor Account: https://api.testnet.minepi.com/accounts/${distributorPublicKey}`);
    console.log('• Pi Wallet: Access through Pi Browser app');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };