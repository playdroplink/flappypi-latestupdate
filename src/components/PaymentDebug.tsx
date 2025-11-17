import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PI_CONFIG } from '@/config/piConfig';
import { testPaymentSystem } from '@/utils/paymentTest';
import { directPaymentService } from '@/services/directPaymentService';

interface PaymentTestResult {
  isWorking: boolean;
  issues: string[];
  configuration: any;
}

const PaymentDebug: React.FC = () => {
  const [testResult, setTestResult] = useState<PaymentTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testPaymentResult, setTestPaymentResult] = useState<string | null>(null);

  useEffect(() => {
    runPaymentTest();
  }, []);

  const runPaymentTest = async () => {
    setIsLoading(true);
    try {
      const result = await testPaymentSystem();
      setTestResult(result);
    } catch (error) {
      console.error('Payment test failed:', error);
      setTestResult({
        isWorking: false,
        issues: [`Test failed: ${error}`],
        configuration: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSmallPayment = async () => {
    setIsLoading(true);
    setTestPaymentResult(null);
    
    try {
      console.log('🧪 Testing small payment...');
      
      const testItem = {
        id: 'test-payment',
        name: 'Test Payment',
        description: 'Test payment for debugging',
        piAmount: 0.1, // Very small amount for testing
        type: 'shop_item' as const,
        image: '/flappy-logo.png'
      };

      const result = await directPaymentService.processDirectPayment(testItem);
      
      if (result.success) {
        setTestPaymentResult('✅ Test payment successful!');
        console.log('✅ Test payment completed:', result);
      } else {
        setTestPaymentResult(`❌ Test payment failed: ${result.error}`);
        console.error('❌ Test payment failed:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestPaymentResult(`❌ Test payment error: ${errorMessage}`);
      console.error('❌ Test payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Payment System Debug
            <Badge variant={testResult?.isWorking ? 'default' : 'destructive'}>
              {testResult?.isWorking ? 'Ready' : 'Issues Found'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runPaymentTest} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Run Payment Test'}
            </Button>
            <Button 
              onClick={testSmallPayment} 
              disabled={isLoading || !testResult?.isWorking}
              variant="outline"
            >
              {isLoading ? 'Testing Payment...' : 'Test Small Payment (0.1 PI)'}
            </Button>
          </div>

          {testResult && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Configuration:</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <div>Sandbox Mode: {testResult.configuration.sandboxMode ? '✅ Enabled' : '❌ Disabled'}</div>
                  <div>Network: {testResult.configuration.network}</div>
                  <div>Mainnet Mode: {testResult.configuration.mainnetMode ? '✅ Enabled' : '❌ Disabled'}</div>
                  <div>Production: {testResult.configuration.production ? '✅ Enabled' : '❌ Disabled'}</div>
                  <div>Wallet: {testResult.configuration.walletAddress}</div>
                </div>
              </div>

              {testResult.issues.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Issues Found:</h3>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    {testResult.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {testResult.isWorking && (
                <div className="text-green-600 font-semibold">
                  ✅ Payment system is ready for mainnet payments!
                </div>
              )}
            </div>
          )}

          {testPaymentResult && (
            <div className={`p-3 rounded ${testPaymentResult.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Test Payment Result:</strong> {testPaymentResult}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔧 Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>PI_SANDBOX_MODE:</strong> {PI_CONFIG.PI_SANDBOX_MODE ? 'true' : 'false'}
            </div>
            <div>
              <strong>PI_NETWORK:</strong> {PI_CONFIG.PI_NETWORK}
            </div>
            <div>
              <strong>MAINNET_MODE:</strong> {PI_CONFIG.MAINNET_MODE ? 'true' : 'false'}
            </div>
            <div>
              <strong>NODE_ENV:</strong> {PI_CONFIG.NODE_ENV}
            </div>
            <div>
              <strong>Wallet Address:</strong> {PI_CONFIG.PI_WALLET_ADDRESS}
            </div>
            <div>
              <strong>App ID:</strong> {PI_CONFIG.PI_NETWORK_APP_ID}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentDebug;