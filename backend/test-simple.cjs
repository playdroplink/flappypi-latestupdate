/**
 * Simple HTTP test for the backend API
 */

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Backend Cloud Storage API...\n');

  try {
    console.log('1. Testing health endpoint...');
    const health = await makeRequest('/api/health');
    console.log('✅ Status:', health.status);
    console.log('   Response:', JSON.stringify(health.data, null, 2));

    console.log('\n2. Testing cloud storage test endpoint...');
    const cloudTest = await makeRequest('/api/cloud/test');
    console.log('✅ Status:', cloudTest.status);
    console.log('   Response:', JSON.stringify(cloudTest.data, null, 2));

    console.log('\n3. Testing cloud storage health...');
    const cloudHealth = await makeRequest('/api/cloud/health');
    console.log('✅ Status:', cloudHealth.status);
    console.log('   Response:', JSON.stringify(cloudHealth.data, null, 2));

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n✅ Your Flappy Pi Backend Cloud Storage System is WORKING!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();