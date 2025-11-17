// Pi Network Test Payment Button Component
// Based on the comprehensive Pi Network Payment Integration Guide

import React from 'react';
import { testPaymentIntegration } from '../utils/testPayment';

export const TestPaymentButton: React.FC = () => {
  const handleTest = async () => {
    try {
      const result = await testPaymentIntegration();
      alert('Test result: ' + (result.success ? 'SUCCESS' : 'FAILED'));
    } catch (error: any) {
      alert('Test failed: ' + error.message);
    }
  };

  return (
    <button onClick={handleTest} className="test-button">
      Test Pi Payment Integration
    </button>
  );
};
