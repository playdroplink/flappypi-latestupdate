// Token Verification Script
// Verifies FLPY token setup and pi.toml

const StellarSDK = require("@stellar/stellar-sdk");
const https = require("https");

const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");

// Token details
const TOKEN_CODE = "FLPY";
const ISSUER_PUBLIC_KEY = "GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI";
const HOME_DOMAIN = "flappypi2807.pinet.com";
const TOML_URL = `https://${HOME_DOMAIN}/.well-known/pi.toml`;

async function verifyToken() {
  console.log("🔍 FLPY Token Verification\n");

  try {
    // 1. Check if token exists on blockchain
    console.log("1️⃣ Checking token on Pi Blockchain...");
    const assetUrl = `https://api.minepi.com/assets?asset_code=${TOKEN_CODE}&asset_issuer=${ISSUER_PUBLIC_KEY}`;
    
    const assetResponse = await fetch(assetUrl);
    const assetData = await assetResponse.json();
    
    if (assetData._embedded && assetData._embedded.records.length > 0) {
      const asset = assetData._embedded.records[0];
      console.log("✅ Token found on blockchain");
      console.log(`   Code: ${asset.asset_code}`);
      console.log(`   Issuer: ${asset.asset_issuer}`);
      console.log(`   Supply: ${asset.amount}`);
      console.log(`   Holders: ${asset.num_accounts}`);
      
      // Check home domain link
      if (asset._links && asset._links.toml && asset._links.toml.href) {
        console.log(`   TOML Link: ${asset._links.toml.href}`);
      } else {
        console.log("⚠️  No TOML link found (home domain not set yet)");
      }
    } else {
      console.log("❌ Token not found on blockchain");
      return false;
    }

    // 2. Check issuer account
    console.log("\n2️⃣ Checking issuer account...");
    const issuerAccount = await server.loadAccount(ISSUER_PUBLIC_KEY);
    
    console.log("✅ Issuer account active");
    console.log(`   Home Domain: ${issuerAccount.home_domain || "Not set"}`);
    
    if (issuerAccount.home_domain === HOME_DOMAIN) {
      console.log("✅ Home domain matches expected value");
    } else if (!issuerAccount.home_domain) {
      console.log("⚠️  Home domain not set yet");
    } else {
      console.log(`⚠️  Home domain mismatch: expected ${HOME_DOMAIN}`);
    }

    // 3. Check pi.toml file
    console.log("\n3️⃣ Checking pi.toml file...");
    
    try {
      const tomlResponse = await new Promise((resolve, reject) => {
        https.get(TOML_URL, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
        }).on('error', reject);
      });

      if (tomlResponse.status === 200) {
        console.log("✅ pi.toml file is accessible");
        console.log(`   URL: ${TOML_URL}`);
        console.log(`   Content-Type: ${tomlResponse.headers['content-type']}`);
        
        // Check if content-type is text/plain
        if (tomlResponse.headers['content-type']?.includes('text/plain')) {
          console.log("✅ Correct content-type (text/plain)");
        } else {
          console.log("⚠️  Content-Type should be 'text/plain'");
        }

        // Validate TOML content
        const content = tomlResponse.data;
        const hasCode = content.includes(`code="${TOKEN_CODE}"`);
        const hasIssuer = content.includes(`issuer="${ISSUER_PUBLIC_KEY}"`);
        const hasName = content.includes('name=');
        const hasDesc = content.includes('desc=');
        const hasImage = content.includes('image=');

        console.log("\n   TOML Field Validation:");
        console.log(`   ${hasCode ? '✅' : '❌'} Token code present`);
        console.log(`   ${hasIssuer ? '✅' : '❌'} Issuer address present`);
        console.log(`   ${hasName ? '✅' : '❌'} Name field present`);
        console.log(`   ${hasDesc ? '✅' : '❌'} Description field present`);
        console.log(`   ${hasImage ? '✅' : '❌'} Image URL present`);

        if (hasCode && hasIssuer && hasName && hasDesc && hasImage) {
          console.log("\n✅ All required TOML fields present");
        } else {
          console.log("\n⚠️  Some required TOML fields are missing");
        }
      } else {
        console.log(`❌ pi.toml not accessible (HTTP ${tomlResponse.status})`);
      }
    } catch (error) {
      console.log(`❌ Failed to fetch pi.toml: ${error.message}`);
      console.log("   Make sure the file is hosted at:");
      console.log(`   ${TOML_URL}`);
    }

    // 4. Check balances
    console.log("\n4️⃣ Checking token balances...");
    
    issuerAccount.balances.forEach((balance) => {
      if (balance.asset_type === "native") {
        console.log(`   💎 Pi Balance: ${balance.balance}`);
      }
    });

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📋 Verification Summary");
    console.log("=".repeat(50));
    console.log(`Token Code: ${TOKEN_CODE}`);
    console.log(`Issuer: ${ISSUER_PUBLIC_KEY}`);
    console.log(`Home Domain: ${HOME_DOMAIN}`);
    console.log(`TOML URL: ${TOML_URL}`);
    console.log("\n✅ Verification complete!");
    console.log("\n💡 Next Steps:");
    console.log("   1. Wait for Pi Server to scan and verify your token");
    console.log("   2. Token should appear in Pi Wallet within 24 hours");
    console.log("   3. Users can add FLPY token in their Pi Wallet");
    console.log("   4. Distribute tokens or create liquidity pool");

  } catch (error) {
    console.error("\n❌ Verification Error:", error.message);
    if (error.response && error.response.data) {
      console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run verification
verifyToken().catch(console.error);
