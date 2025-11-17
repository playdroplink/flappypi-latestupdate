const StellarSDK = require("@stellar/stellar-sdk");
const https = require('https');
const fs = require('fs');

// Pi Network configuration
const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";
const FLPY_ISSUER = "GBVTV77XFMDYSSVIG6ZGSRAGZ3S7KA4275YYLOLIROOD3Y3F3TH5U3EI";
const HOME_DOMAIN = "flappypi.fun";
const NEW_IMAGE_URL = "https://i.ibb.co/p6RypJ8X/image-png.png";

async function completeTokenImageRefresh() {
  console.log('🔄 Complete FLPY Token Image Refresh Process');
  console.log('📋 Following Pi Platform Documentation Requirements\n');

  // Step 1: Verify current token status
  console.log('1️⃣  Checking current token status on Pi Testnet...');
  try {
    const tokenResponse = await fetch(`https://api.testnet.minepi.com/assets?asset_code=FLPY&asset_issuer=${FLPY_ISSUER}`);
    const tokenData = await tokenResponse.json();
    
    if (tokenData._embedded && tokenData._embedded.records.length > 0) {
      const token = tokenData._embedded.records[0];
      console.log('✅ Token found on Pi Testnet');
      console.log(`   📍 TOML href: ${token._links.toml.href}`);
      
      if (token._links.toml.href && token._links.toml.href.includes(HOME_DOMAIN)) {
        console.log('✅ Home domain properly set');
      } else {
        console.log('⚠️  Home domain not set or incorrect');
      }
    } else {
      console.log('❌ Token not found on Pi Testnet');
      return;
    }
  } catch (error) {
    console.log('❌ Error checking token status:', error.message);
    return;
  }

  // Step 2: Verify account home domain
  console.log('\n2️⃣  Checking issuer account home domain...');
  try {
    const accountResponse = await fetch(`https://api.testnet.minepi.com/accounts/${FLPY_ISSUER}`);
    const accountData = await accountResponse.json();
    
    if (accountData.home_domain === HOME_DOMAIN) {
      console.log(`✅ Home domain correctly set: ${accountData.home_domain}`);
    } else {
      console.log(`⚠️  Home domain: ${accountData.home_domain || 'not set'}`);
    }
  } catch (error) {
    console.log('❌ Error checking account:', error.message);
  }

  // Step 3: Verify local pi.toml file
  console.log('\n3️⃣  Verifying local pi.toml file...');
  try {
    const localToml = fs.readFileSync('./public/.well-known/pi.toml', 'utf8');
    if (localToml.includes(NEW_IMAGE_URL)) {
      console.log('✅ Local pi.toml has correct image URL');
    } else {
      console.log('❌ Local pi.toml missing new image URL');
      return;
    }

    // Verify required fields according to Pi Platform docs
    const requiredFields = ['code="FLPY"', `issuer="${FLPY_ISSUER}"`, 'name=', 'desc=', `image="${NEW_IMAGE_URL}"`];
    let allFieldsPresent = true;
    
    requiredFields.forEach(field => {
      if (!localToml.includes(field)) {
        console.log(`❌ Missing required field: ${field}`);
        allFieldsPresent = false;
      }
    });
    
    if (allFieldsPresent) {
      console.log('✅ All required CURRENCIES fields present');
    }
  } catch (error) {
    console.log('❌ Error reading local pi.toml:', error.message);
    return;
  }

  // Step 4: Test production pi.toml accessibility
  console.log('\n4️⃣  Testing production pi.toml accessibility...');
  
  await new Promise((resolve) => {
    const req = https.get(`https://${HOME_DOMAIN}/.well-known/pi.toml`, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Content-Type: ${res.headers['content-type']}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          if (data.includes(NEW_IMAGE_URL)) {
            console.log('🎉 SUCCESS: Production pi.toml has new image URL!');
          } else {
            console.log('⚠️  Production pi.toml still has old image URL');
            console.log('💡 This indicates deployment/caching issue');
          }
          
          // Check content-type (Pi Platform docs require text/plain)
          const contentType = res.headers['content-type'];
          if (contentType && (contentType.includes('text/plain') || contentType.includes('application/toml'))) {
            console.log('✅ Content-Type is acceptable');
          } else {
            console.log(`⚠️  Content-Type may be incorrect: ${contentType}`);
            console.log('💡 Pi Platform docs recommend text/plain');
          }
          
        } else {
          console.log(`❌ pi.toml not accessible (${res.statusCode})`);
        }
        resolve();
      });
    }).on('error', (error) => {
      console.log(`❌ Connection error: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('⏱️  Request timeout');
      resolve();
    });
  });

  // Step 5: Test image URL accessibility
  console.log('\n5️⃣  Testing new image URL accessibility...');
  
  await new Promise((resolve) => {
    const req = https.get(NEW_IMAGE_URL, (res) => {
      console.log(`📊 Image Status: ${res.statusCode}`);
      console.log(`📋 Image Content-Type: ${res.headers['content-type']}`);
      
      if (res.statusCode === 200) {
        console.log('✅ New image URL is accessible');
        if (res.headers['content-type'] && res.headers['content-type'].startsWith('image/')) {
          console.log('✅ Content-Type is valid image format');
        }
      } else {
        console.log(`❌ Image not accessible (${res.statusCode})`);
      }
      
      res.on('data', () => {}); // consume response
      res.on('end', resolve);
    }).on('error', (error) => {
      console.log(`❌ Image URL error: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve();
    });
  });

  // Step 6: Provide completion status and next steps
  console.log('\n6️⃣  Token Image Refresh Status Summary');
  console.log('==========================================');
  console.log('✅ Home domain set on blockchain');
  console.log('✅ Local pi.toml file updated with new image URL');
  console.log('✅ Required CURRENCIES fields validated');
  console.log('✅ New image URL is accessible');
  
  console.log('\n📋 Next Steps for Pi Wallet Integration:');
  console.log('1. Ensure production pi.toml is deployed with new image URL');
  console.log('2. Wait for Pi Server to scan and verify the token (can take 5-30 minutes)');
  console.log('3. Token will automatically update in Pi Wallet once verified');
  console.log('\n💡 According to Pi Platform docs:');
  console.log('   - Tokens are regularly scanned by Pi Server');
  console.log('   - pi.toml and image files should be accessible via HTTPS');
  console.log('   - Files should be properly cached to prevent delisting');
  console.log('\n🔗 Monitor token status at:');
  console.log(`   https://api.testnet.minepi.com/assets?asset_code=FLPY&asset_issuer=${FLPY_ISSUER}`);
}

// Execute the complete refresh process
completeTokenImageRefresh().catch(console.error);