// Mainnet Integration Test
// Comprehensive test suite for Pi Network mainnet integration

import { PI_CONFIG } from '../config/piConfig';
import { piAuth } from '../config/piAuth';
import { piMetadataService } from '../services/piMetadataService';
import { adService } from '../services/adService';
import { payWithPi } from '../services/piPayment';

declare global {
  interface Window {
    Pi: any;
  }
}

export interface MainnetTestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export interface MainnetIntegrationStatus {
  overall: boolean;
  tests: MainnetTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  environment: {
    isPiBrowser: boolean;
    isMainnet: boolean;
    piSDKVersion: string;
    networkMode: string;
    hostname: string;
  };
}

class MainnetIntegrationTest {
  private testResults: MainnetTestResult[] = [];

  /**
   * Run comprehensive mainnet integration test
   */
  async runFullTest(): Promise<MainnetIntegrationStatus> {
    console.log('🧪 Starting Mainnet Integration Test...');
    this.testResults = [];

    // Environment detection
    const environment = this.detectEnvironment();
    
    // Run all tests
    await this.testPiSDKAvailability();
    await this.testMainnetConfiguration();
    await this.testPiAuthentication();
    await this.testPiPayments();
    await this.testPiAdNetwork();
    await this.testMetadataService();
    await this.testUserDataHandling();
    await this.testNetworkConnectivity();

    // Calculate summary
    const summary = this.calculateSummary();
    const overall = summary.failed === 0 && summary.passed > 0;

    const result: MainnetIntegrationStatus = {
      overall,
      tests: this.testResults,
      summary,
      environment
    };

    console.log('🧪 Mainnet Integration Test Complete:', result);
    return result;
  }

  /**
   * Detect current environment
   */
  private detectEnvironment() {
    const userAgent = navigator.userAgent;
    const hostname = window.location.hostname;
    
    return {
      isPiBrowser: userAgent.includes('Pi Browser') || 
                   userAgent.includes('PiNetwork') ||
                   hostname.includes('.pinet.com') ||
                   hostname.includes('.minepi.com'),
      isMainnet: PI_CONFIG.isMainnet() && !PI_CONFIG.isSandbox(),
      piSDKVersion: window.Pi?.version || 'unknown',
      networkMode: PI_CONFIG.getNetworkMode(),
      hostname
    };
  }

