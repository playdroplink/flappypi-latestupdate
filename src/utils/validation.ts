// Input validation utilities
export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 100 && Number.isFinite(amount);
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim()
    .slice(0, 1000); // Limit length
};

// Validate game score to prevent cheating
export const validateScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 999999;
};

// Safe error messages that don't expose sensitive information
export const errorMessages = {
  INVALID_PAYMENT: 'Invalid payment amount',
  INVALID_SCORE: 'Invalid score submitted',
  NETWORK_ERROR: 'Unable to connect. Please try again.',
  PAYMENT_FAILED: 'Payment could not be processed',
  SERVER_ERROR: 'Service temporarily unavailable',
} as const; 