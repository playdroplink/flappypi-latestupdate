// Pi Payment Approval API Endpoint
// Handles server-side payment approval for Pi Network testnet

import { piPaymentService } from '../../services/piPaymentService';

export async function approvePayment(paymentId: string): Promise<any> {
  try {
    console.log('🔐 Approving payment:', paymentId);
    
    // Call the payment service to approve the payment
    const result = await piPaymentService.approvePayment(paymentId);
    
    console.log('✅ Payment approved successfully:', result);
    return {
      success: true,
      payment: result,
      message: 'Payment approved successfully'
    };
  } catch (error) {
    console.error('❌ Payment approval failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Payment approval failed'
    };
  }
}

// Express.js handler for API routes
export const approvePaymentHandler = async (req: any, res: any) => {
  try {
    const { paymentId } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }
    
    const result = await approvePayment(paymentId);
    
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
    return approvePaymentHandler(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 