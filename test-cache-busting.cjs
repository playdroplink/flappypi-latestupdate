const https = require('https');

async function testCacheBustingPiToml() {
  console.log('🔄 Testing Pi.toml with cache-busting techniques...\n');
  
  const testUrls = [
    'https://flappypi.fun/.well-known/pi.toml',
    'https://flappypi.fun/.well-known/pi.toml?' + Date.now(),
  ];
  
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\n${i + 1}. Testing: ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
    
    await new Promise((resolve) => {
      const options = {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      };
      
      const req = https.get(url, options, (res) => {
        console.log(`   📊 Status: ${res.statusCode}`);
        console.log(`   📋 Content-Type: ${res.headers['content-type']}`);
        console.log(`   🕐 Last-Modified: ${res.headers['last-modified']}`);
        console.log(`   🏷️  ETag: ${res.headers['etag']}`);
        console.log(`   💾 Cache-Control: ${res.headers['cache-control']}`);
        
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          // Check for new image URL
          if (data.includes('https://i.ibb.co/p6RypJ8X/image-png.png')) {
            console.log('   🎉 NEW IMAGE URL FOUND!');
          } else if (data.includes('https://flappypi.fun/image.png')) {
            console.log('   ⚠️  Still showing old image URL');
          } else {
            console.log('   ❓ No recognized image URL found');
          }
          
          // Show first few lines of content
          const lines = data.split('\n').slice(0, 3);
          console.log('   📄 Content preview:');
          lines.forEach(line => console.log(`      ${line}`));
          
          resolve();
        });
      }).on('error', (error) => {
        console.log(`   ❌ Error: ${error.message}`);
        resolve();
      });
      
      req.setTimeout(10000, () => {
        console.log('   ⏱️  Timeout');
        req.destroy();
        resolve();
      });
    });
  }
}

testCacheBustingPiToml().catch(console.error);