#!/usr/bin/env node

/**
 * Complete FLPY Token Configuration Verification
 * Checks all environment variables and pi.toml for consistency
 */

const fs = require('fs');
const path = require('path');
const StellarSDK = require('@stellar/stellar-sdk');

console.log('🔍 FLPY TOKEN - COMPLETE CONFIGURATION VERIFICATION');
console.log('═'.repeat(70));

// Load and parse environment file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envVars = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
          let value = values.join('=');
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          envVars[key] = value;
        }
      }
    });
  }
  return envVars;
}

// Load and parse pi.toml file
function loadPiTomlFile() {
  const tomlPath = path.join(__dirname, 'public', '.well-known', 'pi.toml');
  
  if (fs.existsSync(tomlPath)) {
    const content = fs.readFileSync(tomlPath, 'utf8');
    return content;
  }
  return null;
}

function verifyKeypairs(env) {
  console.log('\n📋 KEYPAIR VERIFICATION');
  console.log('─'.repeat(50));
  
  try {
    // Verify issuer keypair
    const issuerKeypair = StellarSDK.Keypair.fromSecret(env.FLPY_TOKEN_ISSUER_SEED);
    const issuerPublic = issuerKeypair.publicKey();
    
    console.log(`🏭 Issuer Keypair:`);
    console.log(`   Private: ${env.FLPY_TOKEN_ISSUER_SEED}`);
    console.log(`   Public:  ${issuerPublic}`);
    console.log(`   Match:   ${issuerPublic === env.FLPY_TOKEN_ISSUER ? '✅ YES' : '❌ NO'}`);
    
    // Verify distributor keypair
    const distributorKeypair = StellarSDK.Keypair.fromSecret(env.FLPY_DISTRIBUTION_SEED);
    const distributorPublic = distributorKeypair.publicKey();
    
    console.log(`\n💳 Distributor Keypair:`);
    console.log(`   Private: ${env.FLPY_DISTRIBUTION_SEED}`);
    console.log(`   Public:  ${distributorPublic}`);
    console.log(`   Match:   ${distributorPublic === env.FLPY_WALLET_ADDRESS_1 ? '✅ YES' : '❌ NO'}`);
    
    return {
      issuerValid: issuerPublic === env.FLPY_TOKEN_ISSUER,
      distributorValid: distributorPublic === env.FLPY_WALLET_ADDRESS_1,
      issuerPublic,
      distributorPublic
    };
    
  } catch (error) {
    console.error('❌ Keypair verification failed:', error.message);
    return { issuerValid: false, distributorValid: false };
  }
}

