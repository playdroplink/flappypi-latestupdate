#!/usr/bin/env node

/**
 * Pi Network Payment System Test Script
 * This script tests the complete A2U payment flow
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3001/api';
const TEST_USER_UID = 'test_user_' + Date.now();

console.log('🧪 Testing Pi Network Payment System');
console.log('=====================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Test User UID: ${TEST_USER_UID}`);
console.log('');

// Test data
const testPaymentData = {
  amount: 0.1, // Small amount for testing
  memo: 'Test payment from Flappy Pi',
  metadata: {
    gameMode: 'classic',
    score: 100,
    testRun: true
  },
  uid: TEST_USER_UID
};

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log(`   Status: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    return true;
  } catch (error) {
    console.log('❌ Health check failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testCreatePayment() {
  console.log('\n🔍 Testing create payment...');
  try {
    const response = await axios.post(`${BASE_URL}/payments/create`, testPaymentData);
    console.log('✅ Create payment passed');
    console.log(`   Payment ID: ${response.data.paymentId}`);
    console.log(`   Success: ${response.data.success}`);
    return response.data.paymentId;
  } catch (error) {
    console.log('❌ Create payment failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testGetPayment(paymentId) {
  console.log('\n🔍 Testing get payment...');
  try {
    const response = await axios.get(`${BASE_URL}/payments/${paymentId}`);
    console.log('✅ Get payment passed');
    console.log(`   Payment ID: ${response.data.payment.payment_id || 'N/A'}`);
    console.log(`   Amount: ${response.data.payment.amount || 'N/A'}`);
    console.log(`   Status: ${response.data.payment.status || 'N/A'}`);
    return true;
  } catch (error) {
    console.log('❌ Get payment failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testSubmitPayment(paymentId) {
  console.log('\n🔍 Testing submit payment...');
  try {
    const response = await axios.post(`${BASE_URL}/payments/submit`, {
      paymentId: paymentId
    });
    console.log('✅ Submit payment passed');
    console.log(`   Transaction ID: ${response.data.txid}`);
    console.log(`   Success: ${response.data.success}`);
    return response.data.txid;
  } catch (error) {
    console.log('❌ Submit payment failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testCompletePayment(paymentId, txid) {
  console.log('\n🔍 Testing complete payment...');
  try {
    const response = await axios.post(`${BASE_URL}/payments/complete`, {
      paymentId: paymentId,
      txid: txid
    });
    console.log('✅ Complete payment passed');
    console.log(`   Payment Status: ${response.data.payment.status?.developer_completed || 'N/A'}`);
    console.log(`   Success: ${response.data.success}`);
    return true;
  } catch (error) {
    console.log('❌ Complete payment failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testProcessA2U() {
  console.log('\n🔍 Testing complete A2U payment flow...');
  try {
    const response = await axios.post(`${BASE_URL}/payments/process-a2u`, testPaymentData);
    console.log('✅ Process A2U payment passed');
    console.log(`   Payment ID: ${response.data.paymentId}`);
    console.log(`   Transaction ID: ${response.data.txid}`);
    console.log(`   Success: ${response.data.success}`);
    return true;
  } catch (error) {
    console.log('❌ Process A2U payment failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testGetIncompletePayments() {
  console.log('\n🔍 Testing get incomplete payments...');
  try {
    const response = await axios.get(`${BASE_URL}/payments/incomplete/list`);
    console.log('✅ Get incomplete payments passed');
    console.log(`   Incomplete payments: ${response.data.payments?.length || 0}`);
    console.log(`   Success: ${response.data.success}`);
    return true;
  } catch (error) {
    console.log('❌ Get incomplete payments failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Starting payment system tests...\n');
  
  // Test 1: Health check
  const healthCheckPassed = await testHealthCheck();
  if (!healthCheckPassed) {
    console.log('\n❌ Server is not running. Please start the server first.');
    process.exit(1);
  }

  // Test 2: Create payment
  const paymentId = await testCreatePayment();
  if (!paymentId) {
    console.log('\n❌ Cannot continue tests without payment ID');
    return;
  }

  // Test 3: Get payment
  await testGetPayment(paymentId);

  // Test 4: Submit payment (this will fail in test environment without real Pi credentials)
  const txid = await testSubmitPayment(paymentId);
  
  // Test 5: Complete payment (only if submit was successful)
  if (txid) {
    await testCompletePayment(paymentId, txid);
  }

  // Test 6: Get incomplete payments
  await testGetIncompletePayments();

  // Test 7: Process complete A2U flow (this will fail in test environment)
  await testProcessA2U();

  console.log('\n🎉 Payment system tests completed!');
  console.log('\n📝 Note: Some tests may fail in development environment');
  console.log('   without proper Pi Network credentials and mainnet setup.');
  console.log('\n🔧 To run with real payments:');
  console.log('   1. Set up Pi Network mainnet credentials');
  console.log('   2. Configure Supabase database');
  console.log('   3. Set PI_WALLET_PRIVATE_SEED in environment');
}

// Run tests
runTests().catch(console.error);
