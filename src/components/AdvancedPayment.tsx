// Advanced Pi Network Payment Component
// Based on the comprehensive Pi Network Payment Integration Guide

import React, { useState, useEffect } from 'react';
import { piAuthService } from '../services/piAuthService';
import { piPaymentService } from '../services/piPaymentService';
import { errorHandler } from '../utils/errorHandler';

interface PaymentPlan {
  id: string;
  name: string;
  amount: number;
  description: string;
}

export const AdvancedPayment: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans: PaymentPlan[] = [
    { id: 'starter', name: 'Starter Pack', amount: 5, description: 'Ad-free experience for 7 days with basic rewards' },
    { id: 'premium', name: 'Premium Pack', amount: 15, description: 'Ad-free experience for 15 days with premium rewards' },
    { id: 'ultimate', name: 'Ultimate Pack', amount: 30, description: 'Ad-free experience for 30 days with ultimate rewards' }
  ];

  useEffect(() => {
    // Check authentication status
    if (piAuthService.isAuthenticated()) {
      setUser(piAuthService.getCurrentUser());
    }

    // Listen for authentication events
    const handleAuth = () => {
      if (piAuthService.isAuthenticated()) {
        setUser(piAuthService.getCurrentUser());
      }
    };

    window.addEventListener('piUserAuthenticated', handleAuth);
    return () => window.removeEventListener('piUserAuthenticated', handleAuth);
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await piAuthService.authenticateUser();
      setUser(user);
    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      const errorMessage = errorHandler.handleAuthError(error);
      alert('Authentication failed: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (plan: PaymentPlan) => {
    try {
      setIsLoading(true);
      
      const result = await piPaymentService.createPayment({
        amount: plan.amount,
        memo: `Flappy Pi: ${plan.name}`,
        metadata: {
          planId: plan.id,
          planName: plan.name,
          game: 'Flappy Pi',
          timestamp: Date.now()
        }
      });

      if (result.success) {
        console.log('✅ Payment successful:', result);
        alert(`Payment successful for ${plan.name}!`);
      } else {
        console.error('❌ Payment failed:', result.error);
        const errorMessage = errorHandler.handlePaymentError(result.error);
        alert('Payment failed: ' + errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      const errorMessage = errorHandler.handlePaymentError(error);
      alert('Payment error: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="payment-container">
        <h2>Sign in to make payments</h2>
        <button 
          onClick={handleSignIn}
          disabled={isLoading}
          className="sign-in-button"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Pi Network'}
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h2>Welcome, {user.username}!</h2>
      <p>Choose a plan to continue:</p>
      
      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <p className="price">{plan.amount} π</p>
            <button 
              onClick={() => handlePayment(plan)}
              disabled={isLoading}
              className="pay-button"
            >
              {isLoading ? 'Processing...' : 'Pay with Pi'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
