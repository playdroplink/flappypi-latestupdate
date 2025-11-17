// Pi Payment Completion API Endpoint
// Handles server-side payment completion for Pi Network testnet

import { piPaymentService } from '../../services/piPaymentService';

export async function completePayment(paymentId: string, txid: string): Promise<any> {
  try {
    console.log('✅ Completing payment:', { paymentId, txid });
    
    // Call the payment service to complete the payment
    const result = await piPaymentService.completePayment(paymentId, txid);
    
    console.log('✅ Payment completed successfully:', result);
    return {
      success: true,
      payment: result,
      message: 'Payment completed successfully'
    };
  } catch (error) {
    console.error('❌ Payment completion failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Payment completion failed'
    };
  }
}

// Express.js handler for API routes
export const completePaymentHandler = async (req: any, res: any) => {
  try {
    const { paymentId, txid } = req.body;
    
    if (!paymentId || !txid) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID and transaction ID are required'
      });
    }
    
    const result = await completePayment(paymentId, txid);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// For Vercel serverless functions
export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    return completePaymentHandler(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 