import https from 'https';

const urls = [
  'https://flappypi.fun/validation-key.txt',
  'https://flappypi.fun/flappypi.fun-validation-key.txt',
  'https://flappypi.fun/.well-known/flappypi.fun-validation-key.txt'
];

const expectedKey = '027ec69874e556597dc35731bdd1f415c9a2da9117d2162dbf5490fa02d63b396595014bc415ea0191a1dca49c16ebc5c502480a96f0894e2d2591115abf997c';

async function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const content = data.trim();
        const isValid = content === expectedKey;
        console.log(`${isValid ? '✅' : '❌'} ${url}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content: ${content}`);
        console.log(`   Valid: ${isValid}`);
        console.log('');
        resolve({ url, statusCode: res.statusCode, content, isValid });
      });
    }).on('error', (err) => {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      resolve({ url, statusCode: 0, content: '', isValid: false, error: err.message });
    });
  });
}

async function testAllUrls() {
  console.log('🔍 Testing Validation Key URLs...\n');
  
  const results = await Promise.all(urls.map(testUrl));
  
  const allValid = results.every(r => r.isValid);
  
  console.log('📊 Summary:');
  console.log(`   Total URLs tested: ${urls.length}`);
  console.log(`   Valid URLs: ${results.filter(r => r.isValid).length}`);
  console.log(`   Invalid URLs: ${results.filter(r => !r.isValid).length}`);
  console.log(`   Overall Status: ${allValid ? '✅ ALL VALID' : '❌ SOME INVALID'}`);
  
  if (allValid) {
    console.log('\n🎉 All validation keys are working correctly!');
    console.log('Your Pi Network app should now be properly validated.');
  } else {
    console.log('\n⚠️  Some validation keys failed. Please check the deployment.');
  }
}

testAllUrls(); 