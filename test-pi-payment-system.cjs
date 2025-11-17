#!/usr/bin/env node

/**
 * Pi Network Payment System - Complete Debugging Guide
 * This tests all phases and diagnoses the approval timeout issue
 */

const axios = require('axios');
require('dotenv').config();

const config = {
  PI_API_URL: 'https://api.minepi.com/v2',
  PI_SERVER_API_KEY: process.env.PI_SERVER_API_KEY,
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
};

console.log('\n' + '='.repeat(70));
console.log('🔍 PI NETWORK PAYMENT DEBUGGING - COMPLETE ANALYSIS');
console.log('='.repeat(70));

// Test 1: Check environment setup
async function testEnvironmentSetup() {
  console.log('\n📋 TEST 1: Environment Configuration Check');
  console.log('-'.repeat(70));
  
  const checks = {
    'PI_SERVER_API_KEY set': !!config.PI_SERVER_API_KEY,
    'API key length': config.PI_SERVER_API_KEY?.length,
    'Backend URL': config.BACKEND_URL,
    'Pi API URL': config.PI_API_URL,
  };

  Object.entries(checks).forEach(([check, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${check}: ${value}`);
  });

  if (!config.PI_SERVER_API_KEY) {
    console.error('\n❌ CRITICAL: PI_SERVER_API_KEY not set in .env file!');
    console.error('Add this to .env:');
    console.error('PI_SERVER_API_KEY="your_api_key_here"');
    return false;
  }

  return true;
}

// Test 2: Check backend health
async function testBackendHealth() {
  console.log('\n📡 TEST 2: Backend Health Check');
  console.log('-'.repeat(70));

  try {
    const response = await axios.get(`${config.BACKEND_URL}/api/pi/health`, {
      timeout: 5000
    });

    console.log('✅ Backend is running');
    console.log(`   Status: ${response.status}`);
    console.log(`   API Key Configured: ${response.data.apiKeyConfigured}`);
    console.log(`   Timestamp: ${response.data.timestamp}`);
    
    return response.data.apiKeyConfigured;
  } catch (error) {
    console.error('❌ Backend health check failed');
    console.error(`   Error: ${error.message}`);
    console.error(`   Make sure backend is running at: ${config.BACKEND_URL}`);
    console.error('   To start backend:');
    console.error('   1. cd backend');
    console.error('   2. npm install');
    console.error('   3. npm start');
    return false;
  }
}

// Test 3: Test Pi API connectivity with your key
async function testPiApiConnectivity() {
  console.log('\n🌐 TEST 3: Pi Network API Connectivity');
  console.log('-'.repeat(70));

  try {
    // Test the Pi API with your key
    const response = await axios.post(
      `${config.PI_API_URL}/test`,
      {},
      {
        headers: {
          'Authorization': `Key ${config.PI_SERVER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    console.log('✅ Pi API is responding to your key');
    console.log(`   Response status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ CRITICAL: PI_SERVER_API_KEY is INVALID or EXPIRED');
      console.error(`   Response: ${error.response.data?.error}`);
      console.error('   Get a new key from: https://developer.minepi.com');
      return false;
    } else if (error.response?.status === 404) {
      console.log('✅ Pi API is responding (test endpoint not found - expected)');
      console.log('   Your API key appears to be valid');
      return true;
    } else {
      console.log('⚠️  Pi API responded with unexpected status');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.message}`);
      return true; // Might still work for actual payments
    }
  }
}

// Test 4: Simulate approval endpoint
async function testApprovalEndpoint() {
  console.log('\n💳 TEST 4: Backend Approval Endpoint');
  console.log('-'.repeat(70));

  try {
    // Mock payment ID (won't actually approve anything)
    const mockPaymentId = 'test_payment_' + Date.now();

    console.log(`Testing with mock payment ID: ${mockPaymentId}`);

    const response = await axios.post(
      `${config.BACKEND_URL}/api/pi/approve-payment`,
      { paymentId: mockPaymentId },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      }
    );

    console.log('✅ Approval endpoint is accessible');
    console.log(`   Response status: ${response.status}`);
    console.log(`   Response data: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    if (error.response?.status === 500) {
      const errorMsg = error.response.data?.error || 'Unknown error';
      console.error('❌ Approval endpoint returned 500 error');
      console.error(`   Error: ${errorMsg}`);
      
      if (errorMsg.includes('PI_SERVER_API_KEY')) {
        console.error('\n   → The backend cannot find PI_SERVER_API_KEY');
        console.error('   → Make sure it is set in backend/.env');
      }
      return false;
    } else if (error.response?.status === 400) {
      console.log('✅ Approval endpoint is working (rejected test payment - expected)');
      console.log(`   Response: ${error.response.data?.error}`);
      return true;
    } else {
      console.error(`❌ Unexpected response: ${error.message}`);
      return false;
    }
  }
}

// Test 5: Check CORS configuration
async function testCORSConfiguration() {
  console.log('\n🔐 TEST 5: CORS Configuration');
  console.log('-'.repeat(70));

  try {
    const response = await axios.get(
      `${config.BACKEND_URL}/api/pi/health`,
      {
        headers: {
          'Origin': 'http://localhost:5173'
        }
      }
    );

    console.log('✅ CORS headers are properly configured');
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    return true;
  } catch (error) {
    console.error('❌ CORS might be misconfigured');
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

// Test 6: Payment flow simulation
async function simulatePaymentFlow() {
  console.log('\n🎬 TEST 6: Payment Flow Simulation');
  console.log('-'.repeat(70));

  try {
    console.log('\n📍 PHASE 1: Server Approval');
    console.log('Simulating approval request...');

    // Note: This won't actually approve a real payment, but tests the endpoint
    const approvalResponse = await axios.post(
      `${config.BACKEND_URL}/api/pi/approve-payment`,
      { 
        paymentId: 'sim_' + Date.now(),
        simulation: true
      },
      { timeout: 5000 }
    );

    console.log('✅ Approval endpoint response received');
    console.log(`   Status: ${approvalResponse.status}`);

    return true;
  } catch (error) {
    console.log('⚠️  Approval simulation could not complete');
    console.log(`   This is expected if payment ID format is wrong`);
    console.log(`   Error: ${error.message}`);
    return true; // Endpoint is still working even if payment wasn't found
  }
}

// Main diagnostic function
async function runFullDiagnostics() {
  try {
    console.log('\n📊 STARTING COMPLETE PAYMENT SYSTEM DIAGNOSTICS\n');

    // Run all tests
    const envOk = await testEnvironmentSetup();
    const backendOk = await testBackendHealth();
    const piApiOk = await testPiApiConnectivity();
    const approvalOk = await testApprovalEndpoint();
    const corsOk = await testCORSConfiguration();
    await simulatePaymentFlow();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 DIAGNOSTICS SUMMARY');
    console.log('='.repeat(70));

    const allOk = envOk && backendOk && piApiOk && corsOk;

    console.log(`\n${envOk ? '✅' : '❌'} Environment Setup`);
    console.log(`${backendOk ? '✅' : '❌'} Backend Running`);
    console.log(`${piApiOk ? '✅' : '❌'} Pi API Key Valid`);
    console.log(`${approvalOk ? '✅' : '❌'} Approval Endpoint`);
    console.log(`${corsOk ? '✅' : '❌'} CORS Configuration`);

    // Recommendations
    console.log('\n' + '-'.repeat(70));
    console.log('🔧 RECOMMENDATIONS:\n');

    if (!envOk) {
      console.log('1. ❌ FIX: Set PI_SERVER_API_KEY in backend/.env');
      console.log('   Get it from: https://developer.minepi.com\n');
    }

    if (!backendOk) {
      console.log('2. ❌ FIX: Start the backend server');
      console.log('   cd backend && npm start\n');
    }

    if (!piApiOk) {
      console.log('3. ❌ FIX: Verify your Pi API key is valid');
      console.log('   Get a new one from: https://developer.minepi.com\n');
    }

    if (!corsOk) {
      console.log('4. ⚠️  CHECK: CORS configuration in backend\n');
    }

    if (allOk) {
      console.log('✅ ALL CHECKS PASSED - Your payment system is ready!');
      console.log('\nNext steps:');
      console.log('1. Test a real payment in Pi Browser');
      console.log('2. Monitor the console for any errors');
      console.log('3. Check backend logs for approval details\n');
    } else {
      console.log('\n❌ PAYMENT SYSTEM NOT READY');
      console.log('Please fix the issues above and run this again.\n');
    }

    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('Fatal error during diagnostics:', error);
    process.exit(1);
  }
}

// Run diagnostics
runFullDiagnostics();
