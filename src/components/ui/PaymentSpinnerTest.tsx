import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImprovedPaymentSpinner, EnhancedPaymentLoadingOverlay, PaymentButtonWithSpinner } from './ImprovedPaymentSpinner';

const PaymentSpinnerTest: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const testOverlay = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  const testButtonLoading = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Payment Spinner Test</h2>
      
      {/* Spinner Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Spinner Variants</CardTitle>
          <CardDescription>Test different spinner variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="default" size="md" />
              <p className="text-sm">Default</p>
            </div>
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="payment" size="md" />
              <p className="text-sm">Payment</p>
            </div>
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="processing" size="md" />
              <p className="text-sm">Processing</p>
            </div>
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="success" size="md" />
              <p className="text-sm">Success</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spinner Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Spinner Sizes</CardTitle>
          <CardDescription>Test different spinner sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="payment" size="sm" />
              <p className="text-sm">Small</p>
            </div>
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="payment" size="md" />
              <p className="text-sm">Medium</p>
            </div>
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="payment" size="lg" />
              <p className="text-sm">Large</p>
            </div>
            <div className="text-center space-y-2">
              <ImprovedPaymentSpinner variant="payment" size="xl" />
              <p className="text-sm">Extra Large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Test Components</CardTitle>
          <CardDescription>Test the payment components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={testOverlay} variant="outline">
              Test Loading Overlay
            </Button>
            <PaymentButtonWithSpinner
              isLoading={isButtonLoading}
              loadingText="Processing..."
              onClick={testButtonLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Test Button Spinner
            </PaymentButtonWithSpinner>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Loading Overlay */}
      {showOverlay && (
        <EnhancedPaymentLoadingOverlay 
          message="Testing Payment Processing..."
          showProgress={true}
          progress={85}
          steps={[
            "Validating payment details...",
            "Processing with Pi Network...",
            "Updating your account..."
          ]}
        />
      )}
    </div>
  );
};

export default PaymentSpinnerTest;