function verifyEnvironmentConsistency(env) {
  console.log('\n📋 ENVIRONMENT VARIABLE CONSISTENCY');
  console.log('─'.repeat(50));
  
  const issues = [];
  
  // Check FLPY token configuration consistency
  const flpyFields = [
    'FLPY_TOKEN_CODE',
    'FLPY_TOKEN_ISSUER', 
    'FLPY_TOKEN_AMOUNT',
    'FLPY_TOKEN_NAME',
    'FLPY_TOKEN_DESC',
    'FLPY_TOKEN_IMAGE',
    'FLPY_HOME_DOMAIN'
  ];
  
  const reactFlpyFields = [
    'REACT_APP_FLPY_TOKEN_CODE',
    'REACT_APP_FLPY_TOKEN_ISSUER',
    'REACT_APP_FLPY_TOKEN_AMOUNT', 
    'REACT_APP_FLPY_TOKEN_NAME',
    'REACT_APP_FLPY_TOKEN_DESC',
    'REACT_APP_FLPY_TOKEN_IMAGE',
    'REACT_APP_FLPY_HOME_DOMAIN'
  ];
  
  console.log('🪙 FLPY Token Configuration:');
  flpyFields.forEach((field, index) => {
    const envValue = env[field];
    const reactField = reactFlpyFields[index];
    const reactValue = env[reactField];
    
    const match = envValue === reactValue;
    console.log(`   ${field}: ${match ? '✅' : '❌'} ${envValue || 'MISSING'}`);
    
    if (!match) {
      issues.push(`${field} doesn't match ${reactField}`);
    }
  });
  
  // Check wallet address consistency
  console.log('\n💰 Wallet Address Consistency:');
  const walletFields = [
    'PI_WALLET_ADDRESS',
    'FLAPPY_PI_WALLET_ADDRESS', 
    'MERCHANT_WALLET_ADDRESS',
    'REACT_APP_WALLET_ADDRESS'
  ];
  
  const expectedWallet = env.FLPY_TOKEN_ISSUER;
  walletFields.forEach(field => {
    const value = env[field];
    const match = value === expectedWallet;
    console.log(`   ${field}: ${match ? '✅' : '❌'} ${value || 'MISSING'}`);
    
    if (!match) {
      issues.push(`${field} should match issuer address`);
    }
  });
  
  // Check Pi issuer configuration
  console.log('\n🏭 Pi Issuer Configuration:');
  const issuerFields = [
    'PI_ISSUER_ADDRESS',
    'REACT_APP_PI_ISSUER_ADDRESS'
  ];
  
  issuerFields.forEach(field => {
    const value = env[field];
    const match = value === expectedWallet;
    console.log(`   ${field}: ${match ? '✅' : '❌'} ${value || 'MISSING'}`);
    
    if (!match) {
      issues.push(`${field} should match issuer address`);
    }
  });
  
  return issues;
}

function verifyPiTomlConfiguration(tomlContent, env) {
  console.log('\n📋 PI.TOML CONFIGURATION');
  console.log('─'.repeat(50));
  
  if (!tomlContent) {
    console.log('❌ Pi.toml file not found!');
    return false;
  }
  
  const issues = [];
  
  // Check required fields
  const requiredFields = {
    'code="FLPY"': env.FLPY_TOKEN_CODE,
    [`issuer="${env.FLPY_TOKEN_ISSUER}"`]: env.FLPY_TOKEN_ISSUER,
    'name="Flappy Pi Team"': env.FLPY_TOKEN_NAME,
    'image="https://flappypi.fun/image.png"': env.FLPY_TOKEN_IMAGE,
    'max_supply="21000000"': env.FLPY_TOKEN_AMOUNT
  };
  
  console.log('🔍 Required Field Verification:');
  Object.entries(requiredFields).forEach(([pattern, envValue]) => {
    const found = tomlContent.includes(pattern);
    console.log(`   ${pattern}: ${found ? '✅ Found' : '❌ Missing'}`);
    
    if (!found) {
      issues.push(`Missing or incorrect: ${pattern}`);
    }
  });
  
  // Check file accessibility
  console.log('\n📄 File Details:');
  console.log(`   Content Length: ${tomlContent.length} characters`);
  console.log(`   Contains CURRENCIES: ${tomlContent.includes('[[CURRENCIES]]') ? '✅ YES' : '❌ NO'}`);
  console.log(`   Contains DOCUMENTATION: ${tomlContent.includes('[DOCUMENTATION]') ? '✅ YES' : '❌ NO'}`);
  
  return issues.length === 0;
}

async function verifyNetworkConfiguration(env) {
  console.log('\n📋 NETWORK CONFIGURATION');
  console.log('─'.repeat(50));
  
  try {
    const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
    
    // Test connection to Pi testnet
    console.log('🌐 Testing Pi Network Connection...');
    const response = await server.ledgers().order("desc").limit(1).call();
    
    if (response && response.records && response.records.length > 0) {
      console.log('✅ Pi Testnet connection successful');
      console.log(`   Latest Ledger: ${response.records[0].sequence}`);
      console.log(`   Base Fee: ${response.records[0].base_fee_in_stroops} stroops`);
    }
    
    // Check if accounts exist
    console.log('\n🏭 Account Verification:');
    try {
      const issuerAccount = await server.loadAccount(env.FLPY_TOKEN_ISSUER);
      console.log(`   Issuer Account: ✅ EXISTS (Seq: ${issuerAccount.sequenceNumber()})`);
      console.log(`   Home Domain: ${issuerAccount.homeDomain || 'Not set'}`);
    } catch (e) {
      console.log(`   Issuer Account: ❌ NOT FOUND`);
    }
    
    try {
      const distributorKeypair = StellarSDK.Keypair.fromSecret(env.FLPY_DISTRIBUTION_SEED);
      const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
      console.log(`   Distributor Account: ✅ EXISTS (Seq: ${distributorAccount.sequenceNumber()})`);
      
      // Check for FLPY balance
      const flpyBalance = distributorAccount.balances.find(b => 
        b.asset_code === 'FLPY' && b.asset_issuer === env.FLPY_TOKEN_ISSUER
      );
      
      if (flpyBalance) {
        console.log(`   FLPY Balance: ✅ ${flpyBalance.balance} FLPY`);
      } else {
        console.log(`   FLPY Balance: ❌ No FLPY tokens found`);
      }
    } catch (e) {
      console.log(`   Distributor Account: ❌ NOT FOUND`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Network verification failed:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive configuration verification...\n');
    
    // Load configurations
    const env = loadEnvFile();
    const tomlContent = loadPiTomlFile();
    
    console.log(`📊 Loaded ${Object.keys(env).length} environment variables`);
    console.log(`📄 Pi.toml: ${tomlContent ? 'Found' : 'Not found'}`);
    
    // Verify keypairs
    const keypairResults = verifyKeypairs(env);
    
    // Verify environment consistency
    const envIssues = verifyEnvironmentConsistency(env);
    
    // Verify pi.toml
    const tomlValid = verifyPiTomlConfiguration(tomlContent, env);
    
    // Verify network configuration
    const networkValid = await verifyNetworkConfiguration(env);
    
    // Final summary
    console.log('\n🎯 VERIFICATION SUMMARY');
    console.log('═'.repeat(70));
    
    const allValid = keypairResults.issuerValid && 
                    keypairResults.distributorValid && 
                    envIssues.length === 0 && 
                    tomlValid && 
                    networkValid;
    
    console.log(`🔑 Keypair Validation: ${keypairResults.issuerValid && keypairResults.distributorValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`⚙️ Environment Config: ${envIssues.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📄 Pi.toml Config: ${tomlValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🌐 Network Config: ${networkValid ? '✅ PASS' : '❌ FAIL'}`);
    
    if (allValid) {
      console.log('\n🎉 ALL CONFIGURATIONS VERIFIED SUCCESSFULLY!');
      console.log('═'.repeat(70));
      console.log('✅ Your FLPY token is properly configured');
      console.log('✅ Environment variables are consistent');
      console.log('✅ Pi.toml is correctly set up');
      console.log('✅ Network connectivity is working');
      console.log('✅ Token is ready for Pi Wallet integration');
      
      console.log('\n📋 FINAL CONFIGURATION:');
      console.log(`🪙 Token Code: FLPY`);
      console.log(`🏭 Issuer: ${keypairResults.issuerPublic}`);
      console.log(`💳 Distributor: ${keypairResults.distributorPublic}`);
      console.log(`🏠 Home Domain: flappypi.fun`);
      console.log(`💰 Total Supply: 21,000,000 FLPY`);
      console.log(`🌐 Network: Pi Testnet`);
      console.log(`📄 Pi.toml: https://flappypi.fun/.well-known/pi.toml`);
      
    } else {
      console.log('\n⚠️ CONFIGURATION ISSUES FOUND:');
      
      if (envIssues.length > 0) {
        console.log('\n❌ Environment Issues:');
        envIssues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      console.log('\nPlease fix the issues above before proceeding.');
    }
    
  } catch (error) {
    console.error('\n💥 Verification failed:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };