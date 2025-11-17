import { PI_CONFIG } from '../config/piConfig';
import { walletAddressVerification } from './walletAddressVerification';

declare global {
  interface Window {
    Pi: any;
  }
}

/**
 * Official Pi Network Authentication
 * Follows the exact pattern from Pi Network documentation
 */
export async function piAuthenticate(scopes: string[] = ['payments', 'username']) {
  try {
    console.log('🔐 Starting Pi authentication with scopes:', scopes);
    
    if (!window.Pi) {
      throw new Error('Pi SDK not available. Please use Pi Browser.');
    }

    // Handle incomplete payments callback (required by Pi SDK)
    function onIncompletePaymentFound(payment: any) {
      console.log('💰 Found incomplete payment:', payment);
      
      // Send to backend for processing
      fetch('/api/pi/incomplete-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payment,
          network: PI_CONFIG.getNetworkMode()
        })
      }).catch(error => {
        console.error('❌ Failed to send incomplete payment to backend:', error);
      });
    }

    // Call Pi.authenticate exactly as per official documentation
    const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    
    console.log('✅ Pi authentication successful:', auth);
    return auth;
  } catch (error: any) {
    console.error('❌ Pi authentication failed:', error);
    throw new Error(error.message || 'Authentication failed');
  }
}

/**
 * Official Pi Network Payment Creation
 * Follows the exact pattern from Pi Network documentation
 * CRITICAL: Must implement all 3 phases of Pi payment flow
 */
export async function createPiPayment(paymentData: {
  amount: number;
  memo: string;
  metadata?: any;
}) {
  return new Promise<{ paymentId: string; txid: string; result: any }>(async (resolve, reject) => {
    if (!window.Pi) {
      reject(new Error('Pi SDK not available. Please use Pi Browser.'));
      return;
    }

    console.log('💰 Creating Pi payment:', paymentData);
    
    try {
      // MAINNET ONLY - Verify wallet configuration before creating payment
      const walletVerification = await walletAddressVerification.verifyWalletConfiguration();
      if (!walletVerification.success) {
        reject(new Error(`MAINNET WALLET VERIFICATION FAILED: ${walletVerification.error}`));
        return;
      }
      
      // ENFORCE MAINNET ONLY
      if (!PI_CONFIG.isMainnet() || PI_CONFIG.isSandbox() || PI_CONFIG.isTestnet()) {
        reject(new Error('MAINNET PAYMENTS ONLY - Sandbox and testnet modes are disabled'));
        return;
      }
      
      // Log payment attempt with Flappy Pi wallet
      walletAddressVerification.logPaymentAttempt(paymentData.amount, paymentData.memo, paymentData.metadata);

      // Payment callbacks exactly as per official documentation
      // CRITICAL: Both callbacks MUST be implemented for complete payment flow
      const paymentCallbacks = {
        // PHASE 1: Server Approval (before blockchain confirmation)
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            console.log('📍 PHASE 1: Payment ready for server approval:', paymentId);
            
            // CRITICAL: Call backend approval endpoint
            const response = await fetch('/api/pi/approve-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                paymentId,
                paymentData: {
                  amount: paymentData.amount,
                  memo: paymentData.memo,
                  metadata: paymentData.metadata
                },
                network: 'mainnet',
                mainnetOnly: true,
                productionMode: true
              })
            });
            
            console.log(`📌 Backend approval response status: ${response.status}`);
            
            // CRITICAL: Check response status
            if (response.status === 200) {
              const approvalResult = await response.json();
              console.log('✅ PHASE 1 COMPLETE - Payment approved by backend:', approvalResult);
              
              // CRITICAL: Return true to proceed to Phase 2
              return true;
            } else {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              console.error('❌ PHASE 1 FAILED - Backend approval error:', errorData);
              console.error(`Status: ${response.status}, Error: ${errorData.error}`);
              
              // Return false to reject payment
              return false;
            }
          } catch (error) {
            console.error('❌ PHASE 1 ERROR - Exception during approval:', error);
            return false;
          }
        },

        // PHASE 2 (Automatic) - User signs blockchain transaction in Pi Wallet
        // No callback needed - handled automatically by Pi Network

        // PHASE 3: Server Completion (after blockchain confirmation)
        // CRITICAL: This is where items are actually delivered
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            console.log('📍 PHASE 3: Payment ready for server completion:', { paymentId, txid });
            
            // CRITICAL: Send to backend for completion with transaction ID
            const response = await fetch('/api/pi/complete-payment', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                paymentId, 
                txid, // CRITICAL: Must include blockchain transaction ID
                paymentData: {
                  amount: paymentData.amount,
                  memo: paymentData.memo,
                  metadata: paymentData.metadata
                },
                network: 'mainnet',
                mainnetOnly: true,
                productionMode: true
              })
            });
            
            // CRITICAL: Validate response status before confirming completion
            console.log(`📌 Backend completion response status: ${response.status}`);
            
            if (response.status === 200) {
              const completionResult = await response.json();
              console.log('✅ PHASE 3 COMPLETE - Payment completed by backend:', completionResult);
              
              // CRITICAL: Payment is now confirmed - resolve with success
              resolve({ 
                paymentId, 
                txid, 
                result: completionResult 
              });
              
              return true; // Confirm completion to Pi SDK
            } else {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              console.error('❌ PHASE 3 FAILED - Backend returned error status:', response.status);
              console.error('❌ PHASE 3 ERROR - Payment completion failed:', errorData);
              
              // CRITICAL: Do NOT deliver items on failure
              reject(new Error(`Payment completion failed with status ${response.status}: ${errorData.error}`));
              return false;
            }
          } catch (error) {
            console.error('❌ PHASE 3 ERROR - Payment completion exception:', error);
            reject(error);
            return false;
          }
        },

        onCancel: (paymentId: string) => {
          console.log('❌ Payment cancelled by user:', paymentId);
          reject(new Error('Payment cancelled by user'));
        },

        onError: (error: Error, payment?: any) => {
          console.error('❌ Payment error:', error, payment);
          reject(error);
        }
      };

      // Create payment exactly as per official documentation
      window.Pi.createPayment(paymentData, paymentCallbacks)
        .then((payment: any) => {
          console.log('✅ Payment creation initiated:', payment);
        })
        .catch((error: any) => {
          console.error('❌ Payment creation failed:', error);
          reject(error);
        });
    } catch (error: any) {
      console.error('❌ Payment creation error:', error);
      reject(error);
    }
  });
}

