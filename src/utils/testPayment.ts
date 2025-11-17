// Pi Network Payment Test Utility
// Based on the comprehensive Pi Network Payment Integration Guide

import { piAuthService } from '../services/piAuthService';
import { piPaymentService } from '../services/piPaymentService';

export const testPaymentIntegration = async () => {
  console.log('🧪 Testing Pi Network Payment Integration...');
  
  try {
    // Test authentication
    console.log('1. Testing authentication...');
    if (!piAuthService.isAuthenticated()) {
      await piAuthService.authenticateUser();
    }
    console.log('✅ Authentication successful');

    // Test scope validation
    console.log('2. Testing scope validation...');
    const hasScope = piAuthService.hasPaymentsScope();
    console.log('✅ Scope validation:', hasScope);

    // Test payment creation
    console.log('3. Testing payment creation...');
    const result = await piPaymentService.createPayment({
      amount: 1, // Test with 1 Pi
      memo: 'Flappy Pi: Test payment for game integration',
      metadata: { test: true, game: 'Flappy Pi' }
    });

    if (result.success) {
      console.log('✅ Payment test successful:', result);
    } else {
      console.error('❌ Payment test failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
};

// Add to your app for testing
if (typeof window !== 'undefined') {
  (window as any).testPiPayment = testPaymentIntegration;
}
