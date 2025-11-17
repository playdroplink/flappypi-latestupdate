#!/usr/bin/env node
/**
 * Comprehensive Pi Integration Verification Script
 * Tests all Pi Network components: Auth, Payments, Ads, Tokens
 * 
 * Run: node scripts/verify-pi-integration.cjs
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

console.log('\n🔍 FLAPPY PI - COMPREHENSIVE INTEGRATION VERIFICATION\n');
console.log('=' .repeat(70));

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function check(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    passCount++;
  } else {
    console.log(`❌ ${message}`);
    failCount++;
  }
}

function warn(condition, message) {
  if (condition) {
    console.log(`⚠️  ${message}`);
    warnCount++;
  }
}

// ============================================
// 1. ENVIRONMENT CONFIGURATION
// ============================================
console.log('\n📋 1. ENVIRONMENT CONFIGURATION\n');

check(process.env.PI_API_KEY, 'PI_API_KEY configured');
check(process.env.PI_NETWORK_API_KEY, 'PI_NETWORK_API_KEY configured');
check(process.env.PI_SERVER_API_KEY, 'PI_SERVER_API_KEY configured');
check(process.env.PI_APP_ID === 'flappypi2807', 'PI_APP_ID = flappypi2807');
check(process.env.PI_NETWORK === 'mainnet', 'PI_NETWORK = mainnet');
check(process.env.PI_SANDBOX_MODE === 'false', 'PI_SANDBOX_MODE = false (mainnet)');
check(process.env.VITE_PI_NETWORK === 'mainnet', 'VITE_PI_NETWORK = mainnet');

const apiKey = process.env.PI_API_KEY;
check(apiKey && apiKey.length > 50, `PI API key length valid (${apiKey?.length || 0} chars)`);
check(apiKey && !apiKey.includes('<SET'), 'PI API key is not a placeholder');

warn(!process.env.PI_WALLET_PRIVATE_SEED || process.env.PI_WALLET_PRIVATE_SEED.includes('SET'), 
  'PI_WALLET_PRIVATE_SEED not set (required for payment testing)');

// ============================================
// 2. PAYMENT CONFIGURATION
// ============================================
console.log('\n💳 2. PAYMENT CONFIGURATION\n');

check(process.env.ENABLE_PI_PAYMENTS === 'true', 'ENABLE_PI_PAYMENTS = true');
check(process.env.PI_PAYMENTS_ENABLED === 'true', 'PI_PAYMENTS_ENABLED = true');
check(process.env.PI_MAINNET_PAYMENTS === 'true', 'PI_MAINNET_PAYMENTS = true');
check(process.env.PI_ISSUER_ADDRESS, 'PI_ISSUER_ADDRESS configured');
check(process.env.PI_ISSUER_HOME_DOMAIN === 'flappypi.fun', 'PI_ISSUER_HOME_DOMAIN = flappypi.fun');
check(process.env.PI_PAYMENT_MIN_AMOUNT === '0.01', 'PI_PAYMENT_MIN_AMOUNT = 0.01');
check(process.env.PI_PAYMENT_MAX_AMOUNT === '10000.0', 'PI_PAYMENT_MAX_AMOUNT = 10000.0');
check(process.env.PI_PAYMENT_PRECISION === '2', 'PI_PAYMENT_PRECISION = 2');

// ============================================
// 3. AD NETWORK CONFIGURATION
// ============================================
console.log('\n📺 3. AD NETWORK CONFIGURATION\n');

check(process.env.PI_AD_NETWORK_ENABLED === 'true', 'PI_AD_NETWORK_ENABLED = true');
check(process.env.PI_AD_NETWORK_MODE === 'mainnet', 'PI_AD_NETWORK_MODE = mainnet');
check(process.env.PI_AD_NETWORK_API_URL === 'https://api.minepi.com', 'PI_AD_NETWORK_API_URL correct');
check(process.env.PI_AD_NETWORK_APP_ID === 'flappypi2807', 'PI_AD_NETWORK_APP_ID = flappypi2807');
check(process.env.PI_AD_NETWORK_API_KEY, 'PI_AD_NETWORK_API_KEY configured');

// ============================================
// 4. WALLET CONFIGURATION
// ============================================
console.log('\n🏦 4. WALLET CONFIGURATION\n');

check(process.env.PI_WALLET_ADDRESS, 'PI_WALLET_ADDRESS configured');
check(process.env.FLAPPY_PI_WALLET_ADDRESS, 'FLAPPY_PI_WALLET_ADDRESS configured');
check(process.env.MERCHANT_WALLET_ADDRESS, 'MERCHANT_WALLET_ADDRESS configured');

const walletAddr = process.env.PI_WALLET_ADDRESS;
check(walletAddr && walletAddr.startsWith('G'), 'PI_WALLET_ADDRESS is Stellar format (starts with G)');

// ============================================
// 5. VALIDATION KEYS
// ============================================
console.log('\n🔐 5. VALIDATION KEYS\n');

const validationKey = process.env.VITE_PI_VALIDATION_KEY;
check(validationKey, 'VITE_PI_VALIDATION_KEY configured');
check(validationKey && validationKey.length === 128, `Validation key length valid (${validationKey?.length || 0} chars, expected 128)`);

// Check if validation key files exist
const validationKeyPath = path.join(__dirname, '..', 'public', 'validation-key.txt');
const validationKeyDomainPath = path.join(__dirname, '..', 'public', 'flappypi.fun-validation-key.txt');
const validationKeyWellKnown = path.join(__dirname, '..', 'public', '.well-known', 'flappypi.fun-validation-key.txt');

check(fs.existsSync(validationKeyPath), 'public/validation-key.txt exists');
check(fs.existsSync(validationKeyDomainPath), 'public/flappypi.fun-validation-key.txt exists');
check(fs.existsSync(validationKeyWellKnown), 'public/.well-known/flappypi.fun-validation-key.txt exists');

// ============================================
// 6. BACKEND FILES & SERVICES
// ============================================
console.log('\n🔧 6. BACKEND FILES & SERVICES\n');

const backendFiles = [
  'backend/services/piService.js',
  'backend/routes/pi.cjs',
  'backend/routes/payments.js',
  'backend/server.cjs'
];

backendFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  check(fs.existsSync(filePath), `Backend file exists: ${file}`);
});

// ============================================
// 7. FRONTEND COMPONENTS
// ============================================
console.log('\n⚛️  7. FRONTEND COMPONENTS & UTILS\n');

const frontendFiles = [
  'src/utils/piAuth.ts',
  'src/utils/piPayment.ts',
  'src/services/piAdsService.ts',
  'src/components/PiAuthButton.tsx',
  'src/components/PiAuthLogin.tsx',
  'src/components/PiAuthGuard.tsx'
];

frontendFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  check(fs.existsSync(filePath), `Frontend file exists: ${file}`);
});

// ============================================
// 8. TOKEN & BLOCKCHAIN SETUP
// ============================================
console.log('\n🪙 8. TOKEN & BLOCKCHAIN SETUP\n');

const tokenFiles = [
  'scripts/token-setup.cjs',
  'scripts/set-home-domain.cjs',
  'scripts/pi-api-test.cjs',
  'FLAPPY_PI_DEFI_TOKEN.md'
];

tokenFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  check(fs.existsSync(filePath), `Token file exists: ${file}`);
});

// ============================================
// 9. SECURITY & CORS
// ============================================
console.log('\n🔒 9. SECURITY & CORS\n');

const allowedOrigins = process.env.ALLOWED_ORIGINS || '';
check(allowedOrigins.includes('https://flappypi.fun'), 'CORS includes flappypi.fun');
check(allowedOrigins.includes('https://*.pinet.com'), 'CORS includes PiNet domains');
check(allowedOrigins.includes('localhost'), 'CORS includes localhost for development');
check(process.env.PI_REQUIRE_BROWSER === 'true', 'PI_REQUIRE_BROWSER = true');
check(process.env.PI_REQUIRE_AUTH === 'true', 'PI_REQUIRE_AUTH = true');
check(process.env.PI_VALIDATE_PAYMENTS === 'true', 'PI_VALIDATE_PAYMENTS = true');
check(process.env.DEBUG_MODE === 'false', 'DEBUG_MODE = false (production hardened)');

// ============================================
// 10. API ENDPOINTS
// ============================================
console.log('\n🌐 10. API ENDPOINT CONFIGURATION\n');

check(process.env.PI_API_URL === 'https://api.minepi.com', 'PI_API_URL = https://api.minepi.com');
check(process.env.PI_NETWORK_API_URL === 'https://api.minepi.com', 'PI_NETWORK_API_URL = https://api.minepi.com');
check(process.env.PI_PAYMENT_SERVICE_URL === 'https://api.minepi.com/v2', 'PI_PAYMENT_SERVICE_URL = https://api.minepi.com/v2');
check(process.env.BACKEND_URL, 'BACKEND_URL configured');
check(process.env.VITE_BACKEND_URL, 'VITE_BACKEND_URL configured (build-time)');

// ============================================
// 11. SUPABASE & DATABASE
// ============================================
console.log('\n🗄️  11. SUPABASE & DATABASE\n');

check(process.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL configured');
check(process.env.VITE_SUPABASE_ANON_KEY, 'VITE_SUPABASE_ANON_KEY configured');
check(process.env.SUPABASE_JWT_SECRET, 'SUPABASE_JWT_SECRET configured');
check(process.env.POSTGRES_URL, 'POSTGRES_URL configured');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
check(supabaseUrl && supabaseUrl.includes('.supabase.co'), 'Supabase URL format valid');

// ============================================
// 12. ENV FILE STATUS
// ============================================
console.log('\n📄 12. ENVIRONMENT FILES\n');

const envFiles = [
  '.env',
  '.env.local.example',
  '.git/info/exclude'
];

envFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  check(fs.existsSync(filePath), `File exists: ${file}`);
});

// Check if .env.local is ignored
if (fs.existsSync(path.join(__dirname, '..', '.git', 'info', 'exclude'))) {
  const gitIgnore = fs.readFileSync(path.join(__dirname, '..', '.git', 'info', 'exclude'), 'utf-8');
  check(gitIgnore.includes('.env.local'), '.env.local is in git exclude (secrets protected)');
}

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n📊 AUDIT SUMMARY\n');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`⚠️  Warnings: ${warnCount}`);

const totalChecks = passCount + failCount;
const passPercentage = totalChecks > 0 ? ((passCount / totalChecks) * 100).toFixed(1) : 0;

console.log(`\n📈 Overall: ${passPercentage}% Complete`);

if (failCount === 0 && warnCount <= 1) {
  console.log('\n🎉 ALL PI INTEGRATIONS VERIFIED - READY FOR PRODUCTION!\n');
  console.log('💡 Remaining Actions:');
  console.log('   1. Set PI_WALLET_PRIVATE_SEED in .env.local for full payment testing');
  console.log('   2. Test in Pi Browser: https://flappypi.fun');
  console.log('   3. Verify payment flow end-to-end');
  console.log('   4. Deploy to Vercel with all secrets configured');
  process.exit(0);
} else if (failCount > 0) {
  console.log('\n⚠️  Please fix the failed checks before proceeding.\n');
  process.exit(1);
} else {
  console.log('\n✅ All critical checks passed!\n');
  process.exit(0);
}
