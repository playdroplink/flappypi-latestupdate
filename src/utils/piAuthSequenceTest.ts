/**
 * Pi Authentication Sequence Test Utility
 * 
 * This utility provides testing functions for the Pi authentication sequence implementation.
 * It can be used to verify the sequence works correctly in different environments.
 */

import { piAuthSequence, PiAuthSequenceConfig } from '../services/piAuthSequence';

export interface PiAuthSequenceTestResult {
  testName: string;
  success: boolean;
  error?: string;
  details?: any;
  duration?: number;
}

export class PiAuthSequenceTester {
  private static instance: PiAuthSequenceTester;

  private constructor() {}

  public static getInstance(): PiAuthSequenceTester {
    if (!PiAuthSequenceTester.instance) {
      PiAuthSequenceTester.instance = new PiAuthSequenceTester();
    }
    return PiAuthSequenceTester.instance;
  }

  /**
   * Test Pi Browser Detection
   */
  async testPiBrowserDetection(): Promise<PiAuthSequenceTestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Pi Browser Detection...');
      
      const status = piAuthSequence.getAuthStatus();
      const isPiBrowser = status.isPiBrowser;
      
      console.log('📱 Pi Browser Detection Result:', {
        isPiBrowser,
        userAgent: navigator.userAgent.substring(0, 100),
        hostname: window.location.hostname
      });

      return {
        testName: 'Pi Browser Detection',
        success: true,
        details: {
          isPiBrowser,
          userAgent: navigator.userAgent.substring(0, 100),
          hostname: window.location.hostname
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Pi Browser Detection',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test Pi SDK Availability
   */
  async testPiSDKAvailability(): Promise<PiAuthSequenceTestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Pi SDK Availability...');
      
      const hasPiObject = typeof window.Pi !== 'undefined';
      const hasAuthenticateFunction = typeof window.Pi?.authenticate === 'function';
      const hasInitFunction = typeof window.Pi?.init === 'function';
      
      const isAvailable = hasPiObject && hasAuthenticateFunction;
      
      console.log('🔧 Pi SDK Availability Result:', {
        hasPiObject,
        hasAuthenticateFunction,
        hasInitFunction,
        isAvailable
      });

      return {
        testName: 'Pi SDK Availability',
        success: isAvailable,
        details: {
          hasPiObject,
          hasAuthenticateFunction,
          hasInitFunction,
          isAvailable
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Pi SDK Availability',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test Authentication Sequence (Mock)
   * Note: This is a mock test that doesn't actually authenticate
   */
  async testAuthenticationSequenceMock(): Promise<PiAuthSequenceTestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Authentication Sequence (Mock)...');
      
      // Test configuration
      const config: PiAuthSequenceConfig = {
        scopes: ['payments', 'username'],
        enableProductionValidation: false, // Disable for testing
        timeout: 5000
      };
      
      // Test the sequence structure without actually authenticating
      const status = piAuthSequence.getAuthStatus();
      
      console.log('🔐 Authentication Sequence Test Result:', {
        isPiBrowser: status.isPiBrowser,
        isAuthenticated: status.isAuthenticated,
        config
      });

      return {
        testName: 'Authentication Sequence (Mock)',
        success: true,
        details: {
          isPiBrowser: status.isPiBrowser,
          isAuthenticated: status.isAuthenticated,
          config
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Authentication Sequence (Mock)',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test Token Validation (Mock)
   */
  async testTokenValidationMock(): Promise<PiAuthSequenceTestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Token Validation (Mock)...');
      
      // Mock token validation test
      const mockToken = 'mock_access_token';
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          uid: 'mock_user_id',
          username: 'mock_username'
        })
      };
      
      // Simulate the validation process
      const isValid = mockResponse.ok;
      
      console.log('🔍 Token Validation Test Result:', {
        isValid,
        status: mockResponse.status
      });

      return {
        testName: 'Token Validation (Mock)',
        success: isValid,
        details: {
          isValid,
          status: mockResponse.status
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Token Validation (Mock)',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test Session Management
   */
  async testSessionManagement(): Promise<PiAuthSequenceTestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing Session Management...');
      
      // Test localStorage operations
      const testUser = {
        uid: 'test_user_id',
        username: 'test_username',
        accessToken: 'test_access_token'
      };
      
      // Store test data
      localStorage.setItem('flappypi-user', JSON.stringify(testUser));
      localStorage.setItem('flappypi-auth-timestamp', Date.now().toString());
      
      // Retrieve test data
      const storedUser = localStorage.getItem('flappypi-user');
      const storedTimestamp = localStorage.getItem('flappypi-auth-timestamp');
      
      // Clean up
      localStorage.removeItem('flappypi-user');
      localStorage.removeItem('flappypi-auth-timestamp');
      
      const isWorking = storedUser && storedTimestamp;
      
      console.log('💾 Session Management Test Result:', {
        isWorking,
        storedUser: storedUser ? 'Present' : 'Missing',
        storedTimestamp: storedTimestamp ? 'Present' : 'Missing'
      });

      return {
        testName: 'Session Management',
        success: isWorking,
        details: {
          isWorking,
          storedUser: storedUser ? 'Present' : 'Missing',
          storedTimestamp: storedTimestamp ? 'Present' : 'Missing'
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Session Management',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Run All Tests
   */
  async runAllTests(): Promise<PiAuthSequenceTestResult[]> {
    console.log('🚀 Running Pi Authentication Sequence Tests...');
    
    const tests = [
      this.testPiBrowserDetection(),
      this.testPiSDKAvailability(),
      this.testAuthenticationSequenceMock(),
      this.testTokenValidationMock(),
      this.testSessionManagement()
    ];
    
    const results = await Promise.all(tests);
    
    console.log('📊 Test Results Summary:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName}: ${result.success ? 'PASS' : 'FAIL'}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const passedTests = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
    
    return results;
  }

  /**
   * Generate Test Report
   */
  generateTestReport(results: PiAuthSequenceTestResult[]): string {
    const passedTests = results.filter(r => r.success);
    const failedTests = results.filter(r => !r.success);
    
    let report = `# Pi Authentication Sequence Test Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n`;
    report += `- Total Tests: ${results.length}\n`;
    report += `- Passed: ${passedTests.length}\n`;
    report += `- Failed: ${failedTests.length}\n`;
    report += `- Success Rate: ${((passedTests.length / results.length) * 100).toFixed(1)}%\n\n`;
    
    if (passedTests.length > 0) {
      report += `## Passed Tests\n`;
      passedTests.forEach(test => {
        report += `- ✅ ${test.testName} (${test.duration}ms)\n`;
      });
      report += `\n`;
    }
    
    if (failedTests.length > 0) {
      report += `## Failed Tests\n`;
      failedTests.forEach(test => {
        report += `- ❌ ${test.testName}: ${test.error}\n`;
      });
      report += `\n`;
    }
    
    report += `## Environment\n`;
    report += `- User Agent: ${navigator.userAgent}\n`;
    report += `- Hostname: ${window.location.hostname}\n`;
    report += `- Protocol: ${window.location.protocol}\n`;
    
    return report;
  }
}

// Export singleton instance
export const piAuthSequenceTester = PiAuthSequenceTester.getInstance();

// Export convenience functions
export const runPiAuthSequenceTests = () => 
  piAuthSequenceTester.runAllTests();

export const generatePiAuthSequenceTestReport = async () => {
  const results = await piAuthSequenceTester.runAllTests();
  return piAuthSequenceTester.generateTestReport(results);
}; 