// import { supabase } from '@/integrations/supabase/client';
// Removed InputValidation and its related constants as they are for Supabase
// import { InputValidation } from '@/utils/inputValidation';
// Removed import { piConfig } from '@/config/piConfig'; // Removed as development mode bypass is being removed

class SecureAuthService {
  // Removed MAX_LOGIN_ATTEMPTS and LOCKOUT_DURATION as they were related to Supabase rate limiting
  // private readonly MAX_LOGIN_ATTEMPTS = 5;
  // private readonly LOCKOUT_DURATION = 900000; // 15 minutes

  // Secure Pi authentication with enhanced validation
  async authenticateWithPi(): Promise<{ success: boolean; user?: any; error?: string }> {
    if (typeof window.Pi === 'undefined') {
      return { success: false, error: 'Pi Network SDK not available' };
    }

    try {
      const scopes = ['username', 'payments'];

      // Define onIncompletePaymentFound callback as specified by the user
      const onIncompletePaymentFound = (payment: any) => {
        console.log('Incomplete payment found:', payment);
        // IMPORTANT: This callback signifies an incomplete payment.
        // You MUST implement server-side logic here to handle this payment.
        // Recommended steps:
        // 1. Send the payment.identifier to your backend.
        // 2. Your backend should then use the Pi Platform API (GET /payments/{payment_id})
        //    to fetch the full payment details and status.
        // 3. Based on your app's logic and the payment status, decide whether to:
        //    a) Complete the payment: Call POST /payments/{payment_id}/complete from backend.
        //    b) Cancel the payment: Call POST /payments/{payment_id}/cancel (if available and appropriate)
        //    c) Take other action (e.g., mark user for review).
        // Example: If a payment was pending approval but the user closed the app, you might cancel it.
        // For now, we'll just log it.
      };

      const piAuth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      if (!piAuth || !piAuth.accessToken) {
        return { success: false, error: 'Pi authentication failed' };
      }

      // The uid and username are app-local identifiers.
      const user = {
        id: piAuth.uid,
        username: piAuth.username
      };

      // IMPORTANT: In a real application, you MUST send piAuth.accessToken to your backend
      // for verification. Your backend should then use the Pi Platform API (GET /me
      // with Authorization: Bearer <Pioneer's access token>) to verify the Pioneer's
      // identity and obtain a unique, persistent user ID for your application's database.
      // Do NOT rely solely on uid and accessToken received directly from the frontend for critical
      // backend operations or storing user records.
      console.log('Pi Authentication successful:', user);
      console.log('Access Token (send to backend for verification):', piAuth.accessToken);

      return { success: true, user: user };
    } catch (error) {
      console.error('Pi authentication error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Authentication system error' };
    }
  }

