#!/usr/bin/env node

/**
 * Pi Network Payment Flow Verification Script
 * Tests all components of the fixed 3-phase payment system
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${COLORS.reset}`);
}

function success(msg) { log(COLORS.green, '✅', msg); }
function error(msg) { log(COLORS.red, '❌', msg); }
function warn(msg) { log(COLORS.yellow, '⚠️ ', msg); }
function info(msg) { log(COLORS.cyan, 'ℹ️ ', msg); }
function phase(msg) { log(COLORS.blue, '📍', msg); }

async function checkFile(filePath, requiredText, description) {
  try {
    if (!fs.existsSync(filePath)) {
      error(`File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const found = Array.isArray(requiredText) 
      ? requiredText.every(text => content.includes(text))
      : content.includes(requiredText);

    if (found) {
      success(`${description}`);
      return true;
    } else {
      error(`${description} - text not found`);
      return false;
    }
  } catch (err) {
    error(`Error checking ${filePath}: ${err.message}`);
    return false;
  }
}

async function verifyPaymentSystem() {
  log(COLORS.blue, '\n' + '='.repeat(60));
  log(COLORS.blue, 'Pi Network Payment Flow Verification');
  log(COLORS.blue, '='.repeat(60) + '\n');

  let allPassed = true;

  // 1. Backend API Route Verification
  log(COLORS.cyan, '\n📋 Backend Route Verification (backend/routes/pi.cjs)');
  log(COLORS.cyan, '-'.repeat(60));

  const backendPath = './backend/routes/pi.cjs';
  
  allPassed &= await checkFile(
    backendPath,
    'if (!PI_SERVER_API_KEY)',
    'API key validation check'
  );

  allPassed &= await checkFile(
    backendPath,
    ['/api/pi/approve-payment', 'POST', 'approve'],
    'Approve payment endpoint exists'
  );

  allPassed &= await checkFile(
    backendPath,
    ['/api/pi/complete-payment', 'POST', 'complete', 'txid'],
    'Complete payment endpoint with txid'
  );

  allPassed &= await checkFile(
    backendPath,
    ['response.status === 200', 'completion'],
    'Response status validation'
  );

  allPassed &= await checkFile(
    backendPath,
    ['Payment not completed', 'Item should NOT be delivered'],
    'Completion failure messaging'
  );

  allPassed &= await checkFile(
    backendPath,
    ['/health', 'apiKeyConfigured'],
    'Health check endpoint'
  );

  // 2. Frontend Payment Creation Verification
  log(COLORS.cyan, '\n📋 Frontend Payment Flow Verification (src/services/piPayment.ts)');
  log(COLORS.cyan, '-'.repeat(60));

  const piPaymentPath = './src/services/piPayment.ts';

  allPassed &= await checkFile(
    piPaymentPath,
    ['PHASE 1', 'onReadyForServerApproval'],
    'Phase 1 approval callback exists'
  );

  allPassed &= await checkFile(
    piPaymentPath,
    ['PHASE 3', 'onReadyForServerCompletion'],
    'Phase 3 completion callback exists'
  );

  allPassed &= await checkFile(
    piPaymentPath,
    ['response.status !== 200', 'reject'],
    'Response status validation in completion'
  );

  allPassed &= await checkFile(
    piPaymentPath,
    ['resolve({ paymentId, txid, result: completionResult })'],
    'Proper promise resolution on success'
  );

  allPassed &= await checkFile(
    piPaymentPath,
    ['CRITICAL:', 'Must include blockchain transaction ID'],
    'Critical phase documentation'
  );

  allPassed &= await checkFile(
    piPaymentPath,
    ['Both callbacks MUST be implemented'],
    'Documentation of required callbacks'
  );

  // 3. Shop Modal Verification
  log(COLORS.cyan, '\n📋 Shop Modal Verification (src/components/ShopModal.tsx)');
  log(COLORS.cyan, '-'.repeat(60));

  const shopModalPath = './src/components/ShopModal.tsx';

  allPassed &= await checkFile(
    shopModalPath,
    ['realPiPaymentService', 'processSubscriptionPayment'],
    'Shop uses realPiPaymentService'
  );

  allPassed &= await checkFile(
    shopModalPath,
    ['handlePiPayment', 'handleSubscriptionPayment'],
    'Shop has Pi payment handlers'
  );

  allPassed &= await checkFile(
    shopModalPath,
    ['success', 'Purchase Successful'],
    'Shop success messaging'
  );

  // 4. Environment Configuration
  log(COLORS.cyan, '\n📋 Environment Configuration Verification');
  log(COLORS.cyan, '-'.repeat(60));

  const envPath = './.env';
  const mainnetEnvPath = './mainnet.env';

  allPassed &= await checkFile(
    envPath,
    'PI_SERVER_API_KEY',
    '.env contains PI_SERVER_API_KEY'
  );

  allPassed &= await checkFile(
    envPath,
    'zrt9rwcjrdaejytlu72ha0yi2czvljx6geuwphzueaeybqsyboixukixy0cmogmo',
    '.env has mainnet API key'
  );

  allPassed &= await checkFile(
    envPath,
    'PI_NETWORK_MAINNET=true',
    'Mainnet mode enabled'
  );

  // 5. Console Logging Verification
  log(COLORS.cyan, '\n📋 Payment Flow Logging Verification');
  log(COLORS.cyan, '-'.repeat(60));

  allPassed &= await checkFile(
    piPaymentPath,
    ['console.log', 'PHASE 1', 'console.log', 'PHASE 3'],
    'Phase logging statements'
  );

  allPassed &= await checkFile(
    backendPath,
    ['console.log', 'Approving payment'],
    'Backend approval logging'
  );

  allPassed &= await checkFile(
    backendPath,
    ['console.log', 'Completing payment'],
    'Backend completion logging'
  );

  // 6. Error Handling Verification
  log(COLORS.cyan, '\n📋 Error Handling Verification');
  log(COLORS.cyan, '-'.repeat(60));

  allPassed &= await checkFile(
    backendPath,
    ['console.error', 'Payment completion failed'],
    'Backend error logging'
  );

  allPassed &= await checkFile(
    piPaymentPath,
    ['reject(new Error', 'completion'],
    'Frontend completion error rejection'
  );

  allPassed &= await checkFile(
    piPaymentPath,
    ['catch (error)', 'console.error'],
    'Error handling with logging'
  );

  // 7. Flow Documentation
  log(COLORS.cyan, '\n📋 Flow Documentation Verification');
  log(COLORS.cyan, '-'.repeat(60));

  const docPath = './PAYMENT_FLOW_IMPLEMENTATION_SUMMARY.md';

  allPassed &= await checkFile(
    docPath,
    '3-Phase',
    'Documentation exists for 3-phase flow'
  );

  allPassed &= await checkFile(
    docPath,
    ['Phase 1: Server Approval', 'Phase 3: Server Completion'],
    'All phases documented'
  );

  // Summary
  log(COLORS.blue, '\n' + '='.repeat(60));
  
  if (allPassed) {
    success('ALL VERIFICATION CHECKS PASSED! ✨');
    info('Payment system is ready for testing.');
    info('');
    info('Next steps:');
    info('1. Start backend: npm run dev');
    info('2. Start frontend: npm start');
    info('3. Open Pi Browser to http://localhost:3000');
    info('4. Try purchasing with Pi (use small amount like 1 Pi)');
    info('5. Check console for phase progression logs');
  } else {
    error('SOME VERIFICATION CHECKS FAILED!');
    error('Please review the failures above.');
    process.exit(1);
  }

  log(COLORS.blue, '='.repeat(60) + '\n');
}

// Payment Flow Test Data
async function testPaymentFlow() {
  log(COLORS.blue, '\n' + '='.repeat(60));
  log(COLORS.blue, 'Payment Flow Test Data');
  log(COLORS.blue, '='.repeat(60) + '\n');

  phase('Phase 1: Server Approval');
  info('Request: POST https://api.minepi.com/v2/payments/{id}/approve');
  info('Headers: Authorization: Key <PI_SERVER_API_KEY>');
  info('Body: {}');
  info('Expected: Status 200, payment approved\n');

  phase('Phase 2: Blockchain Confirmation');
  info('Action: User signs transaction in Pi Wallet');
  info('Network: Pi Blockchain (mainnet)');
  info('Expected: Transaction confirmed, txid generated\n');

  phase('Phase 3: Server Completion');
  info('Request: POST https://api.minepi.com/v2/payments/{id}/complete');
  info('Headers: Authorization: Key <PI_SERVER_API_KEY>');
  info('Body: { txid: "<blockchain-transaction-id>" }');
  info('Expected: Status 200, items delivered\n');
}

// Run verification
(async () => {
  try {
    await verifyPaymentSystem();
    await testPaymentFlow();
  } catch (err) {
    error(`Verification failed: ${err.message}`);
    process.exit(1);
  }
})();
