// Pi Network Error Handler
// Based on the comprehensive Pi Network Payment Integration Guide

export class PiNetworkError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PiNetworkError';
  }
}

export const errorHandler = {
  // Handle authentication errors
  handleAuthError: (error: any): string => {
    if (error.message.includes('SDK not available')) {
      return 'Pi SDK not available. Please use Pi Browser or refresh the page.';
    } else if (error.message.includes('User cancelled')) {
      return 'Authentication was cancelled. Please try again.';
    } else if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    } else {
      return error.message || 'Authentication failed. Please try again.';
    }
  },

  // Handle payment errors
  handlePaymentError: (error: any): string => {
    if (error.message.includes('payments scope')) {
      return 'Payment scope required. Please sign in again.';
    } else if (error.message.includes('insufficient funds')) {
      return 'Insufficient Pi balance. Please add more Pi to your wallet.';
    } else if (error.message.includes('cancelled')) {
      return 'Payment was cancelled.';
    } else {
      return error.message || 'Payment failed. Please try again.';
    }
  }
};