  /**
   * Test Pi SDK availability
   */
  private async testPiSDKAvailability(): Promise<void> {
    try {
      const isAvailable = typeof window !== 'undefined' && !!window.Pi;
      
      this.addTestResult({
        testName: 'Pi SDK Availability',
        success: isAvailable,
        message: isAvailable ? 'Pi SDK is available' : 'Pi SDK is not available',
        details: {
          windowPi: !!window.Pi,
          piVersion: window.Pi?.version || 'unknown'
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Pi SDK Availability',
        success: false,
        message: `Error testing Pi SDK: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test mainnet configuration
   */
  private async testMainnetConfiguration(): Promise<void> {
    try {
      const isMainnet = PI_CONFIG.isMainnet();
      const isSandbox = PI_CONFIG.isSandbox();
      const isProduction = PI_CONFIG.isProduction();
      const networkMode = PI_CONFIG.getNetworkMode();
      const apiUrl = PI_CONFIG.getApiUrl();

      const success = isMainnet && !isSandbox && isProduction && networkMode === 'mainnet';

      this.addTestResult({
        testName: 'Mainnet Configuration',
        success,
        message: success ? 'Mainnet configuration is correct' : 'Mainnet configuration has issues',
        details: {
          isMainnet,
          isSandbox,
          isProduction,
          networkMode,
          apiUrl,
          appId: PI_CONFIG.getAppId(),
          validationKey: PI_CONFIG.getValidationKey() ? 'Present' : 'Missing'
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Mainnet Configuration',
        success: false,
        message: `Error testing configuration: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test Pi authentication
   */
  private async testPiAuthentication(): Promise<void> {
    try {
      const isPiSDKAvailable = piAuth.isPiSDKAvailable();
      const isInPiBrowser = piAuth.isInPiBrowser();

      if (!isPiSDKAvailable) {
        this.addTestResult({
          testName: 'Pi Authentication',
          success: false,
          message: 'Pi SDK not available for authentication',
          details: { isPiSDKAvailable, isInPiBrowser }
        });
        return;
      }

      // Test authentication initialization
      const initResult = await piAuth.initialize();
      
      this.addTestResult({
        testName: 'Pi Authentication',
        success: initResult,
        message: initResult ? 'Pi authentication initialized successfully' : 'Pi authentication initialization failed',
        details: {
          isPiSDKAvailable,
          isInPiBrowser,
          initResult
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Pi Authentication',
        success: false,
        message: `Error testing authentication: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test Pi payments
   */
  private async testPiPayments(): Promise<void> {
    try {
      if (!window.Pi) {
        this.addTestResult({
          testName: 'Pi Payments',
          success: false,
          message: 'Pi SDK not available for payments',
          details: { piSDKAvailable: false }
        });
        return;
      }

      // Test payment creation capability (without actually creating a payment)
      const hasCreatePayment = typeof window.Pi.createPayment === 'function';
      const hasAuthenticate = typeof window.Pi.authenticate === 'function';

      const success = hasCreatePayment && hasAuthenticate;

      this.addTestResult({
        testName: 'Pi Payments',
        success,
        message: success ? 'Pi payment methods are available' : 'Pi payment methods are missing',
        details: {
          hasCreatePayment,
          hasAuthenticate,
          piSDKVersion: window.Pi.version
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Pi Payments',
        success: false,
        message: `Error testing payments: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test Pi ad network
   */
  private async testPiAdNetwork(): Promise<void> {
    try {
      if (!window.Pi) {
        this.addTestResult({
          testName: 'Pi Ad Network',
          success: false,
          message: 'Pi SDK not available for ads',
          details: { piSDKAvailable: false }
        });
        return;
      }

      // Test ad network support
      const isAdNetworkSupported = await adService.isAdNetworkSupported();
      const hasAdsAPI = !!window.Pi.Ads;
      const hasShowRewardedAd = typeof window.Pi.Ads?.showAd === 'function';

      const success = isAdNetworkSupported && hasAdsAPI;

      this.addTestResult({
        testName: 'Pi Ad Network',
        success,
        message: success ? 'Pi ad network is supported' : 'Pi ad network is not supported',
        details: {
          isAdNetworkSupported,
          hasAdsAPI,
          hasShowRewardedAd,
          adStatus: adService.getStatus()
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Pi Ad Network',
        success: false,
        message: `Error testing ad network: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test metadata service
   */
  private async testMetadataService(): Promise<void> {
    try {
      const initResult = await piMetadataService.initialize();
      const currentUser = piMetadataService.getCurrentUser();
      const userStats = piMetadataService.getUserStats();

      this.addTestResult({
        testName: 'Metadata Service',
        success: initResult,
        message: initResult ? 'Metadata service initialized successfully' : 'Metadata service initialization failed',
        details: {
          initResult,
          hasCurrentUser: !!currentUser,
          userStats: userStats ? 'Available' : 'Not available'
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Metadata Service',
        success: false,
        message: `Error testing metadata service: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test user data handling
   */
  private async testUserDataHandling(): Promise<void> {
    try {
      // Test localStorage access
      const testKey = 'flappypi-test-key';
      const testValue = 'test-value';
      
      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      const localStorageWorking = retrievedValue === testValue;

      // Test user data export/import
      const userData = piMetadataService.exportUserData();
      const canExportData = userData.length > 0;

      this.addTestResult({
        testName: 'User Data Handling',
        success: localStorageWorking && canExportData,
        message: localStorageWorking && canExportData ? 'User data handling is working' : 'User data handling has issues',
        details: {
          localStorageWorking,
          canExportData,
          dataSize: userData.length
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'User Data Handling',
        success: false,
        message: `Error testing user data handling: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test network connectivity
   */
  private async testNetworkConnectivity(): Promise<void> {
    try {
      const apiUrl = PI_CONFIG.getApiUrl();
      
      // Test API connectivity
      const response = await fetch(apiUrl, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      const networkWorking = true; // If we get here, network is working

      this.addTestResult({
        testName: 'Network Connectivity',
        success: networkWorking,
        message: networkWorking ? 'Network connectivity is working' : 'Network connectivity issues',
        details: {
          apiUrl,
          networkWorking,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown'
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Network Connectivity',
        success: false,
        message: `Error testing network connectivity: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Add test result
   */
  private addTestResult(result: Omit<MainnetTestResult, 'timestamp'>): void {
    this.testResults.push({
      ...result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calculate test summary
   */
  private calculateSummary() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const warnings = this.testResults.filter(r => r.message.includes('warning') || r.message.includes('Warning')).length;

    return { total, passed, failed, warnings };
  }

  /**
   * Get test results as formatted string
   */
  getTestResultsAsString(): string {
    const summary = this.calculateSummary();
    let result = `🧪 Mainnet Integration Test Results\n`;
    result += `=====================================\n`;
    result += `Total Tests: ${summary.total}\n`;
    result += `Passed: ${summary.passed}\n`;
    result += `Failed: ${summary.failed}\n`;
    result += `Warnings: ${summary.warnings}\n\n`;

    this.testResults.forEach(test => {
      const status = test.success ? '✅' : '❌';
      result += `${status} ${test.testName}: ${test.message}\n`;
      if (test.details) {
        result += `   Details: ${JSON.stringify(test.details, null, 2)}\n`;
      }
    });

    return result;
  }
}

// Export singleton instance
export const mainnetIntegrationTest = new MainnetIntegrationTest();
export default mainnetIntegrationTest;
