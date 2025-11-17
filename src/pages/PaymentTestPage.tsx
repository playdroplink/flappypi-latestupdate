// Pi Network Payment Test Page
// Based on the comprehensive Pi Network Payment Integration Guide

import React, { useState } from 'react';
import { PaymentButton } from '../components/PaymentButton';
import { AdvancedPayment } from '../components/AdvancedPayment';
import { TestPaymentButton } from '../components/TestPaymentButton';
import PaymentDebug from '../components/PaymentDebug';

export const PaymentTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');

  const handlePaymentSuccess = (result: any) => {
    console.log('✅ Payment successful:', result);
    setTestResult('Payment successful!');
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment error:', error);
    setTestResult('Payment failed: ' + error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            🧪 Pi Network Payment Integration Test
          </h1>
          
          {/* Debug Information */}
          <div className="mb-8">
            <PaymentDebug />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Payment Test */}
            <div className="bg-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Basic Payment Test</h2>
              <p className="text-white/80 mb-4">
                Test a simple 1 Pi payment using the new Flappy Pi payment service.
              </p>
              <PaymentButton
                amount={1}
                memo="Flappy Pi: Test payment for game integration"
                metadata={{ test: true, game: 'Flappy Pi', timestamp: Date.now() }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
              >
                Test 1 π Flappy Pi Payment
              </PaymentButton>
            </div>

            {/* Advanced Payment Test */}
            <div className="bg-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Advanced Payment Test</h2>
              <p className="text-white/80 mb-4">
                Test the Flappy Pi Premium Packs: Starter Pack (5 π), Premium Pack (15 π), and Ultimate Pack (30 π).
              </p>
              <AdvancedPayment />
            </div>

            {/* Integration Test */}
            <div className="bg-white/20 rounded-xl p-6 md:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Integration Test</h2>
              <p className="text-white/80 mb-4">
                Run the complete payment integration test to verify all components.
              </p>
              <div className="flex gap-4">
                <TestPaymentButton />
                <button
                  onClick={() => {
                    if ((window as any).testPiPayment) {
                      (window as any).testPiPayment();
                    } else {
                      setTestResult('Test function not available');
                    }
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Run Full Test
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="bg-white/20 rounded-xl p-6 md:col-span-2">
                <h3 className="text-xl font-bold text-white mb-2">Test Results</h3>
                <div className={`p-4 rounded-lg ${
                  testResult.includes('successful') 
                    ? 'bg-green-500/20 text-green-200' 
                    : 'bg-red-500/20 text-red-200'
                }`}>
                  {testResult}
                </div>
              </div>
            )}

            {/* Debug Information */}
            <div className="bg-white/20 rounded-xl p-6 md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">Debug Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="font-bold text-white mb-2">Pi SDK Status</h4>
                  <p className="text-white/80">
                    {typeof window !== 'undefined' && window.Pi ? '✅ Available' : '❌ Not Available'}
                  </p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="font-bold text-white mb-2">Network Mode</h4>
                  <p className="text-white/80">Mainnet</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="font-bold text-white mb-2">Wallet Address</h4>
                  <p className="text-white/80 text-xs break-all">
                    GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};