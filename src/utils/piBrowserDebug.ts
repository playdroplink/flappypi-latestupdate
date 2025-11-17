// Pi Browser Mobile Debug Utility
// Helps diagnose Pi Browser mobile testnet payment issues

export class PiBrowserDebug {
  static logEnvironmentInfo() {
    if (typeof window === 'undefined') {
      console.log('🌐 Environment: Server-side');
      return;
    }
    
    const userAgent = window.navigator.userAgent;
    const hostname = window.location.hostname;
    const hasPiSDK = typeof window !== 'undefined' && window.Pi;
    
    // Pi Browser detection
    const isPiBrowserApp = userAgent.includes('Pi Browser') || 
                          userAgent.includes('PiNetwork') ||
                          userAgent.includes('PiBrowser') ||
                          userAgent.includes('PiApp');
    
    // Mobile detection
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Domain detection
    const isPiNetworkDomain = hostname.includes('.pinet.com') ||
                            hostname.includes('.minepi.com') ||
                            hostname.includes('testnet.minepi.com') ||
                            hostname.includes('flappypi2807.pinet.com');
    
    console.log('🔍 Pi Browser Mobile Debug Info:');
    console.log('  📱 User Agent:', userAgent.substring(0, 100));
    console.log('  🌐 Hostname:', hostname);
    console.log('  📱 Is Mobile:', isMobile);
    console.log('  🦅 Is Pi Browser App:', isPiBrowserApp);
    console.log('  🌍 Is Pi Network Domain:', isPiNetworkDomain);
    console.log('  🔧 Has Pi SDK:', hasPiSDK);
    console.log('  📊 Pi SDK Type:', typeof window.Pi);
    console.log('  🔗 Pi SDK Methods:', hasPiSDK ? Object.keys(window.Pi) : 'N/A');
    
    // Check for common issues
    if (!isMobile) {
      console.warn('⚠️ Not detected as mobile device');
    }
    
    if (!isPiBrowserApp && !isPiNetworkDomain && !hasPiSDK) {
      console.warn('⚠️ Not detected as Pi Browser environment');
    }
    
    if (!hasPiSDK) {
      console.warn('⚠️ Pi SDK not available - payments will not work');
    }
    
    return {
      isMobile,
      isPiBrowserApp,
      isPiNetworkDomain,
      hasPiSDK,
      userAgent: userAgent.substring(0, 100),
      hostname
    };
  }
  
  static async testPiSDKInitialization() {
    console.log('🧪 Testing Pi SDK Initialization...');
    
    if (!window.Pi) {
      console.error('❌ Pi SDK not available');
      return false;
    }
    
    try {
      // Test initialization with mainnet config
      const config = {
        version: '2.0',
        sandbox: false,
        appId: 'flappypi2807',
        apiKey: 'pzrhprz7ppwn96vvailrtupwnc5krgjykbormz54oysidzblbm7stfoxxxnxlwkl',
        validationKey: '312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156',
        network: 'mainnet',
        testnetMode: false,
        mobileOptimized: true
      };
      
      console.log('🔧 Testing with config:', config);
      
      await window.Pi.init(config);
      console.log('✅ Pi SDK initialization successful');
      
      // Test payment creation
      const testPaymentData = {
        amount: 0.01,
        memo: 'Test payment',
        metadata: { test: true },
        network: 'testnet'
      };
      
      console.log('💳 Testing payment creation...');
      window.Pi.createPayment(testPaymentData, {
        onReadyForServerApproval: (paymentId: string) => console.log('Ready for approval:', paymentId),
        onReadyForServerCompletion: (paymentId: string, txid: string) => console.log('Payment completed:', paymentId, txid),
        onCancel: (paymentId: string) => console.warn('Payment cancelled:', paymentId),
        onError: (error: any) => console.error('Payment error:', error)
      });
      console.log('✅ Payment initiation invoked');
      
      return true;
      
    } catch (error) {
      console.error('❌ Pi SDK initialization failed:', error);
      return false;
    }
  }
  
  static checkPaymentRequirements() {
    console.log('🔍 Checking Payment Requirements...');
    
    const requirements = {
      piBrowser: typeof window !== 'undefined' && window.Pi,
      mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      testnetConfig: false,
      appId: 'flappypi2807',
      apiKey: 'pzrhprz7ppwn96vvailrtupwnc5krgjykbormz54oysidzblbm7stfoxxxnxlwkl',
      validationKey: '312c3da8cf132ea3fd3a8cd40ea7cf4a26da159bbf498808af319e9d6b35e4be5aa50459cd3c81dea595adf9aa4c16428f6dce247015032933797200d1acf156'
    };
    
    console.log('📋 Payment Requirements Check:');
    Object.entries(requirements).forEach(([key, value]) => {
      console.log(`  ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    const allMet = Object.values(requirements).every(Boolean);
    console.log(`🎯 All requirements met: ${allMet ? 'YES' : 'NO'}`);
    
    return requirements;
  }
}

// Auto-run debug on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('🚀 Pi Browser Mobile Debug - Auto Check');
    PiBrowserDebug.logEnvironmentInfo();
    PiBrowserDebug.checkPaymentRequirements();
  });
}
