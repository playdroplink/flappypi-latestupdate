// Pi Network Payment Cancellation API
// This endpoint cancels a payment if possible

const PI_API_KEY = process.env.PI_API_KEY || "3ob4pkvuquyzykzsc5uugneonftxigw1hdf70fnm7ifpr2kozehpiovpylujhzfc";
const PI_API_BASE = 'https://api.minepi.com/v2';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment ID is required' 
      });
    }

    console.log('❌ Cancelling payment:', paymentId);

    // First, check payment status
    const statusResponse = await fetch(`${PI_API_BASE}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statusResponse.ok) {
      console.error('❌ Failed to get payment status:', statusResponse.status);
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to get payment status' 
      });
    }

    const paymentData = await statusResponse.json();
    const payment = paymentData.payment;

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Check if payment can be cancelled
    if (payment.developer_approved || payment.developer_completed) {
      return res.status(400).json({
        success: false,
        error: 'Payment cannot be cancelled - already approved or completed'
      });
    }

    // Note: Pi Network doesn't have a direct cancel API
    // The payment will be cancelled automatically if not approved within timeout
    console.log('⚠️ Payment cancellation requested - will timeout automatically if not approved');
    
    return res.status(200).json({
      success: true,
      message: 'Payment cancellation requested - will timeout if not approved',
      paymentId
    });

  } catch (error: any) {
    console.error('❌ Payment cancellation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during payment cancellation' 
    });
  }
}