/**
 * Unified Pi payment handler following official documentation
 */
export async function payWithPi({ amount, memo, metadata = {} }: {
  amount: number;
  memo: string;
  metadata?: any;
}) {
  try {
    if (!window.Pi) {
      throw new Error('Pi SDK not available. Please use Pi Browser.');
    }

    console.log('💰 Processing Pi payment:', { amount, memo, metadata });
    console.log('🌐 MAINNET PAYMENT MODE: ENABLED');
    console.log('🔧 SANDBOX MODE: DISABLED');
    console.log('🚀 PRODUCTION MODE: ENABLED');
    console.log('💎 REAL PI TRANSACTIONS: ENABLED');
    console.log('🔒 MAINNET ONLY: ENABLED');
    
    // Verify wallet configuration
    const walletVerification = await walletAddressVerification.verifyWalletConfiguration();
    if (!walletVerification.success) {
      throw new Error(`Wallet verification failed: ${walletVerification.error}`);
    }
    
    // Ensure memo includes Flappy Pi branding
    const verifiedMemo = walletAddressVerification.verifyPaymentMemo(memo) 
      ? memo 
      : walletAddressVerification.createPaymentMemo(memo.replace('Flappy Pi:', '').trim());
    
    // Log payment with Flappy Pi wallet
    walletAddressVerification.logPaymentAttempt(amount, verifiedMemo, metadata);

    // Get the Flappy Pi wallet address
    const flappyPiWalletAddress = walletAddressVerification.getFlappyPiWalletAddress();
    
    // Create payment data exactly as per official documentation
    const paymentData = {
      amount: amount,
      memo: verifiedMemo,
      recipientAddress: flappyPiWalletAddress,
      metadata: {
        ...metadata,
        walletAddress: flappyPiWalletAddress,
        network: 'mainnet',
        paymentType: 'flappy_pi_pay',
        mainnetOnly: true
      }
    };

    // Create payment using official flow
    const result = await createPiPayment(paymentData);

    console.log('✅ Pi payment completed:', result);

    return {
      status: 'completed' as const,
      paymentId: result.paymentId,
      txid: result.txid,
      deliveredItems: metadata.deliveredItems || []
    };

  } catch (err: any) {
    console.error('❌ Pi payment failed:', err);
    
    if (err.message?.toLowerCase().includes('cancelled')) {
      return { status: 'cancelled' as const, error: err.message };
    }
    
    if (err.message?.toLowerCase().includes('insufficient')) {
      return { status: 'insufficient' as const, error: err.message };
    }
    
    return { status: 'error' as const, error: err.message || 'Payment failed' };
  }
}

/**
 * Show rewarded ad using Pi SDK
 */
export async function showRewardedAd() {
  if (window.Pi && typeof window.Pi.showRewardedAd === 'function') {
    try {
      const result = await window.Pi.showRewardedAd();
      console.log('✅ Rewarded ad shown:', result);
      
      // Send to backend for verification
      const response = await fetch('/api/pi/reward-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adResult: result,
          network: PI_CONFIG.getNetworkMode()
        })
      });
      
      if (response.ok) {
        const rewardData = await response.json();
        console.log('✅ Ad reward granted:', rewardData);
        return rewardData;
      }
    } catch (error) {
      console.error('❌ Rewarded ad failed:', error);
    }
  } else {
    console.warn('Pi.showRewardedAd is not available in this environment.');
  }
}

/**
 * Open share dialog using Pi SDK
 */
export function openShareDialog() {
  if (window.Pi && typeof window.Pi.openShareDialog === 'function') {
    window.Pi.openShareDialog("Invite!", "Join me on this Pi app!");
  } else {
    console.warn('Pi.openShareDialog is not available in this environment.');
  }
} 