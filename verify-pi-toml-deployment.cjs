const https = require('https');
const fs = require('fs');

async function verifyPiTomlDeployment() {
  console.log('🔍 Verifying Pi.toml deployment status...\n');
  
  // Check local file first
  try {
    const localContent = fs.readFileSync('./public/.well-known/pi.toml', 'utf8');
    console.log('✅ Local pi.toml file exists');
    console.log('📝 Content preview:');
    console.log(localContent.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ Local pi.toml file not found:', error.message);
    return;
  }

  // Test production URL
  const url = 'https://flappypi.fun/.well-known/pi.toml';
  console.log(`🌐 Testing production URL: ${url}`);
  
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('\n✅ SUCCESS: Pi.toml is accessible!');
          console.log('📄 Content:');
          console.log(data);
          
          // Check if new image URL is present
          if (data.includes('https://i.ibb.co/p6RypJ8X/image-png.png')) {
            console.log('\n🎉 NEW IMAGE URL CONFIRMED in production!');
          } else {
            console.log('\n⚠️  New image URL not found in production content');
          }
        } else {
          console.log(`\n❌ ERROR: Unexpected status code ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`\n❌ REQUEST ERROR: ${error.message}`);
      console.log('💡 This might indicate:');
      console.log('   - Deployment still in progress');
      console.log('   - DNS/CDN caching issues');
      console.log('   - Vercel build failure');
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log('\n⏱️  REQUEST TIMEOUT - Deployment might still be in progress');
      req.destroy();
      resolve();
    });
  });
}

// Also check other well-known files for comparison
async function checkOtherWellKnownFiles() {
  console.log('\n🔍 Checking other .well-known files for comparison...');
  
  const testUrls = [
    'https://flappypi.fun/.well-known/stellar.toml',
    'https://flappypi.fun/.well-known/security.txt'
  ];
  
  for (const url of testUrls) {
    console.log(`\n📡 Testing: ${url}`);
    
    await new Promise((resolve) => {
      const req = https.get(url, (res) => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('   ✅ Accessible');
        } else {
          console.log('   ❌ Not accessible');
        }
        res.on('data', () => {}); // consume response
        res.on('end', resolve);
      }).on('error', (error) => {
        console.log(`   ❌ Error: ${error.message}`);
        resolve();
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve();
      });
    });
  }
}

async function main() {
  await verifyPiTomlDeployment();
  await checkOtherWellKnownFiles();
  
  console.log('\n📋 SUMMARY:');
  console.log('If pi.toml is not accessible yet, this could be due to:');
  console.log('1. Vercel deployment still in progress (wait 2-5 minutes)');
  console.log('2. CDN caching (can take up to 15 minutes)');
  console.log('3. DNS propagation delays');
  console.log('\n💡 Try again in a few minutes if not accessible yet.');
}

main().catch(console.error);