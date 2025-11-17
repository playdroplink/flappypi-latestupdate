// Test sandbox configuration
console.log('🧪 Testing Sandbox Configuration...');

// Import the config
import { PI_CONFIG } from './src/config/piConfig.ts';

console.log('✅ PI_CONFIG imported successfully');

// Test network mode
console.log('🌐 Network Mode:', PI_CONFIG.getNetworkMode());
console.log('🧪 Sandbox Mode:', PI_CONFIG.getSandboxSetting());
console.log('🏭 Is Production:', PI_CONFIG.isProduction());
console.log('🌍 Environment:', PI_CONFIG.detectEnvironment());

// Test environment detection
const env = PI_CONFIG.detectEnvironment();
console.log('🔍 Environment Details:', {
  isPiBrowser: env.isPiBrowser,
  isProduction: env.isProduction,
  isDevelopment: env.isDevelopment,
  isPiNet: env.isPiNet,
  isMainnet: env.isMainnet,
  isSandbox: env.isSandbox
});

console.log('✅ Sandbox configuration test completed!');
