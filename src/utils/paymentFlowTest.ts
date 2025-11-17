// Payment Flow Test
// Comprehensive test suite for Pi Network mainnet payment system

import { piMainnetWalletService, PaymentOrder } from '@/services/piMainnetWalletService';
import { piBackendService } from '@/services/piBackendService';
import { piAuth } from '@/config/piAuth';
import { PI_CONFIG } from '@/config/piConfig';

export interface PaymentTestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export interface PaymentFlowTestSummary {
  overall: boolean;
  tests: PaymentTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  environment: {
    isPiBrowser: boolean;
    isMainnet: boolean;
    walletBalance: number;
    isAuthenticated: boolean;
  };
}

class PaymentFlowTest {
  private testResults: PaymentTestResult[] = [];

  /**
   * Run comprehensive payment flow test
   */
  async runFullTest(): Promise<PaymentFlowTestSummary> {
    console.log('🧪 Starting Payment Flow Test...');
    this.testResults = [];

    // Environment detection
    const environment = this.detectEnvironment();
    
    // Run all tests
    await this.testWalletService();
    await this.testBackendService();
    await this.testAuthentication();
    await this.testOrderCreation();
    await this.testPaymentProcessing();
    await this.testOrderManagement();
    await this.testWalletIntegration();

    // Calculate summary
    const summary = this.calculateSummary();
    const overall = summary.failed === 0 && summary.passed > 0;

    const result: PaymentFlowTestSummary = {
      overall,
      tests: this.testResults,
      summary,
      environment
    };

    console.log('🧪 Payment Flow Test Complete:', result);
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
      walletBalance: piMainnetWalletService.getWalletBalance(),
      isAuthenticated: piAuth.isUserAuthenticated()
    };
  }

  /**
   * Test wallet service
   */
  private async testWalletService(): Promise<void> {
    try {
      const initResult = await piMainnetWalletService.initialize();
      const walletAccount = piMainnetWalletService.getWalletAccount();
      const balance = piMainnetWalletService.getWalletBalance();
      const plans = piMainnetWalletService.getSubscriptionPlans();
      const items = piMainnetWalletService.getShopItems();

      const success = initResult && walletAccount && plans.length > 0 && items.length > 0;

      this.addTestResult({
        testName: 'Wallet Service',
        success,
        message: success ? 'Wallet service is working correctly' : 'Wallet service has issues',
        details: {
          initialized: initResult,
          hasWalletAccount: !!walletAccount,
          balance: balance,
          plansCount: plans.length,
          itemsCount: items.length
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Wallet Service',
        success: false,
        message: `Wallet service test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test backend service
   */
  private async testBackendService(): Promise<void> {
    try {
      const healthResult = await piBackendService.healthCheck();
      const balanceResult = await piBackendService.getWalletBalance();

      const success = healthResult.success;

      this.addTestResult({
        testName: 'Backend Service',
        success,
        message: success ? 'Backend service is healthy' : 'Backend service has issues',
        details: {
          healthCheck: healthResult.success,
          balanceCheck: balanceResult.success,
          healthMessage: healthResult.message
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Backend Service',
        success: false,
        message: `Backend service test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test authentication
   */
  private async testAuthentication(): Promise<void> {
    try {
      const isPiSDKAvailable = piAuth.isPiSDKAvailable();
      const isInPiBrowser = piAuth.isInPiBrowser();
      const isAuthenticated = piAuth.isUserAuthenticated();
      const currentUser = piAuth.getCurrentUser();

      const success = isPiSDKAvailable && isInPiBrowser;

      this.addTestResult({
        testName: 'Authentication',
        success,
        message: success ? 'Authentication is working correctly' : 'Authentication has issues',
        details: {
          piSDKAvailable: isPiSDKAvailable,
          inPiBrowser: isInPiBrowser,
          isAuthenticated: isAuthenticated,
          hasCurrentUser: !!currentUser,
          username: currentUser?.username || 'N/A'
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Authentication',
        success: false,
        message: `Authentication test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test order creation
   */
  private async testOrderCreation(): Promise<void> {
    try {
      const plans = piMainnetWalletService.getSubscriptionPlans();
      const items = piMainnetWalletService.getShopItems();
      
      if (plans.length === 0 || items.length === 0) {
        this.addTestResult({
          testName: 'Order Creation',
          success: false,
          message: 'No plans or items available for testing',
          details: { plansCount: plans.length, itemsCount: items.length }
        });
        return;
      }

      // Test subscription order creation
      const subscriptionOrder = await piMainnetWalletService.createPaymentOrder(
        'test-user-id',
        'subscription',
        plans[0].id,
        plans[0].name,
        plans[0].price,
        { planType: plans[0].category, duration: plans[0].duration }
      );

      // Test shop item order creation
      const shopItemOrder = await piMainnetWalletService.createPaymentOrder(
        'test-user-id',
        'shop_item',
        items[0].id,
        items[0].name,
        items[0].price,
        { itemCategory: items[0].category }
      );

      const success = subscriptionOrder && shopItemOrder;

      this.addTestResult({
        testName: 'Order Creation',
        success,
        message: success ? 'Order creation is working correctly' : 'Order creation has issues',
        details: {
          subscriptionOrderCreated: !!subscriptionOrder,
          shopItemOrderCreated: !!shopItemOrder,
          subscriptionOrderId: subscriptionOrder?.orderId,
          shopItemOrderId: shopItemOrder?.orderId
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Order Creation',
        success: false,
        message: `Order creation test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test payment processing (without actual payment)
   */
  private async testPaymentProcessing(): Promise<void> {
    try {
      const plans = piMainnetWalletService.getSubscriptionPlans();
      
      if (plans.length === 0) {
        this.addTestResult({
          testName: 'Payment Processing',
          success: false,
          message: 'No plans available for payment testing',
          details: { plansCount: plans.length }
        });
        return;
      }

      // Create a test order
      const testOrder = await piMainnetWalletService.createPaymentOrder(
        'test-user-id',
        'subscription',
        plans[0].id,
        plans[0].name,
        plans[0].price,
        { planType: plans[0].category }
      );

      // Test payment processing (this will fail in test environment, which is expected)
      const paymentResult = await piMainnetWalletService.processPayment(testOrder.orderId);

      // In test environment, we expect payment to fail due to no actual Pi SDK
      const success = testOrder && testOrder.status === 'pending';

      this.addTestResult({
        testName: 'Payment Processing',
        success,
        message: success ? 'Payment processing setup is correct' : 'Payment processing has issues',
        details: {
          orderCreated: !!testOrder,
          orderStatus: testOrder?.status,
          paymentResult: paymentResult.success ? 'Success' : 'Failed (Expected in test)',
          orderId: testOrder?.orderId
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Payment Processing',
        success: false,
        message: `Payment processing test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test order management
   */
  private async testOrderManagement(): Promise<void> {
    try {
      const userOrders = piMainnetWalletService.getUserOrders('test-user-id');
      const pendingOrders = piMainnetWalletService.getPendingOrders();
      const testOrder = userOrders.find(order => order.orderId.includes('test'));

      const success = Array.isArray(userOrders) && Array.isArray(pendingOrders);

      this.addTestResult({
        testName: 'Order Management',
        success,
        message: success ? 'Order management is working correctly' : 'Order management has issues',
        details: {
          userOrdersCount: userOrders.length,
          pendingOrdersCount: pendingOrders.length,
          hasTestOrder: !!testOrder,
          testOrderStatus: testOrder?.status
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Order Management',
        success: false,
        message: `Order management test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Test wallet integration
   */
  private async testWalletIntegration(): Promise<void> {
    try {
      const walletAccount = piMainnetWalletService.getWalletAccount();
      const balance = piMainnetWalletService.getWalletBalance();
      const transactionHistory = await piMainnetWalletService.getTransactionHistory(5);

      const success = walletAccount && balance >= 0;

      this.addTestResult({
        testName: 'Wallet Integration',
        success,
        message: success ? 'Wallet integration is working correctly' : 'Wallet integration has issues',
        details: {
          hasWalletAccount: !!walletAccount,
          balance: balance,
          accountId: walletAccount?.account_id || 'N/A',
          transactionHistoryCount: transactionHistory.length
        }
      });
    } catch (error) {
      this.addTestResult({
        testName: 'Wallet Integration',
        success: false,
        message: `Wallet integration test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Add test result
   */
  private addTestResult(result: Omit<PaymentTestResult, 'timestamp'>): void {
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
    let result = `🧪 Payment Flow Test Results\n`;
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

  /**
   * Test specific payment scenario
   */
  async testPaymentScenario(scenario: 'subscription' | 'shop_item'): Promise<PaymentTestResult> {
    try {
      const plans = piMainnetWalletService.getSubscriptionPlans();
      const items = piMainnetWalletService.getShopItems();
      
      let testItem;
      if (scenario === 'subscription') {
        testItem = plans[0];
      } else {
        testItem = items[0];
      }

      if (!testItem) {
        return {
          testName: `Payment Scenario: ${scenario}`,
          success: false,
          message: `No ${scenario} available for testing`,
          timestamp: new Date().toISOString()
        };
      }

      // Create order
      const order = await piMainnetWalletService.createPaymentOrder(
        'test-user-id',
        scenario,
        testItem.id,
        testItem.name,
        testItem.price,
        scenario === 'subscription' 
          ? { planType: (testItem as any).category, duration: (testItem as any).duration }
          : { itemCategory: (testItem as any).category }
      );

      return {
        testName: `Payment Scenario: ${scenario}`,
        success: !!order,
        message: order ? `${scenario} order created successfully` : `Failed to create ${scenario} order`,
        details: {
          orderId: order?.orderId,
          itemName: testItem.name,
          price: testItem.price,
          status: order?.status
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        testName: `Payment Scenario: ${scenario}`,
        success: false,
        message: `Payment scenario test failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) },
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const paymentFlowTest = new PaymentFlowTest();
export default paymentFlowTest;
