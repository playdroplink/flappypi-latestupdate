// Payment Verification Service
// Ensures items/plans are only delivered after successful payment verification

import { FLAPPY_PI_WALLET_ADDRESS } from '@/services/walletAddressVerification';

export interface PaymentVerificationRequest {
  paymentId: string;
  transactionId: string;
  userId: string;
  amount: number;
  itemName: string;
  itemType: 'subscription' | 'shop_item' | 'boost';
}

export interface PaymentVerificationResult {
  success: boolean;
  verified: boolean;
  approved: boolean;
  readyForDelivery: boolean;
  error?: string;
  paymentData?: any;
}

export class PaymentVerificationService {
  private static instance: PaymentVerificationService;
  private readonly FLAPPY_PI_WALLET_ADDRESS = 'GDSXE723WPHZ5RGIJCSYXTPKSOIGPTSXE4RF5U3JTNGTCHXON7ZVD4LJ';

  static getInstance(): PaymentVerificationService {
    if (!PaymentVerificationService.instance) {
      PaymentVerificationService.instance = new PaymentVerificationService();
    }
    return PaymentVerificationService.instance;
  }

  /**
   * Verify payment completion with Flappy Pi API
   */
  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResult> {
    try {
      console.log('🔍 Verifying payment with Flappy Pi:', request);

      // Step 1: Call Flappy Pi completion API
      const response = await fetch('/api/pi/complete-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: request.paymentId,
          transactionId: request.transactionId,
          userId: request.userId,
          amount: request.amount,
          planName: request.itemName
        })
      });

      const result = await response.json();

      if (result.success && result.verified && result.readyForDelivery) {
        console.log('✅ Payment verification successful:', result);
        
        // Step 2: Additional validation checks
        const additionalValidation = await this.performAdditionalValidation(request, result);
        
        if (additionalValidation.success) {
          return {
            success: true,
            verified: true,
            approved: true,
            readyForDelivery: true,
            paymentData: result
          };
        } else {
          return {
            success: false,
            verified: false,
            approved: false,
            readyForDelivery: false,
            error: additionalValidation.error
          };
        }
      } else {
        console.log('❌ Payment verification failed:', result);
        return {
          success: false,
          verified: false,
          approved: false,
          readyForDelivery: false,
          error: result.error || 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return {
        success: false,
        verified: false,
        approved: false,
        readyForDelivery: false,
        error: error instanceof Error ? error.message : 'Verification error'
      };
    }
  }

  /**
   * Perform additional validation checks
   */
  private async performAdditionalValidation(
    request: PaymentVerificationRequest, 
    paymentData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check 1: Verify wallet address matches
      if (paymentData.walletAddress !== this.FLAPPY_PI_WALLET_ADDRESS) {
        return {
          success: false,
          error: 'Invalid wallet address - payment not to Flappy Pi wallet'
        };
      }

      // Check 2: Verify amount matches
      if (paymentData.amount !== request.amount) {
        return {
          success: false,
          error: 'Amount mismatch - payment amount does not match request'
        };
      }

      // Check 3: Verify network is mainnet
      if (paymentData.network !== 'mainnet') {
        return {
          success: false,
          error: 'Invalid network - only mainnet payments accepted'
        };
      }

      // Check 4: Verify payment status
      if (paymentData.status !== 'completed_verified') {
        return {
          success: false,
          error: 'Payment not properly completed and verified'
        };
      }

      // Check 5: Verify timestamp is recent (within last 10 minutes)
      const paymentTime = new Date(paymentData.completedAt);
      const now = new Date();
      const timeDiff = now.getTime() - paymentTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      if (minutesDiff > 10) {
        return {
          success: false,
          error: 'Payment too old - verification timeout'
        };
      }

      console.log('✅ Additional validation checks passed');
      return { success: true };

    } catch (error) {
      console.error('❌ Additional validation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation error'
      };
    }
  }

  /**
   * Check if payment is eligible for item delivery
   */
  async isEligibleForDelivery(request: PaymentVerificationRequest): Promise<boolean> {
    const verification = await this.verifyPayment(request);
    return verification.success && verification.verified && verification.approved && verification.readyForDelivery;
  }

  /**
   * Get Flappy Pi wallet address
   */
  getWalletAddress(): string {
    return this.FLAPPY_PI_WALLET_ADDRESS;
  }

  /**
   * Log payment verification for audit trail
   */
  private logPaymentVerification(request: PaymentVerificationRequest, result: PaymentVerificationResult): void {
    const logData = {
      timestamp: new Date().toISOString(),
      paymentId: request.paymentId,
      transactionId: request.transactionId,
      userId: request.userId,
      amount: request.amount,
      itemName: request.itemName,
      itemType: request.itemType,
      walletAddress: this.FLAPPY_PI_WALLET_ADDRESS,
      verificationResult: result,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      ip: 'unknown' // TODO: Get actual IP if needed
    };

    console.log('📋 Payment Verification Log:', logData);
    
    // TODO: Send to logging service or database for audit trail
  }
}

// Export singleton instance
export const paymentVerificationService = PaymentVerificationService.getInstance();
