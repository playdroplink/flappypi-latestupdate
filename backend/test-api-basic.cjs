/**
 * Simple test script to verify the backend cloud storage is working
 */

const axios = require('axios');

async function testBackendAPI() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🧪 Testing Flappy Pi Backend Cloud Storage API...\n');
  
  try {
    // Test basic health endpoint
    console.log('1. Testing basic health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);
    console.log('   Services:', JSON.stringify(healthResponse.data.services, null, 2));
    
    // Test cloud storage test endpoint
    console.log('\n2. Testing cloud storage test endpoint...');
    const cloudTestResponse = await axios.get(`${baseURL}/cloud/test`);
    console.log('✅ Cloud storage test:', cloudTestResponse.data.message);
    console.log('   Service status:', cloudTestResponse.data.serviceStatus);
    
    // Test cloud storage health endpoint  
    console.log('\n3. Testing cloud storage health endpoint...');
    const cloudHealthResponse = await axios.get(`${baseURL}/cloud/health`);
    console.log('✅ Cloud storage health:', cloudHealthResponse.data.status);
    
    // Test user profile endpoint (will fail due to missing database, but tests endpoint)
    console.log('\n4. Testing user profile endpoint...');
    try {
      const profileResponse = await axios.get(`${baseURL}/cloud/user/test123/profile`);
      console.log('✅ Profile endpoint working:', profileResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 503) {
        console.log('⚠️ Profile endpoint accessible but service not ready (expected)');
      } else {
        console.log('❌ Profile endpoint error:', error.response?.data?.error || error.message);
      }
    }
    
    console.log('\n🎉 Backend API Tests Completed!');
    console.log('\nNext steps:');
    console.log('1. Set up Supabase database tables using the SQL schema');
    console.log('2. Configure PI_SERVER_API_KEY environment variable');
    console.log('3. Test with actual data once database is ready');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   Make sure the server is running with: npm start');
    }
  }
}

// Run tests
testBackendAPI();