  // Secure sign out with session cleanup
  async signOut(): Promise<void> {
    if (typeof window.Pi === 'undefined') {
      console.warn('Pi SDK not available for sign out. Clearing local data only.');
      this.clearSensitiveLocalStorage();
      return;
    }
    try {
      // window.Pi.logout(); // This method does not exist on the official PiSDK type
      // For Pi SDK integrated apps, logging out typically involves
      // invalidating the backend session linked to the Pi access token.
      // For a frontend-only action, clearing local storage is sufficient.
      console.log('Pi logout initiated (local data cleared).');
      this.clearSensitiveLocalStorage();
    } catch (error) {
      console.error('Pi sign out error:', error);
      throw new Error(`Sign out failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Clear sensitive data from local storage
  private clearSensitiveLocalStorage(): void {
    const sensitiveKeys = [
      'flappypi-profile',
      'flappypi-purchase-state',
      'supabase.auth.token' // If Supabase is still used for other auth mechanisms
    ];

    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Log security events (placeholder - implementation depends on backend)
  private async logSecurityEvent(eventType: string, data: any): Promise<void> {
    // IMPORTANT: This should ideally be sent to your backend for secure, persistent logging.
    console.log(`Logging security event (MOCK): Type=${eventType}, Data=`, data);
    return Promise.resolve();
  }

  // Validate user session
  async validateSession(): Promise<boolean> {
    // IMPORTANT: In a real Pi app, robust session validation typically involves:
    // 1. Sending the user's current Pi access token (obtained during authentication) to your backend.
    // 2. Your backend then verifies this access token with the Pi Platform API (GET /me).
    // 3. Your backend also validates its own session with the user.
    // For frontend-only context, this means checking if window.Pi is available.
    // Removed mock log. We rely on the presence of window.Pi for a basic frontend check.
    return Promise.resolve(typeof window.Pi !== 'undefined');
  }

  // Placeholder for createPayment based on user's provided snippet
  async createPiPayment(amount: number, memo: string, metadata: object): Promise<any> {
    if (typeof window.Pi === 'undefined') {
      throw new Error('Pi Network SDK not available to create payment');
    }

    const paymentData = {
      amount,
      memo,
      metadata,
    };

    const paymentCallbacks = {
      onReadyForServerApproval: (paymentId: string) => {
        console.log("onReadyForServerApproval", paymentId);
        // IMPORTANT: This callback means the payment is ready for server approval.
        // You MUST send this paymentId to your backend.
        // Your backend should then call the Pi Platform API:
        // POST https://api.minepi.com/v2/payments/{payment_id}/approve
        // using your Server API Key for Authorization.
        // Example (conceptual, replace with your actual backend call):
        // axios.post(`${YOUR_BACKEND_API_URL}/pi-payments/approve`, { paymentId: paymentId }, YOUR_BACKEND_AUTH_CONFIG);
      },
      onReadyForServerCompletion: (paymentId: string, txid: string) => {
        console.log("onReadyForServerCompletion", paymentId, txid);
        // IMPORTANT: This callback means the blockchain transaction has been submitted.
        // You MUST send this paymentId and txid to your backend.
        // Your backend should:
        // 1. Verify the transaction details.
        // 2. Deliver the purchased item/service to the user.
        // 3. Inform the Pi Network that your app has completed the payment by calling:
        //    POST https://api.minepi.com/v2/payments/{payment_id}/complete
        //    using your Server API Key for Authorization, including the txid in the body.
        // Example (conceptual, replace with your actual backend call):
        // axios.post(`${YOUR_BACKEND_API_URL}/pi-payments/complete`, { paymentId: paymentId, txid: txid }, YOUR_BACKEND_AUTH_CONFIG);
      },
      onCancel: (paymentId: string) => {
        console.log("Payment cancelled", paymentId);
        // Handle cancelled payment (e.g., update UI, re-enable purchase button)
        // You might also want to inform your backend about the cancellation.
      },
      onError: (error: any, payment: any) => {
        console.error("Payment error", error, payment);
        // Handle payment errors. Display a user-friendly message.
        // Consider logging this error to your backend for analysis.
      },
    };

    try {
      return await new Promise((resolve, reject) => {
        try {
          window.Pi.createPayment(paymentData, {
            ...paymentCallbacks,
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
              console.log("Payment completed:", paymentId, txid);
              resolve({ identifier: paymentId, transaction: { txid } });
            },
            onCancel: (paymentId: string) => {
              console.log('Payment cancelled', paymentId);
              resolve(null);
            },
            onError: (error: any, payment: any) => {
              console.error('Payment error', error, payment);
              reject(new Error(error?.message || 'Payment error'));
            }
          });
        } catch (err) {
          reject(new Error(`Failed to create Pi payment: ${err instanceof Error ? err.message : String(err)}`));
        }
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error(`Failed to create Pi payment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const secureAuthService = new SecureAuthService();

// Removed global onerror handler as it's not standard practice and can interfere with React's error handling
// window.onerror = function (message, source, lineno, colno, error) {
//   alert('JS Error: ' + message + ' at ' + source + ':' + lineno);
// };
